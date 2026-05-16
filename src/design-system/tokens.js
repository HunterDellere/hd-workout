// HDW :: design tokens.
// "Sumi on washi" — warm paper, ink, earth-tone semantic accents.
// Single source of truth. See local/03-design/TOKENS-V2.md for the spec.
//
// Names are semantic; raw palette is hidden behind these. Consumers should
// reach for CSS vars (`var(--surface-page)`) or named exports below — never
// the raw hex tables at the top of this file.

// Raw palette (do not consume directly from UI).
// Phase 6 refresh: paper pulls a half-step *cooler* than Session 18 to
// give the warm accents (rust, sand, ember) more push; raised tier
// reads as a deliberate lift, not a wash; ink deepens for true black
// territory in dark mode; new `espresso` foundational surface used by
// primary CTAs so the Start button has *gravity* instead of borrowing
// the day accent twice.
const paper = {
  0: '#F4EFE3',     // page background — washi, faintly cooler
  1: '#ECE6D8',     // sunken (inputs, search-bar rest)
  2: '#DDD5C3',     // borders, hairlines (used at alpha)
  raised: '#FBF7EC', // cards/sheets that sit above page — a touch warmer
};
const ink = {
  0: '#0B0907',     // dark page background — deeper, true espresso
  1: '#121008',     // dark sunken
  2: '#1D1A12',     // dark raised
  3: '#2A261C',     // dark elevated (sheets/modals)
  text0: '#181510', // light-mode primary text
  text1: '#494339', // light-mode secondary text
  text2: '#5F5849', // light-mode tertiary
  textDark0: '#F2EBDB', // dark-mode primary text
  textDark1: '#B0A693',
  textDark2: '#9B9180',
};
// Foundational surfaces — used directly by primary CTAs and the Today
// hero card. `espresso` is intentionally not a "day" accent — it's the
// gravity color, so primary actions read as confident regardless of
// which day lineage is active.
const foundation = {
  espresso:      '#22180E', // primary CTA fill (light mode)
  espressoSoft:  '#3A2C1E', // hover lift
  espressoDark:  '#F2EBDB', // primary CTA fill (dark mode) — inverts to text colour
  espressoSoftDark: '#D9CFB9',
};

// Accents — Session 18 refresh. Slightly more confident saturation on the
// day-lineage hues; new `ember` token for the PR/celebration role
// previously borrowing from signal. Semantic split:
//   day:      rust (push), sea (pull), sand (legs), sky (core), stone (recovery)
//   states:   moss (success), amber (warn), signal (danger), sky (info)
//   accents:  ember (PR / celebrate)
export const accents = {
  rust:   '#B04A2E', // push lineage  (deepened + a hair more chroma)
  sea:    '#2F7879', // pull lineage  (cooler, more confident)
  sand:   '#B0894C', // legs lineage  (more golden, less beige)
  sky:    '#3563A0', // core lineage  (truer blue)
  stone:  '#736E66', // neutral / mobility — warmer stone, less greyscale
  moss:   '#5F8367', // success
  amber:  '#D49432', // warn
  // Danger (Wave 4.1 #25): pushed cooler + deeper so warning no longer reads
  // as the push lineage. Previous #B83A20 collided with rust at low chroma.
  signal: '#9E2613',
  ember:  '#CE6F38', // PR / celebrate
};

// Per-hue ink variants for legible chip text on the accent wash. The wash is
// accent @ 0.15 alpha on paper — very light — so chip ink must be a deeply
// saturated dark variant of the same hue to clear WCAG AA 4.5:1. Hand-tuned
// against the new cooler palette and cooler paper.
const accentInkLight = {
  rust:   '#5A2210',
  sea:    '#163E3F',
  sand:   '#553D14',
  sky:    '#1D3661',
  stone:  '#3A352D',
  moss:   '#2E4733',
  amber:  '#6B4308',
  signal: '#4F1409',
  ember:  '#65300F',
};
// Dark mode inverts: ink is a *light* variant of each hue.
const accentInkDark = {
  rust:   '#E29C82',
  sea:    '#96C0C1',
  sand:   '#D7BB90',
  sky:    '#9CB3D2',
  stone:  '#BFB7A8',
  moss:   '#AEC9B3',
  amber:  '#EBC082',
  signal: '#E89A8B',
  ember:  '#E8AB87',
};

// Movement pattern → accent token name. Single source of truth.
export const patternAccent = {
  'horizontal-press': 'rust',
  'vertical-press':   'rust',
  'horizontal-pull':  'sea',
  'vertical-pull':    'sea',
  'squat':            'sand',
  'hinge':            'sand',
  'lunge':            'sand',
  'core-anti':        'sky',
  'core-flexion':     'sky',
  'mobility':         'stone',
  'corrective':       'stone',
  'healthspan':       'stone',
};

