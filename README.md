# TicketFlow — Pruebas de carga (k6)

Suite de pruebas de carga de la plataforma TicketFlow. Ejecuta escenarios **k6** contra el
**API Gateway** y publica las métricas en **Prometheus** (remote write); **Grafana** las visualiza.

> Repositorio independiente del resto de servicios. No contiene código de la aplicación: solo
> scripts de carga y su documentación.

El plan adaptado al hardware de desarrollo (qué escenario mide qué, qué se puede demostrar en este
equipo y qué umbrales aplican en local) está en
[`docs_ia/contexto/plan_de_pruebas_carga_local.md`](docs_ia/contexto/plan_de_pruebas_carga_local.md).

---

## Requisitos

- **Docker** en ejecución con el stack del backend levantado (red `ticketflow-api-gateway_default`).
- No hace falta instalar k6: se ejecuta con la imagen `grafana/k6`.

Levanta el stack desde el repo del gateway:

```powershell
cd ..\ticketflow-api-gateway
docker compose up -d
docker compose ps          # eureka, postgres, redis, kafka, localstack, user, inventory, catalog, gateway, prometheus, grafana
```

Comprueba que el gateway responde antes de lanzar la carga:

```powershell
Invoke-RestMethod http://localhost:8080/actuator/health
Invoke-RestMethod http://localhost:8080/api/eventos
```

---

## Estructura

```
test-api-gateway/
  01-catalog-test.js        # E1  GET /api/eventos (lectura de catálogo)
  02-auth-login-test.js     #     POST /api/auth/register + /api/auth/login
  03-reservations-test.js   #     smoke de reserva (un solo comprador)
  04-availability-test.js   # E2  GET /api/inventario/eventos/{id}/disponibilidad
  05-event-detail-test.js   # E1b GET /api/eventos/{id} (detalle con caché)
  06-flash-sale-test.js     # E3  mezcla 60/30/10 + invariante anti-sobreventa
  07-confirm-test.js        # E5  POST /api/reservas -> /{id}/confirmar
  08-degradation-test.js    # E4  degradación controlada (429 del rate limit)
  lib/
    config.js               # URL base, perfil, datos de referencia, helpers
    api.js                  # usuarios, tokens, evento publicado, reservas
    summary.js              # resumen JSON + Markdown al final de cada corrida
scripts/
  run-all.ps1               # sesión completa: todos los escenarios en secuencia + veredicto
  run-scenario.ps1          # orquestador: muestreo de CPU/RAM + k6 + resumen
  sample-resources.ps1      # muestreo de `docker stats` a CSV
  verify-invariants.ps1     # verificación anti-sobreventa (PostgreSQL + Redis)
  reset-state.ps1           # limpieza de reservas y contadores (dry run por defecto)
```

`01` y `04`–`08` **importan** `lib/`, así que se ejecutan montando la carpeta en el contenedor
(lo hace `run-scenario.ps1`). `02` y `03` son autocontenidos y admiten el modo `Get-Content | docker run -i`.
Los scripts con nombre de escenario (`E1`, `E2`, …) corresponden a los del plan de pruebas.

---

## Ejecución

### Toda la suite en secuencia (recomendado)

Una orden ejecuta los seis escenarios uno detrás de otro (nunca en paralelo), guarda cada corrida con
su CPU/RAM y deja un veredicto PASS/FAIL consolidado:

```powershell
cd ticketflow-load-test\scripts

.\run-all.ps1                              # perfil local, ~12 min
.\run-all.ps1 -Smoke                       # etapas cortas (~3 min) para validar el pipeline
.\run-all.ps1 -Profile sla                 # umbrales del plan de plataforma
.\run-all.ps1 -Scenarios 01,06 -Label demo # solo esos dos escenarios
```

Al terminar imprime la tabla de la sesión:

```
Escenario                 Resultado  p95 ms   req/s fallidas    RAM pico   CPU pico invariante
01 catalog                PASS         11.6     2.5    0.00%  1944.7 MiB     15.1 %          -
04 availability           PASS         21.2     2.4    0.00%  1954.9 MiB     20.9 %          -
06 flash-sale             PASS         33.8     6.7    0.00%  1969.1 MiB     28.0 %       PASS
...

 RESULTADO GLOBAL: PASS (6/6)
```

Sale con código 0 **solo si todos** los escenarios pasan (umbrales de k6 + invariante). Si uno falla,
los demás se ejecutan igual y el reporte indica cuál falló y por qué (`-StopOnError` corta en el
primer fallo).

Cada sesión queda autocontenida en `results\sessions\<AAAAMMDD-HHMMSS>\`:

```
SUMMARY.md                 # reporte consolidado: tabla + detalle por escenario
session.json               # el mismo contenido en JSON
01-catalog\                # una carpeta por escenario, con todo lo de una corrida suelta
  console.out.log          # salida de k6 (resumen)
  console.err.log          # log de k6 (setup, progreso)
06-flash-sale\
  invariants.log           # verificación del invariante en PostgreSQL + Redis
```

### Un escenario suelto

También puedes lanzar uno solo:

```powershell
cd ticketflow-load-test\scripts

