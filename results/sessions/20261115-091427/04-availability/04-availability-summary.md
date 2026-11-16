# k6 — 04-availability

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 467 (4.58 req/s)
- Fallidas: 0.00 %
- Latencia: p95 9.01 ms · p99 20.7 ms · max 582.21 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evaluan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (1383 ok / 0 fail)

| Contador | Valor |
|---|---|
| data_sent | 75053 |
| data_received | 296287 |
| iterations | 461 |

| Umbral | Resultado |
|---|---|
| http_req_failed: rate<0.01 | OK |
| http_req_duration{endpoint:disponibilidad}: p(95)<150 | OK |
