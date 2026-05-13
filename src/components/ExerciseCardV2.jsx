// ExerciseCard v2 — uses semantic v2 tokens end-to-end.
// Visual structure mirrors v1 ExerciseCard but reads colors, type and spacing
// exclusively from --* CSS vars and the v2 tokens module.
//
// No framer-motion. Entrance fade is a CSS animation honoring
// prefers-reduced-motion. See local/03-design/DESIGN-LANGUAGE.md.

import { Stack, Surface, Tag, Text } from '../design-system/components';
import { dayLineageAccent, radius as radiusScale } from '../design-system/tokens';

const TIER_LABEL = {
  S: 'Foundational',
  A: 'Primary alt',
  B: 'Accessory',
};

function tierStyles(tier, accentName) {
  // S tier uses accent-ink as background (deep, AA-safe against paper text)
  // so the chip reads as the most weight in the row without failing contrast
  // on the cooler post-Session-10 palette.
  if (tier === 'S') {
    return {
      background: `var(--accent-${accentName}-ink)`,
      color: 'var(--text-on-accent)',
    };
  }
  if (tier === 'A') {
    return {
      background: `var(--accent-${accentName}-wash)`,
      color: `var(--accent-${accentName}-ink)`,
    };
  }
  return {
    background: 'var(--surface-sunken)',
    color: 'var(--text-tertiary)',
  };
}

export function ExerciseCardV2({ exercise, dayKey, onOpen, index = 0 }) {
  const accentName = dayLineageAccent[dayKey] ?? 'stone';
  const tier = tierStyles(exercise.tier, accentName);
  const tags = exercise.tags ?? [];
  const visibleTags = tags.slice(0, 3);
  const overflow = tags.length - visibleTags.length;

  return (
    <Surface
      as="button"
      level="raised"
      bordered
      shadow={1}
      onClick={onOpen}
      data-testid="exercise-card-v2"
      data-day={dayKey}
      data-tier={exercise.tier}
      style={{
        position: 'relative',
        textAlign: 'left',
        padding: 16,
        borderRadius: radiusScale.lg,
        cursor: 'pointer',
        overflow: 'hidden',
        animation: 'hd-fade-rise 220ms cubic-bezier(0.4, 0, 0.2, 1) both',
        animationDelay: `${Math.min(index, 8) * 20}ms`,
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: 3,
          background: `var(--accent-${accentName}-solid)`,
        }}
      />
      <Stack direction="row" gap={3} align="flex-start">
        <span
          aria-hidden
          title={TIER_LABEL[exercise.tier]}
          style={{
            flexShrink: 0,
            width: 34,
            height: 34,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radiusScale.md,
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.04em',
            lineHeight: 1,
            ...tier,
          }}
        >
          {exercise.tier}
        </span>
        <Stack direction="column" gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Text as="span" variant="title-md" tone="primary">
            {exercise.name}
          </Text>
          <Stack direction="row" gap={2} align="center" wrap>
            <Text as="span" variant="mono-sm" tone="tertiary">
              {exercise.sets}
            </Text>
            <span
              aria-hidden
              style={{
                width: 3,
                height: 3,
                borderRadius: 999,
                background: 'var(--text-tertiary)',
                opacity: 0.6,
              }}
            />
            <Text as="span" variant="mono-sm" tone="tertiary">
              rest {exercise.rest}
            </Text>
          </Stack>
          {exercise.primaryMuscles?.length > 0 && (
            <Text as="span" variant="body-sm" tone="secondary">
              {exercise.primaryMuscles.join(' · ')}
            </Text>
          )}
          {visibleTags.length > 0 && (
            <Stack direction="row" gap={1} wrap style={{ marginTop: 4 }}>
              {visibleTags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
              {overflow > 0 && <Tag>+{overflow}</Tag>}
            </Stack>
          )}
        </Stack>
        <span
          aria-hidden
          style={{
            flexShrink: 0,
            color: 'var(--text-tertiary)',
            marginTop: 4,
            lineHeight: 1,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      </Stack>
    </Surface>
  );
}
