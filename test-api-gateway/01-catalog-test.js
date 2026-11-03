// Get-Content .\01-catalog-test.js | docker run --rm -i --network ticketflow-api-gateway_default -e K6_PROMETHEUS_RW_SERVER_URL=http://ticketflow-prometheus:9090/api/v1/write grafana/k6 run -o experimental-prometheus-rw -

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Rampa suave a 20 VUs
    { duration: '1m',  target: 50 },  // Carga constante de 50 VUs
    { duration: '30s', target: 0 },   // Cierre gradual
  ],
};

export default function () {
  const res = http.get('http://ticketflow-api-gateway:8080/api/eventos');
  
  check(res, {
    'status es 200': (r) => r.status === 200,
  });

  // Pausa de 1 segundo entre iteraciones
  sleep(1);
}