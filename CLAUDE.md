# PromptGuard — AI Prompt Security Scanner

## Project Type
Base44 backend app with React SPA frontend (Vite + Tailwind CSS).
DO NOT modify backend files (base44/ directory) — only work on frontend files in src/.

## Tech Stack
- React 18 with Vite 6
- Tailwind CSS 3 with custom dark theme
- Base44 SDK (@base44/sdk) for auth, entities, functions
- shadcn/ui components in src/components/ui/ (button, input, checkbox)
- Icons: lucide-react
- No router library — state-based view switching in App.jsx

## Current State
- App.jsx: single-file app with auth form, dashboard, new scan form, and results page
- index.css: custom dark theme with CSS variables and utility classes
- index.html: HTML shell
- src/api/base44Client.js: Base44 SDK client (DO NOT MODIFY)

## Files to Redesign
- src/App.jsx — main application
- src/index.css — design system and theme
- src/index.html — HTML shell (title, meta, favicon)
- src/components/ — UI component library (button, input, checkbox)

## Visual Thesis: Controlled Perimeter / Threat Scanner
This is a SECURITY product. The visual concept should evoke:
- Radar/sonar scanning field
- Security grid / threat detection perimeter
- Terminal/console evidence analysis
- Controlled, precise, military-grade confidence
- NOT generic AI startup aesthetic (no random glow orbs, interchangeable gradients, excessive pill cards)

## Brand Identity (RaptorLabs)
- Primary: Deep black #050303
- Secondary: Charcoal #150F10
- Surface: Graphite #302C2D
- Brand accent: Crimson #A20F10
- Signal red: #D63B3B
- White text on dark surfaces
- Minimal, controlled highlights
- Premium metal, frosted glass, subtle honeycomb or circuit depth
- Strong but restrained contrast

## Design Requirements
1. **Identity**: Custom SVG shield/radar logo mark for PromptGuard (security shield with scanning beam concept). Replace the plain Shield icon with a proper branded mark.

2. **Hero/Dashboard**: Radar-like scanning field background effect (subtle CSS grid with scanning animation). Stats cards with animated counter-like presentation.

3. **Scan form**: Terminal/console-inspired text area with monospace font, subtle scan-line effect. Example prompts styled as code blocks.

4. **Results page**: Evidence graph aesthetic — findings as alert cards with severity-based border treatment, evidence blocks styled like terminal output, remediation blocks like system messages.

5. **Auth page**: Clean, secure perimeter feel. Logo mark prominent. Form with controlled precision.

6. **Motion**: One scanning animation on the dashboard hero. Interactive hover without overshooting. No scroll-triggered animations that hide content. Always respect prefers-reduced-motion.

7. **Responsive**: Compose for 320-1440px widths. Mobile nav must be intentional, not just wrapped.

8. **Dark theme only**: No light mode needed. Dark surface system with proper luminance steps.

9. **Typography**: Clean geometric sans-serif for headings, monospace for prompt/code/evidence content.

## Critical Constraints
- Single-file App.jsx is acceptable — keep state-based routing, no react-router
- Do NOT modify base44Client.js or base44/ directory
- Must build and deploy successfully (npm run build)
- All content must be visible by default — no opacity:0 with JS-dependent reveal
- HTML title must be "PromptGuard — AI Prompt Security Scanner"
- No external font loading; use system font stack or Inter (already available via Tailwind)
- Avoid large image/animation payloads; CSS/SVG for effects

## Production Path
- Build: `npm run build`
- Deploy: `base44 deploy --yes`
- Live URL: https://promptguard-39cd9ebc.base44.app

## What Makes This "Premium"
- Distinctive visual identity (not another centered-light-card dashboard)
- Semantic depth tied to the security scanning concept
- Controlled, purposeful motion (not everything animated)
- Clear conversion hierarchy: scan is the primary action
- Thoughtful empty states, loading states, error states
- Actual mobile composition, not just responsive wrapping
- No generic AI startup template patterns
