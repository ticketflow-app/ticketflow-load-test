# Plan de pruebas de carga — ejecución en equipo local

> **Documento derivado.** Adapta a un equipo de desarrollo concreto el
> `Plan_de_Pruebas_de_Carga_y_Concurrencia.pdf` (octubre 2026). No lo reemplaza ni cambia sus
> SLAs: redefine **cómo se ejecutan** los escenarios y **qué se puede demostrar** en este
> hardware. Todo número marcado como *medido* se obtuvo en este equipo el 2026-11-09; lo marcado
> como *estimado* es una proyección a validar con la calibración del §5.
>
> Estado: **PROPUESTA** — no implica cambios en scripts, compose ni configuración.

---

## 1. Entorno objetivo

| Componente | Valor | Fuente |
|---|---|---|
| CPU | AMD Ryzen 5 5600 — 6 núcleos / 12 hilos, 3.5 GHz | `Win32_Processor` |
| RAM total | 15.9 GB | `Win32_ComputerSystem` |
| RAM libre con el stack arriba | **5.1 GB** | `Win32_OperatingSystem` |
| SO | Windows 10 Pro (uso cotidiano, no dedicado) | `Win32_OperatingSystem` |
| VM Docker (WSL2) | **4 GB RAM · 2 vCPU · 2 GB swap** (`~/.wslconfig`) | `~/.wslconfig` |
| Memoria visible en contenedores | 3.825 GiB | `docker stats` |
| Contenedores del stack | 14 | `docker compose ps` |
| Memoria del stack en reposo | **1.92 GiB** | `docker stats`, 2026-11-09 |
| Memoria del stack a 25 VUs | **2.01 GiB** | `docker stats`, 2026-11-09 |

### 1.1 Línea base medida (solo lectura, catálogo)

Corrida de calibración sobre `GET /api/eventos` (rampa 5 → 15 → 25 → 0 VUs, 80 s):

| Métrica | Valor |
|---|---|
| Peticiones totales | 856 |
| Throughput medio | 10.6 req/s (pico de meseta ≈ 25 req/s) |
| Checks correctos | 100 % (856/856) |
| `http_req_duration` p50 / p90 / p95 | 4.95 ms / 11.58 ms / **22.34 ms** |
| `http_req_duration` máx | **418.68 ms** |
| Errores HTTP | 0 % |
| Memoria de `catalog-service` | 378.6 MiB → 426.6 MiB |

Dos lecturas importantes de esta línea base:

1. **Hay margen**: 25 VUs con p95 de 22 ms deja el endpoint de catálogo por debajo de su SLA
   (p95 < 40 ms) incluso en este equipo.
2. **La cola no es de la aplicación**: un `max` de 418 ms con solo 25 VUs es ruido de
   planificación del host (Windows + 2 vCPU compartidas), no saturación del servicio. Por eso
   **p99 y `max` no son métricas válidas aquí**; p95 sí, con reservas.

---

## 2. Restricciones reales de este equipo

| # | Restricción | Efecto sobre el plan original |
|---|---|---|
| R1 | **2 vCPU para 14 contenedores + k6** | El techo de carga lo pone el host, no el diseño. 500–2 000 VUs son inalcanzables: k6 solo necesitaría ~1 vCPU para generarlas, dejando el stack sin CPU |
| R2 | **Rate limiter del gateway** (usuario 10 req/s, inventario 10 req/s, catálogo 50 req/s; ráfagas 20/20/100) | Por encima de esos valores se mide el limitador, no el servicio. Un objetivo de 2 000 RPS devolvería ~99 % `429` |
| R3 | **Un solo generador k6**, dentro de la misma VM | Sin generación distribuida; el generador compite por CPU con lo que mide |
| R4 | **4 GB de VM para 4 JVMs** sin `mem_limit` ni `-XX:MaxRAMPercentage` | Cada JVM puede reclamar hasta ~1 GB de heap (25 % de 4 GB). Con carga sostenida hay riesgo de OOM-kill, no de degradación limpia |
| R5 | **Observabilidad incompleta**: Prometheus solo se auto-scrapea; únicamente `catalog-service` expone `/actuator/prometheus`; no hay cAdvisor ni kafka-exporter | CPU/RAM por servicio, *cache hit* y *consumer lag* no son medibles hoy |

