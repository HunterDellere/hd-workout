// PatternGlyph — bespoke abstract movement marks, one per pattern.
// 1.5px stroke, currentColor, 24x24 viewBox. Hand-feel (not geometric-perfect),
// no anatomical drawings. Each glyph is a structural diagram of the movement,
// not a depiction. See local/03-design/DESIGN-LANGUAGE.md → Iconography.

const GLYPHS = {
  // Two horizontal parallel bars — barbell against the chest.
  'horizontal-press': (
    <>
      <line x1="4"  y1="9"  x2="20" y2="9" />
      <line x1="4"  y1="15" x2="20" y2="15" />
    </>
  ),
  // Two vertical parallel bars — overhead press path.
  'vertical-press': (
    <>
      <line x1="9"  y1="4"  x2="9"  y2="20" />
      <line x1="15" y1="4"  x2="15" y2="20" />
    </>
  ),
  // Two horizontal strokes, the lower one curving inward — pull toward you.
  'horizontal-pull': (
    <>
      <line x1="4"  y1="8"  x2="20" y2="8" />
      <path d="M4 16 Q12 12 20 16" />
    </>
  ),
  // Two vertical strokes joined by a top arc — pull down from overhead.
  'vertical-pull': (
    <>
      <path d="M8 5 Q12 2 16 5" />
      <line x1="8"  y1="5"  x2="8"  y2="20" />
      <line x1="16" y1="5"  x2="16" y2="20" />
    </>
  ),
  // Open U-bowl beneath a horizontal bar — bar on back, depth below.
  'squat': (
    <>
      <line x1="4"  y1="8"  x2="20" y2="8" />
      <path d="M6 10 Q12 22 18 10" />
    </>
  ),
  // A single deep arc — the bow of a hip hinge.
  'hinge': (
    <path d="M4 7 Q4 19 20 19" />
  ),
  // Forward-stepping V — one long stroke at angle, one shorter behind.
  'lunge': (
    <>
      <line x1="5"  y1="20" x2="14" y2="8" />
      <line x1="14" y1="8"  x2="20" y2="14" />
      <line x1="14" y1="8"  x2="14" y2="4" />
    </>
  ),
  // Horizontal stroke crossed by a vertical, with an offset emphasis tick —
  // resisting rotation around a fixed axis.
  'core-anti': (
    <>
      <line x1="4"  y1="12" x2="20" y2="12" />
      <line x1="12" y1="4"  x2="12" y2="20" />
      <line x1="17" y1="9"  x2="17" y2="15" />
    </>
  ),
  // Curved C-shape — trunk flexion / curl.
  'core-flexion': (
    <path d="M17 5 Q7 7 7 12 Q7 17 17 19" />
  ),
  // Open ring with a small gap at the top — range, not closure.
  'mobility': (
    <path d="M14 5 A7 7 0 1 0 18 14" />
  ),
};

export function PatternGlyph({ name, size = 24, strokeWidth = 1.5, style, ...rest }) {
  const glyph = GLYPHS[name];
  if (!glyph) return null;
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
      data-glyph={name}
      style={{ flexShrink: 0, ...style }}
      {...rest}
    >
      {glyph}
    </svg>
  );
}
