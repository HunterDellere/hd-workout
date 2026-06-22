// CompletionSetRow — minimal log surface for warmup drills.
//
// Warmup drills are unloaded (band pull-aparts, leg swings, CARs) — the
// user doesn't log weight or even count reps. They just do the prescribed
// movement and tap Done. This row renders one Done pill per prescribed
// set; tapping a pill logs a completion (an `isWarmup: true` set with no
// weight/reps/duration data attached).
//
// IA / UX:
//   • One pill per prescribed set, side-by-side. Mobile keeps them
//     tappable; wraps cleanly on narrow widths via Stack wrap.
//   • Tapping a pill fills it (logs a set). Pills must be tapped in
//     order — the next-up pill is the only enabled one, all later ones
//     are dimmed but visible so the user sees what's ahead.
//   • Logged pills show the day's accent ink fill; pending pills are
//     hairline outlined.
//   • Tap a completed pill (or the inline "Edit" affordance) to open
//     the inline editor and Remove the set. There are no quantitative
//     fields for warmup drills, so Remove is the only meaningful edit
//     — but the affordance is exposed using the same "Edit" pattern as
//     SetRow / DurationSetRow / DistanceSetRow so the lifter learns one
//     interaction model.
//
// The logged set carries `isWarmup: true` so SessionProgress filters it
// out of the working-set progress count automatically.

import { useState } from 'react';
import { Stack, Text, Button } from '../design-system/components';
import { useHaptics } from '../hooks/useHaptics';

function formatLoggedAt(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

// Note: the parent passes `prescription` like it does to every other
// set-row variant, but warmup drills are always a single Done tap
// regardless of parsed setsTotal — so we don't destructure it here.
// (React passes it as part of the rest spread silently.)
export function CompletionSetRow({
  performance,
  accent,
  onLogSet,
  onDiscardSet,
  // onEditSet is accepted for prop-symmetry with the other set rows but
  // unused here: warmup completions have no editable fields, so "Edit"
  // is really "open the panel and choose Remove". The action is still
  // routed through onDiscardSet.
  // eslint-disable-next-line no-unused-vars
  onEditSet,
}) {
  const haptic = useHaptics();
  // Warmup drills are always a single bout — the user does the whole
  // prescription ("8 cycles", "2 × 10 each direction", "5 each direction
  // each side") in one go, then taps done. Rendering N pills per drill
  // both clutters the UI and misrepresents the practice: cat-cow's
  // "8 cycles" is one continuous flow, not eight isolated sets. We
  // intentionally ignore the parser's setsTotal here and render one pill.
  const total = 1;
  const completed = (performance.sets ?? []).length > 0 ? 1 : 0;
  const next = completed >= total ? -1 : 0;
  const completedSet = completed > 0 ? performance.sets[performance.sets.length - 1] : null;
  const [editing, setEditing] = useState(false);

  function logOne(index) {
    // Only the next-up pill is tappable; ignore taps on later ones.
    if (index !== next || completed >= total) return;
    onLogSet({ kind: 'completion', isWarmup: true });
    haptic('doubleTap');
  }

  function remove() {
    if (completed === 0) return;
    onDiscardSet(completedSet?.index ?? 1);
    haptic('light');
    setEditing(false);
  }

  function openEdit() {
    if (completed === 0) return;
    setEditing(true);
  }

  return (
    <div data-testid="set-row" data-performance-id={performance.id}>
      <Stack direction="row" gap={2} align="center" wrap>
        {Array.from({ length: total }).map((_, i) => {
          const isDone = i < completed;
          const isNext = i === next && completed < total;
          // Once done, tapping the pill opens the editor (consistent with
          // tap-to-edit on the other set rows). Pre-done, the pill is the
          // log action.
          const tapHandler = isDone ? openEdit : () => logOne(i);
          return (
            <button
              key={i}
              type="button"
              data-testid="completion-pill"
              data-set-index={i}
              data-done={isDone ? '1' : '0'}
              onClick={tapHandler}
              disabled={!isDone && !isNext}
              aria-label={isDone ? `Edit set ${i + 1}` : `Mark set ${i + 1} done`}
              style={{
                all: 'unset',
                cursor: (isDone || isNext) ? 'pointer' : 'default',
                minHeight: 44,
                minWidth: 64,
                padding: '0 14px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 6,
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                boxSizing: 'border-box',
                background: isDone ? `var(--accent-${accent}-ink)` : 'transparent',
                color: isDone
                  ? 'var(--surface-page)'
                  : (isNext ? 'var(--text-primary)' : 'var(--text-tertiary)'),
                border: isDone
                  ? `1px solid var(--accent-${accent}-ink)`
                  : `1px solid var(--border-hairline)`,
                opacity: isDone || isNext ? 1 : 0.5,
                transition: 'background-color 160ms ease, color 160ms ease, opacity 160ms ease',
              }}
            >
              {isDone ? '✓ Done' : `Set ${i + 1}`}
            </button>
          );
        })}
        {completed >= total && !editing && (
          <button
            type="button"
            data-testid="edit-logged-set"
            aria-label="Edit completed set"
            onClick={openEdit}
            style={{
              all: 'unset',
              cursor: 'pointer',
              minHeight: 36,
              padding: '0 12px',
              border: '1px solid var(--border-hairline)',
              borderRadius: 4,
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
            }}
          >
            Edit
          </button>
        )}
      </Stack>

      {/* Inline editor panel — appears below the pill row when the user
          taps the completed pill or the Edit button. There are no
          quantitative fields to edit for warmup completions, so the
          panel offers timestamp context plus a Remove action. Same
          visual idiom as the LoggedSetEditor in SetRow.jsx so the
          lifter learns one pattern across set types. */}
      {editing && completed > 0 && (
        <div
          data-testid="logged-set-editor"
          data-set-index={completedSet?.index ?? 1}
          style={{
            marginTop: 12,
            padding: '12px 14px',
            border: '1px solid var(--border-hairline)',
            borderLeft: `2px solid var(--accent-${accent}-ink)`,
            borderRadius: 8,
            background: 'var(--surface-page)',
          }}
        >
          <Stack direction="column" gap={2}>
            <Stack direction="row" align="baseline" justify="space-between" gap={2}>
              <Text
                as="span"
                variant="mono-sm"
                tone="tertiary"
                style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}
              >
                Editing warmup set
              </Text>
              {completedSet?.loggedAt && (
                <Text as="span" variant="mono-sm" tone="tertiary">
                  {formatLoggedAt(completedSet.loggedAt)}
                </Text>
              )}
            </Stack>
            <Text as="p" variant="body-sm" tone="secondary">
              Warmup drills don&apos;t log weight or reps — just tap done.
              If you tapped this by mistake, remove the entry and re-mark
              it when you&apos;ve actually done the work.
            </Text>
            <Stack direction="row" gap={2} justify="space-between" align="center">
              <Button
                variant="bare"
                size="sm"
                onClick={() => setEditing(false)}
                data-testid="edit-logged-cancel"
              >
                Cancel
              </Button>
              <button
                type="button"
                data-testid="edit-logged-discard"
                onClick={remove}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  padding: '8px 14px',
                  border: '1px solid var(--state-warn-ink, var(--border-strong))',
                  borderRadius: 4,
                  color: 'var(--state-warn-ink, var(--text-primary))',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                Remove set
              </button>
            </Stack>
          </Stack>
        </div>
      )}
    </div>
  );
}