**Consecuencia de diseño:** en este equipo se valida **comportamiento e invariantes**, no
capacidad absoluta. La capacidad se descubre (§5) y se documenta como "techo de este equipo",
nunca como SLA de la plataforma.

---

## 3. Presupuesto de recursos

| Recurso | Presupuesto | Consumo esperado |
|---|---|---|
| RAM VM (4 GB) | 2.0 GB stack + 1.2 GB k6 y caché de página + 0.8 GB margen | ~3.2 GB |
| vCPU (2) | 1.3 para el stack + 0.4 para k6 + 0.3 para el host | ~2.0 |
| Disco | TSDB de Prometheus (retención 15 d) | ~150 MB por suite completa |

### 3.1 Perfiles de arranque

| Perfil | Servicios | RAM aprox. | Uso |
|---|---|---|---|
| **`carga`** (recomendado) | eureka, 3× postgres, redis, kafka, user, inventory, catalog, gateway, prometheus | ~1.7 GB | Todas las corridas de medición |
| **`observabilidad`** | perfil `carga` + grafana | ~1.8 GB | Cuando se quieran ver paneles en vivo |
| **`completo`** | + localstack + frontend | ~1.9 GB | Solo verificación funcional |

`grafana` (114 MiB), `localstack` (131 MiB) y `frontend` (7 MiB) se detienen durante las
mediciones: no participan en la ruta de carga y su CPU compite con el gateway. `catalog-service`
**no depende de localstack al arrancar** (solo lo usa para URLs prefirmadas de imágenes), por lo
que apagarlo no rompe el catálogo.

> Detener servicios no es un cambio de código, pero sí altera el entorno: hazlo con
> `docker compose stop <servicio>` y restáuralos con `start`, nunca con `down -v`.

---

## 4. Escenarios ajustados

Escala de referencia: **1 VU con `sleep(1)` ≈ 1 req/s**. Todas las cifras respetan R2 para que
las peticiones lleguen realmente al servicio.

### 4.1 Tabla de escenarios

| ID | Escenario | VUs | Duración | Endpoint(s) | Objetivo |
|---|---|---|---|---|---|
| E0 | Smoke | 2 | 20 s | `GET /api/eventos` | Stack vivo y sin 5xx antes de medir |
| E1 | Catálogo (lectura) | 5 → 25 → 0 | 2 min | `GET /api/eventos` | Regresión de latencia con caché |
| E2 | Disponibilidad (lectura) | 5 → 10 → 0 | 2 min | `GET /api/inventario/eventos/{id}/disponibilidad` | 60 % del tráfico Flash Sale, bajo el límite de 10 req/s |
| E3 | Flash Sale funcional | 15 | 2 min | mezcla 60/30/10 | **Invariante anti-sobreventa** con stock escaso |
| E4 | Degradación | 40 | 1 min | `POST /api/reservas` | `429` con ProblemDetail, 0 % `5xx`, sin caída |
| E5 | Confirmación | 8 | 1 min | `POST /api/reservas/{id}/confirmar` | Confirmación + emisión de boleto |
| E6 | Check-in | 50 | — | `POST /api/checkin/escanear` | **BLOQUEADO**: no existe `checkin-service` |

Duración total de la suite: **~12 min** de carga + ~8 min de enfriamiento y verificación.

### 4.2 E3 — Flash Sale funcional (el escenario que sí prueba algo)

El plan original pide 2 000 peticiones sobre 1 000 boletos. La invariante no depende del
volumen, sino de la **escasez** y de la **concurrencia**. Adaptación:

