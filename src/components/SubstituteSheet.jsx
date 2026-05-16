// SubstituteSheet — bottom sheet listing swap candidates for the active
// exercise during an in-workout session.
//
// Sections:
//   "Same pattern" — every exercise in the catalog that trains the same
//   movement pattern, minus the current exercise.
//
// Variants from `exercise.variants[]` are *informational text only* in the
// catalog (no exerciseId), so we surface them as a callout rather than as
// pickable rows — this avoids implying the user can swap to a thing the
// catalog can't identify.

import { Sheet, Stack, Text, BrushDivider } from '../design-system/components';
import { exercisesForPattern, patternToExercises } from '../data/derive';
import { findExerciseAnywhere } from '../data';
import { isExerciseExcludedByEquipment } from '../data/equipment';
import { useSettings } from '../state/settings-context.js';

function patternForExercise(exerciseId) {
  const map = patternToExercises();
  for (const [key, list] of Object.entries(map)) {
    if (list.some((e) => e.id === exerciseId)) return key;
  }
  return null;
}

function SwapRow({ exercise, onPick, isFirst }) {
  return (
    <button
      type="button"
      data-testid="swap-candidate"
      data-exercise-id={exercise.id}
      onClick={() => onPick(exercise.id)}
      style={{
        all: 'unset',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 16,
        padding: '14px 0',
        borderTop: isFirst ? 'none' : '1px solid var(--border-hairline)',
        width: '100%',
      }}
    >
      <Stack direction="column" gap={1} style={{ flex: 1, minWidth: 0 }}>
        <Text as="span" variant="title-md">
          {exercise.name}
        </Text>
        <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
          {exercise.sets}{exercise.rest ? ` · rest ${exercise.rest}` : ''}
        </Text>
      </Stack>
      {exercise.tier && (
        <Text as="span" variant="mono-sm" tone="tertiary">
          Tier {exercise.tier}
        </Text>
      )}
    </button>
  );
}

export function SubstituteSheet({ open, onClose, currentExerciseId, hasLoggedSets, onPick }) {
  const { settings } = useSettings();
  if (!open) return null;

  const excludedEquipment = settings?.excludedEquipment ?? [];
  const current = currentExerciseId ? findExerciseAnywhere(currentExerciseId) : null;
  const patternKey = current ? patternForExercise(currentExerciseId) : null;
  const rawCandidates = patternKey
    ? exercisesForPattern(patternKey).filter((e) => e.id !== currentExerciseId)
    : [];
  const candidates = rawCandidates.filter((e) => !isExerciseExcludedByEquipment(e, excludedEquipment));
  const hiddenByEquipment = rawCandidates.length - candidates.length;

  return (
    <Sheet open={open} onClose={onClose} ariaLabel="Swap exercise">
      <div
        style={{
          padding: '20px 24px 96px',
          background: 'var(--surface-page)',
          color: 'var(--text-primary)',
          minHeight: '100%',
        }}
      >
        <Stack direction="column" gap={1}>
          <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
            Swap
          </Text>
          <Text as="h2" variant="display-lg" style={{ fontStyle: 'italic', marginTop: 6 }}>
            {current?.exercise?.name ?? 'Exercise'}
          </Text>
        </Stack>

        {hasLoggedSets ? (
          <>
            <BrushDivider style={{ marginTop: 32 }} />
            <Text as="p" variant="body-lg" tone="secondary" style={{ marginTop: 24 }}>
              You have already logged sets on this exercise. Swap is locked
              for the rest of this session — discard those sets first if you
              meant to substitute.
            </Text>
          </>
        ) : candidates.length > 0 ? (
          <>
            <BrushDivider style={{ marginTop: 32 }} />
            <Text as="div" variant="mono-sm" tone="tertiary" style={{ marginTop: 24, textTransform: 'uppercase' }}>
              Same pattern
            </Text>
            <ul
              data-testid="swap-list"
              style={{ listStyle: 'none', padding: 0, margin: '16px 0 0' }}
            >
              {candidates.map((ex, i) => (
                <li key={ex.id}>
                  <SwapRow
                    exercise={ex}
                    onPick={onPick}
                    isFirst={i === 0}
                  />
                </li>
              ))}
            </ul>
            {hiddenByEquipment > 0 && (
              <Text
                as="p"
                variant="mono-sm"
                tone="tertiary"
                data-testid="swap-hidden-count"
                style={{ marginTop: 16, textTransform: 'uppercase' }}
              >
                · {hiddenByEquipment} hidden by your equipment settings
              </Text>
            )}
          </>
        ) : (
          <>
            <BrushDivider style={{ marginTop: 32 }} />
            <Text as="p" variant="body-lg" tone="secondary" style={{ marginTop: 24 }}>
              No catalog alternatives for this pattern yet. As the catalog
              fills in, this list will surface them.
            </Text>
          </>
        )}
      </div>
    </Sheet>
  );
}
