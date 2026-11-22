# k6 — 01-catalog

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 382 (12.35 req/s)
- Fallidas: 0.00 %
- Latencia: p95 42.79 ms · p99 75.05 ms · max 135.55 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evaluan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (382 ok / 0 fail)

| Contador | Valor |
|---|---|
| data_received | 2069294 |
| data_sent | 35908 |
| iterations | 382 |

| Umbral | Resultado |
|---|---|
| http_req_duration{endpoint:eventos-list}: p(95)<150 | OK |
| http_req_failed: rate<0.01 | OK |
