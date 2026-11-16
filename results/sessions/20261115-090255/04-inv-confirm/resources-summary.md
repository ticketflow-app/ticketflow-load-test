# Recursos - 04-inv-confirm

- Perfil: local
- Stages: 5s:4, 15s:6, 5s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 6

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-k6 | 1.89 | 5.83 | 18.8 | 19.7 |
| ticketflow-inventory-service | 1.89 | 5.21 | 660.5 | 661.3 |
| ticketflow-catalog-db | 2.43 | 3.39 | 53.5 | 53.9 |
| ticketflow-inventory-db | 2.26 | 3.11 | 47.8 | 48.1 |
| ticketflow-user-db | 1.69 | 2.86 | 45.9 | 46.7 |
| ticketflow-catalog-service | 0.80 | 1.93 | 697.3 | 697.6 |
| ticketflow-kafka | 0.93 | 1.13 | 678.8 | 679.2 |
| ticketflow-eureka-server | 0.64 | 1.06 | 355.8 | 356.1 |
| ticketflow-prometheus | 0.33 | 0.57 | 61.5 | 62.0 |
| ticketflow-redis | 0.35 | 0.37 | 6.8 | 7.0 |
| ticketflow-api-gateway | 0.14 | 0.15 | 372.5 | 372.5 |
| ticketflow-user-service | 0.08 | 0.09 | 490.8 | 491.3 |

- RAM total del stack: media 3489.8 MiB, pico 3491.9 MiB
- CPU total del stack: media 13.42 %, pico 16.08 %
