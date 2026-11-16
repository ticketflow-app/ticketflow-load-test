# k6 — 01-catalog

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 1187 (11.82 req/s)
- Fallidas: 0.00 %
- Latencia: p95 4.37 ms · p99 6.89 ms · max 40.61 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evaluan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (1187 ok / 0 fail)

| Contador | Valor |
|---|---|
| data_received | 10966539 |
| iterations | 1187 |
| data_sent | 111578 |

| Umbral | Resultado |
|---|---|
| http_req_duration{endpoint:eventos-list}: p(95)<150 | OK |
| http_req_failed: rate<0.01 | OK |
