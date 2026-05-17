// /library — hub. Two groups: by day, by movement pattern. Both always
// expanded; the page reads as a single browsable index.
//
// Wave 6.1: at ≥1024px the page splits into a content rail + sticky
// right-side anchor strip so the desktop view stops reading as a centered
// column floating in a void.

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Page,
  Stack,
  Text,
  PatternGlyph,
  BrushDivider,
  MASTHEAD_HEIGHT_PX,
} from '../design-system/components';
import { patternAccent, dayLineageAccent, space as spaceScale } from '../design-system/tokens';
import { PATTERNS } from '../data/patterns';
import { dayList, rawCatalogList, findExerciseById } from '../data';
import { exercisesForPattern } from '../data/derive';
import { useSettings } from '../state/settings-context.js';

function GroupHeader({ id, label, count }) {
  return (
    <Stack
      direction="row"
      align="baseline"
      justify="space-between"
      gap={3}
      style={{ padding: '12px 0 8px' }}
    >
      <Text as="h2" id={id} variant="title-lg" style={{ scrollMarginTop: 24 }}>{label}</Text>
      <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
        {count}
      </Text>
    </Stack>
  );
}

function DayRow({ day, isFirst }) {
  const accent = dayLineageAccent[day.key] ?? 'stone';
  const total = day.sections.reduce((n, s) => n + s.exercises.length, 0);
  return (
    <li>
      <Link
        to={`/${day.key}`}
        data-day-key={day.key}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spaceScale[4],
          padding: `${spaceScale[4]}px 0`,
          borderTop: isFirst ? 'none' : '1px solid var(--border-hairline)',
          textDecoration: 'none',
          color: 'var(--text-primary)',
        }}
      >
        <span
          aria-hidden
          style={{
            width: 8,
            height: 8,
            background: `var(--accent-${accent}-solid)`,
            borderRadius: 1,
            flexShrink: 0,
          }}
        />
        <Stack direction="column" gap={1} style={{ flex: 1, minWidth: 0 }}>
          <Text as="span" variant="title-md">{day.name}</Text>
          {day.subtitle && (
            <Text as="span" variant="body-sm" tone="secondary">{day.subtitle}</Text>
          )}
        </Stack>
        <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
          {total}
        </Text>
      </Link>
    </li>
  );
}

function PatternRow({ pattern, isFirst }) {
  const accent = patternAccent[pattern.key];
  // Trailing count of exercises that train this pattern — the slug was
  // technical noise (HORIZONTAL-PRESS); count is genuinely informative.
  const count = exercisesForPattern(pattern.key).length;
  return (
    <li>
      <Link
        to={`/library/movements/${pattern.key}`}
        data-pattern-key={pattern.key}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spaceScale[4],
          padding: `${spaceScale[4]}px 0`,
          borderTop: isFirst ? 'none' : '1px solid var(--border-hairline)',
          textDecoration: 'none',
          color: 'var(--text-primary)',
        }}
      >
        <span
          style={{
            color: `var(--accent-${accent}-ink)`,
            display: 'inline-flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <PatternGlyph name={pattern.key} size={24} />
        </span>
        <Text as="span" variant="title-md" style={{ flex: 1, minWidth: 0 }}>
          {pattern.label}
        </Text>
        <Text
          as="span"
          variant="mono-sm"
          tone="tertiary"
        >
          {count}
        </Text>
      </Link>
    </li>
  );
}

// Sticky anchor list (≥1024px only). Quiet mono labels; uppercase tracking.
function AnchorRail({ anchors }) {
  return (
    <nav
      aria-label="Library sections"
      style={{
        position: 'sticky',
        top: 72,
        alignSelf: 'start',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        paddingTop: 40,
        paddingLeft: 24,
        borderLeft: '1px solid var(--border-hairline)',
      }}
    >
      <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 4 }}>
        Index
      </Text>
      {anchors.map(({ id, label, count }) => (
        <button
          key={id}
          type="button"
          // Programmatic scroll instead of href="#id". The app uses
          // HashRouter, so an anchor-style href would replace the
          // route hash to "#id" and fall through to the unknown-day
          // 404. scrollIntoView achieves the same intra-page jump
          // without touching the route.
          onClick={() => {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          style={{
            all: 'unset',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 12,
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '4px 0',
          }}
        >
          <span>{label}</span>
          <span style={{ color: 'var(--text-tertiary)' }}>{count}</span>
        </button>
      ))}
    </nav>
  );
}

// Substring + tag-keyword search over the raw catalog. Case-insensitive;
// multiple space-separated terms AND together so "incline db" finds
// dumbbell incline variants.
function searchCatalog(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  const list = rawCatalogList();
  return list.filter((ex) => {
    const hay = [
      ex.name,
      ex.id,
      ...(ex.tags ?? []),
      ...(ex.equipment ?? []),
      ...(ex.primaryMuscles ?? []),
    ].join(' ').toLowerCase();
    return terms.every((t) => hay.includes(t));
  });
}

function SearchHitRow({ exercise, isFirst }) {
  const day = exercise._day;
  const accent = dayLineageAccent[day] ?? 'stone';
  return (
    <li>
      <Link
        to={`/library/exercises/${exercise.id}`}
        data-testid="library-search-hit"
        data-exercise-id={exercise.id}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spaceScale[3],
          padding: `${spaceScale[3]}px 0`,
          borderTop: isFirst ? 'none' : '1px solid var(--border-hairline)',
          textDecoration: 'none',
          color: 'var(--text-primary)',
        }}
      >
        <span
          aria-hidden
          style={{
            width: 6,
            height: 6,
            background: `var(--accent-${accent}-solid)`,
            borderRadius: 1,
            flexShrink: 0,
          }}
        />
        <Stack direction="column" gap={1} style={{ flex: 1, minWidth: 0 }}>
          <Text as="span" variant="title-md">{exercise.name}</Text>
          <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
            {day} · {exercise._section?.title ?? ''}
          </Text>
        </Stack>
        {exercise.tier && (
          <Text as="span" variant="mono-sm" tone="tertiary">
            T{exercise.tier}
          </Text>
        )}
      </Link>
    </li>
  );
}

