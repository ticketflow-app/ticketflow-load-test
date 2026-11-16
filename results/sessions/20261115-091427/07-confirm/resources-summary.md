# Recursos - 07-confirm

- Perfil: local
- Stages: 10s:8, 50s:8, 10s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 15

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-api-gateway | 3.26 | 9.62 | 432.5 | 435.2 |
| ticketflow-inventory-service | 3.18 | 8.60 | 662.9 | 663.9 |
| ticketflow-inventory-db | 1.19 | 3.32 | 48.2 | 50.9 |
| ticketflow-k6 | 1.81 | 2.85 | 24.1 | 29.1 |
| ticketflow-catalog-db | 0.88 | 2.74 | 52.1 | 54.1 |
| ticketflow-user-db | 0.64 | 2.59 | 45.2 | 46.4 |
| ticketflow-prometheus | 0.54 | 2.00 | 66.5 | 69.6 |
| ticketflow-kafka | 0.92 | 1.20 | 679.1 | 679.7 |
| ticketflow-catalog-service | 0.61 | 1.09 | 700.1 | 700.8 |
| ticketflow-eureka-server | 0.64 | 0.89 | 355.9 | 356.4 |
| ticketflow-redis | 0.52 | 0.63 | 7.6 | 8.3 |
| ticketflow-user-service | 0.10 | 0.16 | 493.0 | 493.8 |

- RAM total del stack: media 3565.7 MiB, pico 3582.1 MiB
- CPU total del stack: media 14.17 %, pico 20.2 %
