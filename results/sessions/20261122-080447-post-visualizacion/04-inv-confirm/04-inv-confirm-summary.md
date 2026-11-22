# k6 — 04-inv-confirm

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 133 (4.81 req/s)
- Fallidas: 0.00 %
- Latencia: p95 27.23 ms · p99 405.99 ms · max 456.33 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evalúan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (205 ok / 0 fail)

| Contador | Valor |
|---|---|
| data_sent | 75417 |
| data_received | 72441 |
| confirmaciones_ok | 11 |
| confirmaciones_idempotentes | 86 |
| http_5xx | 0 |
| reservas_creadas | 20 |
| iterations | 97 |

| Umbral | Resultado |
|---|---|
| http_req_failed: rate<0.01 | OK |
| http_req_duration{endpoint:confirmar}: p(95)<500 | OK |
| confirmaciones_ok: count>0 | OK |
| checks: rate>0.99 | OK |
| http_5xx: count==0 | OK |
