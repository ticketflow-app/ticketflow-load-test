# Recursos - 02-inv-availability

- Perfil: local
- Stages: 20s:5, 80s:20, 20s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 20

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-inventory-service | 8.70 | 29.53 | 616.0 | 625.6 |
| ticketflow-catalog-service | 2.38 | 18.41 | 616.9 | 617.6 |
| ticketflow-kafka | 4.20 | 8.36 | 1008.3 | 1009.0 |
| ticketflow-k6 | 4.38 | 7.60 | 20.1 | 22.5 |
| ticketflow-elasticsearch | 1.81 | 6.85 | 994.4 | 995.7 |
| ticketflow-grafana | 3.84 | 6.27 | 613.8 | 615.2 |
| ticketflow-localstack | 1.04 | 5.90 | 140.3 | 142.7 |
| ticketflow-catalog-db | 1.16 | 5.34 | 59.2 | 60.4 |
| ticketflow-user-db | 0.93 | 5.07 | 51.3 | 52.3 |
| ticketflow-inventory-db | 0.87 | 4.94 | 44.3 | 45.1 |
| ticketflow-eureka-server | 2.81 | 4.20 | 276.7 | 277.5 |
| ticketflow-prometheus | 1.35 | 3.86 | 60.8 | 61.8 |
| ticketflow-api-gateway | 0.46 | 3.37 | 428.9 | 429.4 |
| ticketflow-redis | 1.74 | 2.50 | 13.3 | 13.9 |
| ticketflow-user-service | 0.23 | 0.29 | 441.1 | 441.8 |
| ticketflow-frontend | 0.00 | 0.02 | 60.5 | 60.5 |

- RAM total del stack: media 5444.8 MiB, pico 5456.5 MiB
- CPU total del stack: media 35.66 %, pico 68.43 %
