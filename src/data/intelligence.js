// Intelligence — derivations over the completed-sessions archive.
//
// PR detection
//   For each performance in the candidate session, scan the prior archive
//   (older `endedAt`) and find the historical max weight and historical
//   max reps at any weight for the same exerciseId. Stamp `pr` on the set
//   that matched:
//     { weight: true } — new heaviest weight regardless of reps
//     { reps: { atWeight: <kg|lb> } } — new highest reps at a weight
//                                       that has been done at least once before
//
// Weekly volume
//   Walk the archive, group sets by ISO week (Monday-anchored) × pattern,
//   sum (weight × reps). Returns ordered weeks newest-last so the
//   sparkline reads left-to-right in time.
//
// Frequency heatmap
//   Sessions per (weekday, week) for the last N weeks. Returns a grid
//   shape ready for direct rendering.

import { exercisesForPattern, patternToExercises } from './derive';

// ─── ISO week helpers ────────────────────────────────────────────────────

const MS_DAY = 24 * 60 * 60 * 1000;

/**
 * Monday-anchored start-of-week for a given Date. Returns a new Date at 00:00 UTC
 * of the Monday on or before the input.
 */
export function startOfIsoWeek(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay(); // 0 = Sun, 1 = Mon, …
  const diff = (day + 6) % 7;  // distance back to Monday
  d.setUTCDate(d.getUTCDate() - diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function isoWeekKey(date) {
  const start = startOfIsoWeek(date);
  const y = start.getUTCFullYear();
  const m = String(start.getUTCMonth() + 1).padStart(2, '0');
  const d = String(start.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ─── PR detection ────────────────────────────────────────────────────────

/**
 * Returns { weight, reps } summaries of the historical maxima for exerciseId,
 * considering only sessions with endedAt strictly older than referenceTime.
 *
 *   weight: { value: number, unit: string } | null  — heaviest weight ever lifted
 *   repsByWeight: Map<weight, maxReps>             — best reps achieved at each weight
 */
export function historicalMaxes(archive, exerciseId, referenceTime) {
  let weight = null;
  const repsByWeight = new Map();
  if (!Array.isArray(archive)) return { weight, repsByWeight };
  const refIso = typeof referenceTime === 'string'
    ? referenceTime
    : referenceTime instanceof Date
      ? referenceTime.toISOString()
      : null;
  for (const session of archive) {
    const stamp = session.endedAt ?? session.startedAt;
    if (refIso && stamp && stamp >= refIso) continue;
    for (const perf of session.performances ?? []) {
      if (perf.exerciseId !== exerciseId) continue;
      for (const s of perf.sets ?? []) {
        if (typeof s.weight !== 'number') continue;
        if (!weight || s.weight > weight.value) {
          weight = { value: s.weight, unit: s.unit ?? null };
        }
        const prior = repsByWeight.get(s.weight) ?? 0;
        if (s.reps > prior) repsByWeight.set(s.weight, s.reps);
      }
    }
  }
  return { weight, repsByWeight };
}

/**
 * Mutates a fresh copy of `session` so that each set carries an optional `pr`
 * field summarizing whether it broke a historical record at the moment of
 * archiving. Pure function; takes the candidate session + the prior archive
 * (excluding this session).
 */
export function annotatePRs(session, priorArchive) {
  if (!session || !Array.isArray(session.performances)) return session;
  const refTime = session.endedAt ?? session.startedAt ?? new Date().toISOString();
  const performances = session.performances.map((perf) => {
    if (!perf.sets || perf.sets.length === 0) return perf;
    const { weight: histWeight, repsByWeight } = historicalMaxes(
      priorArchive,
      perf.exerciseId,
      refTime,
    );
    // Walk this performance's sets in order; running maxes update so a
    // second PR in the same session over the first PR still flags.
    let runningMaxWeight = histWeight ? histWeight.value : null;
    const runningRepsByWeight = new Map(repsByWeight);
    const sets = perf.sets.map((s) => {
      if (typeof s.weight !== 'number') return s;
      const pr = {};
      if (runningMaxWeight == null || s.weight > runningMaxWeight) {
        pr.weight = true;
        runningMaxWeight = s.weight;
      }
      const priorBest = runningRepsByWeight.get(s.weight) ?? 0;
      // Rep PR only counts if the user has lifted this weight before
      // (priorBest > 0) and beat it. A brand-new weight is a weight PR,
      // not a rep PR — avoids double-stamping the same set.
      if (priorBest > 0 && s.reps > priorBest) {
        pr.reps = { atWeight: s.weight, beat: priorBest };
      }
      // Update running maxes regardless of whether it was a PR — a heavier
      // load just lifted now becomes the standard for next set.
      const nextBest = Math.max(priorBest, s.reps);
      runningRepsByWeight.set(s.weight, nextBest);
      const hasPr = Object.keys(pr).length > 0;
      return hasPr ? { ...s, pr } : s;
    });
    return { ...perf, sets };
  });
  return { ...session, performances };
}

/**
 * Collect every PR-stamped set in a session into a flat list, for rendering
 * the end-of-session summary.
 */
export function prsFromSession(session) {
  if (!session) return [];
  const out = [];
  for (const perf of session.performances ?? []) {
    for (const s of perf.sets ?? []) {
      if (!s.pr) continue;
      out.push({
        exerciseId: perf.exerciseId,
        set: s,
        kinds: Object.keys(s.pr),
      });
    }
  }
  return out;
}

// ─── Weekly volume ───────────────────────────────────────────────────────

function patternsForExerciseId(exerciseId) {
  // Inverse of `patternToExercises`: which patterns claim this exerciseId.
  const out = new Set();
  const map = patternToExercises();
  for (const [key, list] of Object.entries(map)) {
    if (list.some((e) => e.id === exerciseId)) out.add(key);
  }
  return [...out];
}

/**
 * Walk archive, group sets by (ISO week, pattern). Returns:
 *   { weeks: [{ key, label, perPattern: { [patternKey]: number } }, …] }
 * Newest week last. Empty weeks between archive entries are filled in so
 * the sparkline reads chronologically without gaps.
 */
export function weeklyVolume(archive, now = new Date()) {
  const empty = () => ({ weeks: [] });
  if (!Array.isArray(archive) || archive.length === 0) return empty();
  // Map ISO-week-key → { perPattern }.
  const buckets = new Map();
  for (const session of archive) {
    const stamp = session.endedAt ?? session.startedAt;
    if (!stamp) continue;
    const wk = isoWeekKey(new Date(stamp));
    if (!buckets.has(wk)) buckets.set(wk, { perPattern: {} });
    const entry = buckets.get(wk);
    for (const perf of session.performances ?? []) {
      const patterns = patternsForExerciseId(perf.exerciseId);
      if (patterns.length === 0) continue;
      const vol = (perf.sets ?? []).reduce((acc, s) => (
        acc + (typeof s.weight === 'number' && typeof s.reps === 'number'
          ? s.weight * s.reps
          : 0)
      ), 0);
      if (vol === 0) continue;
      // Split volume across all matched patterns; an exercise in two
      // patterns contributes half its volume to each. Keeps totals honest.
      const share = vol / patterns.length;
      for (const p of patterns) {
        entry.perPattern[p] = (entry.perPattern[p] ?? 0) + share;
      }
    }
  }
  // Fill the contiguous range from oldest bucket to start-of-this-week.
  const sortedKeys = [...buckets.keys()].sort();
  if (sortedKeys.length === 0) return empty();
  const oldest = new Date(sortedKeys[0] + 'T00:00:00Z');
  const nowWeekStart = startOfIsoWeek(now);
  const weeks = [];
  for (let cur = new Date(oldest); cur <= nowWeekStart; cur = new Date(cur.getTime() + 7 * MS_DAY)) {
    const key = isoWeekKey(cur);
    weeks.push({
      key,
      label: key,
      perPattern: buckets.get(key)?.perPattern ?? {},
    });
  }
  return { weeks };
}

// ─── Frequency heatmap ───────────────────────────────────────────────────

/**
 * 7-column × N-row grid: rows are weeks oldest-first (top), columns are
 * weekdays Monday-first. Each cell is the count of sessions that ended on
 * that weekday in that week.
 *
 * Returns:
 *   { weeks: ['YYYY-MM-DD', …], grid: number[8][7], max: number }
 */
export function frequencyHeatmap(archive, { weeks: weekCount = 8, now = new Date() } = {}) {
  // Build the list of week keys (oldest first).
  const startThisWeek = startOfIsoWeek(now);
  const weeks = [];
  for (let i = weekCount - 1; i >= 0; i--) {
    const d = new Date(startThisWeek.getTime() - i * 7 * MS_DAY);
    weeks.push(isoWeekKey(d));
  }
  const indexByKey = new Map(weeks.map((k, i) => [k, i]));
  const grid = Array.from({ length: weekCount }, () => new Array(7).fill(0));
  let max = 0;
  if (Array.isArray(archive)) {
    for (const session of archive) {
      const stamp = session.endedAt ?? session.startedAt;
      if (!stamp) continue;
      const d = new Date(stamp);
      const wk = isoWeekKey(d);
      const row = indexByKey.get(wk);
      if (row == null) continue;
      // Monday-first: 0 = Mon, …, 6 = Sun.
      const col = (d.getUTCDay() + 6) % 7;
      grid[row][col] += 1;
      if (grid[row][col] > max) max = grid[row][col];
    }
  }
  return { weeks, grid, max };
}

// ─── Suggested load + stagnation ─────────────────────────────────────────

// Minimum load increment per unit. 2.5 kg / 5 lb tracks real-world barbell
// micro-loading; smaller jumps are accessory-style which the catalog
// expresses through reps anyway.
const INCREMENT_BY_UNIT = { kg: 2.5, lb: 5 };

function increment(unit) {
  return INCREMENT_BY_UNIT[unit] ?? INCREMENT_BY_UNIT.kg;
}

/**
 * Given the per-exercise history (oldest-first array from historyForExercise),
 * the parsed prescription (from parsePrescription), and the user's unit, return
 * a single load suggestion for the next session:
 *
 *   { kind: 'first-time'        } — no archive entries yet, no suggestion
 *   { kind: 'insufficient-data' } — ≥1 but <3 entries, suggest steady
 *   { kind: 'progress', weight, reps, increment }
 *   { kind: 'hold',     weight, reps }
 *   { kind: 'deload',   weight, reason }
 *
 * Heuristic:
 *   - last session cleared the top of the rep range → progress (+1 increment)
 *   - last session mid-range → hold (same load, finish the range first)
 *   - last 3 sessions same-or-falling at same weight → deload (–10 %)
 *   - regression on the most recent session → hold (one bad day, not a trend)
 */
export function suggestNextLoad(history, prescription, unit = 'kg') {
  if (!Array.isArray(history) || history.length === 0) {
    return { kind: 'first-time' };
  }
  if (!prescription || (prescription.kind !== 'straight' && prescription.kind !== 'pyramid')) {
    return { kind: 'insufficient-data' };
  }

  const repsHigh = prescription.repsHigh;
  const repsLow = prescription.repsLow;
  const repsMid = prescription.repsMid;
  const step = increment(unit);

  const recent = history.slice(-3); // newest at end
  const last = recent[recent.length - 1];
  if (!last?.top) return { kind: 'insufficient-data' };

  const lastWeight = last.top.weight;
  const lastReps = last.top.reps;

  // Stagnation check: ≥3 sessions all at the same weight and reps not improving.
  if (recent.length >= 3) {
    const sameWeight = recent.every((r) => r.top && r.top.weight === lastWeight);
    if (sameWeight) {
      const repsByOrder = recent.map((r) => r.top.reps);
      const monotonicNonImproving = repsByOrder.every((r, i) => (
        i === 0 ? true : r <= repsByOrder[i - 1]
      ));
      if (monotonicNonImproving) {
        const deloadWeight = Math.max(
          step,
          Math.round((lastWeight * 0.9) / step) * step,
        );
        return {
          kind: 'deload',
          weight: deloadWeight,
          reps: repsMid ?? repsLow,
          // ≤ 6 words. Cite the stall load so the user knows what
          // the algorithm saw without re-stating reps/sessions.
          reason: `Stalled three sessions at ${lastWeight}${unit}`,
        };
      }
    }
  }

  // Regression check: last session reps fell below the prior session at the
  // same weight → hold and try to reclaim the lost reps before adding load.
  const prev = recent[recent.length - 2];
  if (prev?.top && prev.top.weight === lastWeight && lastReps < prev.top.reps) {
    return {
      kind: 'hold',
      weight: lastWeight,
      reps: prev.top.reps,
      // Compact: cite both rep counts so the user can verify quickly.
      reason: `Reclaim ${prev.top.reps} reps (was ${lastReps})`,
    };
  }

  // Progress check: top of rep range cleared → bump weight.
  if (typeof repsHigh === 'number' && lastReps >= repsHigh) {
    return {
      kind: 'progress',
      weight: lastWeight + step,
      reps: repsLow ?? repsHigh,
      increment: step,
    };
  }

  // Default: hold and finish the rep range at the current weight.
  return {
    kind: 'hold',
    weight: lastWeight,
    reps: Math.min(repsHigh ?? lastReps + 1, lastReps + 1),
  };
}

// Re-export so consumers don't reach into derive directly.
export { exercisesForPattern };
