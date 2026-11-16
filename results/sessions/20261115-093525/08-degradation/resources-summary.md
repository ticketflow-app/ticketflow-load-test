# Recursos - 08-degradation

- Perfil: local
- Stages: 5s:40, 50s:40, 5s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 13

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-api-gateway | 4.38 | 10.93 | 436.3 | 436.9 |
| ticketflow-inventory-service | 1.86 | 3.66 | 664.8 | 665.4 |
| ticketflow-k6 | 3.11 | 3.66 | 30.0 | 33.1 |
| ticketflow-inventory-db | 0.56 | 2.27 | 49.2 | 49.6 |
| ticketflow-user-db | 0.22 | 2.13 | 45.1 | 46.1 |
| ticketflow-user-service | 0.27 | 1.04 | 494.7 | 495.7 |
| ticketflow-eureka-server | 0.64 | 1.02 | 358.7 | 359.9 |
| ticketflow-kafka | 0.79 | 0.89 | 689.6 | 690.0 |
| ticketflow-redis | 0.74 | 0.86 | 7.7 | 8.3 |
| ticketflow-catalog-db | 0.15 | 0.80 | 53.1 | 54.0 |
| ticketflow-catalog-service | 0.44 | 0.54 | 703.2 | 705.1 |
| ticketflow-prometheus | 0.28 | 0.38 | 75.2 | 75.5 |

- RAM total del stack: media 3605.3 MiB, pico 3613.4 MiB
- CPU total del stack: media 13.19 %, pico 19.61 %
