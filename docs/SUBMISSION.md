# Base44 Dev Build-Off Submission Pack

Prepared for the 2026 Dev Build-Off submission form.

## Submission fields

**Full name**

Bob Vasic

**Email**

Use the email tied to the entrant/enrollment record.

**Project title**

PromptGuard

**One-line pitch**

PromptGuard is a zero-login AI prompt-security gate that analyzes prompts and model output in real time, then returns evidence-backed findings and remediation before unsafe content reaches production.

**Surface type**

Web app

**Live URL**

https://promptguard.base44.app

**Public GitHub repository**

https://github.com/RaptorLabsHQ/promptguard

**Access instructions**

No sign-in is required. Select **Run demo scan** on the dashboard to run a synthetic prompt-injection example through the real Base44 backend. The result report displays severity, quoted evidence, remediation, and six-category coverage.

**Demo video URL**

Recommended. Record/upload using `docs/DEMO_SCRIPT.md` if there is enough time.

**Project write-up**

https://promptguard.base44.app/?view=write-up

**Agentic IDE used**

Claude Code (Opus 5)

**Base44 App ID**

`6a66860ef4f752af39cd9ebc`

## Backend feature checklist

Select every applicable capability:

- Database/entities — `Scan` and `Finding`
- Authentication/user management — email/password and Google OAuth
- Backend functions — `analyzeScan`
- AI/LLM — structured `InvokeLLM` analysis with JSON Schema
- Real-time subscriptions — live Scan/Finding updates
- Site hosting — Base44-hosted React/Vite application

## Judge-oriented proof points

1. **Backend depth:** one user action creates a `Scan`, invokes a Deno function, calls Base44 AI using a structured response schema, writes `Finding` records, updates terminal state, and streams the report through realtime subscriptions.
2. **Real usefulness:** prompt injection, jailbreaks, PII, exfiltration, toxicity, and information disclosure are concrete production risks for teams shipping LLM features.
3. **Polish:** no authentication wall; an above-fold demo reaches a real, evidence-backed report in one click.
4. **Verification:** public repository, live deployment, documented architecture, and repeatable synthetic fixtures.

## Mandatory social-post draft — post manually

Built **PromptGuard** for the @base44 Dev Build-Off: a real-time AI prompt-security gate that detects injection, jailbreaks, PII leakage, data exfiltration, toxicity, and disclosure risk — with quoted evidence and remediation in every report.

Live demo: https://promptguard.base44.app
Source: https://github.com/RaptorLabsHQ/promptguard

Built with Base44 entities, auth, backend functions, structured AI analysis, realtime subscriptions, and a custom React frontend.
