// Estimated one-rep max (e1RM) tracking.
//
// Formula: Epley
//   e1RM = weight × (1 + reps / 30)
//
// Why Epley: simple, widely used, accurate enough for trend tracking
// in the 1-10 rep range that covers nearly all hypertrophy + strength
// work. Brzycki and Lombardi are alternatives; Epley is the most
// forgiving at higher rep counts where strength tests aren't really
// 1RM tests anyway. We are estimating, not testing.
//
// The numbers are only meaningful as a trend, not an absolute. The UI
// surface should always show e1RM as a sparkline + delta, never as a
// single number presented as "your 1RM is X".

/**
 * Estimated one-rep max from a working set.
 * Returns null for invalid input or for sets that aren't strength
 * (no weight or no reps).
 */
export function epleyE1RM(weight, reps) {
  if (typeof weight !== 'number' || !Number.isFinite(weight) || weight <= 0) return null;
  if (typeof reps !== 'number' || !Number.isFinite(reps) || reps <= 0) return null;
  // Cap reps at 12 — Epley becomes meaningless above that. A 20-rep
  // set tells you about your engine, not your 1RM.
  const cappedReps = Math.min(reps, 12);
  return weight * (1 + cappedReps / 30);
}

/**
 * Best e1RM across an array of sets — the heaviest implied 1RM regardless
 * of which set produced it. Warmups are skipped. Returns null when no
 * strength set is found.
 */
export function bestE1RMFromSets(sets) {
  if (!Array.isArray(sets) || sets.length === 0) return null;
  let best = null;
  for (const s of sets) {
    if (s.isWarmup) continue;
    const e1 = epleyE1RM(s.weight, s.reps);
    if (e1 != null && (best == null || e1 > best)) best = e1;
  }
  return best;
}

/**
 * For a given exerciseId, return an e1RM time series across the archive.
 * One point per session: { endedAt, e1rm, weight, reps }. Newest last.
 * Sessions without a strength set for this exercise are skipped.
 */
export function e1rmSeriesForExercise(archive, exerciseId) {
  if (!Array.isArray(archive) || archive.length === 0) return [];
  const points = [];
  for (const session of archive) {
    for (const perf of session.performances ?? []) {
      if (perf.exerciseId !== exerciseId) continue;
      let bestSet = null;
      let bestE1 = null;
      for (const s of perf.sets ?? []) {
        if (s.isWarmup) continue;
        const e1 = epleyE1RM(s.weight, s.reps);
        if (e1 != null && (bestE1 == null || e1 > bestE1)) {
          bestE1 = e1;
          bestSet = s;
        }
      }
      if (bestE1 != null && bestSet) {
        points.push({
          endedAt: session.endedAt ?? session.startedAt,
          e1rm: bestE1,
          weight: bestSet.weight,
          reps: bestSet.reps,
          unit: bestSet.unit ?? null,
        });
      }
    }
  }
  // Sort newest-last by endedAt.
  points.sort((a, b) => (a.endedAt < b.endedAt ? -1 : a.endedAt > b.endedAt ? 1 : 0));
  return points;
}

/**
 * Summarize the e1RM series for display: latest value + delta vs. earliest
 * point in the series (or vs. N sessions back). Returns null for empty
 * series or single-point series (no trend yet).
 */
export function summarizeE1RM(series, { lookbackSessions = null } = {}) {
  if (!Array.isArray(series) || series.length === 0) return null;
  const latest = series[series.length - 1];
  if (series.length < 2) {
    return { latest, baseline: null, delta: null, deltaPct: null };
  }
  const baseIdx = lookbackSessions != null
    ? Math.max(0, series.length - 1 - lookbackSessions)
    : 0;
  const baseline = series[baseIdx];
  const delta = latest.e1rm - baseline.e1rm;
  const deltaPct = baseline.e1rm > 0 ? (delta / baseline.e1rm) * 100 : null;
  return { latest, baseline, delta, deltaPct };
}
