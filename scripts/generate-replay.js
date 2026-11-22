#!/usr/bin/env node
/**
 * Builds a self-contained interactive replay viewer from k6 per-request JSON output.
 * It reads results/replay/<escenario>/requests.json and never executes load tests.
 *
 * Usage: node scripts/generate-replay.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const REPLAY_DIR = path.join(ROOT, 'results', 'replay');
const VISUAL_DIR = path.join(ROOT, 'docs_ia', 'informes', 'visual');
fs.mkdirSync(VISUAL_DIR, { recursive: true });

const SCENARIO_META = {
  '01-catalog': {
    label: 'E1 · Catálogo (por gateway)',
    endpoint: 'GET /api/eventos',
    purpose: 'Lista de eventos: lectura cacheable del catálogo. Sin rechazos por cupo.',
    service: 'Catálogo', finalLabel: 'Redis caché', viaGateway: true
  },
  '04-availability': {
    label: 'E4 · Disponibilidad (por gateway)',
    endpoint: 'GET /api/inventario/eventos/{eventId}/disponibilidad',
    purpose: 'Consulta del contador atómico pasando por el rate limiter del gateway.',
    service: 'Inventario', finalLabel: 'Redis', viaGateway: true
  },
  '05-event-detail': {
    label: 'E5 · Detalle de evento (por gateway)',
    endpoint: 'GET /api/eventos/{eventId}',
    purpose: 'Detalle de un evento publicado; se sirve desde caché de catálogo.',
    service: 'Catálogo', finalLabel: 'Redis caché', viaGateway: true
  },
  '06-flash-sale': {
    label: 'E6 · Flash sale (por gateway)',
    endpoint: 'GET disponibilidad · POST /api/reservas · POST /api/reservas/{id}/confirmar',
    purpose: 'Muchos compradores compiten por 5 cupos: 429 en gateway y 409 por cupo agotado.',
    service: 'Inventario', finalLabel: 'Redis / Kafka', viaGateway: true
  },
  '07-confirm': {
    label: 'E7 · Confirmación (por gateway)',
    endpoint: 'POST /api/reservas · POST /api/reservas/{id}/confirmar',
    purpose: 'Crea y confirma reservas con Idempotency-Key; la confirmación no consume cupo.',
    service: 'Inventario', finalLabel: 'Redis / Kafka', viaGateway: true
  },
  '08-degradation': {
    label: 'E8 · Degradación (por gateway)',
    endpoint: 'POST /api/reservas',
    purpose: 'Ráfaga de hasta 40 VUs: el rate limiter rechaza antes de llegar a inventario.',
    service: 'Inventario', finalLabel: 'Redis / Kafka', viaGateway: true
  },
  'i1-calibration': {
    label: 'I1 · Calibración (directo)',
    endpoint: 'GET /api/inventario/eventos/{eventId}/disponibilidad',
    purpose: 'Escalera de VUs para encontrar el codo de capacidad; salta el gateway.',
    service: 'Inventario', finalLabel: 'Redis', viaGateway: false
  },
  'i2-availability': {
    label: 'I2 · Disponibilidad (directo)',
    endpoint: 'GET /api/inventario/eventos/{eventId}/disponibilidad',
    purpose: 'Carga sostenida de lecturas de cupo sin pasar por el gateway.',
    service: 'Inventario', finalLabel: 'Redis', viaGateway: false
  },
  'i3-flash-sale': {
    label: 'I3 · Flash sale (directo)',
    endpoint: 'GET disponibilidad · POST /api/reservas · POST /api/reservas/{id}/confirmar',
    purpose: 'Sin gateway: los rechazos son 409 por cupo agotado en el contador Redis.',
    service: 'Inventario', finalLabel: 'Redis / Kafka', viaGateway: false
  },
  'i4-confirm': {
    label: 'I4 · Confirmación (directo)',
    endpoint: 'POST /api/reservas (setup) · POST /api/reservas/{id}/confirmar',
    purpose: 'Confirma reservas creadas previamente; la confirmación no consume cupo.',
    service: 'Inventario', finalLabel: 'Redis / Kafka', viaGateway: false
  },
  'i5-stress': {
    label: 'I5 · Estrés (directo)',
    endpoint: 'POST /api/reservas',
    purpose: 'Contención extrema sobre el contador Redis y la escritura en PostgreSQL.',
    service: 'Inventario', finalLabel: 'Redis / Kafka', viaGateway: false
  }
};

// run-all.ps1 names inventory folders differently from the short ids used in the legacy captures.
const SCENARIO_ALIASES = {
  '01-inv-calibration': 'i1-calibration',
  '02-inv-availability': 'i2-availability',
  '03-inv-flash-sale': 'i3-flash-sale',
  '04-inv-confirm': 'i4-confirm',
  '05-inv-stress': 'i5-stress'
};

function metaFor(folder) {
  return SCENARIO_META[folder] ||
    SCENARIO_META[SCENARIO_ALIASES[folder]] ||
    SCENARIO_META[folder.replace(/^\d+-/, '')] || {
      label: folder,
      endpoint: 'ver `requests.json`',
      purpose: 'Escenario capturado para el replay.',
      service: 'Inventario', finalLabel: 'Redis / Kafka', viaGateway: false
    };
}

function parseLine(line) {
  try { return JSON.parse(line); } catch (error) { return null; }
}

function pathFromUrl(url) {
  if (!url) return '';
  try { return new URL(url).pathname; } catch (error) { return url; }
}

function classify(tags) {
  const status = Number(tags.status || 0);
  const phase = tags.phase || 'main';
  const endpoint = tags.endpoint || pathFromUrl(tags.url || tags.name) || 'petición';
  if (phase === 'setup') {
    return { endpoint, reason: 'SETUP', hop: 'SETUP', outcome: 'setup', label: 'setup' };
  }
  if (status === 429) {
    return { endpoint, reason: 'RATE_LIMITED', hop: 'GATEWAY', outcome: 'rejected', label: '429 · rate limit' };
  }
  if (status === 409 && endpoint === 'confirmar') {
    return { endpoint, reason: 'INVALID_STATE', hop: 'INVENTORY', outcome: 'rejected', label: '409 · estado inválido' };
  }
  if (status === 409) {
    return { endpoint, reason: 'OUT_OF_STOCK', hop: 'INVENTORY', outcome: 'rejected', label: '409 · sin cupo' };
  }
  if (status === 410) {
    return { endpoint, reason: 'ALREADY_CONFIRMED', hop: 'INVENTORY', outcome: 'rejected', label: '410 · ya confirmada' };
  }
  if (status === 503) {
    return { endpoint, reason: 'CIRCUIT_OPEN', hop: 'GATEWAY', outcome: 'rejected', label: '503 · circuit breaker' };
  }
  if (status === 0) {
    return { endpoint, reason: 'TIMEOUT', hop: 'CLIENT', outcome: 'rejected', label: 'timeout' };
  }
  if (status >= 500) {
    return { endpoint, reason: 'SERVER_ERROR', hop: 'INVENTORY', outcome: 'rejected', label: status + ' · error servidor' };
  }
  if (status >= 200 && status < 300) {
    return { endpoint, reason: 'OK', hop: 'FULL', outcome: 'accepted', label: status + ' · aceptada' };
  }
  return { endpoint, reason: 'OTHER', hop: 'FULL', outcome: 'other', label: status + ' · otro' };
}

// Bounded streaming parser: a full local run can emit hundreds of thousands of lines.
// It keeps full counters, a bounded sample of events and only the durations of kept events.
const MAX_KEPT = 2500;
const MAX_REJECTED = 1500;

function readScenario(dir) {
  const file = path.join(dir, 'requests.json');
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf8');
  const text = raw.charCodeAt(0) === 0xFEFF ? raw.slice(1) : raw;
  const durations = new Map();
  const pendingKeys = new Set();
  const rejectedEvents = [];
  const otherEvents = [];
  const timeline = [];
  const stats = { total: 0, accepted: 0, rejected: 0, setup: 0, byReason: {} };
  const capRejected = Math.min(MAX_REJECTED, MAX_KEPT);
  const capOther = MAX_KEPT - capRejected;
  let acceptedSeen = 0;
  let rejectedSeen = 0;
  let setupSeen = 0;
  let otherSeen = 0;
  let base = null;
  let lastTime = null;
  let mainBase = null;
  let mainLast = null;

  function attach(event, key) {
    if (event.outcome === 'rejected') {
      if (rejectedEvents.length < capRejected) {
        rejectedEvents.push(event);
      } else {
        const idx = rejectedSeen % capRejected;
        pendingKeys.delete(rejectedEvents[idx]._key);
        rejectedEvents[idx] = event;
      }
    } else if (otherEvents.length < capOther) {
      otherEvents.push(event);
    } else {
      const idx = otherSeen % capOther;
      pendingKeys.delete(otherEvents[idx]._key);
      otherEvents[idx] = event;
    }
    event._key = key;
    pendingKeys.add(key);
  }

  let cursor = 0;
  while (cursor < text.length) {
    let end = text.indexOf('\n', cursor);
    if (end === -1) end = text.length;
    const line = text.slice(cursor, end);
    cursor = end + 1;
    if (!line) continue;
    const row = parseLine(line);
    if (!row || row.type !== 'Point' || !row.data) continue;
    const tags = row.data.tags || {};
    const key = row.data.time + '|' + (tags.url || tags.name || '') + '|' + (tags.status || '');
    if (row.metric === 'http_req_duration') {
      if (pendingKeys.has(key)) durations.set(key, Number(row.data.value) || 0);
      continue;
    }
    if (row.metric !== 'http_reqs') continue;

    stats.total += 1;
    const timeMs = Date.parse(row.data.time);
    if (base === null) base = timeMs;
    lastTime = row.data.time;
    const info = classify(tags);
    stats.byReason[info.reason] = (stats.byReason[info.reason] || 0) + 1;
    if (info.outcome === 'accepted') acceptedSeen += 1;
    else if (info.outcome === 'rejected') rejectedSeen += 1;
    else if (info.outcome === 'setup') setupSeen += 1;
    if (info.outcome !== 'setup') {
      if (mainBase === null) mainBase = timeMs;
      mainLast = timeMs;
    }
    timeline.push({ time: timeMs, outcome: info.outcome, reason: info.reason });

    let keep = false;
    if (info.outcome === 'rejected') {
      keep = rejectedEvents.length < capRejected || rejectedSeen % 7 === 0;
    } else {
      otherSeen += 1;
      keep = otherEvents.length < capOther || otherSeen % 7 === 0;
    }
    if (!keep) continue;

    attach({
      method: tags.method || 'GET',
      url: pathFromUrl(tags.url || tags.name || ''),
      status: Number(tags.status || 0),
      phase: tags.phase || 'main',
      time: row.data.time,
      timeMs,
      endpoint: info.endpoint,
      reason: info.reason,
      hop: info.hop,
      outcome: info.outcome,
      label: info.label
    }, key);
  }

  if (!stats.total) return null;
  stats.accepted = acceptedSeen;
  stats.rejected = rejectedSeen;
  stats.setup = setupSeen;

  const events = rejectedEvents.concat(otherEvents);
  // The clock is the main-phase window; setup stays at t=0 when shown.
  const origin = mainBase ?? base;
  const durationMs = mainBase !== null && mainLast > mainBase
    ? mainLast - mainBase
    : Math.max(0, Date.parse(lastTime) - base);
  events.forEach(event => {
    event.duration = Math.round((durations.get(event._key) || 0) * 100) / 100;
    event.t = Math.max(0, event.timeMs - origin);
    delete event._key;
    delete event.time;
    delete event.timeMs;
  });
  events.sort((a, b) => a.t - b.t);
  timeline.forEach(item => {
    item.t = Math.max(0, item.time - origin);
    delete item.time;
  });

  const folder = path.basename(dir);
  return Object.assign({ id: folder, folder }, metaFor(folder), {
    events,
    timeline,
    stats,
    captured: stats.total,
    sampledCount: events.length,
    durationMs
  });
}

const SESSIONS_ROOT = path.join(ROOT, 'results', 'sessions');

function sessionLabel(folder) {
  return folder.replace(/^(\d{8})-(\d{6})-(.*)$/, '$1-$2 · $3');
}

function scenarioDirsUnder(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root)
    .map(name => path.join(root, name))
    .filter(p => fs.statSync(p).isDirectory() && fs.existsSync(path.join(p, 'requests.json')));
}

function collectSessions() {
  const list = [];
  if (fs.existsSync(SESSIONS_ROOT)) {
    fs.readdirSync(SESSIONS_ROOT)
      .filter(name => fs.statSync(path.join(SESSIONS_ROOT, name)).isDirectory())
      .sort()
      .reverse()
      .forEach(name => {
        const scenarios = scenarioDirsUnder(path.join(SESSIONS_ROOT, name))
          .map(readScenario)
          .filter(Boolean)
          .sort((a, b) => a.label.localeCompare(b.label, 'es'));
        if (scenarios.length) list.push({ id: name, label: sessionLabel(name), scenarios });
      });
  }
  const legacy = scenarioDirsUnder(REPLAY_DIR)
    .map(readScenario)
    .filter(Boolean)
    .sort((a, b) => a.label.localeCompare(b.label, 'es'));
  if (legacy.length) {
    list.push({ id: 'capturas-previas', label: 'Capturas previas · replay/', scenarios: legacy });
  }
  return list;
}

const sessions = collectSessions();
if (!sessions.length) {
  throw new Error('No hay requests.json. Ejecuta run-scenario.ps1 -ReplayJson o run-all.ps1 -ReplayJson primero.');
}

const dataJson = JSON.stringify(sessions).replace(/</g, '\\u003c');

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>TicketFlow · Replay interactivo de peticiones</title>
<style>
  body { font-family: Segoe UI, Arial, sans-serif; margin: 24px; color: #1f2328; background: #f6f8fa; }
  h1 { margin-bottom: 4px; font-size: 24px; }
  .hint { color: #57606a; font-size: 14px; margin-bottom: 16px; }
  .panel { background: #fff; border: 1px solid #d0d7de; border-radius: 10px; padding: 14px 16px; margin-bottom: 16px; }
  .controls { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
  button, select, input[type=range] { font-size: 14px; }
  button { padding: 6px 14px; cursor: pointer; background: #0969da; color: #fff; border: 0; border-radius: 6px; }
  button.secondary { background: #57606a; }
  #scrub { flex: 1; min-width: 260px; }
  .clock { font-variant-numeric: tabular-nums; font-size: 13px; color: #57606a; }
  .stage { display: grid; grid-template-columns: 1fr 320px; gap: 16px; }
  svg { width: 100%; height: auto; background: #fbfcfd; border: 1px solid #d8dee4; border-radius: 8px; }
  .node { fill: #fff; stroke: #8c959f; stroke-width: 1.5; }
  .node-label { font-size: 13px; font-weight: 600; text-anchor: middle; }
  .lane { stroke: #eaeef2; stroke-width: 1; }
  .dot { cursor: pointer; }
  .dot.ok { fill: #1a7f37; }
  .dot.rejected { fill: #cf222e; }
  .dot.setup { fill: #8c959f; }
  .stats { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
  .pill { background: #f6f8fa; border: 1px solid #d0d7de; border-radius: 20px; padding: 4px 10px; font-size: 12px; }
  .pill.red { background: #ffebe9; border-color: #ff8182; }
  .pill.green { background: #dafbe1; border-color: #4ac26b; }
  #log { height: 330px; overflow-y: auto; font-size: 12px; }
  #log div { border-bottom: 1px solid #eaeef2; padding: 5px 4px; cursor: pointer; }
  #log div:hover { background: #f6f8fa; }
  #log .bad { color: #cf222e; font-weight: 600; }
  #log .good { color: #1a7f37; }
  #detail { margin-top: 8px; font-size: 13px; min-height: 40px; }
  code { background: #f6f8fa; padding: 1px 4px; border-radius: 3px; }
  .legend span { margin-right: 14px; font-size: 12px; }
  a { color: #0969da; }
  details.panel summary { cursor: pointer; font-weight: 600; }
</style>
</head>
<body>
<h1>TicketFlow · Replay interactivo de peticiones</h1>
<p class="hint">Reproduce peticiones reales capturadas con <code>k6 --out json</code>. Cada punto viaja de k6 al servicio; si se rechaza, se detiene en el escalón que lo rechaza y muestra el motivo. <strong>409 = sin cupo (o estado inválido al confirmar) · 410 = reserva ya confirmada · 429 = rate limit del gateway · 503 = circuit breaker.</strong></p>

<details class="panel" open>
  <summary>¿Por qué aparecen peticiones aceptadas justo después de un 409?</summary>
  <p><code>OUT_OF_STOCK</code> solo significa que ese <code>POST /api/reservas</code> encontró el contador atómico en 0. No invalida al evento ni a las demás peticiones: <code>GET .../disponibilidad</code> sigue respondiendo <code>200</code> con <code>disponibles: 0</code>, y un <code>POST .../confirmar</code> de una reserva creada antes de agotar el cupo responde <code>200</code> porque la confirmación no consume stock. Además, con varios VUs en paralelo un 201 y un 409 pueden intercalarse en milisegundos mientras se agota el último boleto.</p>
</details>

<div class="panel">
  <div class="controls">
    <label>Sesión:
      <select id="session"></select>
    </label>
    <label>Escenario:
      <select id="scenario"></select>
    </label>
    <button id="play">▶ Reproducir</button>
    <button id="reset" class="secondary">↺ Reiniciar</button>
    <label>Velocidad:
      <select id="speed">
        <option value="0.5">0.5×</option>
        <option value="1" selected>1×</option>
        <option value="2">2×</option>
        <option value="4">4×</option>
      </select>
    </label>
    <input type="range" id="scrub" min="0" max="100" value="0" step="10">
    <span class="clock" id="clock">0.0 s</span>
    <label title="El setup siembra datos y se excluye del req/s y la duración del resumen"><input type="checkbox" id="setup"> Mostrar setup</label>
  </div>
</div>

<div class="stage">
  <div class="panel">
    <div class="stats" id="stats"></div>
    <svg id="canvas" viewBox="0 0 1000 420" role="img" aria-label="Replay de peticiones">
      <line class="lane" x1="80" y1="210" x2="920" y2="210"></line>
      <rect class="node" x="20" y="180" width="120" height="60" rx="8"></rect>
      <text class="node-label" x="80" y="215">k6</text>
      <rect class="node" id="gatewayNode" x="270" y="180" width="120" height="60" rx="8"></rect>
      <text class="node-label" id="gatewayLabel" x="330" y="208">API Gateway</text>
      <text id="gatewaySub" x="330" y="226" font-size="10" text-anchor="middle" fill="#57606a">429 / 503</text>
      <rect class="node" x="540" y="180" width="120" height="60" rx="8"></rect>
      <text class="node-label" id="serviceLabel" x="600" y="208">Inventario</text>
      <text id="serviceSub" x="600" y="226" font-size="10" text-anchor="middle" fill="#57606a">409</text>
      <rect class="node" x="810" y="180" width="140" height="60" rx="8"></rect>
      <text class="node-label" id="finalLabel" x="880" y="208">Redis / Kafka</text>
      <text x="880" y="226" font-size="10" text-anchor="middle" fill="#57606a">aceptada</text>
      <g id="dots"></g>
    </svg>
    <div class="legend">
      <span><b style="color:#1a7f37">●</b> aceptada</span>
      <span><b style="color:#cf222e">●</b> rechazada</span>
      <span><b style="color:#8c959f">●</b> setup</span>
    </div>
  </div>
  <div class="panel">
    <div id="scenarioInfo" style="font-size:13px;margin-bottom:10px"></div>
    <div id="log"></div>
    <div id="detail">Haz clic en un punto o en una fila del registro para ver el detalle.</div>
  </div>
</div>

<div class="panel">
  <a href="resumen-carga.html">← Volver al resumen de carga</a>
  <p class="hint" style="margin:8px 0 0">Generado por <code>scripts/generate-replay.js</code> desde <code>results/sessions/**/requests.json</code> y <code>results/replay/**/requests.json</code>. Para capturar una sesión nueva: <code>powershell -ExecutionPolicy Bypass -File .\scripts\run-all.ps1 -ReplayJson -Label post-visualizacion</code>.</p>
