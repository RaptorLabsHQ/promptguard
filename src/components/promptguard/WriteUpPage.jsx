import {
  ArrowUpRight,
  BadgeCheck,
  Braces,
  CheckCircle2,
  Database,
  FileSearch,
  Radio,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const CAPABILITIES = [
  ['Entities', 'Scan and Finding records make every inspection traceable.', Database],
  ['Backend function', 'A Deno analysis function coordinates the complete security workflow.', Braces],
  ['Structured AI', 'Typed findings prevent brittle free-text parsing and keep reports consistent.', Sparkles],
  ['Realtime', 'The report updates as findings and terminal status are persisted.', Radio],
];

const COVERAGE = [
  'Prompt injection',
  'PII leakage',
  'Data exfiltration',
  'Jailbreak attempts',
  'Bias & toxicity',
  'Information disclosure',
];

export function WriteUpPage() {
  return (
    <main className="pg-writeup" id="pg-main">
      <div className="pg-writeup__grid" aria-hidden="true" />
      <article className="pg-writeup__article">
        <header className="pg-writeup__masthead">
          <div className="pg-writeup__brand">
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            <span>PromptGuard</span>
          </div>
          <span className="pg-writeup__eyebrow">Base44 Dev Build-Off · Submission brief</span>
        </header>

        <section className="pg-writeup__hero">
          <p className="pg-writeup__kicker">PROJECT WRITE-UP</p>
          <h1>Every prompt deserves a security review before it ships.</h1>
          <p className="pg-writeup__lede">
            PromptGuard is a real-time AI prompt-security gate. It turns a prompt or model
            response into an evidence-backed report with severity, quoted proof, and a
            practical remediation path.
          </p>
          <div className="pg-writeup__proof">
            <span><BadgeCheck className="w-4 h-4" aria-hidden="true" /> No sign-in required</span>
            <span><CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Real backend analysis</span>
            <span><FileSearch className="w-4 h-4" aria-hidden="true" /> Six security categories</span>
          </div>
        </section>

        <section className="pg-writeup__section pg-writeup__section--statement">
          <p className="pg-writeup__section-label">THE PROBLEM</p>
          <div className="pg-writeup__two-col">
            <h2>AI prompts are an operational attack surface.</h2>
            <p>
              Teams deploying copilots, assistants, and agents have to evaluate more than
              model quality. Prompt injection, jailbreaks, sensitive-data leakage and hidden
              system-context extraction can turn ordinary input into a material security event.
              PromptGuard gives that review a fast, understandable front door.
            </p>
          </div>
        </section>

        <section className="pg-writeup__section">
          <p className="pg-writeup__section-label">WHAT WE BUILT</p>
          <div className="pg-writeup__feature-panel">
            <div>
              <h2>A report that explains the risk, not just the score.</h2>
              <p>
                A user can paste a prompt, optionally include the model output, and receive a
                structured security report in seconds. Each finding identifies its category,
                severity, direct source evidence, and a concrete mitigation recommendation.
              </p>
            </div>
            <ul className="pg-writeup__coverage" aria-label="Detection coverage">
              {COVERAGE.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </section>

        <section className="pg-writeup__section">
          <p className="pg-writeup__section-label">BASE44 BACKEND DEPTH</p>
          <h2 className="pg-writeup__section-title">One action, a complete verifiable workflow.</h2>
          <ol className="pg-writeup__flow">
            <li><b>01</b><span>A prompt creates a <strong>Scan</strong> record.</span></li>
            <li><b>02</b><span>The <strong>analyzeScan</strong> backend function begins the security review.</span></li>
            <li><b>03</b><span>Structured AI analysis returns typed findings instead of free-form text.</span></li>
            <li><b>04</b><span><strong>Finding</strong> records and terminal status are persisted and streamed into the report.</span></li>
          </ol>
          <div className="pg-writeup__capabilities">
            {CAPABILITIES.map(([title, copy, Icon]) => (
              <div key={title} className="pg-writeup__capability">
                <Icon className="w-5 h-5" aria-hidden="true" />
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="pg-writeup__section pg-writeup__section--quote">
          <p>
            “The goal was not another security dashboard. It was the product experience a
            security-minded team needs before an unsafe prompt reaches production: immediate,
            inspectable, and useful without a setup ceremony.”
          </p>
          <span>— Bob Vasic, CISO & software architect</span>
        </section>

        <section className="pg-writeup__section pg-writeup__section--closing">
          <p className="pg-writeup__section-label">WHY IT MATTERS</p>
          <h2>Make prompt safety a visible production control.</h2>
          <p>
            PromptGuard combines a custom React surface with Base44 entities, authentication,
            backend functions, structured AI, realtime subscriptions, and hosting. The result is
            a judge-testable product: one click from dashboard to a real, evidence-backed report.
          </p>
          <a className="pg-writeup__cta" href="/?view=dashboard">
            Open the live product <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </section>
      </article>
    </main>
  );
}

export default WriteUpPage;
