# k6 — 04-availability

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 166 (5.27 req/s)
- Fallidas: 0.00 %
- Latencia: p95 27.99 ms · p99 132.75 ms · max 296.29 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evaluan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 93.75 % (450 ok / 30 fail)

| Contador | Valor |
|---|---|
| data_sent | 27796 |
| data_received | 106004 |
| iterations | 160 |

| Umbral | Resultado |
|---|---|
| http_req_duration{endpoint:disponibilidad}: p(95)<150 | OK |
| http_req_failed: rate<0.01 | OK |
