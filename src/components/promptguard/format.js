/**
 * Formatting helpers for the presentation layer.
 *
 * Every function is deterministic given its arguments — `formatRelative` takes
 * the current time as a parameter instead of reading the clock, so a fixture
 * render (design preview, Remotion frame) produces the same output every time.
 */

export const pad2 = (n) => String(n).padStart(2, '0');

export function plural(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

/** Last six characters of an id, for a human-quotable reference. */
export function shortId(id) {
  return id ? String(id).replace(/-/g, '').slice(-6).toUpperCase() : '------';
}

/** Absolute local timestamp: 2026-07-29 14:29:00 */
export function formatStamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return (
    `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ` +
    `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`
  );
}

/**
 * Coarse relative time. `now` must be supplied (ms epoch or date-like) so the
 * function stays pure.
 */
export function formatRelative(value, now) {
  const date = new Date(value);
  const reference = new Date(now);
  if (Number.isNaN(date.getTime()) || Number.isNaN(reference.getTime())) return 'never';

  const seconds = Math.max(0, Math.round((reference.getTime() - date.getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h ago`;
  return `${Math.round(seconds / 86400)}d ago`;
}

const SEVERITY_RANK = { critical: 0, high: 1, medium: 2, low: 3 };

/** Worst-first, stable for equal severities. */
export function sortFindings(findings) {
  return [...(findings || [])].sort(
    (a, b) => (SEVERITY_RANK[a.severity] ?? 99) - (SEVERITY_RANK[b.severity] ?? 99)
  );
}

export function countBySeverity(findings, severityKeys) {
  return severityKeys.reduce((acc, key) => {
    acc[key] = (findings || []).filter((finding) => finding.severity === key).length;
    return acc;
  }, {});
}

/** The highest severity actually present, or null for a clean run. */
export function worstSeverity(counts, severityKeys) {
  return severityKeys.find((key) => (counts[key] || 0) > 0) || null;
}

/**
 * Tone token for a scan row. Status leads: a scan that has not finished cannot
 * be reported as clear.
 */
export function scanTone(scan) {
  if (!scan) return 'idle';
  if (scan.status === 'error') return 'critical';
  if (scan.status === 'analyzing') return 'brand';
  if (scan.status === 'pending') return 'idle';
  return scan.findingCount > 0 ? 'high' : 'clean';
}
