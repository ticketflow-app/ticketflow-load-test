# Recursos - 01-catalog

- Perfil: local
- Stages: 20s:5, 60s:25, 20s:0
- Muestreo: cada 3 s
- k6 exit code: 0

- Muestras: 21

| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |
|---|---|---|---|---|
| ticketflow-api-gateway | 10.39 | 32.51 | 408.3 | 421.9 |
| ticketflow-catalog-service | 5.09 | 20.22 | 699.7 | 701.1 |
| ticketflow-inventory-db | 0.76 | 4.04 | 47.0 | 48.0 |
| ticketflow-k6 | 1.70 | 3.41 | 20.5 | 23.3 |
| ticketflow-user-db | 0.67 | 3.17 | 45.2 | 46.6 |
| ticketflow-catalog-db | 0.59 | 3.15 | 53.5 | 54.6 |
| ticketflow-kafka | 1.15 | 1.69 | 679.0 | 679.8 |
| ticketflow-prometheus | 0.42 | 1.50 | 61.0 | 63.2 |
| ticketflow-eureka-server | 0.70 | 1.44 | 356.1 | 356.7 |
| ticketflow-redis | 0.57 | 0.82 | 7.6 | 8.1 |
| ticketflow-inventory-service | 0.21 | 0.24 | 659.9 | 660.3 |
| ticketflow-user-service | 0.08 | 0.11 | 491.5 | 491.9 |

- RAM total del stack: media 3528.4 MiB, pico 3545 MiB
- CPU total del stack: media 22.27 %, pico 42.77 %
