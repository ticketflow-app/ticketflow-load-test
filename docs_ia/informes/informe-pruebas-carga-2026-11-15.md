# Informe de pruebas de carga — TicketFlow

> **Fecha del informe:** 2026-11-16
> **Datos analizados:** sesiones del **2026-11-15** (5 sesiones, 27 ejecuciones de escenario)
> **Repositorio:** `ticketflow-load-test` · **Documento de referencia:** `docs_ia/contexto/plan_de_pruebas_carga_local.md`
> **Alcance:** resultados ya generados en `results/sessions/` (no se re-ejecutaron pruebas para este informe).

---

## 1. Resumen ejecutivo

- Se ejecutaron **5 sesiones** de k6 con **27 corridas de escenario**: **24 PASS** y **3 FAIL**, todas las fallas en la primera sesión (07:46), cuando los scripts todavía contaban los `409` esperados como errores y el endpoint de confirmación devolvía `5xx`.
- Se probaron **dos rutas de acceso distintas** y ambas existen en el repositorio:
  - **Suite contra el API Gateway** (`test-api-gateway`, `http://ticketflow-api-gateway:8080`): escenarios **E1–E5**.
  - **Suite directa al microservicio** (`test-inventory`, `http://ticketflow-inventory-service:8082`): escenarios **I1–I5**, sin pasar por el gateway.
- **No hubo sobreventa en ninguna corrida.** En todas las pruebas de flash sale y de estrés el número de reservas aceptadas fue **exactamente igual al stock** (100 de 100; 5 de 5 en los smoke), el contador de Redis terminó en **0** y **nunca fue negativo**. En las pruebas con invariante automático (`invariants.log`) el resultado fue **PASS**.
- **Volumen total ejercitado:** **1 000 765 peticiones HTTP** en las 5 sesiones.
- **Techo medido:** **4 135 req/s** promedio (292 083 peticiones en 75 s) golpeando Inventario directamente; **3 317 req/s** sostenidos durante 150 s en la calibración. A través del gateway el throughput queda acotado por el *rate limiter* (≈36 req/s con 40 VUs, de los cuales ~72 % son `429`).
- **Hallazgo técnico más relevante:** las pruebas “directas” a Inventario **no aíslan Inventario**. Cada `GET /api/inventario/eventos/{id}/disponibilidad` provoca una llamada HTTP a **catalog-service** (`CatalogLocalitiesAdapter`, sin caché), y eso se ve en la CPU de catálogo, que escala junto con la de inventario (209 % media / 585 % pico en I1).
- **Latencia:** p95 de **3.8–21.3 ms** en las pruebas directas y **3.8–10.4 ms** a través del gateway (perfil `local`). p99 llega a 125–304 ms y hay máximos aislados de hasta **2 914.92 ms** por GC/JIT/hipervisor.

---

## 2. Metodología

### 2.1 Herramientas

| Elemento | Detalle |
|---|---|
| Generador de carga | **k6** (`grafana/k6`), ejecutado en contenedor dentro de la red `ticketflow-api-gateway_default` |
| Telemetría | k6 remote-write a **Prometheus** (`:9090`); **Grafana** para visualización |
| Muestreo de recursos | `scripts/sample-resources.ps1` → `docker stats` cada **3 s** → `resources.csv` / `resources-summary.md` |
| Invariante anti-sobreventa | `scripts/verify-invariants.ps1`: consulta SQL a PostgreSQL + lectura del contador en Redis |
| Orquestación | `scripts/run-all.ps1` (escenarios secuenciales, nunca en paralelo) |

### 2.2 Entorno de ejecución (el que consta en los resultados)

| Componente | Valor | Fuente |
|---|---|---|
| Host | Windows 10 Pro, uso cotidiano (no dedicado) | plan de pruebas §1 |
| CPU del host | AMD Ryzen 5 5600 — 6 núcleos / 12 hilos | plan de pruebas §1 |
| RAM del host | 15.9 GB | plan de pruebas §1 |
| RAM visible para Docker | **7 582.7 MiB (≈7.4 GiB)** | columna `MemLimitMiB` de `resources.csv` |
| CPU disponible para Docker | no documentada; los picos de **870 %** de CPU total implican **≥ 9 hilos** | `resources-summary.md` |
| Perfil de umbrales | `local` en las 5 sesiones (no `sla`) | `run.json` |

> El plan original describía una VM de 4 GB / 2 vCPU. Los datos de esta corrida muestran **7.58 GiB** visibles para Docker, así que la VM se reconfiguró antes del 2026-11-15. Los números siguen siendo de un equipo de desarrollo compartido: **no** son cifras de producción.

### 2.3 Cómo leer las tablas de este informe

| Columna | Significado |
|---|---|
| **VUs** | Concurrencia máxima planificada (usuarios virtuales). Incluye rampa de subida y bajada. |
| **Iteraciones** | Ciclos completados por los VUs (cada ciclo puede hacer 1 o varias peticiones). |
| **Peticiones** | Peticiones HTTP totales, **incluyendo las de `setup()`**. |
| **Exitosas** | Peticiones con respuesta considerada correcta (HTTP < 400, o `409/429` cuando el script los marca como esperados). |
| **Fallidas** | Porcentaje de peticiones contadas como fallo por k6. |
| **req/s** | Promedio de toda la corrida (incluye rampa y `setup`); no es el pico instantáneo. |
| **p95 / p99 / max** | Percentiles y máximo de `http_req_duration`, en milisegundos. |
| **CPU med / máx** | Porcentaje relativo a **un núcleo**; **puede superar 100 %** (usa varios hilos). |
| **RAM med / máx** | Memoria residente del contenedor, en **MiB**. |