| Parámetro | Plan original | Local | Por qué |
|---|---|---|---|
| Stock de la localidad | 1 000 | **100** | Cabe en una corrida de 2 min sin llenar la BD |
| Intentos de reserva | 600 (30 % de 2 000) | **≈250** | 15 VUs × 120 s × 30 % ÷ 2 s de espera (medido: 254) |
| Relación intentos/stock | 0.6 : 1 | **2.5 : 1** | Suficiente para agotar 100 boletos; el plan original **no puede** agotar 1 000 con 600 intentos de 1 boleto: no habría contención |
| Compradores | Miles de usuarios | **10 tokens distintos** | Evita que un solo usuario sea el cuello de botella |
| Mezcla | 60 / 30 / 10 | **60 / 30 / 10** | Se conserva |
| VUs | 500–2 000 | **15** con `THINK_TIME=2` | ~7 req/s totales (4.2 lectura, 2.1 reserva, 0.7 confirmación): por debajo del límite de 10 req/s de inventario |

**Invariantes a verificar (criterio 5.1 adaptado):**

```sql
-- Reservas que consumieron stock: deben sumar exactamente el aforo
SELECT coalesce(sum(quantity), 0)
FROM reservations
WHERE event_id = '<eventId>' AND status IN ('PENDING', 'CONFIRMED');
-- Esperado: 100
```

```powershell
docker exec ticketflow-redis redis-cli GET "inv:stock:<eventId>:<localityId>"
# Esperado: 0

docker exec ticketflow-redis redis-cli GET "inv:stock:<eventId>:<localityId>:capacity"
# Esperado: 100
```

Criterios de aprobación de E3:

1. `sum(quantity)` = stock exacto (ni uno más).
2. Contador Redis = 0 y **nunca negativo** (verificar también con `MONITOR` o muestreo durante la corrida).
3. Todas las respuestas son `201` (aceptada), `409` (sin stock) o `429` (limitador); **ningún `5xx`**.
4. `checks` de aceptación/rechazo coherentes: aceptadas = 100, rechazadas = 440 (o menos si hay `429`).

> **Nota de implementación:** E3 vive en `test-api-gateway/06-flash-sale-test.js` (15 VUs, mezcla
> 60/30/10, 10 compradores) y la verificación de los invariantes está en `scripts/verify-invariants.ps1`.
>
> **Ajuste medido (corrida completa del 2026-11-09):** con `THINK_TIME=1` los 15 VUs generan 15 req/s
> sobre inventario y chocan con el límite de 10 req/s del gateway: 488 de 1 669 peticiones volvieron
> `429` y el umbral `http_req_failed` fallaba aunque el invariante pasara (100/100). Por eso `06` usa
> `THINK_TIME=2` por defecto (~7 req/s) y las lecturas de disponibilidad declaran `429` como estado
> esperado, igual que reserva y confirmación. Resultado: 0 `429`, 254 intentos, 100 aceptadas,
> 154 sin stock, invariante PASS. El `429` deliberado es competencia de E4.

### 4.3 E4 — Degradación controlada (criterio 5.2 adaptado)

40 VUs sobre `POST /api/reservas` generan ~40 req/s, cuatro veces el límite de 10 req/s.
Lo que se valida **no** es latencia sino:

- Que el gateway responde `429` (y no `500`) al exceder el límite.
- Que no hay `5xx` ni contenedores reiniciados (`docker ps` con `RestartCount = 0`).
- Que al bajar la carga el sistema vuelve a `200/201` en < 30 s.

> **Hallazgo (verificado en la implementación):** el `429` del `RequestRateLimiter` sale con
> `content-length: 0`, sin `ProblemDetail` (solo cabeceras `X-RateLimit-*`). `08-degradation-test.js`
> lo contabiliza en `rate_limit_without_problem_detail`; hoy ese contador iguala el de `429`.

> El plan original atribuye la degradación a *Resilience4j*; en inventario se retiró (DA-002) y
> el reintento es `Retry.backoff` de Reactor. La degradación observable aquí es la del
> `RequestRateLimiter` del gateway, no la de un circuit breaker.

