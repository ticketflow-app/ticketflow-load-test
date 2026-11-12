// HTTP helpers shared by the scenarios: users, tokens and event fixtures.

import http from 'k6/http';
import { BASE_URL, CATEGORY_ID, VENUE_ID } from './config.js';

export const JSON_HEADERS = { 'Content-Type': 'application/json' };

export function authHeaders(token, extra) {
  return Object.assign({}, JSON_HEADERS, { Authorization: `Bearer ${token}` }, extra || {});
}

function safeJson(res) {
  try {
    return res.json();
  } catch (e) {
    return null;
  }
}

function tokenOf(res) {
  const body = safeJson(res);
  if (!body) return '';
  if (body.data && body.data.token) return body.data.token;
  return body.token || '';
}

// Registers the user when possible (409 when it already exists) and returns a fresh token.
export function loginOrRegister(email, password, name, role) {
  const payload = { name: name, email: email, password: password };
  if (role) payload.role = role;
  // Setup traffic is tagged so it can be told apart from the measured loop.
  // 409 means the user already exists, which is the expected state on a re-run.
  http.post(`${BASE_URL}/api/auth/register`, JSON.stringify(payload), {
    headers: JSON_HEADERS,
    tags: { phase: 'setup' },
    responseCallback: http.expectedStatuses(200, 201, 409),
  });
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: email, password: password }),
    { headers: JSON_HEADERS, tags: { phase: 'setup' } }
  );
  const token = tokenOf(res);
  if (!token) {
    throw new Error(`login failed for ${email}: status=${res.status} body=${res.body}`);
  }
  return token;
}

export function organizerToken(prefix) {
  return loginOrRegister(
    `${prefix}_organizer@ticketflow.com`,
    'Password123!',
    'Load Test Organizer',
    'organizador'
  );
}

// Creates a buyer pool. Distinct tokens avoid a single user becoming the bottleneck.
export function buyerTokens(count, prefix) {
  const tokens = [];
  for (let i = 1; i <= count; i++) {
    tokens.push(
      loginOrRegister(`${prefix}_buyer_${i}@ticketflow.com`, 'Password123!', `Buyer ${i}`)
    );
  }
  return tokens;
}

function requireField(res, field, step) {
  const body = safeJson(res);
  if (!body || !body[field]) {
    throw new Error(`${step} failed: status=${res.status} body=${res.body}`);
  }
  return body[field];
}

/**
 * Creates, seeds and publishes an event so it is sellable, and seeds the Redis counter.
 * The availability endpoint initializes `inv:stock:{eventId}:{localityId}` from the catalog
 * capacity on first call, so it must be called once before any reservation.
 */
export function createPublishedEvent(token, options) {
  const opts = options || {};
  const capacity = opts.capacity || 100;
  const title = opts.title || `Load Test ${Date.now()}`;
  const date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const createRes = http.post(
    `${BASE_URL}/api/eventos`,
    JSON.stringify({
      title: title,
      description: 'Event generated automatically by the k6 load-test suite.',
      categoryId: CATEGORY_ID,
      venueId: VENUE_ID,
      date: date,
      imageUrl: 'https://picsum.photos/seed/k6loadtest/1200/800',
    }),
    { headers: authHeaders(token), tags: { phase: 'setup' } }
  );
  const eventId = requireField(createRes, 'id', 'create event');

  const localityRes = http.post(
    `${BASE_URL}/api/eventos/${eventId}/localidades`,
    JSON.stringify({ name: 'General', price: 50000.0, capacity: capacity }),
    { headers: authHeaders(token), tags: { phase: 'setup' } }
  );
  const localityId = requireField(localityRes, 'id', 'add locality');

  const publishRes = http.post(`${BASE_URL}/api/eventos/${eventId}/publicar`, null, {
    headers: authHeaders(token),
    tags: { phase: 'setup' },
  });
  if (publishRes.status >= 400) {
    throw new Error(`publish event failed: status=${publishRes.status} body=${publishRes.body}`);
  }

  // Seeds the availability counter in Redis from the catalog capacity.
  // Untagged on purpose: it must not pollute the measured availability latency.
  http.get(`${BASE_URL}/api/inventario/eventos/${eventId}/disponibilidad`, {
    tags: { phase: 'setup' },
  });

  return { eventId: eventId, localityId: localityId };
}

export function availability(eventId, params) {
  return http.get(
    `${BASE_URL}/api/inventario/eventos/${eventId}/disponibilidad`,
    Object.assign(
      {
        tags: { endpoint: 'disponibilidad' },
      },
      params || {}
    )
  );
}

export function createReservation(token, eventId, localityId, quantity, idempotencyKey, params) {
  return http.post(
    `${BASE_URL}/api/reservas`,
    JSON.stringify({
      eventId: eventId,
      localityId: localityId,
      quantity: quantity || 1,
    }),
    Object.assign(
      {
        headers: authHeaders(token, { 'Idempotency-Key': idempotencyKey }),
        tags: { endpoint: 'reservas' },
      },
      params || {}
    )
  );
}

export function confirmReservation(token, reservationId, idempotencyKey, params) {
  return http.post(
    `${BASE_URL}/api/reservas/${reservationId}/confirmar`,
    null,
    Object.assign(
      {
        headers: authHeaders(token, { 'Idempotency-Key': idempotencyKey }),
        tags: { endpoint: 'confirmar' },
      },
      params || {}
    )
  );
}
