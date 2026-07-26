# PromptGuard — Project Write-Up

## What We Built

PromptGuard is an AI prompt security scanner that analyzes LLM inputs (and outputs) for six categories of risk: prompt injection, PII leakage, data exfiltration, jailbreak attempts, bias/toxicity, and information disclosure. Each finding includes a severity rating, quoted evidence from the source text, and a specific, actionable remediation recommendation.

The application requires no sign-up. Users land on a live dashboard, paste a prompt, and receive a structured security report in seconds. Authentication is available for saving scan history but is entirely optional.

## Why We Built It

AI prompts are the new attack surface. Every organization deploying LLMs — whether customer-facing chatbots, internal copilots, or agentic systems — is exposing themselves to prompt injection, data leaks, and jailbreak risks. Security teams lack tools purpose-built for this domain. PromptGuard fills that gap.

As a CISO and security architect with 20+ years of experience, I built the tool I would want my own team to use before any prompt reaches production.

## Base44 Features Used

| Feature | Implementation |
|---|---|
| **Entities** | `Scan` and `Finding` models with JSON schema validation, enums for category and severity |
| **Authentication** | Email/password and Google OAuth via Base44 auth config. Fully optional — app works without login |
| **Backend Functions** | `analyzeScan` — a Deno/TypeScript function that orchestrates the full analysis pipeline using `asServiceRole` |
| **AI Integration (InvokeLLM)** | Claude Fable 5 with `response_json_schema` for structured, deterministic findings output. No parsing fragility |
| **Realtime Subscriptions** | `entities.subscribe()` streams findings to the results page as they are generated — users see live progress |
| **Row-Level Security** | Per-user scan isolation when authenticated. Anonymous scans accessible to all (demo-friendly) |
| **Site Hosting** | React SPA built with Vite + Tailwind, deployed to Base44 hosting |

## Technical Highlights

- **Structured AI output**: Instead of parsing free-text LLM responses, we use `response_json_schema` to guarantee a typed findings array. The Claude Fable 5 model returns exactly the shape we defined — zero hallucinated fields, zero parsing errors.

- **Zero-auth design**: The entire product works without authentication. Entity RLS is set to `true` for anonymous access. The "Sign In" button is a soft prompt in the header, not a wall. This was a deliberate UX choice for maximum conversion and instant value delivery.

- **Premium security-product design**: Custom SVG brand mark with radar shield geometry, terminal-console scan interface, severity-coded findings cards with evidence blocks styled as terminal output and remediation blocks as system messages. Built by Claude Code (Opus 5) under the "Controlled Perimeter / Threat Scanner" visual thesis.

- **Single-file architecture**: The entire React application lives in `App.jsx` with state-based view routing. No router dependency, no unnecessary abstraction. Clean component hierarchy with shared chrome components (AppHeader, SectionHead, Badge, StatPanel).

## What We'd Add Next

- Batch scanning via file upload (CSV of prompts)
- Organization teams with shared scan history
- API endpoint for CI/CD pipeline integration
- Custom security policy configuration per organization
- Slack/Teams alerting for critical findings

## Built With

- **Frontend**: React 18, Vite 6, Tailwind CSS 3, shadcn/ui, Lucide icons
- **Backend**: Base44 (entities, auth, functions, AI integration, realtime, hosting)
- **AI Analysis**: Claude Fable 5 via Base44 InvokeLLM
- **Development**: Claude Code (Opus 5) for frontend design and implementation
