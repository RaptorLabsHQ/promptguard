import { useId } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Code2,
  Eye,
  Link as LinkIcon,
  Loader2,
  Lock,
  ScanFace,
  XCircle,
} from 'lucide-react';

/**
 * Brand and taxonomy marks. Pure SVG / icon lookups — safe to render anywhere.
 */

/** PromptGuard mark: a shield over an inspected prompt, one line flagged. */
export function GuardMark({ className = 'w-8 h-8' }) {
  const raw = useId();
  const uid = `pg${raw.replace(/[^a-zA-Z0-9]/g, '')}`;
  const hull = 'M24 4.2 41 9.9v14.1c0 9.4-7 16.8-17 19.7C14 40.8 7 33.4 7 24V9.9Z';

  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="PromptGuard">
      <defs>
        <linearGradient id={`${uid}-hull`} x1="24" y1="4" x2="24" y2="45" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3730A3" />
          <stop offset="0.55" stopColor="#4F46E5" />
          <stop offset="1" stopColor="#818CF8" />
        </linearGradient>
        <linearGradient id={`${uid}-edge`} x1="24" y1="3" x2="24" y2="45" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#818CF8" />
          <stop offset="1" stopColor="#3730A3" />
        </linearGradient>
        <radialGradient id={`${uid}-glow`} cx="24" cy="12" r="20" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#C7D2FE" stopOpacity="0.45" />
          <stop offset="1" stopColor="#3730A3" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${uid}-clip`}>
          <path d={hull} />
        </clipPath>
      </defs>

      <path
        d={hull}
        fill={`url(#${uid}-hull)`}
        stroke={`url(#${uid}-edge)`}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      <g clipPath={`url(#${uid}-clip)`}>
        <rect x="4" y="0" width="40" height="26" fill={`url(#${uid}-glow)`} />
        {/* the prompt under inspection */}
        <rect x="15" y="16.2" width="18" height="2.6" rx="1.3" fill="#ffffff" fillOpacity="0.95" />
        <rect x="15" y="22" width="11.5" height="2.6" rx="1.3" fill="#ffffff" fillOpacity="0.6" />
        {/* the line the scanner flagged */}
        <rect x="15" y="27.8" width="15" height="2.6" rx="1.3" fill="#FB7185" />
      </g>
    </svg>
  );
}

/** Google's mark, drawn to brand spec — not tinted to our palette. */
export function GoogleMark({ className = 'w-[18px] h-[18px]' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.92l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.28a7.2 7.2 0 0 1 0-4.56V6.63H1.28a12 12 0 0 0 0 10.74l4.01-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.63l4.01 3.09C6.23 6.86 8.88 4.75 12 4.75Z"
      />
    </svg>
  );
}

/** One icon per detection category. */
export const CATEGORY_ICONS = {
  prompt_injection: Code2,
  pii_leak: Lock,
  data_exfiltration: LinkIcon,
  jailbreak_attempt: AlertTriangle,
  bias_toxicity: ScanFace,
  info_disclosure: Eye,
};

export function categoryIcon(key) {
  return CATEGORY_ICONS[key] || Code2;
}

/** Status icon for a scan row: status first, verdict second. */
export function scanIcon(scan) {
  if (!scan) return Clock;
  if (scan.status === 'error') return XCircle;
  if (scan.status === 'analyzing') return Loader2;
  if (scan.status === 'pending') return Clock;
  return scan.findingCount > 0 ? AlertTriangle : CheckCircle2;
}
