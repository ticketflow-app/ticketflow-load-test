# Recursos - 04-availability

- Perfil: local
- Stages: 20s:4, 60s:8, 20s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 21

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-api-gateway | 2.81 | 6.51 | 424.3 | 425.1 |
| ticketflow-catalog-service | 1.20 | 4.45 | 700.0 | 701.0 |
| ticketflow-eureka-server | 0.91 | 3.75 | 356.2 | 356.6 |
| ticketflow-catalog-db | 1.79 | 3.55 | 53.2 | 55.8 |
| ticketflow-inventory-db | 1.65 | 3.28 | 47.4 | 49.6 |
| ticketflow-user-db | 1.68 | 3.22 | 45.5 | 49.3 |
| ticketflow-inventory-service | 1.14 | 1.92 | 661.2 | 661.8 |
| ticketflow-k6 | 1.14 | 1.82 | 16.1 | 17.7 |
| ticketflow-kafka | 1.04 | 1.36 | 679.0 | 680.0 |
| ticketflow-user-service | 0.15 | 1.09 | 491.7 | 492.3 |
| ticketflow-redis | 0.50 | 0.62 | 7.6 | 8.2 |
| ticketflow-prometheus | 0.34 | 0.42 | 59.4 | 59.7 |

- RAM total del stack: media 3540.8 MiB, pico 3550 MiB
- CPU total del stack: media 14.3 %, pico 21.42 %
