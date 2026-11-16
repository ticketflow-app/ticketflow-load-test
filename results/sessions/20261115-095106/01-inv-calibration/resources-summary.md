# Recursos - 01-inv-calibration

- Perfil: local
- Stages: 30s:10, 30s:25, 30s:50, 30s:75, 30s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 30

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-catalog-service | 209.54 | 585.28 | 742.4 | 758.0 |
| ticketflow-inventory-service | 316.97 | 397.82 | 696.0 | 734.2 |
| ticketflow-k6 | 119.30 | 152.49 | 139.3 | 246.9 |
| ticketflow-redis | 30.16 | 39.76 | 8.3 | 9.0 |
| ticketflow-inventory-db | 1.84 | 7.95 | 48.2 | 49.9 |
| ticketflow-user-db | 1.81 | 5.89 | 44.8 | 48.3 |
| ticketflow-catalog-db | 1.92 | 4.79 | 57.1 | 59.6 |
| ticketflow-eureka-server | 0.95 | 2.65 | 358.7 | 359.4 |
| ticketflow-user-service | 0.18 | 1.47 | 495.3 | 496.5 |
| ticketflow-kafka | 1.13 | 1.41 | 690.3 | 691.0 |
| ticketflow-prometheus | 0.45 | 1.11 | 68.5 | 69.1 |
| ticketflow-api-gateway | 0.14 | 0.64 | 434.9 | 435.5 |

- RAM total del stack: media 3778.9 MiB, pico 3944.6 MiB
- CPU total del stack: media 680.42 %, pico 870.02 %
