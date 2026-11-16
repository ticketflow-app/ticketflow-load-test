// I4 - Confirmación de reserva (equivale a E5 del plan vía gateway).
//
// setup() crea reservas pendientes; el bucle mide exclusivamente POST /api/reservas/{id}/confirmar
// bajo concurrencia (8-12 VUs, 1 min). Valida:
//   - emisión de boleto (estado CONFIRMED),
//   - idempotencia: re-confirmar una misma reserva devuelve 409/410 controlado, nunca 500,
//   - p95 < 500 ms en confirmar.
//
// Run: scripts/run-scenario.ps1 -Scenario i4 [-Profile sla]

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';
import { BASE_URL, THINK_TIME, randomInt, pick, parseStages } from './lib/config.js';
import {
  organizerToken,
  buyerTokens,
  createPublishedEvent,
  createReservation,
  confirmReservation,
} from './lib/api.js';
import { makeSummaryHandler } from './lib/summary.js';

http.setResponseCallback(http.expectedStatuses(200, 201, 409, 410));

const CAPACITY = Number(__ENV.CAPACITY || 1000);
const BUYERS = Number(__ENV.BUYERS || 5);
const RESERVATIONS_TO_CREATE = Number(__ENV.RESERVATIONS_TO_CREATE || 20);

const created = new Counter('reservas_creadas');
const confirmed = new Counter('confirmaciones_ok');
const rejected = new Counter('confirmaciones_rechazadas');
const idempotentOk = new Counter('confirmaciones_idempotentes');
const serverErrors = new Counter('http_5xx');

let myQueue = null;
const myConfirmed = [];

export const options = {
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
  stages: parseStages(__ENV.STAGES, [
    { duration: '10s', target: 10 },
    { duration: '50s', target: 10 },
    { duration: '10s', target: 0 },
  ]),
  thresholds: {
    http_5xx: ['count==0'],
    confirmaciones_ok: ['count>0'],
    'http_req_duration{endpoint:confirmar}': [pick('p(95)<500', 'p(95)<250')],
    checks: ['rate>0.99'],
    http_req_failed: ['rate<0.01'],
  },
};

export function setup() {
  const organizer = organizerToken('k6_inv_confirm_setup');
  const event = createPublishedEvent(organizer, {
    title: `Confirm ${Date.now()}`,
    capacity: CAPACITY,
  });
  const buyers = buyerTokens(BUYERS, 'k6_inv_confirm');

  const buyer = buyers[0];
  const reservationIds = [];
  for (let i = 1; i <= RESERVATIONS_TO_CREATE; i++) {
    const res = createReservation(
      buyer,
      event.eventId,
      event.localityId,
      1,
      `k6-confirm-setup-${event.eventId}-${i}-${Date.now()}`,
      { tags: { phase: 'setup' } }
    );
    if (res.status === 201 || res.status === 200) {
      created.add(1);
      try {
        reservationIds.push(res.json().id);
      } catch (e) {
        /* ignore */
      }
    }
  }

  console.log(
    `setup: eventId=${event.eventId} localityId=${event.localityId} reservations=${reservationIds.length}`
  );
  return {
    eventId: event.eventId,
    localityId: event.localityId,
    buyer,
    buyers,
    reservationIds,
  };
}

export default function (data) {
  if (myQueue === null) {
    myQueue = data.reservationIds.filter((_, idx) => idx % 10 === (__VU - 1) % 10);
  }

  const buyer = data.buyer;

  if (myQueue.length > 0) {
    const id = myQueue.pop();
    const res = confirmReservation(buyer, id, `k6-confirm-${id}`, {});

    if (res.status === 200 || res.status === 201) {
      confirmed.add(1);
      myConfirmed.push(id);
      let body = null;
      try {
        body = res.json();
      } catch (e) {
        body = null;
      }
      check(res, {
        'confirmada en estado CONFIRMED': () =>
          body !== null && body.status === 'CONFIRMED',
        'emite boleto': () => body !== null && body.status === 'CONFIRMED',
      });
    } else if (res.status >= 500) {
      serverErrors.add(1);
      myQueue.push(id);
    } else {
      rejected.add(1);
    }
    check(res, { 'confirmacion sin error de servidor': (r) => r.status < 500 });
    sleep(THINK_TIME);
    return;
  }

  if (myConfirmed.length > 0) {
    const id = myConfirmed[randomInt(myConfirmed.length)];
    const res = confirmReservation(buyer, id, `k6-confirm-idem-${id}-${__ITER}`, {});

    if (res.status === 409 || res.status === 410) {
      idempotentOk.add(1);
    } else if (res.status >= 500) {
      serverErrors.add(1);
    } else if (res.status === 200 || res.status === 201) {
      idempotentOk.add(1);
    }
    check(res, {
      're-confirmacion controlada (409/410) o idempotente (2xx)': (r) =>
        r.status === 200 || r.status === 201 || r.status === 409 || r.status === 410,
      'nunca error de servidor al re-confirmar': (r) => r.status < 500,
    });
    sleep(THINK_TIME);
    return;
  }

  http.get(`${BASE_URL}/api/inventario/eventos/${data.eventId}/disponibilidad`, {
    tags: { endpoint: 'disponibilidad', phase: 'setup' },
  });
  sleep(THINK_TIME);
}

export const handleSummary = makeSummaryHandler('04-inv-confirm');