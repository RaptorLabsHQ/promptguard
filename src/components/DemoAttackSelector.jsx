import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  Lock,
  Link as LinkIcon,
  Code,
  Eye,
  Zap,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------ *
 * DemoAttackSelector
 *
 * A self-driving demo launcher: one floating trigger -> six frosted
 * attack cards -> a character-rain transfer that pours the selected
 * prompt into the scan textarea. No typing required.
 *
 * Props
 *   onSelectPrompt(text, meta)  text streams in progressively while the
 *                               rain lands; meta = { done, sample }.
 *   samples                     [{ id, tag, tone, text }]
 *   targetSelector              CSS selector for the destination field.
 * ------------------------------------------------------------------ */

/* Icon + copy per attack category, keyed by sample tag. */
const CATEGORY_META = {
  "Prompt Injection": {
    Icon: Code,
    blurb: "Overrides the system prompt with attacker instructions smuggled inside user input.",
  },
  "PII Leak": {
    Icon: Lock,
    blurb: "Credentials and personal identifiers pasted straight into the model context.",
  },
  "Data Exfiltration": {
    Icon: LinkIcon,
    blurb: "Coaxes the model into echoing training data or private context back out.",
  },
  "Jailbreak Attempt": {
    Icon: AlertTriangle,
    blurb: "Role-play framing used to dissolve the model's safety boundaries.",
  },
  "Bias / Toxicity": {
    Icon: Shield,
    blurb: "Requests output that encodes discriminatory criteria behind professional language.",
  },
  "Info Disclosure": {
    Icon: Eye,
    blurb: "Probes for the hidden system prompt and internal configuration.",
  },
};

const FALLBACK_ICONS = [Code, Lock, LinkIcon, AlertTriangle, Shield, Eye];

const SEVERITY = {
  critical: { label: "Critical", cls: "text-[#b91c1c] bg-[#fef2f2] border-[#fecaca]", mark: "#dc2626" },
  high: { label: "High", cls: "text-[#c2410c] bg-[#fff7ed] border-[#fed7aa]", mark: "#ea580c" },
  medium: { label: "Medium", cls: "text-[#a16207] bg-[#fefce8] border-[#fde68a]", mark: "#ca8a04" },
  low: { label: "Low", cls: "text-[#0369a1] bg-[#f0f9ff] border-[#bae6fd]", mark: "#0284c7" },
};

const MAX_PARTICLES = 110;
const IGNITE_MS = 300; /* card glows before it shatters */
const FLIGHT_S = 0.62; /* per-character flight time */

const rand = (a, b) => a + Math.random() * (b - a);
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
  out: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
};

const cardVariants = {
  hidden: (dir) => ({ opacity: 0, x: dir * 110, y: 22, scale: 0.86, rotate: dir * -3.5 }),
  show: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 210, damping: 20, mass: 0.9 },
  },
  out: (dir) => ({
    opacity: 0,
    x: dir * 60,
    scale: 0.9,
    transition: { type: "spring", stiffness: 260, damping: 28 },
  }),
};

/* ------------------------------------------------------------------ *
 * Card
 * ------------------------------------------------------------------ */

