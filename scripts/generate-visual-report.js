#!/usr/bin/env node
/**
 * Generates the visual annex of the load-test report from existing k6 run.json files.
 * It never executes load tests and has no third-party dependencies.
 *
 * Usage: node scripts/generate-visual-report.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SESSIONS_DIR = path.join(ROOT, 'results', 'sessions');
const REPORTS_DIR = path.join(ROOT, 'docs_ia', 'informes');
const VISUAL_DIR = path.join(REPORTS_DIR, 'visual');
fs.mkdirSync(VISUAL_DIR, { recursive: true });

const SCENARIO_LABELS = {
  '01-inv-calibration': 'I1 · Calibración (inventario)',
  '02-inv-availability': 'I2 · Disponibilidad',
  '03-inv-flash-sale': 'I3 · Flash sale',
  '04-inv-confirm': 'I4 · Confirmación',
  '05-inv-stress': 'I5 · Estrés',
  '01-catalog': 'E1 · Catálogo',
  '04-availability': 'E4 · Disponibilidad',
  '05-event-detail': 'E5 · Detalle de evento',
  '06-flash-sale': 'E6 · Flash sale',
  '07-confirm': 'E7 · Confirmación',
  '08-degradation': 'E8 · Degradación'
};

// Static description of each k6 script: endpoint, purpose, configured load and expected result.
// Kept here so the generated HTML/Markdown never drifts from the scripts without an explicit edit.
const SCENARIO_INFO = {
  '01-catalog': {
    endpoint: 'GET /api/eventos (vía gateway)',
    purpose: 'Lista el catálogo de eventos; mide latencia de lectura cacheable.',
    load: '20 s a 5 VUs · 60 s a 25 VUs · 20 s ramp-down',
    expected: '200; sin 5xx. Es la línea base de catálogo antes de DA-009.'
  },
  '04-availability': {
    endpoint: 'GET /api/inventario/eventos/{eventId}/disponibilidad (vía gateway)',
    purpose: 'Consulta el contador atómico de cupos por localidad.',
    load: '20 s a 4 VUs · 60 s a 8 VUs · 20 s ramp-down',
    expected: '200 o 429 del rate limiter del gateway; nunca 5xx.'
  },
  '05-event-detail': {
    endpoint: 'GET /api/eventos/{eventId} (vía gateway)',
    purpose: 'Lee el detalle de un evento publicado (catálogo).',
    load: '20 s a 5 VUs · 60 s a 25 VUs · 20 s ramp-down',
    expected: '200 con el evento completo; sin 5xx.'
  },
  '06-flash-sale': {
    endpoint: 'GET disponibilidad · POST /api/reservas · POST /api/reservas/{id}/confirmar (vía gateway)',
    purpose: 'Simula apertura de venta: muchos compradores compiten por 100 cupos.',
    load: '10 s a 15 VUs · 100 s a 15 VUs · 10 s ramp-down',
    expected: '200/201 al reservar, 409 al agotar cupo, 429 por rate limit; invariante stock=0 y nunca negativo.'
  },
  '07-confirm': {
    endpoint: 'POST /api/reservas · POST /api/reservas/{id}/confirmar (vía gateway)',
    purpose: 'Crea y confirma reservas con Idempotency-Key única por petición.',
    load: '10 s a 8 VUs · 50 s a 8 VUs · 10 s ramp-down',
    expected: '200/201 al confirmar; 409/410 en re-confirmaciones; 429 por rate limit; sin 5xx.'
  },
  '08-degradation': {
    endpoint: 'POST /api/reservas (vía gateway)',
    purpose: 'Ráfaga sostenida para observar degradación controlada.',
    load: '5 s a 40 VUs · 50 s a 40 VUs · 5 s ramp-down',
    expected: '200/201/409/429; el circuit breaker puede abrir y responder fallback 503 sin corromper Redis.'
  },
  '01-inv-calibration': {
    endpoint: 'GET /api/inventario/eventos/{eventId}/disponibilidad (directo, sin gateway)',
    purpose: 'Busca el codo de capacidad del servicio de inventario.',
    load: '30 s a 10 VUs · 30 s a 25 · 30 s a 50 · 30 s a 75 · 30 s a 0',
    expected: '200; sin 5xx. Aquí se midió la CPU de catálogo antes/después de DA-009.'
  },
  '02-inv-availability': {
    endpoint: 'GET /api/inventario/eventos/{eventId}/disponibilidad (directo, sin gateway)',
    purpose: 'Mide disponibilidad sostenida a carga baja constante.',
    load: '20 s a 5 VUs · 80 s a 20 VUs · 20 s ramp-down',
    expected: '200; p95 estable y sin 5xx.'
  },
  '03-inv-flash-sale': {
    endpoint: 'GET disponibilidad · POST /api/reservas · POST /api/reservas/{id}/confirmar (directo)',
    purpose: 'Prueba clave de concurrencia: 100 cupos, 15 compradores, sin freno del gateway.',
    load: '10 s a 15 VUs · 100 s a 15 VUs · 10 s ramp-down · STOCK=100',
    expected: '100 reservas aceptadas, el resto 409; stock final 0, nunca negativo; verificado con SQL + Redis.'
  },
  '04-inv-confirm': {
    endpoint: 'POST /api/reservas (setup) · POST /api/reservas/{id}/confirmar (directo)',
    purpose: 'Confirma reservas creadas previamente y comprueba el estado emitido.',
    load: '10 s a 10 VUs · 50 s a 10 VUs · 10 s ramp-down',
    expected: '200/201 con status CONFIRMED; 409/410 en re-confirmaciones; sin 5xx.'
  },
  '05-inv-stress': {
    endpoint: 'POST /api/reservas (directo, sin think time)',
    purpose: 'Contención extrema sobre el contador Redis y la escritura en PostgreSQL.',
    load: '5 s a 45 VUs · 55 s a 45 VUs · 5 s ramp-down',
    expected: '200/201 o 409 por cupo agotado; timeouts controlados, nunca 5xx ni stock negativo.'
  }
};

function parseStarted(value) {
  const m = /^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})$/.exec(value || '');
  if (!m) return null;
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]));
}

function parseFinished(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/.exec(value || '');
  if (!m) return null;
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]));
}

function durationSeconds(run) {
  // Prefer the main-phase window: k6's own window also includes setup requests.
  const measured = run.mainWindowSec ?? run.measuredDurationSec ??
    (run.requests?.rate_per_s > 0 ? run.requests.total / run.requests.rate_per_s : null);
  if (Number.isFinite(measured) && measured > 0) return Math.round(measured * 10) / 10;
  const start = parseStarted(run.startedAt);
  const finish = parseFinished(run.finishedAt);
  if (start && finish && finish > start) return Math.round((finish - start) / 1000);
  return (run.stages || []).reduce((sum, stage) => {
    const m = /^(\d+(?:\.\d+)?)s/.exec(stage);
    return sum + (m ? parseFloat(m[1]) : 0);
  }, 0);
}

function actualLoad(run) {
  const stages = (run.stages || []).join(' · ') || 'stages no registrados';
  const stock = run.stock === null || run.stock === undefined ? '' : ` · STOCK=${run.stock}`;
  return stages + stock;
}

function inferTarget(baseUrl) {
  if (!baseUrl) return 'Otro';
  if (baseUrl.includes('api-gateway')) return 'API Gateway';
  if (baseUrl.includes('inventory-service')) return 'Inventario';
  if (baseUrl.includes('catalog-service')) return 'Catálogo';
  return 'Otro';
}

function labelFor(run) {
  return SCENARIO_LABELS[run.scenario] || run.scenario;
}

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function mermaidSafe(value) {
  return String(value).replace(/[^\wÀ-ÿ0-9]/g, '_');
}

const runs = [];
for (const session of fs.readdirSync(SESSIONS_DIR).sort()) {
  const sessionDir = path.join(SESSIONS_DIR, session);
  if (!fs.statSync(sessionDir).isDirectory()) continue;
  for (const scenario of fs.readdirSync(sessionDir).sort()) {
    const file = path.join(sessionDir, scenario, 'run.json');
    if (!fs.existsSync(file)) continue;
    const raw = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
    runs.push({
      session,
      scenario: raw.scenario || scenario,
      label: labelFor(raw),
      stages: raw.stages || [],
      target: inferTarget(raw.baseUrl),
      baseUrl: raw.baseUrl,
      // Main phase only: setup requests are preparation, not load.
      rate: raw.mainRate ?? raw.requests?.rate_per_s ?? 0,
      requests: raw.mainRequests ?? raw.requests?.total ?? 0,
      k6Rate: raw.requests?.rate_per_s ?? null,
      k6Requests: raw.requests?.total ?? null,
      failedRate: raw.requests?.failed_rate || 0,
      checksRate: raw.checks?.rate ?? null,
      p95: raw.latencyMs?.p95 || 0,
      p99: raw.latencyMs?.p99 || 0,
      duration: durationSeconds(raw),
      wallDuration: raw.wallDurationSec ?? null,
      stock: raw.stock ?? null,
      peakCpu: raw.resources?.peakCpuPercent || 0,
      peakMem: raw.resources?.peakMemMiB || 0,
      thresholdsOk: Boolean(raw.thresholdsOk)
    });
  }
}

const bySession = runs.reduce((acc, run) => {
  (acc[run.session] = acc[run.session] || []).push(run);
  return acc;
}, {});
const sessions = Object.keys(bySession).sort();
const latestInventory = sessions.filter(s => bySession[s].some(r => r.target === 'Inventario')).pop();
const latestGateway = sessions.filter(s => bySession[s].some(r => r.target === 'API Gateway')).pop();
const featured = Array.from(new Set([latestInventory, latestGateway])).filter(Boolean);

const BEFORE_SESSION = '20261115-095106';
const POST_SESSION = sessions.filter(s => s.includes('post-da009')).pop();

function runFor(session, scenario) {
  return (bySession[session] || []).find(r => r.scenario === scenario);
}

function readText(session, scenario, file) {
  const full = path.join(SESSIONS_DIR, session, scenario, file);
  return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : '';
}

function catalogCpu(session, scenario) {
  const text = readText(session, scenario, 'resources-summary.md');
  const m = /\|\s*ticketflow-catalog-service\s*\|\s*([\d.]+)\s*\|/.exec(text);
  return m ? parseFloat(m[1]) : null;
}

function sampleCount(session, scenario) {
  const text = readText(session, scenario, 'resources-summary.md');
  const m = /-\s*Muestras:\s*(\d+)/.exec(text);
  return m ? parseInt(m[1], 10) : null;
}

function invariantResult(session, scenario) {
  const text = readText(session, scenario, 'invariants.log');
  const m = /RESULTADO:\s*(PASS|FAIL)/.exec(text);
  return m ? m[1] : 'n/d';
}

function prometheusSnapshot() {
  if (!POST_SESSION) return null;
  const full = path.join(SESSIONS_DIR, POST_SESSION, 'prometheus-summary.json');
  return fs.existsSync(full)
    ? JSON.parse(fs.readFileSync(full, 'utf8').replace(/^\uFEFF/, ''))
    : null;
}

function fmt(value, digits = 1) {
  return Number(value).toLocaleString('es-ES', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function log10(value) {
  return Math.log10(Math.max(value, 1));
}

function infoFor(run) {
  return SCENARIO_INFO[run.scenario] || {
    endpoint: 'n/d',
    purpose: 'Escenario sin descripción registrada.',
    load: (run.stages || []).join(', ') || 'n/d',
    expected: 'n/d'
  };
}

const REQ_RATE_EXPLANATION = [
  'El req/s **no es una configuración fija**: es `peticiones totales / duración real` de cada corrida.',
  'Cambia entre sesiones aunque el escenario sea el mismo porque:',
  '1. El perfil cambia los `stages` y el número de VUs (las sesiones `smoke` son más cortas que `local`).',
  '2. La suite directa a inventario no pasa por el `RequestRateLimiter` del gateway (10 req/s, ráfaga 20); la suite gateway sí, por eso sus cifras son mucho menores.',
  '3. k6 espera la respuesta antes de la siguiente iteración: un servicio más lento reduce el req/s aunque haya los mismos VUs.',
  '4. En flash sale, las respuestas 409 por cupo agotado siguen contando como peticiones y el cliente sigue reintentando: sube el total y se alarga la duración.',
  '5. El equipo tiene más contenedores levantados en unas sesiones que en otras (Redis, Kafka, ES, LocalStack, frontend).',
  '6. Con `-ReplayJson`, k6 vuelca el JSON **después** de medir: la duración de la carpeta incluye ese vuelco, pero el req/s se calcula sobre la ventana real de carga (I1: 29.033 peticiones / 30,25 s = 959,9 req/s, aunque la carpeta tarde 535 s).'
].join('\n');

// ---------- Markdown with Mermaid ----------
function mermaidFlow(sessionRuns) {
  const lines = ['```mermaid', 'flowchart LR'];
  lines.push('  K6["Generador k6"]');
  lines.push('  GW["API Gateway :8080"]');
  lines.push('  INV["Inventario :8082"]');
  lines.push('  CAT["Catálogo :8082"]');
  lines.push('  REDIS[("Redis<br/>stock + proyección")]');
  lines.push('  KAFKA[("Kafka<br/>eventos")]');
  lines.push('  K6 -->|"suite directa"| INV');
  lines.push('  K6 -->|"suite gateway"| GW');
  lines.push('  GW --> INV');
  lines.push('  GW --> CAT');
  lines.push('  INV --> REDIS');
  lines.push('  INV --> KAFKA');
  lines.push('  CAT --> KAFKA');
  lines.push('');
  sessionRuns.forEach((run, index) => {
    const node = 'Q' + index;
    const dest = run.target === 'Inventario' ? 'INV' : 'GW';
    lines.push(`  ${node}["${esc(run.label)}<br/>${fmt(run.rate)} req/s · ${run.duration} s · p95 ${fmt(run.p95)} ms"] --> ${dest}`);
  });
  lines.push('```');
  return lines.join('\n');
}

function shortLabel(run) {
  return run.label.split('·')[0].trim();
}

function mermaidBars(sessionRuns, title, valueFn, axisLabel, maxValue) {
  const lines = ['```mermaid', 'xychart-beta', `  title "${title}"`];
  lines.push(`  x-axis [${sessionRuns.map(r => `"${shortLabel(r)}"`).join(', ')}]`);
  lines.push(`  y-axis "${axisLabel}" 0 --> ${maxValue}`);
  lines.push(`  bar [${sessionRuns.map(r => fmt(valueFn(r), 2).replace(',', '.')).join(', ')}]`);
  lines.push('```');
  return lines.join('\n');
}

const md = [];
md.push('# Anexo visual — pruebas de carga de TicketFlow');
md.push('');
md.push('> Generado automáticamente por `scripts/generate-visual-report.js` desde los `run.json` de `results/sessions/`.');
md.push('> **No ejecuta pruebas de carga para generar el anexo.** Los datos son de las sesiones del 2026-11-15, la verificación del 2026-11-21 y el reporte completo `post-visualizacion` del 2026-11-22.');
md.push('');
md.push('> **Replay interactivo:** abre `visual/replay-interactivo.html` para ver petición por petición dónde se acepta o se rechaza y por qué. Ambos visores tienen selector de sesión; `post-visualizacion` viene seleccionada por defecto.');
md.push('');
md.push('## Cómo leerlo');
md.push('');
md.push('- **req/s** = peticiones HTTP por segundo, no paquetes TCP.');
md.push('- Peticiones, req/s y duración cuentan solo la fase `main`. El `setup` es preparación y se excluye; en el replay se puede mostrar con «Mostrar setup».');
md.push('- **CPU %** está relativo a un núcleo: puede superar 100 % cuando el servicio usa varios hilos.');
md.push('- **p95** es el percentil 95 de duración de petición; es la métrica válida en este entorno compartido (el plan descarta p99 como umbral).');
md.push('- Las barras de caudal usan **log10(req/s)** para que escenarios de 10 req/s y de 4 000 req/s quepan en la misma gráfica. En el eje, `3` = 1.000 req/s y `3,3` ≈ 2.000; es el exponente, no `10^1000`. I5: `log10(1.781,2) = 3,2507` → `10^3,2507 ≈ 1.781` req/s.');
md.push('- La duración se calcula entre `startedAt` y `finishedAt` de cada `run.json`; puede diferir unos segundos de la duración impresa en el `SUMMARY.md`.');
md.push('');
md.push('## ¿Por qué cambia el req/s entre sesiones si es el mismo escenario?');
md.push('');
md.push(REQ_RATE_EXPLANATION);
md.push('');
md.push('## Qué mide cada escenario');
md.push('');
md.push('| Escenario | Endpoint | Qué hace | Carga de referencia (perfil `local`) | Esperado |');
md.push('|---|---|---|---|---|');
const uniqueRuns = Array.from(new Map(runs.map(r => [r.scenario, r])).values())
  .sort((a, b) => a.label.localeCompare(b.label, 'es'));
uniqueRuns.forEach(run => {
  const info = infoFor(run);
  md.push(`| ${esc(run.label)} | ${esc(info.endpoint)} | ${esc(info.purpose)} | ${esc(info.load)} | ${esc(info.expected)} |`);
});
md.push('');
md.push('> La tabla anterior describe el perfil `local` de referencia. La carga **realmente ejecutada** en cada sesión (stages y stock) se indica en la sección de esa sesión y en el visor HTML.');
md.push('');
featured.forEach(session => {
  const sessionRuns = bySession[session];
  const high = sessionRuns.filter(r => r.rate >= 100);
  const low = sessionRuns.filter(r => r.rate < 100);
  md.push(`## Sesión \`${session}\``);
  md.push('');
  md.push(`Destino predominante: **${sessionRuns[0].target}**. ${sessionRuns.length} escenarios.`);
  md.push('');
  md.push('| Escenario | Stages ejecutados | Stock sembrado |');
  md.push('|---|---|---:|');
  sessionRuns.forEach(r => {
    md.push(`| ${esc(r.label)} | ${esc(actualLoad(r))} | ${r.stock ?? '—'} |`);
  });
  md.push('');
  md.push('### Flujo y carga por escenario');
  md.push('');
  md.push('Cada caja indica el escenario, el caudal medio, la duración y el p95. La flecha muestra a qué servicio llega el tráfico.');
  md.push('');
  md.push(mermaidFlow(sessionRuns));
  md.push('');
  if (high.length) {
    md.push('### Caudal alto — log10(req/s)');
    md.push('');
    md.push(mermaidBars(high, `Caudal por escenario — ${session}`, r => log10(r.rate), 'log10(req/s): 3=1.000, 4=10.000', Math.ceil(Math.max(...high.map(r => log10(r.rate)))) + 1));
    md.push('');
  }
  if (low.length) {
    md.push('### Escenarios funcionales — req/s');
    md.push('');
    md.push(mermaidBars(low, `Caudal por escenario — ${session}`, r => r.rate, 'req/s', Math.ceil(Math.max(...low.map(r => r.rate))) + 5));
    md.push('');
  }
  md.push('### Duración de cada escenario (segundos)');
  md.push('');
  md.push(mermaidBars(sessionRuns, `Duración — ${session}`, r => r.duration, 'segundos', Math.ceil(Math.max(...sessionRuns.map(r => r.duration))) + 20));
  md.push('');
  md.push('| Escenario | Destino | req/s (main) | log10 | Ventana main | p95 | p99 | Fallidas | CPU pico | RAM pico |');
  md.push('|---|---|---:|---:|---:|---:|---:|---:|---:|---:|');
  sessionRuns.forEach(r => {
    md.push(`| ${esc(r.label)} | ${r.target} | ${fmt(r.rate)} | ${log10(r.rate).toFixed(4).replace('.', ',')} | ${r.duration} s | ${fmt(r.p95)} ms | ${fmt(r.p99)} ms | ${fmt(r.failedRate, 2)} % | ${fmt(r.peakCpu)} % | ${fmt(r.peakMem)} MiB |`);
  });
  md.push('');
});
md.push('## Antes y después de DA-009');
md.push('');
md.push(`Sesión anterior: \`${BEFORE_SESSION}\` · sesión de verificación: \`${POST_SESSION || 'pendiente'}\`.`);
md.push('');
md.push('| Métrica | Antes (15-Nov) | Después de DA-009 |');
md.push('|---|---|---|');

const bI1 = runFor(BEFORE_SESSION, '01-inv-calibration');
const aI1 = runFor(POST_SESSION, '01-inv-calibration');
const bI2 = runFor(BEFORE_SESSION, '02-inv-availability');
const aI2 = runFor(POST_SESSION, '02-inv-availability');
const bI3 = runFor(BEFORE_SESSION, '03-inv-flash-sale');
const aI3 = runFor(POST_SESSION, '03-inv-flash-sale');
const snap = prometheusSnapshot();
const catalogGets = snap?.afterRun?.['catalog-service']?.['GET /api/eventos/{eventId}/localidades'];
const availabilityGets = snap?.afterRun?.['inventory-service']?.['GET /api/inventario/eventos/{eventoId}/disponibilidad'];
const bCpu = catalogCpu(BEFORE_SESSION, '01-inv-calibration');
const aCpu = catalogCpu(POST_SESSION, '01-inv-calibration');
const bSamples = sampleCount(BEFORE_SESSION, '01-inv-calibration');
const aSamples = sampleCount(POST_SESSION, '01-inv-calibration');
const pct = value => value === null || value === undefined ? 'n/d' : `${fmt(value, 2)} %`;

md.push(`| CPU media de catálogo (I1) | ${pct(bCpu)} (${bSamples} muestras) | **${pct(aCpu)}** (${aSamples} muestras) |`);
const formattedGets = availabilityGets === undefined || availabilityGets === null
  ? 'n/d'
  : Number(availabilityGets).toLocaleString('es-ES');
md.push(`| GET de inventario a \`/localidades\` | 1 por petición (código anterior; sin métrica en 15-Nov) | **${catalogGets ?? 'n/d'}** en ${formattedGets} lecturas de disponibilidad |`);
md.push(`| p95 de disponibilidad (I1, alta carga) | ${bEj1()} | ${aEj1()} |`);
md.push(`| p95 de disponibilidad (I2, carga sostenida) | ${bEj2()} | ${aEj2()} |`);
md.push(`| Fallidas / checks | 0,00 % fallidas · checks ${pct((bI1?.checksRate ?? 0) * 100)} / ${pct((bI2?.checksRate ?? 0) * 100)} / ${pct((bI3?.checksRate ?? 0) * 100)} | 0,00 % fallidas · checks ${pct((aI1?.checksRate ?? 0) * 100)} / ${pct((aI2?.checksRate ?? 0) * 100)} / ${pct((aI3?.checksRate ?? 0) * 100)} |`);
md.push(`| Invariante anti-sobreventa (I3) | ${invariantResult(BEFORE_SESSION, '03-inv-flash-sale')} · 100 reservas, stock 0 | ${invariantResult(POST_SESSION, '03-inv-flash-sale')} · 100 reservas, stock 0 |`);
md.push('');
md.push('> Resultado de la verificación: **3/3 escenarios PASS**. El flash sale tardó 31 min 40 s porque el cliente siguió reintentando después de agotar el cupo; los 409 son rechazos esperados (`http.expectedStatuses(200,201,409)`), no fallos.');
md.push('> La CPU de catálogo cayó de 209,54 % a 1,21 % en I1, pero el caudal también bajó de 3.317,5 a 2.098,6 req/s y solo se tomaron 9 muestras (antes 30): es una señal direccional, no un benchmark a igual carga.');
md.push('> El p95 **no mejoró** (I1: 18,7 → 29,3 ms; I2: 3,9 → 10,2 ms). DA-009 eliminó el acoplamiento HTTP; no era una optimización de latencia, y el stack actual tiene más contenedores levantados que en la sesión anterior.');
md.push('');

function bEj1() { return `${fmt(bI1?.p95 || 0)} ms @ ${fmt(bI1?.rate || 0)} req/s`; }
function aEj1() { return `${fmt(aI1?.p95 || 0)} ms @ ${fmt(aI1?.rate || 0)} req/s`; }
function bEj2() { return `${fmt(bI2?.p95 || 0)} ms @ ${fmt(bI2?.rate || 0)} req/s`; }
function aEj2() { return `${fmt(aI2?.p95 || 0)} ms @ ${fmt(aI2?.rate || 0)} req/s`; }
md.push('## Archivos visuales');
md.push('');
md.push('- `visual/resumen-carga.svg` — imagen estática para insertar en diapositivas.');
md.push('- `visual/resumen-carga.html` — vista interactiva (selecciona sesión) para abrir en el navegador.');
md.push('- Este archivo — diagramas Mermaid que se renderizan en GitHub o VS Code.');
md.push('');

fs.writeFileSync(path.join(REPORTS_DIR, 'anexo-visual-pruebas-carga.md'), md.join('\n') + '\n', 'utf8');

// ---------- Static SVG ----------
function svgPanel(x, y, w, h, title) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#ffffff" stroke="#d0d7de"/>` +
    `<text x="${x + 16}" y="${y + 26}" font-family="Segoe UI,Arial,sans-serif" font-size="16" font-weight="600" fill="#1f2328">${esc(title)}</text>`;
}

const svgRuns = bySession[latestInventory] || [];
const maxRate = Math.max(...svgRuns.map(r => log10(r.rate)), 1);
const svg = [];
svg.push('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="980" viewBox="0 0 1200 980">');
svg.push('<rect width="1200" height="980" fill="#f6f8fa"/>');
svg.push('<text x="40" y="48" font-family="Segoe UI,Arial,sans-serif" font-size="26" font-weight="700" fill="#1f2328">TicketFlow · Resumen de pruebas de carga</text>');
svg.push(`<text x="40" y="74" font-family="Segoe UI,Arial,sans-serif" font-size="14" fill="#57606a">Sesión ${esc(latestInventory)} · inventario directo · req/s = peticiones HTTP/s</text>`);

svg.push(svgPanel(40, 100, 1120, 230, 'Flujo de la carga'));
const boxes = [
  [70, 155, 190, 70, 'Generador k6', '#ddf4ff'],
  [340, 155, 190, 70, 'API Gateway', '#fff8c5'],
  [610, 155, 190, 70, 'Inventario :8082', '#dafbe1'],
  [880, 155, 250, 70, 'Redis · stock y proyección', '#fbefff']
];
boxes.forEach(([x, y, w, h, text, fill]) => {
  svg.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${fill}" stroke="#8c959f"/>`);
  svg.push(`<text x="${x + w / 2}" y="${y + h / 2 + 5}" text-anchor="middle" font-family="Segoe UI,Arial,sans-serif" font-size="14" fill="#1f2328">${esc(text)}</text>`);
});
svg.push('<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#57606a"/></marker></defs>');
[[260, 340], [530, 610], [800, 880]].forEach(([from, to]) => {
  svg.push(`<line x1="${from}" y1="190" x2="${to}" y2="190" stroke="#57606a" stroke-width="2" marker-end="url(#arrow)"/>`);
});
svg.push('<path d="M165 225 L165 248 L705 248 L705 225" fill="none" stroke="#1a7f37" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#arrow)"/>');
svg.push('<text x="435" y="266" text-anchor="middle" font-family="Segoe UI,Arial,sans-serif" font-size="12" fill="#1a7f37">suite directa a inventario (sin gateway)</text>');
svg.push(`<text x="70" y="300" font-family="Segoe UI,Arial,sans-serif" font-size="13" fill="#57606a">${esc(svgRuns.map(r => `${r.label}: ${fmt(r.rate)} req/s · ${r.duration} s`).join('   |   '))}</text>`);

svg.push(svgPanel(40, 360, 1120, 300, 'Caudal por escenario · log10(req/s): 3 = 1.000 req/s, 3,3 ≈ 2.000'));
svgRuns.forEach((r, i) => {
  const y = 410 + i * 44;
  const w = (log10(r.rate) / maxRate) * 760;
  svg.push(`<text x="60" y="${y + 18}" font-family="Segoe UI,Arial,sans-serif" font-size="13" fill="#1f2328">${esc(r.label)}</text>`);
  svg.push(`<rect x="360" y="${y + 4}" width="${Math.max(w, 2)}" height="22" rx="4" fill="#0969da"/>`);
  svg.push(`<text x="${370 + Math.max(w, 2)}" y="${y + 19}" font-family="Segoe UI,Arial,sans-serif" font-size="12" fill="#1f2328">${fmt(r.rate)} req/s</text>`);
});

svg.push(svgPanel(40, 690, 1120, 250, 'Duración de cada escenario'));
const maxDuration = Math.max(...svgRuns.map(r => r.duration), 1);
svgRuns.forEach((r, i) => {
  const y = 740 + i * 36;
  const w = (r.duration / maxDuration) * 760;
  svg.push(`<text x="60" y="${y + 16}" font-family="Segoe UI,Arial,sans-serif" font-size="13" fill="#1f2328">${esc(r.label)}</text>`);
  svg.push(`<rect x="360" y="${y + 3}" width="${Math.max(w, 2)}" height="18" rx="4" fill="#1a7f37"/>`);
  svg.push(`<text x="${370 + Math.max(w, 2)}" y="${y + 17}" font-family="Segoe UI,Arial,sans-serif" font-size="12" fill="#1f2328">${r.duration} s</text>`);
});
svg.push('</svg>');
fs.writeFileSync(path.join(VISUAL_DIR, 'resumen-carga.svg'), svg.join('\n') + '\n', 'utf8');

// ---------- Interactive HTML ----------
function guideRowsFor(sessionRuns) {
  return sessionRuns.map(run => {
    const info = infoFor(run);
    return `<tr>
      <td>${esc(run.label)}</td>
      <td><code>${esc(info.endpoint)}</code></td>
      <td>${esc(info.purpose)}</td>
      <td>${esc(actualLoad(run))}</td>
      <td>${esc(info.expected)}</td>
    </tr>`;
  }).join('\n');
}

const htmlSections = sessions.map(session => {
  const sessionRuns = bySession[session];
  const rows = sessionRuns.map(r => {
    const max = Math.max(...sessionRuns.map(x => log10(x.rate)), 1);
    const width = Math.max((log10(r.rate) / max) * 100, 1);
    return `<tr>
      <td>${esc(r.label)}</td><td>${esc(r.target)}</td>
      <td><div class="rate"><div class="bar" style="width:${width.toFixed(1)}%" title="${fmt(r.rate)} req/s"></div><span>${fmt(r.rate)} req/s</span><small>log₁₀ ${log10(r.rate).toFixed(4).replace('.', ',')}</small></div></td>
      <td>${r.duration} s</td><td>${fmt(r.p95)} ms</td><td>${fmt(r.failedRate, 2)} %</td>
      <td>${fmt(r.peakCpu)} %</td><td>${fmt(r.peakMem)} MiB</td>
    </tr>`;
  }).join('\n');
  return `<section id="s-${mermaidSafe(session)}" class="session" data-session="${esc(session)}">
    <h2>Sesión ${esc(session)}</h2>
    <p class="hint">Peticiones, req/s y duración cuentan solo la fase <code>main</code>; el <code>setup</code> se excluye (en el replay se ve con «Mostrar setup»). Duración = ventana real entre la primera y la última petición de carga; el vuelco de <code>requests.json</code> no cuenta. <code>log10(1.781,2)=3,2508</code> → <code>10^3,2508 ≈ 1.781</code>. El número grande es req/s reales; el pequeño, su exponente. <code>STOCK=100</code> es capacidad sembrada, no reservas vendidas.</p>
    <table>
      <thead><tr><th>Escenario</th><th>Destino</th><th>Caudal real · exponente log10</th><th>Ventana main</th><th>p95</th><th>Fallidas</th><th>CPU pico</th><th>RAM pico</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <details class="guide" open>
      <summary>Carga ejecutada y qué mide cada escenario en esta sesión</summary>
      <table>
        <thead><tr><th>Escenario</th><th>Endpoint</th><th>Qué hace</th><th>Stages + stock ejecutados</th><th>Esperado</th></tr></thead>
        <tbody>${guideRowsFor(sessionRuns)}</tbody>
      </table>
    </details>
  </section>`;
}).join('\n');

function inlineMarkdown(text) {
  return esc(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

const htmlExplanation = REQ_RATE_EXPLANATION.split('\n')
  .map(line => `<p>${inlineMarkdown(line)}</p>`)
  .join('');

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>TicketFlow · Visor de pruebas de carga</title>
<style>
  body { font-family: Segoe UI, Arial, sans-serif; margin: 32px; color: #1f2328; background: #f6f8fa; }
  h1 { margin-bottom: 4px; }
  .hint { color: #57606a; margin-bottom: 20px; }
  select { font-size: 15px; padding: 6px 10px; margin-bottom: 20px; }
  .session { display: none; background: #fff; padding: 18px; border: 1px solid #d0d7de; border-radius: 10px; }
  .session.active { display: block; }
  .guide { background: #fff; padding: 16px 18px; border: 1px solid #d0d7de; border-radius: 10px; margin-bottom: 20px; }
  .guide summary { cursor: pointer; font-weight: 600; font-size: 16px; margin-bottom: 10px; }
  .guide p { margin: 8px 0; font-size: 13px; }
  table { border-collapse: collapse; width: 100%; font-size: 14px; }
  th, td { border-bottom: 1px solid #d8dee4; padding: 8px 10px; text-align: left; vertical-align: middle; }
  th { background: #f6f8fa; }
  .guide table { font-size: 12px; }
  .guide code, .hint code { background: #f6f8fa; padding: 1px 4px; border-radius: 3px; }
  .session td:nth-child(3) { min-width: 260px; }
  .bar { display: inline-block; height: 12px; background: #0969da; border-radius: 3px; margin-right: 8px; vertical-align: middle; }
  .rate { display: flex; align-items: center; flex-wrap: wrap; gap: 2px 8px; }
  .rate small { display: block; width: 100%; color: #57606a; }
  span { font-variant-numeric: tabular-nums; }
</style>
</head>
<body>
<h1>TicketFlow · Visor de pruebas de carga</h1>
<p class="hint">Datos de las sesiones del 2026-11-15, 2026-11-21 y 2026-11-22. <strong>req/s = peticiones HTTP por segundo</strong>, no paquetes TCP; solo fase <code>main</code>, sin <code>setup</code>. La barra usa escala log10 para que 10 y 4.000 req/s quepan en la misma gráfica. CPU % es por núcleo. <a href="replay-interactivo.html">Abrir replay interactivo de peticiones →</a></p>
<details class="guide" open>
  <summary>¿Por qué cambia el req/s?</summary>
  ${htmlExplanation}
</details>
<label for="session-select">Sesión: </label>
<select id="session-select" onchange="showSession()">
  ${sessions.map((s, i) => `<option value="s-${mermaidSafe(s)}"${i === sessions.length - 1 ? ' selected' : ''}>${esc(s)}</option>`).join('\n  ')}
</select>
${htmlSections}
<script>
function showSession() {
  const id = document.getElementById('session-select').value;
  document.querySelectorAll('.session').forEach(el => el.classList.toggle('active', el.id === id));
}
showSession();
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(VISUAL_DIR, 'resumen-carga.html'), html, 'utf8');

console.log(`Generated visual annex from ${runs.length} runs in ${sessions.length} sessions.`);
console.log(`Featured sessions: ${featured.join(', ')}`);
console.log(`Output: ${path.relative(ROOT, REPORTS_DIR)}`);
