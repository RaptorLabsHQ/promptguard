import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Lock,
  LogOut,
  MessageSquare,
  Plus,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react';

import { base44 } from '@/api/base44Client';
import '@/writeup.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PremiumAnimatedBackground from '@/PremiumAnimatedBackground';
import DemoAttackSelector from '@/components/DemoAttackSelector';
import {
  AppHeader,
  AppShell,
  Chip,
  DashboardHero,
  EmptyState,
  GoogleMark,
  GuardMark,
  LoadBar,
  ReportSkeleton,
  ScanLog,
  ScanReport,
  SectionHead,
  SkipLink,
  StatTile,
  WriteUpPage,
  formatRelative,
  plural,
  shortId,
} from '@/components/promptguard';
import { CATEGORY_KEYS } from '@/data/detection';
import { DEMO_SAMPLE, SAMPLE_PROMPTS } from '@/data/samplePrompts';

/**
 * Application container.
 *
 * Everything Base44-coupled lives here — entity CRUD, auth, realtime
 * subscriptions and the analyzeScan invocation — plus the state-based view
 * router. All visible product surface is rendered by the pure components in
 * `@/components/promptguard`.
 */

const Scan = base44.entities.Scan;
const Finding = base44.entities.Finding;

const VIEWS = { DASHBOARD: 'dashboard', NEW_SCAN: 'new-scan', RESULTS: 'results', WRITE_UP: 'write-up' };

const PAGE_TITLES = {
  [VIEWS.DASHBOARD]: 'PromptGuard — AI Prompt Security Scanner',
  [VIEWS.NEW_SCAN]: 'New scan · PromptGuard',
  [VIEWS.RESULTS]: 'Scan report · PromptGuard',
  [VIEWS.WRITE_UP]: 'PromptGuard — Project Write-Up',
};

/* A freshly created record can take a moment to become readable. */
const MAX_LOOKUPS = 6;
/* Realtime is the primary channel; this is the fallback if the socket is down. */
const POLL_INTERVAL_MS = 2500;
const POLL_CEILING_MS = 120000;

/**
 * Base44's public function endpoint is the stable invocation path for this
 * public, anonymous-first app. It returns the structured function result and
 * surfaces trigger failures so a scan cannot remain queued indefinitely.
 */
async function triggerAnalysis(scanId) {
  const response = await fetch('/functions/analyzeScan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scanId }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || `Analysis request failed (${response.status})`);
  }
  return payload;
}

async function markAnalysisTriggerError(scanId, error) {
  const message = error instanceof Error ? error.message : 'Unable to start analysis.';
  try {
    await Scan.update(scanId, { status: 'error', errorMessage: message });
  } catch (updateError) {
    console.error('Could not record analysis trigger failure:', updateError);
  }
}

/** Base44Error carries a status; turn it into something a human can act on. */
function authErrorMessage(error, fallback) {
  if (error?.status === 401) return 'That email and password combination was not recognised.';
  if (error?.status === 403) return 'This email is not verified yet. Enter the code we sent you.';
  if (error?.status === 409) return 'An account already exists for this email. Sign in instead.';
  if (error?.status === 429) return 'Too many attempts. Wait a moment and try again.';
  return error?.message || fallback;
}

/* ------------------------------------------------------------------ *
 * Modal — backdrop click, Escape, scroll lock, focus handoff
 * ------------------------------------------------------------------ */

