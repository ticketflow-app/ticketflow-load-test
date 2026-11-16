# Sesion de pruebas de carga

- Perfil: `local`
- Escenarios: 6 de 6
- Inicio: 2026-11-15 09:35:25
- Duracion total: 9 min 50 s
- Resultado global: **PASS**

| Escenario | Resultado | Umbrales | p95 ms | req/s | Fallidas | RAM pico MiB | CPU pico % | Invariante | Duracion |
|---|---|---|---|---|---|---|---|---|---|
| 01 - E1  catalogo (listado) | PASS | OK | 4.4 | 11.8 | 0.00 % | 3589.5 | 17.5 | - | 105.7 s |
| 04 - E2  disponibilidad | PASS | OK | 6.4 | 4.6 | 0.00 % | 3583.2 | 11.6 | - | 105.7 s |
| 05 - E1b detalle de evento | PASS | OK | 3.8 | 11.9 | 0.00 % | 3591.3 | 24.1 | - | 105.7 s |
| 06 - E3  flash sale | PASS | OK | 7.6 | 7.0 | 0.00 % | 3594.8 | 11.7 | PASS | 128.2 s |
| 07 - E5  confirmacion | PASS | OK | 8.1 | 11.8 | 0.00 % | 3600.8 | 24.2 | - | 77.0 s |
| 08 - E4  degradacion | PASS | OK | 7.6 | 36.2 | 0.00 % | 3613.4 | 19.6 | - | 66.4 s |

## Detalle

### 01 - E1  catalogo (listado) - PASS

- Carpeta: `C:\Users\pipey\OneDrive\Documents\Universidad\Semestre 2026-2\Materias\Proyecto_Integrador\load-test\results\sessions\20261115-093525\01-catalog`
- k6 exit code: 0
- Peticiones: 1187.0 a 11.8 req/s
- Latencia: p95 4.4 ms - p99 6.9 ms
- Fallidas: 0.00 %
- Checks: 100.00 %
- RAM pico del stack: 3589.5 MiB - CPU pico: 17.5 %
- Archivos: summary.json, summary.md, resources.csv, resources-summary.md, console.out.log, console.err.log, invariants.log

### 04 - E2  disponibilidad - PASS

- Carpeta: `C:\Users\pipey\OneDrive\Documents\Universidad\Semestre 2026-2\Materias\Proyecto_Integrador\load-test\results\sessions\20261115-093525\04-availability`
- k6 exit code: 0
- Peticiones: 468.0 a 4.6 req/s
- Latencia: p95 6.4 ms - p99 13.5 ms
- Fallidas: 0.00 %
- Checks: 100.00 %
- RAM pico del stack: 3583.2 MiB - CPU pico: 11.6 %
- eventId: `01a1dfa4-14d5-7f52-bbdd-9a89241a7890` / localityId: `01a1dfa4-14e1-7a30-be87-a768636a3d97`
- Archivos: summary.json, summary.md, resources.csv, resources-summary.md, console.out.log, console.err.log, invariants.log

### 05 - E1b detalle de evento - PASS

- Carpeta: `C:\Users\pipey\OneDrive\Documents\Universidad\Semestre 2026-2\Materias\Proyecto_Integrador\load-test\results\sessions\20261115-093525\05-event-detail`
- k6 exit code: 0
- Peticiones: 1194.0 a 11.9 req/s
- Latencia: p95 3.8 ms - p99 7.7 ms
- Fallidas: 0.00 %
- Checks: 100.00 %
- RAM pico del stack: 3591.3 MiB - CPU pico: 24.1 %
- eventId: `01a1dfa5-b157-7d9e-bdd6-edf6079daf5d` / localityId: `01a1dfa5-b162-7060-a4c1-c86f71d71906`
- Archivos: summary.json, summary.md, resources.csv, resources-summary.md, console.out.log, console.err.log, invariants.log

### 06 - E3  flash sale - PASS

- Carpeta: `C:\Users\pipey\OneDrive\Documents\Universidad\Semestre 2026-2\Materias\Proyecto_Integrador\load-test\results\sessions\20261115-093525\06-flash-sale`
- k6 exit code: 0
- Peticiones: 859.0 a 7.0 req/s
- Latencia: p95 7.6 ms - p99 125.5 ms
- Fallidas: 0.00 %
- Checks: 100.00 %
- RAM pico del stack: 3594.8 MiB - CPU pico: 11.7 %
- eventId: `01a1dfa7-4e76-7419-b75d-f7571dfbbcf4` / localityId: `01a1dfa7-4e84-71fc-a4f3-2cb0971a2418`
- Invariante anti-sobreventa: PASS (stock 100)
- Archivos: summary.json, summary.md, resources.csv, resources-summary.md, console.out.log, console.err.log, invariants.log

### 07 - E5  confirmacion - PASS

- Carpeta: `C:\Users\pipey\OneDrive\Documents\Universidad\Semestre 2026-2\Materias\Proyecto_Integrador\load-test\results\sessions\20261115-093525\07-confirm`
- k6 exit code: 0
- Peticiones: 852.0 a 11.8 req/s
- Latencia: p95 8.1 ms - p99 29.2 ms
- Fallidas: 0.00 %
- Checks: 100.00 %
- RAM pico del stack: 3600.8 MiB - CPU pico: 24.2 %
- eventId: `01a1dfa9-49d3-7c82-ad0c-6faab582f74c` / localityId: `01a1dfa9-49df-77c3-a85c-d2789c83b480`
- Archivos: summary.json, summary.md, resources.csv, resources-summary.md, console.out.log, console.err.log, invariants.log

### 08 - E4  degradacion - PASS

- Carpeta: `C:\Users\pipey\OneDrive\Documents\Universidad\Semestre 2026-2\Materias\Proyecto_Integrador\load-test\results\sessions\20261115-093525\08-degradation`
- k6 exit code: 0
- Peticiones: 2231.0 a 36.2 req/s
- Latencia: p95 7.6 ms - p99 64.4 ms
- Fallidas: 0.00 %
- Checks: 100.00 %
- RAM pico del stack: 3613.4 MiB - CPU pico: 19.6 %
- eventId: `01a1dfaa-7670-7528-a3b7-c5e2269e08d7` / localityId: `01a1dfaa-7679-7b87-b61b-c220548b1387`
- Archivos: summary.json, summary.md, resources.csv, resources-summary.md, console.out.log, console.err.log, invariants.log

## Como leerlo

- **Umbrales**: gates de regresion. `local` es el perfil de este equipo; `sla` usa los valores del plan de plataforma.
- **Invariante**: solo E3. Contrasta el resultado de k6 con PostgreSQL y Redis (`verify-invariants.ps1`).
- **RAM/CPU pico**: suma de todos los contenedores `ticketflow-*` muestreados cada N segundos durante ese escenario.
- Un escenario FAIL no invalida los demas: cada uno tiene su propia carpeta y su propio veredicto.
