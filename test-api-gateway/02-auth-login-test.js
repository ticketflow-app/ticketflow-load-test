// Get-Content .\02-auth-login-test.js | docker run --rm -i --network ticketflow-api-gateway_default -e K6_PROMETHEUS_RW_SERVER_URL=http://ticketflow-prometheus:9090/api/v1/write grafana/k6 run -o experimental-prometheus-rw -

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 10 },
    { duration: '40s', target: 20 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = 'http://ticketflow-api-gateway:8080/api/auth';
const NUM_USERS = 50;

// FASE SETUP: Se ejecuta UNA SOLA VEZ antes de iniciar la prueba de carga
export function setup() {
  console.log(`[SETUP] Pre-registrando ${NUM_USERS} usuarios de prueba...`);
  const headers = { 'Content-Type': 'application/json' };

  for (let i = 1; i <= NUM_USERS; i++) {
    const payload = JSON.stringify({
      name: `User ${i}`,
      email: `testuser_${i}@ticketflow.com`,
      password: 'Password123!',
    });
    
    // Intenta registrar al usuario (ignora si ya existe)
    http.post(`${BASE_URL}/register`, payload, { headers });
  }
  console.log('[SETUP] Registro completado.');
}

// FASE DE PRUEBA: Solo ejecuta logins con el pool de usuarios pre-creados
export default function () {
  const headers = { 'Content-Type': 'application/json' };
  
  // Seleccionar un usuario al azar del 1 al 50
  const userIndex = Math.floor(Math.random() * NUM_USERS) + 1;
  const payload = JSON.stringify({
    email: `testuser_${userIndex}@ticketflow.com`,
    password: 'Password123!',
  });

  const res = http.post(`${BASE_URL}/login`, payload, { headers });

  if (res.status !== 200) {
    console.log(`[LOGIN FAIL] Status: ${res.status} | Body: ${res.body}`);
  }

  check(res, {
    'login exitoso (200)': (r) => r.status === 200,
    'obtuvo token': (r) => r.json('token') !== undefined || r.body.includes('token'),
  });

  sleep(1);
}