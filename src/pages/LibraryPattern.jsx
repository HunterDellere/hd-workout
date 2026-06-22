// /library/movements/:movementKey — movement-pattern detail.
//
// Lead with the pattern's identity: bespoke glyph, serif name, a single
// calm sentence. Below the brush divider, a hairline-ruled list of the
// exercises derived from the day catalog that train this pattern.

import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Page,
  Block,
  Stack,
  Text,
  Button,
  PatternGlyph,
  BrushDivider,
} from '../design-system/components';
import { patternAccent, space as spaceScale } from '../design-system/tokens';
import { exercisesForPattern } from '../data/derive';
import { PATTERN_BY_KEY } from '../data/patterns';
import { roleLabel, roleRank } from '../data/role';

function ExerciseRow({ exercise, isFirst }) {
  return (
    <li>
      <Link
        to={`/library/exercises/${exercise.id}`}
        data-exercise-id={exercise.id}
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: spaceScale[4],
          padding: `${spaceScale[4]}px 0`,
          borderTop: isFirst ? 'none' : '1px solid var(--border-hairline)',
          textDecoration: 'none',
          color: 'var(--text-primary)',
        }}
      >
        <Stack direction="column" gap={1} style={{ flex: 1, minWidth: 0 }}>
          <Text
            as="span"
            variant="title-md"
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {exercise.name}
          </Text>
          <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
            {exercise.sets ?? ''}{exercise.rest ? `  ·  rest ${exercise.rest}` : ''}
          </Text>
        </Stack>
        {roleLabel(exercise.role) ? (
          <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
            {roleLabel(exercise.role)}
          </Text>
        ) : null}
      </Link>
    </li>
  );
}

export function LibraryPattern() {
  const { movementKey } = useParams();
  const pattern = PATTERN_BY_KEY[movementKey];
  const accent = patternAccent[movementKey];
  const known = Boolean(pattern && accent);

  const exercises = useMemo(() => {
    if (!known) return [];
    return [...exercisesForPattern(movementKey)].sort((a, b) => {
      const t = roleRank(a.role) - roleRank(b.role);
      return t !== 0 ? t : a.name.localeCompare(b.name);
    });
  }, [movementKey, known]);

  if (!known) {
    return (
      <Page>
        <Button as={Link} to="/library" variant="bare" size="sm">← Library</Button>
        <Text as="div" variant="mono-sm" tone="tertiary" style={{ marginTop: 24, textTransform: 'uppercase' }}>
          Not found
        </Text>
        <Text as="h1" variant="display-lg" style={{ marginTop: 8, fontStyle: 'italic' }}>
          Unknown pattern
        </Text>
        <Text as="p" variant="body-lg" tone="secondary" style={{ marginTop: 16 }}>
          Nothing here for <code style={{ fontFamily: 'var(--font-mono)' }}>{movementKey}</code>.
        </Text>
        <BrushDivider style={{ marginTop: 32 }} />
        <Block gapTop={24}>
          <Button as={Link} to="/library" variant="soft" accent="slate" size="md">
            Back to the library
          </Button>
        </Block>
      </Page>
    );
  }

  return (
    <Page>
      <Button as={Link} to="/library" variant="bare" size="sm" style={{ padding: '0' }}>
        ← Library
      </Button>

      <div data-testid="pattern-detail" data-pattern={movementKey}>
        <Stack direction="row" align="center" gap={3} style={{ marginTop: 24 }}>
          <span style={{ color: `var(--accent-${accent}-ink)`, display: 'inline-flex' }}>
            <PatternGlyph name={movementKey} size={40} strokeWidth={1.5} />
          </span>
          <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
            Movement pattern
          </Text>
        </Stack>

        <Text
          as="h1"
          variant="display-lg"
          style={{ marginTop: 12, fontStyle: 'italic' }}
        >
          {pattern.label}
        </Text>

        <Text
          as="p"
          variant="body-lg"
          tone="secondary"
          style={{ marginTop: 16, maxWidth: 60 * 9 }}
        >
          {pattern.description}
        </Text>

        <BrushDivider style={{ marginTop: 40 }} />

        <Block gapTop={24} eyebrow={`${exercises.length} exercise${exercises.length === 1 ? '' : 's'}`}>
          {exercises.length > 0 ? (
            <ul
              data-testid="pattern-exercises"
              style={{ listStyle: 'none', margin: 0, padding: 0 }}
            >
              {exercises.map((ex, i) => (
                <ExerciseRow key={ex.id} exercise={ex} isFirst={i === 0} />
              ))}
            </ul>
          ) : (
            <Stack direction="column" gap={4}>
              <Text as="p" variant="body-lg" tone="secondary">
                Nothing for this one yet.
              </Text>
              <div>
                <Button as={Link} to="/library" variant="soft" accent={accent} size="md">
                  Back to the library
                </Button>
              </div>
            </Stack>
          )}
        </Block>
      </div>
    </Page>
  );
}
