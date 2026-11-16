# k6 — 06-flash-sale

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 859 (6.98 req/s)
- Fallidas: 0.00 %
- Latencia: p95 7.62 ms · p99 125.47 ms · max 225.85 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evaluan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (833 ok / 0 fail)

| Contador | Valor |
|---|---|
| iterations | 833 |
| http_5xx | 0 |
| data_sent | 297437 |
| data_received | 588779 |
| confirmaciones_ok | 81 |
| reservas_sin_stock | 147 |
| reservas_aceptadas | 100 |

| Umbral | Resultado |
|---|---|
| http_5xx: count==0 | OK |
| http_req_duration{endpoint:disponibilidad}: p(95)<150 | OK |
| http_req_duration{endpoint:reservas}: p(95)<400 | OK |
| http_req_duration{endpoint:confirmar}: p(95)<400 | OK |
| http_req_failed: rate<0.01 | OK |
| reservas_aceptadas: count>0 | OK |
| reservas_aceptadas: count<=100 | OK |
| checks: rate>0.99 | OK |