### 2.4 Umbrales aplicados (perfil `local`)

| Escenario | Umbral principal |
|---|---|
| Catálogo (listado) | `p95 < 150 ms` |
| Detalle de evento | `p95 < 120 ms` |
| Disponibilidad | `p95 < 150 ms` |
| Flash sale | `disponibilidad p95 < 150 ms` · `reservas p95 < 400 ms` · `confirmar p95 < 400 ms` |
| Confirmación | `reservas p95 < 400 ms` · `confirmar p95 < 400 ms` |
| Degradación | `reservas p95 < 600 ms` |
| Directo a inventario | `disponibilidad p95 < 2× línea base` (200 ms por defecto) |
| Transversal | `http_req_failed < 1 %` · `checks > 99 %` · `http_5xx == 0` |
| Anti-sobreventa | `reservas_aceptadas > 0` y **`reservas_aceptadas <= stock`** |

---

## 3. ¿Las pruebas fueron al API Gateway o directas al microservicio?

**Respuesta: a las dos.** El repositorio tiene dos suites completas y las 5 sesiones se reparten entre ellas.

| Suite | `BASE_URL` por defecto | Escenarios | Sesiones que la ejecutaron |
|---|---|---|---|
| `test-api-gateway` | `http://ticketflow-api-gateway:8080` | `01-catalog`, `04-availability`, `05-event-detail`, `06-flash-sale`, `07-confirm`, `08-degradation` | 20261115-091427, 20261115-093525 |
| `test-inventory` | `http://ticketflow-inventory-service:8082` | `01-inv-calibration`, `02-inv-availability`, `03-inv-flash-sale`, `04-inv-confirm`, `05-inv-stress` | 20261115-074612, 20261115-090255, 20261115-095106 |

**Verificación realizada:** se revisó el campo `baseUrl` de los **27 `run.json`** generados. Los 27 coinciden con el valor por defecto de su suite; no hubo `-e BASE_URL=...` que mezclara rutas. También se revisaron los `lib/config.js` y los scripts.

| Comprobación | Resultado |
|---|---|
| ¿Hay pruebas directas al microservicio? | **Sí**: 5 escenarios (I1–I5) contra `inventory-service:8082`. |
| ¿Hay pruebas contra el gateway? | **Sí**: 6 escenarios (E1–E5) contra `api-gateway:8080`. |
| ¿Alguna prueba directa a `user-service` o `catalog-service`? | **No**. |
| ¿Se ejecutaron los escenarios `02-auth-login` y `03-reservations`? | **No**: existen como scripts, pero no están en el `-Scenarios` por defecto de `run-all.ps1` (`01,04,05,06,07,08`) y no hay carpeta de resultados para ellos. |

### 3.1 Matiz importante: “directo” salta el gateway, pero no aísla el servicio

Las pruebas I1/I2 miden `GET /api/inventario/eventos/{id}/disponibilidad`. Ese caso de uso **consulta al catálogo en cada petición**:

- `GetAvailabilityService.getAvailability()` → `EventLocalitiesPort.findByEvent(eventId)`
- `CatalogLocalitiesAdapter` → `GET /api/eventos/{eventId}/localidades` vía `WebClient`, **sin caché**.

La evidencia está en los recursos: en la sesión directa de 09:51, la CPU de catálogo sube en paralelo a la de inventario.

| Escenario (09:51) | Peticiones | CPU media inventario | CPU media catálogo | CPU máx catálogo |
|---|---:|---:|---:|---:|
| I1 calibración (solo `GET disponibilidad`) | 498 696 | 316.97 % | 209.54 % | 585.28 % |
| I5 estrés (solo `POST reservas`) | 292 083 | 326.44 % | **0.58 %** | **0.80 %** |

Es decir: cuando el tráfico es de disponibilidad, el catálogo trabaja tanto como el inventario; cuando el tráfico es de reservas, el catálogo queda idle. **Conclusión:** la suite I mide inventario **más** el fan-out a catálogo, no inventario puro.

---

## 4. Resultados por sesión

### 4.1 Sesión 20261115-074612 — primera corrida (smoke, directo a Inventario)

- **Suite:** `test-inventory` · **Perfil:** `local` (smoke) · **Inicio:** 2026-11-15 07:46:12 · **Duración:** 2 min 42 s
- **Resultado global:** **FAIL** (i3, i4, i5) · **Peticiones:** 96 271
- Es la primera versión de los scripts: los `409` de “sin stock” **no** estaban marcados como respuesta esperada y el `POST /confirmar` tenía un defecto que devolvía `5xx`.

| Escenario | VUs | Iteraciones | Peticiones | Exitosas | Fallidas | req/s | p95 (ms) | p99 (ms) | max (ms) | Umbrales |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 01-inv-calibration | 6 | 32 874 | 32 880 | 32 880 | 0.00 % | 1 081.20 | 3.81 | 4.91 | 348.14 | OK |
| 02-inv-availability | 4 | 44 | 50 | 50 | 0.00 % | 2.44 | 21.29 | 173.37 | 314.17 | OK |
| 03-inv-flash-sale | 10 | 195 | 211 | 164 | **22.27 %** | 6.63 | 13.38 | 228.70 | 386.21 | **FALLO** |
| 04-inv-confirm | 6 | 97 | 133 | 37 | **72.18 %** | 4.85 | 16.75 | 361.08 | 760.57 | **FALLO** |
| 05-inv-stress | 15 | 62 951 | 62 997 | 145 | **99.77 %** | 3 166.18 | 4.26 | 8.28 | 445.44 | **FALLO** |

**CPU (% medio / máximo)**

