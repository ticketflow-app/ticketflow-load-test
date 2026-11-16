# Recursos - 05-event-detail

- Perfil: local
- Stages: 20s:5, 60s:25, 20s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 20

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-eureka-server | 1.07 | 10.96 | 358.4 | 359.2 |
| ticketflow-api-gateway | 1.73 | 4.24 | 436.2 | 436.8 |
| ticketflow-catalog-service | 1.72 | 3.81 | 701.5 | 702.1 |
| ticketflow-k6 | 1.45 | 3.19 | 21.4 | 24.6 |
| ticketflow-catalog-db | 0.29 | 1.67 | 52.5 | 53.8 |
| ticketflow-kafka | 0.79 | 0.89 | 690.0 | 690.4 |
| ticketflow-redis | 0.55 | 0.84 | 7.8 | 8.9 |
| ticketflow-prometheus | 0.34 | 0.66 | 69.6 | 70.3 |
| ticketflow-inventory-service | 0.21 | 0.64 | 662.7 | 663.1 |
| ticketflow-inventory-db | 0.05 | 0.49 | 48.4 | 48.8 |
| ticketflow-user-db | 0.07 | 0.47 | 45.3 | 46.7 |
| ticketflow-user-service | 0.13 | 0.23 | 494.1 | 494.8 |

- RAM total del stack: media 3586.5 MiB, pico 3591.3 MiB
- CPU total del stack: media 8.3 %, pico 24.13 %
