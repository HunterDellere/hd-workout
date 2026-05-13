// /library — pattern-first browse, typographic index.
//
// Display-led: a serif title carries the page, hairline rows list the ten
// movement patterns. Each row leads with a bespoke 1.5px-stroke glyph in
// the pattern's accent ink — semantic colour, not decoration.

import { Link } from 'react-router-dom';
import {
  Page,
  Block,
  Stack,
  Text,
  PatternGlyph,
  BrushDivider,
} from '../design-system/components';
import { patternAccent, space as spaceScale } from '../design-system/tokens';
import { PATTERNS } from '../data/patterns';

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
          <PatternGlyph name={pattern.key} size={28} />
        </span>
        <Stack direction="column" gap={1} style={{ flex: 1, minWidth: 0 }}>
          <Text as="span" variant="title-md">{pattern.label}</Text>
        </Stack>
        <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
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
        Movements
      </Text>
      <Text
        as="p"
        variant="body-lg"
        tone="secondary"
        style={{ marginTop: 16, maxWidth: 56 * 9 }}
      >
        Every exercise lives under the movement it trains. Start with the pattern,
        find the variation that fits the day.
      </Text>

      <BrushDivider style={{ marginTop: 40 }} />

      <Block gapTop={24}>
        <ul
          data-testid="library-patterns"
          style={{ listStyle: 'none', margin: 0, padding: 0 }}
        >
          {PATTERNS.map((p, i) => (
            <PatternRow key={p.key} pattern={p} isFirst={i === 0} />
          ))}
        </ul>
      </Block>
    </Page>
  );
}
