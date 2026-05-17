// SlotPicker — bottom sheet for ADDING an exercise to a section slot in
// the active session. Defaults to candidates that match the section's
// natural movement patterns (inferred from the tags of the section's
// existing exercises), with an "All catalog" escape hatch.
//
// This is distinct from SubstituteSheet which swaps an exercise for a
// same-pattern alternate. SlotPicker is purposefully broader so a user
// can drop a corrective into a regular push day, or a spine drill into
// a legs day, without leaving the section.
//
// Filter behaviour:
//   - Strength-day sections (push / pull / legs / core) infer their
//     pattern set from existing exercises' tags. Chips for each inferred
//     pattern are surfaced, plus a "Categories" group for recovery tags.
//   - Recovery sections fall back to the hand-mapped
//     SECTION_DEFAULT_CATEGORIES.
//   - "All catalog" toggle removes every filter — last-resort escape.

import { useMemo, useState } from 'react';
import { Sheet, Stack, Text, BrushDivider } from '../design-system/components';
import { CATEGORIES, PATTERN_BY_KEY } from '../data/patterns';
import { rawCatalogList, findExerciseAnywhere } from '../data';
import { isExerciseExcludedByEquipment } from '../data/equipment';
import { useSettings } from '../state/settings-context.js';
import { ExerciseSheet } from './ExerciseSheet';

// Section-key → categories that "belong" here. Used only for recovery-day
// sections whose exercises are tagged with `categories` rather than
// movement-pattern tags.
const SECTION_DEFAULT_CATEGORIES = {
  posture:         ['posture'],
  imbalance:       ['imbalance'],
  'spine-health':  ['spine'],
  healthspan:      ['healthspan', 'grip'],
  'facial-cervical': ['facial'],
  warmup:          ['posture', 'healthspan'],
  activation:      ['posture', 'spine', 'imbalance'],
};

// Tags that map 1:1 onto a movement pattern key. Other free-form tags
// (e.g. 'compound', 'foundational', 'finisher') are ignored when
// inferring section patterns.
const PATTERN_KEYS = new Set(Object.keys(PATTERN_BY_KEY));

function allCatalogExercises() {
  // The raw catalog list — every authored exercise across push/pull/legs/
  // core/recovery, regardless of whether a program references it.
  // Movements added to the catalog (e.g. home A/S additions) must be
  // pickable even if no program seeds them.
  return rawCatalogList();
}

function exercisePatternTags(ex) {
  const tags = ex.tags ?? [];
  return tags.filter((t) => PATTERN_KEYS.has(t));
}

function exerciseMatchesCategories(ex, categoryKeys) {
  if (!ex.categories) return false;
  return ex.categories.some((c) => categoryKeys.includes(c));
}

function exerciseMatchesPatterns(ex, patternKeys) {
  const own = exercisePatternTags(ex);
  if (own.length === 0) return false;
  return own.some((p) => patternKeys.includes(p));
}

// Infer the section's natural pattern set from its existing exercises'
// tags. Returns the unique pattern keys present in ≥1 exercise.
function inferSectionPatterns(sectionExercises) {
  const seen = new Set();
  for (const ex of sectionExercises ?? []) {
    for (const t of exercisePatternTags(ex)) {
      seen.add(t);
    }
  }
  return [...seen];
}