function CloudCard({ sample, index, igniting, dimmed, onPick }) {
  const meta = CATEGORY_META[sample.tag] || {};
  const Icon = meta.Icon || FALLBACK_ICONS[index % FALLBACK_ICONS.length];
  const sev = SEVERITY[sample.tone] || SEVERITY.low;
  const dir = index % 2 === 0 ? -1 : 1;

  return (
    <motion.div custom={dir} variants={cardVariants} className="relative">
      {/* idle float — its own layer so it never fights the entrance spring */}
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{
          duration: 3.4 + index * 0.28,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.22,
        }}
      >
        <motion.button
          type="button"
          onClick={(e) => onPick(sample, e)}
          disabled={dimmed || igniting}
          whileHover={{ scale: 1.025 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 26 }}
          animate={
            igniting
              ? {
                  scale: [1, 1.06, 1.02],
                  boxShadow: [
                    "0 10px 30px -12px rgba(15,23,42,0.18)",
                    "0 0 0 6px rgba(37,99,235,0.35), 0 0 60px 8px rgba(37,99,235,0.55)",
                    "0 0 0 2px rgba(37,99,235,0.15), 0 0 90px 18px rgba(37,99,235,0.25)",
                  ],
                }
              : { opacity: dimmed ? 0.25 : 1 }
          }
          className="pg-demo-card group relative w-full h-full text-left rounded-2xl backdrop-blur-xl bg-white/90 border border-slate-200 shadow-lg p-4 sm:p-[18px] overflow-hidden transition-shadow duration-200 hover:shadow-2xl disabled:cursor-default"
          style={{ "--mark": sev.mark }}
        >
          {/* tone rail */}
          <span
            aria-hidden="true"
            className="absolute left-0 top-0 bottom-0 w-[3px]"
            style={{ background: sev.mark }}
          />
          {/* hover sheen */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background:
                "radial-gradient(120% 90% at 50% -20%, rgba(37,99,235,0.14), rgba(37,99,235,0) 65%)",
            }}
          />

          <div className="relative flex items-start gap-3">
            <span className="flex-none grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-b from-[#2b4d78] to-[#16293f] text-white shadow-inner">
              <Icon className="w-[18px] h-[18px]" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[14px] font-semibold tracking-[-0.015em] text-[#0f172a] leading-tight">
                  {sample.tag}
                </span>
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-[1px] text-[10.5px] font-semibold uppercase tracking-[0.06em] ${sev.cls}`}
                >
                  {sev.label}
                </span>
              </div>
              <p className="mt-1.5 text-[12.5px] leading-[1.5] text-[#475569]">
                {meta.blurb || sample.text}
              </p>
            </div>
          </div>

          <div className="relative mt-3.5 flex items-center gap-2 pt-3 border-t border-slate-100">
            <span className="font-mono text-[10.5px] tracking-[0.08em] text-[#94a3b8]">
              {sample.id}
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#94a3b8] group-hover:text-[#2563eb] transition-colors">
              <Zap className="w-3 h-3" aria-hidden="true" />
              Launch
            </span>
          </div>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ *
 * Character rain overlay (portaled to body, viewport coordinates)
 * ------------------------------------------------------------------ */

function CharacterRain({ particles, origin, target }) {
  return createPortal(
    <div className="fixed inset-0 z-[70] pointer-events-none overflow-hidden" aria-hidden="true">
      {/* ignition flash at the card */}
      <motion.div
        initial={{ opacity: 0.85, scale: 0.2 }}
        animate={{ opacity: 0, scale: 3.4 }}
        transition={{ duration: 0.75, ease: "easeOut" }}
        className="absolute rounded-full"
        style={{
          left: origin.x - 90,
          top: origin.y - 90,
          width: 180,
          height: 180,
          background:
            "radial-gradient(circle, rgba(96,165,250,0.75) 0%, rgba(37,99,235,0.35) 40%, rgba(37,99,235,0) 70%)",
        }}
      />

      {/* landing zone halo on the textarea */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: [0, 1, 1, 0], scale: 1 }}
        transition={{ duration: 2, times: [0, 0.15, 0.8, 1], ease: "easeOut" }}
        className="absolute rounded-xl"
        style={{
          left: target.left - 6,
          top: target.top - 6,
          width: target.width + 12,
          height: target.height + 12,
          boxShadow:
            "0 0 0 2px rgba(37,99,235,0.45), 0 0 45px 4px rgba(37,99,235,0.30), inset 0 0 40px rgba(37,99,235,0.12)",
        }}
      />

      {particles.map((p) => (
        <motion.span
          key={p.key}
          initial={{ x: p.sx, y: p.sy, opacity: 0, scale: 0.45, rotate: 0 }}
          animate={{
            x: p.ex,
            y: [p.sy, p.my, p.ey],
            opacity: [0, 1, 1, 0],
            scale: [0.45, 1.15, 0.95, 1.7],
            rotate: [0, p.rot, 0],
          }}
          transition={{
            x: { type: "spring", stiffness: 190, damping: 21, delay: p.delay },
            y: { duration: FLIGHT_S, ease: [0.32, 0, 0.2, 1], times: [0, 0.55, 1], delay: p.delay },
            opacity: { duration: FLIGHT_S, times: [0, 0.12, 0.74, 1], delay: p.delay },
            scale: { duration: FLIGHT_S, times: [0, 0.16, 0.7, 1], delay: p.delay },
            rotate: { duration: FLIGHT_S, times: [0, 0.5, 1], delay: p.delay },
          }}
          className="absolute left-0 top-0 font-mono text-[#2563eb] font-bold text-sm select-none will-change-transform"
          style={{ textShadow: "0 0 10px rgba(37,99,235,0.85), 0 0 22px rgba(96,165,250,0.55)" }}
        >
          {p.ch}
        </motion.span>
      ))}
    </div>,
    document.body
  );
}

/* ------------------------------------------------------------------ *
 * Main
 * ------------------------------------------------------------------ */

export default function DemoAttackSelector({
  onSelectPrompt,
  samples = [],
  targetSelector = "#pg-prompt",
}) {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState("trigger"); /* trigger | cards | rain | loaded */
  const [igniting, setIgniting] = useState(null);
  const [rain, setRain] = useState(null);
  const [loaded, setLoaded] = useState(null);

  /* keep the callback fresh without restarting the typewriter loop */
  const emitRef = useRef(onSelectPrompt);
  emitRef.current = onSelectPrompt;
  const timers = useRef([]);

  const wait = useCallback((fn, ms) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    },
    []
  );

  const cards = useMemo(() => samples.slice(0, 6), [samples]);

  /* -- build the flight plan for one prompt ------------------------ */
  const buildParticles = useCallback((text, card, target) => {
    const glyphs = [];
    for (let i = 0; i < text.length; i += 1) {
      if (text[i].trim()) glyphs.push(text[i]);
    }
    const step = Math.max(1, Math.ceil(glyphs.length / MAX_PARTICLES));
    const picked = glyphs.filter((_, i) => i % step === 0);
    const n = picked.length || 1;
    const stagger = Math.min(0.015, 0.95 / n);

    const originX = card.left + card.width / 2;
    const originY = card.top + card.height / 2;

    const particles = picked.map((ch, i) => {
      const sx = card.left + rand(14, Math.max(20, card.width - 14));
      const sy = card.top + card.height * rand(0.28, 0.72);
      const ex = target.left + rand(16, Math.max(24, target.width - 24));
      const ey = target.top + rand(14, Math.min(target.height - 14, 132));
      return {
        key: `${i}-${ch}`,
        ch,
        sx,
        sy,
        ex,
        /* the arc: fall well below the straight line, then swoop in */
        my: sy + (ey - sy) * 0.55 + rand(55, 150),
        ey,
        rot: rand(-38, 38),
        delay: i * stagger,
      };
    });

    return {
      particles,
      origin: { x: originX, y: originY },
      typeDelayMs: 320,
      typeDurationMs: n * stagger * 1000 + 260,
    };
  }, []);

  /* -- card click -> ignite -> rain -------------------------------- */
  const handlePick = useCallback(
    (sample, event) => {
      if (igniting || step === "rain") return;

      if (reduceMotion) {
        emitRef.current(sample.text, { done: true, sample });
        setLoaded(sample);
        setStep("loaded");
        return;
      }

      const cardEl = event.currentTarget;
      setIgniting(sample.id);

      const targetEl = document.querySelector(targetSelector);
      targetEl?.scrollIntoView({ behavior: "smooth", block: "center" });

      wait(() => {
        const card = cardEl.getBoundingClientRect();
        const rect = targetEl?.getBoundingClientRect();
        const target = rect?.width
          ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
          : {
              left: window.innerWidth * 0.2,
              top: window.innerHeight * 0.62,
              width: window.innerWidth * 0.6,
              height: 160,
            };

        setRain({ sample, target, ...buildParticles(sample.text, card, target) });
        setIgniting(null);
        setStep("rain");
      }, IGNITE_MS);
    },
    [buildParticles, igniting, reduceMotion, step, targetSelector, wait]
  );

  /* -- typewriter, synchronised with the landing characters -------- */
  useEffect(() => {
    if (!rain) return undefined;

    const { sample, typeDelayMs, typeDurationMs } = rain;
    const text = sample.text;
    const t0 = performance.now();
    let raf = 0;
    let written = -1;

    const tick = (now) => {
      const elapsed = now - t0;
      const p = Math.min(1, Math.max(0, (elapsed - typeDelayMs) / typeDurationMs));
      const count = Math.round(easeOutCubic(p) * text.length);

      if (count !== written) {
        written = count;
        emitRef.current(text.slice(0, count), { done: false, sample });
      }

      if (elapsed < typeDelayMs + typeDurationMs + FLIGHT_S * 1000) {
        raf = requestAnimationFrame(tick);
      } else {
        emitRef.current(text, { done: true, sample });
        setRain(null);
        setLoaded(sample);
        setStep("loaded");
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [rain]);

  const reopen = useCallback(() => {
    setLoaded(null);
    setStep("cards");
  }, []);

  if (!cards.length) return null;

  return (
    <div className="relative mb-6">
      <AnimatePresence mode="wait" initial={false}>
        {/* ---- Step 0 — floating trigger ---- */}
        {step === "trigger" && (
          <motion.div
            key="trigger"
            initial={{ opacity: 0, y: -14, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="flex flex-col items-center"
          >
            <div className="relative">
              {/* pulsing glow ring */}
              <motion.span
                aria-hidden="true"
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: [
                    "0 0 0 0px rgba(37,99,235,0.45), 0 0 24px 0px rgba(37,99,235,0.30)",
                    "0 0 0 12px rgba(37,99,235,0.00), 0 0 55px 10px rgba(37,99,235,0.42)",
                    "0 0 0 0px rgba(37,99,235,0.45), 0 0 24px 0px rgba(37,99,235,0.30)",
                  ],
                }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.button
                type="button"
                onClick={() => setStep("cards")}
                whileHover={{ scale: 1.045 }}
                whileTap={{ scale: 0.96 }}
                animate={{ y: [0, -4, 0] }}
                transition={{
                  y: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
                  default: { type: "spring", stiffness: 400, damping: 22 },
                }}
                className="relative rounded-full backdrop-blur-xl bg-[#1e3a5f]/90 text-white px-8 py-4 font-semibold shadow-2xl inline-flex items-center gap-2.5 text-[14px] tracking-[-0.01em] border border-white/15"
              >
                <Sparkles className="w-[18px] h-[18px]" aria-hidden="true" />
                TRY A DEMO ATTACK
              </motion.button>
            </div>
            <p className="mt-3 text-[12px] text-[#64748b]">
              Six real attack payloads · one click loads the prompt
            </p>
          </motion.div>
        )}

        {/* ---- Step 1/2 — cloud cards ---- */}
        {(step === "cards" || step === "rain") && (
          <motion.div
            key="cards"
            variants={gridVariants}
            initial="hidden"
            animate="show"
            exit="out"
            className="relative"
          >
            <motion.div
              variants={cardVariants}
              custom={-1}
              className="flex items-center gap-3 mb-4"
            >
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#1e3a5f]">
                <Sparkles className="w-3.5 h-3.5 text-[#2563eb]" aria-hidden="true" />
                Pick an attack
              </span>
              <span className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent" />
              <button
                type="button"
                onClick={() => setStep("trigger")}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 backdrop-blur px-3 py-1 text-[11.5px] font-medium text-[#64748b] hover:text-[#0f172a] hover:border-slate-300 transition-colors"
              >
                <X className="w-3 h-3" aria-hidden="true" />
                Close
              </button>
            </motion.div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((sample, i) => (
                <CloudCard
                  key={sample.id}
                  sample={sample}
                  index={i}
                  igniting={igniting === sample.id}
                  dimmed={Boolean(igniting) && igniting !== sample.id}
                  onPick={handlePick}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ---- Step 3 — loaded confirmation ---- */}
        {step === "loaded" && loaded && (
          <motion.div
            key="loaded"
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="flex flex-wrap items-center gap-3 rounded-2xl backdrop-blur-xl bg-white/90 border border-slate-200 shadow-lg px-4 py-3"
          >
            <motion.span
              initial={{ scale: 0.4, rotate: -25 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 14 }}
              className="grid place-items-center w-8 h-8 rounded-lg bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]"
            >
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            </motion.span>
            <span className="min-w-0">
              <span className="block text-[13.5px] font-semibold text-[#0f172a] leading-tight">
                {loaded.tag} payload loaded
              </span>
              <span className="block text-[11.5px] text-[#64748b] mt-0.5">
                <span className="font-mono">{loaded.id}</span> · ready to analyze below
              </span>
            </span>
            <button
              type="button"
              onClick={reopen}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-[#475569] hover:text-[#0f172a] hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Try another
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {rain && (
          <CharacterRain
            key="rain"
            particles={rain.particles}
            origin={rain.origin}
            target={rain.target}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
