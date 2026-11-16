# k6 — 04-inv-confirm

- Perfil: `local`
- Umbrales: **FALLIDOS**
- Peticiones: 133 (4.85 req/s)
- Fallidas: 72.18 %
- Latencia: p95 16.75 ms · p99 361.08 ms · max 760.57 ms
- _La latencia incluye las peticiones de `setup`; los umbrales se evalúan por endpoint (`http_req_duration{endpoint:...}`)._
- Checks: 8.08 % (8 ok / 91 fail)

| Contador | Valor |
|---|---|
| data_sent | 74745 |
| data_received | 70953 |
| iterations | 97 |
| confirmaciones_ok | 1 |
| confirmaciones_rechazadas | 5 |
| http_5xx | 91 |
| reservas_creadas | 20 |

| Umbral | Resultado |
|---|---|
| http_req_duration{endpoint:confirmar}: p(95)<500 | OK |
| http_req_failed: rate<0.01 | FALLO |
| confirmaciones_ok: count>0 | OK |
| http_5xx: count==0 | FALLO |
| checks: rate>0.99 | FALLO |