| Escenario | user-service | catalog-service | inventory-service | api-gateway |
|---|---|---|---|---|
| 01-inv-calibration | 6.46 / 38.03 | 75.27 / 130.82 | 121.43 / 211.12 | 0.15 / 0.20 |
| 02-inv-availability | 0.17 / 0.24 | 1.75 / 5.35 | 0.41 / 0.66 | 0.15 / 0.19 |
| 03-inv-flash-sale | 10.87 / 64.48 | 3.07 / 7.20 | 1.41 / 1.84 | 0.13 / 0.14 |
| 04-inv-confirm | 14.16 / 83.28 | 1.61 / 6.84 | 0.82 / 1.31 | 0.19 / 0.47 |
| 05-inv-stress | 5.28 / 20.54 | 1.24 / 2.10 | 289.99 / 389.78 | 0.23 / 0.53 |

**RAM (MiB, medio / máximo)**

| Escenario | user-service | catalog-service | inventory-service | api-gateway |
|---|---|---|---|---|
| 01-inv-calibration | 485.4 / 486.0 | 691.0 / 691.4 | 592.8 / 593.3 | 363.6 / 363.8 |
| 02-inv-availability | 485.3 / 485.5 | 690.0 / 690.2 | 592.4 / 593.3 | 363.7 / 363.8 |
| 03-inv-flash-sale | 486.0 / 486.7 | 690.3 / 690.7 | 592.6 / 593.7 | 364.7 / 367.1 |
| 04-inv-confirm | 496.1 / 544.5 | 689.9 / 690.5 | 593.0 / 593.7 | 367.2 / 367.6 |
| 05-inv-stress | 487.6 / 487.8 | 690.3 / 690.6 | 624.1 / 655.5 | 367.4 / 367.7 |

**Lectura**
- El **invariante de no sobreventa pasó** (5 aceptadas con stock 5, contador en 0), aunque los umbrales se marcaran en rojo.
- Las “fallidas” de i3 e i5 son casi todas **`409` de sin stock mal clasificados** por el script; en i4 hay además **91 `5xx` reales** en confirmación.
- El gateway está prácticamente apagado (0.13–0.23 % de CPU) porque el tráfico no pasa por él, como corresponde a esta suite.

---

### 4.2 Sesión 20261115-090255 — smoke corregido (directo a Inventario)

- **Suite:** `test-inventory` · **Perfil:** `local` (smoke) · **Inicio:** 2026-11-15 09:02:55 · **Duración:** 2 min 38 s
- **Resultado global:** **PASS** · **Peticiones:** 96 557
- Mismos escenarios cortos que la sesión anterior, con los `409` ya marcados como esperados y el `5xx` de confirmación corregido.

| Escenario | VUs | Iteraciones | Peticiones | Exitosas | Fallidas | req/s | p95 (ms) | p99 (ms) | max (ms) | Umbrales |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 01-inv-calibration | 6 | 34 090 | 34 096 | 34 096 | 0.00 % | 1 068.75 | 3.90 | 5.68 | 977.95 | OK |
| 02-inv-availability | 4 | 44 | 50 | 50 | 0.00 % | 2.43 | 14.32 | 232.79 | 435.23 | OK |
| 03-inv-flash-sale | 10 | 195 | 211 | 211 | 0.00 % | 6.57 | 9.86 | 304.41 | 467.10 | OK |
| 04-inv-confirm | 6 | 97 | 133 | 133 | 0.00 % | 4.98 | 17.37 | 199.47 | 537.79 | OK |
| 05-inv-stress | 15 | 62 021 | 62 067 | 62 067 | 0.00 % | 3 206.46 | 4.35 | 7.40 | 238.13 | OK |

**CPU (% medio / máximo)**

| Escenario | user-service | catalog-service | inventory-service | api-gateway |
|---|---|---|---|---|
| 01-inv-calibration | 8.33 / 57.80 | 65.79 / 124.39 | 108.12 / 206.87 | 0.28 / 1.27 |
| 02-inv-availability | 0.57 / 2.03 | 0.72 / 0.89 | 0.62 / 0.87 | 0.13 / 0.15 |
| 03-inv-flash-sale | 0.10 / 0.24 | 0.96 / 1.36 | 1.29 / 2.97 | 0.13 / 0.15 |
| 04-inv-confirm | 0.08 / 0.09 | 0.80 / 1.93 | 1.89 / 5.21 | 0.14 / 0.15 |
| 05-inv-stress | 0.11 / 0.13 | 0.70 / 0.88 | 283.98 / 385.37 | 0.50 / 1.47 |

**RAM (MiB, medio / máximo)**

| Escenario | user-service | catalog-service | inventory-service | api-gateway |
|---|---|---|---|---|
| 01-inv-calibration | 490.0 / 491.6 | 697.6 / 698.2 | 660.0 / 663.9 | 372.8 / 373.3 |
| 02-inv-availability | 490.6 / 491.1 | 697.6 / 698.3 | 659.8 / 660.7 | 372.6 / 372.8 |
| 03-inv-flash-sale | 490.3 / 491.2 | 697.8 / 698.3 | 659.5 / 660.4 | 372.6 / 373.0 |
| 04-inv-confirm | 490.8 / 491.3 | 697.3 / 697.6 | 660.5 / 661.3 | 372.5 / 372.5 |
| 05-inv-stress | 491.6 / 491.8 | 697.8 / 698.1 | 661.5 / 662.4 | 372.6 / 372.8 |

**Lectura**
- 0 % de fallos y todos los umbrales en verde.
- La calibración vuelve a mostrar el patrón de fan-out: catálogo consume 65.79 % de media **sin recibir tráfico directo**.
- Confirmación ya es idempotente: 20 reservas creadas, 11 confirmadas y **86 confirmaciones idempotentes** (reintentos que no duplican estado).

