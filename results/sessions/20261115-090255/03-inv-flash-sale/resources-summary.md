# Recursos - 03-inv-flash-sale

- Perfil: local
- Stages: 5s:6, 20s:10, 5s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 7

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-k6 | 1.85 | 6.85 | 17.7 | 18.4 |
| ticketflow-inventory-service | 1.29 | 2.97 | 659.5 | 660.4 |
| ticketflow-catalog-db | 0.50 | 2.75 | 53.9 | 54.4 |
| ticketflow-catalog-service | 0.96 | 1.36 | 697.8 | 698.3 |
| ticketflow-kafka | 0.97 | 1.06 | 678.8 | 679.7 |
| ticketflow-prometheus | 0.47 | 0.95 | 60.7 | 61.0 |
| ticketflow-eureka-server | 0.64 | 0.84 | 355.9 | 356.5 |
| ticketflow-inventory-db | 0.14 | 0.52 | 46.6 | 47.1 |
| ticketflow-redis | 0.43 | 0.52 | 7.0 | 7.4 |
| ticketflow-user-service | 0.10 | 0.24 | 490.3 | 491.2 |
| ticketflow-api-gateway | 0.13 | 0.15 | 372.6 | 373.0 |
| ticketflow-user-db | 0.01 | 0.02 | 45.2 | 45.4 |

- RAM total del stack: media 3486.1 MiB, pico 3487.7 MiB
- CPU total del stack: media 7.5 %, pico 13.47 %
