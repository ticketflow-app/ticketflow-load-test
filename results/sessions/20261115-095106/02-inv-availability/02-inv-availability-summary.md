# k6 — 02-inv-availability

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 1231 (10.2 req/s)
- Fallidas: 0.00 %
- Latencia: p95 3.9 ms · p99 5.91 ms · max 171.14 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evalúan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (2450 ok / 0 fail)

| Contador | Valor |
|---|---|
| iterations | 1225 |
| data_sent | 202394 |
| http_5xx | 0 |
| data_received | 513665 |

| Umbral | Resultado |
|---|---|
| checks: rate>0.99 | OK |
| http_5xx: count==0 | OK |
| http_req_duration{endpoint:disponibilidad}: p(95)<100 | OK |
| http_req_failed: rate<0.01 | OK |
