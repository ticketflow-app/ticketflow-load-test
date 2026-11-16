# Recursos - 04-inv-confirm

- Perfil: local
- Stages: 5s:4, 15s:6, 5s:0
- Muestreo: cada 3 s
- k6 exit code: 99

- Muestras: 6

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-user-service | 14.16 | 83.28 | 496.1 | 544.5 |
| ticketflow-catalog-service | 1.61 | 6.84 | 689.9 | 690.5 |
| ticketflow-user-db | 0.72 | 2.93 | 46.3 | 46.9 |
| ticketflow-catalog-db | 0.54 | 2.69 | 55.4 | 56.7 |
| ticketflow-inventory-db | 2.09 | 2.60 | 47.5 | 48.0 |
| ticketflow-kafka | 1.40 | 2.36 | 570.8 | 572.3 |
| ticketflow-k6 | 1.16 | 2.04 | 17.4 | 18.2 |
| ticketflow-eureka-server | 0.71 | 1.36 | 338.4 | 339.0 |
| ticketflow-inventory-service | 0.82 | 1.31 | 593.0 | 593.7 |
| ticketflow-prometheus | 0.37 | 0.68 | 60.7 | 61.2 |
| ticketflow-api-gateway | 0.19 | 0.47 | 367.2 | 367.6 |
| ticketflow-redis | 0.36 | 0.42 | 6.5 | 6.8 |

- RAM total del stack: media 3289 MiB, pico 3334.6 MiB
- CPU total del stack: media 24.12 %, pico 98.59 %
