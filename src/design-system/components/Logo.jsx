// Logo — HDW wordmark.
// A small bespoke mark: serif italic "hdw" with a calligraphic brush
// stroke crossing through, in the rust accent. Tuned for ~22px cap-height
// so it sits naturally in the masthead without dominating.
//
// The brush stroke is drawn as a single SVG path so it scales cleanly and
// keeps its dry-edge feel. Stroke color is parameterised — defaults to
// the rust day accent, but can be themed (e.g. for splash screens).

export function Logo({ size = 22, accent = 'rust', style, ...rest }) {
  // Width is governed by the wordmark glyph proportions; the brush
  // overhang adds ~6 units past the right edge of the 'w'.
  const W = 96;
  const H = 32;
  return (
    <span
      aria-label="HDW"
      role="img"
      data-testid="logo"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: size * 1.4,
        ...style,
      }}
      {...rest}
    >
      <svg
        width={(size * 1.4) * (W / H)}
        height={size * 1.4}
        viewBox={`0 0 ${W} ${H}`}
        fill="none"
        aria-hidden="true"
      >
        {/* Brush stroke — drawn first so the letterforms sit on top */}
        <path
          d="M2 24 C 18 18, 36 26, 56 19 S 90 14, 96 11"
          stroke={`var(--accent-${accent}-solid)`}
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.85"
        />
        {/* A second drier hair trail to feel like a real brush exit */}
        <path
          d="M70 16 L 94 9"
          stroke={`var(--accent-${accent}-ink)`}
          strokeWidth="0.9"
          strokeLinecap="round"
          opacity="0.5"
        />
        {/* Wordmark — Newsreader italic. Inline text keeps font weight
            switching cheap and respects user theme tokens. */}
        <text
          x="0"
          y="24"
          fontFamily="var(--font-serif)"
          fontSize="22"
          fontStyle="italic"
          fontWeight="500"
          fill="var(--text-primary)"
          letterSpacing="-0.5"
        >
          hdw
        </text>
      </svg>
    </span>
  );
}
