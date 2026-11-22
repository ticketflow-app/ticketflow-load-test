# k6 — 08-degradation

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 415 (20.36 req/s)
- Fallidas: 0.00 %
- Latencia: p95 50.87 ms · p99 283.45 ms · max 393.11 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evaluan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (798 ok / 0 fail)

| Contador | Valor |
|---|---|
| http_5xx | 0 |
| data_sent | 275495 |
| data_received | 204764 |
| rate_limited | 235 |
| iterations | 399 |
| reservas_aceptadas | 164 |
| rate_limit_without_problem_detail | 235 |

| Umbral | Resultado |
|---|---|
| checks: rate>0.99 | OK |
| http_req_duration{endpoint:reservas}: p(95)<600 | OK |
| http_5xx: count==0 | OK |
| http_req_failed: rate<0.01 | OK |
| rate_limited: count>0 | OK |
