# k6 — 05-inv-stress

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 62067 (3206.46 req/s)
- Fallidas: 0.00 %
- Latencia: p95 4.35 ms · p99 7.4 ms · max 238.13 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evalúan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (62021 ok / 0 fail)

| Contador | Valor |
|---|---|
| iterations | 62021 |
| data_received | 31988278 |
| http_5xx | 0 |
| data_sent | 42721170 |
| reservas_sin_stock | 61921 |
| reservas_aceptadas | 100 |

| Umbral | Resultado |
|---|---|
| checks: rate>0.70 | OK |
| http_req_duration{endpoint:reservas}: p(95)<1000 | OK |
| http_req_failed: rate<0.40 | OK |
| http_5xx: count==0 | OK |
| reservas_aceptadas: count>0 | OK |
| reservas_aceptadas: count<=100 | OK |
