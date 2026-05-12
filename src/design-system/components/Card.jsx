import { motion } from 'framer-motion';
import { color, radius, shadow, motion as M, withAlpha } from '../tokens';

export function Card({
  children,
  accent,
  interactive = false,
  padded = true,
  layout,
  layoutId,
  onClick,
  ariaLabel,
  style,
  ...rest
}) {
  return (
    <motion.div
      layout={layout}
      layoutId={layoutId}
      whileHover={interactive ? { y: -2 } : undefined}
      whileTap={interactive ? { scale: 0.985 } : undefined}
      transition={M.smooth}
      role={onClick ? 'button' : undefined}
      aria-label={ariaLabel}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e);
        }
      }}
      style={{
        position: 'relative',
        background: color.s1,
        border: `1px solid ${color.border}`,
        borderRadius: radius.lg,
        padding: padded ? 16 : 0,
        boxShadow: shadow.s2,
        cursor: onClick ? 'pointer' : 'default',
        overflow: 'hidden',
        ...style,
      }}
      {...rest}
    >
      {accent && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            left: 0, top: 0, bottom: 0,
            width: 3,
            background: `linear-gradient(180deg, ${accent}, ${withAlpha(accent, 0.2)})`,
            borderTopLeftRadius: radius.lg,
            borderBottomLeftRadius: radius.lg,
          }}
        />
      )}
      {children}
    </motion.div>
  );
}
