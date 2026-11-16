# Recursos - 06-flash-sale

- Perfil: local
- Stages: 10s:15, 100s:15, 10s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 25

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-user-service | 2.66 | 64.10 | 492.5 | 494.7 |
| ticketflow-api-gateway | 3.52 | 18.51 | 428.9 | 429.9 |
| ticketflow-inventory-db | 1.56 | 3.41 | 47.8 | 49.5 |
| ticketflow-catalog-db | 1.62 | 3.38 | 52.4 | 53.5 |
| ticketflow-user-db | 1.54 | 3.03 | 45.5 | 47.2 |
| ticketflow-inventory-service | 1.72 | 2.61 | 662.1 | 663.4 |
| ticketflow-k6 | 1.55 | 2.41 | 20.0 | 21.9 |
| ticketflow-prometheus | 0.59 | 2.05 | 62.0 | 63.4 |
| ticketflow-catalog-service | 0.98 | 1.41 | 700.3 | 701.3 |
| ticketflow-kafka | 1.00 | 1.19 | 679.0 | 679.7 |
| ticketflow-eureka-server | 0.63 | 0.87 | 355.9 | 356.6 |
| ticketflow-redis | 0.57 | 0.68 | 7.6 | 8.3 |

- RAM total del stack: media 3553.1 MiB, pico 3558.6 MiB
- CPU total del stack: media 17.9 %, pico 88.32 %
