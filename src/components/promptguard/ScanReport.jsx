import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  MessageSquare,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { Badge, Chip, EmptyState, LogSkeleton, SectionHead, StatusBanner } from './primitives';
import { FindingCard } from './FindingCard';
import { countBySeverity, formatStamp, plural, sortFindings, worstSeverity } from './format';
import {
  CATEGORIES,
  CATEGORY_KEYS,
  SEVERITY_KEYS,
  SEVERITY_LABELS,
} from '@/data/detection';

/**
 * The scan report body.
 *
 * Renders entirely from a `{ scan, findings }` pair shaped like the Scan and
 * Finding entities — the live app passes backend records, a fixture render
 * passes `src/data/demoReport.js`. No client, no fetching, no timers.
 *
 * Truthfulness rule that governs this file: a verdict is only shown once the
 * scan has actually completed. Pending, analysing and failed runs render their
 * own state instead of an all-clear.
 */

function SourcePanel({ scan }) {
  return (
    <section className="pg-block pg-block--lg" aria-labelledby="pg-input-head">
      <SectionHead label="Submitted content" id="pg-input-head">
        <Chip mono>{formatStamp(scan.created_date)}</Chip>
      </SectionHead>

      <div className="pg-stack">
        <div className="pg-code">
          <div className="pg-code__head">
            <FileText className="w-3.5 h-3.5 flex-none" aria-hidden="true" />
            <span>Prompt</span>
            <span className="pg-code__note">{plural(scan.prompt?.length || 0, 'character')}</span>
          </div>
          <pre className="pg-code__body">{scan.prompt}</pre>
        </div>

        {scan.response && (
          <div className="pg-code">
            <div className="pg-code__head">
              <MessageSquare className="w-3.5 h-3.5 flex-none" aria-hidden="true" />
              <span>Model response</span>
              <span className="pg-code__note">{plural(scan.response.length, 'character')}</span>
            </div>
            <pre className="pg-code__body">{scan.response}</pre>
          </div>
        )}
      </div>
    </section>
  );
}

