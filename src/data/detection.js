/**
 * Detection taxonomy.
 *
 * Single source of truth for the risk categories and severity ladder used by
 * the product UI, the sample library and the presentation fixtures. The keys
 * mirror the enums declared in base44/entities/findings.jsonc — keep them in
 * sync if the entity schema changes.
 *
 * Pure data: no imports, no environment access, safe to render from anywhere.
 */

export const CATEGORY_KEYS = [
  'prompt_injection',
  'pii_leak',
  'data_exfiltration',
  'jailbreak_attempt',
  'bias_toxicity',
  'info_disclosure',
];

export const CATEGORIES = {
  prompt_injection: {
    key: 'prompt_injection',
    label: 'Prompt Injection',
    blurb: 'Attacker instructions smuggled into user input to override the system prompt.',
  },
  pii_leak: {
    key: 'pii_leak',
    label: 'PII Leak',
    blurb: 'Credentials and personal identifiers pasted straight into model context.',
  },
  data_exfiltration: {
    key: 'data_exfiltration',
    label: 'Data Exfiltration',
    blurb: 'Attempts to pull training data, retrieved context or secrets back out.',
  },
  jailbreak_attempt: {
    key: 'jailbreak_attempt',
    label: 'Jailbreak Attempt',
    blurb: 'Role-play framing used to dissolve the model’s safety boundaries.',
  },
  bias_toxicity: {
    key: 'bias_toxicity',
    label: 'Bias / Toxicity',
    blurb: 'Output that encodes discriminatory criteria behind professional language.',
  },
  info_disclosure: {
    key: 'info_disclosure',
    label: 'Information Disclosure',
    blurb: 'Probes for the hidden system prompt and internal configuration.',
  },
};

/** Display label for a category key, falling back to the raw key. */
export function categoryLabel(key) {
  return CATEGORIES[key]?.label || key || 'Uncategorised';
}

/** Severity ladder, worst first. */
export const SEVERITY_KEYS = ['critical', 'high', 'medium', 'low'];

export const SEVERITY_ORDER = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const SEVERITY_LABELS = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

/** Severity keys are also tone tokens in the stylesheet; anything else is "low". */
export function severityTone(severity) {
  return SEVERITY_KEYS.includes(severity) ? severity : 'low';
}
