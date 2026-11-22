# Recursos - 05-event-detail

- Perfil: local
- Stages: 5s:2, 10s:5, 5s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 4

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-grafana | 4.02 | 8.71 | 640.1 | 641.6 |
| ticketflow-catalog-db | 1.95 | 7.06 | 57.5 | 57.7 |
| ticketflow-inventory-db | 0.92 | 3.69 | 47.4 | 48.0 |
| ticketflow-k6 | 3.39 | 3.58 | 15.4 | 15.8 |
| ticketflow-prometheus | 1.26 | 2.90 | 81.4 | 81.9 |
| ticketflow-kafka | 2.42 | 2.77 | 1008.8 | 1009.0 |
| ticketflow-catalog-service | 2.16 | 2.71 | 663.1 | 663.4 |
| ticketflow-api-gateway | 1.37 | 2.37 | 459.6 | 460.3 |
| ticketflow-eureka-server | 1.60 | 2.13 | 294.5 | 294.7 |
| ticketflow-elasticsearch | 1.24 | 1.28 | 1000.0 | 1000.0 |
| ticketflow-inventory-service | 0.81 | 1.10 | 653.9 | 654.2 |
| ticketflow-user-service | 0.46 | 1.03 | 448.1 | 448.4 |
| ticketflow-redis | 0.86 | 1.03 | 12.4 | 13.0 |
| ticketflow-localstack | 0.06 | 0.08 | 142.2 | 142.5 |
| ticketflow-user-db | 0.01 | 0.02 | 49.9 | 50.2 |
| ticketflow-frontend | 0.00 | 0.00 | 59.7 | 59.7 |

- RAM total del stack: media 5630 MiB, pico 5634.8 MiB
- CPU total del stack: media 21.68 %, pico 29.92 %