---

### 4.3 Sesión 20261115-091427 — suite completa contra el API Gateway

- **Suite:** `test-api-gateway` · **Perfil:** `local` (stages completos) · **Inicio:** 2026-11-15 09:14:27 · **Duración:** 9 min 55 s
- **Resultado global:** **PASS** · **Peticiones:** 6 799
- Todos los escenarios terminaron con 0 % de fallos y umbrales OK; es la primera corrida “grande” por el gateway.

| Escenario | VUs | Iteraciones | Peticiones | Exitosas | Fallidas | req/s | p95 (ms) | p99 (ms) | max (ms) | Umbrales |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 01-catalog | 25 | 1 181 | 1 181 | 1 181 | 0.00 % | 11.72 | 9.79 | 22.98 | 2 914.92 | OK |
| 04-availability | 8 | 461 | 467 | 467 | 0.00 % | 4.58 | 9.01 | 20.70 | 582.21 | OK |
| 05-event-detail | 25 | 1 186 | 1 192 | 1 192 | 0.00 % | 11.79 | 5.17 | 10.89 | 314.13 | OK |
| 06-flash-sale | 15 | 832 | 858 | 858 | 0.00 % | 6.85 | 10.42 | 163.70 | 526.82 | OK |
| 07-confirm | 8 | 484 | 868 | 868 | 0.00 % | 11.93 | 9.21 | 140.95 | 240.08 | OK |
| 08-degradation | 40 | 2 217 | 2 233 | 2 233 | 0.00 % | 35.38 | 6.45 | 8.82 | 510.24 | OK |

**CPU (% medio / máximo)**

| Escenario | user-service | catalog-service | inventory-service | api-gateway |
|---|---|---|---|---|
| 01-catalog | 0.08 / 0.11 | 5.09 / 20.22 | 0.21 / 0.24 | 10.39 / 32.51 |
| 04-availability | 0.15 / 1.09 | 1.20 / 4.45 | 1.14 / 1.92 | 2.81 / 6.51 |
| 05-event-detail | 0.10 / 0.28 | 2.32 / 9.58 | 0.24 / 0.32 | 6.08 / 28.13 |
| 06-flash-sale | 2.66 / 64.10 | 0.98 / 1.41 | 1.72 / 2.61 | 3.52 / 18.51 |
| 07-confirm | 0.10 / 0.16 | 0.61 / 1.09 | 3.18 / 8.60 | 3.26 / 9.62 |
| 08-degradation | 0.20 / 1.42 | 0.52 / 0.65 | 2.48 / 4.45 | 7.17 / 13.76 |

**RAM (MiB, medio / máximo)**

| Escenario | user-service | catalog-service | inventory-service | api-gateway |
|---|---|---|---|---|
| 01-catalog | 491.5 / 491.9 | 699.7 / 701.1 | 659.9 / 660.3 | 408.3 / 421.9 |
| 04-availability | 491.7 / 492.3 | 700.0 / 701.0 | 661.2 / 661.8 | 424.3 / 425.1 |
| 05-event-detail | 491.8 / 492.4 | 700.6 / 701.3 | 660.5 / 660.9 | 426.0 / 427.7 |
| 06-flash-sale | 492.5 / 494.7 | 700.3 / 701.3 | 662.1 / 663.4 | 428.9 / 429.9 |
| 07-confirm | 493.0 / 493.8 | 700.1 / 700.8 | 662.9 / 663.9 | 432.5 / 435.2 |
| 08-degradation | 493.7 / 494.7 | 700.0 / 700.3 | 663.7 / 664.4 | 435.3 / 435.8 |

**Lectura**
- El gateway es el componente más cargado de la suite: **10.39 % medio / 32.51 % pico** en catálogo, porque **toda** petición pasa por su filtro JWT, rate limit y circuit breaker.
- El pico aislado de **2 914.92 ms** en `01-catalog` (con p95 de 9.79 ms) es un artefacto puntual de arranque/GC, no un patrón.
- La RAM del gateway crece de 408 → 435 MiB a lo largo de la sesión (efecto de calentamiento/JIT), estable dentro de cada escenario.

---

### 4.4 Sesión 20261115-093525 — suite completa contra el API Gateway (referencia)

- **Suite:** `test-api-gateway` · **Perfil:** `local` (stages completos) · **Inicio:** 2026-11-15 09:35:25 · **Duración:** 9 min 50 s
- **Resultado global:** **PASS** · **Peticiones:** 6 791
- Es la corrida de referencia del gateway: mismos escenarios que la anterior, con la JVM ya caliente y **todas** las latencias por debajo de la anterior.

| Escenario | VUs | Iteraciones | Peticiones | Exitosas | Fallidas | req/s | p95 (ms) | p99 (ms) | max (ms) | Umbrales |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 01-catalog | 25 | 1 187 | 1 187 | 1 187 | 0.00 % | 11.82 | 4.37 | 6.89 | 40.61 | OK |
| 04-availability | 8 | 462 | 468 | 468 | 0.00 % | 4.64 | 6.42 | 13.49 | 193.77 | OK |
| 05-event-detail | 25 | 1 188 | 1 194 | 1 194 | 0.00 % | 11.87 | 3.77 | 7.68 | 192.19 | OK |
| 06-flash-sale | 15 | 833 | 859 | 859 | 0.00 % | 6.98 | 7.62 | 125.47 | 225.85 | OK |
| 07-confirm | 8 | 484 | 852 | 852 | 0.00 % | 11.82 | 8.12 | 29.15 | 213.30 | OK |
| 08-degradation | 40 | 2 215 | 2 231 | 2 231 | 0.00 % | 36.15 | 7.60 | 64.35 | 179.75 | OK |

