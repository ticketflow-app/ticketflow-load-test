# Sesion de pruebas de carga

- Perfil: `local` (smoke)
- Escenarios: 5 de 5
- Inicio: 2026-11-15 09:02:55
- Duracion total: 2 min 38 s
- Resultado global: **PASS**

| Escenario | Resultado | Umbrales | p95 ms | req/s | Fallidas | RAM pico MiB | CPU pico % | Invariante | Duracion |
|---|---|---|---|---|---|---|---|---|---|
| i1 - I1  calibracion de codo (inventario) | PASS | OK | 3.9 | 1068.8 | 0.00 % | 3515.8 | 422.5 | - | 39.3 s |
| i2 - I2  disponibilidad sostenida | PASS | OK | 14.3 | 2.4 | 0.00 % | 3491.5 | 7.5 | - | 25.7 s |
| i3 - I3  flash sale directo | PASS | OK | 9.9 | 6.6 | 0.00 % | 3487.7 | 13.5 | PASS | 36.3 s |
| i4 - I4  confirmacion | PASS | OK | 17.4 | 5.0 | 0.00 % | 3491.9 | 16.1 | - | 31.7 s |
| i5 - I5  estres (degradacion) | PASS | OK | 4.4 | 3206.5 | 0.00 % | 3537.7 | 567.0 | - | 24.2 s |

## Detalle

### i1 - I1  calibracion de codo (inventario) - PASS

- Carpeta: `C:\Users\pipey\OneDrive\Documents\Universidad\Semestre 2026-2\Materias\Proyecto_Integrador\load-test\results\sessions\20261115-090255\01-inv-calibration`
- k6 exit code: 0
- Peticiones: 34096.0 a 1068.8 req/s
- Latencia: p95 3.9 ms - p99 5.7 ms
- Fallidas: 0.00 %
- Checks: 100.00 %
- RAM pico del stack: 3515.8 MiB - CPU pico: 422.5 %
- eventId: `01a1df84-c85c-7bc3-80c5-abba96555478` / localityId: `01a1df84-c8c5-7b1c-9048-035f26797197`
- Archivos: summary.json, summary.md, resources.csv, resources-summary.md, console.out.log, console.err.log, invariants.log

### i2 - I2  disponibilidad sostenida - PASS

- Carpeta: `C:\Users\pipey\OneDrive\Documents\Universidad\Semestre 2026-2\Materias\Proyecto_Integrador\load-test\results\sessions\20261115-090255\02-inv-availability`
- k6 exit code: 0
- Peticiones: 50.0 a 2.4 req/s
- Latencia: p95 14.3 ms - p99 232.8 ms
- Fallidas: 0.00 %
- Checks: 100.00 %
- RAM pico del stack: 3491.5 MiB - CPU pico: 7.5 %
- eventId: `01a1df85-51aa-7dfa-a949-b869bb89d4dc` / localityId: `01a1df85-51b4-77ae-a708-3825e6e0c49e`
- Archivos: summary.json, summary.md, resources.csv, resources-summary.md, console.out.log, console.err.log, invariants.log

### i3 - I3  flash sale directo - PASS

- Carpeta: `C:\Users\pipey\OneDrive\Documents\Universidad\Semestre 2026-2\Materias\Proyecto_Integrador\load-test\results\sessions\20261115-090255\03-inv-flash-sale`
- k6 exit code: 0
- Peticiones: 211.0 a 6.6 req/s
- Latencia: p95 9.9 ms - p99 304.4 ms
- Fallidas: 0.00 %
- Checks: 100.00 %
- RAM pico del stack: 3487.7 MiB - CPU pico: 13.5 %
- eventId: `01a1df85-b614-7ef8-9429-2690701ec814` / localityId: `01a1df85-b61d-7982-82a0-5c372f4b0d06`
- Invariante anti-sobreventa: PASS (stock 5)
- Archivos: summary.json, summary.md, resources.csv, resources-summary.md, console.out.log, console.err.log, invariants.log

### i4 - I4  confirmacion - PASS

- Carpeta: `C:\Users\pipey\OneDrive\Documents\Universidad\Semestre 2026-2\Materias\Proyecto_Integrador\load-test\results\sessions\20261115-090255\04-inv-confirm`
- k6 exit code: 0
- Peticiones: 133.0 a 5.0 req/s
- Latencia: p95 17.4 ms - p99 199.5 ms
- Fallidas: 0.00 %
- Checks: 100.00 %
- RAM pico del stack: 3491.9 MiB - CPU pico: 16.1 %
- eventId: `01a1df86-48b9-7c59-9562-b4262fa6f149` / localityId: `01a1df86-48c6-7842-8f32-a583e941ced0`
- Archivos: summary.json, summary.md, resources.csv, resources-summary.md, console.out.log, console.err.log, invariants.log

### i5 - I5  estres (degradacion) - PASS

- Carpeta: `C:\Users\pipey\OneDrive\Documents\Universidad\Semestre 2026-2\Materias\Proyecto_Integrador\load-test\results\sessions\20261115-090255\05-inv-stress`
- k6 exit code: 0
- Peticiones: 62067.0 a 3206.5 req/s
- Latencia: p95 4.4 ms - p99 7.4 ms
- Fallidas: 0.00 %
- Checks: 100.00 %
- RAM pico del stack: 3537.7 MiB - CPU pico: 567.0 %
- eventId: `01a1df86-c4b2-7c1d-8ba2-98904c0635e6` / localityId: `01a1df86-c4bd-77f2-9623-460b5d882931`
- Archivos: summary.json, summary.md, resources.csv, resources-summary.md, console.out.log, console.err.log, invariants.log

## Como leerlo

- **Umbrales**: gates de regresion. `local` es el perfil de este equipo; `sla` usa los valores del plan de plataforma.
- **Invariante**: solo E3. Contrasta el resultado de k6 con PostgreSQL y Redis (`verify-invariants.ps1`).
- **RAM/CPU pico**: suma de todos los contenedores `ticketflow-*` muestreados cada N segundos durante ese escenario.
- Un escenario FAIL no invalida los demas: cada uno tiene su propia carpeta y su propio veredicto.
