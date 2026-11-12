// Compact end-of-test report: JSON + Markdown, written to the mounted results directory.
// Call it from each scenario with: export const handleSummary = makeSummaryHandler('name');

import { PROFILE, RESULTS_DIR } from './config.js';

function num(metrics, metric, field) {
  const m = metrics[metric];
  if (!m || !m.values) return null;
  const value = m.values[field];
  return value === undefined ? null : value;
}

function round(value, decimals) {
  if (value === null || value === undefined) return null;
  const factor = Math.pow(10, decimals === undefined ? 2 : decimals);
  return Math.round(value * factor) / factor;
}

function counters(metrics) {
  const out = {};
  Object.keys(metrics).forEach(function (key) {
    const metric = metrics[key];
    if (!metric || metric.type !== 'counter') return;
    if (key === 'http_reqs') return;
    out[key] = num(metrics, key, 'count');
  });
  return out;
}

function thresholds(metrics) {
  const out = {};
  Object.keys(metrics).forEach(function (key) {
    const metric = metrics[key];
    if (!metric || !metric.thresholds) return;
    Object.keys(metric.thresholds).forEach(function (expr) {
      out[`${key}: ${expr}`] = metric.thresholds[expr].ok === true;
    });
  });
  return out;
}

export function makeSummaryHandler(scenario) {
  return function (data) {
    const metrics = data.metrics || {};
    const setup = data.setup_data || null;
    const summary = {
      scenario: scenario,
      profile: PROFILE,
      generated_at: new Date().toISOString(),
      // Only ids and counts: buyer tokens must never end up in a report file.
      setup_data: setup
        ? {
            eventId: setup.eventId || null,
            localityId: setup.localityId || null,
            stock: setup.stock || null,
            buyers: Array.isArray(setup.buyers) ? setup.buyers.length : null,
          }
        : null,
      requests: {
        total: num(metrics, 'http_reqs', 'count'),
        rate_per_s: round(num(metrics, 'http_reqs', 'rate'), 2),
        failed_rate: round(num(metrics, 'http_req_failed', 'rate'), 4),
      },
      latency_ms: {
        avg: round(num(metrics, 'http_req_duration', 'avg')),
        med: round(num(metrics, 'http_req_duration', 'med')),
        p90: round(num(metrics, 'http_req_duration', 'p(90)')),
        p95: round(num(metrics, 'http_req_duration', 'p(95)')),
        p99: round(num(metrics, 'http_req_duration', 'p(99)')),
        max: round(num(metrics, 'http_req_duration', 'max')),
      },
      checks: {
        rate: round(num(metrics, 'checks', 'rate'), 4),
        passes: num(metrics, 'checks', 'passes'),
        fails: num(metrics, 'checks', 'fails'),
      },
      counters: counters(metrics),
      thresholds: thresholds(metrics),
    };

    const ok = Object.keys(summary.thresholds).every(function (k) {
      return summary.thresholds[k];
    });
    summary.thresholds_ok = ok;

    const lines = [];
    lines.push(`# k6 — ${scenario}`);
    lines.push('');
    lines.push(`- Perfil: \`${summary.profile}\``);
    lines.push(`- Umbrales: **${ok ? 'OK' : 'FALLIDOS'}**`);
    lines.push(`- Peticiones: ${summary.requests.total} (${summary.requests.rate_per_s} req/s)`);
    lines.push(`- Fallidas: ${(summary.requests.failed_rate * 100).toFixed(2)} %`);
    lines.push(
      `- Latencia: p95 ${summary.latency_ms.p95} ms · p99 ${summary.latency_ms.p99} ms · max ${summary.latency_ms.max} ms`
    );
    lines.push(
      '- _La latencia incluye las peticiones de `setup`; los umbrales se evaluan por endpoint (`http_req_duration{endpoint:...}`)._'
    );
    lines.push(
      `- Checks: ${(summary.checks.rate === null ? 0 : summary.checks.rate * 100).toFixed(2)} % (${summary.checks.passes} ok / ${summary.checks.fails} fail)`
    );
    const counterKeys = Object.keys(summary.counters);
    if (counterKeys.length > 0) {
      lines.push('');
      lines.push('| Contador | Valor |');
      lines.push('|---|---|');
      counterKeys.forEach(function (key) {
        lines.push(`| ${key} | ${summary.counters[key]} |`);
      });
    }
    if (Object.keys(summary.thresholds).length > 0) {
      lines.push('');
      lines.push('| Umbral | Resultado |');
      lines.push('|---|---|');
      Object.keys(summary.thresholds).forEach(function (key) {
        lines.push(`| ${key} | ${summary.thresholds[key] ? 'OK' : 'FALLO'} |`);
      });
    }

    const markdown = lines.join('\n') + '\n';

    if (!RESULTS_DIR) {
      return { stdout: markdown };
    }
    const result = { stdout: markdown };
    result[`${RESULTS_DIR}/${scenario}-summary.json`] = JSON.stringify(summary, null, 2);
    result[`${RESULTS_DIR}/${scenario}-summary.md`] = markdown;
    return result;
  };
}
