# P-001 — Anexo visual y métricas para el informe de carga

- **Fecha:** 2026-11-21
- **Estado:** IMPLEMENTADO
- **Relacionado:** `informe-pruebas-carga-2026-11-15.md`, `DA-010`/`P-022` de
  `ticketflow-inventory-service`, `DA-003`/`P-009` de `ticketflow-api-gateway`

## Objetivo

Que el informe de pruebas de carga sea más completo, explicar mejor los datos y ofrecer una vista
visual fácil de exponer. La primera entrega se hizo sin ejecutar pruebas; el usuario autorizó
después la corrida de verificación que completó la comparativa.

## Prompt del usuario

> "el informe de las pruebas sea aun mas completo y además mejora la forma en que se explican los
> datos en los informes, y ademas quiero poder ver de forma visual mas facil las pruebas, no se si
> mediante un diagrama de barras o en una imagen que explique a que microservio y cuantos paquetes
> por segundo se envian y durante cuantos segundos, o alguna otra forma que me propongas, la idea es
> qeu sea facil de exponer"

Autorización inicial: **Fase A + B** y **las tres formas visuales**, sin ejecutar pruebas de carga.
Autorización posterior del usuario ("sigue con eso que falta"): ejecutar la corrida que completaba
la comparativa pendiente.

## Documentos consultados

- `AGENTS.md` de la raíz del workspace.
- `docs_ia/contexto/plan_de_pruebas_carga_local.md` (R5, líneas 271 y 285).
- `docs_ia/informes/informe-pruebas-carga-2026-11-15.md`.
- 27 archivos `results/sessions/**/run.json` iniciales y 3 de la corrida `post-da009`.

## Cambios aplicados

- `scripts/generate-visual-report.js`: generador sin dependencias de terceros que lee los
  `run.json` y produce los tres formatos. Corrige BOM UTF-8, calcula la duración entre
  `startedAt` y `finishedAt` y lleva un mapa `SCENARIO_INFO` con endpoint, carga configurada y
  resultado esperado de los 11 escenarios.
- `docs_ia/informes/anexo-visual-pruebas-carga.md`: diagramas Mermaid de flujo, barras de caudal
  (log10) y duración, tablas por escenario, comparativa antes/después de DA-009 ya completada y
  secciones "¿Por qué cambia el req/s?" y "Qué mide cada escenario".
- `docs_ia/informes/visual/resumen-carga.svg`: imagen estática para diapositivas.
- `docs_ia/informes/visual/resumen-carga.html`: visor interactivo con selector de sesión y un
  apartado desplegable con la explicación de cada escenario (endpoint, qué hace, carga y esperado).
- `docs_ia/informes/visual/replay-interactivo.html`: visor autocontenido que reproduce peticiones
  reales, muestra el escalón donde se rechazan y el motivo (409/410/429/503/timeout), con selector
  de **sesión**, selector de escenario, scrubber y muestreo acotado en escenarios muy grandes.
- `scripts/generate-replay.js`, `scripts/run-scenario.ps1 -ReplayJson` y
  `scripts/run-all.ps1 -ReplayJson`: captura y generación del replay a partir de `http_reqs` +
  `http_req_duration` de k6; el generador lee línea por línea para no cargar JSON enormes en memoria.
- `docs_ia/informes/replay-interactivo.md`: instrucciones de uso, lectura del recorrido y comandos.
- `docs_ia/informes/informe-pruebas-carga-2026-11-15.md`: enlace al anexo.
- Este registro y el README de `docs_ia/prompts/`.

## Decisiones de presentación

- Se usa **req/s (peticiones HTTP/s)** y no "paquetes/s": son peticiones de k6, no paquetes TCP.
- La escala de caudal es **log10** para que 10 req/s y 4 000 req/s quepan juntos; el valor real
  aparece siempre al lado de la barra.
- Las cajas del flujo distinguen la **suite directa** de la **suite gateway**, porque el informe
  anterior dejó claro que "directo" salta el gateway.
- La explicación del req/s variable se puso en el propio visor: es `peticiones / duración real`,
  no un valor fijo; depende de stages/VUs, del rate limiter del gateway, del tiempo de respuesta,
  de los reintentos tras el 409 y de los contenedores levantados en cada sesión.
- La comparativa antes/después de DA-009 se dejó incompleta en la primera entrega y se completó con
  la corrida `20261121-215331-post-da009`, sin inventar valores.
- El replay se hace con salida por petición de k6, no con datos sintéticos: se capturaron los 11
  escenarios con `-ReplayJson` y se cruza `http_reqs` con `http_req_duration` por timestamp+URL.
  Las causas se derivan del código HTTP y del endpoint: 409 en `reservas` = `OUT_OF_STOCK`, 409/410
  en `confirmar` = `INVALID_STATE`/`ALREADY_CONFIRMED`, 429/503 gateway, 0 timeout. I1 e I5 se
  muestrean a 2.500 puntos conservando todos los rechazos.

## Comandos ejecutados

