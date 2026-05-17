// MonoChipButton — the small uppercase-mono action chip used across the
// app (Swap, Remove, Reset day, + Add exercise, + Add custom group, ...).
//
// Variants:
//   solid (default) — hairline border
//   dashed          — 1px dashed border (the "+ Add" affordance)
//   ghost           — no border, tertiary text; for inline row actions
//                     that shouldn't compete with content
//
// Accents tint the text via --accent-{name}-ink. Pass `accent="warn"` for
// the warm-amber variant used by destructive bare-chip pairings.

import { forwardRef } from 'react';

const baseStyle = {
  all: 'unset',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 10px',
  borderRadius: 4,
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  whiteSpace: 'nowrap',
  color: 'var(--text-secondary)',
  transition: 'border-color 120ms ease, color 120ms ease, background 120ms ease',
};

export const MonoChipButton = forwardRef(function MonoChipButton(
  {
    children,
    variant = 'solid',
    accent,
    size = 'sm',
    style,
    disabled,
    type = 'button',
    ...rest
  },
  ref,
) {
  const padding = variant === 'ghost'
    ? '4px 6px'
    : (size === 'md' ? '10px 14px' : '6px 10px');
  const border = variant === 'dashed'
    ? '1px dashed var(--border-hairline)'
    : variant === 'ghost'
      ? '1px solid transparent'
      : '1px solid var(--border-hairline)';
  const color = accent
    ? `var(--accent-${accent}-ink)`
    : (variant === 'ghost' ? 'var(--text-tertiary)' : 'var(--text-secondary)');
  const computed = {
    ...baseStyle,
    padding,
    border,
    color,
    opacity: disabled ? 0.4 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
    ...style,
  };
  return (
    <button ref={ref} type={type} style={computed} disabled={disabled} {...rest}>
      {children}
    </button>
  );
});
