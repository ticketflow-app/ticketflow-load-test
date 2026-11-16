# Recursos - 03-inv-flash-sale

- Perfil: local
- Stages: 5s:6, 20s:10, 5s:0
- Muestreo: cada 3 s
- k6 exit code: 99

- Muestras: 6

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-user-service | 10.87 | 64.48 | 486.0 | 486.7 |
| ticketflow-catalog-db | 2.06 | 7.23 | 54.8 | 55.8 |
| ticketflow-catalog-service | 3.07 | 7.20 | 690.3 | 690.7 |
| ticketflow-kafka | 2.19 | 4.92 | 565.8 | 567.5 |
| ticketflow-user-db | 1.27 | 4.12 | 45.7 | 46.1 |
| ticketflow-inventory-db | 1.95 | 3.84 | 46.9 | 47.1 |
| ticketflow-inventory-service | 1.41 | 1.84 | 592.6 | 593.7 |
| ticketflow-eureka-server | 0.91 | 1.54 | 338.2 | 338.4 |
| ticketflow-k6 | 0.97 | 1.27 | 16.5 | 17.8 |
| ticketflow-prometheus | 0.43 | 0.72 | 60.2 | 60.5 |
| ticketflow-redis | 0.46 | 0.50 | 7.0 | 7.2 |
| ticketflow-api-gateway | 0.13 | 0.14 | 364.7 | 367.1 |

- RAM total del stack: media 3268.6 MiB, pico 3274.8 MiB
- CPU total del stack: media 25.69 %, pico 81.68 %
