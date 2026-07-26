"use client";

import { useEffect, useRef, useCallback } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const BRAND = {
  navy: [30, 58, 95],      // #1e3a5f
  blue: [37, 99, 235],     // #2563eb
  light: [59, 130, 246],   // #3b82f6
};

const SIN_TABLE_SIZE = 4096;
const TWO_PI = Math.PI * 2;

// Precomputed sine table for performance
const SIN_TABLE = new Float32Array(SIN_TABLE_SIZE);
const COS_TABLE = new Float32Array(SIN_TABLE_SIZE);
for (let i = 0; i < SIN_TABLE_SIZE; i++) {
  const angle = (i / SIN_TABLE_SIZE) * TWO_PI;
  SIN_TABLE[i] = Math.sin(angle);
  COS_TABLE[i] = Math.cos(angle);
}

function fastSin(t) {
  const idx = ((t % TWO_PI + TWO_PI) % TWO_PI / TWO_PI * SIN_TABLE_SIZE) | 0;
  return SIN_TABLE[idx & (SIN_TABLE_SIZE - 1)];
}

function fastCos(t) {
  const idx = ((t % TWO_PI + TWO_PI) % TWO_PI / TWO_PI * SIN_TABLE_SIZE) | 0;
  return COS_TABLE[idx & (SIN_TABLE_SIZE - 1)];
}

