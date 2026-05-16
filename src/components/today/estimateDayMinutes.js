// Rough estimate of how long the day will take, in minutes. Per exercise:
// (sets × ~45s work) + ((sets - 1) × upper-rest-seconds). Sums across the
// day. Doesn't try to be exact — the user reads this as "is this a 40
// minute lift or a 90 minute one?" and that's enough.

import { parsePrescription, parseRest } from '../../data/prescription';

export function estimateDayMinutes(day) {
  if (!day) return null;
  let totalSec = 0;
  for (const section of day.sections ?? []) {
    for (const ex of section.exercises ?? []) {
      const p = parsePrescription(ex.sets);
      const r = parseRest(ex.rest);
      const sets = p.setsTotal || 3;
      const restSec = r.upperBoundSec ?? r.lowerBoundSec ?? 90;
      totalSec += sets * 45 + Math.max(0, sets - 1) * restSec;
    }
  }
  return Math.round(totalSec / 60);
}
