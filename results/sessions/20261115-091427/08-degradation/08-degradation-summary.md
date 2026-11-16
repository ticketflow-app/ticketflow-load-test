# k6 — 08-degradation

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 2233 (35.38 req/s)
- Fallidas: 0.00 %
- Latencia: p95 6.45 ms · p99 8.82 ms · max 510.24 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evaluan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (4434 ok / 0 fail)

| Contador | Valor |
|---|---|
| iterations | 2217 |
| data_received | 898728 |
| reservas_aceptadas | 603 |
| rate_limit_without_problem_detail | 1614 |
| data_sent | 1509438 |
| rate_limited | 1614 |
| http_5xx | 0 |

| Umbral | Resultado |
|---|---|
| checks: rate>0.99 | OK |
| http_req_failed: rate<0.01 | OK |
| rate_limited: count>0 | OK |
| http_5xx: count==0 | OK |
| http_req_duration{endpoint:reservas}: p(95)<600 | OK |
