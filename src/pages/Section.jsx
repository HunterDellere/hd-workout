// /:dayKey/section/:sectionKey — a single section in isolation.
// Rewritten Session 10 on Page/Block, off the legacy bridge.

import { useNavigate, useParams, Link } from 'react-router-dom';
import { getSection, getDay } from '../data';
import {
  Page,
  Block,
  Stack,
  Text,
  Button,
  BrushDivider,
} from '../design-system/components';
import { dayLineageAccent, space as spaceScale } from '../design-system/tokens';
import { ExerciseCardV2 } from '../components/ExerciseCardV2';
import { useHaptics } from '../hooks/useHaptics';

export function Section() {
  const { dayKey, sectionKey } = useParams();
  const navigate = useNavigate();
  const haptic = useHaptics();
  const section = getSection(dayKey, sectionKey);
  const day = getDay(dayKey);

  if (!section || !day) {
    return (
      <Page>
        <Button as={Link} to={`/${dayKey || ''}`} variant="bare" size="sm" style={{ padding: 0 }}>
          ← Back
        </Button>
        <Text as="div" variant="mono-sm" tone="tertiary" style={{ marginTop: 24, textTransform: 'uppercase' }}>
          Not found
        </Text>
        <Text as="h1" variant="display-lg" style={{ marginTop: 8, fontStyle: 'italic' }}>
          Unknown section
        </Text>
        <Text as="p" variant="body-lg" tone="secondary" style={{ marginTop: 16 }}>
          No section called <code style={{ fontFamily: 'var(--font-mono)' }}>{sectionKey}</code> exists
          under that day.
        </Text>
        <BrushDivider style={{ marginTop: 32 }} />
        <div style={{ marginTop: 24 }}>
          <Button as={Link} to="/" variant="soft" accent="stone" size="md">
            Back home
          </Button>
        </div>
      </Page>
    );
  }

  const accent = dayLineageAccent[day.key] ?? 'stone';
  const sectionTitle = (section.title.split(' — ')[1] || section.title).trim();

  return (
    <Page>
      <Button as={Link} to={`/${day.key}`} variant="bare" size="sm" style={{ padding: 0 }}>
        ← {day.name}
      </Button>

      <Stack direction="row" align="center" gap={2} style={{ marginTop: 24 }}>
        <span
          aria-hidden
          style={{
            width: 8,
            height: 8,
            background: `var(--accent-${accent}-solid)`,
            borderRadius: 1,
          }}
        />
        <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
          {day.name} · Section
        </Text>
      </Stack>

      <Stack direction="row" align="baseline" justify="space-between" gap={3} style={{ marginTop: 8 }}>
        <Text as="h1" variant="display-lg" style={{ fontStyle: 'italic' }}>
          {sectionTitle}
        </Text>
        {section.mandatory && (
          <Text
            as="span"
            variant="mono-sm"
            style={{
              textTransform: 'uppercase',
              color: 'var(--state-warn-ink)',
              whiteSpace: 'nowrap',
            }}
          >
            Mandatory
          </Text>
        )}
      </Stack>

      {section.blurb && (
        <Text as="p" variant="body-lg" tone="secondary" style={{ marginTop: 16, maxWidth: 60 * 9 }}>
          {section.blurb}
        </Text>
      )}

      <BrushDivider style={{ marginTop: 32 }} />

      <Block gapTop={24}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spaceScale[2] }}>
          {section.exercises.map((ex, i) => (
            <ExerciseCardV2
              key={ex.id}
              exercise={ex}
              dayKey={day.key}
              index={i}
              onOpen={() => {
                haptic('select');
                navigate(`/library/exercises/${ex.id}`);
              }}
            />
          ))}
        </div>
      </Block>
    </Page>
  );
}
