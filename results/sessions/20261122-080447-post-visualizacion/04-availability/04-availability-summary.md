# k6 — 04-availability

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 308 (14.46 req/s)
- Fallidas: 0.00 %
- Latencia: p95 10.25 ms · p99 25.99 ms · max 257.92 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evaluan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 79.89 % (151 ok / 38 fail)

| Contador | Valor |
|---|---|
| data_received | 107918 |
| availability_rate_limited | 239 |
| data_sent | 50090 |
| iterations | 302 |

| Umbral | Resultado |
|---|---|
| http_req_duration{endpoint:disponibilidad}: p(95)<150 | OK |
| http_req_failed: rate<0.01 | OK |
