import { useMemo } from 'react';
import { getExercise, findExerciseAnywhere } from '../data';

export function useExercise(dayKey, exerciseId) {
  return useMemo(() => {
    if (!exerciseId) return null;
    return dayKey
      ? getExercise(dayKey, exerciseId)
      : findExerciseAnywhere(exerciseId);
  }, [dayKey, exerciseId]);
}
