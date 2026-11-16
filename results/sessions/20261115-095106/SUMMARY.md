# Sesion de pruebas de carga

- Perfil: `local`
- Escenarios: 5 de 5
- Inicio: 2026-11-15 09:51:06
- Duracion total: 9 min 23 s
- Resultado global: **PASS**

| Escenario | Resultado | Umbrales | p95 ms | req/s | Fallidas | RAM pico MiB | CPU pico % | Invariante | Duracion |
|---|---|---|---|---|---|---|---|---|---|
| i1 - I1  calibracion de codo (inventario) | PASS | OK | 18.7 | 3317.5 | 0.00 % | 3944.6 | 870.0 | - | 155.5 s |
| i2 - I2  disponibilidad sostenida | PASS | OK | 3.9 | 10.2 | 0.00 % | 3725.3 | 12.6 | - | 125.2 s |
| i3 - I3  flash sale directo | PASS | OK | 4.1 | 13.6 | 0.00 % | 3731.1 | 82.2 | PASS | 129.8 s |
| i4 - I4  confirmacion | PASS | OK | 4.3 | 9.0 | 0.00 % | 3731.2 | 14.4 | - | 75.4 s |
| i5 - I5  estres (degradacion) | PASS | OK | 12.3 | 4135.3 | 0.00 % | 3878.6 | 556.6 | - | 75.5 s |

## Detalle

### i1 - I1  calibracion de codo (inventario) - PASS

- Carpeta: `C:\Users\pipey\OneDrive\Documents\Universidad\Semestre 2026-2\Materias\Proyecto_Integrador\load-test\results\sessions\20261115-095106\01-inv-calibration`
- k6 exit code: 0
- Peticiones: 498696.0 a 3317.5 req/s
- Latencia: p95 18.7 ms - p99 25.3 ms
- Fallidas: 0.00 %
- Checks: 100.00 %
- RAM pico del stack: 3944.6 MiB - CPU pico: 870.0 %
- eventId: `01a1dfb0-d423-7a9c-b3ce-005056714375` / localityId: `01a1dfb0-d433-7011-a508-eec1c060e74b`
- Archivos: summary.json, summary.md, resources.csv, resources-summary.md, console.out.log, console.err.log, invariants.log

### i2 - I2  disponibilidad sostenida - PASS

- Carpeta: `C:\Users\pipey\OneDrive\Documents\Universidad\Semestre 2026-2\Materias\Proyecto_Integrador\load-test\results\sessions\20261115-095106\02-inv-availability`
- k6 exit code: 0
- Peticiones: 1231.0 a 10.2 req/s
- Latencia: p95 3.9 ms - p99 5.9 ms
- Fallidas: 0.00 %
- Checks: 100.00 %
- RAM pico del stack: 3725.3 MiB - CPU pico: 12.6 %
- eventId: `01a1dfb3-33d8-7a1d-a8c9-ac8d478482da` / localityId: `01a1dfb3-33e3-7997-b83b-e3eaac55ee34`
- Archivos: summary.json, summary.md, resources.csv, resources-summary.md, console.out.log, console.err.log, invariants.log

### i3 - I3  flash sale directo - PASS

- Carpeta: `C:\Users\pipey\OneDrive\Documents\Universidad\Semestre 2026-2\Materias\Proyecto_Integrador\load-test\results\sessions\20261115-095106\03-inv-flash-sale`
- k6 exit code: 0
- Peticiones: 1693.0 a 13.6 req/s
- Latencia: p95 4.1 ms - p99 140.6 ms
- Fallidas: 0.00 %
- Checks: 100.00 %
- RAM pico del stack: 3731.1 MiB - CPU pico: 82.2 %
- eventId: `01a1dfb5-1d4c-752b-8ef5-247d6bc2a0c8` / localityId: `01a1dfb5-1d56-7884-a9f3-82a6deb15e06`
- Invariante anti-sobreventa: PASS (stock 100)
- Archivos: summary.json, summary.md, resources.csv, resources-summary.md, console.out.log, console.err.log, invariants.log

### i4 - I4  confirmacion - PASS

- Carpeta: `C:\Users\pipey\OneDrive\Documents\Universidad\Semestre 2026-2\Materias\Proyecto_Integrador\load-test\results\sessions\20261115-095106\04-inv-confirm`
- k6 exit code: 0
- Peticiones: 644.0 a 9.0 req/s
- Latencia: p95 4.3 ms - p99 12.6 ms
- Fallidas: 0.00 %
- Checks: 100.00 %
- RAM pico del stack: 3731.2 MiB - CPU pico: 14.4 %
- eventId: `01a1dfb7-1db8-7411-a6f3-94cc23a36e77` / localityId: `01a1dfb7-1dc1-7138-8549-a3d503ad78cb`
- Archivos: summary.json, summary.md, resources.csv, resources-summary.md, console.out.log, console.err.log, invariants.log

### i5 - I5  estres (degradacion) - PASS

- Carpeta: `C:\Users\pipey\OneDrive\Documents\Universidad\Semestre 2026-2\Materias\Proyecto_Integrador\load-test\results\sessions\20261115-095106\05-inv-stress`
- k6 exit code: 0
- Peticiones: 292083.0 a 4135.3 req/s
- Latencia: p95 12.3 ms - p99 18.0 ms
- Fallidas: 0.00 %
- Checks: 100.00 %
- RAM pico del stack: 3878.6 MiB - CPU pico: 556.6 %
- eventId: `01a1dfb8-44d2-7ef4-bbac-c112c8e936e6` / localityId: `01a1dfb8-44da-7ff9-81ee-52a5f01ee299`
- Archivos: summary.json, summary.md, resources.csv, resources-summary.md, console.out.log, console.err.log, invariants.log

## Como leerlo

- **Umbrales**: gates de regresion. `local` es el perfil de este equipo; `sla` usa los valores del plan de plataforma.
- **Invariante**: solo E3. Contrasta el resultado de k6 con PostgreSQL y Redis (`verify-invariants.ps1`).
- **RAM/CPU pico**: suma de todos los contenedores `ticketflow-*` muestreados cada N segundos durante ese escenario.
- Un escenario FAIL no invalida los demas: cada uno tiene su propia carpeta y su propio veredicto.
