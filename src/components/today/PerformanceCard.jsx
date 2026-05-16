// PerformanceCard — one exercise within an active session. Renders
// prescription eyebrow, name, swap/remove actions, "last time" line,
// suggestion line, the SetRow input surface, and the rest timer when
// this performance is resting.

import { Stack, Text, MonoChipButton } from '../../design-system/components';
import { findExerciseById } from '../../data';
import { parsePrescription } from '../../data/prescription';
import { SetRow } from '../SetRow';
import { RestTimer } from '../RestTimer';

function suggestionLine(suggestion, unit) {
  if (!suggestion) return null;
  const reason = suggestion.reason ? ` · ${suggestion.reason}` : '';
  switch (suggestion.kind) {
    case 'progress':
      return `Try ${suggestion.weight}${unit} × ${suggestion.reps} · +${suggestion.increment}${unit}${reason}`;
    case 'hold':
      return `Hold ${suggestion.weight}${unit} × ${suggestion.reps}${reason}`;
    case 'deload':
      return `Deload to ${suggestion.weight}${unit}${reason}`;
    default:
      return null;
  }
}

export function PerformanceCard({
  performance,
  accent,
  unit,
  restTimerMode,
  isResting,
  restStartedAt,
  restRaw,
  lastTop,
  suggestion,
  onLogSet,
  onDiscardSet,
  onSwap,
  onStopRest,
  onRemove,
  prSetIds,
}) {
  const ex = findExerciseById(performance.exerciseId);
  if (!ex) return null;
  const prescription = parsePrescription(performance.prescription?.sets ?? ex.sets);
  const hasLogged = performance.sets.length > 0;
  const suggestionText = suggestionLine(suggestion, unit);

  return (
    <div
      data-testid="performance-card"
      data-performance-id={performance.id}
      style={{
        marginTop: 32,
        padding: '20px 0',
        borderTop: '1px solid var(--border-hairline)',
      }}
    >
      <Stack direction="row" align="flex-start" justify="space-between" gap={3}>
        <Stack direction="column" gap={1} style={{ flex: 1, minWidth: 0 }}>
          <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
            {performance.prescription?.sets ?? ex.sets}
            {performance.prescription?.rest && ` · rest ${performance.prescription.rest}`}
          </Text>
          <Text as="h2" variant="title-lg">
            {ex.name}
          </Text>
          {performance.swappedFromId && (
            <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
              Swapped in this session
            </Text>
          )}
          {lastTop && lastTop.top && (
            <Text
              as="span"
              variant="mono-sm"
              tone="tertiary"
              data-testid="last-time"
              style={{ textTransform: 'uppercase' }}
            >
              Last time · {lastTop.top.weight}{lastTop.top.unit ?? ''} × {lastTop.top.reps}
            </Text>
          )}
          {suggestionText && (
            <Text
              as="span"
              variant="mono-sm"
              data-testid="suggestion-line"
              data-suggestion-kind={suggestion.kind}
              style={{
                textTransform: 'uppercase',
                color: suggestion.kind === 'deload'
                  ? 'var(--state-warn-ink)'
                  : `var(--accent-${accent}-ink)`,
              }}
            >
              {suggestionText}
            </Text>
          )}
        </Stack>
        <Stack direction="row" gap={2} align="center">
          <MonoChipButton
            onClick={() => onSwap(performance.id)}
            data-testid="swap-button"
            aria-label={`Swap ${ex.name}`}
          >
            Swap
          </MonoChipButton>
          {onRemove && (
            <MonoChipButton
              onClick={onRemove}
              data-testid="remove-performance"
              aria-label={`Remove ${ex.name}`}
            >
              Remove
            </MonoChipButton>
          )}
        </Stack>
      </Stack>

      <div style={{ marginTop: 20 }}>
        <SetRow
          performance={performance}
          prescription={prescription}
          accent={accent}
          unit={unit}
          onLogSet={(payload) => onLogSet(performance.id, payload)}
          onDiscardSet={(setIdx) => onDiscardSet(performance.id, setIdx)}
          prSetIds={prSetIds}
        />
      </div>

      {isResting && hasLogged && (
        <div style={{ marginTop: 20 }}>
          <RestTimer
            startedAt={restStartedAt}
            restRaw={restRaw}
            mode={restTimerMode}
            accent={accent}
            onStop={onStopRest}
          />
        </div>
      )}
    </div>
  );
}
