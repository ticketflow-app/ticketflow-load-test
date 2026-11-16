# Recursos - 04-inv-confirm

- Perfil: local
- Stages: 10s:10, 50s:10, 10s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 14

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-inventory-service | 2.08 | 2.97 | 732.7 | 733.7 |
| ticketflow-eureka-server | 0.80 | 2.92 | 358.9 | 359.3 |
| ticketflow-inventory-db | 0.37 | 2.81 | 48.9 | 49.8 |
| ticketflow-user-db | 0.20 | 2.76 | 45.9 | 46.4 |
| ticketflow-catalog-db | 0.33 | 2.69 | 57.4 | 57.8 |
| ticketflow-k6 | 1.64 | 2.62 | 21.7 | 23.3 |
| ticketflow-kafka | 1.04 | 1.26 | 690.4 | 691.0 |
| ticketflow-prometheus | 0.49 | 0.76 | 75.7 | 78.6 |
| ticketflow-api-gateway | 0.19 | 0.71 | 434.9 | 435.3 |
| ticketflow-catalog-service | 0.54 | 0.68 | 756.5 | 757.1 |
| ticketflow-redis | 0.36 | 0.41 | 9.0 | 9.4 |
| ticketflow-user-service | 0.07 | 0.11 | 496.3 | 496.9 |

- RAM total del stack: media 3728.3 MiB, pico 3731.2 MiB
- CPU total del stack: media 8.1 %, pico 14.4 %
