import { motion } from 'framer-motion';
import { color, radius, shadow, motion as M, withAlpha } from '../design-system';
import { Icon } from '../design-system';

// Big tappable day selector card used on Home.
const ICON_FOR = {
  push: 'Dumbbell',
  pull: 'MoveDown',
  legs: 'Footprints',
  core: 'Target',
};

export function DayTab({ dayKey, name, subtitle, accent, onClick }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      transition={M.smooth}
      onClick={onClick}
      style={{
        position: 'relative',
        textAlign: 'left',
        background: color.s1,
        border: `1px solid ${color.border}`,
        borderRadius: radius.lg,
        padding: '22px 20px',
        cursor: 'pointer',
        overflow: 'hidden',
        boxShadow: shadow.s2,
        color: color.text,
        width: '100%',
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(140% 80% at 100% 0%, ${withAlpha(accent, 0.18)} 0%, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: 4,
          background: accent,
        }}
      />
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.22em',
            color: accent,
            textTransform: 'uppercase',
          }}>
            Day · {dayKey}
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 56,
            lineHeight: 0.95,
            marginTop: 6,
            color: color.text,
            letterSpacing: '0.01em',
          }}>
            {name.toUpperCase()}
          </div>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            color: color.muted,
            marginTop: 8,
          }}>
            {subtitle}
          </div>
        </div>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: radius.full,
          border: `1px solid ${withAlpha(accent, 0.4)}`,
          color: accent,
          background: withAlpha(accent, 0.06),
          flexShrink: 0,
        }}>
          <Icon name={ICON_FOR[dayKey] || 'Activity'} size={18} />
        </span>
      </div>
    </motion.button>
  );
}
