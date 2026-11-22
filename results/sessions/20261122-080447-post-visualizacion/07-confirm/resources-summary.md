# Recursos - 07-confirm

- Perfil: local
- Stages: 5s:4, 15s:6, 5s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 5

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-k6 | 5.02 | 7.62 | 16.9 | 18.4 |
| ticketflow-inventory-service | 3.69 | 5.70 | 654.5 | 654.9 |
| ticketflow-elasticsearch | 2.02 | 4.29 | 1000.4 | 1001.0 |
| ticketflow-api-gateway | 2.37 | 4.25 | 460.2 | 460.8 |
| ticketflow-catalog-db | 1.02 | 4.00 | 57.4 | 58.0 |
| ticketflow-grafana | 2.48 | 3.40 | 600.2 | 641.5 |
| ticketflow-inventory-db | 1.74 | 3.38 | 46.6 | 46.9 |
| ticketflow-kafka | 2.58 | 3.34 | 1008.4 | 1009.0 |
| ticketflow-eureka-server | 1.60 | 2.33 | 294.4 | 294.9 |
| ticketflow-redis | 1.12 | 1.40 | 12.7 | 12.8 |
| ticketflow-prometheus | 0.71 | 1.20 | 68.2 | 68.4 |
| ticketflow-catalog-service | 1.07 | 1.17 | 662.6 | 662.9 |
| ticketflow-user-service | 0.25 | 0.27 | 448.4 | 448.5 |
| ticketflow-localstack | 0.07 | 0.08 | 142.0 | 142.2 |
| ticketflow-user-db | 0.01 | 0.06 | 49.9 | 50.1 |
| ticketflow-frontend | 0.00 | 0.00 | 59.7 | 59.7 |

- RAM total del stack: media 5579 MiB, pico 5607.5 MiB
- CPU total del stack: media 24.74 %, pico 33.68 %
