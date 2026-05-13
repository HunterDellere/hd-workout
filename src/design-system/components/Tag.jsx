// v2 primitive: Tag — compact label for metadata, muscle groups, attributes.
// Two tones: `muted` (default, neutral sunken) and `accent` (semantic wash).

import { radius as radiusScale } from '../tokens';

export function Tag({
  tone = 'muted',
  accent,
  children,
  style,
  ...rest
}) {
  const isAccent = tone === 'accent' && accent;
  const computed = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    background: isAccent
      ? `var(--accent-${accent}-wash)`
      : 'var(--surface-sunken)',
    color: isAccent
      ? `var(--accent-${accent}-ink)`
      : 'var(--text-secondary)',
    borderRadius: radiusScale.sm,
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    letterSpacing: '0.06em',
    lineHeight: 1.3,
    whiteSpace: 'nowrap',
    ...style,
  };
  return <span style={computed} {...rest}>{children}</span>;
}
