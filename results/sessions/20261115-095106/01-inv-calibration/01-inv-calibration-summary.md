# k6 — 01-inv-calibration

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 498696 (3317.46 req/s)
- Fallidas: 0.00 %
- Latencia: p95 18.69 ms · p99 25.33 ms · max 966.48 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evalúan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (997380 ok / 0 fail)

| Contador | Valor |
|---|---|
| data_received | 206462942 |
| iterations | 498690 |
| data_sent | 81289182 |
| http_5xx | 0 |

| Umbral | Resultado |
|---|---|
| http_req_failed: rate<0.01 | OK |
| http_req_duration{endpoint:disponibilidad}: p(95)<200 | OK |
| checks: rate>0.99 | OK |
| http_5xx: count==0 | OK |
