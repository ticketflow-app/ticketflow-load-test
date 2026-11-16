// I5 - Estrés / degradación interna (equivale a E4 adaptado, sin RequestRateLimiter del gateway).
//
// Ráfaga de 40-50 VUs durante 1 min sobre creación de reservas para validar el comportamiento de
// Retry.backoff de Reactor, el pool de conexiones HikariCP y Lettuce (Redis).
//
// Criterios de éxito (operativos, verificados por la orquestación):
//   - 0 contenedores reiniciados (RestartCount = 0), sin OOM-kill.
//   - Degradación limpia: errores de negocio (409) o timeouts controlados, sin corromper Redis.
//   - Recuperación en < 30 s al bajar la carga.
//
// Umbrales k6: 0 % de 5xx (el servidor no debe devolver errores internos), se toleran fallos de
// petición (timeouts) como señal de degradación controlada. Nunca p99/max como criterio de fallo.
//
// Run: scripts/run-scenario.ps1 -Scenario i5 [-Profile sla] [-Env STOCK=100,BUYERS=20]

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';
import { THINK_TIME, randomInt, pick, parseStages } from './lib/config.js';
import {
  organizerToken,
  buyerTokens,
  createPublishedEvent,
  createReservation,
} from './lib/api.js';
import { makeSummaryHandler } from './lib/summary.js';

http.setResponseCallback(http.expectedStatuses(200, 201, 409));

const STOCK = Number(__ENV.STOCK || 100);
const BUYERS = Number(__ENV.BUYERS || 20);

const accepted = new Counter('reservas_aceptadas');
const noStock = new Counter('reservas_sin_stock');
const serverErrors = new Counter('http_5xx');
const timeouts = new Counter('http_timeouts');

export const options = {
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
  stages: parseStages(__ENV.STAGES, [
    { duration: '5s', target: 45 },
    { duration: '55s', target: 45 },
    { duration: '5s', target: 0 },
  ]),
  thresholds: {
    http_5xx: ['count==0'],
    // Bajo ráfaga se toleran peticiones fallidas (timeouts) como degradación controlada.
    http_req_failed: ['rate<0.40'],
    reservas_aceptadas: ['count>0', `count<=${STOCK}`],
    'http_req_duration{endpoint:reservas}': [pick('p(95)<1000', 'p(95)<500')],
    checks: ['rate>0.70'],
  },
};

export function setup() {
  const organizer = organizerToken('k6_inv_stress');
  const event = createPublishedEvent(organizer, {
    title: `Stress ${Date.now()}`,
    capacity: STOCK,
  });
  console.log(`setup: eventId=${event.eventId} localityId=${event.localityId} stock=${STOCK}`);
  return {
    eventId: event.eventId,
    localityId: event.localityId,
    stock: STOCK,
    buyers: buyerTokens(BUYERS, 'k6_inv_stress'),
  };
}

export default function (data) {
  const buyer = data.buyers[randomInt(data.buyers.length)];
  const key = `k6-inv-stress-${__VU}-${__ITER}-${Date.now()}`;

  const res = createReservation(buyer, data.eventId, data.localityId, 1, key, {});

  if (res.status >= 500) {
    serverErrors.add(1);
  }

  if (res.status === 201 || res.status === 200) {
    accepted.add(1);
  } else if (res.status === 409) {
    noStock.add(1);
  }

  // Tiempo de espera del cliente sin respuesta: k6 lo cuenta como fallo de petición, no como 5xx.
  if (res.status === 0) {
    timeouts.add(1);
  }

  check(res, {
    'reserva o rechazo de negocio sin error de servidor': (r) =>
      r.status === 200 || r.status === 201 || r.status === 409,
  });

  // Sin think time: ráfaga sostenida para forzar contención real en Redis/PostgreSQL.
  sleep(THINK_TIME);
}

export const handleSummary = makeSummaryHandler('05-inv-stress');