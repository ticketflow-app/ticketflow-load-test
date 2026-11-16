# k6 — 07-confirm

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 852 (11.82 req/s)
- Fallidas: 0.00 %
- Latencia: p95 8.12 ms · p99 29.15 ms · max 213.3 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evaluan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (1010 ok / 0 fail)

| Contador | Valor |
|---|---|
| confirmaciones_ok | 306 |
| data_received | 556643 |
| rate_limited | 178 |
| iterations | 484 |
| http_5xx | 0 |
| reservas_creadas | 352 |
| data_sent | 529350 |

| Umbral | Resultado |
|---|---|
| checks: rate>0.99 | OK |
| http_req_duration{endpoint:confirmar}: p(95)<400 | OK |
| http_req_failed: rate<0.01 | OK |
| http_req_duration{endpoint:reservas}: p(95)<400 | OK |
| http_5xx: count==0 | OK |
| confirmaciones_ok: count>0 | OK |
