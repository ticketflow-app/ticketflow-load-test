# Recursos - 05-event-detail

- Perfil: local
- Stages: 20s:5, 60s:25, 20s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 21

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-api-gateway | 6.08 | 28.13 | 426.0 | 427.7 |
| ticketflow-kafka | 2.00 | 19.59 | 678.9 | 679.6 |
| ticketflow-catalog-service | 2.32 | 9.58 | 700.6 | 701.3 |
| ticketflow-k6 | 1.79 | 4.12 | 21.9 | 25.0 |
| ticketflow-catalog-db | 1.72 | 3.68 | 52.7 | 53.8 |
| ticketflow-user-db | 1.53 | 2.69 | 45.3 | 45.9 |
| ticketflow-inventory-db | 1.54 | 2.66 | 47.5 | 48.0 |
| ticketflow-prometheus | 0.58 | 1.59 | 59.9 | 60.3 |
| ticketflow-redis | 0.59 | 0.94 | 7.7 | 8.1 |
| ticketflow-eureka-server | 0.61 | 0.75 | 356.0 | 356.7 |
| ticketflow-inventory-service | 0.24 | 0.32 | 660.5 | 660.9 |
| ticketflow-user-service | 0.10 | 0.28 | 491.8 | 492.4 |

- RAM total del stack: media 3401.8 MiB, pico 3552.9 MiB
- CPU total del stack: media 18.43 %, pico 39.9 %
