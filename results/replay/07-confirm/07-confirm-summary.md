# k6 — 07-confirm

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 371 (10.99 req/s)
- Fallidas: 0.00 %
- Latencia: p95 45.23 ms · p99 287.4 ms · max 424.13 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evaluan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (442 ok / 0 fail)

| Contador | Valor |
|---|---|
| confirmaciones_ok | 130 |
| http_5xx | 0 |
| data_received | 251286 |
| rate_limited | 69 |
| data_sent | 226770 |
| reservas_creadas | 156 |
| iterations | 199 |

| Umbral | Resultado |
|---|---|
| http_req_failed: rate<0.01 | OK |
| http_req_duration{endpoint:reservas}: p(95)<400 | OK |
| checks: rate>0.99 | OK |
| http_req_duration{endpoint:confirmar}: p(95)<400 | OK |
| confirmaciones_ok: count>0 | OK |
| http_5xx: count==0 | OK |
