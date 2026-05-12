import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useExercise } from '../hooks/useExercise';
import { ExerciseSheet } from '../components/ExerciseSheet';
import { accentFor, color } from '../design-system';

// Deep-link route: /:dayKey/:exerciseId — opens the same sheet as in-place taps.
export function ExercisePage() {
  const { dayKey, exerciseId } = useParams();
  const navigate = useNavigate();
  const found = useExercise(dayKey, exerciseId);
  // Reopen the sheet whenever the route id changes (React-recommended
  // pattern: derive state by comparing prev to current inside render).
  const [open, setOpen] = useState(true);
  const [prevId, setPrevId] = useState(exerciseId);
  if (exerciseId !== prevId) {
    setPrevId(exerciseId);
    setOpen(true);
  }

  if (!found) {
    return (
      <main style={{ padding: 24, color: color.text, maxWidth: 720, margin: '0 auto' }}>
        <p style={{ fontFamily: 'var(--font-body)' }}>Exercise not found.</p>
        <button onClick={() => navigate(`/${dayKey || ''}`)}>Back</button>
      </main>
    );
  }
  const accent = accentFor(found.day.key);
  return (
    <ExerciseSheet
      open={open}
      onClose={() => {
        setOpen(false);
        navigate(`/${found.day.key}`);
      }}
      exercise={found.exercise}
      accent={accent}
    />
  );
}
