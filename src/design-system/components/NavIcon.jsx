// NavIcon — bespoke 1.5px-stroke marks for the bottom nav.
// Six glyphs: home, library, push, pull, legs, core. Hand-feel, not
// geometric-perfect; the day glyphs echo PatternGlyph but simplified for
// rendering at 18px without losing readability.

const ICONS = {
  // An open notebook — two facing pages with a binding.
  home: (
    <>
      <path d="M4 6.5 L4 17.5 L12 18.5 L12 7.5 Z" />
      <path d="M20 6.5 L20 17.5 L12 18.5 L12 7.5 Z" />
    </>
  ),
  // Three horizontal strokes of increasing width — a stack of pages.
  library: (
    <>
      <line x1="6"  y1="7"  x2="18" y2="7" />
      <line x1="5"  y1="12" x2="19" y2="12" />
      <line x1="4"  y1="17" x2="20" y2="17" />
    </>
  ),
  // Today: a clock face — the present moment.
  today: (
    <>
      <circle cx="12" cy="12" r="8" />
      <line x1="12" y1="12" x2="12" y2="7" />
      <line x1="12" y1="12" x2="15" y2="14" />
    </>
  ),
  // Push: two horizontals (a barbell against the chest), echoes
  // PatternGlyph 'horizontal-press'.
  push: (
    <>
      <line x1="4"  y1="9"  x2="20" y2="9" />
      <line x1="4"  y1="15" x2="20" y2="15" />
    </>
  ),
  // Pull: horizontal + curve, echoes 'horizontal-pull'.
  pull: (
    <>
      <line x1="4" y1="8"  x2="20" y2="8" />
      <path d="M4 16 Q12 12 20 16" />
    </>
  ),
  // Legs: bar + U-bowl, echoes 'squat'.
  legs: (
    <>
      <line x1="4"  y1="8"  x2="20" y2="8" />
      <path d="M6 10 Q12 22 18 10" />
    </>
  ),
  // Core: crossed strokes, echoes 'core-anti'.
  core: (
    <>
      <line x1="4"  y1="12" x2="20" y2="12" />
      <line x1="12" y1="4"  x2="12" y2="20" />
    </>
  ),
  // Settings: small gear — center circle + 8 spokes at compass points.
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="3"  x2="12" y2="5.5" />
      <line x1="12" y1="18.5" x2="12" y2="21" />
      <line x1="3"  y1="12" x2="5.5"  y2="12" />
      <line x1="18.5" y1="12" x2="21" y2="12" />
      <line x1="5.6"  y1="5.6"  x2="7.4" y2="7.4" />
      <line x1="16.6" y1="16.6" x2="18.4" y2="18.4" />
      <line x1="5.6"  y1="18.4" x2="7.4" y2="16.6" />
      <line x1="16.6" y1="7.4"  x2="18.4" y2="5.6" />
    </>
  ),
};

export function NavIcon({ name, size = 18, strokeWidth = 1.5, style, ...rest }) {
  const paths = ICONS[name];
  if (!paths) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      data-nav-icon={name}
      style={{ flexShrink: 0, ...style }}
      {...rest}
    >
      {paths}
    </svg>
  );
}