</div>

<script>
const REPLAY_DATA = DATA_PLACEHOLDER;
const X_SOURCE = 80;
const X_GATEWAY = 330;
const X_INVENTORY = 600;
const X_FINAL = 880;
const WINDOW = 1400;

const sessionSel = document.getElementById('session');
const scenarioSel = document.getElementById('scenario');
const playBtn = document.getElementById('play');
const resetBtn = document.getElementById('reset');
const speedSel = document.getElementById('speed');
const scrub = document.getElementById('scrub');
const clock = document.getElementById('clock');
const setupBox = document.getElementById('setup');
const dots = document.getElementById('dots');
const logEl = document.getElementById('log');
const detail = document.getElementById('detail');
const statsEl = document.getElementById('stats');
const infoEl = document.getElementById('scenarioInfo');

let currentSession = REPLAY_DATA[0];
let current = currentSession.scenarios[0];
let simTime = 0;
let playing = false;
let lastFrame = null;
let selectedIndex = -1;

REPLAY_DATA.forEach((s, i) => {
  const option = document.createElement('option');
  option.value = String(i);
  option.textContent = s.label;
  sessionSel.appendChild(option);
});

function esc(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function visibleEvents() {
  return current.events.filter(e => setupBox.checked || e.phase !== 'setup');
}

function targetX(hop) {
  if (hop === 'GATEWAY') return X_GATEWAY;
  if (hop === 'INVENTORY') return X_INVENTORY;
  if (hop === 'CLIENT') return X_SOURCE;
  return X_FINAL;
}

function className(event) {
  if (event.outcome === 'accepted') return 'ok';
  if (event.outcome === 'rejected') return 'rejected';
  return 'setup';
}

function showDetail(index) {
  const list = visibleEvents();
  const event = list[index];
  if (!event) return;
  selectedIndex = index;
  detail.innerHTML = '<b>' + esc(event.method + ' ' + event.url) + '</b><br>' +
    'Tiempo: ' + (event.t / 1000).toFixed(2) + ' s · vuelta: ' + event.duration.toFixed(2) + ' ms<br>' +
    'Resultado: <b>' + esc(event.label) + '</b> · motivo: <code>' + esc(event.reason) + '</code><br>' +
    'Detenido en: <b>' + esc(event.hop) + '</b>';
}

function render() {
  const list = visibleEvents();
  const active = list.filter(e => e.t <= simTime && e.t + WINDOW >= simTime).slice(-240);
  while (dots.firstChild) dots.removeChild(dots.firstChild);
  active.forEach((event, i) => {
    const index = list.indexOf(event);
    const progress = Math.max(0, Math.min(1, (simTime - event.t) / WINDOW));
    const x = X_SOURCE + (targetX(event.hop) - X_SOURCE) * progress;
    const y = 210 + ((index % 7) - 3) * 16;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x.toFixed(1));
    circle.setAttribute('cy', y);
    circle.setAttribute('r', selectedIndex === index ? 9 : 6);
    circle.setAttribute('class', 'dot ' + className(event));
    circle.setAttribute('opacity', String(0.45 + 0.55 * (1 - progress)));
    circle.addEventListener('click', () => { playing = false; playBtn.textContent = '▶ Reproducir'; showDetail(index); });
    dots.appendChild(circle);
    if (event.outcome === 'rejected' && progress > 0.75) {
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', (x + 9).toFixed(1));
      label.setAttribute('y', y + 4);
      label.setAttribute('font-size', '10');
      label.setAttribute('fill', '#cf222e');
      label.textContent = event.status === 429 ? '429' : (event.status === 409 ? '409' : String(event.status));
      dots.appendChild(label);
    }
  });

  // Counters use the full timeline, not the sampled dots.
  const countedAll = (current.timeline || current.events).filter(e => e.t <= simTime);
  const counted = countedAll.filter(e => e.outcome !== 'setup');
  const accepted = counted.filter(e => e.outcome === 'accepted').length;
  const rejected = counted.filter(e => e.outcome === 'rejected').length;
  const setupCount = countedAll.length - counted.length;
  const reasons = {};
  counted.forEach(e => { if (e.outcome === 'rejected') reasons[e.reason] = (reasons[e.reason] || 0) + 1; });
  statsEl.innerHTML = '<span class="pill">' + counted.length + ' peticiones de carga</span>' +
    '<span class="pill green">' + accepted + ' aceptadas</span>' +
    '<span class="pill red">' + rejected + ' rechazadas</span>' +
    (setupCount ? '<span class="pill">+' + setupCount + ' setup · ' + countedAll.length + ' capturadas</span>' : '') +
    Object.keys(reasons).map(k => '<span class="pill red">' + esc(k) + ': ' + reasons[k] + '</span>').join('');
  const seen = list.filter(e => e.t <= simTime);

  logEl.innerHTML = seen.slice(-14).reverse().map(e => {
    const index = list.indexOf(e);
    const cls = e.outcome === 'rejected' ? 'bad' : (e.outcome === 'accepted' ? 'good' : '');
    return '<div class="' + cls + '" data-index="' + index + '">' +
      (e.t / 1000).toFixed(2) + ' s · ' + esc(e.method) + ' ' + esc(e.endpoint) +
      ' · <b>' + esc(e.label) + '</b></div>';
  }).join('');
  Array.prototype.forEach.call(logEl.children, el => {
    el.addEventListener('click', () => { playing = false; playBtn.textContent = '▶ Reproducir'; showDetail(Number(el.dataset.index)); });
  });

  clock.textContent = (simTime / 1000).toFixed(1) + ' s / ' + (current.durationMs / 1000).toFixed(1) + ' s';
  scrub.value = String(simTime);
}

