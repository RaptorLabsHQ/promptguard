import { CheckCircle2, ChevronRight, RotateCcw, Sparkles, X } from 'lucide-react';
import { categoryIcon } from './icons';
import { SEVERITY_LABELS, severityTone } from '@/data/detection';

/**
 * Sample attack library.
 *
 * A controlled, prop-driven picker: the parent owns `open` and `selectedId`,
 * this renders the three states (collapsed → grid → loaded). Selecting a card
 * only fills the scan form; it never claims a result.
 *
 * Deterministic by construction — no randomness, no DOM queries, no portals,
 * no timers. Safe to render from a fixture.
 */
export function SamplePicker({
  samples = [],
  open = false,
  selectedId = null,
  onOpen,
  onClose,
  onSelect,
}) {
  if (!samples.length) return null;

  const selected = samples.find((sample) => sample.id === selectedId) || null;

  /* ---- Loaded: a sample is in the form and the grid is closed ---- */
  if (selected && !open) {
    return (
      <div className="pg-samples pg-samples--loaded">
        <span className="pg-samples__check" aria-hidden="true">
          <CheckCircle2 className="w-4 h-4" />
        </span>
        <span className="min-w-0">
          <span className="pg-samples__loaded-title">{selected.label} sample loaded</span>
          <span className="pg-samples__loaded-sub">
            <span className="pg-mono">{selected.id}</span> · review it below, then analyse
          </span>
        </span>
        <button type="button" onClick={onOpen} className="pg-btn pg-btn--sm pg-samples__swap">
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          Choose another
        </button>
      </div>
    );
  }

  /* ---- Collapsed: one button, one line of explanation ---- */
  if (!open) {
    return (
      <div className="pg-samples">
        <button type="button" onClick={onOpen} className="pg-samples__trigger">
          <span className="pg-samples__trigger-icon" aria-hidden="true">
            <Sparkles className="w-[17px] h-[17px]" />
          </span>
          <span className="min-w-0">
            <span className="pg-samples__trigger-title">Load a sample attack</span>
            <span className="pg-samples__trigger-sub">
              Six synthetic payloads · one click fills the prompt below
            </span>
          </span>
          <ChevronRight className="pg-samples__trigger-chev w-4 h-4 flex-none" aria-hidden="true" />
        </button>
      </div>
    );
  }

  /* ---- Open: the grid ---- */
  return (
    <div className="pg-samples pg-samples--open">
      <div className="pg-samples__head">
        <span className="pg-label">Pick a sample</span>
        <span className="pg-section__rule" aria-hidden="true" />
        <button type="button" onClick={onClose} className="pg-btn pg-btn--sm">
          <X className="w-3 h-3" aria-hidden="true" />
          Close
        </button>
      </div>

      <div className="pg-samples__grid">
        {samples.map((sample) => {
          const Icon = categoryIcon(sample.category);
          const tone = severityTone(sample.severity);
          return (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSelect?.(sample)}
              className="pg-sample"
              data-tone={tone}
              data-selected={sample.id === selectedId ? 'true' : 'false'}
            >
              <span className="pg-sample__head">
                <span className="pg-sample__icon" aria-hidden="true">
                  <Icon className="w-[17px] h-[17px]" />
                </span>
                <span className="pg-sample__label">{sample.label}</span>
                <span className="pg-badge" data-tone={tone}>
                  {SEVERITY_LABELS[tone]}
                </span>
              </span>

              <span className="pg-sample__blurb">{sample.blurb}</span>

              <span className="pg-sample__foot">
                <span className="pg-mono pg-sample__id">{sample.id}</span>
                <span className="pg-sample__load">
                  Load prompt
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="pg-samples__note">
        Samples fill the prompt field only. Nothing is analysed until you choose to run
        the scan.
      </p>
    </div>
  );
}

export default SamplePicker;
