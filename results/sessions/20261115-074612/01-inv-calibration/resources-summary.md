# Recursos - 01-inv-calibration

- Perfil: local
- Stages: 10s:3, 10s:6, 10s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 6

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-inventory-service | 121.43 | 211.12 | 592.8 | 593.3 |
| ticketflow-catalog-service | 75.27 | 130.82 | 691.0 | 691.4 |
| ticketflow-k6 | 42.55 | 69.05 | 25.9 | 36.1 |
| ticketflow-user-service | 6.46 | 38.03 | 485.4 | 486.0 |
| ticketflow-redis | 10.73 | 15.89 | 7.6 | 7.8 |
| ticketflow-eureka-server | 1.35 | 2.81 | 338.4 | 338.9 |
| ticketflow-kafka | 1.44 | 1.75 | 558.9 | 560.4 |
| ticketflow-catalog-db | 0.21 | 0.63 | 52.9 | 53.3 |
| ticketflow-prometheus | 0.30 | 0.34 | 59.8 | 60.3 |
| ticketflow-api-gateway | 0.15 | 0.20 | 363.6 | 363.8 |
| ticketflow-user-db | 0.01 | 0.03 | 45.2 | 46.1 |
| ticketflow-inventory-db | 0.01 | 0.02 | 46.1 | 46.2 |

- RAM total del stack: media 3267.5 MiB, pico 3279.6 MiB
- CPU total del stack: media 259.9 %, pico 431.24 %
