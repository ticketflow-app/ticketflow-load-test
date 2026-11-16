# k6 — 05-event-detail

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 1192 (11.79 req/s)
- Fallidas: 0.00 %
- Latencia: p95 5.17 ms · p99 10.89 ms · max 314.13 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evaluan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (4744 ok / 0 fail)

| Contador | Valor |
|---|---|
| data_sent | 157999 |
| data_received | 1663578 |
| iterations | 1186 |

| Umbral | Resultado |
|---|---|
| http_req_failed: rate<0.01 | OK |
| http_req_duration{endpoint:evento-detalle}: p(95)<120 | OK |