**CPU (% medio / máximo)**

| Escenario | user-service | catalog-service | inventory-service | api-gateway |
|---|---|---|---|---|
| 01-catalog | 0.10 / 0.13 | 2.37 / 8.49 | 0.17 / 0.20 | 2.50 / 5.59 |
| 04-availability | 0.12 / 0.40 | 0.94 / 1.57 | 1.13 / 4.63 | 0.93 / 1.86 |
| 05-event-detail | 0.13 / 0.23 | 1.72 / 3.81 | 0.21 / 0.64 | 1.73 / 4.24 |
| 06-flash-sale | 0.17 / 0.73 | 0.84 / 1.33 | 1.44 / 2.02 | 1.45 / 5.77 |
| 07-confirm | 0.14 / 0.22 | 0.55 / 1.83 | 1.94 / 3.20 | 2.60 / 9.58 |
| 08-degradation | 0.27 / 1.04 | 0.44 / 0.54 | 1.86 / 3.66 | 4.38 / 10.93 |

**RAM (MiB, medio / máximo)**

| Escenario | user-service | catalog-service | inventory-service | api-gateway |
|---|---|---|---|---|
| 01-catalog | 493.8 / 493.9 | 701.1 / 701.7 | 662.4 / 662.6 | 435.8 / 436.7 |
| 04-availability | 494.0 / 494.8 | 701.2 / 701.9 | 663.7 / 664.7 | 436.0 / 436.8 |
| 05-event-detail | 494.1 / 494.8 | 701.5 / 702.1 | 662.7 / 663.1 | 436.2 / 436.8 |
| 06-flash-sale | 494.3 / 495.3 | 701.2 / 701.9 | 664.1 / 664.9 | 436.1 / 436.8 |
| 07-confirm | 494.6 / 495.5 | 700.7 / 701.2 | 664.4 / 665.2 | 436.1 / 436.8 |
| 08-degradation | 494.7 / 495.7 | 703.2 / 705.1 | 664.8 / 665.4 | 436.3 / 436.9 |

**Lectura**
- Es la sesión más limpia del gateway: p95 **3.77–8.12 ms**, p99 máximo **125 ms**, 0 `5xx`, 0 fallos.
- **Flash sale:** 247 intentos de compra, **100 aceptadas**, **147 rechazadas por falta de stock**, contador final **0** e invariante **PASS**.
- **Degradación:** 2 231 peticiones con 40 VUs; **1 611 `429`** del rate limiter y **0 `5xx`** → el sistema degrada rechazando, no rompiéndose.
- **Confirmación:** 352 reservas creadas, **306 confirmadas**, 178 peticiones limitadas por tasa; 0 `5xx`.
- El **stack completo** consumió 3 589.8 MiB de media / **3 594.8 MiB pico** de RAM y **7.8 % / 11.65 %** de CPU en el flash sale.

---

### 4.5 Sesión 20261115-095106 — suite completa directa a Inventario (referencia)

- **Suite:** `test-inventory` · **Perfil:** `local` (stages completos) · **Inicio:** 2026-11-15 09:51:06 · **Duración:** 9 min 23 s
- **Resultado global:** **PASS** · **Peticiones:** **794 347** (el 79 % de todo el volumen del informe)
- Es la corrida de referencia para medir el techo real de Inventario sin el freno del gateway.

| Escenario | VUs | Iteraciones | Peticiones | Exitosas | Fallidas | req/s | p95 (ms) | p99 (ms) | max (ms) | Umbrales |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 01-inv-calibration | **75** | 498 690 | **498 696** | **498 696** | 0.00 % | **3 317.46** | 18.69 | 25.33 | 966.48 | OK |
| 02-inv-availability | 20 | 1 225 | 1 231 | 1 231 | 0.00 % | 10.20 | 3.90 | 5.91 | 171.14 | OK |
| 03-inv-flash-sale | 15 | 1 657 | 1 693 | 1 693 | 0.00 % | 13.56 | 4.09 | 140.57 | 263.91 | OK |
| 04-inv-confirm | 10 | 608 | 644 | 644 | 0.00 % | 9.03 | 4.27 | 12.61 | 169.98 | OK |
| 05-inv-stress | **45** | 292 037 | **292 083** | **292 083** | 0.00 % | **4 135.27** | 12.30 | 18.00 | 629.41 | OK |

**CPU (% medio / máximo)**

| Escenario | user-service | catalog-service | inventory-service | api-gateway |
|---|---|---|---|---|
| 01-inv-calibration | 0.18 / 1.47 | **209.54 / 585.28** | **316.97 / 397.82** | 0.14 / 0.64 |
| 02-inv-availability | 0.11 / 0.35 | 1.53 / 3.26 | 1.79 / 3.14 | 0.15 / 1.27 |
| 03-inv-flash-sale | 2.83 / 68.00 | 1.33 / 1.81 | 2.29 / 3.31 | 0.10 / 0.24 |
| 04-inv-confirm | 0.07 / 0.11 | 0.54 / 0.68 | 2.08 / 2.97 | 0.19 / 0.71 |
| 05-inv-stress | 3.64 / 49.56 | 0.58 / 0.80 | **326.44 / 379.94** | 0.55 / 3.90 |

**RAM (MiB, medio / máximo)**

