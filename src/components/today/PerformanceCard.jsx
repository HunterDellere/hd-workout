// PerformanceCard — one exercise within an active session. Renders
// prescription eyebrow, name, swap/remove actions, "last time" line,
// suggestion line, the SetRow input surface, and the rest timer when
// this performance is resting.

import { Link } from 'react-router-dom';
import { Stack, Text, MonoChipButton, MASTHEAD_HEIGHT_PX } from '../../design-system/components';
import { findExerciseById } from '../../data';
import { parsePrescription } from '../../data/prescription';
import { SetRow } from '../SetRow';
import { DurationSetRow } from '../DurationSetRow';
import { RestTimer } from '../RestTimer';
import { NoteField } from './NoteField';

// Sticky offset: masthead (56) + SessionProgress (~44 with rule + pad).
// Together they crown the page during a session, so the rest timer sticks
// just below them when scrolled.
const SESSION_PROGRESS_HEIGHT_PX = 44;
const STICKY_TOP_PX = MASTHEAD_HEIGHT_PX + SESSION_PROGRESS_HEIGHT_PX;

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
  onSetNote,
  prSetIds,
  barWeight,
  plateInventory,
  plateCalculatorEnabled,
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
        marginTop: 40,
        padding: '24px 0',
        borderTop: '1px solid var(--border-hairline)',
        // Wave 6.4 #35: focus ring picks up the day's pattern accent.
        '--focus-color': `var(--accent-${accent}-ink)`,
      }}
    >
      <Stack direction="row" align="flex-start" justify="space-between" gap={3}>
        <Stack direction="column" gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
            {performance.prescription?.sets ?? ex.sets}
            {performance.prescription?.rest && ` · rest ${performance.prescription.rest}`}
          </Text>
          {/* Wave 5.3: name links to the canonical exercise detail with a
              quiet "↗" affordance. The session is IDB-persisted, so a
              detail-dive round-trips cleanly. */}
          <Text
            as={Link}
            to={`/library/exercises/${ex.id}`}
            state={{ from: '/' }}
            variant="title-lg"
            data-testid="performance-name-link"
            style={{
              color: 'inherit',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: 8,
            }}
          >
            {ex.name}
            <span
              aria-hidden
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--text-tertiary)',
                opacity: 0.7,
              }}
            >
              ↗
            </span>
          </Text>
          {performance.swappedFromId && (
            <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
              Swapped in this session
            </Text>
          )}
          {/* Wave 5.2: last-time + suggestion stack into one quiet row each.
              Suggestion takes the accent ink; last-time stays tertiary so
              the two lines never compete. */}
          {lastTop && lastTop.top && (
            <Text
              as="span"
              variant="mono-sm"
              tone="tertiary"
              data-testid="last-time"
              style={{ textTransform: 'uppercase', letterSpacing: '0.10em' }}
            >
              Last · {lastTop.top.weight}{lastTop.top.unit ?? ''} × {lastTop.top.reps}
              {lastTop.top.rpe != null ? ` · RPE ${lastTop.top.rpe}` : ''}
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
                letterSpacing: '0.10em',
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

      {/* Rest timer: lives ABOVE the set inputs (between header and
          stepper) so when you're resting you see the countdown right
          next to the next set you're about to log. Sticky so as you
          scroll inside the card it pins to the top. */}
      {isResting && hasLogged && (
        <div
          style={{
            position: 'sticky',
            top: STICKY_TOP_PX,
            zIndex: 3,
            marginTop: 16,
            // Bleed slightly into the page background so the sticky
            // edge reads as a real layer above content scrolling under it.
            paddingTop: 4,
            paddingBottom: 4,
            background: 'var(--surface-page)',
          }}
        >
          <RestTimer
            startedAt={restStartedAt}
            restRaw={restRaw}
            mode={restTimerMode}
            accent={accent}
            onStop={onStopRest}
          />
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        {prescription.kind === 'duration' || prescription.kind === 'rounds' ? (
          <DurationSetRow
            performance={performance}
            prescription={prescription}
            accent={accent}
            onLogSet={(payload) => onLogSet(performance.id, payload)}
            onDiscardSet={(setIdx) => onDiscardSet(performance.id, setIdx)}
          />
        ) : (
          <SetRow
            performance={performance}
            prescription={prescription}
            accent={accent}
            unit={unit}
            lastTop={lastTop}
            barWeight={barWeight}
            plateInventory={plateInventory}
            plateCalculatorEnabled={plateCalculatorEnabled}
            onLogSet={(payload) => onLogSet(performance.id, payload)}
            onDiscardSet={(setIdx) => onDiscardSet(performance.id, setIdx)}
            prSetIds={prSetIds}
          />
        )}
      </div>

      {onSetNote && (
        <NoteField
          value={performance.notes}
          onSave={(text) => onSetNote(performance.id, text)}
          testIdPrefix={`note-${performance.id}`}
        />
      )}
    </div>
  );
}
