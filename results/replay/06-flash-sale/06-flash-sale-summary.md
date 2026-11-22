# k6 — 06-flash-sale

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 116 (3.22 req/s)
- Fallidas: 0.00 %
- Latencia: p95 263.81 ms · p99 606.08 ms · max 864.21 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evaluan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (100 ok / 0 fail)

| Contador | Valor |
|---|---|
| reservas_aceptadas | 5 |
| data_received | 86490 |
| reservas_sin_stock | 33 |
| http_5xx | 0 |
| data_sent | 40990 |
| iterations | 100 |
| confirmaciones_ok | 2 |

| Umbral | Resultado |
|---|---|
| checks: rate>0.99 | OK |
| reservas_aceptadas: count>0 | OK |
| reservas_aceptadas: count<=5 | OK |
| http_req_duration{endpoint:reservas}: p(95)<400 | OK |
| http_req_failed: rate<0.01 | OK |
| http_5xx: count==0 | OK |
| http_req_duration{endpoint:confirmar}: p(95)<400 | OK |
| http_req_duration{endpoint:disponibilidad}: p(95)<150 | OK |
