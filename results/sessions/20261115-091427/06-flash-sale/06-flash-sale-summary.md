# k6 — 06-flash-sale

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 858 (6.85 req/s)
- Fallidas: 0.00 %
- Latencia: p95 10.42 ms · p99 163.7 ms · max 526.82 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evaluan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (832 ok / 0 fail)

| Contador | Valor |
|---|---|
| iterations | 832 |
| data_sent | 292027 |
| reservas_aceptadas | 100 |
| reservas_sin_stock | 150 |
| confirmaciones_ok | 64 |
| data_received | 588393 |
| http_5xx | 0 |

| Umbral | Resultado |
|---|---|
| http_req_duration{endpoint:confirmar}: p(95)<400 | OK |
| http_5xx: count==0 | OK |
| checks: rate>0.99 | OK |
| http_req_failed: rate<0.01 | OK |
| reservas_aceptadas: count>0 | OK |
| reservas_aceptadas: count<=100 | OK |
| http_req_duration{endpoint:reservas}: p(95)<400 | OK |
| http_req_duration{endpoint:disponibilidad}: p(95)<150 | OK |
