# k6 — 04-inv-confirm

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 644 (9.03 req/s)
- Fallidas: 0.00 %
- Latencia: p95 4.27 ms · p99 12.61 ms · max 169.98 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evalúan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (1236 ok / 0 fail)

| Contador | Valor |
|---|---|
| iterations | 608 |
| confirmaciones_ok | 20 |
| http_5xx | 0 |
| confirmaciones_idempotentes | 588 |
| data_sent | 368425 |
| data_received | 313623 |
| reservas_creadas | 20 |

| Umbral | Resultado |
|---|---|
| confirmaciones_ok: count>0 | OK |
| http_5xx: count==0 | OK |
| checks: rate>0.99 | OK |
| http_req_failed: rate<0.01 | OK |
| http_req_duration{endpoint:confirmar}: p(95)<500 | OK |
