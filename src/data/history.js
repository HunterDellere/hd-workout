// Derivations over the completed-sessions archive.
//
// The archive shape is the same as an active session: an array of session
// blobs, each with performances[].sets[]. These helpers walk the archive
// and return per-exercise summaries used by the history strip and the
// "Last time" line on /today.

/**
 * Pick the "top set" from an array of sets: highest weight; ties broken
 * by highest reps. Warmups are excluded — the "top set" is a working-set
 * concept. Returns null on an empty (or warmups-only) array.
 */
export function topSet(sets) {
  if (!sets || sets.length === 0) return null;
  const working = sets.filter((s) => !s.isWarmup);
  if (working.length === 0) return null;
  // Prefer weighted sets so a real strength set always wins for strength
  // exercises, but fall back to whatever working set exists so pure
  // duration/distance movements (planks, carries, dead hangs) still report
  // a representative top instead of being dropped.
  const numeric = working.filter((s) => typeof s.weight === 'number');
  const pool = numeric.length > 0 ? numeric : working;
  let best = pool[0];
  for (let i = 1; i < pool.length; i++) {
    const s = pool[i];
    if (s.weight > best.weight) best = s;
    else if (s.weight === best.weight && s.reps > best.reps) best = s;
  }
  return best;
}

/**
 * For a given exerciseId, return per-session summaries (newest last):
 *   { sessionId, endedAt, dayKey, top: { weight, reps, unit } | null }
 * Only sessions where the exercise was actually performed (≥1 set logged)
 * are included. Pass `limit` to cap the result to the most-recent N.
 */
export function historyForExercise(archive, exerciseId, limit = null) {
  if (!Array.isArray(archive) || archive.length === 0) return [];
  const out = [];
  for (const session of archive) {
    for (const perf of session.performances ?? []) {
      if (perf.exerciseId !== exerciseId) continue;
      if (!perf.sets || perf.sets.length === 0) continue;
      const top = topSet(perf.sets);
      // Sessions that contain only warmups for this exercise have no top
      // working set — skip them rather than emit a ghost entry.
      if (!top) continue;
      // Count working sets only — matches the working-set definition.
      const workingSetCount = perf.sets.filter((s) => !s.isWarmup).length;
      out.push({
        sessionId: session.id,
        endedAt: session.endedAt ?? session.startedAt,
        dayKey: session.dayKey,
        top,
        setCount: workingSetCount,
      });
    }
  }
  out.sort((a, b) => (a.endedAt < b.endedAt ? -1 : a.endedAt > b.endedAt ? 1 : 0));
  if (limit != null && out.length > limit) return out.slice(out.length - limit);
  return out;
}

/**
 * Last completed-session top-set for a given exercise, or null. Used by
 * the "Last time" line on /today performance cards.
 */
export function lastTopSetForExercise(archive, exerciseId) {
  const hist = historyForExercise(archive, exerciseId);
  if (hist.length === 0) return null;
  return hist[hist.length - 1];
}

/**
 * Last completed-session ALL working sets for an exercise. Returns an
 * array of { weight, reps, rpe, unit }, oldest-set-first (set index 1
 * is the first working set; warmups excluded). Used by the
 * auto-progression check: if every working set hit the prescription's
 * top of rep range, the next session's default load bumps an increment.
 */
export function lastWorkingSetsForExercise(archive, exerciseId) {
  if (!Array.isArray(archive) || archive.length === 0) return [];
  // Walk newest-first to find the most recent session containing this id.
  for (let i = archive.length - 1; i >= 0; i -= 1) {
    const session = archive[i];
    for (const perf of session.performances ?? []) {
      if (perf.exerciseId !== exerciseId) continue;
      const working = (perf.sets ?? []).filter((s) => !s.isWarmup && typeof s.weight === 'number');
      if (working.length === 0) continue;
      return working.map((s) => ({
        weight: s.weight,
        reps: s.reps,
        rpe: s.rpe ?? null,
        unit: s.unit ?? null,
      }));
    }
  }
  return [];
}

/**
 * Auto-progression check. Given last session's working sets and the
 * current prescription, return the next session's seed weight when:
 *   - we have ≥ prescription.sets working sets logged (i.e. all sets done)
 *   - every working set's reps >= prescription.repsHigh (top of range)
 *   - all sets were at the same weight (the user wasn't dropping load)
 *   - no set's RPE was ≥ 9 (we don't bump on grinder sets)
 * Returns { from: number, to: number, increment: number } or null.
 */
export function autoProgressionFor(workingSets, prescription, unit = 'kg') {
  if (!Array.isArray(workingSets) || workingSets.length === 0) return null;
  if (!prescription || prescription.kind !== 'straight') return null;
  const needed = prescription.setsTotal ?? prescription.sets ?? 0;
  if (needed > 0 && workingSets.length < needed) return null;
  const high = prescription.repsHigh;
  if (typeof high !== 'number') return null;
  const firstWeight = workingSets[0].weight;
  for (const s of workingSets) {
    if (s.weight !== firstWeight) return null;
    if (s.reps < high) return null;
    if (s.rpe != null && s.rpe >= 9) return null;
  }
  const step = unit === 'lb' ? 5 : 2.5;
  return {
    from: firstWeight,
    to: Math.round((firstWeight + step) * 100) / 100,
    increment: step,
  };
}
