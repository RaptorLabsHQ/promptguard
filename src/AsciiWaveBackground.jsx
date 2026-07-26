"use client";

import { useEffect, useRef } from "react";

// ---------------------------------------------------------------------------
// Character pools
// ---------------------------------------------------------------------------
const FLOW_CHARS =
  "{}[]()<>/\\|_=+-*&^%$#@!?;:.,~`'\"`01ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const SHAPE_TEMPLATES = [
  // Bracket clusters
  ["{ { ( ) } }"],
  ["[ ] < />"],
  ["{ [ ( ) ] }"],
  // Arrow chains
  ["-> => -->"],
  ["==> -> =>"],
  ["---> ===>"],
  // Pipeline operators
  ["|> |. |>"],
  ["|| && ??"],
  // Terminal prompts
  ["$ ./scan --target"],
  ["$ npm run audit"],
  ["$ ./guard --watch"],
  // Binary streams
  ["01001011 01100101"],
  ["10110100 11001010"],
  ["00110111 10101100"],
  // Class decorators
  ["@Guard @Entity"],
  ["@Column @Shield"],
  // Import statements
  ["import { Shield }"],
  ["from '@guard/core'"],
  // Function signatures
  ["function scan() {"],
  ["const guard = () =>"],
  ["async analyze(x) {"],
  // Try/catch
  ["try { } catch(e)"],
  // Comparisons
  ["=== !== >= <="],
  ["?? || && ??"],
  // Circuit patterns (box-drawing)
  ["┌─────────┐"],
  ["│ SECURE  │"],
  ["└─────────┘"],
  ["├─────────┤"],
];

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------
const COLORS = [
  { hex: "#1e3a5f", alpha: 0.08 },
  { hex: "#2563eb", alpha: 0.06 },
  { hex: "#3b82f6", alpha: 0.05 },
  { hex: "#60a5fa", alpha: 0.04 },
];
const HIGHLIGHT_COLOR = { hex: "#3b82f6", alpha: 0.14 };
const SHAPE_COLOR = { hex: "#2563eb", alpha: 0.18 };

// ---------------------------------------------------------------------------
// Layer definitions
// ---------------------------------------------------------------------------
const LAYERS = [
  { speed: 0.18, amplitude: 55, frequency: 0.012, phase: 0.0, colorIdx: 0, charSize: 15, rowGap: 32 },
  { speed: 0.11, amplitude: 40, frequency: 0.018, phase: 1.6, colorIdx: 1, charSize: 14, rowGap: 28 },
  { speed: 0.27, amplitude: 70, frequency: 0.009, phase: 3.1, colorIdx: 2, charSize: 16, rowGap: 36 },
  { speed: 0.08, amplitude: 30, frequency: 0.025, phase: 4.7, colorIdx: 3, charSize: 13, rowGap: 24 },
];

// ---------------------------------------------------------------------------
// Seeded pseudo-random
// ---------------------------------------------------------------------------
function seededRand(seed) {
  let s = seed ^ 0xdeadbeef;
  s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
  s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
  s ^= s >>> 16;
  return (s >>> 0) / 0xffffffff;
}

function pickFlowChar(col, row, t) {
  const idx = Math.floor(seededRand(col * 997 + row * 31 + (t * 0.3) | 0) * FLOW_CHARS.length);
  return FLOW_CHARS[idx] ?? ".";
}

// ---------------------------------------------------------------------------
// Shape cluster state
// ---------------------------------------------------------------------------
class ShapeCluster {
  constructor(x, y, templateStr, startTime, duration) {
    this.x = x;
    this.y = y;
    this.chars = templateStr;
    this.startTime = startTime;
    this.duration = duration;
    this.fadeIn = 400;
    this.fadeOut = 600;
  }

