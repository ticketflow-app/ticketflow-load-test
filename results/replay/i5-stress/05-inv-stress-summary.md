# k6 — 05-inv-stress

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 14263 (531 req/s)
- Fallidas: 0.00 %
- Latencia: p95 42.65 ms · p99 53.43 ms · max 1491.1 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evalúan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (14237 ok / 0 fail)

| Contador | Valor |
|---|---|
| iterations | 14237 |
| data_received | 7359423 |
| http_5xx | 0 |
| reservas_sin_stock | 14227 |
| reservas_aceptadas | 10 |
| data_sent | 9794790 |

| Umbral | Resultado |
|---|---|
| http_req_failed: rate<0.40 | OK |
| http_5xx: count==0 | OK |
| reservas_aceptadas: count>0 | OK |
| reservas_aceptadas: count<=10 | OK |
| http_req_duration{endpoint:reservas}: p(95)<1000 | OK |
| checks: rate>0.70 | OK |
