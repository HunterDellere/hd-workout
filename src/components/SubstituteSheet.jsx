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

import { useState } from 'react';
import { Sheet, Stack, Text, BrushDivider } from '../design-system/components';
import { exercisesForPattern, patternToExercises } from '../data/derive';
import { findExerciseAnywhere, rawCatalogList } from '../data';
import { isExerciseExcludedByEquipment } from '../data/equipment';
import { useSettings } from '../state/settings-context.js';
import { ExerciseSheet } from './ExerciseSheet';

function patternForExercise(exerciseId) {
  const map = patternToExercises();
  for (const [key, list] of Object.entries(map)) {
    if (list.some((e) => e.id === exerciseId)) return key;
  }
  return null;
}

// Build the full swap candidate pool. Strategy, in priority order:
//   1. Same-pattern alternates (existing behaviour) — when the current
//      exercise belongs to a movement pattern, surface every catalog
//      exercise tagged with that pattern.
//   2. Same-section catalog peers — covers isolation sections
//      (triceps, biceps, rear-delt, calves, adductors, etc.) that
//      don't have a primary movement pattern.
//   3. Shared-tag relatives — bridges curated subgroups
//      (e.g. 'long-head', 'lateral-head' for triceps) so the user
//      sees movements that train the same head/region first.
// Output preserves order: pattern → section → tag, de-duplicated by id.
function buildSwapCandidates(currentExerciseId) {
  const current = currentExerciseId ? findExerciseAnywhere(currentExerciseId) : null;
  if (!current) return { candidates: [], current: null, patternKey: null };

  const sectionKey = current.section?.key ?? null;
  const patternKey = patternForExercise(currentExerciseId);
  const currentTags = new Set(current.exercise.tags ?? []);

  const out = [];
  const seen = new Set([currentExerciseId]);

  // 1. Same pattern.
  if (patternKey) {
    for (const ex of exercisesForPattern(patternKey)) {
      if (seen.has(ex.id)) continue;
      seen.add(ex.id);
      out.push(ex);
    }
  }

  // 2 & 3. Walk the raw catalog for same-section peers and shared-tag
  // relatives. We rank section peers ahead of cross-section tag matches.
  const catalog = rawCatalogList();
  const sectionPeers = [];
  const tagPeers = [];
  for (const ex of catalog) {
    if (seen.has(ex.id)) continue;
    const sameSection = sectionKey && ex._section?.key === sectionKey;
    const sharedTag = (ex.tags ?? []).some((t) => currentTags.has(t));
    if (sameSection) {
      sectionPeers.push(ex);
      seen.add(ex.id);
    } else if (sharedTag) {
      tagPeers.push(ex);
      seen.add(ex.id);
    }
  }

  return {
    candidates: [...out, ...sectionPeers, ...tagPeers],
    current,
    patternKey,
  };
}

function SwapRow({ exercise, onPick, onDetails, isFirst }) {
  return (
    <div
      data-testid="swap-candidate-row"
      data-exercise-id={exercise.id}
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 12,
        padding: '14px 0',
        borderTop: isFirst ? 'none' : '1px solid var(--border-hairline)',
        width: '100%',
      }}
    >
      <button
        type="button"
        data-testid="swap-candidate"
        data-exercise-id={exercise.id}
        onClick={() => onPick(exercise.id)}
        style={{
          all: 'unset',
          cursor: 'pointer',
          flex: 1,
          minWidth: 0,
        }}
      >
        <Stack direction="column" gap={1}>
          <Text as="span" variant="title-md">
            {exercise.name}
          </Text>
          <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
            {exercise.sets}{exercise.rest ? ` · rest ${exercise.rest}` : ''}
          </Text>
        </Stack>
      </button>
      <Stack direction="row" gap={2} align="center" style={{ flexShrink: 0 }}>
        <button
          type="button"
          data-testid="swap-candidate-details"
          data-exercise-id={exercise.id}
          aria-label={`Details for ${exercise.name}`}
          onClick={() => onDetails(exercise.id)}
          style={{
            all: 'unset',
            cursor: 'pointer',
            padding: '6px 10px',
            borderRadius: 4,
            border: '1px solid var(--border-hairline)',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
          }}
        >
          Details
        </button>
        {exercise.tier && (
          <Text as="span" variant="mono-sm" tone="tertiary">
            T{exercise.tier}
          </Text>
        )}
      </Stack>
    </div>
  );
}

export function SubstituteSheet({ open, onClose, currentExerciseId, hasLoggedSets, onPick }) {
  const { settings } = useSettings();
  const [peekExerciseId, setPeekExerciseId] = useState(null);
  const peekExercise = peekExerciseId ? findExerciseAnywhere(peekExerciseId)?.exercise : null;
  if (!open) return null;

  const excludedEquipment = settings?.excludedEquipment ?? [];
  const { candidates: rawCandidates, current } = buildSwapCandidates(currentExerciseId);
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
              Alternatives
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
                    onDetails={setPeekExerciseId}
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
            {hiddenByEquipment > 0 ? (
              <Text as="p" variant="body-lg" tone="secondary" style={{ marginTop: 24 }}>
                All catalog alternatives need equipment you've excluded in
                Settings. Re-enable a tool to see swaps, or skip the swap
                for now.
              </Text>
            ) : (
              <Text as="p" variant="body-lg" tone="secondary" style={{ marginTop: 24 }}>
                No catalog alternatives yet. As the catalog fills in, this
                list will surface them.
              </Text>
            )}
          </>
        )}
      </div>
      <ExerciseSheet
        open={Boolean(peekExercise)}
        onClose={() => setPeekExerciseId(null)}
        exercise={peekExercise}
      />
    </Sheet>
  );
}
