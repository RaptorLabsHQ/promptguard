import { ChevronRight, PlayCircle, Plus, Search } from 'lucide-react';
import { Badge, EmptyState, LogSkeleton } from './primitives';
import { scanIcon } from './icons';
import { formatStamp, plural, scanTone, shortId } from './format';

/**
 * Scan history. Rows are only interactive once a scan has completed — an
 * in-flight scan has no report to open yet.
 */

export function ScanLogRow({ scan, onOpen }) {
  const Icon = scanIcon(scan);
  const tone = scanTone(scan);
  const ready = scan.status === 'complete';

  return (
    <button
      type="button"
      onClick={() => ready && onOpen?.(scan.id)}
      disabled={!ready}
      title={ready ? scan.prompt : undefined}
      data-tone={tone}
      data-interactive={ready ? 'true' : 'false'}
      className="pg-log-row"
    >
      <span className="pg-log-row__icon">
        <Icon
          className={`w-[18px] h-[18px]${scan.status === 'analyzing' ? ' pg-spin' : ''}`}
          aria-hidden="true"
        />
      </span>

      <span className="min-w-0">
        <span className="pg-log-row__prompt">{scan.prompt}</span>
        <span className="pg-log-row__meta">
          <span>{formatStamp(scan.created_date)}</span>
          <span className="pg-mono">ID {shortId(scan.id)}</span>
        </span>
      </span>

      <span className="pg-log-row__verdict" data-tone={tone}>
        {scan.status === 'complete' && (
          <Badge tone={tone}>
            {scan.findingCount > 0 ? plural(scan.findingCount, 'finding') : 'Clear'}
          </Badge>
        )}
        {scan.status === 'analyzing' && (
          <Badge tone="brand">
            <span className="pg-live">Analysing…</span>
          </Badge>
        )}
        {scan.status === 'pending' && <Badge tone="idle">Queued</Badge>}
        {scan.status === 'error' && <Badge tone="critical">Failed</Badge>}
      </span>

      <ChevronRight className="pg-log-row__chev w-4 h-4" aria-hidden="true" />
    </button>
  );
}

export function ScanLog({ scans = [], loading = false, onOpen, onNewScan, onRunDemo }) {
  if (loading) return <LogSkeleton rows={3} />;

  if (!scans.length) {
    return (
      <EmptyState
        icon={Search}
        tone="brand"
        title="Start with your first scan"
        body="Paste any prompt — or load one of six synthetic attack samples — and PromptGuard returns findings, evidence and fixes in seconds."
      >
        <button type="button" onClick={onNewScan} className="pg-btn pg-btn--primary pg-btn--lg">
          <Plus className="w-[17px] h-[17px]" aria-hidden="true" />
          Run your first scan
        </button>
        {onRunDemo && (
          <button type="button" onClick={onRunDemo} className="pg-btn pg-btn--lg">
            <PlayCircle className="w-[17px] h-[17px]" aria-hidden="true" />
            Run the demo scan
          </button>
        )}
      </EmptyState>
    );
  }

  return (
    <div className="pg-log">
      {scans.map((scan) => (
        <ScanLogRow key={scan.id} scan={scan} onOpen={onOpen} />
      ))}
    </div>
  );
}

export default ScanLog;
