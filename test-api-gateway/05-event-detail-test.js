// E1b - Event detail (the endpoint named in the platform test plan, cache-aside in Redis).
// setup creates and publishes one event; the measured loop only reads.
// Run: scripts\run-scenario.ps1 -Scenario 05

import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, THINK_TIME, pick } from './lib/config.js';
import { organizerToken, createPublishedEvent } from './lib/api.js';
import { makeSummaryHandler } from './lib/summary.js';

export const options = {
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
  stages: [
    { duration: '20s', target: 5 },
    { duration: '60s', target: 25 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    // Platform plan: p95 < 40 ms with cache hit > 95 %. Local keeps a regression margin.
    'http_req_duration{endpoint:evento-detalle}': [pick('p(95)<120', 'p(95)<40')],
    http_req_failed: ['rate<0.01'],
  },
};

export function setup() {
  const token = organizerToken('k6_detail');
  const event = createPublishedEvent(token, { title: `Detail ${Date.now()}`, capacity: 500 });
  console.log(`setup: eventId=${event.eventId} localityId=${event.localityId}`);
  return event;
}

export default function (data) {
  const res = http.get(`${BASE_URL}/api/eventos/${data.eventId}`, {
    tags: { endpoint: 'evento-detalle' },
  });

  let body = null;
  try {
    body = res.json();
  } catch (e) {
    body = null;
  }

  check(res, {
    'detalle responde 200': (r) => r.status === 200,
    'devuelve el evento solicitado': () => body !== null && body.id === data.eventId,
    'incluye localidades': () => body !== null && Array.isArray(body.localities) && body.localities.length > 0,
    'no esta en borrador': () => body !== null && body.status !== 'BORRADOR',
  });

  sleep(THINK_TIME);
}

export const handleSummary = makeSummaryHandler('05-event-detail');
