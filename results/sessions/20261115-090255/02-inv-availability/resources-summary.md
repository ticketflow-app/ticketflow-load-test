# Recursos - 02-inv-availability

- Perfil: local
- Stages: 5s:2, 10s:4, 5s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 5

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-user-service | 0.57 | 2.03 | 490.6 | 491.1 |
| ticketflow-prometheus | 0.80 | 2.03 | 63.0 | 67.4 |
| ticketflow-k6 | 1.18 | 1.99 | 16.3 | 17.3 |
| ticketflow-kafka | 0.94 | 1.09 | 678.9 | 679.1 |
| ticketflow-catalog-db | 0.35 | 1.02 | 53.5 | 54.0 |
| ticketflow-catalog-service | 0.72 | 0.89 | 697.6 | 698.3 |
| ticketflow-inventory-service | 0.62 | 0.87 | 659.8 | 660.7 |
| ticketflow-eureka-server | 0.60 | 0.66 | 356.0 | 356.3 |
| ticketflow-redis | 0.39 | 0.47 | 6.9 | 7.1 |
| ticketflow-api-gateway | 0.13 | 0.15 | 372.6 | 372.8 |
| ticketflow-user-db | 0.01 | 0.02 | 45.2 | 45.5 |
| ticketflow-inventory-db | 0.00 | 0.00 | 46.5 | 46.8 |

- RAM total del stack: media 2876.7 MiB, pico 3491.5 MiB
- CPU total del stack: media 5.23 %, pico 7.45 %
