# k6 — 06-flash-sale

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 116 (3.56 req/s)
- Fallidas: 0.00 %
- Latencia: p95 83.9 ms · p99 206.3 ms · max 214.17 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evaluan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (100 ok / 0 fail)

| Contador | Valor |
|---|---|
| data_received | 85091 |
| iterations | 100 |
| http_5xx | 0 |
| reservas_sin_stock | 27 |
| data_sent | 38714 |
| confirmaciones_ok | 4 |
| reservas_aceptadas | 5 |

| Umbral | Resultado |
|---|---|
| http_req_duration{endpoint:confirmar}: p(95)<400 | OK |
| http_req_failed: rate<0.01 | OK |
| http_req_duration{endpoint:disponibilidad}: p(95)<150 | OK |
| http_req_duration{endpoint:reservas}: p(95)<400 | OK |
| checks: rate>0.99 | OK |
| reservas_aceptadas: count>0 | OK |
| reservas_aceptadas: count<=5 | OK |
| http_5xx: count==0 | OK |
