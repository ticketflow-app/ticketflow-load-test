# Sesion de pruebas de carga

- Perfil: `local` (smoke)
- Escenarios: 5 de 5
- Inicio: 2026-11-15 07:46:12
- Duracion total: 2 min 42 s
- Resultado global: **FAIL**
- Fallidos: i3, i4, i5

| Escenario | Resultado | Umbrales | p95 ms | req/s | Fallidas | RAM pico MiB | CPU pico % | Invariante | Duracion |
|---|---|---|---|---|---|---|---|---|---|
| i1 - I1  calibracion de codo (inventario) | PASS | OK | 3.8 | 1081.2 | 0.00 % | 3279.6 | 431.2 | - | 36.3 s |
| i2 - I2  disponibilidad sostenida | PASS | OK | 21.3 | 2.4 | 0.00 % | 3262.1 | 9.6 | - | 25.7 s |
| i3 - I3  flash sale directo | FAIL | FALLO | 13.4 | 6.6 | 22.27 % | 3274.8 | 81.7 | PASS | 37.8 s |
| i4 - I4  confirmacion | FAIL | FALLO | 16.8 | 4.9 | 72.18 % | 3334.6 | 98.6 | - | 33.3 s |
| i5 - I5  estres (degradacion) | FAIL | FALLO | 4.3 | 3166.2 | 99.77 % | 3390.5 | 572.2 | - | 25.7 s |

## Detalle

### i1 - I1  calibracion de codo (inventario) - PASS

- Carpeta: `C:\Users\pipey\OneDrive\Documents\Universidad\Semestre 2026-2\Materias\Proyecto_Integrador\load-test\results\sessions\20261115-074612\01-inv-calibration`
- k6 exit code: 0
- Peticiones: 32880.0 a 1081.2 req/s
- Latencia: p95 3.8 ms - p99 4.9 ms
- Fallidas: 0.00 %
- Checks: 100.00 %
- RAM pico del stack: 3279.6 MiB - CPU pico: 431.2 %
- eventId: `01a1df3e-7b4f-707a-be23-33000fabdff4` / localityId: `01a1df3e-7b58-73cd-b3db-53ca3bc2dbaa`
- Archivos: summary.json, summary.md, resources.csv, resources-summary.md, console.out.log, console.err.log, invariants.log

### i2 - I2  disponibilidad sostenida - PASS

- Carpeta: `C:\Users\pipey\OneDrive\Documents\Universidad\Semestre 2026-2\Materias\Proyecto_Integrador\load-test\results\sessions\20261115-074612\02-inv-availability`
- k6 exit code: 0
- Peticiones: 50.0 a 2.4 req/s
- Latencia: p95 21.3 ms - p99 173.4 ms
- Fallidas: 0.00 %
- Checks: 100.00 %
- RAM pico del stack: 3262.1 MiB - CPU pico: 9.6 %
- eventId: `01a1df3f-09ab-7e31-9993-736bd86edee9` / localityId: `01a1df3f-09ba-7331-b53c-f0deb9f82fe3`
- Archivos: summary.json, summary.md, resources.csv, resources-summary.md, console.out.log, console.err.log, invariants.log

### i3 - I3  flash sale directo - FAIL

- Carpeta: `C:\Users\pipey\OneDrive\Documents\Universidad\Semestre 2026-2\Materias\Proyecto_Integrador\load-test\results\sessions\20261115-074612\03-inv-flash-sale`
- Motivo: k6 exit 99, umbrales
- k6 exit code: 99
- Peticiones: 211.0 a 6.6 req/s
- Latencia: p95 13.4 ms - p99 228.7 ms
- Fallidas: 22.27 %
- Checks: 100.00 %
- RAM pico del stack: 3274.8 MiB - CPU pico: 81.7 %
- eventId: `01a1df3f-6d01-7082-9566-1401626d742b` / localityId: `01a1df3f-6d0b-7718-bc24-727f3d439bc8`
- Invariante anti-sobreventa: PASS (stock 5)
- Archivos: summary.json, summary.md, resources.csv, resources-summary.md, console.out.log, console.err.log, invariants.log

### i4 - I4  confirmacion - FAIL

- Carpeta: `C:\Users\pipey\OneDrive\Documents\Universidad\Semestre 2026-2\Materias\Proyecto_Integrador\load-test\results\sessions\20261115-074612\04-inv-confirm`
- Motivo: k6 exit 99, umbrales
- k6 exit code: 99
- Peticiones: 133.0 a 4.9 req/s
- Latencia: p95 16.8 ms - p99 361.1 ms
- Fallidas: 72.18 %
- Checks: 8.08 %
- RAM pico del stack: 3334.6 MiB - CPU pico: 98.6 %
- eventId: `01a1df40-0cea-7e72-a876-84aec0ce4ce1` / localityId: `01a1df40-0cf3-7a1f-a207-ef7b39c09d39`
- Archivos: summary.json, summary.md, resources.csv, resources-summary.md, console.out.log, console.err.log, invariants.log

### i5 - I5  estres (degradacion) - FAIL

- Carpeta: `C:\Users\pipey\OneDrive\Documents\Universidad\Semestre 2026-2\Materias\Proyecto_Integrador\load-test\results\sessions\20261115-074612\05-inv-stress`
- Motivo: k6 exit 99, umbrales
- k6 exit code: 99
- Peticiones: 62997.0 a 3166.2 req/s
- Latencia: p95 4.3 ms - p99 8.3 ms
- Fallidas: 99.77 %
- Checks: 100.00 %
- RAM pico del stack: 3390.5 MiB - CPU pico: 572.2 %
- eventId: `01a1df40-8eb4-7881-938a-8d3d8a5de973` / localityId: `01a1df40-8ebf-71ad-ae4e-75f87279e3ce`
- Archivos: summary.json, summary.md, resources.csv, resources-summary.md, console.out.log, console.err.log, invariants.log

## Como leerlo

- **Umbrales**: gates de regresion. `local` es el perfil de este equipo; `sla` usa los valores del plan de plataforma.
- **Invariante**: solo E3. Contrasta el resultado de k6 con PostgreSQL y Redis (`verify-invariants.ps1`).
- **RAM/CPU pico**: suma de todos los contenedores `ticketflow-*` muestreados cada N segundos durante ese escenario.
- Un escenario FAIL no invalida los demas: cada uno tiene su propia carpeta y su propio veredicto.
