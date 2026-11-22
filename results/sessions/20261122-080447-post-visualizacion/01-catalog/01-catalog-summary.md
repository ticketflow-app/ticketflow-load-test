# k6 — 01-catalog

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 51 (2.52 req/s)
- Fallidas: 0.00 %
- Latencia: p95 27.72 ms · p99 41.14 ms · max 45.07 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evaluan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (51 ok / 0 fail)

| Contador | Valor |
|---|---|
| data_sent | 4794 |
| iterations | 51 |
| data_received | 473115 |

| Umbral | Resultado |
|---|---|
| http_req_duration{endpoint:eventos-list}: p(95)<150 | OK |
| http_req_failed: rate<0.01 | OK |
