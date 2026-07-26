<p align="center">
  <img src="https://raw.githubusercontent.com/bobvasic/promptguard/main/docs/assets/hero.svg" alt="PromptGuard" width="600" onerror="this.style.display='none'">
</p>

<p align="center">
  <strong>Every prompt, inspected before it ships.</strong><br>
  PromptGuard sweeps AI prompts and model output for injection, jailbreak, PII leakage, exfiltration and disclosure risk — with evidence and remediation for every finding.
</p>

<p align="center">
  <a href="https://promptguard.base44.app"><strong>promptguard.base44.app</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-live-45a97b?style=flat-square" alt="Status">
  <img src="https://img.shields.io/badge/stack-react%20%7C%20vite%20%7C%20tailwind-050303?style=flat-square" alt="Stack">
  <img src="https://img.shields.io/badge/backend-Base44-a20f10?style=flat-square" alt="Backend">
  <img src="https://img.shields.io/badge/ai-Claude%20Fable%205-d63b3b?style=flat-square" alt="AI">
</p>

---

## Capabilities

| Category | Detects |
|---|---|
| **Prompt Injection** | System instruction override, role manipulation, delimiter injection |
| **PII Leaks** | Names, emails, phones, SSNs, credit cards, addresses, IPs |
| **Data Exfiltration** | Training data extraction, system prompt theft, API key probing |
| **Jailbreak Attempts** | DAN-style, roleplay bypass, encoding tricks, multi-step manipulation |
| **Bias & Toxicity** | Hate speech, harassment, discrimination, violent content |
| **Information Disclosure** | Architecture leaks, security measure exposure, internal process disclosure |

Each finding includes severity rating, quoted evidence, and actionable remediation.

## How It Works

```
User pastes prompt → Scan entity created → analyzeScan function invoked
→ Claude Fable 5 analyzes content → Structured findings written to DB
→ Results streamed to UI via realtime subscription
```

## Base44 Features Used

| Feature | Usage |
|---|---|
| **Entities** | `Scan` and `Finding` data models with JSON schema validation |
| **Authentication** | Email/password + Google OAuth (optional — app works anonymously) |
| **Backend Functions** | Deno-based `analyzeScan` orchestrates AI analysis via `asServiceRole` |
| **AI Integration** | `InvokeLLM` with `response_json_schema` for structured security findings |
| **Realtime Subscriptions** | `entities.subscribe()` streams findings as they're generated |
| **Row-Level Security** | Per-user scan isolation when authenticated |
| **Site Hosting** | React SPA deployed to Base44 hosting |

## Quick Start

```bash
# Install CLI
npm install -g base44@latest

# Authenticate
base44 login

# Clone and link
git clone https://github.com/bobvasic/promptguard.git
cd promptguard
base44 link

# Install frontend dependencies
npm install

# Run locally
base44 dev

# Deploy
base44 deploy --yes
```

## Architecture

```
┌──────────────────────────────────────────────┐
│  React SPA (Vite + Tailwind)                 │
│  Dashboard · New Scan · Results              │
│  ┌──────────────────────────────────────┐   │
│  │ @base44/sdk                           │   │
│  └──────────────────────────────────────┘   │
└──────────────────┬───────────────────────────┘
                   │
┌──────────────────▼───────────────────────────┐
│  Base44 Backend                               │
│  ┌──────────────────────────────────────┐   │
│  │ Auth · Entities · Functions · Site   │   │
│  ├──────────────────────────────────────┤   │
│  │ analyzeScan (Deno/TypeScript)        │   │
│  │   → InvokeLLM (Claude Fable 5)      │   │
│  │   → Structured findings JSON         │   │
│  │   → Realtime subscription push       │   │
│  └──────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

## Project Structure

```
promptguard/
├── base44/
│   ├── config.jsonc          # Project configuration
│   ├── auth/config.jsonc     # Authentication settings
│   ├── entities/
│   │   ├── scans.jsonc       # Scan data model
│   │   └── findings.jsonc    # Finding data model
│   └── functions/
│       └── analyzeScan/      # AI security analysis
│           └── entry.ts      # Deno function entry
├── src/
│   ├── App.jsx               # Main application
│   ├── index.css             # Design system
│   ├── main.jsx              # Entry point
│   ├── api/
│   │   └── base44Client.js   # SDK client
│   └── components/
│       └── ui/               # shadcn/ui primitives
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Built For

[Base44 Dev Build-Off](https://backendcompetition.base44.app/) — July 21–28, 2026.

## Contact

RaptorLabs — [info@raptorlabs.dev](mailto:info@raptorlabs.dev)

---

<p align="center">
  <sub>© RaptorLabs. All rights reserved.</sub>
</p>
