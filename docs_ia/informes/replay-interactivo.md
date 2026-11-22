# Replay interactivo de peticiones

## Cómo verlo

Abre directamente en el navegador:

`docs_ia/informes/visual/replay-interactivo.html`

También está enlazado desde `visual/resumen-carga.html` ("Abrir replay interactivo de peticiones →").

El archivo es **autocontenido**: no necesita servidor, red ni dependencias. Funciona con `file://`.

## Controles

- **Sesión**: elige la corrida. Las sesiones con `requests.json` aparecen ordenadas por fecha;
  `post-visualizacion` queda primero y las capturas previas quedan como último grupo.
- **Escenario**: alterna entre los 11 escenarios de la sesión elegida.
- **▶ Reproducir / ⏸ Pausar / ↺ Reiniciar**.
- **Velocidad**: 0.5×, 1×, 2× o 4×.
- **Barra de progreso**: arrastra para saltar a cualquier instante (scrubber).
- **Mostrar setup**: incluye las peticiones de autenticación y creación del evento. Están ocultas
  por defecto porque no son carga; el panel de contadores siempre distingue
  «peticiones de carga», `+N setup` y el total capturado.
- Clic en un punto o en una fila del registro: muestra método, URL, tiempo, duración, código y motivo.

## Cómo se lee el recorrido

Cada punto sale de **k6** y avanza hacia el escalón que le corresponde:

| Resultado | Escalón donde se detiene | Motivo |
|---|---|---|
| `200` / `201` verde | Redis / Kafka | Aceptada; entró en el contador y se publicó el evento |
| `409` rojo | Inventario | `OUT_OF_STOCK`: el contador atómico ya estaba en 0 |
| `429` rojo | API Gateway | `RATE_LIMITED`: `RequestRateLimiter` (10 req/s, ráfaga 20) |
| `503` rojo | API Gateway | `CIRCUIT_OPEN`: fallback del circuit breaker |
| gris | setup | Registro/login/creación de evento, previo a la carga |

El panel derecho acumula contadores por motivo y el registro de las últimas peticiones. Los contadores
de aceptadas/rechazadas son solo de fase `main` y se calculan con el timeline completo, no con los
puntos muestreados del dibujo; por eso I2 muestra `44 de carga + 10 setup = 54 capturadas`,
I3 `195 + 16 = 211` e I5 `28.481 + 46 = 28.527` (100 aceptadas y 28.381 `OUT_OF_STOCK`). El
cronómetro del replay es la ventana `main`, el mismo 16,0 s que la tabla de I5.

## ¿Por qué aparecen peticiones aceptadas después de un 409?

`OUT_OF_STOCK` es la etiqueta del visor para un **HTTP 409 Conflict** del endpoint
`POST /api/reservas`. El servicio lanza `InsufficientAvailabilityException` con mensaje
`Insufficient availability for eventId=… locality=… quantity=1` cuando el `DECRBY` atómico sobre
`inv:stock:{eventId}:{localityId}` deja el contador sin unidades disponibles. Es un rechazo
**por petición**, no un estado global que invalide al evento ni a las otras llamadas.

En el replay de E6 se ve exactamente este orden:

```text
5.91 s  reservas       201
7.75 s  reservas       201
7.95 s  reservas       201
8.75 s  reservas       409   ← se agotó el cupo
8.77 s  reservas       409
9.97 s  disponibilidad 200   ← consulta: devuelve disponibles=0, pero la lectura es válida
11.83 s confirmar      200   ← confirma una reserva creada antes del 8.75 s
```

Hay tres razones para que sigan apareciendo puntos verdes:

1. **Las lecturas no consumen stock.** `GET .../disponibilidad` responde `200` aunque el contador
   esté en 0; es una consulta, no una reserva.
2. **La confirmación no consume stock.** El `POST /api/reservas/{id}/confirmar` cambia el estado de
   una reserva ya aceptada (`PENDING → CONFIRMED`). El script mantiene esas reservas en una cola
   `pending` y las confirma después (`confirmOne()` en `06-flash-sale-test.js`).
3. **Concurrencia real.** Con varios VUs, un `201` y un `409` pueden intercalarse en milisegundos
   mientras se decrementa el último boleto. El contador nunca queda negativo: la operación se
   revierte y la petición perdedora recibe el 409.

En el escenario I4 aparecen además `409` y `410`, pero **no** significan falta de cupo: vienen de
`POST /api/reservas/{id}/confirmar`, no de `POST /api/reservas`. El visor los distingue como
`INVALID_STATE` (409, la reserva no está en estado confirmable) y `ALREADY_CONFIRMED` (410, ya se
confirmó antes). El `OUT_OF_STOCK` se reserva exclusivamente para el 409 de creación de reserva.

## Datos capturados

Los eventos vienen de `k6 --out json=...`, que escribe `http_reqs` y `http_req_duration` con
timestamp, método, URL, VU, `status` y tags del script. El generador cruza ambos por timestamp+URL
para añadir la duración de cada petición. No se inventan peticiones: son las líneas reales del JSON.

El visor agrupa esos datos por **sesión**: las corridas completas de `results/sessions/` y, al final,
las capturas sueltas de `results/replay/`. La sesión `post-visualizacion` se selecciona por defecto
por ser la más reciente.

Totales de las **capturas previas** (`results/replay/`):

| Escenario | Peticiones | Rechazadas | Motivo principal |
|---|---:|---:|---|
| E1 · Catálogo (gateway) | 382 | 0 | — |
| E4 · Disponibilidad (gateway) | 166 | 0 | — |
| E5 · Detalle de evento (gateway) | 393 | 0 | — |
| E6 · Flash sale (gateway) | 116 | 33 | `OUT_OF_STOCK` (409) |
| E7 · Confirmación (gateway) | 371 | 69 | `RATE_LIMITED` (429) |
| E8 · Degradación (gateway) | 415 | 235 | `RATE_LIMITED` (429) |
| I1 · Calibración (directo) | 38.211 | 0 | — |
| I2 · Disponibilidad (directo) | 318 | 0 | — |
| I3 · Flash sale (directo) | 211 | 51 | `OUT_OF_STOCK` (409) |
| I4 · Confirmación (directo) | 291 | 235 | `ALREADY_CONFIRMED` (410) e `INVALID_STATE` (409) |
| I5 · Estrés (directo) | 14.263 | 14.227 | `OUT_OF_STOCK` (409) |

Los escenarios con más de 2.500 peticiones se muestrean de forma acotada mientras se lee el JSON:
se conservan **todos los rechazos** y una selección determinista del resto. Los contadores del
panel siempre son sobre el total real capturado.

## Regenerar y capturar más escenarios

Regenerar el visor sin ejecutar nada:

```powershell
node scripts\generate-replay.js
```

Capturar una **sesión completa** con salida por petición (la deja seleccionable en el visor):

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-all.ps1 -Scenarios '01,04,05,06,07,08,i1,i2,i3,i4,i5' -Smoke -ReplayJson -Label post-visualizacion
node scripts\generate-visual-report.js
node scripts\generate-replay.js
```

Capturar un solo escenario:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-scenario.ps1 -Scenario 06 -ReplayJson
node scripts\generate-replay.js
```

`-ReplayJson` es opt-in: una corrida `local` completa genera cientos de miles de peticiones y el
JSON puede ocupar cientos de MB; de hecho I1 se colgó en el primer intento por ese volumen. Por eso
la sesión `post-visualizacion` usa `-Smoke` (las 11 pruebas siguen presentes, con stages cortos).
El generador lee línea por línea y limita los eventos en memoria; el visor limita los puntos
simultáneos en pantalla para no cargar el DOM.
