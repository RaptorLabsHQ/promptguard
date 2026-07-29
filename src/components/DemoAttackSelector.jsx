import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SamplePicker } from '@/components/promptguard';

/**
 * DemoAttackSelector
 *
 * Interactive wrapper around the presentation-layer <SamplePicker />. It owns
 * the open/selected state and the enter/exit motion; the picker itself stays
 * pure so the same markup can be rendered from fixtures.
 *
 * Selecting a sample hands the prompt text to the parent, which puts it in the
 * real scan form. Nothing is submitted and no result is implied — the user
 * still has to run the scan.
 *
 * Props
 *   samples          [{ id, label, category, severity, blurb, text }]
 *   onSelectPrompt   (text, { sample }) => void
 */
export default function DemoAttackSelector({ samples = [], onSelectPrompt }) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const handleSelect = useCallback(
    (sample) => {
      setSelectedId(sample.id);
      setOpen(false);
      onSelectPrompt?.(sample.text, { sample });
    },
    [onSelectPrompt]
  );

  if (!samples.length) return null;

  /* One key per visual state so AnimatePresence crossfades between them. */
  const stateKey = open ? 'open' : selectedId ? 'loaded' : 'collapsed';

  return (
    <div className="pg-demo-slot">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={stateKey}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <SamplePicker
            samples={samples}
            open={open}
            selectedId={selectedId}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            onSelect={handleSelect}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