.\run-scenario.ps1 -Scenario 01                 # catálogo, ~100 s
.\run-scenario.ps1 -Scenario 06                 # flash sale, ~2 min
.\run-scenario.ps1 -Scenario 06 -Profile sla    # umbrales del plan de plataforma
```

Cada corrida crea una carpeta propia (`results\sessions\<ts>\<escenario>\` si la lanza
`run-all.ps1`; `results\<escenario>\<AAAAMMDD-HHMMSS>\` si la lanza `run-scenario.ps1`):

```
01-catalog-summary.json     # métricas del resumen (k6)
01-catalog-summary.md       # resumen legible
resources.csv               # muestreo de CPU/RAM por contenedor
resources-summary.md        # media y pico por contenedor + RAM total del stack
run.json                    # escenario, perfil, etapas, exit code, p95, picos, eventId
console.out.log             # stdout de k6
console.err.log             # stderr de k6
```

### Etapas a medida

`-Stages` acepta la lista `duración:VUs` (coma o repetido):

```powershell
.\run-scenario.ps1 -Scenario 04 -Stages 10s:4,30s:8,10s:0
.\run-scenario.ps1 -Scenario 06 -Stages 5s:6,20s:10,5s:0 -Env STOCK=5,BUYERS=5
```

### Variables de entorno

`-Env KEY=VALUE,KEY=VALUE` se reenvía al contenedor de k6:

| Variable | Escenarios | Efecto | Default |
|---|---|---|---|
| `STOCK` | 06 | Cupos de la localidad (invariante anti-sobreventa) | `100` |
| `CAPACITY` | 04, 07, 08 | Cupos de la localidad | `1000` / `100000` |
| `BUYERS` | 06, 07, 08 | Compradores distintos en `setup` | `10` / `5` |
| `MIX_READ`, `MIX_RESERVE` | 06 | Mezcla de tráfico (el resto confirma) | `0.6`, `0.3` |
| `THINK_TIME` | todos | Segundos de espera por iteración | `1` (`2` en 06) |
| `PROFILE` | todos | `local` o `sla` (umbrales) | `local` |
| `BASE_URL` | todos | Gateway | `http://ticketflow-api-gateway:8080` |

El orquestador expone atajos: `-Profile`, `-ThinkTime`, `-BaseUrl`, `-IntervalSec`, `-NoSampler`,
`-NoPrometheus`.

### k6 instalado localmente (opcional)

`01` y `04`–`08` necesitan resolver `./lib`, así que deben ejecutarse desde disco:

```powershell
k6 run -e BASE_URL=http://localhost:8080 .\01-catalog-test.js
```

`02` y `03` siguen funcionando por tubería:

```powershell
Get-Content .\02-auth-login-test.js | docker run --rm -i --network ticketflow-api-gateway_default `
  grafana/k6 run -
