# k6 — 03-inv-flash-sale

- Perfil: `local`
- Umbrales: **FALLIDOS**
- Peticiones: 211 (6.63 req/s)
- Fallidas: 22.27 %
- Latencia: p95 13.38 ms · p99 228.7 ms · max 386.21 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evalúan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (195 ok / 0 fail)

| Contador | Valor |
|---|---|
| data_received | 101732 |
| reservas_aceptadas | 5 |
| http_5xx | 0 |
| reservas_sin_stock | 47 |
| iterations | 195 |
| data_sent | 66165 |
| confirmaciones_ok | 5 |

| Umbral | Resultado |
|---|---|
| http_req_duration{endpoint:reservas}: p(95)<500 | OK |
| checks: rate>0.99 | OK |
| http_req_duration{endpoint:disponibilidad}: p(95)<400 | OK |
| http_req_failed: rate<0.01 | FALLO |
| reservas_aceptadas: count>0 | OK |
| reservas_aceptadas: count<=5 | OK |
| http_req_duration{endpoint:confirmar}: p(95)<500 | OK |
| http_5xx: count==0 | OK |