function VerdictPanel({ total, counts, tone }) {
  return (
    <section className="pg-panel pg-verdict" data-tone={tone} aria-label="Scan result">
      <div className="pg-verdict__head">
        <span className="pg-verdict__mark" aria-hidden="true">
          {total === 0 ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
        </span>
        <div className="min-w-0">
          <span className="pg-eyebrow">
            <span className="pg-dot" data-tone={tone} aria-hidden="true" />
            {total === 0 ? 'Scan clear' : `${plural(total, 'finding')} detected`}
          </span>
          <h2 className="pg-verdict__title">
            {total === 0
              ? 'No security risks detected'
              : `Highest severity: ${SEVERITY_LABELS[tone] || tone}`}
          </h2>
        </div>
      </div>

      <p className="pg-verdict__body">
        {total === 0
          ? 'This submission passed every injection, jailbreak, leakage and disclosure check. No active payloads or sensitive data patterns were found.'
          : `We detected ${plural(total, 'issue')} in the submitted content. Review the evidence and remediation below before this prompt reaches production.`}
      </p>

      {total > 0 && (
        <div className="pg-verdict__dist">
          <div className="pg-meter" aria-hidden="true">
            {SEVERITY_KEYS.map((key) => {
              const count = counts[key] || 0;
              if (count === 0) return null;
              return (
                <i
                  key={key}
                  data-tone={key}
                  style={{ width: `${(count / total) * 100}%` }}
                  title={`${SEVERITY_LABELS[key]}: ${count}`}
                />
              );
            })}
          </div>

          <ul className="pg-legend">
            {SEVERITY_KEYS.map((key) => {
              const count = counts[key] || 0;
              return (
                <li key={key} className="pg-legend__item" data-tone={key}>
                  <span className="pg-dot" aria-hidden="true" />
                  <span className="pg-legend__name">{SEVERITY_LABELS[key]}</span>
                  <span className="pg-legend__count" data-zero={count === 0 ? 'true' : 'false'}>
                    {count}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}

function CoverageGrid({ findings }) {
  return (
    <section className="pg-block pg-block--lg" aria-labelledby="pg-checks-head">
      <SectionHead label="Analysis coverage" id="pg-checks-head">
        <Chip>{plural(CATEGORY_KEYS.length, 'check')}</Chip>
      </SectionHead>

      <p className="pg-section__note">
        Every scan runs the full detector suite. This is the policy coverage applied to
        this run.
      </p>

      <ul className="pg-checks">
        {CATEGORY_KEYS.map((key) => {
          const matched = findings.some((finding) => finding.category === key);
          const Icon = matched ? AlertTriangle : CheckCircle2;
          return (
            <li key={key} className="pg-checks__item" data-tone={matched ? 'high' : 'clean'}>
              <Icon className="pg-checks__icon w-4 h-4 flex-none" aria-hidden="true" />
              <span className="pg-checks__name">{CATEGORIES[key].label}</span>
              <span className="pg-checks__verdict">{matched ? 'Flagged' : 'Passed'}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function ScanReport({ scan, findings = [], isDemo = false }) {
  const sorted = sortFindings(findings);
  const counts = countBySeverity(findings, SEVERITY_KEYS);
  const total = findings.length;

  const streaming = scan.status === 'analyzing';
  const complete = scan.status === 'complete';
  /* Tone follows the worst severity actually present, not the scan row's flag. */
  const verdictTone = total === 0 ? 'clean' : worstSeverity(counts, SEVERITY_KEYS) || 'low';

  return (
    <>
      {isDemo && (
        <div className="pg-demo-note" role="note">
          <Badge tone="brand">Demo</Badge>
          <span>
            This report came from a synthetic sample prompt loaded by the demo button. The
            analysis itself is a real run.
          </span>
        </div>
      )}

      {streaming && (
        <StatusBanner
          tone="brand"
          icon={Loader2}
          spin
          title="Analysing…"
          body="Findings stream into this report as they are detected."
        />
      )}

      {scan.status === 'pending' && (
        <StatusBanner
          tone="idle"
          icon={Clock}
          title="Queued"
          body="Waiting for an analysis slot."
        />
      )}

      {scan.status === 'error' && (
        <StatusBanner
          tone="critical"
          icon={XCircle}
          role="alert"
          title="Analysis failed"
          body={scan.errorMessage || 'The analysis did not finish, so this prompt has not been cleared.'}
        />
      )}

      {complete && <VerdictPanel total={total} counts={counts} tone={verdictTone} />}

      <SourcePanel scan={scan} />

      <section className="pg-block pg-block--lg" aria-labelledby="pg-findings-head">
        <SectionHead label="Detailed findings" id="pg-findings-head">
          {streaming ? (
            <Chip>
              <span className="pg-dot pg-live" data-tone="brand" aria-hidden="true" />
              Updating live
            </Chip>
          ) : (
            <Chip>{plural(total, 'finding')}</Chip>
          )}
        </SectionHead>

        {total > 0 ? (
          <div className="pg-findings">
            {sorted.map((finding, index) => (
              <FindingCard key={finding.id} finding={finding} index={index} />
            ))}
          </div>
        ) : complete ? (
          <EmptyState
            tone="clean"
            icon={ShieldCheck}
            title="Clean report"
            body="PromptGuard evaluated this submission against every detection category and found no anomalies."
          />
        ) : scan.status === 'error' ? (
          <EmptyState
            tone="critical"
            icon={XCircle}
            title="No findings recorded"
            body="Analysis did not finish, so this prompt has not been cleared. Run the scan again to get a verdict."
          />
        ) : (
          /* Still working — placeholders, never an all-clear. */
          <LogSkeleton rows={2} label="Waiting for findings" />
        )}
      </section>

      {complete && <CoverageGrid findings={findings} />}
    </>
  );
}

export default ScanReport;
