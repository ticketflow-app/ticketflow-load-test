# Recursos - 01-inv-calibration

- Perfil: local
- Stages: 30s:10, 30s:25, 30s:50, 30s:75, 30s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 9

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-localstack | 5.01 | 5.01 | 138.8 | 138.8 |
| ticketflow-eureka-server | 1.77 | 1.77 | 276.1 | 276.1 |
| ticketflow-prometheus | 1.65 | 1.65 | 58.2 | 58.2 |
| ticketflow-catalog-service | 1.21 | 1.21 | 616.0 | 616.0 |
| ticketflow-elasticsearch | 0.86 | 0.86 | 986.0 | 986.0 |
| ticketflow-inventory-service | 0.72 | 0.72 | 379.5 | 379.5 |
| ticketflow-api-gateway | 0.21 | 0.21 | 431.2 | 431.2 |
| ticketflow-user-service | 0.16 | 0.16 | 445.2 | 445.2 |
| ticketflow-frontend | 0.00 | 0.00 | 60.8 | 60.8 |

- RAM total del stack: media 3391.8 MiB, pico 3391.8 MiB
- CPU total del stack: media 11.59 %, pico 11.59 %
