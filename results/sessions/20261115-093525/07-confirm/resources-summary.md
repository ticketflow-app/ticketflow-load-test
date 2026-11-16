# Recursos - 07-confirm

- Perfil: local
- Stages: 10s:8, 50s:8, 10s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 15

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-api-gateway | 2.60 | 9.58 | 436.1 | 436.8 |
| ticketflow-inventory-db | 3.13 | 4.40 | 48.9 | 49.3 |
| ticketflow-catalog-db | 2.77 | 3.78 | 53.4 | 54.1 |
| ticketflow-inventory-service | 1.94 | 3.20 | 664.4 | 665.2 |
| ticketflow-user-db | 2.70 | 3.06 | 45.5 | 46.3 |
| ticketflow-k6 | 1.87 | 2.70 | 21.6 | 25.4 |
| ticketflow-prometheus | 0.51 | 2.18 | 73.9 | 76.0 |
| ticketflow-kafka | 0.86 | 2.04 | 690.0 | 690.7 |
| ticketflow-catalog-service | 0.55 | 1.83 | 700.7 | 701.2 |
| ticketflow-eureka-server | 0.58 | 1.00 | 358.7 | 359.2 |
| ticketflow-redis | 0.51 | 0.60 | 7.3 | 8.1 |
| ticketflow-user-service | 0.14 | 0.22 | 494.6 | 495.5 |

- RAM total del stack: media 3593.8 MiB, pico 3600.8 MiB
- CPU total del stack: media 18.04 %, pico 24.19 %
