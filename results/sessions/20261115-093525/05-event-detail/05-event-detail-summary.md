# k6 — 05-event-detail

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 1194 (11.87 req/s)
- Fallidas: 0.00 %
- Latencia: p95 3.77 ms · p99 7.68 ms · max 192.19 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evaluan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (4752 ok / 0 fail)

| Contador | Valor |
|---|---|
| iterations | 1188 |
| data_received | 1666189 |
| data_sent | 158261 |

| Umbral | Resultado |
|---|---|
| http_req_failed: rate<0.01 | OK |
| http_req_duration{endpoint:evento-detalle}: p(95)<120 | OK |
