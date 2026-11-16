# k6 — 01-catalog

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 1181 (11.72 req/s)
- Fallidas: 0.00 %
- Latencia: p95 9.79 ms · p99 22.98 ms · max 2914.92 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evaluan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (1181 ok / 0 fail)

| Contador | Valor |
|---|---|
| iterations | 1181 |
| data_received | 10911147 |
| data_sent | 111014 |

| Umbral | Resultado |
|---|---|
| http_req_duration{endpoint:eventos-list}: p(95)<150 | OK |
| http_req_failed: rate<0.01 | OK |
