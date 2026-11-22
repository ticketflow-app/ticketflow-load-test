# k6 — 05-inv-stress

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 28527 (1292.9 req/s)
- Fallidas: 0.00 %
- Latencia: p95 11.09 ms · p99 14.51 ms · max 259.73 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evalúan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (28481 ok / 0 fail)

| Contador | Valor |
|---|---|
| data_received | 14717013 |
| reservas_sin_stock | 28381 |
| iterations | 28481 |
| data_sent | 19616620 |
| reservas_aceptadas | 100 |
| http_5xx | 0 |

| Umbral | Resultado |
|---|---|
| http_5xx: count==0 | OK |
| http_req_duration{endpoint:reservas}: p(95)<1000 | OK |
| checks: rate>0.70 | OK |
| http_req_failed: rate<0.40 | OK |
| reservas_aceptadas: count>0 | OK |
| reservas_aceptadas: count<=100 | OK |
