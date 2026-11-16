# k6 — 03-inv-flash-sale

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 1693 (13.56 req/s)
- Fallidas: 0.00 %
- Latencia: p95 4.09 ms · p99 140.57 ms · max 263.91 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evalúan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (1657 ok / 0 fail)

| Contador | Valor |
|---|---|
| iterations | 1657 |
| reservas_aceptadas | 100 |
| http_5xx | 0 |
| data_sent | 578303 |
| data_received | 784395 |
| confirmaciones_ok | 95 |
| reservas_sin_stock | 395 |

| Umbral | Resultado |
|---|---|
| http_req_duration{endpoint:confirmar}: p(95)<500 | OK |
| http_req_duration{endpoint:disponibilidad}: p(95)<400 | OK |
| reservas_aceptadas: count>0 | OK |
| reservas_aceptadas: count<=100 | OK |
| checks: rate>0.99 | OK |
| http_req_duration{endpoint:reservas}: p(95)<500 | OK |
| http_req_failed: rate<0.01 | OK |
| http_5xx: count==0 | OK |
