# k6 — 05-inv-stress

- Perfil: `local`
- Umbrales: **FALLIDOS**
- Peticiones: 62997 (3166.18 req/s)
- Fallidas: 99.77 %
- Latencia: p95 4.26 ms · p99 8.28 ms · max 445.44 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evalúan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (62951 ok / 0 fail)

| Contador | Valor |
|---|---|
| reservas_aceptadas | 100 |
| data_sent | 43363010 |
| reservas_sin_stock | 62851 |
| iterations | 62951 |
| http_5xx | 0 |
| data_received | 32467228 |

| Umbral | Resultado |
|---|---|
| http_5xx: count==0 | OK |
| reservas_aceptadas: count>0 | OK |
| reservas_aceptadas: count<=100 | OK |
| checks: rate>0.70 | OK |
| http_req_failed: rate<0.40 | FALLO |
| http_req_duration{endpoint:reservas}: p(95)<1000 | OK |
