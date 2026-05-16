// Derivations over the completed-sessions archive.
//
// The archive shape is the same as an active session: an array of session
// blobs, each with performances[].sets[]. These helpers walk the archive
// and return per-exercise summaries used by the history strip and the
// "Last time" line on /today.

/**
 * Pick the "top set" from an array of sets: highest weight; ties broken
 * by highest reps. Returns null on an empty array.
 */
export function topSet(sets) {
  if (!sets || sets.length === 0) return null;
  let best = sets[0];
  for (let i = 1; i < sets.length; i++) {
    const s = sets[i];
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
      out.push({
        sessionId: session.id,
        endedAt: session.endedAt ?? session.startedAt,
        dayKey: session.dayKey,
        top: topSet(perf.sets),
        setCount: perf.sets.length,
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