function reset() {
  playing = false;
  playBtn.textContent = '▶ Reproducir';
  simTime = 0;
  selectedIndex = -1;
  lastFrame = null;
  detail.textContent = 'Haz clic en un punto o en una fila del registro para ver el detalle.';
  render();
}

function frame(timestamp) {
  if (!playing) return;
  if (lastFrame === null) lastFrame = timestamp;
  const delta = timestamp - lastFrame;
  lastFrame = timestamp;
  simTime += delta * Number(speedSel.value);
  if (simTime >= current.durationMs + WINDOW) {
    simTime = current.durationMs + WINDOW;
    playing = false;
    playBtn.textContent = '▶ Reproducir';
  }
  render();
  if (playing) requestAnimationFrame(frame);
}

function loadScenario(index) {
  current = currentSession.scenarios[Number(index)];
  scrub.max = String(current.durationMs + WINDOW);
  document.getElementById('gatewayLabel').textContent = current.viaGateway ? 'API Gateway' : 'API Gateway (omitido)';
  document.getElementById('gatewaySub').textContent = current.viaGateway ? '429 / 503' : 'directo';
  document.getElementById('gatewayNode').setAttribute('opacity', current.viaGateway ? '1' : '0.25');
  document.getElementById('serviceLabel').textContent = current.service || 'Inventario';
  document.getElementById('serviceSub').textContent = (current.service === 'Catálogo') ? '429 / 503' : '409';
  document.getElementById('finalLabel').textContent = current.finalLabel || 'Redis / Kafka';
  const sampleNote = current.captured > current.events.length
    ? '<br><small>Muestreo visual: ' + current.events.length + ' puntos de ' + current.captured +
      ' peticiones; los contadores son completos y se conservan todos los rechazos.</small>'
    : '';
  infoEl.innerHTML = '<b>' + esc(currentSession.label + ' · ' + current.label) + '</b><br>' +
    '<code>' + esc(current.endpoint) + '</code><br>' + esc(current.purpose) + sampleNote;
  reset();
}

