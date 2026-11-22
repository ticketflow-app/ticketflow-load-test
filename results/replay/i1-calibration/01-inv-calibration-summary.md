# k6 — 01-inv-calibration

- Perfil: `local`
- Umbrales: **OK**
- Peticiones: 38211 (1255.57 req/s)
- Fallidas: 0.00 %
- Latencia: p95 20.18 ms · p99 27.07 ms · max 226.21 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evalúan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 99.87 % (76309 ok / 101 fail)

| Contador | Valor |
|---|---|
| data_sent | 6230127 |
| iterations | 38205 |
| data_received | 15814298 |
| http_5xx | 0 |

| Umbral | Resultado |
|---|---|
| http_5xx: count==0 | OK |
| http_req_failed: rate<0.01 | OK |
| checks: rate>0.99 | OK |
| http_req_duration{endpoint:disponibilidad}: p(95)<200 | OK |