---

## 5. Calibración de capacidad (procedimiento obligatorio antes de medir)

Los números de §4 son un punto de partida conservador. El techo real de este equipo se descubre
una vez y se documenta:

1. Detén grafana, localstack y frontend (perfil `carga`).
2. Ejecuta una escalera sobre un endpoint de **solo lectura**:

   ```
   --stage 30s:10 --stage 30s:25 --stage 30s:50 --stage 30s:75 --stage 30s:0
   ```

3. Registra p95 y `http_req_failed` por escalón.
4. Define el **codo**: el último escalón donde p95 < 2× la línea base y errores < 1 %.
5. Fija los objetivos de E1–E5 al **70 % del codo**.
6. Repite la calibración si cambias `.wslconfig`, el compose o la versión de Java.

Plantilla de registro:

| Escalón (VUs) | Throughput | p95 | p99 | Errores | CPU stack | RAM stack | ¿Codo? |
|---|---|---|---|---|---|---|---|
| 10 | | | | | | | |
| 25 | 25 req/s | 22.3 ms | — | 0 % | ~0.2 vCPU | 1.96 GiB | línea base |
| 50 | | | | | | | |
| 75 | | | | | | | |

> Si el escalón de 50 VUs ya devuelve `429` masivos, el codo está limitado por R2 y no por el
> hardware: repite con el endpoint de catálogo (límite 50 req/s) para separar ambas causas.

---

## 6. Umbrales: dos perfiles, no uno

El plan define SLAs de plataforma. En este equipo solo algunos son medibles con validez.

| Endpoint | SLA del plan (p95 / p99) | Umbral local (gate de regresión) | ¿SLA verificable aquí? |
|---|---|---|---|
| Catálogo `GET /api/eventos/{id}` | 40 / 100 ms | **p95 < 40 ms** | ✅ Sí (medido 22 ms en listado) |
| Disponibilidad | 30 / 80 ms | p95 < 150 ms | ⚠️ Parcial: Redis + PG compiten por 2 vCPU |
| Reservas `POST /api/reservas` | 150 / 350 ms | p95 < 600 ms | ❌ No atribuible a la app |
| Confirmación | — | p95 < 800 ms | ❌ No |
| Gateway `ANY /api/**` | 20 / 50 ms | — | ❌ La cola del host llega a 418 ms de máx. con solo 25 VUs |
| Check-in | 80 / 150 ms | — | ❌ Servicio inexistente |

Reglas:

- **`p99` no se usa como umbral local.** Con 2 vCPU compartidas el p99 mide la programación del
  hipervisor. Se registra, no se evalúa.
- **`http_req_failed` debe separar 4xx de 5xx.** k6 cuenta `429` como fallo por defecto; en E4
  eso convertiría la degradación correcta en un fallo del test. Usa `expected_response` o un
  contador propio (`http_req_failed{expected_response:true}` no basta: hay que filtrar por
  código).
- Los umbrales locales **no son SLAs** y no deben citarse como cumplimiento del plan.

---

## 7. Protocolo de ejecución

1. **Preparar**: `docker compose stop grafana localstack frontend`; confirmar `docker compose ps`
   sin `unhealthy`.
2. **Limpiar datos**: truncar `reservations` y borrar claves `inv:stock:*` del evento de prueba
   (solo BD local).
3. **Calentar**: 60 s a 5 VUs sobre el endpoint del escenario; descartar resultados.
4. **Medir**: un escenario a la vez, con `--summary-export` a disco (§Anexo A).
5. **Enfriar**: 2 min entre escenarios; verificar que no quedan `429` ni CPU alta.
6. **Verificar**: SQL + Redis (§4.2) y `docker ps --format '{{.Names}} {{.Status}}'` para
   descartar reinicios.
7. **Restaurar**: `docker compose start frontend localstack grafana`.

Reglas de higiene:

