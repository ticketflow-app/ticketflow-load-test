# k6 — 05-inv-stress

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 292083 (4135.27 req/s)
- Fallidas: 0.00 %
- Latencia: p95 12.3 ms · p99 18 ms · max 629.41 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evalúan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (292037 ok / 0 fail)

| Contador | Valor |
|---|---|
| reservas_sin_stock | 291937 |
| iterations | 292037 |
| reservas_aceptadas | 100 |
| data_received | 150446592 |
| data_sent | 201269160 |
| http_5xx | 0 |

| Umbral | Resultado |
|---|---|
| http_req_failed: rate<0.40 | OK |
| http_req_duration{endpoint:reservas}: p(95)<1000 | OK |
| checks: rate>0.70 | OK |
| reservas_aceptadas: count>0 | OK |
| reservas_aceptadas: count<=100 | OK |
| http_5xx: count==0 | OK |
