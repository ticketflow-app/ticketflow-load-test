# Recursos - 01-inv-calibration

- Perfil: local
- Stages: 10s:3, 10s:6, 10s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 15

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-inventory-service | 51.45 | 233.73 | 655.2 | 656.0 |
| ticketflow-k6 | 38.19 | 101.54 | 79.0 | 94.2 |
| ticketflow-redis | 6.09 | 27.90 | 12.5 | 13.2 |
| ticketflow-elasticsearch | 1.74 | 8.09 | 1000.1 | 1001.0 |
| ticketflow-catalog-db | 1.23 | 7.21 | 57.8 | 58.7 |
| ticketflow-localstack | 0.93 | 4.81 | 142.5 | 143.6 |
| ticketflow-inventory-db | 0.71 | 4.03 | 46.3 | 47.6 |
| ticketflow-kafka | 2.65 | 3.87 | 1008.8 | 1009.0 |
| ticketflow-user-db | 0.48 | 3.74 | 50.4 | 51.4 |
| ticketflow-catalog-service | 1.13 | 3.52 | 662.8 | 663.2 |
| ticketflow-grafana | 2.14 | 3.49 | 589.6 | 590.5 |
| ticketflow-eureka-server | 1.51 | 2.36 | 294.4 | 295.0 |
| ticketflow-prometheus | 0.87 | 2.19 | 69.3 | 71.1 |
| ticketflow-user-service | 0.16 | 0.70 | 448.5 | 449.2 |
| ticketflow-api-gateway | 0.17 | 0.40 | 463.8 | 464.3 |
| ticketflow-frontend | 0.00 | 0.00 | 59.7 | 59.7 |

- RAM total del stack: media 5635.3 MiB, pico 5656.7 MiB
- CPU total del stack: media 106.91 %, pico 383.97 %