// Smooth sinusoidal ease — feels meditative
function ease(t) {
  return (1 - Math.cos(Math.PI * t)) * 0.5;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

function rgba([r, g, b], a) {
  return `rgba(${r},${g},${b},${a.toFixed(4)})`;
}

// ─── Mesh Anchor ──────────────────────────────────────────────────────────────
function createAnchor(W, H, idx) {
  return {
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.18,
    vy: (Math.random() - 0.5) * 0.18,
    phase: Math.random() * TWO_PI,
    phaseSpeed: 0.00018 + Math.random() * 0.00025,
    radius: 0.22 + Math.random() * 0.18,   // fraction of min(W,H)
    colorIdx: idx % 3,
  };
}

// ─── Caustic ──────────────────────────────────────────────────────────────────
function createCaustic(W, H) {
  const cx = W * 0.5 + (Math.random() - 0.5) * W * 0.7;
  const cy = H * 0.5 + (Math.random() - 0.5) * H * 0.7;
  return {
    cx, cy,
    orbitR: 60 + Math.random() * 180,
    orbitSpeed: 0.00008 + Math.random() * 0.00012,
    orbitPhase: Math.random() * TWO_PI,
    radiusBase: 120 + Math.random() * 200,
    radiusPulse: 30 + Math.random() * 60,
    pulsePhase: Math.random() * TWO_PI,
    pulseSpeed: 0.00022 + Math.random() * 0.0003,
    opacityBase: 0.012 + Math.random() * 0.022,
    colorIdx: Math.floor(Math.random() * 3),
  };
}

// ─── Hexagonal Grid ───────────────────────────────────────────────────────────
function buildHexGrid(W, H, cellSize) {
  const cols = Math.ceil(W / (cellSize * 1.5)) + 2;
  const rows = Math.ceil(H / (cellSize * Math.sqrt(3))) + 2;
  const cells = [];
  for (let col = -1; col < cols; col++) {
    for (let row = -1; row < rows; row++) {
      const x = col * cellSize * 1.5;
      const y = row * cellSize * Math.sqrt(3) + (col % 2 === 0 ? 0 : cellSize * Math.sqrt(3) * 0.5);
      cells.push({ x, y, phase: Math.random() * TWO_PI, speed: 0.00012 + Math.random() * 0.00018 });
    }
  }
  return cells;
}

function hexPath(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * TWO_PI - Math.PI / 6;
    const px = cx + r * fastCos(angle);
    const py = cy + r * fastSin(angle);
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
}

// ─── Luminous Dot ─────────────────────────────────────────────────────────────
function createDot(W, H) {
  // Bezier control points for drift path
  const makeCtrl = () => ({ x: Math.random() * W, y: Math.random() * H });
  return {
    x: Math.random() * W,
    y: Math.random() * H,
    p0: makeCtrl(),
    p1: makeCtrl(),
    p2: makeCtrl(),
    p3: makeCtrl(),
    t: Math.random(),
    speed: 0.000035 + Math.random() * 0.00005,
    radius: 1.2 + Math.random() * 2.2,
    colorIdx: Math.floor(Math.random() * 3),
    opacityBase: 0.18 + Math.random() * 0.35,
    pulsPhase: Math.random() * TWO_PI,
    pulseSpeed: 0.0008 + Math.random() * 0.0012,
    // cluster state
    clusterTarget: null,
    clusterProgress: 0,
    clusterDuration: 0,
    clusterHold: 0,
    clusterState: "free", // free | forming | holding | dissolving
  };
}

// Evaluate cubic bezier
function bezierPoint(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

// ─── Cluster Shapes ──────────────────────────────────────────────────────────
const SHAPES = ["hexagon", "triangle"];

function shapePositions(shape, cx, cy, r) {
  if (shape === "hexagon") {
    return Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * TWO_PI - Math.PI / 6;
      return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    });
  }
  if (shape === "triangle") {
    return Array.from({ length: 3 }, (_, i) => {
      const a = (i / 3) * TWO_PI - Math.PI / 2;
      return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    });
  }
  return [];
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PremiumAnimatedBackground({ className = "" }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const rafRef = useRef(null);
  const isDark = useRef(false);

  const initState = useCallback((W, H) => {
    const ANCHOR_COUNT = 7;
    const DOT_COUNT = 40;
    const CAUSTIC_COUNT = 5;
    const HEX_CELL = Math.min(W, H) * 0.08;

    const anchors = Array.from({ length: ANCHOR_COUNT }, (_, i) => createAnchor(W, H, i));
    const caustics = Array.from({ length: CAUSTIC_COUNT }, () => createCaustic(W, H));
    const dots = Array.from({ length: DOT_COUNT }, () => createDot(W, H));
    const hexGrid = buildHexGrid(W, H, HEX_CELL);
    const colors = [BRAND.navy, BRAND.blue, BRAND.light];

    // Stagger cluster events
    let nextClusterTime = 4000;

    stateRef.current = {
      W, H, anchors, caustics, dots, hexGrid, colors,
      HEX_CELL,
      time: 0,
      nextClusterTime,
      lastTs: null,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });

    // Dark mode detection
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    isDark.current = mq.matches;
    const onMQ = (e) => { isDark.current = e.matches; };
    mq.addEventListener("change", onMQ);

    const resize = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initState(W, H);
    };

    resize();
    window.addEventListener("resize", resize);

    // ── Cluster scheduling ──────────────────────────────────────────────────
    function scheduleCluster(state, now) {
      const { dots, W, H } = state;
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      const count = shape === "hexagon" ? 6 : 3;
      const cx = W * 0.15 + Math.random() * W * 0.7;
      const cy = H * 0.15 + Math.random() * H * 0.7;
      const r = 28 + Math.random() * 36;
      const targets = shapePositions(shape, cx, cy, r);
      const formDur = 1800 + Math.random() * 1200;
      const holdDur = 3000 + Math.random() * 2000;
      const dissolveDur = 1400 + Math.random() * 800;

      // Pick 'count' free dots
      const free = dots.filter((d) => d.clusterState === "free");
      if (free.length < count) return;

      // Shuffle & take
      for (let i = free.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [free[i], free[j]] = [free[j], free[i]];
      }

      for (let i = 0; i < count; i++) {
        const dot = free[i];
        dot.clusterOrigin = { x: dot.x, y: dot.y };
        dot.clusterTarget = targets[i];
        dot.clusterProgress = 0;
        dot.clusterDuration = formDur;
        dot.clusterHold = holdDur;
        dot.clusterDissolve = dissolveDur;
        dot.clusterReturnOrigin = null;
        dot.clusterState = "forming";
      }

      state.nextClusterTime = now + 8000 + Math.random() * 6000;
    }

    // ── Draw ────────────────────────────────────────────────────────────────
    function draw(ts) {
      if (!stateRef.current) return;
      const state = stateRef.current;
      if (!state.lastTs) state.lastTs = ts;
      const dt = Math.min(ts - state.lastTs, 50); // cap at 50ms
      state.lastTs = ts;
      state.time += dt;
      const t = state.time;

      const { W, H, anchors, caustics, dots, hexGrid, colors, HEX_CELL } = state;
      const dark = isDark.current;
      const opScale = dark ? 0.55 : 1.0;

      ctx.clearRect(0, 0, W, H);

      // ── 1. Gradient Mesh ────────────────────────────────────────────────
      const anchorColors = [BRAND.navy, BRAND.blue, BRAND.light, BRAND.navy, BRAND.light, BRAND.blue, BRAND.navy];

      // Update anchor positions (slow sinusoidal drift)
      for (const a of anchors) {
        a.phase += a.phaseSpeed * dt;
        const wobX = fastSin(a.phase * 1.3) * 0.4;
        const wobY = fastCos(a.phase * 0.9) * 0.4;
        a.x += (a.vx + wobX * 0.12) * dt * 0.25;
        a.y += (a.vy + wobY * 0.12) * dt * 0.25;
        // Soft wrap
        if (a.x < -W * 0.1) a.x = W * 1.1;
        if (a.x > W * 1.1) a.x = -W * 0.1;
        if (a.y < -H * 0.1) a.y = H * 1.1;
        if (a.y > H * 1.1) a.y = -H * 0.1;
      }

      // Draw radial blobs at each anchor
      for (let i = 0; i < anchors.length; i++) {
        const a = anchors[i];
        const col = anchorColors[i];
        const pulse = 0.7 + 0.3 * fastSin(a.phase * 2.1);
        const r = Math.min(W, H) * a.radius * pulse;
        const op = (0.028 + 0.018 * fastSin(a.phase)) * opScale;

        const grd = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, r);
        grd.addColorStop(0, rgba(col, op));
        grd.addColorStop(0.45, rgba(col, op * 0.45));
        grd.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);
      }

      // Bezier wash between adjacent anchors
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      for (let i = 0; i < anchors.length - 1; i++) {
        const a0 = anchors[i];
        const a1 = anchors[(i + 1) % anchors.length];
        const a2 = anchors[(i + 2) % anchors.length];
        const col = colors[i % 3];
        const op = (0.018 + 0.01 * fastSin(t * 0.00035 + i)) * opScale;

        const cp1x = a0.x + (a1.x - a0.x) * 0.5 + fastSin(t * 0.00022 + i) * 60;
        const cp1y = a0.y + (a1.y - a0.y) * 0.5 + fastCos(t * 0.00028 + i) * 60;
        const cp2x = a1.x + (a2.x - a1.x) * 0.3 + fastCos(t * 0.00019 + i * 1.3) * 50;
        const cp2y = a1.y + (a2.y - a1.y) * 0.3 + fastSin(t * 0.00031 + i * 0.7) * 50;

        const grd = ctx.createLinearGradient(a0.x, a0.y, a1.x, a1.y);
        grd.addColorStop(0, rgba(col, op));
        grd.addColorStop(0.5, rgba(col, op * 1.4));
        grd.addColorStop(1, rgba(col, op * 0.3));

        ctx.strokeStyle = grd;
        ctx.lineWidth = 90 + 30 * fastSin(t * 0.00024 + i * 0.6);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(a0.x, a0.y);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, a1.x, a1.y);
        ctx.stroke();
      }
      ctx.restore();

      // ── 2. Hexagonal Grid ───────────────────────────────────────────────
      const hexBaseOp = (0.032) * opScale;
      for (const cell of hexGrid) {
        cell.phase += cell.speed * dt;
        const pulse = 0.4 + 0.6 * ease((fastSin(cell.phase) + 1) * 0.5);
        const op = hexBaseOp * pulse;
        ctx.strokeStyle = rgba(BRAND.navy, op);
        ctx.lineWidth = 0.5;
        hexPath(ctx, cell.x, cell.y, HEX_CELL * 0.92);
        ctx.stroke();
      }

      // ── 3. Caustic Light Rings ──────────────────────────────────────────
      for (const c of caustics) {
        const ox = c.cx + fastCos(t * c.orbitSpeed + c.orbitPhase) * c.orbitR;
        const oy = c.cy + fastSin(t * c.orbitSpeed * 0.73 + c.orbitPhase) * c.orbitR * 0.6;
        const pulse = fastSin(t * c.pulseSpeed + c.pulsePhase);
        const r = c.radiusBase + pulse * c.radiusPulse;
        const op = c.opacityBase * (0.65 + 0.35 * pulse) * opScale;
        const col = colors[c.colorIdx];

        const grd = ctx.createRadialGradient(ox, oy, r * 0.15, ox, oy, r);
        grd.addColorStop(0, rgba(col, 0));
        grd.addColorStop(0.55, rgba(col, op * 0.8));
        grd.addColorStop(0.78, rgba(col, op));
        grd.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);

        // Second inner ring
        const r2 = r * 0.42;
        const grd2 = ctx.createRadialGradient(ox, oy, r2 * 0.2, ox, oy, r2);
        grd2.addColorStop(0, rgba(col, 0));
        grd2.addColorStop(0.6, rgba(col, op * 0.45));
        grd2.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = grd2;
        ctx.fillRect(0, 0, W, H);
      }

      // ── 4. Luminous Dots ────────────────────────────────────────────────
      // Cluster scheduling
      if (t > state.nextClusterTime) {
        scheduleCluster(state, t);
      }

      for (const dot of dots) {
        // Update cluster state
        if (dot.clusterState === "forming") {
          dot.clusterProgress += dt / dot.clusterDuration;
          if (dot.clusterProgress >= 1) {
            dot.clusterProgress = 1;
            dot.clusterState = "holding";
            dot.clusterHoldStart = t;
          }
          const ep = ease(clamp(dot.clusterProgress, 0, 1));
          dot.x = lerp(dot.clusterOrigin.x, dot.clusterTarget.x, ep);
          dot.y = lerp(dot.clusterOrigin.y, dot.clusterTarget.y, ep);

        } else if (dot.clusterState === "holding") {
          dot.x = dot.clusterTarget.x;
          dot.y = dot.clusterTarget.y;
          if (t - dot.clusterHoldStart > dot.clusterHold) {
            dot.clusterState = "dissolving";
            dot.clusterProgress = 0;
            dot.clusterReturnOrigin = { x: dot.x, y: dot.y };
            // generate new bezier path back into free drift
            dot.p0 = { x: dot.x, y: dot.y };
            dot.p1 = { x: Math.random() * W, y: Math.random() * H };
            dot.p2 = { x: Math.random() * W, y: Math.random() * H };
            dot.p3 = { x: Math.random() * W, y: Math.random() * H };
            dot.t = 0;
          }

        } else if (dot.clusterState === "dissolving") {
          dot.clusterProgress += dt / dot.clusterDissolve;
          if (dot.clusterProgress >= 1) {
            dot.clusterState = "free";
            dot.clusterProgress = 0;
          } else {
            const ep = ease(clamp(dot.clusterProgress, 0, 1));
            const bp = bezierPoint(dot.p0, dot.p1, dot.p2, dot.p3, ep);
            dot.x = bp.x;
            dot.y = bp.y;
          }

        } else {
          // free drift along bezier
          dot.t += dot.speed * dt;
          if (dot.t >= 1) {
            dot.t = 0;
            dot.p0 = dot.p3;
            dot.p1 = { x: Math.random() * W, y: Math.random() * H };
            dot.p2 = { x: Math.random() * W, y: Math.random() * H };
            dot.p3 = { x: Math.random() * W, y: Math.random() * H };
          }
          const bp = bezierPoint(dot.p0, dot.p1, dot.p2, dot.p3, ease(dot.t));
          dot.x = bp.x;
          dot.y = bp.y;
        }

        // Draw dot
        dot.pulsPhase += dot.pulseSpeed * dt;
        const pulseMul = 0.7 + 0.3 * fastSin(dot.pulsPhase);
        const baseOp = dot.clusterState === "holding"
          ? dot.opacityBase * 1.35 * opScale
          : dot.opacityBase * pulseMul * opScale;

        const col = colors[dot.colorIdx];
        const r = dot.radius * (dot.clusterState === "holding" ? 1.5 : 1);

        // Outer glow
        const glow = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, r * 4.5);
        glow.addColorStop(0, rgba(col, baseOp * 0.7));
        glow.addColorStop(0.4, rgba(col, baseOp * 0.25));
        glow.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = glow;
        ctx.fillRect(dot.x - r * 5, dot.y - r * 5, r * 10, r * 10);

        // Core
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, r, 0, TWO_PI);
        ctx.fillStyle = rgba(col, baseOp * 1.8);
        ctx.fill();
      }

      // ── 5. Subtle vignette ──────────────────────────────────────────────
      const vig = ctx.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.25, W * 0.5, H * 0.5, Math.max(W, H) * 0.78);
      vig.addColorStop(0, rgba(BRAND.navy, 0));
      vig.addColorStop(1, rgba(BRAND.navy, 0.045 * opScale));
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      mq.removeEventListener("change", onMQ);
    };
  }, [initState]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
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