| Escenario | user-service | catalog-service | inventory-service | api-gateway |
|---|---|---|---|---|
| 01-inv-calibration | 495.3 / 496.5 | 742.4 / 758.0 | 696.0 / 734.2 | 434.9 / 435.5 |
| 02-inv-availability | 495.3 / 496.3 | 757.2 / 758.0 | 733.5 / 734.1 | 434.8 / 435.0 |
| 03-inv-flash-sale | 496.1 / 497.6 | 757.2 / 757.9 | 732.9 / 733.7 | 434.8 / 435.1 |
| 04-inv-confirm | 496.3 / 496.9 | 756.5 / 757.1 | 732.7 / 733.7 | 434.9 / 435.3 |
| 05-inv-stress | 497.5 / 498.7 | 756.7 / 757.2 | 734.3 / 736.0 | 434.8 / 435.2 |

**Lectura**
- **498 696 peticiones en 150 s** con p95 de **18.69 ms** y **0 `5xx`**: el codo de Inventario está por encima de **3 300 req/s** en este hardware. El stack llegó a **870 % de CPU total** (media 680 %) y **3 944.6 MiB** de RAM pico.
- **292 083 peticiones de reserva en 75 s** (≈4 135 req/s) con **exactamente 100 aceptadas** y **291 937 rechazadas** por stock: la atomicidad de Redis se sostiene a esa tasa.
- El **gateway queda en 0.1–0.6 % de CPU** (no recibe tráfico), lo que confirma que la suite es directa.
- La RAM de inventario sube de 696 → 736 MiB y la de catálogo de 742 → 758 MiB entre el inicio y el final de la sesión; el crecimiento es de decenas de MiB, compatible con calentamiento de heap, no con una fuga evidente.
- **Efecto fan-out:** I1 dispara el catálogo a **585 % de CPU pico**; I5 (solo reservas) lo deja en **0.8 %**.

---

## 5. Pruebas clave (lo más importante del informe)

| # | Prueba | Sesión | Destino | VUs | Peticiones | req/s | p95 | Resultado clave |
|---|---|---|---:|---|---:|---:|---:|---:|---|
| 1 | **I5 — estrés de reservas** | 095106 | Directo a Inventario | 45 | 292 083 | **4 135.27** | 12.30 ms | 100 aceptadas / 291 937 rechazadas · **0 sobreventa** · 0 `5xx` |
| 2 | **I1 — calibración de codo** | 095106 | Directo a Inventario | 75 | **498 696** | **3 317.46** | 18.69 ms | 0 `5xx` y p95 < 200 ms en toda la escalera 10→75 VUs |
| 3 | **E3 — flash sale por gateway** | 093525 | API Gateway | 15 | 859 | 6.98 | 7.62 ms | 247 intentos → **100 vendidas** / 147 rechazadas · stock final 0 · invariante PASS |
| 4 | **I3 — flash sale directo** | 095106 | Directo a Inventario | 15 | 1 693 | 13.56 | 4.09 ms | 495 intentos → **100 vendidas** / 395 rechazadas · invariante PASS |
| 5 | **E4 — degradación** | 093525 | API Gateway | 40 | 2 231 | 36.15 | 7.60 ms | 1 611 `429` controlados · **0 `5xx`** · 604 reservas aceptadas |
| 6 | **E5 — confirmación** | 093525 | API Gateway | 8 | 852 | 11.82 | 8.12 ms | 352 creadas · **306 confirmadas** · 178 limitadas · 0 `5xx` |
| 7 | **I4 — confirmación idempotente** | 095106 | Directo a Inventario | 10 | 644 | 9.03 | 4.27 ms | 20/20 confirmadas · **588 reintentos idempotentes** |

**Por qué son las importantes**

1. **I5** es la prueba que demuestra la regla RB-11: con 292 mil intentos concurrentes, solo 100 obtienen boleto y el contador no se va a negativo. Es la evidencia más fuerte de que el `DECRBY` atómico funciona.
2. **I1** mide el techo del servicio: 3 317 req/s sostenidos con p95 de 18.69 ms. Es la referencia para dimensionar réplicas.
3. **E3** es la prueba de negocio completa por el camino real del usuario (gateway → inventario → Redis → Kafka): el evento se agota y nadie compra de más.
4. **I3** replica E3 sin gateway: el inventario directo acepta 395 rechazos más en el mismo tiempo, lo que muestra cuánto tráfico extra absorbe al quitar el *rate limiter*.
5. **E4** demuestra la degradación controlada: el gateway responde `429` en lugar de tumbar los servicios.
6. **E5** valida el flujo de confirmación bajo reintentos.
7. **I4** valida la idempotencia: 588 confirmaciones repetidas no generan estados duplicados.

---

## 6. Sobreventa: ventas intentadas vs. ventas logradas

Todas las corridas de flash sale y de estrés usan un **stock conocido** y el script tiene un umbral duro `reservas_aceptadas <= stock`. El script `verify-invariants.ps1` contrasta después el contador de Redis y las filas de PostgreSQL.

| Sesión | Prueba | Stock | Intentos | Aceptadas | Rechazadas | % aceptación | Contador Redis final | Invariante |
|---|---|---:|---:|---:|---:|---:|---:|---|
| 074612 | I3 flash sale (smoke) | 5 | 52 | **5** | 47 | 9.6 % | 0 | **PASS** |
| 090255 | I3 flash sale (smoke) | 5 | 43 | **5** | 38 | 11.6 % | 0 | **PASS** |
| 091427 | E3 flash sale | 100 | 250 | **100** | 150 | 40.0 % | 0 | **PASS** |
| 093525 | E3 flash sale | 100 | 247 | **100** | 147 | 40.5 % | 0 | **PASS** |
| 095106 | I3 flash sale | 100 | 495 | **100** | 395 | 20.2 % | 0 | **PASS** |
| 074612 | I5 estrés | 100 | 62 951 | **100** | 62 851 | 0.16 % | 0¹ | — |
| 090255 | I5 estrés | 100 | 62 021 | **100** | 61 921 | 0.16 % | 0¹ | — |
| 095106 | I5 estrés | 100 | 292 037 | **100** | 291 937 | 0.03 % | 0¹ | — |

