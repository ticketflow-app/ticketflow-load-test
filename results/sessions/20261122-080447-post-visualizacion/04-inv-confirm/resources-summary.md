# Recursos - 04-inv-confirm

- Perfil: local
- Stages: 5s:4, 15s:6, 5s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 5

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-kafka | 5.50 | 14.23 | 1009.0 | 1010.0 |
| ticketflow-elasticsearch | 2.68 | 8.10 | 1000.6 | 1002.0 |
| ticketflow-k6 | 5.58 | 7.36 | 15.9 | 17.1 |
| ticketflow-catalog-service | 2.24 | 6.67 | 663.5 | 663.7 |
| ticketflow-localstack | 1.15 | 5.40 | 142.6 | 143.3 |
| ticketflow-inventory-db | 1.23 | 5.09 | 47.0 | 47.7 |
| ticketflow-user-db | 0.98 | 4.72 | 50.6 | 51.3 |
| ticketflow-catalog-db | 1.08 | 4.04 | 57.7 | 58.2 |
| ticketflow-inventory-service | 2.99 | 4.03 | 655.5 | 655.7 |
| ticketflow-grafana | 3.05 | 3.96 | 587.2 | 587.7 |
| ticketflow-prometheus | 1.39 | 3.74 | 68.3 | 68.8 |
| ticketflow-eureka-server | 2.06 | 3.14 | 294.5 | 295.0 |
| ticketflow-redis | 0.90 | 1.03 | 12.3 | 12.6 |
| ticketflow-api-gateway | 0.24 | 0.29 | 463.8 | 463.8 |
| ticketflow-user-service | 0.13 | 0.17 | 448.9 | 448.9 |
| ticketflow-frontend | 0.00 | 0.00 | 59.7 | 59.7 |

- RAM total del stack: media 5573.7 MiB, pico 5577.7 MiB
- CPU total del stack: media 30.09 %, pico 55.26 %
