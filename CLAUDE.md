# Demo Attack Selector — Cinematic Judge Experience

## Problem
Judges review hundreds of submissions. They won't type their own prompts. The demo must be self-driving — click a floating element, see a blockbuster animation, get a complete prompt in the input, ready to scan. No typing required.

## Visual Concept

### Step 0 — Floating Trigger
A prominent frosted-glass floating button at the top of the New Scan page, above the input:
"TRY A DEMO ATTACK" with a subtle pulsing glow ring around it. Immediately visible on page load.

### Step 1 — Cloud Cards Fly In
Click the trigger → 6 frosted glass cards animate in from the sides with staggered spring entrance (staggerChildren: 0.08). Each card shows:
- Category icon (shield/alert/lock/link/code/eye from lucide-react)
- Category name (Prompt Injection, PII Leak, etc.)
- Severity badge (Critical/High/Medium)
- Brief description (10-15 words)
- Subtle hover glow

Cards float with gentle idle animation (subtle Y-axis oscillation, different phase per card).

### Step 2 — Card Click → Character Rain
User clicks a card → THE MAGIC HAPPENS:

1. The card glows bright for 200ms
2. The prompt text "shatters" — each character becomes a glowing blue particle
3. Characters cascade down the screen in a beautiful rain pattern
4. Characters flow into the textarea input field
5. As each character "lands," it appears in the textarea with a subtle glow
6. The textarea shows a typewriter-like construction of the full prompt
7. Total animation: ~1.5 seconds

### Step 3 — Ready to Scan
After the character rain completes, the textarea contains the complete demo prompt with all special characters. The "Analyze Prompt" button pulses briefly to draw attention. User clicks it → scan runs.

## Technical Implementation

### Library: framer-motion (npm install framer-motion)

### Component: DemoAttackSelector
Renders in the NewScan page, positioned above the textarea.

```jsx
<AnimatePresence>
  {step === 'trigger' && <FloatingTrigger onClick={open} />}
  {step === 'cards' && (
    <CloudCardGrid>
      {SAMPLES.map((sample, i) => (
        <CloudCard 
          key={sample.id}
          sample={sample}
          index={i}
          onClick={(e) => triggerCharacterRain(sample, e)}
        />
      ))}
    </CloudCardGrid>
  )}
</AnimatePresence>
```

### Character Rain Animation
Use framer-motion with:
- `motion.div` for each character with `initial`, `animate`, `exit`
- Characters start at card position, end at textarea position
- `transition={{ type: "spring", stiffness: 200, damping: 20, delay: i * 0.02 }}`
- Staggered delays (0.02s per character)

Alternative approach if position tracking is too complex:
- Canvas overlay creates particle burst from card
- Particles flow in a curve toward the textarea
- Textarea shows characters appearing one by one with typewriter + glow effect
- canvas particles dissolve as characters "arrive" in the textarea

### Styling
- Frosted glass cards: `backdrop-blur-xl bg-white/80 border border-white/20 shadow-xl`
- Floating button: `backdrop-blur-md bg-navy/90 text-white rounded-full`
- Character rain particles: `text-[#2563eb] font-mono` glowing blue
- Cards: rounded-2xl, subtle navy border, hover: shadow-2xl hover:-translate-y-1

## Integration
- Install framer-motion: `npm install framer-motion`
- Import in App.jsx: `import { motion, AnimatePresence } from "framer-motion"`
- Add DemoAttackSelector component inside the NewScan view, above the textarea
- The component receives `onSelectPrompt(text)` callback to populate the textarea
- Remove the existing "Try an example" section (replaced by this)

## Visual Quality
- Every motion uses spring physics (no linear/bezier)
- Staggered children for entrance
- Hover states with subtle glow (box-shadow with brand blue)
- Cards bounce slightly when they appear
- The character rain must look MAGICAL — not like a bug or glitch
- Dark enough to be visible against the light background

## File Changes
1. Install framer-motion
2. Create src/components/DemoAttackSelector.jsx
3. Modify src/App.jsx: import DemoAttackSelector, integrate into NewScan section, remove old "Try an example" section
4. Build: `npm run build` MUST pass
