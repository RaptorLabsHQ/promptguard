"use client";

import { useEffect, useRef } from "react";

/**
 * PremiumAnimatedBackground
 *
 * Atmospheric gradient flow: five large, soft radial gradient orbs drifting on
 * mismatched sinusoids (40–80s cycles), a faint diagonal light sweep every 46s,
 * and a hairline constellation mesh that morphs as the orbs move.
 *
 * Everything is deterministic — no randomness, no particles, no repeating grids.
 */

// Deterministic orb definitions. Positions are viewport fractions; radii are in
// reference pixels (scaled to viewport). Periods are seconds — deliberately
// coprime-ish so the composition never visibly loops.
const ORBS = [
  {
    color: [37, 99, 235], // #2563eb
    alpha: 0.075,
    radius: 560,
    x: 0.22,
    y: 0.28,
    ax: 0.11,
    ay: 0.07,
    px: 61,
    py: 47,
    phx: 0.0,
    phy: 1.7,
  },
  {
    color: [30, 58, 95], // #1e3a5f
    alpha: 0.08,
    radius: 620,
    x: 0.74,
    y: 0.2,
    ax: 0.09,
    ay: 0.1,
    px: 73,
    py: 53,
    phx: 2.4,
    phy: 0.6,
  },
  {
    color: [59, 130, 246], // #3b82f6
    alpha: 0.055,
    radius: 430,
    x: 0.58,
    y: 0.66,
    ax: 0.13,
    ay: 0.08,
    px: 43,
    py: 67,
    phx: 4.1,
    phy: 3.2,
  },
  {
    color: [96, 165, 250], // #60a5fa
    alpha: 0.038,
    radius: 340,
    x: 0.13,
    y: 0.78,
    ax: 0.1,
    ay: 0.09,
    px: 59,
    py: 41,
    phx: 1.1,
    phy: 5.0,
  },
  {
    color: [30, 58, 95], // #1e3a5f
    alpha: 0.06,
    radius: 500,
    x: 0.88,
    y: 0.82,
    ax: 0.08,
    ay: 0.11,
    px: 79,
    py: 71,
    phx: 3.6,
    phy: 2.2,
  },
];

// Soft, cloud-like falloff — a plain linear gradient reads as a hard disc.
const FALLOFF = [
  [0.0, 1.0],
  [0.18, 0.78],
  [0.36, 0.5],
  [0.55, 0.26],
  [0.74, 0.1],
  [0.88, 0.03],
  [1.0, 0.0],
];

const SWEEP_PERIOD = 46; // seconds between diagonal light sweeps
const SWEEP_DURATION = 9; // seconds the sweep takes to cross
const TAU = Math.PI * 2;