export function Library() {
  const { settings } = useSettings();
  const favorites = useMemo(() => (
    (settings.favoriteExerciseIds ?? [])
      .map((id) => findExerciseById(id))
      .filter(Boolean)
  ), [settings.favoriteExerciseIds]);

  const [query, setQuery] = useState('');
  const hits = useMemo(() => searchCatalog(query), [query]);
  const searching = query.trim().length > 0;

  const anchors = useMemo(() => {
    const arr = [];
    if (favorites.length > 0) arr.push({ id: 'library-favorites', label: 'Favorites', count: favorites.length });
    arr.push({ id: 'library-days', label: 'Days', count: dayList.length });
    arr.push({ id: 'library-movements', label: 'Movements', count: PATTERNS.length });
    return arr;
  }, [favorites.length]);

  return (
    <Page width="dashboard">
      <div
        style={{
          // Two-column grid at ≥1024px; single column below. The content
          // rail caps at ~640px so line length stays editorial regardless
          // of viewport width.
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 640px)',
          justifyContent: 'start',
          columnGap: 56,
        }}
        className="library-grid"
      >
        <div>
          <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
            Library
          </Text>
          <Text
            as="h1"
            variant="display-lg"
            style={{ marginTop: 8, fontStyle: 'italic' }}
          >
            Reference
          </Text>

          {/* Search lives directly under the masthead. The day-and-movement
              browse pattern is obvious from the section headers below —
              no body copy needed to explain it. */}
          <div
            style={{
              position: 'sticky',
              top: MASTHEAD_HEIGHT_PX,
              zIndex: 3,
              marginTop: 14,
              background: 'var(--surface-page)',
              paddingTop: 6,
              paddingBottom: 6,
            }}
          >
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') setQuery(''); }}
              placeholder="Search exercises…"
              aria-label="Search exercises"
              data-testid="library-search"
              style={{
                width: '100%',
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
          </div>

          {searching ? (
            <section data-testid="library-search-results" style={{ marginTop: 16 }}>
              <Stack direction="row" align="baseline" justify="space-between" gap={3} style={{ padding: '8px 0 12px' }}>
                <Text as="h2" variant="title-lg">Results</Text>
                <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
                  {hits.length}
                </Text>
              </Stack>
              {hits.length === 0 ? (
                <Text as="p" variant="body-md" tone="secondary" style={{ padding: '16px 0' }}>
                  No matches. Try a shorter term, or browse below.
                </Text>
              ) : (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {hits.slice(0, 80).map((ex, i) => (
                    <SearchHitRow key={ex.id} exercise={ex} isFirst={i === 0} />
                  ))}
                </ul>
              )}
            </section>
          ) : null}

          {favorites.length > 0 && (
            <>
              <BrushDivider style={{ marginTop: 28 }} />
              <section>
                <GroupHeader id="library-favorites" label="Favorites" count={`${favorites.length}`} />
                <ul
                  data-testid="library-favorites"
                  style={{ listStyle: 'none', margin: 0, padding: 0 }}
                >
                  {favorites.map((ex, i) => (
                    <li key={ex.id}>
                      <Link
                        to={`/library/exercises/${ex.id}`}
                        data-exercise-id={ex.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: spaceScale[3],
                          padding: `${spaceScale[3]}px 0`,
                          borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)',
                          textDecoration: 'none',
                          color: 'var(--text-primary)',
                        }}
                      >
                        <span
                          aria-hidden
                          style={{
                            color: 'var(--accent-ember-ink, var(--accent-rust-ink))',
                            fontSize: 14,
                            flexShrink: 0,
                          }}
                        >
                          ★
                        </span>
                        <Stack direction="column" gap={1} style={{ flex: 1, minWidth: 0 }}>
                          <Text as="span" variant="title-md">{ex.name}</Text>
                          {ex.tier && (
                            <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
                              Tier {ex.tier}
                            </Text>
                          )}
                        </Stack>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}

          <BrushDivider style={{ marginTop: 28 }} />

          <section>
            <GroupHeader id="library-days" label="Days" count={`${dayList.length}`} />
            <ul
              data-testid="library-days"
              style={{ listStyle: 'none', margin: 0, padding: 0 }}
            >
              {dayList.map((d, i) => (
                <DayRow key={d.key} day={d} isFirst={i === 0} />
              ))}
            </ul>
          </section>

          <BrushDivider style={{ marginTop: 28 }} />

          <section>
            <GroupHeader id="library-movements" label="Movements" count={`${PATTERNS.length}`} />
            <ul
              data-testid="library-patterns"
              style={{ listStyle: 'none', margin: 0, padding: 0 }}
            >
              {PATTERNS.map((p, i) => (
                <PatternRow key={p.key} pattern={p} isFirst={i === 0} />
              ))}
            </ul>
          </section>
        </div>

        <div className="library-rail">
          <AnchorRail anchors={anchors} />
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .library-grid {
            grid-template-columns: minmax(0, 640px) 220px !important;
            justify-content: center !important;
          }
        }
        @media (max-width: 1023px) {
          .library-rail { display: none; }
        }
      `}</style>
    </Page>
  );
}
