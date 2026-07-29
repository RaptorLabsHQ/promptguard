# PromptGuard — 2-Minute Dev Build-Off Demo Script

Target duration: 1:50–2:15. Record the live app at https://promptguard.base44.app with browser chrome hidden where possible.

## 0:00–0:15 — Problem and immediate value

Show the dashboard.

> Every team shipping AI has a new attack surface: prompts and model output. PromptGuard is a real-time security gate that lets teams inspect that surface before a risky prompt reaches production.

Point to the one-click **Run demo scan** control and the six-category coverage readout.

## 0:15–0:40 — Real end-to-end demo

Click **Run demo scan**.

> This is not a canned report. The button creates a Scan entity, calls a Base44 backend function, runs structured AI analysis, writes findings, and streams the real result back into the interface.

Wait for the completed report.

## 0:40–1:10 — Evidence, remediation, and coverage

Scroll through the report.

> PromptGuard flags the exact evidence, assigns severity, and gives an actionable remediation. The report covers prompt injection, PII leakage, data exfiltration, jailbreak attempts, toxicity, and information disclosure.

Show the finding cards and six-category coverage grid.

## 1:10–1:35 — Manual workflow

Return to dashboard, choose **New scan**, then **Load a sample attack**.

> Reviewers can test every detection category with safe synthetic prompts, or paste a real prompt and optionally the model response. There is no sign-in wall for the first scan.

Load one sample and show the form is populated.

## 1:35–2:00 — Base44 backend proof and close

Show the public GitHub repository architecture section or the live dashboard scan history.

> Under the hood, PromptGuard uses Base44 entities, authentication, backend functions, structured AI analysis, realtime subscriptions, and site hosting. The custom React frontend is designed for quick verification: one click from dashboard to real evidence-backed results.

End on the dashboard or completed report.

> PromptGuard: every prompt, inspected before it ships.

## Recording rules

- Use the live URL, not a local build.
- Do not show Base44 dashboard credentials, secrets, browser tabs, or internal infrastructure details.
- Do not claim a result is live until the terminal report renders.
- Use the synthetic fixture, not real user/customer prompts.
- Keep the report evidence readable at 1080p.
