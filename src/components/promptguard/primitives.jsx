import { ArrowLeft } from 'lucide-react';
import { GuardMark } from './icons';

/**
 * Shared chrome and small display primitives.
 *
 * Everything here renders from props alone — no Base44 client, no storage, no
 * timers, no network. The app supplies data and handlers; a fixture render can
 * supply the same shapes.
 */

/** Page frame. `background` is injected so a static renderer can pass its own. */
export function AppShell({ background = null, header = null, narrow = false, children }) {
  return (
    <div className="pg-app">
      {background}
      {header}
      <main
        id="pg-main"
        tabIndex={-1}
        className={`pg-shell pg-main${narrow ? ' pg-shell--narrow' : ''}`}
      >
        {children}
      </main>
    </div>
  );
}

export function SkipLink() {
  return (
    <a href="#pg-main" className="pg-skip">
      Skip to main content
    </a>
  );
}

export function AppHeader({ onBack, backLabel = 'Dashboard', subtitle, children }) {
  return (
    <header className="pg-header">
      <div className="pg-shell">
        <div className="pg-header__inner">
          {onBack && (
            <button type="button" onClick={onBack} className="pg-backbtn">
              <ArrowLeft className="w-[17px] h-[17px] flex-none" aria-hidden="true" />
              <span className="pg-backbtn__label">{backLabel}</span>
              <span className="sr-only">Back to {backLabel.toLowerCase()}</span>
            </button>
          )}

          <div className="pg-brand">
            <GuardMark className="w-[30px] h-[30px] flex-none" />
            <span className="min-w-0">
              <span className="pg-brand__name">PromptGuard</span>
              <span className="pg-brand__sub pg-truncate">
                {subtitle || 'AI prompt security scanner'}
              </span>
            </span>
          </div>

          <div className="pg-header__actions">{children}</div>
        </div>
      </div>
    </header>
  );
}

export function SectionHead({ label, id, children }) {
  return (
    <div className="pg-section">
      <h2 className="pg-h2" id={id}>
        {label}
      </h2>
      <span className="pg-section__rule" aria-hidden="true" />
      {children}
    </div>
  );
}

export function Badge({ tone, solid = false, children }) {
  return (
    <span className={solid ? 'pg-badge pg-badge--solid' : 'pg-badge'} data-tone={tone}>
      {children}
    </span>
  );
}

export function Chip({ mono = false, children }) {
  return <span className={mono ? 'pg-chip pg-mono' : 'pg-chip'}>{children}</span>;
}

/** Inline banner for scan state and errors. */
export function StatusBanner({ tone, icon: Icon, title, body, role = 'status', spin = false }) {
  return (
    <div className="pg-alert" data-tone={tone} role={role}>
      {Icon && (
        <Icon
          className={`w-[18px] h-[18px] flex-none mt-0.5${spin ? ' pg-spin' : ''}`}
          aria-hidden="true"
        />
      )}
      <div className="min-w-0">
        <p className="pg-alert__title">{title}</p>
        {body && <p className="pg-alert__body">{body}</p>}
      </div>
    </div>
  );
}

export function EmptyState({ tone = 'brand', icon: Icon, title, body, children }) {
  return (
    <div className="pg-panel pg-empty">
      {Icon && (
        <span className="pg-empty__ring" data-tone={tone}>
          <Icon className="w-6 h-6" aria-hidden="true" />
        </span>
      )}
      <p className="pg-empty__title">{title}</p>
      {body && <p className="pg-empty__body">{body}</p>}
      {children && <div className="pg-empty__actions">{children}</div>}
    </div>
  );
}

export function LogSkeleton({ rows = 3, label = 'Loading scans' }) {
  return (
    <div className="pg-log" aria-busy="true" aria-label={label}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="pg-skel" />
      ))}
    </div>
  );
}

export function ReportSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading report">
      <div className="pg-panel pg-skel-panel">
        <div className="pg-skel-line" style={{ width: '34%', height: 12 }} />
        <div className="pg-skel-line" style={{ width: '62%', height: 26, marginTop: 16 }} />
        <div className="pg-skel-line" style={{ width: '84%', marginTop: 12 }} />
        <div className="pg-skel-line" style={{ width: '100%', height: 10, marginTop: 24 }} />
      </div>
      <div className="pg-panel pg-skel-panel" style={{ marginTop: 24 }}>
        <div className="pg-skel-line" style={{ width: '24%', height: 12 }} />
        <div className="pg-skel-line" style={{ width: '100%', height: 76, marginTop: 16 }} />
      </div>
      <div className="pg-panel pg-skel-panel" style={{ marginTop: 24 }}>
        <div className="pg-skel-line" style={{ width: '40%', height: 12 }} />
        <div className="pg-skel-line" style={{ width: '100%', height: 58, marginTop: 16 }} />
      </div>
    </div>
  );
}

export function LoadBar({ icon: Icon, label }) {
  return (
    <div className="pg-loadbar" role="status">
      {Icon && <Icon className="w-4 h-4 pg-spin flex-none" aria-hidden="true" />}
      <span>{label}</span>
    </div>
  );
}
