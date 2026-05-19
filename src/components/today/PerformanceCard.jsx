// PerformanceCard — one exercise within an active session. Renders
// prescription eyebrow, name, swap/remove actions, "last time" line,
// suggestion line, the SetRow input surface, and the rest timer when
// this performance is resting.

import { useMemo, useState } from 'react';
import { Stack, Text, MonoChipButton, MASTHEAD_HEIGHT_PX } from '../../design-system/components';
import { findExerciseById } from '../../data';
import { parsePrescription } from '../../data/prescription';
import { warmupLadder, shouldShowWarmupRamp } from '../../data/warmup';
import { SetRow } from '../SetRow';
import { DurationSetRow } from '../DurationSetRow';
import { DistanceSetRow } from '../DistanceSetRow';
import { CompletionSetRow } from '../CompletionSetRow';
import { RestTimer } from '../RestTimer';
import { ExerciseSheet } from '../ExerciseSheet';
import { NoteField } from './NoteField';

// Sticky offset: masthead (56) + SessionProgress (~44 with rule + pad).
// Together they crown the page during a session, so the rest timer sticks
// just below them when scrolled.
const SESSION_PROGRESS_HEIGHT_PX = 44;
const STICKY_TOP_PX = MASTHEAD_HEIGHT_PX + SESSION_PROGRESS_HEIGHT_PX;

// Compact stepper buttons for adjusting prescribed set count inline.
// Smaller than mid-set steppers (these aren't eyes-up controls) but
// still tappable. Match the hairline aesthetic of the eyebrow row.
const adjustBtnStyle = {
  all: 'unset',
  width: 28,
  height: 28,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid var(--border-hairline)',
  borderRadius: 4,
  fontFamily: 'var(--font-mono)',
  fontSize: 14,
  color: 'var(--text-secondary)',
  cursor: 'pointer',
};

// Derive the working weight to ramp toward. Priority:
//   1. The suggestion (today's intelligent target, if computed)
//   2. The last top set from history
// If neither exists, no ladder — we don't guess.
function workingWeightFor(suggestion, lastTop) {
  if (suggestion && typeof suggestion.weight === 'number') return suggestion.weight;
  if (lastTop?.top && typeof lastTop.top.weight === 'number') return lastTop.top.weight;
  return null;
}

function WarmupLadderBlock({ exercise, suggestion, lastTop, unit, accent, hasLogged }) {
  // Auto-suppress once the user is into working sets — the warmup is
  // over by then and we shouldn't keep advertising it.
  if (hasLogged) return null;
  if (!shouldShowWarmupRamp(exercise)) return null;
  const workingWeight = workingWeightFor(suggestion, lastTop);
  if (workingWeight == null) return null;
  const ladder = warmupLadder(workingWeight, { unit });
  if (ladder.length === 0) return null;
  return (
    <div
      data-testid="warmup-ladder"
      style={{
        marginTop: 16,
        padding: '12px 14px',
        border: '1px solid var(--border-hairline)',
        borderRadius: 8,
        // A whisper of the day's accent so the block reads as part of
        // the lift's identity, not a generic info panel. Same idiom as
        // the hero's left-edge rule.
        borderLeft: `2px solid var(--accent-${accent}-solid)`,
      }}
    >
      <Stack direction="row" justify="space-between" align="baseline" gap={2}>
        <Text
          as="div"
          variant="mono-sm"
          tone="tertiary"
          style={{ textTransform: 'uppercase', letterSpacing: '0.14em' }}
        >
          Warmup ramp
        </Text>
        <Text
          as="div"
          variant="mono-sm"
          tone="tertiary"
          style={{ opacity: 0.7 }}
        >
          → {workingWeight}{unit}
        </Text>
      </Stack>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: '8px 0 0',
          display: 'grid',
          gridTemplateColumns: 'auto auto auto 1fr',
          columnGap: 14,
          rowGap: 4,
          alignItems: 'baseline',
        }}
      >
        {ladder.map((rung) => (
          <li
            key={rung.percent}
            data-testid="warmup-rung"
            data-percent={rung.percent}
            style={{ display: 'contents' }}
          >
            <Text
              as="span"
              variant="mono-sm"
              tone="tertiary"
              style={{ opacity: 0.6 }}
            >
              {Math.round(rung.percent * 100)}%
            </Text>
            <Text
              as="span"
              variant="body-md"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {rung.weight}{unit}
            </Text>
            <Text
              as="span"
              variant="mono-sm"
              tone="tertiary"
              style={{ opacity: 0.85 }}
            >
              × {rung.reps}
            </Text>
            <span />
          </li>
        ))}
      </ul>
    </div>
  );
}

