# k6 — 01-inv-calibration

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 32880 (1081.2 req/s)
- Fallidas: 0.00 %
- Latencia: p95 3.81 ms · p99 4.91 ms · max 348.14 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evalúan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 100.00 % (65748 ok / 0 fail)

| Contador | Valor |
|---|---|
| data_sent | 5361174 |
| iterations | 32874 |
| http_5xx | 0 |
| data_received | 13615118 |

| Umbral | Resultado |
|---|---|
| http_req_failed: rate<0.01 | OK |
| http_5xx: count==0 | OK |
| http_req_duration{endpoint:disponibilidad}: p(95)<200 | OK |
| checks: rate>0.99 | OK |
