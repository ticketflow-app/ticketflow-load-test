# k6 — 01-inv-calibration

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 319098 (2098.6 req/s)
- Fallidas: 0.00 %
- Latencia: p95 29.31 ms · p99 40.17 ms · max 1368.05 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evalúan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 99.99 % (638090 ok / 94 fail)

| Contador | Valor |
|---|---|
| data_received | 132102248 |
| http_5xx | 0 |
| data_sent | 52014708 |
| iterations | 319092 |

| Umbral | Resultado |
|---|---|
| checks: rate>0.99 | OK |
| http_req_failed: rate<0.01 | OK |
| http_req_duration{endpoint:disponibilidad}: p(95)<200 | OK |
| http_5xx: count==0 | OK |
