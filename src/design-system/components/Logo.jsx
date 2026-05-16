// Logo — HDW brand mark.
// An enso (the single-brush zen circle) with an inset HDW monogram in
// serif italic at the center. Calligraphic convention is preserved:
//   1. The ring starts heavy (loaded brush) and dries out toward the end.
//   2. An intentional open gap where the brush lifts (lower-right).
//   3. The circle is slightly off-perfect — a hand made this, not a compass.
//
// One mark. Works as masthead glyph (22px), favicon (16px), splash (96px).
// The inset monogram remains legible from ~14px up; below that the ring
// alone reads — which is fine, that's what an enso is for.
//
// Built procedurally: the brush stroke is a closed filled shape whose
// inner/outer arcs diverge along the path, producing real width taper
// (SVG `stroke` can't taper natively). Pure geometry, no PNG.

const ENSO_PATH = buildEnsoPath();

function buildEnsoPath() {
  // The brush enters at ~330° (upper right) and sweeps counter-clockwise
  // back to ~250°, leaving a ~80° opening at the lower right — the
  // calligraphic exit. Width tapers from 4.4 (loaded) → 1.0 (dry).
  const cx = 50;
  const cy = 50;
  const r = 38;
  const startDeg = -30;
  const endDeg = 250;
  const samples = 72;
  const wStart = 4.6;
  const wEnd = 1.0;

  const outer = [];
  const inner = [];
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    // Ease-out taper: heavy lingers, dries fast at the end.
    const w = wStart + (wEnd - wStart) * Math.pow(t, 1.6);
    // Hand tremor — deterministic so renders are identical.
    const wobble = Math.sin(t * 13 + 1.7) * 0.42 + Math.sin(t * 31 + 0.3) * 0.16;
    const radius = r + wobble;
    const deg = startDeg + (endDeg - startDeg) * t;
    const rad = (deg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    outer.push([cx + (radius + w / 2) * cos, cy + (radius + w / 2) * sin]);
    inner.push([cx + (radius - w / 2) * cos, cy + (radius - w / 2) * sin]);
  }

  const fmt = (n) => n.toFixed(2);
  let d = `M ${fmt(outer[0][0])} ${fmt(outer[0][1])}`;
  for (let i = 1; i < outer.length; i += 1) {
    d += ` L ${fmt(outer[i][0])} ${fmt(outer[i][1])}`;
  }
  for (let i = inner.length - 1; i >= 0; i -= 1) {
    d += ` L ${fmt(inner[i][0])} ${fmt(inner[i][1])}`;
  }
  return `${d} Z`;
}

export function Logo({ size = 22, accent = 'rust', monogram = true, style, ...rest }) {
  return (
    <span
      aria-label="HDW"
      role="img"
      data-testid="logo"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        ...style,
      }}
      {...rest}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
      >
        <path d={ENSO_PATH} fill={`var(--accent-${accent}-ink)`} />
        {monogram && size >= 18 && (
          <text
            x="50"
            y="60"
            textAnchor="middle"
            fontFamily="var(--font-serif)"
            fontSize="30"
            fontStyle="italic"
            fontWeight="400"
            fill="var(--text-primary)"
            letterSpacing="-1"
          >
            hdw
          </text>
        )}
      </svg>
    </span>
  );
}