```powershell
node scripts/generate-visual-report.js
[xml](Get-Content docs_ia/informes/visual/resumen-carga.svg -Raw)
.\scripts\run-all.ps1 -Scenarios i1,i2,i3 -Profile local -Label post-da009
.\scripts\run-scenario.ps1 -Scenario 06 -Stages 5s:6,20s:10,5s:0 -Env STOCK=5,BUYERS=5 -NoSampler -ReplayJson -RunDir 'results\replay\06-flash-sale'
.\scripts\run-scenario.ps1 -Scenario 08 -Stages 3s:20,10s:40,3s:0 -NoSampler -ReplayJson -RunDir 'results\replay\08-degradation'
# El mismo patrón se repitió para 01, 04, 05, 07, i1, i2, i3, i4 e i5 (todos EXIT=0).
node scripts/generate-replay.js
.\scripts\run-all.ps1 -Scenarios '01,04,05,06,07,08,i1,i2,i3,i4,i5' -Smoke -ReplayJson -Label post-visualizacion
.\scripts\run-scenario.ps1 -Scenario i2 -Stages '5s:2,10s:4,5s:0' -ReplayJson -RunDir 'results\sessions\20261122-080447-post-visualizacion\02-inv-availability'
node scripts\generate-visual-report.js
node scripts\generate-replay.js
```

## Resultados

- Generadas 41 ejecuciones de 7 sesiones; destacada por defecto
  `20261122-080447-post-visualizacion` (11/11 PASS, smoke con replay), además de
  `20261121-215331-post-da009` (inventario directo) y `20261115-093525` (gateway).
- SVG validado como XML; HTML abierto en el panel de revisión.
- Corrida de verificación: I1, I2 e I3, **3/3 PASS**, sin sobreventa (100 reservas, stock 0).
- CPU media de catálogo en I1: 209,54 % → 1,21 % (9 muestras, caudal menor: 3.317,5 → 2.098,6
  req/s); es una señal direccional, no un benchmark a igual carga.
- `http.server.requests` de catálogo: **0 GET** a `/localidades` durante 321.362 lecturas de
  disponibilidad; solo 3 POST de alta de eventos del setup.
- p95: I1 18,7 → 29,3 ms e I2 3,9 → 10,2 ms. **No hubo mejora de latencia**; DA-009 eliminó el
  acoplamiento HTTP, no optimizó el camino de respuesta.
- Fallidas 0,00 % en los tres escenarios; los 409 del flash sale son rechazos por cupo agotado
  marcados como esperados por k6, no fallos.
- Instantánea Prometheus guardada en
  `results/sessions/20261121-215331-post-da009/prometheus-summary.json`.
- Replay completo: 11/11 escenarios capturados con `EXIT=0`. Rechazos: E6 33 `OUT_OF_STOCK`,
  E7 69 y E8 235 `RATE_LIMITED`, I3 51 `OUT_OF_STOCK`, I4 36 `INVALID_STATE` + 199
  `ALREADY_CONFIRMED`, I5 14.227 `OUT_OF_STOCK`. Visor generado y abierto en el panel de revisión.
- **Sesión nueva `20261122-080447-post-visualizacion`**: 11/11 PASS, smoke con `-ReplayJson`,
  `SUMMARY.md` y `session.json` propios. Se intentó primero sin `-Smoke`; I1 se colgó por el volumen
  de `requests.json` (254 MB) y se descartó esa carpeta antes de relanzar.
- `i2` falló dos veces por 1 check de 88 (`reporta localidades con cupos`): el `GET` de seed del
  `setup` llegaba antes de la proyección asíncrona de DA-009. Se añadió un *poll* acotado en
  `test-inventory/lib/api.js` (etiquetado `setup`, fuera de la latencia medida) y se repitió solo I2:
  44 peticiones `main` + 10 de `setup`, p95 22,23 ms, checks 100 %, global PASS.
- Ambos visores regenerados y verificados en navegador: el resumen selecciona por defecto
  `20261122-080447-post-visualizacion`; el replay ofrece esa sesión primero y `Capturas previas`
  como último grupo, 11 escenarios cada uno, 0 errores de consola.
- Corrección de **fase medida**: k6 incluye `setup()` en `http_reqs`, pero el replay lo oculta por
  defecto. `run-scenario.ps1` ahora deriva `mainRequests`, `mainRate` y `mainWindowSec` de las
  líneas `phase=main` de `requests.json`; el resumen usa esos valores y conserva los de k6 como
  `k6Requests`/`k6ReqPerSecond`. Ejemplos: I2 44 a 2,30 req/s en 19,11 s (k6: 54 a 2,48 en 21,77 s)
  e I3 195 a 6,67 req/s en 29,25 s (k6: 211 a 6,63 en 31,83 s). El replay ahora etiqueta
  «N peticiones de carga · +M setup · total capturadas», usa el timeline completo para los contadores
  (no los puntos muestreados) y su cronómetro es la ventana `main`: I5 marca 16,0 s y
  `28.481 + 46 = 28.527` capturadas, con 100 aceptadas y 28.381 `OUT_OF_STOCK`.
- Corrección de **duración**: `wallDurationSec` guarda el reloj de carpeta (con vuelco de JSON) y
  `mainWindowSec` la ventana real de carga; ya no se usa el reloj para req/s ni duración. I1 30,0 s
  e I5 16,0 s de ventana `main`; carga medida total 246,5 s frente a 22 min 27 s de reloj.
- Corrección de **configuración mostrada**: el visor ya muestra los stages y el stock **ejecutados**
  por sesión, no los del perfil `local` de referencia. En `post-visualizacion`, I3 es
  `5s:6 · 20s:10 · 5s:0 · STOCK=5`, E5 solo lectura sin stock, e I1/I5 `STOCK=100` sembrado
  (capacidad, no reservas vendidas).
- Corrección de **log10**: la tabla muestra el req/s real en grande y su exponente en pequeño
  (I5: `1.781,2 req/s · log10 3,2507`), para no confundir el exponente del eje con `10^1781`.
  `10^3,2507 ≈ 1.781`; `3` = 1.000 req/s y `3,3` ≈ 2.000 req/s.

## Pendientes

- Fase C (Grafana/cAdvisor) no autorizada.