- Nunca dos escenarios en paralelo: la CPU es el recurso escaso.
- No medir con el navegador, Teams, IDE indexando o Windows Update activos.
- Reiniciar el stack si un escenario termina con contenedores reiniciados: los resultados de esa
  corrida no son válidos.

---

## 8. Matriz plan → local

| Requisito del plan | Cobertura local | Comentario |
|---|---|---|
| §2 `POST /api/reservas` | ✅ E3 + E4 | Con escasez real y verificación de invariante |
| §2 `GET /disponibilidad` | ✅ E2 | 60 % del tráfico, bajo el límite de 10 req/s |
| §2 `POST /api/reservas/{id}/confirmar` | ⚠️ E5 | Requiere script nuevo |
| §2 `GET /api/eventos/{id}` | ⚠️ E1 | Hoy se mide el listado; hay que cambiar el endpoint |
| §2 `POST /api/checkin/escanear` | ❌ E6 | Bloqueado: no existe el servicio |
| §3.1 Escenario A (500–2 000 VUs) | ⚠️ Parcial | Se preserva forma, mezcla e invariante; no la magnitud |
| §3.2 Escenario B (200–500 RPS) | ❌ | Sin servicio de check-in |
| §4 SLA gateway 2 000 RPS | ❌ | Imposible con 2 vCPU + limitador de 20 req/s |
| §4 SLA catálogo p95 < 40 ms | ✅ | Medido 22 ms a 25 VUs |
| §4 CPU/RAM por servicio | ❌ | Sin cAdvisor; solo `docker stats` agregado |
| §4 Cache hit > 95 % | ❌ | Sin métrica expuesta |
| §5.1 Anti-sobreventa | ✅ E3 | Adaptado a 100 cupos / 540 intentos |
| §5.2 Degradación 429/503 | ⚠️ E4 | Solo 429 del gateway; sin circuit breaker en inventario |
| §5.3 Kafka lag < 60 s | ❌ | Sin consumidores ni exporter |

---

## 9. Fuera de alcance en este equipo

| Objetivo del plan | Por qué no aquí | Cómo cubrirlo |
|---|---|---|
| 500–2 000 VUs, 2 000 RPS | 2 vCPU compartidas con el propio generador | Entorno dedicado (8 vCPU / 16 GB) o k6 distribuido (2–3 runners) |
| p99 estable | Cola del hipervisor (418 ms observados a 25 VUs) | Host dedicado o bare metal |
| CPU/RAM por servicio | Sin cAdvisor ni métricas en 3 de 4 servicios | Añadir cAdvisor + `micrometer-registry-prometheus` |
| Cache hit ratio | No hay contador de aciertos/fallos expuesto | Métrica en el adaptador de caché |
| Consumer lag | No existen `notificaciones`, `checkin` ni `analitica` | kafka-exporter + consumidores reales |
| 50 escaneos del mismo QR | `checkin-service` no existe | Crear el servicio |

---

## 10. Trabajo derivado (implementado)

Los entregables de P1 y P2 ya están en el repositorio. La numeración final difiere de la propuesta
original porque `01` se mantuvo como lectura de listado (es la línea base medida de §1.1) y el
detalle de catálogo pasó a `05`.

