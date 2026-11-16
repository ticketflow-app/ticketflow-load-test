# k6 — 03-inv-flash-sale

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 211 (6.57 req/s)
- Fallidas: 0.00 %
- Latencia: p95 9.86 ms · p99 304.41 ms · max 467.1 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evalúan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (195 ok / 0 fail)

| Contador | Valor |
|---|---|
| data_received | 100688 |
| reservas_sin_stock | 38 |
| data_sent | 61059 |
| http_5xx | 0 |
| confirmaciones_ok | 4 |
| reservas_aceptadas | 5 |
| iterations | 195 |

| Umbral | Resultado |
|---|---|
| http_5xx: count==0 | OK |
| http_req_duration{endpoint:disponibilidad}: p(95)<400 | OK |
| reservas_aceptadas: count>0 | OK |
| reservas_aceptadas: count<=5 | OK |
| http_req_duration{endpoint:reservas}: p(95)<500 | OK |
| checks: rate>0.99 | OK |
| http_req_failed: rate<0.01 | OK |
| http_req_duration{endpoint:confirmar}: p(95)<500 | OK |
