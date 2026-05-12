import { motion } from 'framer-motion';
import { Badge, Icon, color, radius, shadow, motion as M, withAlpha, tierMeta } from '../design-system';

const tierBg = {
  S: (accent) => ({ bg: accent, fg: color.bg }),
  A: (accent) => ({ bg: withAlpha(accent, 0.18), fg: accent }),
  B: () => ({ bg: color.s3, fg: color.muted }),
};

export function ExerciseCard({ exercise, accent, onOpen, index = 0 }) {
  const t = tierBg[exercise.tier]?.(accent) ?? tierBg.B();
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...M.smooth, delay: 0.02 * index }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      style={{
        position: 'relative',
        background: color.s1,
        border: `1px solid ${color.border}`,
        borderRadius: radius.lg,
        padding: 16,
        textAlign: 'left',
        cursor: 'pointer',
        boxShadow: shadow.s2,
        width: '100%',
        color: color.text,
        overflow: 'hidden',
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: 3,
          background: accent,
        }}
      />
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span
          aria-hidden
          style={{
            flexShrink: 0,
            width: 34,
            height: 34,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: t.bg,
            color: t.fg,
            borderRadius: radius.md,
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            letterSpacing: '0.04em',
            lineHeight: 1,
          }}
          title={tierMeta[exercise.tier]?.label}
        >
          {tierMeta[exercise.tier]?.glyph ?? exercise.tier}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: 17,
            fontWeight: 500,
            color: color.text,
            lineHeight: 1.25,
            letterSpacing: '-0.005em',
          }}>
            {exercise.name}
          </div>
          <div style={{
            marginTop: 6,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            alignItems: 'center',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: color.muted,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              {exercise.sets}
            </span>
            <span style={{
              width: 3, height: 3, borderRadius: 999, background: color.muted2,
            }} />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: color.muted,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              rest {exercise.rest}
            </span>
          </div>
          {exercise.primaryMuscles?.length > 0 && (
            <div style={{
              marginTop: 8,
              fontFamily: 'var(--font-body)',
              fontSize: 12.5,
              color: color.muted,
              lineHeight: 1.45,
            }}>
              {exercise.primaryMuscles.join(' · ')}
            </div>
          )}
          {(exercise.tags?.length ?? 0) > 0 && (
            <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {exercise.tags.slice(0, 3).map((t) => (
                <Badge key={t} tone="muted">{t}</Badge>
              ))}
              {exercise.tags.length > 3 && (
                <Badge tone="muted">+{exercise.tags.length - 3}</Badge>
              )}
            </div>
          )}
        </div>
        <span style={{
          color: color.muted,
          flexShrink: 0,
          marginTop: 4,
        }}>
          <Icon name="ChevronRight" size={18} />
        </span>
      </div>
    </motion.button>
  );
}
