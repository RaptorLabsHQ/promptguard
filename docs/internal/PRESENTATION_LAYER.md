# PromptGuard presentation layer

## Purpose

`src/components/promptguard/` contains the product presentation layer. Components in this directory render from explicit props only: they do not import the Base44 client, read browser storage, start timers, query the DOM, or make network calls.

This keeps the shipped application native React while making the same dashboard, scan log, sample picker, and report components directly reusable by a future Remotion composition.

## Boundaries

- `src/App.jsx` owns Base44 entity CRUD, auth, realtime subscriptions, analysis invocation, and state-based view routing.
- `src/data/samplePrompts.js` contains safe synthetic inputs for the real product demo path. Selecting one fills the actual scan form; it never fabricates a result.
- `src/data/demoReport.js` contains deterministic, private presentation fixtures. It is not imported by the product flow and must never be rendered as a real scan result.
- `src/components/DemoAttackSelector.jsx` is a small interaction wrapper. Its pure visible surface is `SamplePicker`.

## Future Remotion use

A Remotion composition can import `DashboardHero`, `ScanLog`, `SamplePicker`, `ScanReport`, and fixture records from this layer without mounting `App` or configuring Base44. Keep any future video state explicit and deterministic; do not add network calls, random values, time-relative strings, or DOM-dependent animation to presentation components.

## Base44 analysis model requirement

The production `base44/functions/analyzeScan/entry.ts` function must continue to use Base44 Core `InvokeLLM` with the existing structured `response_json_schema` contract. The Base44 workspace integration is intended to run **Claude Fable 5** for this function. Confirm that workspace-level model selection in Base44 before a production demo or final submission.

Do not add model/provider names to the public application, screenshots, API responses, README marketing copy, or demo narration. The public product promise is evidence-backed prompt security analysis, not infrastructure provenance.

## Release checks

Before a presentation-layer release:

1. Run `npm run build`.
2. Verify every demo sample populates the real form and requires an explicit scan action.
3. Verify the dashboard’s one-click demo creates only one analysis per browser session and reopens its report afterward.
4. Check desktop and mobile rendering in a fresh anonymous session.
5. Confirm Base44 scan and finding access policies are appropriate before treating the application as production-ready; the UI must not be used as evidence of tenant isolation.
