# k6 — 02-inv-availability

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 50 (2.43 req/s)
- Fallidas: 0.00 %
- Latencia: p95 14.32 ms · p99 232.79 ms · max 435.23 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evalúan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (88 ok / 0 fail)

| Contador | Valor |
|---|---|
| iterations | 44 |
| data_sent | 9891 |
| http_5xx | 0 |
| data_received | 23550 |

| Umbral | Resultado |
|---|---|
| http_5xx: count==0 | OK |
| http_req_duration{endpoint:disponibilidad}: p(95)<100 | OK |
| checks: rate>0.99 | OK |
| http_req_failed: rate<0.01 | OK |