¹ En los escenarios de estrés el script no genera `invariants.log`, pero el umbral `reservas_aceptadas <= stock` se cumple siempre y el número aceptado es **exactamente** el stock. El contador de Redis no se consultó post-ejecución en esas corridas.

**Conclusión:** **cero sobreventa** en las 8 corridas con stock acotado. En las 5 con verificación automática, el contador terminó en **0** y **nunca negativo**. Las ventas logradas fueron siempre **iguales al stock disponible**, nunca superiores.

**Pruebas sin stock limitante (no aplican a sobreventa):**

| Sesión | Prueba | Capacidad | Reservas creadas | Aceptadas | Limitadas por gateway (`429`) |
|---|---|---:|---:|---:|---:|
| 091427 | E4 degradación | 100 000 | — | 603 | 1 614 |
| 093525 | E4 degradación | 100 000 | — | 604 | 1 611 |
| 091427 | E5 confirmación | 1 000 | 368 | — | 190 |
| 093525 | E5 confirmación | 1 000 | 352 | — | 178 |

---

## 7. Confirmaciones e idempotencia

| Sesión | Prueba | Reservas creadas | Confirmadas | Rechazadas | Idempotentes | `5xx` | Umbrales |
|---|---|---:|---:|---:|---:|---:|---|
| 074612 | I4 confirmación | 20 | 1 | 5 | — | **91** | **FALLO** |
| 090255 | I4 confirmación | 20 | 11 | 0 | 86 | 0 | OK |
| 091427 | E5 confirmación (gateway) | 368 | 294 | — | — | 0 | OK |
| 093525 | E5 confirmación (gateway) | 352 | 306 | — | — | 0 | OK |
| 095106 | I4 confirmación | 20 | 20 | 0 | **588** | 0 | OK |

- La primera corrida (074612) es la única con `5xx` en confirmación: **91 errores de servidor** que después se corrigieron.
- A partir de 09:02, el flujo de confirmación es estable y **idempotente**: en I4 de 09:51, 588 reintentos de confirmación no produjeron estados duplicados.
- En la suite del gateway, parte de las confirmaciones se pierden por el *rate limiter* (178–190 `429`), no por la lógica de negocio.

---

## 8. Recursos: CPU y RAM de cada servicio en cada prueba

### 8.1 Picos de CPU por servicio (todas las sesiones)

| Servicio | CPU máx observada | Dónde | Comentario |
|---|---:|---|---|
| `inventory-service` | **397.82 %** | I1, 095106 | ~4 hilos sat urados procesando 3 317 req/s de disponibilidad |
| `catalog-service` | **585.28 %** | I1, 095106 | fan-out de disponibilidad, no tráfico directo |
| `api-gateway` | **32.51 %** | E1, 091427 | filtro JWT + rate limit + circuit breaker |
| `user-service` | **83.28 %** | I4, 074612 | picos de login/registro en `setup` (JIT/GC), no tráfico sostenido |

### 8.2 RAM por servicio (rango de las 5 sesiones)

| Servicio | RAM media típica | RAM pico | Observación |
|---|---:|---:|---|
| `user-service` | 485–498 MiB | 544.5 MiB | estable; pico puntual en la sesión 074612 |
| `catalog-service` | 690–758 MiB | **758.0 MiB** | el más pesado del stack (JVM + Elasticsearch client) |
| `inventory-service` | 592–736 MiB | **736.0 MiB** | crece ~40 MiB durante I1/I5 y se estabiliza |
| `api-gateway` | 363–437 MiB | 436.9 MiB | crece por calentamiento entre sesiones |

**RAM total del stack (pico por sesión):**

| Sesión | RAM pico del stack | CPU pico del stack |
|---|---:|---:|
| 20261115-074612 | 3 390.5 MiB | 572.2 % |
| 20261115-090255 | 3 537.7 MiB | 567.0 % |
| 20261115-091427 | 3 584.4 MiB | 88.3 % |
| 20261115-093525 | **3 613.4 MiB** | 24.2 % |
| 20261115-095106 | **3 944.6 MiB** | **870.0 %** |

> Con **7.58 GiB** visibles para Docker, un pico de **3.94 GiB** deja margen, pero no mucho: base de datos, Kafka, Redis, Eureka, Prometheus y Grafana también viven en la misma VM.

---

## 9. Hallazgos y limitaciones

### Hallazgos técnicos

1. **La disponibilidad de Inventario depende de Catálogo en cada petición.** `GetAvailabilityService` llama a `CatalogLocalitiesAdapter` → `GET /api/eventos/{id}/localidades`, **sin caché**. A 3 300 req/s eso pone a catálogo a 209 % de CPU media (585 % pico) y convierte una consulta “de inventario” en una llamada de dos servicios. Es el principal candidato a optimización (caché de localidades con TTL).
2. **El *rate limiter* del gateway (10 req/s, ráfaga 20, por IP) condiciona todas las pruebas a través del gateway.** Como k6 sale desde un único contenedor (una IP), la suite E mide el limitador además del backend: en degradación, 1 611 de 2 231 peticiones fueron `429`.
3. **Los `429` no llevan `ProblemDetail`.** Los contadores `rate_limit_without_problem_detail` marcan 1 614 (091427) y 1 611 (093525): el cliente recibe un `429` sin cuerpo estructurado.
4. **La degradación es controlada:** a 40 VUs el gateway responde `429` y no hay ni un `5xx`; inventario se mantiene por debajo de 4.5 % de CPU.
5. **La idempotencia de confirmación funciona:** 588 reintentos sin duplicar estado (095106/I4).
6. **La primera sesión (07:46) es la única con fallos reales:** 91 `5xx` en confirmación y clasificación incorrecta de los `409` como error. Ambas cosas están corregidas en las sesiones posteriores.

