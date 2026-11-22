# k6 — 03-inv-flash-sale

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 211 (6.53 req/s)
- Fallidas: 0.00 %
- Latencia: p95 27.91 ms · p99 296.66 ms · max 374.73 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evalúan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (195 ok / 0 fail)

| Contador | Valor |
|---|---|
| data_received | 101851 |
| reservas_aceptadas | 5 |
| iterations | 195 |
| http_5xx | 0 |
| reservas_sin_stock | 51 |
| confirmaciones_ok | 3 |
| data_sent | 67449 |

| Umbral | Resultado |
|---|---|
| http_req_duration{endpoint:disponibilidad}: p(95)<400 | OK |
| http_5xx: count==0 | OK |
| http_req_duration{endpoint:reservas}: p(95)<500 | OK |
| http_req_failed: rate<0.01 | OK |
| checks: rate>0.99 | OK |
| reservas_aceptadas: count>0 | OK |
| reservas_aceptadas: count<=5 | OK |
| http_req_duration{endpoint:confirmar}: p(95)<500 | OK |
