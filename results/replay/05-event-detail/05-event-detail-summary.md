# k6 — 05-event-detail

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 393 (12.6 req/s)
- Fallidas: 0.00 %
- Latencia: p95 25.04 ms · p99 45.8 ms · max 291.26 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evaluan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (1548 ok / 0 fail)

| Contador | Valor |
|---|---|
| data_sent | 53330 |
| data_received | 547291 |
| iterations | 387 |

| Umbral | Resultado |
|---|---|
| http_req_failed: rate<0.01 | OK |
| http_req_duration{endpoint:evento-detalle}: p(95)<120 | OK |
