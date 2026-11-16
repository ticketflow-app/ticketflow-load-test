# k6 — 01-inv-calibration

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 34096 (1068.75 req/s)
- Fallidas: 0.00 %
- Latencia: p95 3.9 ms · p99 5.68 ms · max 977.95 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evalúan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (68180 ok / 0 fail)

| Contador | Valor |
|---|---|
| iterations | 34090 |
| data_received | 14118542 |
| http_5xx | 0 |
| data_sent | 5559382 |

| Umbral | Resultado |
|---|---|
| checks: rate>0.99 | OK |
| http_req_failed: rate<0.01 | OK |
| http_5xx: count==0 | OK |
| http_req_duration{endpoint:disponibilidad}: p(95)<200 | OK |
