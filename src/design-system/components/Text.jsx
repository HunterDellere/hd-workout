// v2 primitive: Text — variant-driven typography.
// Pulls from tokens `type` ramp; respects semantic tone tokens.

import { type as typeRamp } from '../tokens';

const TONE_VAR = {
  primary:   'var(--text-primary)',
  secondary: 'var(--text-secondary)',
  tertiary:  'var(--text-tertiary)',
  onAccent:  'var(--text-on-accent)',
};

export function Text({
  as,
  variant = 'body-md',
  tone = 'primary',
  accent,           // optional accent token name → uses --accent-{name}-ink
  align,
  style,
  children,
  ...rest
}) {
  const v = typeRamp[variant] ?? typeRamp['body-md'];
  const defaultAs = variant.startsWith('display') || variant.startsWith('title') ? 'h2' : 'span';
  const As = as || defaultAs;
  const color = accent
    ? `var(--accent-${accent}-ink)`
    : (TONE_VAR[tone] ?? TONE_VAR.primary);
  const computed = {
    fontFamily: v.family,
    fontSize: v.size,
    lineHeight: v.line,
    fontWeight: v.weight,
    letterSpacing: v.tracking,
    color,
    margin: 0,
    textAlign: align,
    ...style,
  };
  return <As style={computed} {...rest}>{children}</As>;
}
