# Sesion de pruebas de carga

- Perfil: `local`
- Escenarios: 6 de 6
- Inicio: 2026-11-15 09:14:27
- Duracion total: 9 min 55 s
- Resultado global: **PASS**

| Escenario | Resultado | Umbrales | p95 ms | req/s | Fallidas | RAM pico MiB | CPU pico % | Invariante | Duracion |
|---|---|---|---|---|---|---|---|---|---|
| 01 - E1  catalogo (listado) | PASS | OK | 9.8 | 11.7 | 0.00 % | 3545.0 | 42.8 | - | 105.8 s |
| 04 - E2  disponibilidad | PASS | OK | 9.0 | 4.6 | 0.00 % | 3550.0 | 21.4 | - | 107.2 s |
| 05 - E1b detalle de evento | PASS | OK | 5.2 | 11.8 | 0.00 % | 3552.9 | 39.9 | - | 105.7 s |
| 06 - E3  flash sale | PASS | OK | 10.4 | 6.9 | 0.00 % | 3558.6 | 88.3 | PASS | 129.9 s |
| 07 - E5  confirmacion | PASS | OK | 9.2 | 11.9 | 0.00 % | 3582.1 | 20.2 | - | 77.2 s |
| 08 - E4  degradacion | PASS | OK | 6.5 | 35.4 | 0.00 % | 3584.4 | 24.7 | - | 67.9 s |

## Detalle

### 01 - E1  catalogo (listado) - PASS

- Carpeta: `C:\Users\pipey\OneDrive\Documents\Universidad\Semestre 2026-2\Materias\Proyecto_Integrador\load-test\results\sessions\20261115-091427\01-catalog`
- k6 exit code: 0
- Peticiones: 1181.0 a 11.7 req/s
- Latencia: p95 9.8 ms - p99 23.0 ms
- Fallidas: 0.00 %
- Checks: 100.00 %
- RAM pico del stack: 3545.0 MiB - CPU pico: 42.8 %
- Archivos: summary.json, summary.md, resources.csv, resources-summary.md, console.out.log, console.err.log, invariants.log

### 04 - E2  disponibilidad - PASS

- Carpeta: `C:\Users\pipey\OneDrive\Documents\Universidad\Semestre 2026-2\Materias\Proyecto_Integrador\load-test\results\sessions\20261115-091427\04-availability`
- k6 exit code: 0
- Peticiones: 467.0 a 4.6 req/s
- Latencia: p95 9.0 ms - p99 20.7 ms
- Fallidas: 0.00 %
- Checks: 100.00 %
- RAM pico del stack: 3550.0 MiB - CPU pico: 21.4 %
- eventId: `01a1df90-e4b5-71c6-b4e6-d79efa21ba42` / localityId: `01a1df90-e4c9-760f-a074-d80cb8d11880`
- Archivos: summary.json, summary.md, resources.csv, resources-summary.md, console.out.log, console.err.log, invariants.log

### 05 - E1b detalle de evento - PASS

- Carpeta: `C:\Users\pipey\OneDrive\Documents\Universidad\Semestre 2026-2\Materias\Proyecto_Integrador\load-test\results\sessions\20261115-091427\05-event-detail`
- k6 exit code: 0
- Peticiones: 1192.0 a 11.8 req/s
- Latencia: p95 5.2 ms - p99 10.9 ms
- Fallidas: 0.00 %
- Checks: 100.00 %
- RAM pico del stack: 3552.9 MiB - CPU pico: 39.9 %
- eventId: `01a1df92-8513-7313-b463-218572a320fc` / localityId: `01a1df92-8524-7526-9a0a-bd9709a53293`
- Archivos: summary.json, summary.md, resources.csv, resources-summary.md, console.out.log, console.err.log, invariants.log

### 06 - E3  flash sale - PASS

- Carpeta: `C:\Users\pipey\OneDrive\Documents\Universidad\Semestre 2026-2\Materias\Proyecto_Integrador\load-test\results\sessions\20261115-091427\06-flash-sale`
- k6 exit code: 0
- Peticiones: 858.0 a 6.9 req/s
- Latencia: p95 10.4 ms - p99 163.7 ms
- Fallidas: 0.00 %
- Checks: 100.00 %
- RAM pico del stack: 3558.6 MiB - CPU pico: 88.3 %
- eventId: `01a1df94-21e8-70b6-b165-de1ffe44d5ac` / localityId: `01a1df94-21f6-7ff8-843e-8e812cdf0221`
- Invariante anti-sobreventa: PASS (stock 100)
- Archivos: summary.json, summary.md, resources.csv, resources-summary.md, console.out.log, console.err.log, invariants.log

### 07 - E5  confirmacion - PASS

- Carpeta: `C:\Users\pipey\OneDrive\Documents\Universidad\Semestre 2026-2\Materias\Proyecto_Integrador\load-test\results\sessions\20261115-091427\07-confirm`
- k6 exit code: 0
- Peticiones: 868.0 a 11.9 req/s
- Latencia: p95 9.2 ms - p99 141.0 ms
- Fallidas: 0.00 %
- Checks: 100.00 %
- RAM pico del stack: 3582.1 MiB - CPU pico: 20.2 %
- eventId: `01a1df96-2327-7c69-b5b0-20620e5c2384` / localityId: `01a1df96-2332-78d4-8639-625e84abc15c`
- Archivos: summary.json, summary.md, resources.csv, resources-summary.md, console.out.log, console.err.log, invariants.log

### 08 - E4  degradacion - PASS

- Carpeta: `C:\Users\pipey\OneDrive\Documents\Universidad\Semestre 2026-2\Materias\Proyecto_Integrador\load-test\results\sessions\20261115-091427\08-degradation`
- k6 exit code: 0
- Peticiones: 2233.0 a 35.4 req/s
- Latencia: p95 6.5 ms - p99 8.8 ms
- Fallidas: 0.00 %
- Checks: 100.00 %
- RAM pico del stack: 3584.4 MiB - CPU pico: 24.7 %
- eventId: `01a1df97-50e4-74bb-be1b-546306fb5576` / localityId: `01a1df97-50f5-7e78-a154-65705f06c868`
- Archivos: summary.json, summary.md, resources.csv, resources-summary.md, console.out.log, console.err.log, invariants.log

## Como leerlo

- **Umbrales**: gates de regresion. `local` es el perfil de este equipo; `sla` usa los valores del plan de plataforma.
- **Invariante**: solo E3. Contrasta el resultado de k6 con PostgreSQL y Redis (`verify-invariants.ps1`).
- **RAM/CPU pico**: suma de todos los contenedores `ticketflow-*` muestreados cada N segundos durante ese escenario.
- Un escenario FAIL no invalida los demas: cada uno tiene su propia carpeta y su propio veredicto.
