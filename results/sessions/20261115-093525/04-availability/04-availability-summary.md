# k6 — 04-availability

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 468 (4.64 req/s)
- Fallidas: 0.00 %
- Latencia: p95 6.42 ms · p99 13.49 ms · max 193.77 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evaluan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (1386 ok / 0 fail)

| Contador | Valor |
|---|---|
| data_sent | 75210 |
| iterations | 462 |
| data_received | 296726 |

| Umbral | Resultado |
|---|---|
| http_req_failed: rate<0.01 | OK |
| http_req_duration{endpoint:disponibilidad}: p(95)<150 | OK |