  opacity(now) {
    const elapsed = now - this.startTime;
    if (elapsed < 0) return 0;
    if (elapsed < this.fadeIn) return elapsed / this.fadeIn;
    const hold = this.duration - this.fadeIn - this.fadeOut;
    if (elapsed < this.fadeIn + hold) return 1;
    const out = elapsed - this.fadeIn - hold;
    if (out < this.fadeOut) return 1 - out / this.fadeOut;
    return -1;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function AsciiWaveBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let rafId;
    let width = 0;
    let height = 0;

    const clusters = [];
    let lastClusterSpawn = 0;
    const CLUSTER_INTERVAL_MIN = 1800;
    const CLUSTER_INTERVAL_MAX = 3800;
    let nextClusterIn = CLUSTER_INTERVAL_MIN;

    function isDark() {
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.scale(dpr, dpr);
    }

    resize();
    window.addEventListener("resize", resize);

    function spawnCluster(now) {
      const template = SHAPE_TEMPLATES[Math.floor(Math.random() * SHAPE_TEMPLATES.length)][0];
      const layer = LAYERS[Math.floor(Math.random() * LAYERS.length)];
      const col = Math.floor(Math.random() * (width / 18));
      const x = col * 18 + 4;
      const waveY = height * 0.5
        + Math.sin(x * layer.frequency + now * 0.001 * layer.speed) * layer.amplitude;
      const y = waveY + (Math.random() - 0.5) * 60;
      const duration = 1800 + Math.random() * 1400;
      clusters.push(new ShapeCluster(x, Math.max(20, Math.min(height - 20, y)), template, now, duration));
    }

    const sinCache = new Float32Array(4096);

    function drawLayer(layer, t, dark) {
      const { speed, amplitude, frequency, phase, colorIdx, charSize, rowGap } = layer;
      const color = COLORS[colorIdx];
      const alphaScale = dark ? 1.8 : 1.0;

      ctx.font = `${charSize}px monospace`;
      ctx.textBaseline = "top";

      const colStep = charSize * 0.88;
      const cols = Math.ceil(width / colStep) + 2;
      const tSec = t * 0.001;

      for (let c = 0; c < cols; c++) {
        const x = c * colStep;
        sinCache[c] = Math.sin(x * frequency + tSec * speed + phase);
      }

      const rowCount = Math.min(Math.ceil(height / rowGap) + 2, 24);

      for (let r = 0; r < rowCount; r++) {
        const baseY = (r / rowCount) * height - rowGap;

        for (let c = 0; c < cols; c++) {
          const x = c * colStep - ((t * speed * 30) % (colStep * cols));
          const sy = sinCache[Math.max(0, Math.min(4095, c))];
          const y = baseY + sy * amplitude;

          if (y < -charSize || y > height + charSize) continue;

          const seed = c * 137 + r * 19 + ((t * 0.04) | 0);
          const alphaVar = 0.5 + seededRand(seed) * 0.5;
          const finalAlpha = color.alpha * alphaVar * alphaScale;

          ctx.globalAlpha = Math.min(finalAlpha, 0.18);
          ctx.fillStyle = color.hex;

          const ch = pickFlowChar(c, r, t);
          ctx.fillText(ch, x, y);
        }
      }
    }

    function drawClusters(now, dark) {
      const alphaScale = dark ? 1.6 : 1.0;
      ctx.font = "14px monospace";
      ctx.textBaseline = "top";

      for (let i = clusters.length - 1; i >= 0; i--) {
        const cl = clusters[i];
        const op = cl.opacity(now);

        if (op < 0) {
          clusters.splice(i, 1);
          continue;
        }

        const baseAlpha = SHAPE_COLOR.alpha * op * alphaScale;

        ctx.globalAlpha = baseAlpha * 0.4;
        ctx.fillStyle = HIGHLIGHT_COLOR.hex;
        ctx.fillText(cl.chars, cl.x - 1, cl.y - 1);

        ctx.globalAlpha = baseAlpha;
        ctx.fillStyle = SHAPE_COLOR.hex;
        ctx.fillText(cl.chars, cl.x, cl.y);
      }
    }

    function frame(t) {
      const dark = isDark();

      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, width, height);

      for (const layer of LAYERS) {
        drawLayer(layer, t, dark);
      }

      if (t - lastClusterSpawn > nextClusterIn) {
        spawnCluster(t);
        lastClusterSpawn = t;
        nextClusterIn = CLUSTER_INTERVAL_MIN + Math.random() * (CLUSTER_INTERVAL_MAX - CLUSTER_INTERVAL_MIN);
      }

      drawClusters(t, dark);

      ctx.globalAlpha = 1;

      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
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
