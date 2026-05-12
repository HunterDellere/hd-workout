import { motion } from 'framer-motion';
import { color, radius, motion as M, withAlpha } from '../tokens';

const sizeMap = {
  sm: { py: 6,  px: 10, font: 11, height: 30 },
  md: { py: 9,  px: 14, font: 12, height: 38 },
  lg: { py: 12, px: 18, font: 13, height: 46 },
};

export function Button({
  children,
  variant = 'solid',
  size = 'md',
  accent = color.text,
  iconLeft,
  iconRight,
  block,
  type = 'button',
  onClick,
  ariaLabel,
  disabled,
  ...rest
}) {
  const s = sizeMap[size];
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: s.height,
    padding: `${s.py}px ${s.px}px`,
    fontFamily: 'var(--font-mono)',
    fontSize: s.font,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    border: '1px solid transparent',
    borderRadius: radius.md,
    cursor: disabled ? 'not-allowed' : 'pointer',
    width: block ? '100%' : 'auto',
    transition: 'background 120ms ease, border-color 120ms ease, color 120ms ease',
    opacity: disabled ? 0.4 : 1,
    userSelect: 'none',
  };
  const styles = {
    solid: {
      background: accent,
      color: color.bg,
      borderColor: accent,
    },
    ghost: {
      background: 'transparent',
      color: accent,
      borderColor: withAlpha(accent, 0.35),
    },
    line: {
      background: color.s1,
      color: color.text,
      borderColor: color.border,
    },
    bare: {
      background: 'transparent',
      color: color.muted,
      borderColor: 'transparent',
    },
  };
  return (
    <motion.button
      type={type}
      aria-label={ariaLabel}
      onClick={disabled ? undefined : onClick}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={M.fast}
      style={{ ...base, ...styles[variant] }}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </motion.button>
  );
}
