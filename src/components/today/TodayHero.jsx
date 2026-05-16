// TodayHero — the pre-start primary surface. Day eyebrow, italic display
// name, optional voice quote, three quiet metric stats, the Start CTA, and
// an optional "Reset day" affordance when an overlay is in effect.
//
// Visual character: a single asymmetric brushed ideogram in the day's
// accent occupies the top-right corner — a quiet kanji-feel mark that
// gives every day its own visible identity without dominating the type.

import { Stack, Text, Button, MonoChipButton } from '../../design-system/components';

// Day → corner glyph (single path, dry-brush feel). Each is a different
// abstract gesture tied to the lineage: rising (push), pulling (pull),
// grounding (legs), spiralling (core), settling (recovery / stone).
const DAY_GLYPH = {
  push:  'M 12 70 Q 30 30 60 35 T 110 18',           // rising arc
  pull:  'M 110 18 Q 80 50 50 38 T 12 60',           // hooking pull
  legs:  'M 14 70 Q 60 78 60 30 Q 60 78 110 70',     // anchored vertical
  core:  'M 20 40 Q 60 10 100 40 Q 60 70 20 40 Z',   // closed loop
  recovery: 'M 18 30 Q 40 70 70 35 T 110 60',        // flowing wave
};

function HeroStat({ label, value }) {
  return (
    <div>
      <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.8 }}>
        {label}
      </Text>
      <Text as="div" variant="mono-lg" tone="primary" style={{ marginTop: 6 }}>
        {value}
      </Text>
    </div>
  );
}

export function LocationChip({ label, active, onClick, testId }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      data-active={active ? '1' : '0'}
      style={{
        all: 'unset',
        cursor: 'pointer',
        padding: '6px 14px',
        borderRadius: 999,
        border: '1px solid var(--border-hairline)',
        background: active ? 'var(--text-primary)' : 'transparent',
        color: active ? 'var(--surface-page)' : 'var(--text-secondary)',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.10em',
        textTransform: 'uppercase',
      }}
    >
      {label}
    </button>
  );
}

export function TodayHero({
  day,
  accent,
  todayKey,
  labelOverride,
  exerciseCount,
  sectionCount,
  estMinutes,
  voice,
  onStart,
  startDisabled = false,
  startLabel = 'Start session',
  hasOverlay,
  onResetDay,
  dayKey,
}) {
  const glyph = DAY_GLYPH[dayKey] ?? DAY_GLYPH.recovery;
  return (
    <div
      data-testid="today-hero"
      style={{
        position: 'relative',
        marginTop: 24,
        padding: '28px 28px 32px',
        background: 'var(--gradient-hero)',
        border: '1px solid var(--border-hairline)',
        borderRadius: 16,
        boxShadow: 'var(--shadow-hero)',
        overflow: 'hidden',
        // Wave 6.4 #35: focus ring picks up the day's pattern accent.
        '--focus-color': `var(--accent-${accent}-ink)`,
      }}
    >
      {/* Day-lineage rule running the full left edge — quiet but unmissable. */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: 3,
          background: `var(--accent-${accent}-solid)`,
        }}
      />

      {/* Corner brush ideogram — quiet, day-specific. Positioned top-right
          and clipped by the hero's overflow:hidden. Opacity tuned to read
          as character without competing with the headline. */}
      <svg
        aria-hidden
        viewBox="0 0 120 80"
        style={{
          position: 'absolute',
          top: -10,
          right: -10,
          width: 200,
          height: 130,
          pointerEvents: 'none',
          opacity: 0.10,
        }}
      >
        <path
          d={glyph}
          fill={dayKey === 'core' ? `var(--accent-${accent}-solid)` : 'none'}
          stroke={`var(--accent-${accent}-solid)`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <Stack direction="row" align="center" justify="space-between" gap={2}>
        <Stack direction="row" align="center" gap={2}>
          <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', letterSpacing: '0.14em' }}>
            {labelOverride ?? `Today · ${todayKey}`}
          </Text>
        </Stack>
        {hasOverlay && (
          <MonoChipButton
            onClick={onResetDay}
            data-testid="reset-day"
          >
            Reset day
          </MonoChipButton>
        )}
      </Stack>

      <Text
        as="h1"
        variant="display-lg"
        style={{
          marginTop: 12,
          fontStyle: 'italic',
          fontWeight: 400,
          lineHeight: 1.05,
        }}
      >
        {day.name}
      </Text>

      {voice && (
        <Text
          as="p"
          variant="body-md"
          tone="secondary"
          style={{
            marginTop: 10,
            fontStyle: 'italic',
            fontFamily: 'var(--font-serif)',
            fontWeight: 300,
            maxWidth: 40 * 9,
            opacity: 0.78,
          }}
        >
          {voice}
        </Text>
      )}

      {/* Metrics strip — three quiet numbers, mono. Wraps on narrow screens. */}
      <Stack direction="row" gap={5} style={{ marginTop: 24, flexWrap: 'wrap', rowGap: 16 }}>
        <HeroStat label="Exercises" value={exerciseCount} />
        <HeroStat label="Sections" value={sectionCount} />
        {estMinutes != null && <HeroStat label="Minutes" value={`~${estMinutes}`} />}
      </Stack>

      <div style={{ marginTop: 28 }}>
        <Button
          variant="cta"
          accent={accent}
          size="lg"
          onClick={onStart}
          disabled={startDisabled}
          data-testid="start-session"
        >
          {startLabel}
          {!startDisabled && <span aria-hidden style={{ marginLeft: 4, opacity: 0.75 }}>→</span>}
        </Button>
      </div>
    </div>
  );
}
