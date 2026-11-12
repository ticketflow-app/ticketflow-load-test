// E1 - Catalog listing (read path). Read-only: safe to run at any time.
// Run: scripts\run-scenario.ps1 -Scenario 01

import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, THINK_TIME, pick } from './lib/config.js';
import { makeSummaryHandler } from './lib/summary.js';

export const options = {
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
  stages: [
    { duration: '20s', target: 5 },
    { duration: '60s', target: 25 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    // Local: regression gate on a shared machine. SLA: platform plan (p95 < 40 ms).
    'http_req_duration{endpoint:eventos-list}': [pick('p(95)<150', 'p(95)<40')],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/api/eventos`, { tags: { endpoint: 'eventos-list' } });
  check(res, {
    'catalogo responde 200': (r) => r.status === 200,
  });
  sleep(THINK_TIME);
}

export const handleSummary = makeSummaryHandler('01-catalog');
