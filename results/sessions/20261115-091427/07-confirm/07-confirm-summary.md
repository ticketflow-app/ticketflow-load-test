# k6 — 07-confirm

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 868 (11.93 req/s)
- Fallidas: 0.00 %
- Latencia: p95 9.21 ms · p99 140.95 ms · max 240.08 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evaluan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (1030 ok / 0 fail)

| Contador | Valor |
|---|---|
| confirmaciones_ok | 294 |
| http_5xx | 0 |
| data_received | 563892 |
| rate_limited | 190 |
| data_sent | 538230 |
| reservas_creadas | 368 |
| iterations | 484 |

| Umbral | Resultado |
|---|---|
| http_req_failed: rate<0.01 | OK |
| checks: rate>0.99 | OK |
| http_req_duration{endpoint:confirmar}: p(95)<400 | OK |
| http_req_duration{endpoint:reservas}: p(95)<400 | OK |
| confirmaciones_ok: count>0 | OK |
| http_5xx: count==0 | OK |
