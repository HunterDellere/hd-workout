import { color, radius, withAlpha } from '../tokens';

export function Badge({ children, tone = 'muted', accent }) {
  const tones = {
    muted:   { bg: color.s2, border: color.border, fg: color.muted },
    solid:   { bg: accent || color.text, border: accent || color.text, fg: color.bg },
    outline: { bg: 'transparent', border: withAlpha(accent || color.text, 0.45), fg: accent || color.text },
    soft:    { bg: withAlpha(accent || color.text, 0.12), border: withAlpha(accent || color.text, 0.25), fg: accent || color.text },
    warn:    { bg: withAlpha(color.warn, 0.14), border: withAlpha(color.warn, 0.4), fg: color.warn },
    success: { bg: withAlpha(color.success, 0.14), border: withAlpha(color.success, 0.4), fg: color.success },
  };
  const t = tones[tone] ?? tones.muted;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 8px',
        border: `1px solid ${t.border}`,
        background: t.bg,
        color: t.fg,
        borderRadius: radius.sm,
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        lineHeight: 1.2,
      }}
    >
      {children}
    </span>
  );
}
