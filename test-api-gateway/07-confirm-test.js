// E5 - Purchase confirmation: create a reservation and confirm it in the same iteration.
// Confirmation exercises the full purchase path (state transition + ticket issuance).
// Run: scripts\run-scenario.ps1 -Scenario 07

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';
import { THINK_TIME, randomInt, pick } from './lib/config.js';
import {
  organizerToken,
  buyerTokens,
  createPublishedEvent,
  createReservation,
  confirmReservation,
} from './lib/api.js';
import { makeSummaryHandler } from './lib/summary.js';

const CAPACITY = Number(__ENV.CAPACITY || 1000);
const BUYERS = Number(__ENV.BUYERS || 5);

const created = new Counter('reservas_creadas');
const confirmed = new Counter('confirmaciones_ok');
const rejected = new Counter('confirmaciones_rechazadas');
const rateLimited = new Counter('rate_limited');
const serverErrors = new Counter('http_5xx');

export const options = {
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
  stages: [
    { duration: '10s', target: 8 },
    { duration: '50s', target: 8 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_5xx: ['count==0'],
    confirmaciones_ok: ['count>0'],
    'http_req_duration{endpoint:reservas}': [pick('p(95)<400', 'p(95)<250')],
    'http_req_duration{endpoint:confirmar}': [pick('p(95)<400', 'p(95)<250')],
    checks: ['rate>0.99'],
    http_req_failed: ['rate<0.01'],
  },
};

export function setup() {
  const organizer = organizerToken('k6_confirm');
  const event = createPublishedEvent(organizer, {
    title: `Confirm ${Date.now()}`,
    capacity: CAPACITY,
  });
  console.log(`setup: eventId=${event.eventId} localityId=${event.localityId} capacity=${CAPACITY}`);
  return {
    eventId: event.eventId,
    localityId: event.localityId,
    buyers: buyerTokens(BUYERS, 'k6_confirm'),
  };
}

export default function (data) {
  const buyer = data.buyers[randomInt(data.buyers.length)];

  const createRes = createReservation(
    buyer,
    data.eventId,
    data.localityId,
    1,
    `k6-confirm-create-${__VU}-${__ITER}-${Date.now()}`,
    { responseCallback: http.expectedStatuses(200, 201, 409, 429) }
  );

  if (createRes.status === 429) {
    rateLimited.add(1);
    sleep(THINK_TIME);
    return;
  }
  if (createRes.status >= 500) serverErrors.add(1);
  check(createRes, { 'reserva sin error de servidor': (r) => r.status < 500 });

  let reservationId = null;
  if (createRes.status === 201 || createRes.status === 200) {
    created.add(1);
    try {
      reservationId = createRes.json().id;
    } catch (e) {
      reservationId = null;
    }
  }

  if (reservationId === null || reservationId === undefined) {
    sleep(THINK_TIME);
    return;
  }

  const confirmRes = confirmReservation(
    buyer,
    reservationId,
    `k6-confirm-${reservationId}`,
    { responseCallback: http.expectedStatuses(200, 201, 409, 410, 429) }
  );

  if (confirmRes.status === 200 || confirmRes.status === 201) {
    confirmed.add(1);
    let body = null;
    try {
      body = confirmRes.json();
    } catch (e) {
      body = null;
    }
    check(confirmRes, {
      'confirmada en estado CONFIRMED': () => body !== null && body.status === 'CONFIRMED',
    });
  } else if (confirmRes.status === 429) {
    rateLimited.add(1);
  } else {
    rejected.add(1);
  }
  if (confirmRes.status >= 500) serverErrors.add(1);

  check(confirmRes, { 'confirmacion sin error de servidor': (r) => r.status < 500 });

  sleep(THINK_TIME);
}

export const handleSummary = makeSummaryHandler('07-confirm');
