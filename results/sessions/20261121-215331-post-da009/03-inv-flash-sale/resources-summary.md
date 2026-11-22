# Recursos - 03-inv-flash-sale

- Perfil: local
- Stages: 10s:15, 100s:15, 10s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 15

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-grafana | 1.95 | 1.95 | 615.5 | 615.5 |
| ticketflow-kafka | 1.69 | 1.69 | 1009.0 | 1009.0 |
| ticketflow-eureka-server | 1.19 | 1.19 | 278.1 | 278.1 |
| ticketflow-elasticsearch | 0.64 | 0.64 | 994.2 | 994.2 |
| ticketflow-redis | 0.64 | 0.64 | 13.0 | 13.0 |
| ticketflow-catalog-service | 0.59 | 0.59 | 618.1 | 618.1 |
| ticketflow-inventory-service | 0.58 | 0.58 | 614.8 | 614.8 |
| ticketflow-prometheus | 0.36 | 0.36 | 61.1 | 61.1 |
| ticketflow-catalog-db | 0.12 | 0.12 | 58.9 | 58.9 |
| ticketflow-api-gateway | 0.10 | 0.10 | 428.9 | 428.9 |
| ticketflow-user-service | 0.09 | 0.09 | 440.9 | 440.9 |
| ticketflow-localstack | 0.04 | 0.04 | 140.1 | 140.1 |
| ticketflow-inventory-db | 0.00 | 0.00 | 44.1 | 44.1 |
| ticketflow-user-db | 0.00 | 0.00 | 51.1 | 51.1 |
| ticketflow-frontend | 0.00 | 0.00 | 60.5 | 60.5 |

- RAM total del stack: media 5428.3 MiB, pico 5428.3 MiB
- CPU total del stack: media 7.99 %, pico 7.99 %
