# Sesion de pruebas de carga

- Perfil: `local` (smoke)
- Escenarios: 11 de 11
- Inicio: 2026-11-22 08:04:47
- Duracion total de sesion (reloj, incluye vuelcos de requests.json): 22 min 27 s
- Duracion total de carga medida (fase main): 4 min 7 s
- Resultado global: **PASS**
- Fallidos: ninguno
- Nota: `i2` se repitió tras hacer que el `setup` espere a la proyección Kafka de DA-009; el resto de escenarios conserva su primera ejecución.

| Escenario | Resultado | Umbrales | p95 ms | req/s | Fallidas | RAM pico MiB | CPU pico % | Invariante | Duracion |
|---|---|---|---|---|---|---|---|---|---|
| 01 - E1  catalogo (listado) | PASS | OK | 27.7 | 2.65 | 0.00 % | 5631.3 | 61.4 | - | 19.2 s |
| 04 - E2  disponibilidad | PASS | OK | 10.3 | 15.18 | 0.00 % | 5634.1 | 31.1 | - | 19.9 s |
| 05 - E1b detalle de evento | PASS | OK | 22.7 | 2.66 | 0.00 % | 5634.8 | 29.9 | - | 19.2 s |
| 06 - E3  flash sale | PASS | OK | 83.9 | 3.43 | 0.00 % | 5639.4 | 33.3 | PASS | 29.1 s |
| 07 - E5  confirmacion | PASS | OK | 27.7 | 7.57 | 0.00 % | 5607.5 | 33.7 | - | 24.8 s |
| 08 - E4  degradacion | PASS | OK | 21.3 | 25.69 | 0.00 % | 5587.9 | 55.6 | - | 15.7 s |
| i1 - I1  calibracion de codo (inventario) | PASS | OK | 4.7 | 967.57 | 0.00 % | 5656.7 | 384.0 | - | 30.0 s |
| i2 - I2  disponibilidad sostenida | PASS | OK | 22.2 | 2.3 | 0.00 % | 5585.0 | 28.6 | - | 19.1 s |
| i3 - I3  flash sale directo | PASS | OK | 21.4 | 6.67 | 0.00 % | 5579.2 | 34.1 | PASS | 29.3 s |
| i4 - I4  confirmacion | PASS | OK | 27.2 | 4.01 | 0.00 % | 5577.7 | 55.3 | - | 24.2 s |
| i5 - I5  estres (degradacion) | PASS | OK | 11.1 | 1781.18 | 0.00 % | 5660.0 | 661.1 | - | 16.0 s |

## Detalle

### 01 - E1  catalogo (listado) - PASS

- Carpeta: `C:\Users\Diego\Documents\Programacion\ticketflow\ticketflow-load-test\results\sessions\20261122-080447-post-visualizacion\01-catalog`
- k6 exit code: 0
- Peticiones: 51 a 2,65 req/s (fase main) · k6 con setup: 51 a 2,52 req/s
- Latencia: p95 27,7 ms - p99 41,1 ms
- Fallidas: 0,00 %
- Checks: 1,00 %
- Ventana main: 19,2 s (k6 con setup 20,2 s · carpeta 25,0 s)
- RAM pico del stack: 5631,3 MiB - CPU pico: 61,4 %
- Archivos: 01-catalog-summary.json, 01-catalog-summary.md, console.err.log, console.out.log, requests.json, resources-summary.md, resources.csv, run.json

### 04 - E2  disponibilidad - PASS

- Carpeta: `C:\Users\Diego\Documents\Programacion\ticketflow\ticketflow-load-test\results\sessions\20261122-080447-post-visualizacion\04-availability`
- k6 exit code: 0
- Peticiones: 302 a 15,18 req/s (fase main) · k6 con setup: 308 a 14,46 req/s
- Latencia: p95 10,3 ms - p99 26,0 ms
- Fallidas: 0,00 %
- Checks: 0,80 %
- Ventana main: 19,9 s (k6 con setup 21,3 s · carpeta 26,0 s)
- RAM pico del stack: 5634,1 MiB - CPU pico: 31,1 %
- eventId: `01a2035c-6795-75b5-a4fc-edc15bcc43f7` / localityId: `01a2035c-67ad-74db-934a-d1dcfa1f8f7b`
- Archivos: 04-availability-summary.json, 04-availability-summary.md, console.err.log, console.out.log, requests.json, resources-summary.md, resources.csv, run.json

### 05 - E1b detalle de evento - PASS

