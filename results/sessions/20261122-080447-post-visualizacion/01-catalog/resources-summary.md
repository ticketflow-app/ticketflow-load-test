# Recursos - 01-catalog

- Perfil: local
- Stages: 5s:2, 10s:5, 5s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 4

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-api-gateway | 11.10 | 40.39 | 456.4 | 460.4 |
| ticketflow-grafana | 7.98 | 21.45 | 639.7 | 640.2 |
| ticketflow-k6 | 4.63 | 5.93 | 14.6 | 14.6 |
| ticketflow-elasticsearch | 2.24 | 5.19 | 999.6 | 1000.0 |
| ticketflow-user-db | 1.28 | 5.06 | 49.9 | 50.3 |
| ticketflow-localstack | 0.92 | 3.52 | 142.6 | 143.1 |
| ticketflow-catalog-db | 1.05 | 3.42 | 57.0 | 57.7 |
| ticketflow-kafka | 3.11 | 3.31 | 1008.3 | 1009.0 |
| ticketflow-catalog-service | 2.10 | 3.22 | 661.0 | 661.4 |
| ticketflow-eureka-server | 1.73 | 2.08 | 294.3 | 294.7 |
| ticketflow-inventory-service | 1.22 | 1.95 | 654.1 | 654.4 |
| ticketflow-prometheus | 0.86 | 1.27 | 81.3 | 81.6 |
| ticketflow-redis | 1.03 | 1.18 | 12.6 | 13.1 |
| ticketflow-user-service | 0.26 | 0.29 | 447.3 | 447.3 |
| ticketflow-inventory-db | 0.00 | 0.00 | 47.3 | 47.5 |
| ticketflow-frontend | 0.00 | 0.00 | 59.7 | 59.7 |

- RAM total del stack: media 5622.1 MiB, pico 5631.3 MiB
- CPU total del stack: media 38.35 %, pico 61.42 %
