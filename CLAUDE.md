# Frontend UX Audit Brief for Claude Code Opus 5

Read src/App.jsx and src/index.css in full. Then execute a comprehensive UX audit and apply fixes.

## Audit Checklist — Fix Everything Below

### 1. DASHBOARD PAGE
- Hero section: "Every prompt, inspected before it ships." — is the spacing balanced? Is the CTA prominent?
- Stat panels (LAST SCAN, TOTAL SCANS, FINDINGS): are they visually distinct? Do they have proper information hierarchy?
- "New Scan" CTA button: is it the most visually prominent element? Is the color contrast strong enough?
- "Paste a prompt · results in seconds" — is this subtitle clear and concise?
- Empty state for scan log: "Run your first scan" — is it welcoming and clear?
- Overall dashboard spacing: too much whitespace? Too cluttered? Balance needed.

### 2. NEW SCAN PAGE
- DemoAttackSelector button: does it have proper top margin spacing from the heading? 
- The caption "Six real attack payloads · one click loads the prompt" — is it properly styled?
- When cloud cards appear, do they push content down gracefully or cause layout shift?
- Form spacing: are the prompt textarea and response textarea visually balanced?
- "Analyze Prompt" button: disabled state clear? Enabled state obvious?
- Character counter "0 characters" — helpful or clutter?
- Overall page flow: heading → demo button → form. Is the rhythm right?

### 3. RESULTS PAGE
- Loading state: is the "Analyzing..." spinner professional?
- Findings list: severity badges clear? Left-border color coding visible?
- Evidence blocks: readable? Proper monospace styling?
- Recommendation blocks: actionable feel?
- Back navigation: easy to find?
- "New Scan" secondary CTA: visible?
- Empty findings state (scan with no findings = clean): handled?

### 4. AUTH MODAL
- Sign In / Create Account toggle: clear and obvious?
- Form fields: proper labels, placeholders, spacing?
- Google sign-in button: properly styled? Not an afterthought?
- Error states: if login fails, is feedback clear?
- Modal backdrop: opacity right? Click-outside-to-close working?

### 5. GLOBAL UX
- Typography hierarchy: headings (h1, h2), body, labels — consistent sizing?
- Color contrast: all text meets WCAG AA (4.5:1 for body, 3:1 for large)?
- Spacing rhythm: consistent padding/margins? No random gaps?
- Button hierarchy: primary (solid navy), secondary (ghost/outline), tertiary (text) — consistently applied?
- Transitions: hover states on all interactive elements?
- Focus states: visible focus rings for keyboard navigation?
- Responsive: mobile layout doesn't break? Cards stack properly?
- Loading states: skeleton or spinner pattern consistent?

### 6. COPY & MICROCOPY
- Is every label clear and concise?
- Are button texts action-oriented?
- Is tooltip/helper text helpful or noise?
- "Security Dashboard" vs "Dashboard" — is the subtitle right?
- "Submit for analysis" eyebrow — clear?

### 7. SPECIFIC FIXES TO APPLY
- Ensure consistent 24px/32px spacing rhythm throughout
- All buttons need visible hover + focus states
- Primary CTAs should be navy (#1e3a5f) with white text
- Secondary actions should be outlined or ghost
- Severity badges must have distinct, scannable colors
- Form inputs need clear focus rings (#2563eb)
- Any text below 14px must have sufficient contrast
- The page should feel "designed" not "assembled"

### CONSTRAINTS
- Keep ALL Base44 SDK integration intact
- Keep the component structure (state routing, no react-router)
- Keep the navy blue brand palette
- Keep framer-motion animations
- Keep PremiumAnimatedBackground
- Keep DemoAttackSelector

### OUTPUT
Apply all fixes by editing src/App.jsx and src/index.css. Then run `npm run build` to verify.

Quality bar: This must look like a Vercel/Stripe/Linear-grade product, not a hackathon prototype.
