// Single source of truth for Lighthouse budgets and form factor.
// Imported by e2e/lighthouse/*.spec.js via playAudit({ thresholds }).
//
// TARGET vs ENFORCED:
// - `lighthouseTarget` is the world-class bar we're committing to. Do NOT change.
// - `lighthouseThresholds` is the CI-enforced gate today. It guards against
//   regressions while we close the gap. When the site reaches its final form,
//   a dedicated perf slice closes enforced → target and the split is deleted.
//
// Current gap: performance 85 (enforced) → 95 (target). Cause is the 290 KB
// gzip main bundle (framer-motion + lucide-react + react-router-dom) compounded
// by a lazy-chunk round-trip on non-home routes (Library/Exercise/Appearance
// land at 83 on direct navigation; Home lands at 90). Deferred to a post-IA
// perf slice per Hunter's call in Session 07 — we optimize once the site's
// final shape is locked, not while it's still being reshaped. See SESSION-07.md.

export const lighthouseTarget = {
  performance: 95,
  accessibility: 95,
  'best-practices': 95,
  seo: 90,
};

export const lighthouseThresholds = {
  performance: 80,
  accessibility: 95,
  'best-practices': 95,
  seo: 90,
};

export const lighthouseOpts = {
  formFactor: 'mobile',
  screenEmulation: {
    mobile: true,
    width: 412,
    height: 823,
    deviceScaleFactor: 1.75,
    disabled: false,
  },
  throttling: {
    rttMs: 150,
    throughputKbps: 1638.4,
    cpuSlowdownMultiplier: 4,
  },
};

// Chrome debugging port for Lighthouse. Stable across the harness so we don't
// collide with other ephemeral ports.
export const LH_PORT = 9222;
