# Recursos - 05-inv-stress

- Perfil: local
- Stages: 3s:15, 10s:15, 3s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 4

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-inventory-service | 283.98 | 385.37 | 661.5 | 662.4 |
| ticketflow-k6 | 125.24 | 170.01 | 45.2 | 61.0 |
| ticketflow-redis | 10.07 | 14.70 | 7.3 | 7.7 |
| ticketflow-inventory-db | 0.81 | 3.23 | 47.2 | 47.5 |
| ticketflow-user-db | 0.81 | 3.20 | 44.9 | 45.4 |
| ticketflow-kafka | 1.28 | 1.73 | 678.7 | 679.0 |
| ticketflow-api-gateway | 0.50 | 1.47 | 372.6 | 372.8 |
| ticketflow-eureka-server | 1.08 | 1.46 | 356.1 | 356.4 |
| ticketflow-catalog-service | 0.70 | 0.88 | 697.8 | 698.1 |
| ticketflow-prometheus | 0.32 | 0.37 | 63.8 | 64.3 |
| ticketflow-catalog-db | 0.15 | 0.23 | 53.6 | 53.9 |
| ticketflow-user-service | 0.11 | 0.13 | 491.6 | 491.8 |

- RAM total del stack: media 3520 MiB, pico 3537.7 MiB
- CPU total del stack: media 425.04 %, pico 567.04 %
