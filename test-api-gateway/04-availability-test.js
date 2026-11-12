// E2 - Availability read path (60 % of the Flash Sale traffic in the platform plan).
// setup creates and publishes one event so the counters exist; the measured loop is read-only.
// Run: scripts\run-scenario.ps1 -Scenario 04

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';
import { BASE_URL, THINK_TIME, pick } from './lib/config.js';
import { organizerToken, createPublishedEvent } from './lib/api.js';
import { makeSummaryHandler } from './lib/summary.js';

const CAPACITY = Number(__ENV.CAPACITY || 1000);
const rateLimited = new Counter('availability_rate_limited');

export const options = {
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
  stages: [
    { duration: '20s', target: 4 },
    { duration: '60s', target: 8 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    // Gateway rate limit for inventory is 10 req/s; 8 VUs stay below it on purpose.
    'http_req_duration{endpoint:disponibilidad}': [pick('p(95)<150', 'p(95)<30')],
    http_req_failed: ['rate<0.01'],
  },
};

export function setup() {
  const token = organizerToken('k6_availability');
  const event = createPublishedEvent(token, { title: `Availability ${Date.now()}`, capacity: CAPACITY });
  console.log(`setup: eventId=${event.eventId} localityId=${event.localityId}`);
  return event;
}

export default function (data) {
  const res = http.get(`${BASE_URL}/api/inventario/eventos/${data.eventId}/disponibilidad`, {
    tags: { endpoint: 'disponibilidad' },
    responseCallback: http.expectedStatuses(200, 429),
  });

  if (res.status === 429) {
    rateLimited.add(1);
    return;
  }

  let body = null;
  try {
    body = res.json();
  } catch (e) {
    body = null;
  }

  check(res, {
    'disponibilidad responde 200': (r) => r.status === 200,
    'incluye localidades': () => body !== null && Array.isArray(body.localities) && body.localities.length > 0,
    'reporta cupos': () =>
      body !== null && Array.isArray(body.localities) && body.localities[0].availableTickets !== undefined,
  });

  sleep(THINK_TIME);
}

export const handleSummary = makeSummaryHandler('04-availability');
