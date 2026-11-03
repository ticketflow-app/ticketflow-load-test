# TicketFlow - k6 Load Testing Suite

Suite de pruebas de carga e infraestructura de monitoreo para la plataforma TicketFlow utilizando **k6**, **Prometheus** y **Grafana**.

---

## 🚀 Requisitos Previos

* [Docker](https://www.docker.com/) y Docker Compose
* [k6](https://k6.io/) (versión local o vía Docker)

---

## 🛠️ Estructura del Proyecto

* `scripts/`: Scripts de prueba en k6 (autenticación, reservas, catálogo).
* `docker-compose.yml`: Servicios de la aplicación, Prometheus y Grafana.
* `prometheus.yml`: Configuración de métricas y Prometheus Remote Write.

---

## ⚡ Ejecución de Pruebas

1. **Iniciar la infraestructura de monitoreo:**
   ```bash
   docker compose up -d prometheus grafana