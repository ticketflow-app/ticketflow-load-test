# Sesion de pruebas de carga

- Perfil: `local`
- Escenarios: 3 de 3
- Inicio: 2026-11-21 21:53:31
- Duracion total: 36 min 39 s
- Resultado global: **PASS**

| Escenario | Resultado | Umbrales | p95 ms | req/s | Fallidas | RAM pico MiB | CPU pico % | Invariante | Duracion |
|---|---|---|---|---|---|---|---|---|---|
| i1 - I1  calibracion de codo (inventario) | PASS | OK | 29.3 | 2098.6 | 0.00 % | 3391.8 | 11.6 | - | 166.2 s |
| i2 - I2  disponibilidad sostenida | PASS | OK | 10.2 | 10.1 | 0.00 % | 5456.5 | 68.4 | - | 129.8 s |
| i3 - I3  flash sale directo | PASS | OK | 21.0 | 0.9 | 0.00 % | 5428.3 | 8.0 | PASS | 1900.1 s |

## Detalle

### i1 - I1  calibracion de codo (inventario) - PASS

- Carpeta: `C:\Users\Diego\Documents\Programacion\ticketflow\ticketflow-load-test\results\sessions\20261121-215331-post-da009\01-inv-calibration`
- k6 exit code: 0
- Peticiones: 319098.0 a 2098.6 req/s
- Latencia: p95 29.3 ms - p99 40.2 ms
- Fallidas: 0.00 %
- Checks: 99.99 %
- RAM pico del stack: 3391.8 MiB - CPU pico: 11.6 %
- eventId: `01a2012c-8886-7408-8716-74818728d275` / localityId: `01a2012c-8912-70c2-af9d-848f69906b21`
- Archivos: summary.json, summary.md, resources.csv, resources-summary.md, console.out.log, console.err.log, invariants.log

### i2 - I2  disponibilidad sostenida - PASS

- Carpeta: `C:\Users\Diego\Documents\Programacion\ticketflow\ticketflow-load-test\results\sessions\20261121-215331-post-da009\02-inv-availability`
- k6 exit code: 0
- Peticiones: 1227.0 a 10.1 req/s
- Latencia: p95 10.2 ms - p99 14.1 ms
- Fallidas: 0.00 %
- Checks: 99.96 %
- RAM pico del stack: 5456.5 MiB - CPU pico: 68.4 %
- eventId: `01a2012e-ee10-7d82-8c0e-3cc980661d9f` / localityId: `01a2012e-ee3d-7936-9f55-411a744addb9`
- Archivos: summary.json, summary.md, resources.csv, resources-summary.md, console.out.log, console.err.log, invariants.log

### i3 - I3  flash sale directo - PASS

- Carpeta: `C:\Users\Diego\Documents\Programacion\ticketflow\ticketflow-load-test\results\sessions\20261121-215331-post-da009\03-inv-flash-sale`
- k6 exit code: 0
- Peticiones: 1683.0 a 0.9 req/s
- Latencia: p95 21.0 ms - p99 354.0 ms
- Fallidas: 0.00 %
- Checks: 100.00 %
- RAM pico del stack: 5428.3 MiB - CPU pico: 8.0 %
- eventId: `01a20130-ef25-7fbd-83d3-7bde1d34e2ad` / localityId: `01a20130-ef9e-7334-aa33-46703ec864f3`
- Invariante anti-sobreventa: PASS (stock 100)
- Archivos: summary.json, summary.md, resources.csv, resources-summary.md, console.out.log, console.err.log, invariants.log

## Como leerlo

- **Umbrales**: gates de regresion. `local` es el perfil de este equipo; `sla` usa los valores del plan de plataforma.
- **Invariante**: solo E3. Contrasta el resultado de k6 con PostgreSQL y Redis (`verify-invariants.ps1`).
- **RAM/CPU pico**: suma de todos los contenedores `ticketflow-*` muestreados cada N segundos durante ese escenario.
- Un escenario FAIL no invalida los demas: cada uno tiene su propia carpeta y su propio veredicto.