| Prioridad | Entregable | Archivo | Estado |
|---|---|---|---|
| P1 | E2 — disponibilidad | `test-api-gateway/04-availability-test.js` | Implementado |
| P1 | E3 — Flash Sale (mezcla 60/30/10 + invariante) | `test-api-gateway/06-flash-sale-test.js` | Implementado |
| P1 | Verificación SQL + Redis de §4.2 | `scripts/verify-invariants.ps1` | Implementado |
| P1 | Muestreo de CPU/RAM | `scripts/sample-resources.ps1` + `scripts/run-scenario.ps1` | Implementado |
| P1 | Sesión completa en secuencia + veredicto PASS/FAIL | `scripts/run-all.ps1` | Implementado |
| P2 | E5 — confirmación de compra | `test-api-gateway/07-confirm-test.js` | Implementado |
| P2 | E4 — degradación controlada | `test-api-gateway/08-degradation-test.js` | Implementado |
| P2 | E1b — detalle `GET /api/eventos/{id}` | `test-api-gateway/05-event-detail-test.js` | Implementado |
| P2 | Limpieza de datos de prueba | `scripts/reset-state.ps1` | Implementado |
| P3 | Scraping de `catalog-service` en Prometheus | `ticketflow-api-gateway/prometheus.yml` | Implementado (solo catálogo) |
| P3 | cAdvisor | — | Pendiente de autorización (infra) |
| P3 | `micrometer-registry-prometheus` en user/inventory/gateway | — | Pendiente de autorización (dependencias) |
| P3 | E6 — check-in | — | Bloqueado: no existe `checkin-service` |

Hallazgos de la implementación:

- El `429` del `RequestRateLimiter` del gateway sale **sin cuerpo** (`content-length: 0`), a
  diferencia del `ProblemDetail` que devuelven los servicios. El escenario E4 lo contabiliza en
  `rate_limit_without_problem_detail`.
- Solo `catalog-service` expone `/actuator/prometheus`; el resto de servicios no tiene
  `micrometer-registry-prometheus`, por eso el CSV de `docker stats` sigue siendo la fuente de
  CPU/RAM para todos los contenedores.
- `reservations.expira_en` existe pero no se usa para liberar stock: las reservas `PENDING` no
  expiran durante una corrida, así que E5 puede confirmar sin riesgo de `410`.


---

## Anexo A — Comandos

Camino normal, desde `ticketflow-load-test\scripts`. `run-all.ps1` ejecuta la suite completa en
secuencia y consolida el veredicto; `run-scenario.ps1` ejecuta un escenario suelto. Ambos montan
`test-api-gateway/` en el contenedor y arrancan el muestreo de recursos:

```powershell
cd ticketflow-load-test\scripts

.\run-all.ps1                                          # los 6 escenarios, ~12 min, perfil local
.\run-all.ps1 -Smoke                                   # etapas cortas, ~3 min
.\run-all.ps1 -Profile sla                             # umbrales del plan de plataforma
.\run-all.ps1 -Scenarios 01,06 -Label demo             # subconjunto con etiqueta

.\run-scenario.ps1 -Scenario 01                        # E1  catálogo (listado)
.\run-scenario.ps1 -Scenario 04                        # E2  disponibilidad
.\run-scenario.ps1 -Scenario 05                        # E1b detalle de evento
.\run-scenario.ps1 -Scenario 06                        # E3  flash sale (STOCK=100)
.\run-scenario.ps1 -Scenario 07                        # E5  confirmación
.\run-scenario.ps1 -Scenario 08                        # E4  degradación (40 VUs)
```

`run-all.ps1` deja `results\sessions\<timestamp>\SUMMARY.md` con la tabla PASS/FAIL (umbrales,
p95, req/s, fallidas, picos de RAM/CPU, invariante), ejecuta `verify-invariants.ps1` tras E3 y sale
con código 1 si algún escenario falla. Los demás escenarios se ejecutan igual para no perder el
panorama.

Ajustes habituales:

```powershell
# Etapas a medida (smoke)
.\run-scenario.ps1 -Scenario 06 -Stages 5s:6,20s:10,5s:0 -Env STOCK=5,BUYERS=5

# Umbrales del plan de plataforma en lugar de los locales
.\run-scenario.ps1 -Scenario 01 -Profile sla

# Verificación del invariante tras E3
.\verify-invariants.ps1 -EventId <eventId> -LocalityId <localityId> -ExpectedStock 100

# Limpieza (dry run por defecto)
.\reset-state.ps1
.\reset-state.ps1 -Yes
```

Ejecución manual sin el orquestador (los scripts importan `./lib`, hay que montar la carpeta):