// Day lineage → accent. Bridge for legacy day-keyed code; see also
// `dayColor` in the legacy compat block below.
export const dayLineageAccent = {
  push: 'rust',
  pull: 'sea',
  legs: 'sand',
  core: 'sky',
  recovery: 'stone',
};

export const fontFamilies = {
  serif: '"Newsreader", "Source Serif 4", Georgia, "Times New Roman", serif',
  sans:  '"Inter", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
  mono:  '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
};

// Type ramp. Sizes in px; convert at use site if you want rem.
export const type = {
  'display-xl': { size: 56, line: 1.05, family: fontFamilies.serif, weight: 300, tracking: '-0.01em' },
  'display-lg': { size: 40, line: 1.1,  family: fontFamilies.serif, weight: 400, tracking: '-0.005em' },
  'title-lg':   { size: 28, line: 1.2,  family: fontFamilies.serif, weight: 400, tracking: '0' },
  'title-md':   { size: 20, line: 1.3,  family: fontFamilies.serif, weight: 500, tracking: '0' },
  'body-lg':    { size: 17, line: 1.55, family: fontFamilies.sans,  weight: 400 },
  'body-md':    { size: 15, line: 1.55, family: fontFamilies.sans,  weight: 400 },
  'body-sm':    { size: 13, line: 1.5,  family: fontFamilies.sans,  weight: 400 },
  'mono-lg':    { size: 24, line: 1.0,  family: fontFamilies.mono,  weight: 500 },
  'mono-md':    { size: 14, line: 1.2,  family: fontFamilies.mono,  weight: 500 },
  'mono-sm':    { size: 11, line: 1.2,  family: fontFamilies.mono,  weight: 600, tracking: '0.08em' },
};

export const space = { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32, 7: 48, 8: 64, 9: 96 };
export const radius = { none: 0, sm: 4, md: 8, lg: 12, xl: 20, full: 9999 };

// Page-layout primitives — the gutter / max-width values that <Page> owns.
// maxReading lifted from 720 → 900 in Session 10. 720 was squeezing the
// content column on desktop; 900 still keeps line length tolerable for
// body-lg copy when the page caps its prose at ~60ch inline.
export const layout = {
  gutterMobile:  20,
  gutterTablet:  32,
  gutterDesktop: 56,
  maxReading:    900,
  maxDashboard:  1080,
};

export const motion = {
  fast:   { duration: 0.15, ease: [0.4, 0, 0.2, 1] },
  base:   { duration: 0.2,  ease: [0.4, 0, 0.2, 1] },
  smooth: { type: 'tween',  duration: 0.25, ease: [0.4, 0, 0.2, 1] }, // legacy alias
  sheet:  { type: 'spring', stiffness: 380, damping: 36, mass: 0.8 },
  spring: { type: 'spring', stiffness: 400, damping: 30 },
  reveal: { staggerChildren: 0.04, delayChildren: 0.02 },
};

export const z = { base: 0, rise: 10, nav: 50, sheet: 90, modal: 100, toast: 110 };