function loadSession(index) {
  currentSession = REPLAY_DATA[Number(index)];
  while (scenarioSel.firstChild) scenarioSel.removeChild(scenarioSel.firstChild);
  currentSession.scenarios.forEach((s, i) => {
    const option = document.createElement('option');
    option.value = String(i);
    option.textContent = s.label;
    scenarioSel.appendChild(option);
  });
  loadScenario(0);
}

playBtn.addEventListener('click', () => {
  if (playing) {
    playing = false;
    playBtn.textContent = '▶ Reproducir';
  } else {
    if (simTime >= current.durationMs + WINDOW) simTime = 0;
    playing = true;
    lastFrame = null;
    playBtn.textContent = '⏸ Pausar';
    requestAnimationFrame(frame);
  }
});
resetBtn.addEventListener('click', reset);
scrub.addEventListener('input', () => { playing = false; playBtn.textContent = '▶ Reproducir'; simTime = Number(scrub.value); render(); });
sessionSel.addEventListener('change', () => loadSession(sessionSel.value));
scenarioSel.addEventListener('change', () => loadScenario(scenarioSel.value));
setupBox.addEventListener('change', reset);

loadSession(0);
</script>
</body>
</html>
`;

const output = html.replace('DATA_PLACEHOLDER', dataJson);
fs.writeFileSync(path.join(VISUAL_DIR, 'replay-interactivo.html'), output, 'utf8');
console.log('Generated interactive replay from ' + sessions.length + ' sessions.');
sessions.forEach(session => {
  console.log('  ' + session.label + ': ' + session.scenarios.length + ' scenarios');
  session.scenarios.forEach(s => console.log('    ' + s.label + ': ' + (s.stats.total - s.stats.setup) + ' main + ' + s.stats.setup + ' setup, ' + s.stats.rejected + ' rejected'));
});
console.log('Output: docs_ia/informes/visual/replay-interactivo.html');