- Carpeta: `C:\Users\Diego\Documents\Programacion\ticketflow\ticketflow-load-test\results\sessions\20261122-080447-post-visualizacion\05-event-detail`
- k6 exit code: 0
- Peticiones: 51 a 2,66 req/s (fase main) · k6 con setup: 57 a 2,78 req/s
- Latencia: p95 22,7 ms - p99 109,2 ms
- Fallidas: 0,00 %
- Checks: 1,00 %
- Ventana main: 19,2 s (k6 con setup 20,5 s · carpeta 25,0 s)
- RAM pico del stack: 5634,8 MiB - CPU pico: 29,9 %
- eventId: `01a2035c-d2c1-7efd-933b-029cdd912056` / localityId: `01a2035c-d2d6-71fc-a23e-e6b5b786944c`
- Archivos: 05-event-detail-summary.json, 05-event-detail-summary.md, console.err.log, console.out.log, requests.json, resources-summary.md, resources.csv, run.json

### 06 - E3  flash sale - PASS

- Carpeta: `C:\Users\Diego\Documents\Programacion\ticketflow\ticketflow-load-test\results\sessions\20261122-080447-post-visualizacion\06-flash-sale`
- k6 exit code: 0
- Peticiones: 100 a 3,43 req/s (fase main) · k6 con setup: 116 a 3,56 req/s
- Latencia: p95 83,9 ms - p99 206,3 ms
- Fallidas: 0,00 %
- Checks: 1,00 %
- Ventana main: 29,1 s (k6 con setup 32,6 s · carpeta 37,0 s)
- RAM pico del stack: 5639,4 MiB - CPU pico: 33,3 %
- Invariante: true
- eventId: `01a2035d-3d8b-7264-a04d-ad2f8183c0b6` / localityId: `01a2035d-3d9d-74e0-88ae-963fcb1dec07`
- Archivos: 06-flash-sale-summary.json, 06-flash-sale-summary.md, console.err.log, console.out.log, invariants.log, requests.json, resources-summary.md, resources.csv, run.json

### 07 - E5  confirmacion - PASS

- Carpeta: `C:\Users\Diego\Documents\Programacion\ticketflow\ticketflow-load-test\results\sessions\20261122-080447-post-visualizacion\07-confirm`
- k6 exit code: 0
- Peticiones: 188 a 7,57 req/s (fase main) · k6 con setup: 204 a 7,47 req/s
- Latencia: p95 27,7 ms - p99 199,6 ms
- Fallidas: 0,00 %
- Checks: 1,00 %
- Ventana main: 24,8 s (k6 con setup 27,3 s · carpeta 32,0 s)
- RAM pico del stack: 5607,5 MiB - CPU pico: 33,7 %
- eventId: `01a2035d-de00-7aa0-b4ea-e9f1caff6ab8` / localityId: `01a2035d-de1a-78fe-992f-83a2f4bc913d`
- Archivos: 07-confirm-summary.json, 07-confirm-summary.md, console.err.log, console.out.log, requests.json, resources-summary.md, resources.csv, run.json

### 08 - E4  degradacion - PASS

- Carpeta: `C:\Users\Diego\Documents\Programacion\ticketflow\ticketflow-load-test\results\sessions\20261122-080447-post-visualizacion\08-degradation`
- k6 exit code: 0
- Peticiones: 402 a 25,69 req/s (fase main) · k6 con setup: 418 a 23,07 req/s
- Latencia: p95 21,3 ms - p99 180,1 ms
- Fallidas: 0,00 %
- Checks: 1,00 %
- Ventana main: 15,7 s (k6 con setup 18,1 s · carpeta 22,0 s)
- RAM pico del stack: 5587,9 MiB - CPU pico: 55,6 %
- eventId: `01a2035e-60b5-7615-b85b-35596d75dba9` / localityId: `01a2035e-60c6-71bc-b882-6d548259b139`
- Archivos: 08-degradation-summary.json, 08-degradation-summary.md, console.err.log, console.out.log, requests.json, resources-summary.md, resources.csv, run.json

### i1 - I1  calibracion de codo (inventario) - PASS

- Carpeta: `C:\Users\Diego\Documents\Programacion\ticketflow\ticketflow-load-test\results\sessions\20261122-080447-post-visualizacion\01-inv-calibration`
- k6 exit code: 0
- Peticiones: 29027 a 967,57 req/s (fase main) · k6 con setup: 29033 a 959,90 req/s
- Latencia: p95 4,7 ms - p99 6,6 ms
- Fallidas: 0,00 %
- Checks: 0,99 %
- Ventana main: 30,0 s (k6 con setup 30,3 s · carpeta 534,0 s)
- RAM pico del stack: 5656,7 MiB - CPU pico: 384,0 %
- eventId: `01a2035e-bf0b-7d1a-bfe9-37aac3ecbd23` / localityId: `01a2035e-bf18-7239-a8ab-2e7b50499a61`
- Archivos: 01-inv-calibration-summary.json, 01-inv-calibration-summary.md, console.err.log, console.out.log, requests.json, resources-summary.md, resources.csv, run.json

