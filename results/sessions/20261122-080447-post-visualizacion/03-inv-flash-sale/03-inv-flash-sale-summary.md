# k6 — 03-inv-flash-sale

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 211 (6.63 req/s)
- Fallidas: 0.00 %
- Latencia: p95 21.44 ms · p99 246.2 ms · max 330.9 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evalúan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (195 ok / 0 fail)

| Contador | Valor |
|---|---|
| reservas_aceptadas | 5 |
| confirmaciones_ok | 5 |
| data_received | 101790 |
| reservas_sin_stock | 48 |
| http_5xx | 0 |
| iterations | 195 |
| data_sent | 66717 |

| Umbral | Resultado |
|---|---|
| http_req_duration{endpoint:reservas}: p(95)<500 | OK |
| reservas_aceptadas: count>0 | OK |
| reservas_aceptadas: count<=5 | OK |
| http_req_duration{endpoint:disponibilidad}: p(95)<400 | OK |
| http_req_failed: rate<0.01 | OK |
| checks: rate>0.99 | OK |
| http_5xx: count==0 | OK |
| http_req_duration{endpoint:confirmar}: p(95)<500 | OK |
