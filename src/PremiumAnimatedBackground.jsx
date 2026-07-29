/**
 * Static structural backdrop.
 *
 * PromptGuard uses a Firecrawl-inspired editorial grid: quiet off-white paper,
 * fine modular rules, and no animation, canvas, particles, or colour washes.
 * It is intentionally decorative only and never affects product interactions.
 */
export default function PremiumAnimatedBackground() {
  return <div className="pg-fire-grid" aria-hidden="true" />;
}
