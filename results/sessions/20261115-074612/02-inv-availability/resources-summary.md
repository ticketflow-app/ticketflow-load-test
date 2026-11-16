# Recursos - 02-inv-availability

- Perfil: local
- Stages: 5s:2, 10s:4, 5s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 5

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-catalog-service | 1.75 | 5.35 | 690.0 | 690.2 |
| ticketflow-k6 | 0.84 | 1.43 | 14.4 | 15.3 |
| ticketflow-kafka | 1.17 | 1.41 | 562.5 | 564.0 |
| ticketflow-eureka-server | 0.67 | 0.78 | 338.6 | 338.9 |
| ticketflow-inventory-service | 0.41 | 0.66 | 592.4 | 593.3 |
| ticketflow-prometheus | 0.33 | 0.52 | 59.7 | 59.9 |
| ticketflow-redis | 0.37 | 0.39 | 7.2 | 7.4 |
| ticketflow-user-service | 0.17 | 0.24 | 485.3 | 485.5 |
| ticketflow-catalog-db | 0.13 | 0.21 | 53.9 | 54.1 |
| ticketflow-api-gateway | 0.15 | 0.19 | 363.7 | 363.8 |
| ticketflow-user-db | 0.01 | 0.03 | 45.5 | 46.0 |
| ticketflow-inventory-db | 0.00 | 0.01 | 47.0 | 47.4 |

- RAM total del stack: media 3257.3 MiB, pico 3262.1 MiB
- CPU total del stack: media 5.84 %, pico 9.59 %
