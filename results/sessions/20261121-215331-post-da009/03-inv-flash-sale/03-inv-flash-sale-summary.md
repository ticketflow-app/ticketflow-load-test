# k6 — 03-inv-flash-sale

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 1683 (0.89 req/s)
- Fallidas: 0.00 %
- Latencia: p95 21 ms · p99 353.96 ms · max 1759254.82 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evalúan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (1647 ok / 0 fail)

| Contador | Valor |
|---|---|
| data_received | 782409 |
| confirmaciones_ok | 83 |
| reservas_sin_stock | 419 |
| reservas_aceptadas | 100 |
| http_5xx | 0 |
| iterations | 1647 |
| data_sent | 584460 |

| Umbral | Resultado |
|---|---|
| reservas_aceptadas: count<=100 | OK |
| reservas_aceptadas: count>0 | OK |
| http_5xx: count==0 | OK |
| checks: rate>0.99 | OK |
| http_req_duration{endpoint:reservas}: p(95)<500 | OK |
| http_req_duration{endpoint:confirmar}: p(95)<500 | OK |
| http_req_failed: rate<0.01 | OK |
| http_req_duration{endpoint:disponibilidad}: p(95)<400 | OK |
