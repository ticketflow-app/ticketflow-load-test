# k6 — 02-inv-availability

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 1227 (10.08 req/s)
- Fallidas: 0.00 %
- Latencia: p95 10.22 ms · p99 14.05 ms · max 307.7 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evalúan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 99.96 % (2441 ok / 1 fail)

| Contador | Valor |
|---|---|
| data_sent | 201742 |
| data_received | 512043 |
| iterations | 1221 |
| http_5xx | 0 |

| Umbral | Resultado |
|---|---|
| checks: rate>0.99 | OK |
| http_req_failed: rate<0.01 | OK |
| http_5xx: count==0 | OK |
| http_req_duration{endpoint:disponibilidad}: p(95)<100 | OK |
