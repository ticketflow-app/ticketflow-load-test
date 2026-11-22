# k6 — 02-inv-availability

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 318 (10.31 req/s)
- Fallidas: 0.00 %
- Latencia: p95 10.5 ms · p99 35.39 ms · max 228.45 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evalúan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 99.84 % (623 ok / 1 fail)

| Contador | Valor |
|---|---|
| iterations | 312 |
| data_sent | 53575 |
| data_received | 134614 |
| http_5xx | 0 |

| Umbral | Resultado |
|---|---|
| http_req_failed: rate<0.01 | OK |
| checks: rate>0.99 | OK |
| http_5xx: count==0 | OK |
| http_req_duration{endpoint:disponibilidad}: p(95)<100 | OK |
