// I2 - Disponibilidad en lectura sostenida (equivale a E2 del plan vía gateway).
//
// Ramp-up controlado 5 -> 20 -> 0 VUs durante 2 min (ajustable al 70 % del codo con -e STAGES).
// Umbral local: p95 < 100 ms (más estricto que los 150 ms vía gateway al eliminar un salto de red),
// 0 % de errores 5xx.
//
// Run: scripts/run-scenario.ps1 -Scenario i2 [-Profile sla]

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';
import { BASE_URL, THINK_TIME, pick, parseStages } from './lib/config.js';
import { organizerToken, createPublishedEvent } from './lib/api.js';
import { makeSummaryHandler } from './lib/summary.js';

const STOCK = Number(__ENV.STOCK || 1000);

const serverErrors = new Counter('http_5xx');

export const options = {
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
  stages: parseStages(__ENV.STAGES, [
    { duration: '20s', target: 5 },
    { duration: '80s', target: 20 },
    { duration: '20s', target: 0 },
  ]),
  thresholds: {
    // Más estricto que vía gateway: se elimina un salto de red.
    'http_req_duration{endpoint:disponibilidad}': [pick('p(95)<100', 'p(95)<40')],
    http_req_failed: ['rate<0.01'],
    http_5xx: ['count==0'],
    checks: ['rate>0.99'],
  },
};

export function setup() {
  const token = organizerToken('k6_inv_availability');
  const event = createPublishedEvent(token, {
    title: `Availability ${Date.now()}`,
    capacity: STOCK,
  });
  console.log(`setup: eventId=${event.eventId} localityId=${event.localityId} stock=${STOCK}`);
  return { eventId: event.eventId, localityId: event.localityId };
}

export default function (data) {
  const res = http.get(`${BASE_URL}/api/inventario/eventos/${data.eventId}/disponibilidad`, {
    tags: { endpoint: 'disponibilidad' },
  });

  if (res.status >= 500) serverErrors.add(1);

  check(res, {
    'disponibilidad responde 200': (r) => r.status === 200,
    'reporta localidades con cupos': (r) => {
      try {
        const b = r.json();
        return b !== null && Array.isArray(b.localities) && b.localities.length > 0;
      } catch (e) {
        return false;
      }
    },
  });

  sleep(THINK_TIME);
}

export const handleSummary = makeSummaryHandler('02-inv-availability');
