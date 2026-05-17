// TodayHero — the pre-start primary surface. Day eyebrow, italic display
// name, optional voice quote, three quiet metric stats, the Start CTA, and
// an optional "Reset day" affordance when an overlay is in effect.
//
// Visual character: a giant pattern-glyph watermark in the corner. Reuses
// the PatternGlyph system already in the design system so the brand
// language stays geometric and consistent — same vocabulary as Library
// pattern rows, just blown up and tinted in the day's accent.

import { Stack, Text, Button, MonoChipButton, PatternGlyph } from '../../design-system/components';

// Day → representative pattern-glyph key. Picked one per lineage that
// best reads as the day's *essence* at watermark scale.
const DAY_PATTERN_KEY = {
  push:     'horizontal-press', // bench/press archetype
  pull:     'vertical-pull',    // pull-up archetype
  legs:     'squat',            // squat archetype
  core:     'core-anti',        // anti-rotation cross
  recovery: 'mobility',         // open arcs
};

function HeroStat({ label, value, primary }) {
  // `primary` makes the stat read bigger — used for Minutes since most
  // people plan around how much time they have. Exercises + Sections
  // are structural details.
  return (
    <div>
      <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.8 }}>
        {label}
      </Text>
      <Text
        as="div"
        variant={primary ? 'display-lg' : 'mono-lg'}
        tone="primary"
        style={{
          marginTop: 6,
          fontStyle: 'normal',
          fontFamily: primary ? 'var(--font-mono)' : undefined,
          fontWeight: primary ? 500 : undefined,
        }}
      >
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
  // Location swap — Gym / Home. When both are passed, a pair of
  // LocationChips renders top-right of the hero so the user can flip
  // without leaving Today. Wired by DayPlanner from useSettings.
  location,
  onSetLocation,
}) {
  const patternKey = DAY_PATTERN_KEY[dayKey] ?? 'mobility';
  return (
    <div
      data-testid="today-hero"
      style={{
        position: 'relative',
        marginTop: 16,
        padding: '24px 28px 28px',
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

      {/* Corner pattern-glyph watermark. Reuses the design-system
          PatternGlyph so the day's visual identity is anchored in the
          same vocabulary as Library and pattern pages — geometric, not
          decorative. Sized large + low-opacity so it reads as character
          without competing with the headline. Tinted in the day's accent. */}
      {/* Pattern glyph as a large bottom-right watermark — moved away
          from the top-right corner where it competed visually with the
          Gym/Home chip pair on push (two parallel marks read as a
          duplicate chip). Now reads as a brand watermark sitting
          behind the Start CTA. */}
      {/* Fully-visible corner mark — small enough to read as a brand
          stamp, not a stranded UI element. Earlier the watermark was
          200–340px partially-off-canvas; with stroke-only glyphs
          (horizontal-press is two parallel bars), whatever stroke
          crossed the visible card area read as floating skeleton UI.
          Keeping the whole glyph inside the card removes that misread. */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          bottom: 18,
          right: 22,
          width: 56,
          height: 56,
          pointerEvents: 'none',
          color: `var(--accent-${accent}-ink)`,
          opacity: 0.35,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <PatternGlyph name={patternKey} size={56} strokeWidth={1.5} />
      </span>

      {/* Content column — capped width keeps the right side as
          deliberate breathing room (with corner glyph) rather than
          looking abandoned on wide viewports. The card itself remains
          full-bleed to anchor the page. */}
      <Stack direction="row" align="center" justify="space-between" gap={2}>
        <Stack direction="row" align="center" gap={2}>
          <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', letterSpacing: '0.14em' }}>
            {labelOverride ?? `Today · ${todayKey}`}
          </Text>
        </Stack>
        <Stack direction="row" align="center" gap={2}>
          {onSetLocation && (
            <Stack direction="row" gap={1} data-testid="hero-location">
              <LocationChip
                label="Gym"
                active={location !== 'home'}
                onClick={() => onSetLocation('gym')}
                testId="hero-location-gym"
              />
              <LocationChip
                label="Home"
                active={location === 'home'}
                onClick={() => onSetLocation('home')}
                testId="hero-location-home"
              />
            </Stack>
          )}
          {hasOverlay && (
            <MonoChipButton
              onClick={onResetDay}
              data-testid="reset-day"
            >
              Reset day
            </MonoChipButton>
          )}
        </Stack>
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
        {/* Minutes is the headline — people plan around time. Exercises
            and Sections are the structural detail. */}
        {estMinutes != null && <HeroStat label="Minutes" value={`~${estMinutes}`} primary />}
        <HeroStat label="Exercises" value={exerciseCount} />
        <HeroStat label="Sections" value={sectionCount} />
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
