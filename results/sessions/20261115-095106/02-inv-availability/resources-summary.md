# Recursos - 02-inv-availability

- Perfil: local
- Stages: 20s:5, 80s:20, 20s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 24

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-eureka-server | 0.89 | 4.27 | 358.9 | 359.6 |
| ticketflow-catalog-service | 1.53 | 3.26 | 757.2 | 758.0 |
| ticketflow-inventory-service | 1.79 | 3.14 | 733.5 | 734.1 |
| ticketflow-k6 | 1.45 | 2.32 | 23.6 | 26.4 |
| ticketflow-kafka | 0.93 | 1.97 | 690.1 | 690.7 |
| ticketflow-api-gateway | 0.15 | 1.27 | 434.8 | 435.0 |
| ticketflow-catalog-db | 0.20 | 0.93 | 58.5 | 59.4 |
| ticketflow-redis | 0.54 | 0.69 | 7.6 | 8.1 |
| ticketflow-user-db | 0.06 | 0.53 | 45.3 | 46.1 |
| ticketflow-inventory-db | 0.04 | 0.52 | 48.6 | 49.3 |
| ticketflow-prometheus | 0.32 | 0.43 | 70.0 | 70.6 |
| ticketflow-user-service | 0.11 | 0.35 | 495.3 | 496.3 |

- RAM total del stack: media 3722.5 MiB, pico 3725.3 MiB
- CPU total del stack: media 7.97 %, pico 12.61 %
