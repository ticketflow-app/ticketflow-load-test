# Recursos - 08-degradation

- Perfil: local
- Stages: 5s:40, 50s:40, 5s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 13

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-api-gateway | 7.17 | 13.76 | 435.3 | 435.8 |
| ticketflow-k6 | 3.97 | 5.59 | 30.9 | 33.9 |
| ticketflow-inventory-service | 2.48 | 4.45 | 663.7 | 664.4 |
| ticketflow-user-service | 0.20 | 1.42 | 493.7 | 494.7 |
| ticketflow-redis | 0.84 | 1.14 | 7.8 | 8.5 |
| ticketflow-eureka-server | 0.65 | 1.03 | 355.8 | 356.4 |
| ticketflow-kafka | 0.87 | 0.98 | 678.8 | 679.2 |
| ticketflow-inventory-db | 0.39 | 0.69 | 48.6 | 49.0 |
| ticketflow-catalog-service | 0.52 | 0.65 | 700.0 | 700.3 |
| ticketflow-user-db | 0.05 | 0.65 | 44.8 | 45.6 |
| ticketflow-prometheus | 0.34 | 0.39 | 69.1 | 69.9 |
| ticketflow-catalog-db | 0.10 | 0.15 | 52.1 | 52.6 |

- RAM total del stack: media 3578.3 MiB, pico 3584.4 MiB
- CPU total del stack: media 17.27 %, pico 24.73 %
