// Canonical route: /library/exercises/:exerciseId
// The legacy /:dayKey/exercise/:exerciseId path now redirects here, so this
// page always closes back to the library.

import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useExercise } from '../hooks/useExercise';
import { ExerciseSheet } from '../components/ExerciseSheet';
import { Page, Text, Button, BrushDivider } from '../design-system/components';
import { dayLineageAccent } from '../design-system/tokens';

export function ExercisePage() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const found = useExercise(null, exerciseId);

  // Reopen the sheet whenever the route id changes.
  const [open, setOpen] = useState(true);
  const [prevId, setPrevId] = useState(exerciseId);
  if (exerciseId !== prevId) {
    setPrevId(exerciseId);
    setOpen(true);
  }

  if (!found) {
    return (
      <Page>
        <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
          Not found
        </Text>
        <Text as="h1" variant="display-lg" style={{ marginTop: 8, fontStyle: 'italic' }}>
          Exercise not found
        </Text>
        <Text as="p" variant="body-lg" tone="secondary" style={{ marginTop: 16 }}>
          No exercise with the id <code style={{ fontFamily: 'var(--font-mono)' }}>{exerciseId}</code>.
        </Text>
        <BrushDivider style={{ marginTop: 32 }} />
        <div style={{ marginTop: 24 }}>
          <Button as={Link} to="/library" variant="soft" accent="slate" size="md">
            Back to the library
          </Button>
        </div>
      </Page>
    );
  }

  const dayKey = found.day.key;
  const accent = dayLineageAccent[dayKey] ?? 'stone';
  // Attach _day so the sheet's accent derivation works regardless of the
  // lookup path the catalog took (some callers don't carry the day).
  const exercise = { ...found.exercise, _day: dayKey };

  return (
    <ExerciseSheet
      open={open}
      onClose={() => {
        setOpen(false);
        navigate('/library');
      }}
      exercise={exercise}
      accent={accent}
    />
  );
}
