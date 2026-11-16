// I3 - Flash Sale directo contra inventory-service (equivale a E3 del plan vía gateway).
//
// Mezcla de tráfico 60 % consulta disponibilidad / 30 % crear reserva / 10 % confirmar reserva.
// STOCK=100 boletos, 15-20 VUs durante 2 min. Sin el freno del gateway se prueba la contención
// real sobre los scripts Lua/lock de Redis y las transacciones de PostgreSQL.
//
// Estados HTTP esperados: 201 (reserva creada), 200 (lectura/confirmación), 409 (sin stock).
// Cualquier 500/503 o stock negativo falla el test. Compatible con scripts/verify-invariants.ps1
// (sum(quantity) PENDING/CONFIRMED == STOCK y Redis inv:stock:{eventId}:{localityId} == 0).
//
// Run: scripts/run-scenario.ps1 -Scenario i3 [-Profile sla] [-Env STOCK=100,BUYERS=15]
//      Luego: scripts/verify-invariants.ps1 -EventId <id> -LocalityId <id> -ExpectedStock 100

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';
import { THINK_TIME, randomInt, pick, parseStages } from './lib/config.js';
import {
  organizerToken,
  buyerTokens,
  createPublishedEvent,
  availability,
  createReservation,
  confirmReservation,
} from './lib/api.js';
http.setResponseCallback(http.expectedStatuses(200, 201, 409));
import { makeSummaryHandler } from './lib/summary.js';

http.setResponseCallback(http.expectedStatuses(200, 201, 409));

const STOCK = Number(__ENV.STOCK || 100);
const BUYERS = Number(__ENV.BUYERS || 15);
const MIX_READ = Number(__ENV.MIX_READ || 0.6);
const MIX_RESERVE = Number(__ENV.MIX_RESERVE || 0.3);

const accepted = new Counter('reservas_aceptadas');
const noStock = new Counter('reservas_sin_stock');
const confirmsOk = new Counter('confirmaciones_ok');
const serverErrors = new Counter('http_5xx');

// Per-VU queue of reservations waiting to be confirmed: { id, token }.
const pending = [];

export const options = {
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
  stages: parseStages(__ENV.STAGES, [
    { duration: '10s', target: 15 },
    { duration: '100s', target: 15 },
    { duration: '10s', target: 0 },
  ]),
  thresholds: {
    http_5xx: ['count==0'],
    // Hard anti-oversell guard: accepted reservations can never exceed the stock, and must be > 0.
    reservas_aceptadas: ['count>0', `count<=${STOCK}`],
    'http_req_duration{endpoint:disponibilidad}': [pick('p(95)<400', 'p(95)<250')],
    'http_req_duration{endpoint:reservas}': [pick('p(95)<500', 'p(95)<300')],
    'http_req_duration{endpoint:confirmar}': [pick('p(95)<500', 'p(95)<300')],
    checks: ['rate>0.99'],
    http_req_failed: ['rate<0.01'],
  },
};

export function setup() {
  const organizer = organizerToken('k6_inv_flashsale');
  const event = createPublishedEvent(organizer, {
    title: `Flash Sale ${Date.now()}`,
    capacity: STOCK,
  });
  console.log(`setup: eventId=${event.eventId} localityId=${event.localityId} stock=${STOCK}`);
  return {
    eventId: event.eventId,
    localityId: event.localityId,
    stock: STOCK,
    buyers: buyerTokens(BUYERS, 'k6_inv_flashsale'),
  };
}

function readAvailability(eventId) {
  // Directo al microservicio: no hay RequestRateLimiter (no 429 por throttling del gateway).
  const res = availability(eventId, {});
  if (res.status >= 500) serverErrors.add(1);
  check(res, { 'lectura sin error de servidor': (r) => r.status < 500 });
}

function reserve(data) {
  const buyer = data.buyers[randomInt(data.buyers.length)];
  const key = `k6-inv-fs-${__VU}-${__ITER}-${Date.now()}`;
  const res = createReservation(buyer, data.eventId, data.localityId, 1, key, {});

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
    // Sin stock: respuesta de negocio esperada, nunca es un error de servidor.
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
  const res = confirmReservation(item.token, item.id, `k6-inv-conf-${item.id}-${__ITER}`, {});

  if (res.status === 200 || res.status === 201) {
    confirmsOk.add(1);
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

export const handleSummary = makeSummaryHandler('03-inv-flash-sale');