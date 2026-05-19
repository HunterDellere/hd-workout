// Warmup ladder derivation for heavy compound lifts.
//
// Given a working weight and unit, returns a ramp of warmup sets at
// 40 / 60 / 80% of working with descending reps. The lifter still
// owns the actual loading — this is a recommendation, not a
// prescription. Empty-bar and very-light rungs are deliberately
// omitted (the lifter who is squatting 140kg knows to start with the
// empty bar; we don't need to write it down).
//
// Rounding follows gym-plate granularity:
//   kg → nearest 2.5
//   lb → nearest 5
// so the suggested load actually loads cleanly with standard plates.
//
// The 40/60/80% ladder is the consensus heavy-compound warmup across
// 5/3/1, Starting Strength, and most barbell methodologies. Three
// rungs is enough to prime CNS + tissue without burning the working
// sets.

const LADDER = [
  { percent: 0.4, reps: 5 },
  { percent: 0.6, reps: 3 },
  { percent: 0.8, reps: 2 },
];

function roundForUnit(weight, unit) {
  const step = unit === 'lb' ? 5 : 2.5;
  return Math.max(step, Math.round(weight / step) * step);
}

/**
 * Build a warmup ladder for a working weight.
 *
 * @param {number} workingWeight - the working-set weight on this lift
 * @param {{ unit?: 'kg'|'lb', minWeight?: number }} [options]
 * @returns {Array<{ weight: number, reps: number, percent: number }>}
 *   empty array if workingWeight is invalid or below the threshold
 *   where a ramp adds value.
 */
export function warmupLadder(workingWeight, options = {}) {
  const { unit = 'kg', minWeight } = options;
  if (typeof workingWeight !== 'number' || !Number.isFinite(workingWeight) || workingWeight <= 0) {
    return [];
  }
  // Below ~40kg / 90lb the ladder steps collapse into the working
  // weight (everything rounds to the same number). The lifter can
  // do their own ramp; no point printing a redundant table.
  const threshold = minWeight ?? (unit === 'lb' ? 90 : 40);
  if (workingWeight < threshold) return [];
  return LADDER.map((rung) => ({
    weight: roundForUnit(workingWeight * rung.percent, unit),
    reps: rung.reps,
    percent: rung.percent,
  }));
}

/**
 * Compact one-line summary of a ladder for display.
 * e.g. "40 × 5 · 60 × 3 · 80 × 2"
 */
export function formatLadder(ladder, unit) {
  if (!ladder || ladder.length === 0) return '';
  return ladder
    .map((rung) => `${rung.weight}${unit} × ${rung.reps}`)
    .join(' · ');
}

/**
 * Whether a given catalog exercise should get an auto-suggested warmup
 * ramp on its PerformanceCard.
 *
 *   • Any `foundational` lift — bench, squat, deadlift, etc.
 *   • Any `compound` lift that isn't pure bodyweight — RDL, OHP, BB row,
 *     hip thrust, BGSS, leg press, pulldown, lat pulldown, etc.
 *
 * Bodyweight compounds (pull-up, push-up, inverted row) opt out: the
 * ramp model is load-based, and the warmupLadder() weight threshold
 * would suppress them anyway, but excluding them here keeps the gate
 * intent explicit. Underloaded cases are filtered by the ladder itself
 * (returns [] under ~40 kg / 90 lb).
 *
 * @param {{ tags?: string[] } | null} exercise
 * @returns {boolean}
 */
export function shouldShowWarmupRamp(exercise) {
  const tags = exercise?.tags;
  if (!Array.isArray(tags)) return false;
  if (tags.includes('foundational')) return true;
  return tags.includes('compound') && !tags.includes('bodyweight');
}
