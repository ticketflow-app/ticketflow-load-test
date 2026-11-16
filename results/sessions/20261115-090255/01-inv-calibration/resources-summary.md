# Recursos - 01-inv-calibration

- Perfil: local
- Stages: 10s:3, 10s:6, 10s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 7

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-inventory-service | 108.12 | 206.87 | 660.0 | 663.9 |
| ticketflow-catalog-service | 65.79 | 124.39 | 697.6 | 698.2 |
| ticketflow-k6 | 41.29 | 69.28 | 29.0 | 41.8 |
| ticketflow-user-service | 8.33 | 57.80 | 490.0 | 491.6 |
| ticketflow-redis | 8.66 | 15.43 | 7.4 | 7.8 |
| ticketflow-catalog-db | 0.82 | 3.28 | 52.9 | 54.3 |
| ticketflow-prometheus | 0.90 | 2.39 | 65.9 | 67.5 |
| ticketflow-kafka | 1.11 | 1.70 | 679.0 | 679.8 |
| ticketflow-api-gateway | 0.28 | 1.27 | 372.8 | 373.3 |
| ticketflow-user-db | 0.30 | 1.20 | 44.9 | 45.7 |
| ticketflow-eureka-server | 0.66 | 0.72 | 356.2 | 357.2 |
| ticketflow-inventory-db | 0.10 | 0.70 | 45.9 | 46.5 |

- RAM total del stack: media 3497.5 MiB, pico 3515.8 MiB
- CPU total del stack: media 230.47 %, pico 422.52 %
