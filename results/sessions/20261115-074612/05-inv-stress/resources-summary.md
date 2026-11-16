# Recursos - 05-inv-stress

- Perfil: local
- Stages: 3s:15, 10s:15, 3s:0
- Muestreo: cada 3 s
- k6 exit code: 99

- Muestras: 4

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-inventory-service | 289.99 | 389.78 | 624.1 | 655.5 |
| ticketflow-k6 | 115.30 | 161.35 | 37.8 | 61.5 |
| ticketflow-user-service | 5.28 | 20.54 | 487.6 | 487.8 |
| ticketflow-redis | 10.01 | 14.35 | 7.3 | 7.8 |
| ticketflow-catalog-db | 0.83 | 2.45 | 55.2 | 55.8 |
| ticketflow-inventory-db | 0.61 | 2.40 | 46.9 | 47.0 |
| ticketflow-catalog-service | 1.24 | 2.10 | 690.3 | 690.6 |
| ticketflow-kafka | 1.29 | 1.39 | 574.3 | 575.1 |
| ticketflow-eureka-server | 0.89 | 0.95 | 338.2 | 338.8 |
| ticketflow-user-db | 0.32 | 0.94 | 45.9 | 46.7 |
| ticketflow-api-gateway | 0.23 | 0.53 | 367.4 | 367.7 |
| ticketflow-prometheus | 0.34 | 0.37 | 60.5 | 60.7 |

- RAM total del stack: media 3335.2 MiB, pico 3390.5 MiB
- CPU total del stack: media 426.31 %, pico 572.17 %
