# PremiumAnimatedBackground.jsx — REDESIGN BRIEF

## What's wrong with the current version
The current background has 45 luminous dots drifting on bezier paths + hexagonal grid + mesh anchors + caustics. It looks like an amateur particle system. Too many things happening. Too random. Too scattered.

## What we need instead
ONE unified, architectural visual concept. Subtle. Intentional. Premium.

Think: the background of a $10,000/mo enterprise security SaaS. Something you'd see behind a Stripe dashboard, a Linear project page, or an Apple product launch. NOT a particle toy.

## VISUAL CONCEPT: Atmospheric Gradient Flow

A single, unified system: slow-moving atmospheric gradient fields that create depth and mood. No particles. No dots. No random elements.

SPECIFICALLY:
- 3-5 large, soft gradient orbs (300-600px radius) that drift VERY slowly across the canvas
- Each orb has a soft radial gradient in navy blue tones (#1e3a5f, #2563eb, #3b82f6, #60a5fa)
- Opacity: 0.03 to 0.08 — barely visible, atmospheric
- The orbs overlap and blend, creating organic color fields like clouds or smoke
- A subtle diagonal light sweep occasionally passes across (like a very faint glass reflection)
- Optional: VERY subtle geometric grid lines (hairline, 0.03 opacity) that connect the orbs like a constellation, slowly morphing

The feeling: standing inside a premium architectural space at dawn. Soft atmospheric light. Calm. Professional. Not busy. Not "cool hacker." Pure enterprise elegance.

## TECHNICAL REQUIREMENTS
- Canvas-based, requestAnimationFrame
- Fixed position, z-index: 0, pointer-events: none
- Precomputed radial gradients or use canvas createRadialGradient
- All motion sinusoidal, very slow (one full drift cycle = 30-60 seconds)
- Colors: navy (#1e3a5f), blue (#2563eb), light blue (#3b82f6) at 0.02-0.08 alpha
- Dark mode: slightly higher opacity on dark backgrounds
- Self-contained React component, "use client", export default
- File: src/PremiumAnimatedBackground.jsx

## WHAT TO AVOID
- NO particles or dots
- NO hex grids or repeating patterns
- NO random generation
- NO ASCII or code characters
- NO "hacker" or "cyber" aesthetic
- NO busy animation
- NO fast motion
- NOTHING that looks like a screensaver from 2005

## QUALITY BAR
If a visitor notices the background within the first 5 seconds, it's too busy.
If a visitor has been on the page for 30 seconds and suddenly notices there's a beautiful atmospheric depth behind the UI, that's perfect.

## PRODUCTION
- Build: `npm run build` — MUST PASS
- Component placed inside `<div className="pg-app">` as first child in 8 locations in App.jsx
- Already imported as `import PremiumAnimatedBackground from "@/PremiumAnimatedBackground"`
