// Get-Content .\03-reservations-test.js | docker run --rm -i --network ticketflow-api-gateway_default -e K6_PROMETHEUS_RW_SERVER_URL=http://ticketflow-prometheus:9090/api/v1/write grafana/k6 run -o experimental-prometheus-rw -

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '15s', target: 10 },
    { duration: '30s', target: 25 },
    { duration: '15s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = 'http://ticketflow-api-gateway:8080';

export function setup() {
  console.log('[SETUP] Autenticando para obtener JWT...');
  let token = null;
  const headers = { 'Content-Type': 'application/json' };


  // --- Generar un evento vendible para la prueba ---
  http.post(`${BASE_URL}/api/auth/register`, JSON.stringify({
    name: 'Load Test Organizer',
    email: 'loadtest_organizer@ticketflow.com',
    password: 'Password123!',
    role: 'organizador',
  }), { headers });

  const orgLoginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'loadtest_organizer@ticketflow.com',
    password: 'Password123!',
  }), { headers });
  const orgToken = orgLoginRes.json().data ? orgLoginRes.json().data.token : '';

  const eventDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const createRes = http.post(`${BASE_URL}/api/eventos`, JSON.stringify({
    title: 'Evento Load Test k6',
    description: 'Evento generado automáticamente para la prueba de carga de reservas.',
    categoryId: '01930000-0000-7000-8000-000000000001',
    venueId: '01930000-0000-7000-8000-000000000101',
    date: eventDate,
    imageUrl: 'https://picsum.photos/seed/k6loadtest/1200/800',
  }), { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${orgToken}` } });

  let eventId = createRes.json().id;

  const locRes = http.post(`${BASE_URL}/api/eventos/${eventId}/localidades`, JSON.stringify({
    name: 'General',
    price: 50000.00,
    capacity: 10000,
  }), { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${orgToken}` } });

  let localityId = locRes.json().id;

  http.post(`${BASE_URL}/api/eventos/${eventId}/publicar`, null, { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${orgToken}` } });

  http.get(`${BASE_URL}/api/inventario/eventos/${eventId}/disponibilidad`);

  http.post(`${BASE_URL}/api/auth/register`, JSON.stringify({
    name: 'Test User 1',
    email: 'testuser_1@ticketflow.com',
    password: 'Password123!',
  }), { headers });

  const buyerLoginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'testuser_1@ticketflow.com',
    password: 'Password123!',
  }), { headers });
  token = buyerLoginRes.json().data ? buyerLoginRes.json().data.token : '';


  return { token, eventId, localityId };
}

export default function (data) {
  const url = `${BASE_URL}/api/reservas`;
  const idempotencyKey = `k6-key-${__VU}-${__ITER}-${Date.now()}`;

  const payload = JSON.stringify({
    eventId: data.eventId,
    localityId: data.localityId,
    quantity: 1,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${data.token}`,
      'Idempotency-Key': idempotencyKey,
    },
  };

  const res = http.post(url, payload, params);

  if (res.status !== 200 && res.status !== 201 && __ITER < 3) {
    console.log(`[RESERVA FAIL] Status: ${res.status} | Body: ${res.body}`);
  }

  check(res, {
    'reserva procesada (200 o 201)': (r) => r.status === 200 || r.status === 201,
  });

  sleep(1);
}