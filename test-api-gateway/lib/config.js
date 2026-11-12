// Shared configuration for the load-test suite.
// All values can be overridden with `-e KEY=value` when running k6.

export const BASE_URL = __ENV.BASE_URL || 'http://ticketflow-api-gateway:8080';

// Seconds a VU waits between iterations. 1 VU with sleep(1) ~= 1 req/s.
export const THINK_TIME = Number(__ENV.THINK_TIME || 1);

// "local" (default) = regression thresholds for a shared developer machine.
// "sla"            = thresholds from the platform test plan (dedicated host only).
export const PROFILE = (__ENV.PROFILE || 'local').toLowerCase();

// Directory mounted into the container to persist summaries and resource logs.
// When empty, summaries are only printed to stdout.
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