// Quiet relative-time suffix for the "Last" line — "yesterday",
// "3d ago", "2wk ago". Anything older than ~3 months reads as "long
// ago" so we never print "147d ago" (data without judgment).
function relativeTimeFrom(iso, nowMs) {
  if (!iso) return null;
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return null;
  const dayMs = 86400000;
  const days = Math.max(0, Math.round((nowMs - then) / dayMs));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 14) return '1wk ago';
  if (days < 56) return `${Math.round(days / 7)}wk ago`;
  if (days < 365) return `${Math.round(days / 30)}mo ago`;
  return 'long ago';
}

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

function describeManualSets(sets) {
  if (!sets || sets.length === 0) return '';
  const first = sets[0];
  if (first.kind === 'duration' || first.kind === 'rounds') {
    const total = sets.reduce((n, s) => n + (s.durationSec ?? 0), 0);
    return total >= 60 ? `${Math.round(total / 60)} min` : `${total}s`;
  }
  if (first.kind === 'distance') {
    const total = sets.reduce((n, s) => n + (s.distanceM ?? 0), 0);
    return `${Math.round(total)}m`;
  }
  // Strength — collapse to "N sets · top {weight} × {reps}".
  const weighted = sets.filter((s) => s.weight != null);
  if (weighted.length === 0) return `${sets.length} set${sets.length === 1 ? '' : 's'}`;
  const top = weighted.reduce(
    (best, s) => (s.weight > best.weight || (s.weight === best.weight && s.reps > best.reps) ? s : best),
    weighted[0],
  );
  return `${weighted.length} set${weighted.length === 1 ? '' : 's'} · top ${top.weight}${top.unit ?? ''} × ${top.reps}`;
}

function formatLocalTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
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
  onEditSet,
  onSwap,
  onStopRest,
  onRemove,
  onAdjustSets,
  onSetNote,
  prSetIds,
  barWeight,
  plateInventory,
  plateCalculatorEnabled,
  autoProgression,
  manualEntriesToday,
  onCreditManualEntry,
}) {
  // Hooks declared above any early return so call order is stable.
  // One-shot timestamp captured at mount — keeps `Date.now()` out of
  // the render path so React 19's purity checker stays happy. The
  // relative-time string is fine to be stale by a few minutes during
  // an active session.
  const [mountedAtMs] = useState(() => Date.now());
  // Inline exercise-info sheet. Keeps Today's scroll position intact
  // (no route change), and the Sheet primitive already supports
  // swipe-down-to-dismiss + scrim tap + escape.
  const [infoOpen, setInfoOpen] = useState(false);
  const lastAgo = useMemo(
    () => relativeTimeFrom(lastTop?.endedAt, mountedAtMs),
    [lastTop, mountedAtMs],
  );
  const ex = findExerciseById(performance.exerciseId);
  if (!ex) return null;
  const prescription = parsePrescription(performance.prescription?.sets ?? ex.sets);
  const hasLogged = performance.sets.length > 0;
  const suggestionText = suggestionLine(suggestion, unit);

  // How many of the first N sets should auto-default to "warmup"? Same
  // contract as the WarmupLadderBlock: only fires when the lift is a
  // ramp-worthy compound AND the computed ladder has rungs (i.e., the
  // working weight is above the load floor). The SetRow uses this to
  // pre-flag the first N sets as warmups so the user doesn't have to
  // remember to tap the toggle on every ramp rung.
  const autoWarmupRungs = (() => {
    if (!shouldShowWarmupRamp(ex)) return 0;
    const workingWeight = workingWeightFor(suggestion, lastTop);
    if (workingWeight == null) return 0;
    return warmupLadder(workingWeight, { unit }).length;
  })();

  // Warmup performances render with reduced chrome — no "last time" or
  // suggestion lines (irrelevant for movement-prep drills), no manual-
  // log credit banner, tighter vertical padding. The user's main job in
  // a warmup card is to read the prescription and tap Done.
  const isWarmupSection = performance.sectionKey === 'warmup';

  return (
    <div
      data-testid="performance-card"
      data-performance-id={performance.id}
      data-section-key={performance.sectionKey}
      style={{
        marginTop: isWarmupSection ? 20 : 40,
        padding: isWarmupSection ? '14px 0' : '24px 0',
        borderTop: '1px solid var(--border-hairline)',
        // Wave 6.4 #35: focus ring picks up the day's pattern accent.
        '--focus-color': `var(--accent-${accent}-ink)`,
      }}
    >
      <Stack direction="row" align="flex-start" justify="space-between" gap={3}>
        <Stack direction="column" gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" align="center" gap={2} wrap>
            <Text
              as="span"
              variant="mono-sm"
              tone="tertiary"
              style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}
            >
              {performance.prescription?.sets ?? ex.sets}
              {performance.prescription?.rest && ` · ${performance.prescription.rest} rest`}
            </Text>
            {!isWarmupSection && onAdjustSets && (() => {
              const raw = String(performance.prescription?.sets ?? '').trim();
              const m = raw.match(/^(\d+)/);
              const current = m ? Number.parseInt(m[1], 10) : null;
              const floor = Math.max(1, performance.sets.length);
              const canDecrement = Boolean(current) && current > floor;
              return (
                <Stack direction="row" align="center" gap={1} data-testid="adjust-sets">
                  <button
                    type="button"
                    aria-label="Remove a set from prescription"
                    data-testid="adjust-sets-down"
                    onClick={() => canDecrement && onAdjustSets(performance.id, -1)}
                    disabled={!canDecrement}
                    style={{
                      ...adjustBtnStyle,
                      opacity: canDecrement ? 1 : 0.35,
                      cursor: canDecrement ? 'pointer' : 'not-allowed',
                    }}
                  >
                    −
                  </button>
                  <button
                    type="button"
                    aria-label="Add a set to prescription"
                    data-testid="adjust-sets-up"
                    onClick={() => onAdjustSets(performance.id, +1)}
                    disabled={!current}
                    style={{
                      ...adjustBtnStyle,
                      opacity: current ? 1 : 0.35,
                      cursor: current ? 'pointer' : 'not-allowed',
                    }}
                  >
                    +
                  </button>
                </Stack>
              );
            })()}
          </Stack>
          {/* Name opens the exercise-info Sheet inline. Previously this
              was a route navigation (/library/exercises/:id), which lost
              the user's scroll position when they returned mid-session.
              The sheet's swipe-down dismiss keeps the page underneath
              static, so checking technique before a set is friction-free. */}
          <Text
            as="button"
            type="button"
            onClick={() => setInfoOpen(true)}
            variant="title-lg"
            data-testid="performance-name-link"
            aria-label={`Show details for ${ex.name}`}
            style={{
              all: 'unset',
              cursor: 'pointer',
              color: 'inherit',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: 8,
              textAlign: 'left',
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
            <Text
              as="span"
              variant="mono-sm"
              tone="tertiary"
              style={{
                textTransform: 'uppercase',
                letterSpacing: '0.10em',
                opacity: 0.7,
              }}
            >
              Swapped
            </Text>
          )}
          {/* Wave 5.2: last-time + suggestion stack into one quiet row each.
              Suggestion takes the accent ink; last-time stays tertiary so
              the two lines never compete. Suppressed entirely for warmup
              drills — history and progression suggestions don't apply to
              movement prep. */}
          {!isWarmupSection && lastTop && lastTop.top && (
            <Text
              as="span"
              variant="mono-sm"
              tone="tertiary"
              data-testid="last-time"
              style={{ textTransform: 'uppercase', letterSpacing: '0.10em' }}
            >
              Last · {lastTop.top.weight}{lastTop.top.unit ?? ''} × {lastTop.top.reps}
              {lastTop.top.rpe != null ? ` · RPE ${lastTop.top.rpe}` : ''}
              {lastAgo ? ` · ${lastAgo}` : ''}
            </Text>
          )}
          {!isWarmupSection && suggestionText && (
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

      {!isWarmupSection && !hasLogged && Array.isArray(manualEntriesToday) && manualEntriesToday.length > 0 && (
        <div
          data-testid="manual-credit-banner"
          style={{
            marginTop: 16,
            padding: '12px 14px',
            border: '1px solid var(--border-hairline)',
            borderLeft: `2px solid var(--accent-${accent}-solid)`,
            borderRadius: 8,
          }}
        >
          {manualEntriesToday.map((entry, i) => {
            const summary = describeManualSets(entry.performances?.[0]?.sets);
            const when = formatLocalTime(entry.startedAt);
            return (
              <Stack
                key={entry.id}
                direction="row"
                align="center"
                justify="space-between"
                gap={2}
                style={{
                  marginTop: i === 0 ? 0 : 8,
                  paddingTop: i === 0 ? 0 : 8,
                  borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)',
                }}
              >
                <Stack direction="column" gap={1} style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    as="span"
                    variant="mono-sm"
                    style={{
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      color: `var(--accent-${accent}-ink)`,
                      fontWeight: 600,
                    }}
                  >
                    Logged earlier · {when}
                  </Text>
                  <Text as="span" variant="body-sm" tone="secondary">
                    {summary}
                  </Text>
                </Stack>
                <button
                  type="button"
                  data-testid="credit-manual-entry"
                  data-manual-id={entry.id}
                  onClick={() => onCreditManualEntry?.(performance.id, entry.id)}
                  style={{
                    all: 'unset',
                    cursor: 'pointer',
                    flexShrink: 0,
                    padding: '8px 14px',
                    border: `1px solid var(--accent-${accent}-ink)`,
                    borderRadius: 4,
                    color: `var(--accent-${accent}-ink)`,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    fontWeight: 600,
                  }}
                >
                  Pull in
                </button>
              </Stack>
            );
          })}
        </div>
      )}

      <WarmupLadderBlock
        exercise={ex}
        suggestion={suggestion}
        lastTop={lastTop}
        unit={unit}
        accent={accent}
        hasLogged={hasLogged}
      />

      {/* Rest timer: lives ABOVE the set inputs (between header and
          stepper) so when you're resting you see the countdown right
          next to the next set you're about to log. Sticky so as you
          scroll inside the card it pins to the top. Suppressed entirely
          when the user has set restTimerMode='off' — they log and move on. */}
      {isResting && hasLogged && restTimerMode !== 'off' && (
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
        {performance.sectionKey === 'warmup' ? (
          // Warmup drills use the completion row — no weight, no reps,
          // just Done. Logged sets carry isWarmup:true so SessionProgress
          // doesn't count them as working sets.
          <CompletionSetRow
            performance={performance}
            prescription={prescription}
            accent={accent}
            onLogSet={(payload) => onLogSet(performance.id, payload)}
            onDiscardSet={(setIdx) => onDiscardSet(performance.id, setIdx)}
            onEditSet={onEditSet
              ? (setIdx, patch) => onEditSet(performance.id, setIdx, patch)
              : null}
          />
        ) : prescription.kind === 'distance' ? (
          <DistanceSetRow
            performance={performance}
            prescription={prescription}
            accent={accent}
            onLogSet={(payload) => onLogSet(performance.id, payload)}
            onDiscardSet={(setIdx) => onDiscardSet(performance.id, setIdx)}
            onEditSet={onEditSet
              ? (setIdx, patch) => onEditSet(performance.id, setIdx, patch)
              : null}
          />
        ) : prescription.kind === 'duration' || prescription.kind === 'rounds' ? (
          <DurationSetRow
            performance={performance}
            prescription={prescription}
            accent={accent}
            onLogSet={(payload) => onLogSet(performance.id, payload)}
            onDiscardSet={(setIdx) => onDiscardSet(performance.id, setIdx)}
            onEditSet={onEditSet
              ? (setIdx, patch) => onEditSet(performance.id, setIdx, patch)
              : null}
          />
        ) : (
          <SetRow
            performance={performance}
            prescription={prescription}
            accent={accent}
            unit={unit}
            lastTop={lastTop}
            autoProgression={autoProgression}
            suggestion={suggestion}
            barWeight={barWeight}
            plateInventory={plateInventory}
            plateCalculatorEnabled={plateCalculatorEnabled}
            autoWarmupRungs={autoWarmupRungs}
            onLogSet={(payload) => onLogSet(performance.id, payload)}
            onDiscardSet={(setIdx) => onDiscardSet(performance.id, setIdx)}
            onEditSet={onEditSet
              ? (setIdx, patch) => onEditSet(performance.id, setIdx, patch)
              : null}
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

      <ExerciseSheet
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        exercise={ex}
      />
    </div>
  );
}
