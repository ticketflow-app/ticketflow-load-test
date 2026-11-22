# k6 — 08-degradation

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 418 (23.07 req/s)
- Fallidas: 0.00 %
- Latencia: p95 21.25 ms · p99 180.06 ms · max 239.55 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evaluan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (804 ok / 0 fail)

| Contador | Valor |
|---|---|
| data_sent | 277545 |
| iterations | 402 |
| http_5xx | 0 |
| rate_limit_without_problem_detail | 239 |
| rate_limited | 239 |
| reservas_aceptadas | 163 |
| data_received | 204199 |

| Umbral | Resultado |
|---|---|
| http_5xx: count==0 | OK |
| rate_limited: count>0 | OK |
| http_req_failed: rate<0.01 | OK |
| http_req_duration{endpoint:reservas}: p(95)<600 | OK |
| checks: rate>0.99 | OK |