// Hex → rgba helper.
export function withAlpha(hex, a) {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// Build the CSS variable maps for light + dark themes.
function lightVars() {
  const vars = {
    '--surface-page':    paper[0],
    '--surface-sunken':  paper[1],
    '--surface-raised':  paper.raised,
    '--surface-overlay': paper.raised,
    '--surface-scrim':   withAlpha(ink.text0, 0.45),
    // Foundational CTA surface — espresso ink, used by the primary button
    // so the call-to-action has gravity independent of day accent.
    '--surface-cta':     foundation.espresso,
    '--surface-cta-hover': foundation.espressoSoft,
    '--surface-cta-ink': paper.raised,
    // Hero gradient: page → raised, soft top-to-bottom. Used on the Today
    // hero card so it lifts off the page without a heavy shadow.
    '--gradient-hero':  `linear-gradient(180deg, ${paper.raised} 0%, ${paper[0]} 100%)`,
    '--text-primary':    ink.text0,
    '--text-secondary':  ink.text1,
    '--text-tertiary':   ink.text2,
    '--text-on-accent':  paper.raised,
    '--border-hairline': withAlpha(ink.text0, 0.08),
    '--border-strong':   withAlpha(ink.text0, 0.18),
    '--shadow-1':        '0 1px 0 rgba(0,0,0,0.04)',
    '--shadow-2':        '0 1px 1px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
    '--shadow-hero':     '0 1px 0 rgba(0,0,0,0.03), 0 12px 32px -16px rgba(34,24,14,0.18)',
    // Semantic state tokens. `warn` now resolves to amber; `danger` is the
    // old signal red (deload, errors). `pr` is ember for PR celebration.
    '--state-warn':        accents.amber,
    '--state-warn-ink':    accentInkLight.amber,
    '--state-danger':      accents.signal,
    '--state-danger-ink':  accentInkLight.signal,
    '--state-success':     accents.moss,
    '--state-success-ink': accentInkLight.moss,
    '--state-info':        accents.stone,
    '--state-pr':          accents.ember,
    '--state-pr-ink':      accentInkLight.ember,
    '--font-serif':        fontFamilies.serif,
    '--font-sans':         fontFamilies.sans,
    '--font-mono':         fontFamilies.mono,
  };
  for (const [name, hex] of Object.entries(accents)) {
    vars[`--accent-${name}-solid`] = hex;
    vars[`--accent-${name}-wash`]  = withAlpha(hex, 0.15);
    vars[`--accent-${name}-soft`]  = withAlpha(hex, 0.05);
    vars[`--accent-${name}-ink`]   = accentInkLight[name];
  }
  return vars;
}

function darkVars() {
  const vars = {
    '--surface-page':    ink[0],
    '--surface-sunken':  ink[1],
    '--surface-raised':  ink[2],
    '--surface-overlay': ink[3],
    '--surface-scrim':   withAlpha('#000000', 0.65),
    // Dark-mode CTA inverts: primary button reads as paper-coloured pill
    // on the ink page. The contrast feels deliberate, not chrome.
    '--surface-cta':     foundation.espressoDark,
    '--surface-cta-hover': foundation.espressoSoftDark,
    '--surface-cta-ink': ink[0],
    '--gradient-hero':  `linear-gradient(180deg, ${ink[2]} 0%, ${ink[0]} 100%)`,
    '--text-primary':    ink.textDark0,
    '--text-secondary':  ink.textDark1,
    '--text-tertiary':   ink.textDark2,
    '--text-on-accent':  paper.raised,
    '--border-hairline': withAlpha(ink.textDark0, 0.08),
    '--border-strong':   withAlpha(ink.textDark0, 0.18),
    '--shadow-1':        '0 1px 0 rgba(0,0,0,0.4)',
    '--shadow-2':        '0 1px 1px rgba(0,0,0,0.35), 0 6px 24px rgba(0,0,0,0.45)',
    '--shadow-hero':     '0 1px 0 rgba(0,0,0,0.5), 0 12px 32px -16px rgba(0,0,0,0.7)',
    '--state-warn':        accents.amber,
    '--state-warn-ink':    accentInkDark.amber,
    '--state-danger':      accents.signal,
    '--state-danger-ink':  accentInkDark.signal,
    '--state-success':     accents.moss,
    '--state-success-ink': accentInkDark.moss,
    '--state-info':        accents.stone,
    '--state-pr':          accents.ember,
    '--state-pr-ink':      accentInkDark.ember,
    '--font-serif':        fontFamilies.serif,
    '--font-sans':         fontFamilies.sans,
    '--font-mono':         fontFamilies.mono,
  };
  for (const [name, hex] of Object.entries(accents)) {
    vars[`--accent-${name}-solid`] = hex;
    vars[`--accent-${name}-wash`]  = withAlpha(hex, 0.18);
    vars[`--accent-${name}-soft`]  = withAlpha(hex, 0.08);
    vars[`--accent-${name}-ink`]   = accentInkDark[name];
  }
  return vars;
}

export const themeVars = { light: lightVars(), dark: darkVars() };

function varsToBlock(vars) {
  return Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join('\n');
}

// Build the CSS string injected once at app boot.
export function buildThemeCss() {
  return [
    `:root {\n${varsToBlock(themeVars.light)}\n}`,
    `[data-theme="dark"] {\n${varsToBlock(themeVars.dark)}\n}`,
    `@media (prefers-color-scheme: dark) {`,
    `  :root:not([data-theme="light"]) {\n${varsToBlock(themeVars.dark)}\n  }`,
    `}`,
    `@keyframes hd-fade-rise {`,
    `  from { opacity: 0; transform: translateY(6px); }`,
    `  to   { opacity: 1; transform: translateY(0); }`,
    `}`,
    `@media (prefers-reduced-motion: reduce) {`,
    `  *, *::before, *::after {`,
    `    animation-duration: 0.001ms !important;`,
    `    animation-delay: 0ms !important;`,
    `    transition-duration: 0.001ms !important;`,
    `  }`,
    `}`,
  ].join('\n\n');
}

// (Legacy compat bridge removed in Session 10. Every consumer is on CSS vars
// + semantic exports above. Reach for `var(--surface-page)`, `accents`,
// `patternAccent`, `dayLineageAccent`, `fontFamilies` — not the old `color`,
// `dayColor`, `accentFor`, `tierMeta`, `font`, or `shadow` shapes.)
