# k6 — 04-inv-confirm

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 133 (4.98 req/s)
- Fallidas: 0.00 %
- Latencia: p95 17.37 ms · p99 199.47 ms · max 537.79 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evalúan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (205 ok / 0 fail)

| Contador | Valor |
|---|---|
| confirmaciones_idempotentes | 86 |
| data_sent | 74941 |
| iterations | 97 |
| data_received | 72237 |
| confirmaciones_ok | 11 |
| http_5xx | 0 |
| reservas_creadas | 20 |

| Umbral | Resultado |
|---|---|
| http_req_failed: rate<0.01 | OK |
| checks: rate>0.99 | OK |
| confirmaciones_ok: count>0 | OK |
| http_req_duration{endpoint:confirmar}: p(95)<500 | OK |
| http_5xx: count==0 | OK |
