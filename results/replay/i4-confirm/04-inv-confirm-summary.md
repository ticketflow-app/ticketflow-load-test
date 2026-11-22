# k6 — 04-inv-confirm

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 291 (0.19 req/s)
- Fallidas: 0.00 %
- Latencia: p95 47.26 ms · p99 385.73 ms · max 697.98 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evalúan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (530 ok / 0 fail)

| Contador | Valor |
|---|---|
| reservas_creadas | 20 |
| confirmaciones_idempotentes | 235 |
| confirmaciones_ok | 20 |
| data_sent | 165801 |
| iterations | 255 |
| http_5xx | 0 |
| data_received | 140974 |

| Umbral | Resultado |
|---|---|
| confirmaciones_ok: count>0 | OK |
| http_5xx: count==0 | OK |
| http_req_failed: rate<0.01 | OK |
| checks: rate>0.99 | OK |
| http_req_duration{endpoint:confirmar}: p(95)<500 | OK |
