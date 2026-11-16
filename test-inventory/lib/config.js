// Shared configuration for the direct inventory-service load-test suite.
// All values can be overridden with `-e KEY=value` when running k6.
//
// BASE_URL: inventory-service contenedor en la red Docker, saltando el API Gateway.
//           En el compose principal (ticketflow-api-gateway) el contenedor escucha en 8082
//           dentro de la red ticketflow-api-gateway_default. Sobreescribible con -e BASE_URL=...
export const BASE_URL = __ENV.BASE_URL || 'http://ticketflow-inventory-service:8082';

// user-service emite los JWT que inventory-service valida localmente (comparten JWT_SECRET).
export const USER_URL = __ENV.USER_URL || 'http://ticketflow-user-service:8081';

// catalog-service se usa solo en setup() para crear/publicar evento y localidad.
export const CATALOG_URL = __ENV.CATALOG_URL || 'http://ticketflow-catalog-service:8082';

// Seconds a VU espera entre iteraciones. 1 VU con sleep(1) ~= 1 req/s.
export const THINK_TIME = Number(__ENV.THINK_TIME || 1);

// "local" (default) = regression thresholds for a shared developer machine.
// "sla"            = thresholds from the platform test plan (dedicated host only).
export const PROFILE = (__ENV.PROFILE || 'local').toLowerCase();

// Directory mounted into the container to persist summaries and resource logs.
export const RESULTS_DIR = __ENV.RESULTS_DIR || '';

// Fixed reference data seeded by catalog migrations (V4__seed_reference_data.sql).
export const CATEGORY_ID = '01930000-0000-7000-8000-000000000001';
export const VENUE_ID = '01930000-0000-7000-8000-000000000101';

export function pick(local, sla) {
  return PROFILE === 'sla' ? sla : local;
}

export function randomInt(maxExclusive) {
  return Math.floor(Math.random() * maxExclusive);
}

export function parseStages(spec, fallback) {
  if (!spec) return fallback;
  return spec.split(',').map((s) => {
    const [d, t] = s.split(':');
    return { duration: d.trim(), target: parseInt(t.trim(), 10) };
  });
}
