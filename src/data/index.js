import push from './push';
import pull from './pull';
import legs from './legs';
import core from './core';
import { principles, injuryPrevention } from './principles';

export const days = { push, pull, legs, core };
export const dayList = [push, pull, legs, core];

export function getDay(key) {
  return days[key];
}

export function getSection(dayKey, sectionKey) {
  const d = days[dayKey];
  if (!d) return null;
  return d.sections.find((s) => s.key === sectionKey) ?? null;
}

export function getExercise(dayKey, exerciseId) {
  const d = days[dayKey];
  if (!d) return null;
  for (const section of d.sections) {
    const ex = section.exercises.find((e) => e.id === exerciseId);
    if (ex) return { exercise: ex, section, day: d };
  }
  return null;
}

export function findExerciseAnywhere(exerciseId) {
  for (const d of dayList) {
    for (const s of d.sections) {
      const ex = s.exercises.find((e) => e.id === exerciseId);
      if (ex) return { exercise: ex, section: s, day: d };
    }
  }
  return null;
}

export { push, pull, legs, core, principles, injuryPrevention };
