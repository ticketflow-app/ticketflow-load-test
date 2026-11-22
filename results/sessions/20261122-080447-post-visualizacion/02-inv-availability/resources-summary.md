# Recursos - 02-inv-availability

- Perfil: local
- Stages: 5s:2, 10s:4, 5s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 12

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-elasticsearch | 2.38 | 9.53 | 1002.3 | 1004.0 |
| ticketflow-catalog-db | 0.79 | 5.94 | 57.5 | 58.1 |
| ticketflow-user-db | 1.04 | 4.78 | 50.5 | 51.3 |
| ticketflow-localstack | 1.19 | 4.65 | 142.5 | 143.5 |
| ticketflow-inventory-db | 1.01 | 4.21 | 46.5 | 47.8 |
| ticketflow-kafka | 2.82 | 3.40 | 1009.2 | 1010.0 |
| ticketflow-k6 | 2.60 | 3.18 | 14.1 | 14.7 |
| ticketflow-grafana | 2.44 | 3.04 | 589.7 | 591.6 |
| ticketflow-inventory-service | 1.79 | 2.83 | 655.1 | 655.8 |
| ticketflow-catalog-service | 1.40 | 2.78 | 663.9 | 664.8 |
| ticketflow-prometheus | 1.12 | 2.30 | 68.0 | 68.6 |
| ticketflow-eureka-server | 1.74 | 2.29 | 294.6 | 295.0 |
| ticketflow-api-gateway | 0.36 | 1.99 | 463.9 | 464.1 |
| ticketflow-redis | 0.95 | 1.12 | 12.5 | 12.8 |
| ticketflow-user-service | 0.16 | 0.21 | 449.1 | 449.6 |
| ticketflow-frontend | 0.00 | 0.04 | 59.7 | 59.7 |

- RAM total del stack: media 5575.6 MiB, pico 5585 MiB
- CPU total del stack: media 21.13 %, pico 28.62 %
