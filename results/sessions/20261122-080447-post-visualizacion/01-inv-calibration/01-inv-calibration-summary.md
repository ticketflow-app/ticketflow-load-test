# k6 — 01-inv-calibration

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 29033 (959.9 req/s)
- Fallidas: 0.00 %
- Latencia: p95 4.66 ms · p99 6.61 ms · max 168.99 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evalúan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 99.43 % (57722 ok / 332 fail)

| Contador | Valor |
|---|---|
| iterations | 29027 |
| data_sent | 4734113 |
| http_5xx | 0 |
| data_received | 11996819 |

| Umbral | Resultado |
|---|---|
| http_5xx: count==0 | OK |
| http_req_failed: rate<0.01 | OK |
| checks: rate>0.99 | OK |
| http_req_duration{endpoint:disponibilidad}: p(95)<200 | OK |
