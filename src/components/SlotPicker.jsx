// SlotPicker — bottom sheet for ADDING an exercise to a section slot in
// the active session. Defaults to candidates that match the section's
// natural intents/categories; expandable to the whole catalog with
// filter chips for category (posture / imbalance / healthspan / facial /
// spine).
//
// This is distinct from SubstituteSheet which swaps an exercise for a
// same-pattern alternate. SlotPicker is purposefully broader so a user
// can drop a corrective into a regular push day, or a spine drill into
// a legs day, without leaving the section.

import { useMemo, useState } from 'react';
import { Sheet, Stack, Text, BrushDivider } from '../design-system/components';
import { CATEGORIES } from '../data/patterns';
import { dayList } from '../data';

// Section-key → categories that "belong" here. Used to populate the
// default suggestion list before the user reaches for filters.
const SECTION_DEFAULT_CATEGORIES = {
  // Recovery day sections — show only the matching categories.
  posture:         ['posture'],
  imbalance:       ['imbalance'],
  'spine-health':  ['spine'],
  healthspan:      ['healthspan', 'grip'],
  'facial-cervical': ['facial'],
  // Generic warmup / activation slots — surface everything light.
  warmup:          ['posture', 'healthspan'],
  activation:      ['posture', 'spine', 'imbalance'],
};

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

function exerciseMatchesCategories(ex, categories) {
  if (!ex.categories) return false;
  return ex.categories.some((c) => categories.includes(c));
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
  excludeIds = [],
  onPick,
}) {
  const [showAll, setShowAll] = useState(false);
  const [activeCategories, setActiveCategories] = useState([]);

  const defaultCategories = useMemo(
    () => SECTION_DEFAULT_CATEGORIES[sectionKey] ?? [],
    [sectionKey],
  );

  const catalog = useMemo(() => allCatalogExercises(), []);

  const candidates = useMemo(() => {
    const filter = activeCategories.length > 0
      ? activeCategories
      : (showAll ? null : defaultCategories);

    return catalog.filter((ex) => {
      if (excludeIds.includes(ex.id)) return false;
      if (filter == null) return true; // showAll, no chips
      if (filter.length === 0) return true; // section has no defaults
      return exerciseMatchesCategories(ex, filter);
    });
  }, [catalog, excludeIds, showAll, activeCategories, defaultCategories]);

  function toggleCategory(key) {
    setActiveCategories((prev) => (
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    ));
  }

  if (!open) return null;

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
        </Stack>

        <BrushDivider style={{ marginTop: 32 }} />

        <div style={{ marginTop: 24 }}>
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
