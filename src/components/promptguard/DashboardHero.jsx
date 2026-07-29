import { AlertTriangle, ArrowRight, Loader2, PlayCircle, Plus, ShieldCheck } from 'lucide-react';

/**
 * Above-the-fold dashboard block: what the product does, the primary action,
 * and the one-click demo entry a first-time visitor (or judge) can take.
 *
 * Pure presentation — every value and handler arrives as a prop.
 */

/**
 * The demo entry.
 *
 * `status` is one of:
 *   idle    — nothing run yet in this session
 *   running — a demo scan is being created right now
 *   ready   — this session already has a demo scan; reopen it, don't pay twice
 *   error   — creation failed, retry is allowed
 *
 * The button never fabricates a result: it fills the real scanner with a
 * synthetic sample and hands off to the same backend analysis as any scan.
 */
export function DemoLaunch({ status = 'idle', sampleLabel, errorMessage, onRun }) {
  const running = status === 'running';
  const ready = status === 'ready';

  return (
    <div className="pg-demo">
      <button
        type="button"
        onClick={onRun}
        disabled={running}
        className="pg-demo__btn"
        data-state={status}
      >
        <span className="pg-demo__icon" aria-hidden="true">
          {running ? (
            <Loader2 className="w-[18px] h-[18px] pg-spin" />
          ) : (
            <PlayCircle className="w-[18px] h-[18px]" />
          )}
        </span>
        <span className="min-w-0">
          <span className="pg-demo__title">
            {running ? 'Starting demo scan…' : ready ? 'Open demo report' : 'Run demo scan'}
          </span>
          <span className="pg-demo__sub">
            {ready
              ? 'Reopens this session’s demo — no second analysis is run'
              : `Synthetic ${sampleLabel || 'attack'} sample, analysed for real`}
          </span>
        </span>
        <ArrowRight className="pg-demo__chev w-4 h-4 flex-none" aria-hidden="true" />
      </button>

      {status === 'error' && errorMessage && (
        <p className="pg-demo__error" role="alert">
          <AlertTriangle className="w-3.5 h-3.5 flex-none" aria-hidden="true" />
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export function DashboardHero({
  signedIn = false,
  lastScanLabel = 'None yet',
  coverageCount = 6,
  showHistoryLink = false,
  onNewScan,
  demo,
}) {
  return (
    <section className="pg-hero">
      <span className="pg-hero__glow" aria-hidden="true" />

      <div className="pg-hero__body">
        <div className="pg-hero__intro">
          <span className="pg-eyebrow">
            <span className="pg-dot" data-tone="clean" aria-hidden="true" />
            {signedIn ? 'Signed in · history saved' : 'No sign-in required'}
          </span>

          <h1 className="pg-h1">
            Every prompt,
            <br />
            inspected before it ships.
          </h1>

          <p className="pg-lead">
            PromptGuard analyses prompts and model output for injection, jailbreak, PII
            leakage, exfiltration and disclosure risk — and returns the evidence behind
            every finding.
          </p>
        </div>

        <div className="pg-hero__actions">
          <button type="button" onClick={onNewScan} className="pg-btn pg-btn--primary pg-btn--xl pg-btn--block">
            <Plus className="w-[19px] h-[19px]" aria-hidden="true" />
            New scan
          </button>
          <p className="pg-cta__hint">Paste a prompt · results in seconds</p>

          {demo && <DemoLaunch {...demo} />}

          {showHistoryLink && (
            <a href="#pg-history" className="pg-btn pg-btn--text pg-btn--block">
              Jump to scan history
              <ArrowRight className="w-[14px] h-[14px]" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>

      <div className="pg-hero__strip">
        <div className="pg-readout">
          <span className="pg-readout__label">Last scan</span>
          <span className="pg-readout__value">{lastScanLabel}</span>
        </div>
        <div className="pg-readout">
          <span className="pg-readout__label">Detection coverage</span>
          <span className="pg-readout__value">
            <span className="pg-num">{coverageCount}</span> risk categories
          </span>
        </div>
        <div className="pg-readout">
          <span className="pg-readout__label">Evidence</span>
          <span className="pg-readout__value pg-readout__value--icon">
            <ShieldCheck className="w-[15px] h-[15px] flex-none" aria-hidden="true" />
            Quoted with every finding
          </span>
        </div>
      </div>
    </section>
  );
}
