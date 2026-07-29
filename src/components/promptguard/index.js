/**
 * PromptGuard presentation layer.
 *
 * Every module re-exported here renders from props alone: no Base44 client, no
 * browser storage, no timers, no network. That is what makes the product UI
 * reusable outside the app (design previews today, a Remotion composition
 * later) — see docs/internal/PRESENTATION_LAYER.md.
 */

export {
  AppShell,
  AppHeader,
  SkipLink,
  SectionHead,
  Badge,
  Chip,
  StatusBanner,
  EmptyState,
  LogSkeleton,
  ReportSkeleton,
  LoadBar,
} from './primitives';

export { GuardMark, GoogleMark, CATEGORY_ICONS, categoryIcon, scanIcon } from './icons';
export { DashboardHero, DemoLaunch } from './DashboardHero';
export { StatTile } from './StatTile';
export { ScanLog, ScanLogRow } from './ScanLog';
export { FindingCard } from './FindingCard';
export { ScanReport } from './ScanReport';
export { SamplePicker } from './SamplePicker';
export { WriteUpPage } from './WriteUpPage';

export {
  pad2,
  plural,
  shortId,
  formatStamp,
  formatRelative,
  sortFindings,
  countBySeverity,
  worstSeverity,
  scanTone,
} from './format';
