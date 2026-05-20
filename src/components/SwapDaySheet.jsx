// SwapDaySheet — bottom sheet for swapping today's routine to a different
// day for one calendar day only. The user's permanent split is untouched;
// the override silently expires at midnight.
//
// Use cases:
//   • Sick / under the weather → swap from Push to Recovery for today.
//   • Bad sleep, low energy → swap to a Rest day without losing the slot.
//   • Plan moved around → grab a Pull workout on what was meant to be Legs.

import { Sheet, Stack, Text, BrushDivider } from '../design-system/components';
import { dayLineageAccent } from '../design-system/tokens';

// Display order + descriptions for the day picker. Recovery sits first
// because it's the most common swap target (under-the-weather flow); rest
// sits last as the "nothing today" escape. All five training keys appear
// regardless of the user's split — the user may want to do Push on a
// scheduled-Legs day for whatever reason.
const DAY_OPTIONS = [
  {
    key: 'recovery',
    name: 'Recovery',
    blurb: 'Posture, imbalance, mobility, healthspan. Light loads, deliberate execution.',
  },
  {
    key: 'push',
    name: 'Push',
    blurb: 'Chest, shoulders, triceps. Pressing movements.',
  },
  {
    key: 'pull',
    name: 'Pull',
    blurb: 'Back, biceps, rear delts. Rowing and pulling.',
  },
  {
    key: 'legs',
    name: 'Legs',
    blurb: 'Quads, hamstrings, glutes, calves, carries.',
  },
  {
    key: 'core',
    name: 'Core',
    blurb: 'Anti-rotation, anti-extension, rotation power.',
  },
  {
    key: 'rest',
    name: 'Rest',
    blurb: 'No lifting. Sharpen the saw.',
  },
];

function DayRow({ option, isCurrent, isScheduled, onPick }) {
  const accent = dayLineageAccent[option.key] ?? 'stone';
  return (
    <button
      type="button"
      data-testid="swap-day-option"
      data-day-key={option.key}
      data-current={isCurrent ? '1' : '0'}
      onClick={() => onPick(option.key)}
      disabled={isCurrent}
      style={{
        all: 'unset',
        cursor: isCurrent ? 'default' : 'pointer',
        display: 'block',
        width: '100%',
        padding: '14px 0',
        borderTop: '1px solid var(--border-hairline)',
        opacity: isCurrent ? 0.55 : 1,
      }}
    >
      <Stack direction="row" align="flex-start" gap={3}>
        <span
          aria-hidden
          style={{
            width: 3,
            alignSelf: 'stretch',
            minHeight: 28,
            background: `var(--accent-${accent}-solid)`,
            borderRadius: 1,
            flexShrink: 0,
          }}
        />
        <Stack direction="column" gap={1} style={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" align="baseline" gap={2} wrap>
            <Text as="span" variant="title-md">
              {option.name}
            </Text>
            {isCurrent && (
              <Text
                as="span"
                variant="mono-sm"
                tone="tertiary"
                style={{ textTransform: 'uppercase', letterSpacing: '0.10em' }}
              >
                · Current
              </Text>
            )}
            {isScheduled && !isCurrent && (
              <Text
                as="span"
                variant="mono-sm"
                tone="tertiary"
                style={{ textTransform: 'uppercase', letterSpacing: '0.10em' }}
              >
                · Scheduled
              </Text>
            )}
          </Stack>
          <Text as="span" variant="body-sm" tone="secondary">
            {option.blurb}
          </Text>
        </Stack>
      </Stack>
    </button>
  );
}

export function SwapDaySheet({
  open,
  onClose,
  currentKey,
  scheduledKey,
  // Optional. When provided, the explainer copy names tomorrow's
  // scheduled day for an unambiguous "Tomorrow: pull" framing. Without
  // it, we fall back to a generic "back on schedule" line.
  nextScheduledKey = null,
  isOverridden,
  onPick,
  onResetToScheduled,
}) {
  if (!open) return null;

  return (
    <Sheet open={open} onClose={onClose} ariaLabel="Swap today's routine">
      <div
        style={{
          padding: '20px 24px 96px',
          background: 'var(--surface-page)',
          color: 'var(--text-primary)',
          minHeight: '100%',
        }}
      >
        <Stack direction="column" gap={1}>
          <Text
            as="div"
            variant="mono-sm"
            tone="tertiary"
            style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}
          >
            Swap today
          </Text>
          <Text as="h2" variant="display-lg" style={{ fontStyle: 'italic', marginTop: 6 }}>
            Pick a different routine
          </Text>
          {/* Two-line explainer: what doesn't change, then what does come
              next. Calling out tomorrow's *actual* scheduled day (from
              the split) avoids the earlier bug where the copy promised
              "back on push" by leaking today's scheduledKey into a
              tomorrow statement. */}
          <Text as="p" variant="body-md" tone="secondary" style={{ marginTop: 8, maxWidth: 60 * 9 }}>
            Just for today — your weekly split isn&apos;t changed.
            {scheduledKey
              ? ` Today was scheduled as ${scheduledKey}.`
              : ''}
          </Text>
          {nextScheduledKey && (
            <Text
              as="p"
              variant="mono-sm"
              tone="tertiary"
              data-testid="swap-day-tomorrow-line"
              style={{
                marginTop: 6,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
              }}
            >
              Tomorrow · {nextScheduledKey}
            </Text>
          )}
        </Stack>

        <BrushDivider style={{ marginTop: 28 }} />

        <ul
          data-testid="swap-day-list"
          style={{ listStyle: 'none', margin: '8px 0 0', padding: 0 }}
        >
          {DAY_OPTIONS.map((option) => (
            <li key={option.key}>
              <DayRow
                option={option}
                isCurrent={option.key === currentKey}
                isScheduled={option.key === scheduledKey}
                onPick={onPick}
              />
            </li>
          ))}
        </ul>

        {isOverridden && (
          <Stack direction="row" gap={2} style={{ marginTop: 24 }}>
            <button
              type="button"
              data-testid="swap-day-reset"
              onClick={onResetToScheduled}
              style={{
                all: 'unset',
                cursor: 'pointer',
                padding: '10px 14px',
                borderRadius: 6,
                border: '1px solid var(--border-hairline)',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              Reset to scheduled
              {scheduledKey ? ` · ${scheduledKey}` : ''}
            </button>
          </Stack>
        )}
      </div>
    </Sheet>
  );
}