```powershell
$net = "ticketflow-api-gateway_default"
$rw  = "http://ticketflow-prometheus:9090/api/v1/write"
$src = "C:/Users/<usuario>/.../ticketflow-load-test/test-api-gateway"
$out = "C:/Users/<usuario>/.../ticketflow-load-test/results/manual"
New-Item -ItemType Directory -Force $out | Out-Null

docker run --rm --name ticketflow-k6 --network $net `
  -v "${src}:/scripts" -v "${out}:/results" `
  -e BASE_URL=http://ticketflow-api-gateway:8080 -e RESULTS_DIR=/results `
  -e K6_PROMETHEUS_RW_SERVER_URL=$rw `
  grafana/k6 run -o experimental-prometheus-rw --stage 20s:5 --stage 60s:25 --stage 20s:0 `
  /scripts/01-catalog-test.js
```

> `02` y `03` no importan `./lib` y siguen admitiendo el modo `Get-Content ... | docker run -i ... -`.
> El resto falla por tubería porque k6 no resuelve imports relativos en `stdin`.

---

## Anexo B — Plantilla de resultados

| Campo | Valor |
|---|---|
| Escenario / ID | |
| Fecha y hora | |
| Perfil de arranque | `carga` / `observabilidad` / `completo` |
| VUs máx. / duración | |
| Throughput (req/s) | |
| p50 / p90 / p95 / p99 / max | |
| `http_req_failed` (4xx / 5xx) | |
| Checks | |
| RAM stack (inicio / pico) | |
| Invariante verificado (SQL/Redis) | |
| Contenedores reiniciados | |
| Veredicto | Aprobado / Rechazado / No concluyente |

---

## Anexo C — Ajustes de entorno propuestos (pendientes de autorización)

| Ajuste | Motivo | Riesgo | Recomendación |
|---|---|---|---|
| `processors=4` en `~/.wslconfig` | 4 JVMs + k6 en 2 vCPU es el principal cuello | Windows conserva 8 hilos de 12 | **Sí**, medir antes/después |
| `memory=6GB` en `~/.wslconfig` | Margen para picos | Solo quedan ~5 GB libres en el host | **No** por ahora; 4 GB basta (pico medido 2.0 GB) |
| `-XX:MaxRAMPercentage=25` explícito o `mem_limit` por servicio | Evitar que una JVM reclame 1 GB y provoque OOM-kill | Requiere reconstruir imágenes | Sí, antes de E3/E4 sostenidos |
| Volumen con nombre para Prometheus | El volumen anónimo se pierde al recrear el contenedor | Ninguno | Sí |
| Subir límites del gateway en perfil de prueba | Poder medir el servicio y no el limitador | Cambia comportamiento de seguridad | Solo en un perfil aislado, con autorización |

---

## Anexo D — Diferencias con el documento original que conviene corregir en el plan

1. **Nombres de datos.** El plan pide verificar la tabla `stock_localidad` y la clave `inv:stock`.
   La implementación real no tiene tabla `stock_localidad`: el stock vive en Redis con
   `inv:stock:{eventId}:{localityId}` (+ `:capacity`) y las reservas en `reservations`. La clave
   `inv:stock` sí coincide; el nombre de tabla no.
2. **Resilience4j.** El criterio 5.2 lo menciona; en inventario se retiró (DA-002).
3. **Rate limit vs 2 000 RPS.** El SLA de gateway (p95 < 20 ms, 2 000 RPS) es incompatible con
   un limitador de 20 req/s salvo que se mida *antes* del filtro o con el limitador desactivado.
4. **Endpoints.** El plan usa `/api/reservas` y `/api/inventario/...` (correcto), pero también
   `/api/checkin/escanear` y `/api/eventos/{id}`, que aún no tienen prueba ni, en el primer caso,
   servicio.
5. **Alcance de la degradación.** El plan asume `503` por circuit breaker; hoy el sistema solo
   produce `429` por limitador. El `503` requeriría que el servicio destino esté caído.
