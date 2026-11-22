# Recursos - 04-availability

- Perfil: local
- Stages: 5s:2, 10s:4, 5s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 4

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-k6 | 7.27 | 14.98 | 15.9 | 16.1 |
| ticketflow-localstack | 1.08 | 4.07 | 142.2 | 142.9 |
| ticketflow-user-db | 0.93 | 3.66 | 49.7 | 50.1 |
| ticketflow-inventory-db | 0.89 | 3.55 | 47.5 | 48.2 |
| ticketflow-catalog-db | 1.08 | 3.40 | 57.2 | 57.3 |
| ticketflow-inventory-service | 2.49 | 3.31 | 654.3 | 654.6 |
| ticketflow-catalog-service | 1.59 | 3.12 | 662.2 | 663.1 |
| ticketflow-grafana | 2.38 | 3.03 | 639.5 | 639.7 |
| ticketflow-kafka | 2.71 | 3.02 | 1008.5 | 1009.0 |
| ticketflow-elasticsearch | 1.47 | 2.49 | 999.9 | 1000.0 |
| ticketflow-api-gateway | 1.36 | 2.27 | 459.7 | 460.1 |
| ticketflow-prometheus | 1.25 | 1.94 | 81.5 | 81.6 |
| ticketflow-eureka-server | 1.58 | 1.76 | 294.4 | 294.9 |
| ticketflow-redis | 0.96 | 1.12 | 12.2 | 12.4 |
| ticketflow-user-service | 0.23 | 0.25 | 447.8 | 448.2 |
| ticketflow-frontend | 0.00 | 0.00 | 59.7 | 59.7 |

- RAM total del stack: media 5628.1 MiB, pico 5634.1 MiB
- CPU total del stack: media 25.44 %, pico 31.11 %
