# Recursos - 03-inv-flash-sale

- Perfil: local
- Stages: 5s:6, 20s:10, 5s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 6

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-k6 | 4.37 | 6.04 | 17.0 | 17.9 |
| ticketflow-catalog-db | 1.77 | 5.54 | 58.3 | 61.5 |
| ticketflow-inventory-service | 3.04 | 4.51 | 655.1 | 655.5 |
| ticketflow-localstack | 0.71 | 3.92 | 142.5 | 143.3 |
| ticketflow-user-db | 0.75 | 3.69 | 50.4 | 50.8 |
| ticketflow-kafka | 2.48 | 3.49 | 1008.6 | 1009.0 |
| ticketflow-grafana | 2.27 | 2.76 | 587.1 | 587.4 |
| ticketflow-eureka-server | 1.54 | 2.27 | 294.4 | 294.8 |
| ticketflow-catalog-service | 1.17 | 2.03 | 662.9 | 663.1 |
| ticketflow-prometheus | 0.96 | 1.67 | 68.2 | 68.9 |
| ticketflow-api-gateway | 0.36 | 1.24 | 463.9 | 464.1 |
| ticketflow-redis | 0.91 | 1.17 | 12.5 | 12.5 |
| ticketflow-elasticsearch | 0.93 | 1.15 | 1000.2 | 1001.0 |
| ticketflow-inventory-db | 0.08 | 0.26 | 46.4 | 47.3 |
| ticketflow-user-service | 0.12 | 0.17 | 448.9 | 448.9 |
| ticketflow-frontend | 0.00 | 0.00 | 59.7 | 59.7 |

- RAM total del stack: media 5396.7 MiB, pico 5579.2 MiB
- CPU total del stack: media 20.18 %, pico 34.12 %
