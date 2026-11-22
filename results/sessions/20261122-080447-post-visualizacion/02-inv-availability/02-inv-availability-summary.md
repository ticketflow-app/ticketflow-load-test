# k6 — 02-inv-availability

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 54 (2.48 req/s)
- Fallidas: 0.00 %
- Latencia: p95 22.23 ms · p99 184.18 ms · max 358.92 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evalúan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (88 ok / 0 fail)

| Contador | Valor |
|---|---|
| data_received | 24898 |
| iterations | 44 |
| data_sent | 10543 |
| http_5xx | 0 |

| Umbral | Resultado |
|---|---|
| checks: rate>0.99 | OK |
| http_req_duration{endpoint:disponibilidad}: p(95)<100 | OK |
| http_5xx: count==0 | OK |
| http_req_failed: rate<0.01 | OK |
