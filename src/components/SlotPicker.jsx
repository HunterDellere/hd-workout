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
import { dayList } from '../data';

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
  const out = [];
  for (const day of dayList) {
    for (const section of day.sections) {
      for (const ex of section.exercises) {
        out.push({ ...ex, _day: day.key, _section: { key: section.key, title: section.title } });
      }
    }
  }
  return out;
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

function PickRow({ exercise, onPick, isFirst }) {
  return (
    <button
      type="button"
      data-testid="slot-candidate"
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
          {exercise.sets}{exercise.rest && exercise.rest !== '—' ? ` · rest ${exercise.rest}` : ''}
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

  // Which filter set is "active" decides which axis the chips operate on.
  //
  // Decision tree:
  //   1. showAll → no filter (whole catalog).
  //   2. user toggled chips (patterns or categories) → AND-of-axes;
  //      within an axis we OR.
  //   3. inferredPatterns non-empty → default to those patterns.
  //   4. defaultCategories non-empty → default to those categories.
  //   5. otherwise → no filter (sensible for unknown sections).
  const candidates = useMemo(() => {
    const notExcluded = catalog.filter((ex) => !excludeIds.includes(ex.id));
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

    // No chips selected — apply section defaults with a graceful fallback.
    // If the section's natural-pattern filter yields zero (because every
    // matching exercise is already in the section and thus excluded), fall
    // back to the full non-excluded catalog so the user always sees options.
    if (inferredPatterns.length > 0) {
      const narrow = notExcluded.filter((ex) => exerciseMatchesPatterns(ex, inferredPatterns));
      if (narrow.length > 0) return narrow;
      // Fall through to full catalog rather than render an empty list.
      return notExcluded;
    }
    if (defaultCategories.length > 0) {
      const narrow = notExcluded.filter((ex) => exerciseMatchesCategories(ex, defaultCategories));
      if (narrow.length > 0) return narrow;
      return notExcluded;
    }
    return notExcluded;
  }, [
    catalog, excludeIds, showAll,
    activePatterns, activeCategories,
    inferredPatterns, defaultCategories,
  ]);

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

        <div style={{ marginTop: 24 }}>
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

        {candidates.length > 0 ? (
          <ul
            data-testid="slot-picker-list"
            style={{ listStyle: 'none', padding: 0, margin: '24px 0 0' }}
          >
            {candidates.map((ex, i) => (
              <li key={ex.id}>
                <PickRow exercise={ex} onPick={onPick} isFirst={i === 0} />
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
    </Sheet>
  );
}
