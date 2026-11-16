# k6 — 08-degradation

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 2231 (36.15 req/s)
- Fallidas: 0.00 %
- Latencia: p95 7.6 ms · p99 64.35 ms · max 179.75 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evaluan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (4430 ok / 0 fail)

| Contador | Valor |
|---|---|
| data_sent | 1508080 |
| rate_limit_without_problem_detail | 1611 |
| data_received | 897624 |
| iterations | 2215 |
| rate_limited | 1611 |
| http_5xx | 0 |
| reservas_aceptadas | 604 |

| Umbral | Resultado |
|---|---|
| http_req_duration{endpoint:reservas}: p(95)<600 | OK |
| checks: rate>0.99 | OK |
| rate_limited: count>0 | OK |
| http_req_failed: rate<0.01 | OK |
| http_5xx: count==0 | OK |
