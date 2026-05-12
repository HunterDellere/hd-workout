// APEX — Full Spectrum Training :: design tokens.
// Single source of truth. Tailored for a dense, dark, mono-driven UI
// with day-specific accent colors. Read from JS (preferred) or via CSS custom
// properties injected at the root in index.css.

export const color = {
  bg: '#080808',
  s1: '#101010',
  s2: '#161616',
  s3: '#1E1E1E',
  s4: '#252525',
  border: '#242424',
  border2: '#303030',
  text: '#F2F2F2',
  muted: '#888888',
  muted2: '#555555',
  push: '#D4F53C',
  pull: '#3CD4F5',
  legs: '#F5833C',
  core: '#C43CF5',
  warn: '#F5503C',
  success: '#3CF5A0',
};

// Day → accent map (used everywhere for tinting).
export const dayColor = {
  push: color.push,
  pull: color.pull,
  legs: color.legs,
  core: color.core,
};

// Type tier ranking → glyph + label.
export const tierMeta = {
  S: { label: 'Foundational', glyph: 'S' },
  A: { label: 'Primary alt',  glyph: 'A' },
  B: { label: 'Accessory',    glyph: 'B' },
};

export const font = {
  display: '"Bebas Neue", "Impact", system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  body: '"DM Sans", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
};

// Type ramp. Display sizes for hero numbers / day labels, body for content.
export const type = {
  display: {
    xxl: { size: 96, line: 0.9,  weight: 400, family: font.display, tracking: '-0.02em' },
    xl:  { size: 64, line: 0.9,  weight: 400, family: font.display, tracking: '-0.01em' },
    lg:  { size: 40, line: 0.95, weight: 400, family: font.display, tracking: '0' },
  },
  body: {
    lg:  { size: 18, line: 1.5, weight: 400, family: font.body },
    md:  { size: 15, line: 1.55, weight: 400, family: font.body },
    sm:  { size: 13, line: 1.5, weight: 400, family: font.body },
  },
  mono: {
    md: { size: 12, line: 1.4, weight: 500, family: font.mono, tracking: '0.08em' },
    sm: { size: 11, line: 1.4, weight: 500, family: font.mono, tracking: '0.1em' },
    xs: { size: 10, line: 1.3, weight: 500, family: font.mono, tracking: '0.14em' },
  },
};

export const space = {
  0:  0,
  1:  2,
  2:  4,
  3:  6,
  4:  8,
  5:  12,
  6:  16,
  7:  20,
  8:  24,
  9:  32,
  10: 40,
  11: 48,
  12: 64,
};

export const radius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 24,
  full: 9999,
};

export const shadow = {
  s1: '0 1px 0 rgba(255,255,255,0.02) inset, 0 1px 2px rgba(0,0,0,0.6)',
  s2: '0 2px 8px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.03) inset',
  s3: '0 8px 28px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.04) inset',
  s4: '0 18px 60px rgba(0,0,0,0.7), 0 2px 0 rgba(255,255,255,0.04) inset',
  // Color-tinted glow used on pressed / active accent surfaces.
  glow: (hex, a = 0.35) => `0 0 0 1px ${hex}55, 0 12px 36px ${withAlpha(hex, a)}`,
};

export const motion = {
  spring:  { type: 'spring', stiffness: 400, damping: 30 },
  springS: { type: 'spring', stiffness: 500, damping: 36, mass: 0.6 },
  smooth:  { type: 'tween', duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  fast:    { type: 'tween', duration: 0.15, ease: [0.4, 0, 0.2, 1] },
  reveal:  { staggerChildren: 0.06, delayChildren: 0.04 },
  sheet:   { type: 'spring', stiffness: 380, damping: 36, mass: 0.8 },
};

export const z = {
  base: 0,
  rise: 10,
  nav: 50,
  sheet: 90,
  modal: 100,
  toast: 110,
};

// Helpers ---------------------------------------------------

export function withAlpha(hex, a) {
  const h = hex.replace('#', '');
  const n = h.length === 3
    ? h.split('').map((c) => c + c).join('')
    : h;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function accentFor(dayKey) {
  return dayColor[dayKey] ?? color.text;
}

// CSS custom property map injected into :root in index.css.
// Exposed for any consumers that need raw CSS access (e.g. inline style maps).
export const cssVars = {
  '--bg':       color.bg,
  '--s1':       color.s1,
  '--s2':       color.s2,
  '--s3':       color.s3,
  '--s4':       color.s4,
  '--border':   color.border,
  '--border2':  color.border2,
  '--text':     color.text,
  '--muted':    color.muted,
  '--muted2':   color.muted2,
  '--push':     color.push,
  '--pull':     color.pull,
  '--legs':     color.legs,
  '--core':     color.core,
  '--warn':     color.warn,
  '--success':  color.success,
  '--font-display': font.display,
  '--font-mono':    font.mono,
  '--font-body':    font.body,
};
