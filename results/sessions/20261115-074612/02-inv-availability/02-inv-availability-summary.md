# k6 — 02-inv-availability

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 50 (2.44 req/s)
- Fallidas: 0.00 %
- Latencia: p95 21.29 ms · p99 173.37 ms · max 314.17 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evalúan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (88 ok / 0 fail)

| Contador | Valor |
|---|---|
| data_received | 23550 |
| http_5xx | 0 |
| iterations | 44 |
| data_sent | 9891 |

| Umbral | Resultado |
|---|---|
| http_req_failed: rate<0.01 | OK |
| checks: rate>0.99 | OK |
| http_req_duration{endpoint:disponibilidad}: p(95)<100 | OK |
| http_5xx: count==0 | OK |