export default function PremiumAnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let scale = 1;
    let sprites = [];
    let frame = 0;
    let elapsed = 0;
    let last = 0;
    let isDark = false;

    const motionQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    const darkQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;

    const readTheme = () => {
      const root = document.documentElement;
      const next =
        root.classList.contains("dark") ||
        root.dataset.theme === "dark" ||
        (!root.classList.contains("light") &&
          root.dataset.theme !== "light" &&
          !!darkQuery?.matches);
      const changed = next !== isDark;
      isDark = next;
      return changed;
    };

    // Bake each orb into an offscreen sprite so the render loop is pure drawImage.
    const buildSprites = () => {
      const boost = isDark ? 1.3 : 1;
      sprites = ORBS.map((orb) => {
        const r = Math.max(1, orb.radius * scale);
        const size = Math.ceil(r * 2 * dpr);
        const off = document.createElement("canvas");
        off.width = size;
        off.height = size;
        const octx = off.getContext("2d");
        const c = r * dpr;
        const grad = octx.createRadialGradient(c, c, 0, c, c, c);
        const [red, green, blue] = orb.color;
        const peak = Math.min(0.085, orb.alpha * boost);
        for (const [stop, mul] of FALLOFF) {
          grad.addColorStop(stop, `rgba(${red},${green},${blue},${peak * mul})`);
        }
        octx.fillStyle = grad;
        octx.fillRect(0, 0, size, size);
        return { canvas: off, r };
      });
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      scale = Math.min(1.35, Math.max(0.55, Math.min(width, height) / 900));
      buildSprites();
    };

    const positions = ORBS.map(() => ({ x: 0, y: 0 }));

    const computePositions = (t) => {
      for (let i = 0; i < ORBS.length; i++) {
        const orb = ORBS[i];
        positions[i].x =
          (orb.x + orb.ax * Math.sin((TAU * t) / orb.px + orb.phx)) * width;
        positions[i].y =
          (orb.y + orb.ay * Math.sin((TAU * t) / orb.py + orb.phy)) * height;
      }
    };

    const drawOrbs = () => {
      ctx.globalCompositeOperation = isDark ? "lighter" : "source-over";
      for (let i = 0; i < sprites.length; i++) {
        const { canvas: sprite, r } = sprites[i];
        const p = positions[i];
        ctx.drawImage(sprite, p.x - r, p.y - r, r * 2, r * 2);
      }
      ctx.globalCompositeOperation = "source-over";
    };

    // Constellation mesh: hairlines between orb centres, fading with distance.
    const drawMesh = (t) => {
      const maxDist = Math.hypot(width, height) * 0.62;
      const base = isDark ? 0.05 : 0.035;
      ctx.lineWidth = Math.max(0.5, 1 / dpr);
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const a = positions[i];
          const b = positions[j];
          const d = Math.hypot(b.x - a.x, b.y - a.y);
          if (d >= maxDist) continue;
          const proximity = 1 - d / maxDist;
          const breath = 0.72 + 0.28 * Math.sin((TAU * t) / (37 + i * 11 + j * 7));
          const alpha = base * proximity * proximity * breath;
          if (alpha < 0.002) continue;
          ctx.strokeStyle = `rgba(96,165,250,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    };

    // A very faint pane-of-glass reflection crossing on the diagonal.
    const drawSweep = (t) => {
      const phase = t % SWEEP_PERIOD;
      if (phase > SWEEP_DURATION) return;
      const p = phase / SWEEP_DURATION;
      const envelope = Math.sin(Math.PI * p) ** 2;
      const peak = (isDark ? 0.038 : 0.022) * envelope;
      if (peak < 0.001) return;

      const diag = Math.hypot(width, height);
      const bandWidth = diag * 0.5;
      const travel = diag * 1.6;
      const x = -travel / 2 + p * travel;

      ctx.save();
      ctx.globalCompositeOperation = isDark ? "lighter" : "source-over";
      ctx.translate(width / 2, height / 2);
      ctx.rotate(-Math.PI / 6);
      const grad = ctx.createLinearGradient(x - bandWidth / 2, 0, x + bandWidth / 2, 0);
      grad.addColorStop(0, "rgba(147,197,253,0)");
      grad.addColorStop(0.5, `rgba(147,197,253,${peak})`);
      grad.addColorStop(1, "rgba(147,197,253,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(-diag, -diag, diag * 2, diag * 2);
      ctx.restore();
    };

    const render = (t) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      computePositions(t);
      drawOrbs();
      drawMesh(t);
      drawSweep(t);
    };

    const loop = (now) => {
      const delta = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      elapsed += delta;
      render(elapsed);
      frame = requestAnimationFrame(loop);
    };

    const stop = () => {
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const start = () => {
      stop();
      if (motionQuery?.matches) {
        render(elapsed);
        return;
      }
      last = performance.now();
      frame = requestAnimationFrame(loop);
    };

    const onResize = () => {
      resize();
      if (motionQuery?.matches) render(elapsed);
    };

    const onThemeChange = () => {
      if (readTheme()) {
        buildSprites();
        if (motionQuery?.matches) render(elapsed);
      }
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    readTheme();
    resize();
    start();

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    motionQuery?.addEventListener?.("change", start);
    darkQuery?.addEventListener?.("change", onThemeChange);

    const observer = new MutationObserver(onThemeChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => {
      stop();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      motionQuery?.removeEventListener?.("change", start);
      darkQuery?.removeEventListener?.("change", onThemeChange);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        display: "block",
      }}
    />
  );
}