```

---

## Qué mide cada escenario

| Script | Endpoint principal | Etapas por defecto | Umbral local | Umbral SLA |
|---|---|---|---|---|
| `01-catalog-test.js` | `GET /api/eventos` | 20 s → 5, 60 s → 25, 20 s → 0 | p95 < 150 ms | p95 < 40 ms |
| `04-availability-test.js` | `GET .../disponibilidad` | 20 s → 4, 60 s → 8, 20 s → 0 | p95 < 150 ms | p95 < 30 ms |
| `05-event-detail-test.js` | `GET /api/eventos/{id}` | 20 s → 5, 60 s → 25, 20 s → 0 | p95 < 120 ms | p95 < 40 ms |
| `06-flash-sale-test.js` | `POST /api/reservas` + disponibilidad + confirmación | 10 s → 15, 100 s → 15, 10 s → 0 | `5xx == 0`, `0 < aceptadas ≤ STOCK` | ídem |
| `07-confirm-test.js` | `POST /api/reservas` → `/{id}/confirmar` | 10 s → 8, 50 s → 8, 10 s → 0 | `5xx == 0`, `confirmadas > 0` | ídem |
| `08-degradation-test.js` | `POST /api/reservas` (40 VUs) | 5 s → 40, 50 s → 40, 5 s → 0 | `5xx == 0`, `429 > 0` | ídem |

Los umbrales de latencia se evalúan **por endpoint** (`http_req_duration{endpoint:...}`), de modo
que las peticiones de `setup` no contaminan la comparación.

Cada escenario con `setup` crea su propio organizador, evento, localidad publicada y compradores, y
**escribe** en el catálogo y en el inventario. El `eventId`/`localityId` aparece en el log:

```
INFO[0000] setup: eventId=01a1c372-... localityId=01a1c372-... stock=100
```

`02` y `03` se mantienen como smoke: `02` mide login con 50 usuarios pre-registrados y `03` hace una
reserva con un solo comprador.

---

## Registro de CPU y RAM

`run-scenario.ps1` arranca `sample-resources.ps1` antes de k6 y lo detiene al terminar. El muestreo
usa `docker stats --no-stream` cada `-IntervalSec` segundos (por defecto 3) y guarda una fila por
contenedor:

```
Timestamp,ElapsedSec,Container,CpuPercent,MemMiB,MemLimitMiB,Pids
```

`resources-summary.md` resume media y pico por contenedor y la RAM total del stack. El muestreo
incluye el contenedor `ticketflow-k6`, así que también se ve el coste del propio generador.

Se puede lanzar por separado:

```powershell
.\sample-resources.ps1 -OutFile .\results\manual\resources.csv -IntervalSec 2
```

Prometheus complementa el CSV: el `prometheus.yml` del gateway ahora scrapea
`catalog-service:8082/actuator/prometheus` (JVM: heap, threads, CPU del proceso). Los otros tres
servicios exponen `/actuator/metrics` pero **no** `/actuator/prometheus`, así que su CPU/RAM solo
está en el CSV hasta que se les añada `micrometer-registry-prometheus` (dependencia pendiente de
autorización).

---

## Verificar el invariante anti-sobreventa

Tras `-Scenario 06`, contrasta lo que reportó k6 con el estado real:

```powershell
.\verify-invariants.ps1 -EventId <eventId> -LocalityId <localityId> -ExpectedStock 100
```

Comprueba, contra PostgreSQL y Redis:

- cupos reservados (`PENDING` + `CONFIRMED`) == stock esperado,
- `inv:stock:{eventId}:{localityId}` == 0 y nunca negativo,
- `inv:stock:{eventId}:{localityId}:capacity` == stock esperado,
- existe al menos una reserva.

Sale con código 1 si alguna verificación falla. Para limpiar datos de prueba:

```powershell
.\reset-state.ps1                              # dry run: muestra qué haría
.\reset-state.ps1 -Yes                         # borra todas las reservas y claves inv:stock:*
.\reset-state.ps1 -EventId <eventId> -Yes      # solo ese evento
```

---

## Resultados

| Servicio | URL | Credenciales |
|---|---|---|
| Prometheus | http://localhost:9090 | — |
| Grafana | http://localhost:3001 | `admin` / `admin` |

El reporte de una sesión completa está en `results\sessions\<AAAAMMDD-HHMMSS>\SUMMARY.md`: tabla de
escenarios con PASS/FAIL, p95, req/s, fallidas, picos de RAM/CPU, invariante y duración, más el
detalle por escenario. `session.json` tiene lo mismo para procesarlo con otra herramienta.

- Prometheus arranca con `--web.enable-remote-write-receiver`, por eso acepta las métricas que
  empuja k6. Comprueba que llegaron:

  ```powershell
  Invoke-RestMethod "http://localhost:9090/api/v1/query?query=k6_http_reqs_total"
  Invoke-RestMethod "http://localhost:9090/api/v1/query?query=jvm_memory_used_bytes"
  ```

- Grafana **no** trae datasource aprovisionado. La primera vez: *Connections → Data sources →
  Add data source → Prometheus* con URL `http://prometheus:9090` (nombre del contenedor dentro de
  la red).

> El 3000 está ocupado por el frontend; por eso Grafana publica en **3001**.

---

## Notas y limitaciones

- **`429` del gateway sin cuerpo**: el `RequestRateLimiter` responde `429` con
  `content-length: 0` (solo cabeceras `X-RateLimit-*`), mientras los servicios devuelven
  `ProblemDetail`. `08` cuenta esos casos en `rate_limit_without_problem_detail`; hoy son todos.
- **El rate limit es por IP y único** (inventario 10 req/s, ráfaga 20): los escenarios de inventario
  se dimensionan por debajo (04, 06) o por encima a propósito (08).
- **Datos demo en borrador**: las migraciones del catálogo siembran 3 eventos en estado `DRAFT`, así
  que `GET /api/eventos` responde `200` con lista vacía. Los escenarios crean y publican su propio
  evento; no dependen de los datos demo.
- **Los escenarios escriben**: crean eventos, localidades, reservas y confirmaciones. No los apuntes
  a una base de datos que te importe. Usa `reset-state.ps1` para limpiar.
- **`06` espera 2 s entre iteraciones**: con 15 VUs y 1 s el tráfico de inventario (15 req/s) supera
  el límite de 10 req/s del gateway y la corrida se llena de `429` (medido: 488 de 1 669). Con 2 s
  quedan ~7 req/s, los intentos llegan al servicio y el escenario mide la sobreventa; los `429`
  deliberados son de `08`.
- **`06` exige escasez**: si `STOCK` es mayor que los intentos de reserva, el invariante no se
  ejercita. Con 15 VUs, 2 s de espera y 30 % de reservas durante 100 s hay ~250 intentos; `STOCK=100`
  agota el stock con margen.
- **`07` confirma en la misma iteración**: mide el camino completo de compra, no la expiración de
  reservas (hoy `expira_en` no se usa para liberar stock).
- **Check-in no existe**: no hay `ticketflow-checkin-service`, así que el escenario E6 del plan de
  plataforma queda bloqueado.
- **`03` sigue creando un evento de 10 000 cupos** y un solo comprador; es un smoke funcional, no una
  prueba de concurrencia.
- Ninguna corrida de este repositorio valida capacidad absoluta: en este equipo se validan
  comportamiento e invariantes (ver el plan local, §4).
