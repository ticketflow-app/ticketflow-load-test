# Recursos - 06-flash-sale

- Perfil: local
- Stages: 5s:6, 20s:10, 5s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 6

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-api-gateway | 1.98 | 5.80 | 460.1 | 460.9 |
| ticketflow-catalog-db | 2.44 | 4.53 | 57.8 | 58.6 |
| ticketflow-inventory-service | 2.32 | 4.50 | 654.3 | 654.8 |
| ticketflow-elasticsearch | 1.86 | 4.50 | 1000.1 | 1001.0 |
| ticketflow-k6 | 3.41 | 4.46 | 16.4 | 17.0 |
| ticketflow-localstack | 1.33 | 3.95 | 142.4 | 143.5 |
| ticketflow-inventory-db | 1.30 | 3.74 | 47.0 | 49.6 |
| ticketflow-user-db | 1.21 | 3.59 | 50.3 | 50.9 |
| ticketflow-grafana | 2.54 | 3.35 | 641.1 | 641.2 |
| ticketflow-kafka | 2.66 | 2.99 | 1008.3 | 1009.0 |
| ticketflow-eureka-server | 1.89 | 2.75 | 294.3 | 294.7 |
| ticketflow-redis | 1.07 | 1.49 | 12.4 | 12.8 |
| ticketflow-catalog-service | 1.11 | 1.27 | 662.6 | 663.0 |
| ticketflow-prometheus | 0.88 | 1.17 | 81.3 | 81.6 |
| ticketflow-user-service | 0.29 | 0.34 | 448.3 | 448.6 |
| ticketflow-frontend | 0.00 | 0.00 | 59.7 | 59.7 |

- RAM total del stack: media 5633.6 MiB, pico 5639.4 MiB
- CPU total del stack: media 25.73 %, pico 33.3 %
