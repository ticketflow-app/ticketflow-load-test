# Recursos - 03-inv-flash-sale

- Perfil: local
- Stages: 10s:15, 100s:15, 10s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 25

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-user-service | 2.83 | 68.00 | 496.1 | 497.6 |
| ticketflow-user-db | 0.33 | 3.35 | 46.1 | 46.9 |
| ticketflow-inventory-db | 0.46 | 3.34 | 48.7 | 49.4 |
| ticketflow-catalog-db | 0.51 | 3.31 | 57.4 | 58.0 |
| ticketflow-inventory-service | 2.29 | 3.31 | 732.9 | 733.7 |
| ticketflow-k6 | 1.88 | 2.98 | 23.9 | 26.9 |
| ticketflow-catalog-service | 1.33 | 1.81 | 757.2 | 757.9 |
| ticketflow-eureka-server | 0.66 | 1.67 | 358.9 | 359.6 |
| ticketflow-kafka | 0.88 | 1.09 | 690.1 | 691.0 |
| ticketflow-redis | 0.55 | 0.64 | 7.5 | 8.2 |
| ticketflow-prometheus | 0.33 | 0.43 | 72.8 | 75.4 |
| ticketflow-api-gateway | 0.10 | 0.24 | 434.8 | 435.1 |

- RAM total del stack: media 3725.4 MiB, pico 3731.1 MiB
- CPU total del stack: media 12.06 %, pico 82.16 %
