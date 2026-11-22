# Recursos - 05-inv-stress

- Perfil: local
- Stages: 3s:15, 10s:15, 3s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 13

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-inventory-service | 68.49 | 442.96 | 655.7 | 656.4 |
| ticketflow-k6 | 41.72 | 191.63 | 83.3 | 97.1 |
| ticketflow-user-service | 7.72 | 98.68 | 454.1 | 514.8 |
| ticketflow-redis | 2.41 | 12.04 | 12.4 | 13.0 |
| ticketflow-eureka-server | 1.91 | 7.64 | 294.6 | 295.3 |
| ticketflow-elasticsearch | 1.28 | 6.16 | 1000.3 | 1002.0 |
| ticketflow-catalog-db | 0.98 | 5.18 | 57.5 | 58.5 |
| ticketflow-inventory-db | 0.93 | 4.80 | 46.5 | 47.6 |
| ticketflow-localstack | 0.63 | 4.29 | 142.3 | 143.5 |
| ticketflow-kafka | 2.44 | 3.33 | 1008.7 | 1010.0 |
| ticketflow-user-db | 0.34 | 3.32 | 50.5 | 52.0 |
| ticketflow-grafana | 2.08 | 2.83 | 587.2 | 587.7 |
| ticketflow-catalog-service | 1.09 | 2.57 | 663.1 | 663.5 |
| ticketflow-prometheus | 0.81 | 2.17 | 70.6 | 71.2 |
| ticketflow-api-gateway | 0.18 | 0.40 | 463.8 | 464.1 |
| ticketflow-frontend | 0.00 | 0.00 | 59.7 | 59.7 |

- RAM total del stack: media 5644 MiB, pico 5660 MiB
- CPU total del stack: media 129.79 %, pico 661.11 %
