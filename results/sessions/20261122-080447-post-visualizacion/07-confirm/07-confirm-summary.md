# k6 — 07-confirm

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 204 (7.47 req/s)
- Fallidas: 0.00 %
- Latencia: p95 27.7 ms · p99 199.57 ms · max 259.23 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evaluan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (282 ok / 0 fail)

| Contador | Valor |
|---|---|
| data_sent | 121178 |
| reservas_creadas | 94 |
| iterations | 94 |
| data_received | 159179 |
| http_5xx | 0 |
| confirmaciones_ok | 94 |

| Umbral | Resultado |
|---|---|
| http_req_duration{endpoint:confirmar}: p(95)<400 | OK |
| http_req_failed: rate<0.01 | OK |
| http_5xx: count==0 | OK |
| http_req_duration{endpoint:reservas}: p(95)<400 | OK |
| checks: rate>0.99 | OK |
| confirmaciones_ok: count>0 | OK |
