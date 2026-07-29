import { Lightbulb, Search } from 'lucide-react';
import { Badge } from './primitives';
import { categoryLabel, SEVERITY_LABELS, severityTone } from '@/data/detection';
import { pad2 } from './format';

/**
 * A single finding: what was detected, the quoted evidence that triggered it,
 * and the fix. Severity drives the tone token (left rail, badge, dot).
 */
export function FindingCard({ finding, index = 0 }) {
  const tone = severityTone(finding.severity);

  return (
    <article className="pg-panel pg-finding" data-tone={tone}>
      <header className="pg-finding__head">
        <Badge tone={tone} solid>
          {SEVERITY_LABELS[tone]}
        </Badge>
        <Badge tone="neutral">{categoryLabel(finding.category)}</Badge>
        <span className="pg-mono pg-finding__id">FND-{pad2(index + 1)}</span>
      </header>

      <h3 className="pg-finding__title">{finding.title}</h3>
      <p className="pg-finding__desc">{finding.description}</p>

      {finding.evidence && (
        <div className="pg-code pg-code--evidence">
          <div className="pg-code__head">
            <Search className="w-3.5 h-3.5 flex-none" aria-hidden="true" />
            <span>Evidence</span>
            <span className="pg-code__note">Quoted from the submission</span>
          </div>
          <pre className="pg-code__body">{finding.evidence}</pre>
        </div>
      )}

      {finding.remediation && (
        <div className="pg-remedy">
          <span className="pg-remedy__icon" aria-hidden="true">
            <Lightbulb className="w-3.5 h-3.5" />
          </span>
          <div className="min-w-0">
            <span className="pg-remedy__label">How to fix</span>
            <p className="pg-remedy__body">{finding.remediation}</p>
          </div>
        </div>
      )}
    </article>
  );
}

export default FindingCard;
