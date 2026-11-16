# Recursos - 01-catalog

- Perfil: local
- Stages: 20s:5, 60s:25, 20s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 21

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-catalog-service | 2.37 | 8.49 | 701.1 | 701.7 |
| ticketflow-api-gateway | 2.50 | 5.59 | 435.8 | 436.7 |
| ticketflow-k6 | 1.60 | 3.09 | 21.3 | 25.4 |
| ticketflow-eureka-server | 0.61 | 1.43 | 357.9 | 358.6 |
| ticketflow-catalog-db | 0.21 | 1.22 | 52.5 | 53.7 |
| ticketflow-kafka | 0.90 | 1.07 | 689.9 | 690.8 |
| ticketflow-prometheus | 0.52 | 0.78 | 68.3 | 69.2 |
| ticketflow-redis | 0.55 | 0.76 | 7.7 | 8.4 |
| ticketflow-user-db | 0.02 | 0.47 | 44.8 | 45.4 |
| ticketflow-inventory-db | 0.02 | 0.45 | 48.1 | 48.9 |
| ticketflow-inventory-service | 0.17 | 0.20 | 662.4 | 662.6 |
| ticketflow-user-service | 0.10 | 0.13 | 493.8 | 493.9 |

- RAM total del stack: media 3527.1 MiB, pico 3589.5 MiB
- CPU total del stack: media 9.35 %, pico 17.49 %
