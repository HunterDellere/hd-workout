// /today on a rest day — quiet header + the active-rest list, with a
// "edit your week in settings" footer. Reads only from REST_DAY and
// ACTIVE_REST_ACTIVITIES so the parent doesn't need to wire the data.
//
// One-day-swap affordance: if the lifter wants to do a recovery / push /
// pull workout on what's normally a rest day (or if they were swapped
// here from a training day and need to revert), the "Swap today's
// routine" button opens the SwapDaySheet hosted by /today.

import { Link } from 'react-router-dom';
import {
  Page,
  Block,
  Stack,
  Text,
  Button,
  MonoChipButton,
  BrushDivider,
} from '../../design-system/components';
import { REST_DAY, ACTIVE_REST_ACTIVITIES } from '../../data/rest';

export function RestDay({
  onOpenSwap,
  fromOverride = false,
  scheduledKey = null,
  onResetToScheduled,
}) {
  return (
    <Page>
      <Stack direction="row" align="center" gap={2}>
        <span
          aria-hidden
          style={{
            width: 8,
            height: 8,
            background: 'var(--accent-stone-solid)',
            borderRadius: 1,
          }}
        />
        <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
          Today · rest
        </Text>
        {fromOverride && (
          <Text
            as="span"
            variant="mono-sm"
            tone="tertiary"
            data-testid="today-override-tag"
            style={{ textTransform: 'uppercase', letterSpacing: '0.10em', opacity: 0.75 }}
          >
            · Swapped from {scheduledKey ?? 'schedule'}
          </Text>
        )}
      </Stack>
      <Text as="h1" variant="display-lg" style={{ marginTop: 8, fontStyle: 'italic' }}>
        {REST_DAY.name}
      </Text>
      <Text as="p" variant="body-lg" tone="secondary" style={{ marginTop: 16, maxWidth: 60 * 9 }}>
        {REST_DAY.description}
      </Text>

      {onOpenSwap && (
        <Stack
          direction="row"
          gap={2}
          align="center"
          style={{ marginTop: 20, flexWrap: 'wrap', rowGap: 8 }}
        >
          <Button
            variant="soft"
            accent="stone"
            size="md"
            onClick={onOpenSwap}
            data-testid="swap-day-from-rest"
          >
            Do a workout instead →
          </Button>
          {fromOverride && onResetToScheduled && (
            <MonoChipButton
              data-testid="swap-day-reset-inline"
              onClick={onResetToScheduled}
            >
              Reset to scheduled
            </MonoChipButton>
          )}
        </Stack>
      )}

      <BrushDivider style={{ marginTop: 40 }} />

      <Block gapTop={24} eyebrow="Active rest" headingVariant="title-lg">
        <Text as="p" variant="body-md" tone="secondary" style={{ marginBottom: 16, maxWidth: 60 * 9 }}>
          If you want to move. None of this is required.
        </Text>
        <ul
          data-testid="active-rest-list"
          style={{ listStyle: 'none', margin: 0, padding: 0 }}
        >
          {ACTIVE_REST_ACTIVITIES.map((a, i) => (
            <li
              key={a.key}
              data-activity-key={a.key}
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: 16,
                padding: '16px 0',
                borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)',
                alignItems: 'baseline',
              }}
            >
              <Text as="span" variant="mono-sm" tone="tertiary" style={{ width: 24, textTransform: 'uppercase' }}>
                {String(i + 1).padStart(2, '0')}
              </Text>
              <Stack direction="column" gap={1}>
                <Text as="span" variant="title-md">{a.name}</Text>
                <Text as="span" variant="body-sm" tone="secondary">{a.detail}</Text>
              </Stack>
            </li>
          ))}
        </ul>
      </Block>

      <Block gapTop={48}>
        <BrushDivider />
        <Text as="p" variant="body-sm" tone="tertiary" style={{ marginTop: 24 }}>
          Edit your week in <Link to="/me/settings" style={{ color: 'inherit', textDecoration: 'underline' }}>settings</Link>.
        </Text>
      </Block>
    </Page>
  );
}