### i2 - I2  disponibilidad sostenida - PASS

- Carpeta: `C:\Users\Diego\Documents\Programacion\ticketflow\ticketflow-load-test\results\sessions\20261122-080447-post-visualizacion\02-inv-availability`
- k6 exit code: 0
- Peticiones: 44 a 2,30 req/s (fase main) · k6 con setup: 54 a 2,48 req/s
- Latencia: p95 22,2 ms - p99 184,2 ms
- Fallidas: 0,00 %
- Checks: 1,00 %
- Ventana main: 19,1 s (k6 con setup 21,8 s · carpeta 26,0 s)
- RAM pico del stack: 5585,0 MiB - CPU pico: 28,6 %
- eventId: `01a20376-d27b-7b4a-93a4-1356a8a086b8` / localityId: `01a20376-d292-7036-922e-d684e7c5648b`
- Archivos: 02-inv-availability-summary.json, 02-inv-availability-summary.md, console.err.log, console.out.log, requests.json, resources-summary.md, resources.csv, run.json

### i3 - I3  flash sale directo - PASS

- Carpeta: `C:\Users\Diego\Documents\Programacion\ticketflow\ticketflow-load-test\results\sessions\20261122-080447-post-visualizacion\03-inv-flash-sale`
- k6 exit code: 0
- Peticiones: 195 a 6,67 req/s (fase main) · k6 con setup: 211 a 6,63 req/s
- Latencia: p95 21,4 ms - p99 246,2 ms
- Fallidas: 0,00 %
- Checks: 1,00 %
- Ventana main: 29,3 s (k6 con setup 31,8 s · carpeta 36,0 s)
- RAM pico del stack: 5579,2 MiB - CPU pico: 34,1 %
- Invariante: true
- eventId: `01a20367-507e-715b-acf3-6430a71299a2` / localityId: `01a20367-508c-70a5-a895-01edbd4ff71f`
- Archivos: 03-inv-flash-sale-summary.json, 03-inv-flash-sale-summary.md, console.err.log, console.out.log, invariants.log, requests.json, resources-summary.md, resources.csv, run.json

### i4 - I4  confirmacion - PASS

- Carpeta: `C:\Users\Diego\Documents\Programacion\ticketflow\ticketflow-load-test\results\sessions\20261122-080447-post-visualizacion\04-inv-confirm`
- k6 exit code: 0
- Peticiones: 97 a 4,01 req/s (fase main) · k6 con setup: 133 a 4,81 req/s
- Latencia: p95 27,2 ms - p99 406,0 ms
- Fallidas: 0,00 %
- Checks: 1,00 %
- Ventana main: 24,2 s (k6 con setup 27,6 s · carpeta 33,0 s)
- RAM pico del stack: 5577,7 MiB - CPU pico: 55,3 %
- eventId: `01a20367-f42a-7a34-9374-cd662add8b6a` / localityId: `01a20367-f43f-7e91-a20f-2cf4cd5eef80`
- Archivos: 04-inv-confirm-summary.json, 04-inv-confirm-summary.md, console.err.log, console.out.log, requests.json, resources-summary.md, resources.csv, run.json

### i5 - I5  estres (degradacion) - PASS

- Carpeta: `C:\Users\Diego\Documents\Programacion\ticketflow\ticketflow-load-test\results\sessions\20261122-080447-post-visualizacion\05-inv-stress`
- k6 exit code: 0
- Peticiones: 28481 a 1781,18 req/s (fase main) · k6 con setup: 28527 a 1292,90 req/s
- Latencia: p95 11,1 ms - p99 14,5 ms
- Fallidas: 0,00 %
- Checks: 1,00 %
- Ventana main: 16,0 s (k6 con setup 22,1 s · carpeta 529,0 s)
- RAM pico del stack: 5660,0 MiB - CPU pico: 661,1 %
- eventId: `01a20368-7872-707a-8e5c-cbd20e634a3f` / localityId: `01a20368-7886-7714-87a5-e3f4185b1122`
- Archivos: 05-inv-stress-summary.json, 05-inv-stress-summary.md, console.err.log, console.out.log, requests.json, resources-summary.md, resources.csv, run.json
