// BrushDivider — a single sumi-e brush mark.
// Filled SVG path (not stroked, because a brush stroke has varying width).
// Color via currentColor; intended to be rendered at low opacity against
// paper/ink. The path is intentionally asymmetric — wider in the middle,
// tapering past both ends — to read as ink on washi rather than a hairline.
//
// Usage: place between Blocks where a hairline would feel too utilitarian.
// Default is 100% wide, ~8px tall, opacity 0.18.

export function BrushDivider({
  width = '100%',
  height = 8,
  opacity = 0.28,
  align = 'center',   // 'left' | 'center' | 'right' — controls margin of the inner svg
  accent,             // optional pattern accent key — tints the brush in day ink
  style,
  ...rest
}) {
  const margin =
    align === 'left'   ? '0 auto 0 0' :
    align === 'right'  ? '0 0 0 auto' :
                         '0 auto';
  return (
    <div
      aria-hidden="true"
      data-testid="brush-divider"
      style={{
        width: '100%',
        display: 'flex',
        ...style,
      }}
      {...rest}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 200 8"
        preserveAspectRatio="none"
        fill="currentColor"
        style={{
          display: 'block',
          margin,
          opacity,
          color: accent ? `var(--accent-${accent}-ink)` : 'var(--text-primary)',
        }}
      >
        {/*
          A single brushed mark: starts hairline-thin, swells past the first
          third, holds, tapers off the right edge with a small split. The
          control points are tuned by hand — re-tune if you change the
          viewBox aspect.
        */}
        <path d="M0 4.1 C18 3.6 32 2.9 58 2.4 C92 1.9 122 2.6 148 3.2 C166 3.6 184 4.0 200 4.2 L200 4.5 C184 4.7 168 5.0 148 5.2 C124 5.5 96 6.0 64 5.7 C40 5.5 18 5.0 0 4.7 Z" />
      </svg>
    </div>
  );
}
