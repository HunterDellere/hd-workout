// Insights derivations layered on top of the archive. Pure functions —
// no React, no IO. The Insights page composes these into a dashboard.

/**
 * Sum the working-set volume in a session (warmups + duration sets
 * excluded). Returns 0 when the session is null or has no qualifying sets.
 */
export function sessionVolume(session) {
  if (!session?.performances) return 0;
  let v = 0;
  for (const p of session.performances) {
    for (const s of p.sets ?? []) {
      if (s.isWarmup) continue;
      if (typeof s.weight !== 'number' || typeof s.reps !== 'number') continue;
      v += s.weight * s.reps;
    }
  }
  return v;
}

/**
 * Total working sets in a session (warmups + duration sets excluded).
 */
export function sessionWorkingSets(session) {
  if (!session?.performances) return 0;
  let n = 0;
  for (const p of session.performances) {
    for (const s of p.sets ?? []) {
      if (s.isWarmup) continue;
      if (typeof s.weight === 'number' && typeof s.reps === 'number') n += 1;
    }
  }
  return n;
}

function dayStamp(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfDay(d) {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

/**
 * Current consecutive-day session streak. Counts back from `now`; a day
 * counts when ≥1 archived session ended on that local day, OR is "today"
 * with no session yet (the streak doesn't break until tomorrow).
 *
 * Rules:
 *   - Skipping today doesn't break the streak (the user might lift tonight).
 *   - Two sessions on one day count once.
 *   - The streak counts the last consecutive run of session-days.
 *
 * Returns { current, longest }.
 */
export function sessionStreak(archive, { now = new Date() } = {}) {
  if (!Array.isArray(archive) || archive.length === 0) {
    return { current: 0, longest: 0 };
  }
  const days = new Set();
  for (const s of archive) {
    const iso = s.endedAt ?? s.startedAt;
    if (!iso) continue;
    days.add(dayStamp(new Date(iso)));
  }
  if (days.size === 0) return { current: 0, longest: 0 };

  // Current streak — walk back from today.
  let current = 0;
  let cursor = startOfDay(now);
  // If today isn't in the set, allow one grace day (today not yet logged).
  let allowMissing = !days.has(dayStamp(cursor));
  while (true) {
    const key = dayStamp(cursor);
    if (days.has(key)) {
      current += 1;
      allowMissing = false;
    } else if (allowMissing) {
      allowMissing = false;
    } else {
      break;
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  // Longest streak — sort all session-days and find the max consecutive run.
  const sortedDays = [...days].sort();
  let longest = 0;
  let run = 0;
  let prev = null;
  for (const d of sortedDays) {
    if (prev !== null) {
      const prevDate = new Date(prev);
      const cur = new Date(d);
      const diff = Math.round((cur - prevDate) / 86400000);
      if (diff === 1) {
        run += 1;
      } else {
        run = 1;
      }
    } else {
      run = 1;
    }
    if (run > longest) longest = run;
    prev = d;
  }

  return { current, longest };
}

/**
 * Top exercises by working-set count over the last `days` days, sorted
 * descending. Returns up to `limit` entries: { exerciseId, sets, volume }.
 */
export function topExercises(archive, { days = 30, limit = 5, now = new Date() } = {}) {
  if (!Array.isArray(archive) || archive.length === 0) return [];
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffMs = cutoff.getTime();

  const tally = new Map();
  for (const session of archive) {
    const ended = new Date(session.endedAt ?? session.startedAt ?? 0).getTime();
    if (!Number.isFinite(ended) || ended < cutoffMs) continue;
    for (const perf of session.performances ?? []) {
      const id = perf.exerciseId;
      if (!id) continue;
      let sets = 0;
      let volume = 0;
      for (const s of perf.sets ?? []) {
        if (s.isWarmup) continue;
        if (typeof s.weight !== 'number' || typeof s.reps !== 'number') continue;
        sets += 1;
        volume += s.weight * s.reps;
      }
      if (sets === 0) continue;
      const prev = tally.get(id) ?? { exerciseId: id, sets: 0, volume: 0 };
      prev.sets += sets;
      prev.volume += volume;
      tally.set(id, prev);
    }
  }
  return [...tally.values()]
    .sort((a, b) => b.sets - a.sets || b.volume - a.volume)
    .slice(0, limit);
}

/**
 * Volume delta this-week vs last-week, total across all patterns.
 * Returns { thisWeek, lastWeek, delta, pct } where pct is signed and
 * null when lastWeek is zero (can't divide).
 */
export function weeklyVolumeDelta(volumeFrame) {
  if (!volumeFrame?.weeks || volumeFrame.weeks.length < 2) {
    return { thisWeek: 0, lastWeek: 0, delta: 0, pct: null };
  }
  const weeks = volumeFrame.weeks;
  const thisWeek = sumPerPattern(weeks[weeks.length - 1]);
  const lastWeek = sumPerPattern(weeks[weeks.length - 2]);
  const delta = thisWeek - lastWeek;
  const pct = lastWeek > 0 ? (delta / lastWeek) * 100 : null;
  return { thisWeek, lastWeek, delta, pct };
}

function sumPerPattern(week) {
  if (!week?.perPattern) return 0;
  let n = 0;
  for (const v of Object.values(week.perPattern)) n += v;
  return n;
}

/**
 * Per-pattern trend: did this week beat the average of the previous 4?
 * Returns map of patternKey → { thisWeek, prior4Avg, direction: 'up'|'down'|'flat' }.
 */
export function patternTrends(volumeFrame) {
  if (!volumeFrame?.weeks || volumeFrame.weeks.length < 2) return {};
  const weeks = volumeFrame.weeks;
  const current = weeks[weeks.length - 1].perPattern ?? {};
  const priorN = Math.min(4, weeks.length - 1);
  const prior = weeks.slice(-1 - priorN, -1);
  const out = {};
  // Walk every pattern that appears in EITHER current or prior weeks.
  const keys = new Set(Object.keys(current));
  for (const w of prior) for (const k of Object.keys(w.perPattern ?? {})) keys.add(k);
  for (const k of keys) {
    const thisWeek = current[k] ?? 0;
    const priorSum = prior.reduce((s, w) => s + (w.perPattern?.[k] ?? 0), 0);
    const priorAvg = prior.length > 0 ? priorSum / prior.length : 0;
    let direction = 'flat';
    if (priorAvg === 0 && thisWeek > 0) direction = 'up';
    else if (thisWeek > priorAvg * 1.1) direction = 'up';
    else if (thisWeek < priorAvg * 0.9) direction = 'down';
    out[k] = { thisWeek, prior4Avg: priorAvg, direction };
  }
  return out;
}

/**
 * Personal records logged this month. Walks the archive, filters PR sets
 * with endedAt in the current calendar month. Returns an array of
 * { session, perf, set, kinds }.
 */
export function prsThisMonth(archive, { now = new Date() } = {}) {
  if (!Array.isArray(archive) || archive.length === 0) return [];
  // Compare on local calendar fields on both sides. The previous code
  // matched a UTC ISO prefix against a locally-derived YYYY-MM, so a
  // session ended near a month boundary in a negative-offset timezone
  // landed in the wrong month. Mirrors the dayStamp/startOfDay convention.
  const nowY = now.getFullYear();
  const nowM = now.getMonth();
  const out = [];
  for (const session of archive) {
    const d = new Date(session.endedAt ?? session.startedAt ?? 0);
    if (Number.isNaN(d.getTime())) continue;
    if (d.getFullYear() !== nowY || d.getMonth() !== nowM) continue;
    for (const perf of session.performances ?? []) {
      for (const set of perf.sets ?? []) {
        if (!set.pr) continue;
        const kinds = [];
        if (set.pr.weight) kinds.push('weight');
        if (set.pr.reps) kinds.push('reps');
        if (kinds.length === 0) continue;
        out.push({ session, perf, set, kinds });
      }
    }
  }
  return out;
}
