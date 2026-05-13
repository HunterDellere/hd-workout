// HDW :: design tokens.
// "Sumi on washi" — warm paper, ink, earth-tone semantic accents.
// Single source of truth. See local/03-design/TOKENS-V2.md for the spec.
//
// Names are semantic; raw palette is hidden behind these. Consumers should
// reach for CSS vars (`var(--surface-page)`) or named exports below — never
// the raw hex tables at the top of this file.

// Raw palette (do not consume directly from UI).
// Paper cooled from #FAF7F2 → #F6F4EF in Session 10 (less creamy, more neutral).
const paper = {
  0: '#F6F4EF', // page background
  1: '#EEEBE4', // sunken (inputs, search-bar rest)
  2: '#E4E0D7', // borders, hairlines (used at alpha)
};
const ink = {
  0: '#13110E', // dark page background
  1: '#1B1916', // dark sunken
  2: '#262320', // dark raised
  text0: '#1A1814', // light-mode primary text
  text1: '#4A453E', // light-mode secondary text
  // text2: tertiary. Lifted from #6E6A61 — mono-sm eyebrows were fading at the
  // old value; new value still clears AA on paper (#F6F4EF) at ≥ 4.5:1.
  text2: '#5C5851',
  textDark0: '#EDE8DF', // dark-mode primary text
  textDark1: '#A8A299', // dark-mode secondary text
  // textDark2: lifted from #8E887D so dark-mode eyebrows match the new
  // light-mode contrast.
  textDark2: '#9E988D',
};

// Accents — Session 10 rework. Cooler, less brown; stone / sky / sea family.
// Names map to semantic roles: rust (push), sea (pull), sand (legs), sky (core).
// stone is the neutral, signal is the warn, moss is success.
export const accents = {
  rust:   '#B96247', // push lineage
  sea:    '#4A8B8C', // pull lineage
  sand:   '#B89968', // legs lineage
  sky:    '#4F7AAA', // core lineage
  stone:  '#7A828C', // neutral / mobility
  signal: '#C44A2F', // warn
  moss:   '#6E9078', // success
};

// Per-hue ink variants for legible chip text on the accent wash. The wash is
// accent @ 0.15 alpha on paper — very light — so chip ink must be a deeply
// saturated dark variant of the same hue to clear WCAG AA 4.5:1. Hand-tuned
// against the new cooler palette and cooler paper.
const accentInkLight = {
  rust:   '#5C2D1B',
  sea:    '#1F4A4B',
  sand:   '#5A4520',
  sky:    '#264168',
  stone:  '#3A4048',
  signal: '#6A2613',
  moss:   '#324B3A',
};
// Dark mode inverts: ink is a *light* variant of each hue.
const accentInkDark = {
  rust:   '#E0A18A',
  sea:    '#9DC5C6',
  sand:   '#D9C39A',
  sky:    '#A2B7D2',
  stone:  '#BBC2CA',
  signal: '#EBA194',
  moss:   '#B6CDB9',
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
};

// Day lineage → accent. Bridge for legacy day-keyed code; see also
// `dayColor` in the legacy compat block below.
export const dayLineageAccent = {
  push: 'rust',
  pull: 'sea',
  legs: 'sand',
  core: 'sky',
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
    '--surface-raised':  paper[0],
    '--surface-overlay': paper[0],
    '--surface-scrim':   withAlpha(ink.text0, 0.45),
    '--text-primary':    ink.text0,
    '--text-secondary':  ink.text1,
    '--text-tertiary':   ink.text2,
    '--text-on-accent':  paper[0],
    '--border-hairline': withAlpha(ink.text0, 0.08),
    '--border-strong':   withAlpha(ink.text0, 0.18),
    '--shadow-1':        '0 1px 0 rgba(0,0,0,0.04)',
    '--shadow-2':        '0 1px 1px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
    '--state-warn':      accents.signal,
    '--state-warn-ink':  accentInkLight.signal,
    '--state-success':   accents.moss,
    '--state-success-ink': accentInkLight.moss,
    '--state-info':      accents.stone,
    '--font-serif':      fontFamilies.serif,
    '--font-sans':       fontFamilies.sans,
    '--font-mono':       fontFamilies.mono,
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
    '--surface-overlay': ink[2],
    '--surface-scrim':   withAlpha('#000000', 0.6),
    '--text-primary':    ink.textDark0,
    '--text-secondary':  ink.textDark1,
    '--text-tertiary':   ink.textDark2,
    '--text-on-accent':  paper[0],
    '--border-hairline': withAlpha(ink.textDark0, 0.08),
    '--border-strong':   withAlpha(ink.textDark0, 0.18),
    '--shadow-1':        '0 1px 0 rgba(0,0,0,0.4)',
    '--shadow-2':        '0 1px 1px rgba(0,0,0,0.35), 0 6px 24px rgba(0,0,0,0.45)',
    '--state-warn':      accents.signal,
    '--state-warn-ink':  accentInkDark.signal,
    '--state-success':   accents.moss,
    '--state-success-ink': accentInkDark.moss,
    '--state-info':      accents.stone,
    '--font-serif':      fontFamilies.serif,
    '--font-sans':       fontFamilies.sans,
    '--font-mono':       fontFamilies.mono,
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
