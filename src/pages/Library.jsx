// /library — hub. Two groups: by day, by movement pattern. Both always
// expanded; the page reads as a single browsable index.
//
// Wave 6.1: at ≥1024px the page splits into a content rail + sticky
// right-side anchor strip so the desktop view stops reading as a centered
// column floating in a void.

import { Link } from 'react-router-dom';
import {
  Page,
  Stack,
  Text,
  PatternGlyph,
  BrushDivider,
} from '../design-system/components';
import { patternAccent, dayLineageAccent, space as spaceScale } from '../design-system/tokens';
import { PATTERNS } from '../data/patterns';
import { dayList } from '../data';

function GroupHeader({ id, label, count }) {
  return (
    <Stack
      direction="row"
      align="baseline"
      justify="space-between"
      gap={3}
      style={{ padding: '20px 0 12px' }}
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
          style={{ textTransform: 'uppercase' }}
        >
          {pattern.key}
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
        <a
          key={id}
          href={`#${id}`}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 12,
            textDecoration: 'none',
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
        </a>
      ))}
    </nav>
  );
}

export function Library() {
  const anchors = [
    { id: 'library-days', label: 'Days', count: dayList.length },
    { id: 'library-movements', label: 'Movements', count: PATTERNS.length },
  ];

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
          <Text
            as="p"
            variant="body-lg"
            tone="secondary"
            style={{ marginTop: 16, maxWidth: 56 * 9 }}
          >
            Browse by day, or by movement.
          </Text>

          <BrushDivider style={{ marginTop: 40 }} />

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

          <BrushDivider style={{ marginTop: 40 }} />

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