function Modal({ onClose, labelledBy, children }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement;
    document.body.style.overflow = 'hidden';

    const first = cardRef.current?.querySelector(
      'input, button, [href], select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    first?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [onClose]);

  return (
    <div
      className="pg-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="pg-modal__card" ref={cardRef}>
        <button type="button" onClick={onClose} className="pg-modal__close" aria-label="Close dialog">
          <X className="w-[18px] h-[18px]" aria-hidden="true" />
        </button>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Auth — optional throughout; the scanner works signed out
 * ------------------------------------------------------------------ */

function AuthForm({ onAuthenticated, titleId }) {
  /* signin | signup | verify — registration requires an emailed OTP before
     the account can log in, so verification is a real step, not a detour. */
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const isSignUp = mode === 'signup';
  const isVerify = mode === 'verify';

  const switchMode = (next) => {
    if (next === mode) return;
    setMode(next);
    setError('');
    setNotice('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError('');
    setNotice('');

    try {
      if (mode === 'signup') {
        await base44.auth.register({ email, password });
        setMode('verify');
        setNotice(`We sent a verification code to ${email}.`);
      } else if (mode === 'verify') {
        await base44.auth.verifyOtp({ email, otpCode: otpCode.trim() });
        await base44.auth.loginViaEmailPassword(email, password);
        onAuthenticated();
      } else {
        await base44.auth.loginViaEmailPassword(email, password);
        onAuthenticated();
      }
    } catch (err) {
      setError(
        authErrorMessage(
          err,
          mode === 'signup'
            ? 'Could not create the account.'
            : mode === 'verify'
              ? 'That code was not accepted.'
              : 'Could not sign in.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      await base44.auth.resendOtp(email);
      setNotice(`New code sent to ${email}.`);
    } catch (err) {
      setError(authErrorMessage(err, 'Could not resend the code.'));
    } finally {
      setLoading(false);
    }
  };

  /* OAuth is a full-page redirect back to where we started. */
  const handleGoogle = () => {
    setError('');
    try {
      base44.auth.loginWithProvider('google', window.location.href);
    } catch (err) {
      setError(authErrorMessage(err, 'Could not start Google sign-in.'));
    }
  };

  return (
    <div className="pg-authcard">
      <div className="pg-authcard__head">
        <span className="pg-auth__mark">
          <GuardMark className="w-11 h-11" />
        </span>
        <h1 id={titleId} className="pg-authcard__title">
          {isVerify
            ? 'Verify your email'
            : isSignUp
              ? 'Create your account'
              : 'Sign in to PromptGuard'}
        </h1>
        <p className="pg-authcard__sub">
          {isVerify
            ? 'Enter the code we emailed you to finish setting up the account.'
            : 'Scanning works without an account. Sign in to keep your scan history.'}
        </p>
      </div>

      <div className="pg-panel pg-authcard__panel">
        {!isVerify && (
          <div className="pg-authcard__tabs">
            <div className="pg-segment" role="tablist" aria-label="Authentication mode">
              <button
                type="button"
                role="tab"
                aria-selected={!isSignUp}
                onClick={() => switchMode('signin')}
                className="pg-segment__tab"
              >
                Sign in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isSignUp}
                onClick={() => switchMode('signup')}
                className="pg-segment__tab"
              >
                Create account
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="pg-authcard__body">
          <div className="pg-formstack">
            <div className="pg-field-group">
              <label htmlFor="pg-email" className="pg-label">
                Email
              </label>
              <Input
                id="pg-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                required
                readOnly={isVerify}
                className="pg-field"
              />
            </div>

            {!isVerify && (
              <div className="pg-field-group">
                <label htmlFor="pg-password" className="pg-label">
                  Password
                </label>
                <div className="pg-field-wrap">
                  <Input
                    id="pg-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={isSignUp ? 'At least 6 characters' : 'Enter your password'}
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    required
                    minLength={6}
                    aria-describedby={isSignUp ? 'pg-password-hint' : undefined}
                    className="pg-field pg-field--action"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="pg-field-action"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {isSignUp && (
                  <p id="pg-password-hint" className="pg-hint">
                    Use at least 6 characters.
                  </p>
                )}
              </div>
            )}

            {isVerify && (
              <div className="pg-field-group">
                <label htmlFor="pg-otp" className="pg-label">
                  Verification code
                </label>
                <Input
                  id="pg-otp"
                  type="text"
                  inputMode="numeric"
                  value={otpCode}
                  onChange={(event) => setOtpCode(event.target.value)}
                  placeholder="6-digit code"
                  autoComplete="one-time-code"
                  required
                  className="pg-field pg-mono"
                />
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="pg-btn pg-btn--text pg-authcard__resend"
                >
                  Send a new code
                </button>
              </div>
            )}

            {notice && (
              <p className="pg-hint pg-hint--notice" role="status">
                {notice}
              </p>
            )}

            {error && (
              <div className="pg-alert" data-tone="critical" role="alert">
                <AlertTriangle className="w-4 h-4 flex-none mt-0.5" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="pg-alert__title">
                    {isVerify
                      ? 'Verification failed'
                      : isSignUp
                        ? 'Could not create account'
                        : 'Could not sign in'}
                  </p>
                  <p className="pg-alert__body">{error}</p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="pg-btn pg-btn--primary pg-btn--lg pg-btn--block"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 pg-spin" aria-hidden="true" />
                  Working…
                </>
              ) : (
                <>
                  {isVerify ? 'Verify and sign in' : isSignUp ? 'Create account' : 'Sign in'}
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </Button>

            {!isVerify && (
              <>
                <div className="pg-divider">or</div>

                <Button
                  type="button"
                  onClick={handleGoogle}
                  disabled={loading}
                  className="pg-btn pg-btn--lg pg-btn--block pg-btn--google"
                >
                  <GoogleMark />
                  Continue with Google
                </Button>
              </>
            )}
          </div>
        </form>

        <p className="pg-authcard__foot">
          Signing in saves your scan history to your account.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Dashboard
 * ------------------------------------------------------------------ */

function Dashboard({ user, demo, onNewScan, onViewScan, onLogin, onLogout }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  const fetchScans = useCallback(async () => {
    try {
      const data = await Scan.list('-created_date');
      setScans(data || []);
      setNow(Date.now());
    } catch (error) {
      console.error('Failed to load scans:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  /* Keep the log honest while a scan is still running in another view. */
  useEffect(() => {
    let unsubscribe;
    try {
      unsubscribe = Scan.subscribe(() => fetchScans());
    } catch (error) {
      console.error('Scan subscription unavailable:', error);
    }
    return () => unsubscribe?.();
  }, [fetchScans]);

  const stats = useMemo(() => {
    const total = scans.length;
    const flagged = scans.filter((scan) => scan.findingCount > 0).length;
    const clear = scans.filter((scan) => scan.status === 'complete' && !scan.findingCount).length;
    const findings = scans.reduce((sum, scan) => sum + (scan.findingCount || 0), 0);
    return { total, flagged, clear, findings };
  }, [scans]);

  const lastScan = scans[0]?.created_date;

  return (
    <AppShell
      background={<PremiumAnimatedBackground />}
      header={
        <AppHeader subtitle="Security dashboard">
          {user ? (
            <>
              <span className="pg-user">
                <span className="pg-dot" data-tone="clean" aria-hidden="true" />
                <span className="pg-truncate">{user.email}</span>
              </span>
              <button type="button" onClick={onLogout} className="pg-iconbtn" aria-label="Sign out">
                <LogOut className="w-[18px] h-[18px]" aria-hidden="true" />
              </button>
            </>
          ) : (
            <button type="button" onClick={onLogin} className="pg-btn pg-btn--sm">
              <Lock className="w-[14px] h-[14px]" aria-hidden="true" />
              Sign in
            </button>
          )}
        </AppHeader>
      }
    >
      <DashboardHero
        signedIn={Boolean(user)}
        lastScanLabel={lastScan ? formatRelative(lastScan, now) : 'None yet'}
        coverageCount={CATEGORY_KEYS.length}
        showHistoryLink={stats.total > 0}
        onNewScan={onNewScan}
        demo={demo}
      />

      <section className="pg-block" aria-label="Scan statistics">
        <div className="pg-stats">
          <StatTile
            tone="brand"
            icon={Activity}
            label="Total scans"
            value={stats.total}
            meta="Lifetime submissions"
            ratio={stats.total ? 1 : 0}
          />
          <StatTile
            tone="high"
            icon={AlertTriangle}
            label="Flagged"
            value={stats.flagged}
            meta="Scans with findings"
            ratio={stats.total ? stats.flagged / stats.total : 0}
          />
          <StatTile
            tone="clean"
            icon={ShieldCheck}
            label="Clear"
            value={stats.clear}
            meta="No risk detected"
            ratio={stats.total ? stats.clear / stats.total : 0}
          />
          <StatTile
            tone="critical"
            icon={Search}
            label="Findings"
            value={stats.findings}
            meta="Individual issues"
            ratio={stats.findings ? Math.min(1, stats.findings / Math.max(stats.total * 3, 1)) : 0}
          />
        </div>
      </section>

      <section className="pg-block pg-block--lg" id="pg-history" aria-labelledby="pg-history-head">
        <SectionHead label="Recent scans" id="pg-history-head">
          {!loading && stats.total > 0 && <Chip>{plural(stats.total, 'scan')}</Chip>}
        </SectionHead>

        <ScanLog
          scans={scans}
          loading={loading}
          onOpen={onViewScan}
          onNewScan={onNewScan}
          onRunDemo={demo?.onRun}
        />
      </section>
    </AppShell>
  );
}

/* ------------------------------------------------------------------ *
 * New scan
 * ------------------------------------------------------------------ */

function NewScan({ onBack, onCreated }) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const promptRef = useRef(null);
  const submitGuard = useRef(false);

  const ready = Boolean(prompt.trim());

  /* A sample fills the form and hands focus to it — it never submits. */
  const handleSampleSelect = useCallback((text) => {
    setPrompt(text);
    const field = promptRef.current;
    if (!field) return;
    field.focus();
    const end = text.length;
    field.setSelectionRange?.(end, end);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitGuard.current || !prompt.trim()) return;

    submitGuard.current = true;
    setSubmitting(true);
    setError('');

    try {
      const scan = await Scan.create({
        prompt: prompt.trim(),
        response: response.trim() || undefined,
        status: 'pending',
      });

      /* Run through the deployed function endpoint; report polling/realtime
         continues while the request is in flight. */
      void triggerAnalysis(scan.id).catch(async (err) => {
        console.error('Analysis trigger failed:', err);
        await markAnalysisTriggerError(scan.id, err);
      });

      onCreated(scan.id);
    } catch (err) {
      setError(err?.message || 'Failed to create the scan.');
      setSubmitting(false);
      submitGuard.current = false;
    }
  };

  return (
    <AppShell
      narrow
      background={<PremiumAnimatedBackground />}
      header={<AppHeader onBack={onBack} subtitle="New scan" />}
    >
      <div className="pg-pagehead">
        <span className="pg-eyebrow">
          <Activity className="w-3.5 h-3.5" aria-hidden="true" />
          Submit for analysis
        </span>
        <h1 className="pg-h1 pg-h1--page">New scan</h1>
        <p className="pg-lead">
          Paste the prompt you want inspected. Add the model&apos;s response to widen the
          surface — both sides are analysed.
        </p>
      </div>

      <DemoAttackSelector samples={SAMPLE_PROMPTS} onSelectPrompt={handleSampleSelect} />

      <form onSubmit={handleSubmit} className="pg-formstack">
        <div className="pg-composer pg-composer--primary">
          <div className="pg-composer__head">
            <FileText className="w-4 h-4 flex-none" aria-hidden="true" />
            <span>Prompt</span>
            <span className="pg-composer__flag" data-required="true">
              <span className="pg-dot" data-tone="brand" aria-hidden="true" />
              Required
            </span>
          </div>
          <label htmlFor="pg-prompt" className="sr-only">
            Prompt to analyse
          </label>
          <textarea
            id="pg-prompt"
            ref={promptRef}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Paste the prompt sent to your model…"
            required
            rows={8}
            spellCheck="false"
            className="pg-composer__area"
          />
          <div className="pg-composer__foot">
            <span className="pg-composer__status" data-ready={ready ? 'true' : 'false'}>
              {ready ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 flex-none" aria-hidden="true" />
                  Ready to analyse
                </>
              ) : (
                'Enter a prompt to continue'
              )}
            </span>
            {prompt.length > 0 && (
              <span className="pg-num pg-composer__count">
                {plural(prompt.length, 'character')}
              </span>
            )}
          </div>
        </div>

        <div className="pg-composer">
          <div className="pg-composer__head">
            <MessageSquare className="w-4 h-4 flex-none" aria-hidden="true" />
            <span>Model response</span>
            <span className="pg-composer__flag">Optional</span>
          </div>
          <label htmlFor="pg-response" className="sr-only">
            Model response to analyse
          </label>
          <textarea
            id="pg-response"
            value={response}
            onChange={(event) => setResponse(event.target.value)}
            placeholder="Paste the model output to analyse it too…"
            rows={5}
            spellCheck="false"
            className="pg-composer__area"
          />
          <div className="pg-composer__foot">
            <span className="pg-composer__status">
              {response.trim() ? 'Included in this scan' : 'Not included — optional'}
            </span>
            {response.length > 0 && (
              <span className="pg-num pg-composer__count">
                {plural(response.length, 'character')}
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="pg-alert" data-tone="critical" role="alert">
            <AlertTriangle className="w-4 h-4 flex-none mt-0.5" aria-hidden="true" />
            <div className="min-w-0">
              <p className="pg-alert__title">Scan could not be created</p>
              <p className="pg-alert__body">{error}</p>
            </div>
          </div>
        )}

        <div className="pg-actions">
          <Button
            type="submit"
            disabled={submitting || !ready}
            className="pg-btn pg-btn--primary pg-btn--xl pg-btn--block"
          >
            {submitting ? (
              <>
                <Loader2 className="w-[18px] h-[18px] pg-spin" aria-hidden="true" />
                Starting analysis…
              </>
            ) : (
              <>
                <ShieldCheck className="w-[18px] h-[18px]" aria-hidden="true" />
                Analyse prompt
              </>
            )}
          </Button>
          <p className="pg-actions__hint">
            {ready
              ? 'Findings stream into the report as they are detected.'
              : 'Add a prompt above to enable analysis.'}
          </p>
        </div>
      </form>
    </AppShell>
  );
}

/* ------------------------------------------------------------------ *
 * Results
 * ------------------------------------------------------------------ */

function Results({ scanId, isDemo, onBack, onNewScan }) {
  const [scan, setScan] = useState(null);
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  const aliveRef = useRef(true);
  const timersRef = useRef([]);
  const lookupsRef = useRef(0);
  const seqRef = useRef(0);
  const appliedRef = useRef(0);

  const load = useCallback(async () => {
    const seq = (seqRef.current += 1);

    const [scanData, findingData] = await Promise.all([
      Scan.get(scanId).catch(() => null),
      Finding.filter({ scanId }).catch(() => []),
    ]);

    if (!aliveRef.current || seq < appliedRef.current) return;
    appliedRef.current = seq;

    /* A scan created a moment ago may not be readable yet — back off and retry
       rather than declaring it missing. */
    if (!scanData) {
      lookupsRef.current += 1;
      if (lookupsRef.current < MAX_LOOKUPS) {
        const delay = Math.min(400 * 1.6 ** lookupsRef.current, 3000);
        timersRef.current.push(setTimeout(load, delay));
        return;
      }
      setMissing(true);
      setLoading(false);
      return;
    }

    setScan(scanData);
    setFindings(findingData || []);
    setLoading(false);
  }, [scanId]);

  /* Reset per report, and cancel everything in flight on the way out. */
  useEffect(() => {
    aliveRef.current = true;
    lookupsRef.current = 0;
    appliedRef.current = 0;
    setLoading(true);
    setMissing(false);
    setScan(null);
    setFindings([]);
    load();

    return () => {
      aliveRef.current = false;
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [load]);

  /* Realtime: findings appear as the analyser writes them and the scan row
     moves pending → analyzing → complete. Events are app-wide, so filter. */
  useEffect(() => {
    let unsubFindings;
    let unsubScan;
    try {
      unsubFindings = Finding.subscribe((event) => {
        if (event?.data?.scanId === scanId) load();
      });
      unsubScan = Scan.subscribe((event) => {
        if (event?.id === scanId) load();
      });
    } catch (error) {
      console.error('Realtime unavailable, falling back to polling:', error);
    }
    return () => {
      unsubFindings?.();
      unsubScan?.();
    };
  }, [scanId, load]);

  /* Fallback poll while the run is open, so a dropped socket never strands the
     report. Reads only — it never re-invokes the analysis. */
  const status = scan?.status;
  useEffect(() => {
    if (!status || status === 'complete' || status === 'error') return undefined;
    const interval = setInterval(load, POLL_INTERVAL_MS);
    const ceiling = setTimeout(() => clearInterval(interval), POLL_CEILING_MS);
    return () => {
      clearInterval(interval);
      clearTimeout(ceiling);
    };
  }, [status, load]);

  const header = (
    <AppHeader onBack={onBack} subtitle={scan ? `Report · ${shortId(scan.id)}` : 'Report'}>
      <Button
        type="button"
        onClick={onNewScan}
        aria-label="Start a new scan"
        className="pg-btn pg-btn--primary pg-btn--sm"
      >
        <Plus className="w-4 h-4" aria-hidden="true" />
        <span className="hidden sm:inline">New scan</span>
      </Button>
    </AppHeader>
  );

  if (loading) {
    return (
      <AppShell narrow background={<PremiumAnimatedBackground />} header={header}>
        <LoadBar icon={Loader2} label="Loading report…" />
        <ReportSkeleton />
      </AppShell>
    );
  }

  if (missing || !scan) {
    return (
      <AppShell narrow background={<PremiumAnimatedBackground />} header={header}>
        <EmptyState
          tone="critical"
          icon={XCircle}
          title="Scan not found"
          body="This report is unavailable or the scan no longer exists."
        >
          <Button type="button" onClick={onNewScan} className="pg-btn pg-btn--primary pg-btn--lg">
            <Plus className="w-[17px] h-[17px]" aria-hidden="true" />
            Run a new scan
          </Button>
          <Button type="button" onClick={onBack} className="pg-btn pg-btn--lg">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to dashboard
          </Button>
        </EmptyState>
      </AppShell>
    );
  }

  return (
    <AppShell narrow background={<PremiumAnimatedBackground />} header={header}>
      <ScanReport scan={scan} findings={findings} isDemo={isDemo} />

      <div className="pg-endnav">
        <Button type="button" onClick={onNewScan} className="pg-btn pg-btn--primary pg-btn--lg">
          <Plus className="w-[17px] h-[17px]" aria-hidden="true" />
          Run another scan
        </Button>
        <Button type="button" onClick={onBack} className="pg-btn pg-btn--lg">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to dashboard
        </Button>
      </div>
    </AppShell>
  );
}

/* ------------------------------------------------------------------ *
 * Controller
 * ------------------------------------------------------------------ */

export default function App() {
  const [view, setView] = useState(() => (
    new URLSearchParams(window.location.search).get('view') === VIEWS.WRITE_UP
      ? VIEWS.WRITE_UP
      : VIEWS.DASHBOARD
  ));
  const [selectedScanId, setSelectedScanId] = useState(null);
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  /* One demo scan per session: after the first run the button reopens it
     instead of paying for another analysis. */
  const [demoScanId, setDemoScanId] = useState(null);
  const [demoStatus, setDemoStatus] = useState('idle');
  const [demoError, setDemoError] = useState('');
  const demoGuard = useRef(false);

  const authTitleId = useId();
  const firstRender = useRef(true);

  const syncUser = useCallback(async () => {
    try {
      const me = await base44.auth.me();
      setUser(me || null);
    } catch {
      /* Anonymous is a supported state, not an error. */
      setUser(null);
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    syncUser();
  }, [syncUser]);

  /* State routing owns the document title and focus, the way a router would. */
  useEffect(() => {
    document.title = PAGE_TITLES[view] || PAGE_TITLES[VIEWS.DASHBOARD];

    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
    document.getElementById('pg-main')?.focus({ preventScroll: true });
  }, [view, selectedScanId]);

  const openScan = useCallback((id) => {
    setSelectedScanId(id);
    setView(VIEWS.RESULTS);
  }, []);

  const runDemoScan = useCallback(async () => {
    if (demoGuard.current) return;

    /* Already ran this session — reopen, don't re-analyse. */
    if (demoScanId) {
      openScan(demoScanId);
      return;
    }

    demoGuard.current = true;
    setDemoStatus('running');
    setDemoError('');

    try {
      const scan = await Scan.create({ prompt: DEMO_SAMPLE.text, status: 'pending' });
      setDemoScanId(scan.id);
      setDemoStatus('ready');

      void triggerAnalysis(scan.id).catch(async (err) => {
        console.error('Analysis trigger failed:', err);
        await markAnalysisTriggerError(scan.id, err);
      });

      openScan(scan.id);
    } catch (err) {
      setDemoStatus('error');
      setDemoError(err?.message || 'Could not start the demo scan.');
    } finally {
      demoGuard.current = false;
    }
  }, [demoScanId, openScan]);

  const handleAuthenticated = useCallback(() => {
    setShowAuth(false);
    syncUser();
  }, [syncUser]);

  const handleLogout = useCallback(() => {
    try {
      /* Server-side logout clears the session cookie and returns here. */
      base44.auth.logout(window.location.href);
    } catch (error) {
      console.error('Sign out failed:', error);
      setUser(null);
      setView(VIEWS.DASHBOARD);
    }
  }, []);

  const closeAuth = useCallback(() => setShowAuth(false), []);

  const demo = useMemo(
    () => ({
      status: demoStatus,
      errorMessage: demoError,
      sampleLabel: DEMO_SAMPLE.label.toLowerCase(),
      onRun: runDemoScan,
    }),
    [demoStatus, demoError, runDemoScan]
  );

  if (initializing) {
    return (
      <div className="pg-app">
        <PremiumAnimatedBackground />
        <div className="pg-boot">
          <Loader2 className="w-8 h-8 pg-spin" aria-hidden="true" />
          <p>Starting PromptGuard…</p>
        </div>
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <SkipLink />

      {view === VIEWS.WRITE_UP && <WriteUpPage />}

      {view === VIEWS.DASHBOARD && (
        /* Remount on identity change so the log reflects the session. */
        <Dashboard
          key={user?.id || 'anonymous'}
          user={user}
          demo={demo}
          onNewScan={() => setView(VIEWS.NEW_SCAN)}
          onViewScan={openScan}
          onLogin={() => setShowAuth(true)}
          onLogout={handleLogout}
        />
      )}

      {view === VIEWS.NEW_SCAN && (
        <NewScan onBack={() => setView(VIEWS.DASHBOARD)} onCreated={openScan} />
      )}

      {view === VIEWS.RESULTS && (
        <Results
          scanId={selectedScanId}
          isDemo={Boolean(demoScanId) && selectedScanId === demoScanId}
          onBack={() => setView(VIEWS.DASHBOARD)}
          onNewScan={() => setView(VIEWS.NEW_SCAN)}
        />
      )}

      {showAuth && (
        <Modal onClose={closeAuth} labelledBy={authTitleId}>
          <AuthForm onAuthenticated={handleAuthenticated} titleId={authTitleId} />
        </Modal>
      )}
    </MotionConfig>
  );
}
