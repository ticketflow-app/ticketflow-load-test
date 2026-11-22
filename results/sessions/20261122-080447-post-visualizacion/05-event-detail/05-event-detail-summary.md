# k6 — 05-event-detail

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 57 (2.78 req/s)
- Fallidas: 0.00 %
- Latencia: p95 22.72 ms · p99 109.24 ms · max 209.83 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evaluan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (204 ok / 0 fail)

| Contador | Valor |
|---|---|
| iterations | 51 |
| data_received | 77716 |
| data_sent | 9314 |

| Umbral | Resultado |
|---|---|
| http_req_failed: rate<0.01 | OK |
| http_req_duration{endpoint:evento-detalle}: p(95)<120 | OK |
