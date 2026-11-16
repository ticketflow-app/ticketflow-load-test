# Recursos - 05-inv-stress

- Perfil: local
- Stages: 5s:45, 55s:45, 5s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 14

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-inventory-service | 326.44 | 379.94 | 734.3 | 736.0 |
| ticketflow-k6 | 137.79 | 165.38 | 101.3 | 163.0 |
| ticketflow-user-service | 3.64 | 49.56 | 497.5 | 498.7 |
| ticketflow-redis | 8.01 | 9.80 | 9.5 | 10.0 |
| ticketflow-api-gateway | 0.55 | 3.90 | 434.8 | 435.2 |
| ticketflow-inventory-db | 0.48 | 3.50 | 48.4 | 49.4 |
| ticketflow-user-db | 0.30 | 3.14 | 45.9 | 46.3 |
| ticketflow-catalog-db | 0.40 | 2.67 | 57.4 | 57.9 |
| ticketflow-kafka | 1.17 | 1.38 | 689.9 | 690.3 |
| ticketflow-prometheus | 0.59 | 1.02 | 78.0 | 80.3 |
| ticketflow-eureka-server | 0.77 | 0.94 | 358.7 | 359.2 |
| ticketflow-catalog-service | 0.58 | 0.80 | 756.7 | 757.2 |

- RAM total del stack: media 3812.4 MiB, pico 3878.6 MiB
- CPU total del stack: media 480.72 %, pico 556.61 %
