# Recursos - 04-availability

- Perfil: local
- Stages: 20s:4, 60s:8, 20s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 21

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-kafka | 1.18 | 5.10 | 689.8 | 690.4 |
| ticketflow-inventory-service | 1.13 | 4.63 | 663.7 | 664.7 |
| ticketflow-k6 | 1.12 | 2.47 | 16.4 | 18.2 |
| ticketflow-api-gateway | 0.93 | 1.86 | 436.0 | 436.8 |
| ticketflow-catalog-service | 0.94 | 1.57 | 701.2 | 701.9 |
| ticketflow-catalog-db | 0.19 | 1.23 | 53.0 | 53.6 |
| ticketflow-prometheus | 0.52 | 0.84 | 68.7 | 70.0 |
| ticketflow-eureka-server | 0.53 | 0.67 | 357.8 | 358.6 |
| ticketflow-redis | 0.50 | 0.62 | 7.7 | 8.6 |
| ticketflow-inventory-db | 0.03 | 0.52 | 48.2 | 49.3 |
| ticketflow-user-db | 0.02 | 0.45 | 45.1 | 45.8 |
| ticketflow-user-service | 0.12 | 0.40 | 494.0 | 494.8 |

- RAM total del stack: media 3580.8 MiB, pico 3583.2 MiB
- CPU total del stack: media 7.15 %, pico 11.59 %
