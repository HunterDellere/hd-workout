// TodayHero — the pre-start primary surface. Day eyebrow, italic display
// name, optional voice quote, three quiet metric stats, the Start CTA, and
// an optional "Reset day" affordance when an overlay is in effect.

import { Stack, Text, Button, MonoChipButton } from '../../design-system/components';

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
  exerciseCount,
  sectionCount,
  estMinutes,
  voice,
  onStart,
  hasOverlay,
  onResetDay,
}) {
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

      <Stack direction="row" align="center" justify="space-between" gap={2}>
        <Stack direction="row" align="center" gap={2}>
          <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', letterSpacing: '0.14em' }}>
            Today · {todayKey}
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
          data-testid="start-session"
        >
          Start session
          <span aria-hidden style={{ marginLeft: 4, opacity: 0.75 }}>→</span>
        </Button>
      </div>
    </div>
  );
}
