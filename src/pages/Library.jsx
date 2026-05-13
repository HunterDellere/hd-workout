// /library — hub. Two groups: by day, by movement pattern. Both always
// expanded; the page reads as a single browsable index.

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

function GroupHeader({ label, count }) {
  return (
    <Stack
      direction="row"
      align="baseline"
      justify="space-between"
      gap={3}
      style={{ padding: '20px 0 12px' }}
    >
      <Text as="h2" variant="title-lg">{label}</Text>
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

export function Library() {
  return (
    <Page>
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
        <GroupHeader label="Days" count={`${dayList.length}`} />
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
        <GroupHeader label="Movements" count={`${PATTERNS.length}`} />
        <ul
          data-testid="library-patterns"
          style={{ listStyle: 'none', margin: 0, padding: 0 }}
        >
          {PATTERNS.map((p, i) => (
            <PatternRow key={p.key} pattern={p} isFirst={i === 0} />
          ))}
        </ul>
      </section>
    </Page>
  );
}