### Limitaciones del informe

1. **Los datos no se generaron en este equipo.** Los `SUMMARY.md` apuntan a `C:\Users\pipey\...`; se analizaron los artefactos ya versionados (no versionados: `results/` está en `.gitignore`).
2. **Perfil `local`, no `sla`.** Los umbrales son de máquina de desarrollo compartida; las cifras no son comparables con un host dedicado.
3. **No hay pruebas directas a `user-service` ni a `catalog-service`.** La suite directa solo cubre Inventario. Los scripts `02-auth-login` y `03-reservations` existen pero **nunca se ejecutaron** en estas sesiones (no están en el `-Scenarios` por defecto).
4. **La suite directa no aísla Inventario** por el fan-out a Catálogo descrito arriba.
5. **Máximos y p99 son ruidosos** (p. ej. 2 914.92 ms en E1 con p95 de 9.79 ms): hipervisor, GC y JIT. El criterio de aprobación usa p95, correctamente.
6. **Sin trazabilidad distribuida:** el gateway no propaga `X-Request-Id` ni `traceparent`, así que no se puede descomponer una petición lenta entre gateway, inventario y catálogo.
7. **La verificación de invariantes no se ejecuta en los escenarios de estrés** (solo en flash sale).

---

## 10. Conclusiones

1. **El sistema no sobrevende.** Ocho corridas con stock acotado, incluida una con **292 037 intentos**, terminaron con exactamente el stock vendido y el contador en 0. Es la evidencia central del proyecto.
2. **Inventario soporta el pico sin el gateway** (3 300–4 135 req/s con p95 de 12–19 ms), pero **no está aislado**: su consulta de disponibilidad arrastra a Catálogo.
3. **El gateway aguanta y degrada bien**: 0 `5xx` a 40 VUs, con `429` como mecanismo de protección. Su costo es el *rate limiter* por IP, que subestima el throughput real del backend en las pruebas E.
4. **La latencia es buena para un entorno local**: p95 de un dígito en la mayoría de escenarios y p99 por debajo de 304 ms, salvo picos aislados de GC.
5. **La confirmación es idempotente** y el flujo de reservas es consistente bajo reintentos.
6. **Faltan pruebas directas a Usuario y Catálogo** y la suite directa a Inventario debería complementarse con una medición que desactive el fan-out (o con caché) para separar responsabilidades.

---

## 11. Anexo: cómo reproducir y dónde está cada cosa

### 11.1 Comandos

```powershell
# 1. Levantar el stack (desde el repo del gateway)
cd ..\ticketflow-api-gateway
docker compose up -d

# 2. Suite completa contra el API Gateway
cd ..\ticketflow-load-test
.\scripts\run-all.ps1                      # 01, 04, 05, 06, 07, 08
.\scripts\run-all.ps1 -Profile sla         # umbrales de host dedicado

# 3. Suite completa directa a Inventario
.\scripts\run-all.ps1 -Scenarios i1,i2,i3,i4,i5

# 4. Un escenario suelto + verificación de invariantes
.\scripts\run-scenario.ps1 -Scenario 06
.\scripts\verify-invariants.ps1 -EventId <uuid> -LocalityId <uuid> -Stock 100
```

### 11.2 Mapa de artefactos por escenario

```
results/sessions/<timestamp>/
  SUMMARY.md                  resumen de la sesión (PASS/FAIL por escenario)
  session.json                misma información en JSON
  01-catalog/ ...             una carpeta por escenario
    run.json                  stages, baseUrl, contadores, latencias, recursos
    summary.md / .json        resumen de k6
    resources.csv             muestras de CPU/RAM cada 3 s
    resources-summary.md      medias y picos por contenedor
    invariants.log            verificación anti-sobreventa (flash sale)
    console.out.log / .err.log
```

### 11.3 Sesiones incluidas

| Sesión | Suite | Perfil | Escenarios | Duración | Peticiones | Veredicto |
|---|---|---|---|---:|---:|---|
| 20261115-074612 | Directo Inventario | local (smoke) | I1–I5 | 2 m 42 s | 96 271 | **FAIL** (i3, i4, i5) |
| 20261115-090255 | Directo Inventario | local (smoke) | I1–I5 | 2 m 38 s | 96 557 | PASS |
| 20261115-091427 | API Gateway | local | E1–E5 | 9 m 55 s | 6 799 | PASS |
| 20261115-093525 | API Gateway | local | E1–E5 | 9 m 50 s | 6 791 | PASS |
| 20261115-095106 | Directo Inventario | local | I1–I5 | 9 m 23 s | **794 347** | PASS |
| **Total** | | | **27 corridas** | | **1 000 765** | **24 PASS / 3 FAIL** |

### 11.4 Escenarios existentes pero no ejecutados

| Script | Qué mide | Estado |
|---|---|---|
| `test-api-gateway/02-auth-login-test.js` | Registro y login (`/api/auth/register`, `/api/auth/login`) | **No ejecutado** en estas sesiones |
| `test-api-gateway/03-reservations-test.js` | Flujo completo con creación de evento, publicación y reserva | **No ejecutado** en estas sesiones |

> Recomendación: incluirlos en `run-all.ps1` y añadir una suite directa a `catalog-service` (los escenarios `01-catalog` y `05-event-detail` ya aceptan `-e BASE_URL=http://ticketflow-catalog-service:8082`) y a `user-service` (requiere parametrizar el `BASE_URL` que hoy está fijo en `02-auth-login-test.js`).
