// I1 - Smoke + calibración de codo de inventory-service (sin API Gateway).
//
// Endpoint: GET disponibilidad por evento/localidad.
// Escalera de calibración según §5 del plan de pruebas:
//   --stage 30s:10 --stage 30s:25 --stage 30s:50 --stage 30s:75 --stage 30s:0
// Configurable con -e STAGES="..." (ej. -e STAGES=20s:5,40s:15,20s:0).
//
// Objetivo: descubrir el codo real de inventory-service sin el freno de 10 req/s del gateway,
// manteniendo p95 < 2× línea base y 0 % de 5xx. NUNCA se usa p99 ni max como criterio de fallo.
//
// Run: scripts/run-scenario.ps1 -Scenario i1 [-Profile sla] [-Stages "..."]
//      o directamente: k6 run -e BASE_URL=http://ticketflow-inventory-service:8082 01-inv-calibration-test.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';
import { BASE_URL, THINK_TIME, pick, parseStages } from './lib/config.js';
import { organizerToken, createPublishedEvent } from './lib/api.js';
import { makeSummaryHandler } from './lib/summary.js';

const STOCK = Number(__ENV.STOCK || 100);
// Línea base esperada de disponibilidad en ms (p95 a baja carga). El umbral es 2× este valor.
const BASELINE_P95_MS = Number(__ENV.BASELINE_P95_MS || 100);

const serverErrors = new Counter('http_5xx');

export const options = {
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
  stages: parseStages(__ENV.STAGES, [
    { duration: '30s', target: 10 },
    { duration: '30s', target: 25 },
    { duration: '30s', target: 50 },
    { duration: '30s', target: 75 },
    { duration: '30s', target: 0 },
  ]),
  thresholds: {
    // p95 < 2× línea base (codo); sin p99/max como criterio de fallo (ruido del hipervisor).
    'http_req_duration{endpoint:disponibilidad}': [
      pick(`p(95)<${2 * BASELINE_P95_MS}`, 'p(95)<80'),
    ],
    http_req_failed: ['rate<0.01'],
    http_5xx: ['count==0'],
    checks: ['rate>0.99'],
  },
};

export function setup() {
  const token = organizerToken('k6_inv_calibration');
  const event = createPublishedEvent(token, {
    title: `Calibration ${Date.now()}`,
    capacity: STOCK,
  });
  console.log(`setup: eventId=${event.eventId} localityId=${event.localityId} stock=${STOCK}`);
  return { eventId: event.eventId, localityId: event.localityId, stock: STOCK };
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

export const handleSummary = makeSummaryHandler('01-inv-calibration');
