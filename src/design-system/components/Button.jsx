// v2 primitive: Button — variants and sizes that read from semantic tokens.
// No framer-motion. CSS transitions only; respects prefers-reduced-motion via
// the `transition` property collapsing to 0ms there (handled at usage sites if
// needed; this primitive uses short, gentle transitions that are unobtrusive).

import { radius as radiusScale } from '../tokens';

const SIZE = {
  sm: { h: 32, px: 12, font: 13 },
  md: { h: 40, px: 16, font: 14 },
  lg: { h: 48, px: 20, font: 15 },
};

function variantStyles(variant, accent) {
  // Primary uses the accent's *ink* variant (deep) as the background so paper
  // text reads at AA on the cooler post-Session-10 palette. Solid is reserved
  // for marks and indicators where the signal matters more than the text.
  const accentInk = accent ? `var(--accent-${accent}-ink)` : 'var(--text-primary)';
  const accentWash = accent ? `var(--accent-${accent}-wash)` : 'var(--surface-sunken)';
  switch (variant) {
    case 'primary':
      return {
        background: accentInk,
        color: 'var(--text-on-accent)',
        border: '1px solid transparent',
      };
    case 'ghost':
      return {
        background: 'transparent',
        color: accent ? `var(--accent-${accent}-ink)` : 'var(--text-primary)',
        border: '1px solid var(--border-hairline)',
      };
    case 'soft':
      return {
        background: accentWash,
        color: accent ? `var(--accent-${accent}-ink)` : 'var(--text-primary)',
        border: '1px solid transparent',
      };
    case 'bare':
    default:
      return {
        background: 'transparent',
        color: 'var(--text-secondary)',
        border: '1px solid transparent',
      };
  }
}

export function Button({
  as: As = 'button',
  variant = 'ghost',
  size = 'md',
  accent,
  block = false,
  type = 'button',
  disabled = false,
  style,
  children,
  ...rest
}) {
  const s = SIZE[size] ?? SIZE.md;
  const v = variantStyles(variant, accent);
  const computed = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: s.h,
    padding: `0 ${s.px}px`,
    fontFamily: 'var(--font-sans)',
    fontSize: s.font,
    fontWeight: 500,
    lineHeight: 1,
    borderRadius: radiusScale.md,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    width: block ? '100%' : undefined,
    userSelect: 'none',
    transition: 'background-color 120ms ease, border-color 120ms ease, color 120ms ease',
    ...v,
    ...style,
  };
  const passType = As === 'button' ? type : undefined;
  return (
    <As
      type={passType}
      disabled={As === 'button' ? disabled : undefined}
      aria-disabled={disabled || undefined}
      style={computed}
      {...rest}
    >
      {children}
    </As>
  );
}
