// E4 - Controlled degradation: push the gateway past the inventory rate limit (10 req/s)
// and verify it degrades with 429 instead of 5xx, and that the service recovers afterwards.
//
// What this measures is the gateway RequestRateLimiter, not a circuit breaker: inventory
// retired Resilience4j (DA-002).
//
// Run: scripts\run-scenario.ps1 -Scenario 08

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';
import { THINK_TIME, randomInt, pick } from './lib/config.js';
import { organizerToken, buyerTokens, createPublishedEvent, createReservation } from './lib/api.js';
import { makeSummaryHandler } from './lib/summary.js';

// Large stock on purpose: the bottleneck must be the rate limiter, not exhausted tickets.
const CAPACITY = Number(__ENV.CAPACITY || 100000);
const BUYERS = Number(__ENV.BUYERS || 5);

const accepted = new Counter('reservas_aceptadas');
const noStock = new Counter('reservas_sin_stock');
const rateLimited = new Counter('rate_limited');
const rateLimitWithoutProblemDetail = new Counter('rate_limit_without_problem_detail');
const serverErrors = new Counter('http_5xx');

export const options = {
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
  stages: [
    { duration: '5s', target: 40 },
    { duration: '50s', target: 40 },
    { duration: '5s', target: 0 },
  ],
  thresholds: {
    http_5xx: ['count==0'],
    // The limiter must actually engage, otherwise the run proves nothing.
    rate_limited: ['count>0'],
    'http_req_duration{endpoint:reservas}': [pick('p(95)<600', 'p(95)<400')],
    checks: ['rate>0.99'],
    http_req_failed: ['rate<0.01'],
  },
};

export function setup() {
  const organizer = organizerToken('k6_degradation');
  const event = createPublishedEvent(organizer, {
    title: `Degradation ${Date.now()}`,
    capacity: CAPACITY,
  });
  console.log(`setup: eventId=${event.eventId} localityId=${event.localityId} capacity=${CAPACITY}`);
  return {
    eventId: event.eventId,
    localityId: event.localityId,
    buyers: buyerTokens(BUYERS, 'k6_degradation'),
  };
}

function looksLikeProblemDetail(res) {
  try {
    const body = res.json();
    return body !== null && (body.status !== undefined || body.title !== undefined);
  } catch (e) {
    return false;
  }
}

export default function (data) {
  const buyer = data.buyers[randomInt(data.buyers.length)];
  const res = createReservation(
    buyer,
    data.eventId,
    data.localityId,
    1,
    `k6-degrade-${__VU}-${__ITER}-${Date.now()}`,
    { responseCallback: http.expectedStatuses(200, 201, 409, 429) }
  );

  if (res.status === 429) {
    rateLimited.add(1);
    if (!looksLikeProblemDetail(res)) {
      rateLimitWithoutProblemDetail.add(1);
    }
  } else if (res.status === 201 || res.status === 200) {
    accepted.add(1);
  } else if (res.status === 409) {
    noStock.add(1);
  }

  if (res.status >= 500) serverErrors.add(1);

  check(res, {
    'sin error de servidor': (r) => r.status < 500,
    'respuesta esperada (200/201/409/429)': (r) =>
      r.status === 200 || r.status === 201 || r.status === 409 || r.status === 429,
  });

  sleep(THINK_TIME);
}

export const handleSummary = makeSummaryHandler('08-degradation');
