# Recursos - 06-flash-sale

- Perfil: local
- Stages: 10s:15, 100s:15, 10s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 25

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-api-gateway | 1.45 | 5.77 | 436.1 | 436.8 |
| ticketflow-k6 | 1.42 | 2.31 | 21.7 | 24.4 |
| ticketflow-inventory-service | 1.44 | 2.02 | 664.1 | 664.9 |
| ticketflow-catalog-service | 0.84 | 1.33 | 701.2 | 701.9 |
| ticketflow-eureka-server | 0.60 | 0.93 | 358.8 | 359.9 |
| ticketflow-kafka | 0.77 | 0.90 | 689.7 | 690.2 |
| ticketflow-user-service | 0.17 | 0.73 | 494.3 | 495.3 |
| ticketflow-redis | 0.55 | 0.63 | 7.6 | 8.3 |
| ticketflow-catalog-db | 0.12 | 0.61 | 53.3 | 54.0 |
| ticketflow-inventory-db | 0.10 | 0.58 | 48.3 | 49.3 |
| ticketflow-user-db | 0.05 | 0.52 | 45.1 | 46.2 |
| ticketflow-prometheus | 0.32 | 0.48 | 70.3 | 72.8 |

- RAM total del stack: media 3589.8 MiB, pico 3594.8 MiB
- CPU total del stack: media 7.8 %, pico 11.65 %