function PickRow({ exercise, onPick, onDetails, isFirst }) {
  return (
    <div
      data-testid="slot-candidate-row"
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
        data-testid="slot-candidate"
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
            {exercise.sets}{exercise.rest && exercise.rest !== '—' ? ` · rest ${exercise.rest}` : ''}
          </Text>
        </Stack>
      </button>
      <Stack direction="row" gap={2} align="center" style={{ flexShrink: 0 }}>
        <button
          type="button"
          data-testid="slot-candidate-details"
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

function FilterChip({ active, label, onClick, testId }) {
  return (
    <button
      type="button"
      data-testid={testId}
      data-active={active ? '1' : '0'}
      onClick={onClick}
      style={{
        all: 'unset',
        cursor: 'pointer',
        padding: '6px 12px',
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

export function SlotPicker({
  open,
  onClose,
  sectionKey,
  sectionTitle,
  sectionExercises = [],
  excludeIds = [],
  onPick,
}) {
  const [showAll, setShowAll] = useState(false);
  const [activePatterns, setActivePatterns] = useState([]);
  const [activeCategories, setActiveCategories] = useState([]);
  const [query, setQuery] = useState('');
  // Details peek lives inside the picker so opening it doesn't dismiss
  // the user's filter state.
  const [peekExerciseId, setPeekExerciseId] = useState(null);
  const peekExercise = peekExerciseId ? findExerciseAnywhere(peekExerciseId)?.exercise : null;
  const { settings } = useSettings();
  const excludedEquipment = useMemo(
    () => settings?.excludedEquipment ?? [],
    [settings?.excludedEquipment],
  );

  // Inferred pattern set for the section. Stable per (sectionKey, ex-list-shape).
  const inferredPatterns = useMemo(
    () => inferSectionPatterns(sectionExercises),
    [sectionExercises],
  );

  const defaultCategories = useMemo(
    () => SECTION_DEFAULT_CATEGORIES[sectionKey] ?? [],
    [sectionKey],
  );

  const catalog = useMemo(() => allCatalogExercises(), []);

  // The most reliable signal for "what exercises are reasonable to add
  // to section X" is: exercises that canonically live in section X
  // across the catalog. Section key is what the user clicked — trust it.
  // Patterns and categories are *broadening* tools layered on top.
  //
  // Decision tree:
  //   1. showAll → no filter (whole catalog).
  //   2. user toggled chips → chip filter takes over.
  //   3. otherwise → narrow by `ex._section.key === sectionKey` (the
  //      catalog section). Includes inferred-pattern matches as a small
  //      widening so cross-section relatives surface too.
  //   4. custom sections (no catalog match) fall back to inferred
  //      patterns from the section's existing exercises, then to
  //      default categories.
  const candidates = useMemo(() => {
    const notExcluded = catalog
      .filter((ex) => !excludeIds.includes(ex.id))
      .filter((ex) => !isExerciseExcludedByEquipment(ex, excludedEquipment));
    if (showAll) return notExcluded;

    // Explicit chip selection takes priority.
    if (activePatterns.length > 0 || activeCategories.length > 0) {
      return notExcluded.filter((ex) => {
        const patternOk = activePatterns.length === 0
          || exerciseMatchesPatterns(ex, activePatterns);
        const categoryOk = activeCategories.length === 0
          || exerciseMatchesCategories(ex, activeCategories);
        if (activePatterns.length > 0 && activeCategories.length > 0) {
          return patternOk || categoryOk;
        }
        return patternOk && categoryOk;
      });
    }

    // Section-key-first scoping. The question "is this a real catalog
    // section?" is answered against the FULL catalog (before excludeIds),
    // so a section whose every exercise is already programmed still
    // identifies itself as a real section — we just then show an empty
    // / narrow result with the broaden affordances available.
    const sectionHasCatalogMatch = catalog.some((ex) => ex._section?.key === sectionKey);
    if (sectionHasCatalogMatch) {
      const sectionMatch = notExcluded.filter((ex) => ex._section?.key === sectionKey);
      if (inferredPatterns.length > 0) {
        // Widen with same-pattern cross-section relatives.
        const patternRelatives = notExcluded.filter((ex) => (
          ex._section?.key !== sectionKey
          && exerciseMatchesPatterns(ex, inferredPatterns)
        ));
        return [...sectionMatch, ...patternRelatives];
      }
      return sectionMatch;
    }

    // Custom section (e.g. user-named "Cardio" group) — no catalog
    // match. Fall back to inferred patterns from existing entries, then
    // to hand-mapped default categories.
    if (inferredPatterns.length > 0) {
      const narrow = notExcluded.filter((ex) => exerciseMatchesPatterns(ex, inferredPatterns));
      if (narrow.length > 0) return narrow;
    }
    if (defaultCategories.length > 0) {
      const narrow = notExcluded.filter((ex) => exerciseMatchesCategories(ex, defaultCategories));
      if (narrow.length > 0) return narrow;
    }
    // Last resort for custom sections only — show everything so the
    // picker is never empty. Real catalog sections never reach this.
    return notExcluded;
  }, [
    catalog, excludeIds, showAll, sectionKey,
    activePatterns, activeCategories,
    inferredPatterns, defaultCategories,
    excludedEquipment,
  ]);

  // Keyboard search layered on top of the chip/section scoping. When
  // there's a query, it overrides chip filters and searches the whole
  // catalog by name + tags so the user can find anything they remember
  // the name of without first guessing the right chip.
  const visibleCandidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return candidates;
    const terms = q.split(/\s+/).filter(Boolean);
    const pool = catalog
      .filter((ex) => !excludeIds.includes(ex.id))
      .filter((ex) => !isExerciseExcludedByEquipment(ex, excludedEquipment));
    return pool.filter((ex) => {
      const hay = [
        ex.name,
        ex.id,
        ...(ex.tags ?? []),
        ...(ex.equipment ?? []),
        ...(ex.primaryMuscles ?? []),
      ].join(' ').toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [query, candidates, catalog, excludeIds, excludedEquipment]);

  function togglePattern(key) {
    setActivePatterns((prev) => (
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    ));
  }

  function toggleCategory(key) {
    setActiveCategories((prev) => (
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    ));
  }

  if (!open) return null;

  // Pattern chips shown: inferred ones first (most relevant), then any
  // OTHER patterns the user might want to surface as cross-section adds.
  // Cap at 6 inferred + the rest grouped under "All catalog" toggle so
  // the chip strip doesn't sprawl on mobile.
  const orderedPatternKeys = inferredPatterns.length > 0
    ? inferredPatterns
    : Object.keys(PATTERN_BY_KEY);

  return (
    <Sheet open={open} onClose={onClose} ariaLabel="Add exercise">
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
            Add to {sectionTitle ?? sectionKey ?? 'section'}
          </Text>
          <Text as="h2" variant="display-lg" style={{ fontStyle: 'italic', marginTop: 6 }}>
            Pick an exercise
          </Text>
          {inferredPatterns.length > 0 && (
            <Text as="div" variant="mono-sm" tone="tertiary" style={{ marginTop: 6 }}>
              Showing same-pattern subs · {inferredPatterns.map((p) => PATTERN_BY_KEY[p]?.label ?? p).join(' · ')}
            </Text>
          )}
        </Stack>

        <BrushDivider style={{ marginTop: 32 }} />

        {/* Search input — overrides chip scoping when present. Lets the
            user type the name of any exercise they remember without
            first picking the right pattern chip. */}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Escape') setQuery(''); }}
          placeholder="Search exercises…"
          aria-label="Search exercises"
          data-testid="slot-search"
          style={{
            width: '100%',
            marginTop: 24,
            padding: '12px 16px',
            background: 'var(--surface-sunken)',
            border: '1px solid var(--border-hairline)',
            borderRadius: 8,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
            fontSize: 15,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />

        <div style={{ marginTop: 20, opacity: query.trim() ? 0.4 : 1, pointerEvents: query.trim() ? 'none' : 'auto' }}>
          {orderedPatternKeys.length > 0 && (
            <>
              <Text as="div" variant="mono-sm" tone="tertiary" style={{ marginBottom: 8, textTransform: 'uppercase' }}>
                Movement pattern
              </Text>
              <Stack direction="row" gap={2} style={{ flexWrap: 'wrap', rowGap: 8 }}>
                {orderedPatternKeys.map((key) => {
                  const p = PATTERN_BY_KEY[key];
                  if (!p) return null;
                  return (
                    <FilterChip
                      key={key}
                      label={p.label}
                      active={activePatterns.includes(key)}
                      onClick={() => togglePattern(key)}
                      testId={`slot-pattern-${key}`}
                    />
                  );
                })}
              </Stack>
            </>
          )}

          <Text as="div" variant="mono-sm" tone="tertiary" style={{ margin: '16px 0 8px', textTransform: 'uppercase' }}>
            Category
          </Text>
          <Stack direction="row" gap={2} style={{ flexWrap: 'wrap', rowGap: 8 }}>
            {Object.values(CATEGORIES).map((cat) => (
              <FilterChip
                key={cat.key}
                label={cat.label}
                active={activeCategories.includes(cat.key)}
                onClick={() => toggleCategory(cat.key)}
                testId={`slot-filter-${cat.key}`}
              />
            ))}
            <FilterChip
              label={showAll ? 'Curated' : 'All catalog'}
              active={showAll}
              onClick={() => setShowAll((v) => !v)}
              testId="slot-filter-all"
            />
          </Stack>
        </div>

        {visibleCandidates.length > 0 ? (
          <ul
            data-testid="slot-picker-list"
            style={{ listStyle: 'none', padding: 0, margin: '24px 0 0' }}
          >
            {visibleCandidates.map((ex, i) => (
              <li key={ex.id}>
                <PickRow
                  exercise={ex}
                  onPick={onPick}
                  onDetails={setPeekExerciseId}
                  isFirst={i === 0}
                />
              </li>
            ))}
          </ul>
        ) : (
          <Text as="p" variant="body-lg" tone="secondary" style={{ marginTop: 24 }}>
            No catalog matches for this combination. Drop a filter or toggle
            {' '}<em>All catalog</em>.
          </Text>
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
