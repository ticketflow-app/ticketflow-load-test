# Recursos - 08-degradation

- Perfil: local
- Stages: 3s:20, 10s:40, 3s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 4

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-k6 | 13.61 | 17.42 | 25.9 | 28.0 |
| ticketflow-api-gateway | 6.34 | 14.47 | 461.3 | 464.0 |
| ticketflow-kafka | 5.08 | 10.17 | 1008.5 | 1009.0 |
| ticketflow-inventory-service | 4.65 | 7.75 | 654.7 | 654.9 |
| ticketflow-localstack | 1.12 | 4.32 | 142.3 | 143.0 |
| ticketflow-catalog-db | 1.13 | 3.92 | 57.5 | 58.0 |
| ticketflow-user-db | 1.14 | 3.79 | 50.5 | 51.4 |
| ticketflow-inventory-db | 1.55 | 3.07 | 46.8 | 48.3 |
| ticketflow-grafana | 2.19 | 2.69 | 589.9 | 590.3 |
| ticketflow-redis | 1.47 | 1.93 | 12.5 | 12.6 |
| ticketflow-eureka-server | 1.41 | 1.67 | 294.2 | 294.2 |
| ticketflow-elasticsearch | 1.11 | 1.43 | 1000.0 | 1000.0 |
| ticketflow-catalog-service | 1.02 | 1.22 | 662.5 | 662.7 |
| ticketflow-prometheus | 0.78 | 1.20 | 68.3 | 68.6 |
| ticketflow-user-service | 0.19 | 0.34 | 448.6 | 448.7 |
| ticketflow-frontend | 0.00 | 0.00 | 59.7 | 59.7 |

- RAM total del stack: media 5576.6 MiB, pico 5587.9 MiB
- CPU total del stack: media 39.37 %, pico 55.64 %
