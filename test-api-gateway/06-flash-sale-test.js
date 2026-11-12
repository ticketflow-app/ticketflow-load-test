// E3 - Flash Sale functional test: scarcity + mixed traffic + anti-oversell guard.
//
// The platform plan asks for 2 000 VUs over 1 000 tickets. The invariant does not depend on
// magnitude but on scarcity and concurrency, so this scenario keeps the 60/30/10 mix and the
// behaviour, with a stock small enough to be exhausted during the run.
//
// Expected on success (the run must generate more attempts than stock):
//   reservas_aceptadas == STOCK (100 by default) -- never more, never fewer
//   reservas_sin_stock  == attempts - STOCK - rate_limited
//   http_5xx            == 0
// Confirm the exact numbers against PostgreSQL/Redis with scripts\verify-invariants.ps1.
//
// Run: scripts\run-scenario.ps1 -Scenario 06

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';
import { THINK_TIME, randomInt, pick } from './lib/config.js';
import {
  organizerToken,
  buyerTokens,
  createPublishedEvent,
  availability,
  createReservation,
  confirmReservation,
} from './lib/api.js';
import { makeSummaryHandler } from './lib/summary.js';

const STOCK = Number(__ENV.STOCK || 100);
const BUYERS = Number(__ENV.BUYERS || 10);
const MIX_READ = Number(__ENV.MIX_READ || 0.6);
const MIX_RESERVE = Number(__ENV.MIX_RESERVE || 0.3);

const accepted = new Counter('reservas_aceptadas');
const noStock = new Counter('reservas_sin_stock');
const rateLimited = new Counter('rate_limited');
const confirmsOk = new Counter('confirmaciones_ok');
const serverErrors = new Counter('http_5xx');

// Per-VU queue of reservations waiting to be confirmed: { id, token }.
const pending = [];

export const options = {
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
  stages: [
    { duration: '10s', target: 15 },
    { duration: '100s', target: 15 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_5xx: ['count==0'],
    // Hard anti-oversell guard: accepted reservations can never exceed the stock.
    reservas_aceptadas: ['count>0', `count<=${STOCK}`],
    'http_req_duration{endpoint:disponibilidad}': [pick('p(95)<150', 'p(95)<30')],
    'http_req_duration{endpoint:reservas}': [pick('p(95)<400', 'p(95)<250')],
    'http_req_duration{endpoint:confirmar}': [pick('p(95)<400', 'p(95)<250')],
    checks: ['rate>0.99'],
    http_req_failed: ['rate<0.01'],
  },
};

export function setup() {
  const organizer = organizerToken('k6_flashsale');
  const event = createPublishedEvent(organizer, {
    title: `Flash Sale ${Date.now()}`,
    capacity: STOCK,
  });
  console.log(`setup: eventId=${event.eventId} localityId=${event.localityId} stock=${STOCK}`);
  return {
    eventId: event.eventId,
    localityId: event.localityId,
    stock: STOCK,
    buyers: buyerTokens(BUYERS, 'k6_flashsale'),
  };
}

function readAvailability(eventId) {
  // 429 = gateway rate limiter (10 req/s for inventory). Expected in this scenario, like in
  // the reserve/confirm calls: the point of E3 is oversell safety, not throttling behaviour.
  const res = availability(eventId, {
    responseCallback: http.expectedStatuses(200, 429),
  });
  if (res.status === 429) {
    rateLimited.add(1);
    return;
  }
  if (res.status >= 500) serverErrors.add(1);
  check(res, { 'lectura sin error de servidor': (r) => r.status < 500 });
}

function reserve(data) {
  const buyer = data.buyers[randomInt(data.buyers.length)];
  const key = `k6-fs-${__VU}-${__ITER}-${Date.now()}`;
  const res = createReservation(buyer, data.eventId, data.localityId, 1, key, {
    responseCallback: http.expectedStatuses(200, 201, 409, 429),
  });

  if (res.status === 429) {
    rateLimited.add(1);
    return;
  }
  if (res.status >= 500) {
    serverErrors.add(1);
  }

  if (res.status === 201 || res.status === 200) {
    accepted.add(1);
    let body = null;
    try {
      body = res.json();
    } catch (e) {
      body = null;
    }
    if (body && body.id !== undefined && pending.length < 25) {
      pending.push({ id: body.id, token: buyer });
    }
  } else if (res.status === 409) {
    noStock.add(1);
  }

  check(res, { 'reserva sin error de servidor': (r) => r.status < 500 });
}

function confirmOne(data) {
  if (pending.length === 0) {
    readAvailability(data.eventId);
    return;
  }
  const item = pending.pop();
  const res = confirmReservation(item.token, item.id, `k6-conf-${item.id}-${__ITER}`, {
    responseCallback: http.expectedStatuses(200, 201, 409, 410, 429),
  });

  if (res.status === 200 || res.status === 201) {
    confirmsOk.add(1);
  } else if (res.status === 429) {
    rateLimited.add(1);
  }
  if (res.status >= 500) {
    serverErrors.add(1);
  }

  check(res, { 'confirmacion sin error de servidor': (r) => r.status < 500 });
}

export default function (data) {
  const draw = Math.random();
  if (draw < MIX_READ) {
    readAvailability(data.eventId);
  } else if (draw < MIX_READ + MIX_RESERVE) {
    reserve(data);
  } else {
    confirmOne(data);
  }
  sleep(THINK_TIME);
}

export const handleSummary = makeSummaryHandler('06-flash-sale');
