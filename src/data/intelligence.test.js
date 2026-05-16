import { describe, it, expect } from 'vitest';
import {
  annotatePRs,
  prsFromSession,
  historicalMaxes,
  weeklyVolume,
  frequencyHeatmap,
  isoWeekKey,
  suggestNextLoad,
} from './intelligence';

const session = (id, endedAt, exerciseId, sets) => ({
  id,
  dayKey: 'push',
  startedAt: endedAt,
  endedAt,
  performances: [{ exerciseId, sets, sectionKey: 'main' }],
});

describe('startOfIsoWeek / isoWeekKey', () => {
  it('returns Monday of the same week', () => {
    // 2026-05-15 is a Friday — Monday is 2026-05-11.
    const d = new Date('2026-05-15T12:00:00.000Z');
    expect(isoWeekKey(d)).toBe('2026-05-11');
  });
  it('Monday returns itself', () => {
    const d = new Date('2026-05-11T08:00:00.000Z');
    expect(isoWeekKey(d)).toBe('2026-05-11');
  });
  it('Sunday belongs to the preceding Monday', () => {
    const d = new Date('2026-05-17T23:00:00.000Z');
    expect(isoWeekKey(d)).toBe('2026-05-11');
  });
});

describe('historicalMaxes', () => {
  it('returns null/empty when archive has nothing for the exercise', () => {
    const out = historicalMaxes([], 'bench', '2026-05-15T00:00:00.000Z');
    expect(out.weight).toBeNull();
    expect(out.repsByWeight.size).toBe(0);
  });

  it('finds heaviest weight and best reps at each weight', () => {
    const archive = [
      session('a', '2026-05-01T00:00:00.000Z', 'bench', [
        { weight: 60, reps: 8, unit: 'kg' },
        { weight: 70, reps: 5, unit: 'kg' },
      ]),
      session('b', '2026-05-08T00:00:00.000Z', 'bench', [
        { weight: 70, reps: 6, unit: 'kg' },
      ]),
    ];
    const { weight, repsByWeight } = historicalMaxes(archive, 'bench', '2026-05-15T00:00:00.000Z');
    expect(weight).toMatchObject({ value: 70 });
    expect(repsByWeight.get(60)).toBe(8);
    expect(repsByWeight.get(70)).toBe(6);
  });

  it('ignores sessions at or after the reference time', () => {
    const archive = [
      session('a', '2026-05-15T00:00:00.000Z', 'bench', [{ weight: 100, reps: 1 }]),
    ];
    const { weight } = historicalMaxes(archive, 'bench', '2026-05-15T00:00:00.000Z');
    expect(weight).toBeNull();
  });
});

describe('annotatePRs', () => {
  it('flags a weight PR when no prior weight exists', () => {
    const candidate = session('c', '2026-05-15T00:00:00.000Z', 'bench', [
      { weight: 60, reps: 5 },
    ]);
    const out = annotatePRs(candidate, []);
    expect(out.performances[0].sets[0].pr).toEqual({ weight: true });
  });

  it('flags a weight PR when surpassing historical max', () => {
    const archive = [session('a', '2026-05-01T00:00:00.000Z', 'bench', [{ weight: 70, reps: 5 }])];
    const candidate = session('c', '2026-05-15T00:00:00.000Z', 'bench', [
      { weight: 75, reps: 3 },
    ]);
    const out = annotatePRs(candidate, archive);
    expect(out.performances[0].sets[0].pr).toEqual({ weight: true });
  });

  it('flags a rep PR when beating prior reps at a previously-lifted weight', () => {
    const archive = [session('a', '2026-05-01T00:00:00.000Z', 'bench', [{ weight: 70, reps: 5 }])];
    const candidate = session('c', '2026-05-15T00:00:00.000Z', 'bench', [
      { weight: 70, reps: 7 },
    ]);
    const out = annotatePRs(candidate, archive);
    expect(out.performances[0].sets[0].pr).toEqual({ reps: { atWeight: 70, beat: 5 } });
  });

  it('does not flag rep PR for a fresh weight (already covered by weight PR)', () => {
    const archive = [session('a', '2026-05-01T00:00:00.000Z', 'bench', [{ weight: 70, reps: 5 }])];
    const candidate = session('c', '2026-05-15T00:00:00.000Z', 'bench', [
      { weight: 75, reps: 10 },
    ]);
    const out = annotatePRs(candidate, archive);
    expect(out.performances[0].sets[0].pr).toEqual({ weight: true });
  });

  it('does not flag a regression', () => {
    const archive = [session('a', '2026-05-01T00:00:00.000Z', 'bench', [{ weight: 70, reps: 7 }])];
    const candidate = session('c', '2026-05-15T00:00:00.000Z', 'bench', [
      { weight: 70, reps: 5 },
    ]);
    const out = annotatePRs(candidate, archive);
    expect(out.performances[0].sets[0].pr).toBeUndefined();
  });

  it('flags successive PRs within the same session', () => {
    const candidate = session('c', '2026-05-15T00:00:00.000Z', 'bench', [
      { weight: 60, reps: 5 },
      { weight: 70, reps: 5 },
      { weight: 80, reps: 3 },
    ]);
    const out = annotatePRs(candidate, []);
    expect(out.performances[0].sets[0].pr).toEqual({ weight: true });
    expect(out.performances[0].sets[1].pr).toEqual({ weight: true });
    expect(out.performances[0].sets[2].pr).toEqual({ weight: true });
  });
});

describe('prsFromSession', () => {
  it('returns empty for sessions with no PRs', () => {
    expect(prsFromSession(session('a', '2026-05-15T00:00:00.000Z', 'bench', [{ weight: 60, reps: 5 }]))).toEqual([]);
  });
  it('extracts only PR-stamped sets', () => {
    const s = annotatePRs(
      session('c', '2026-05-15T00:00:00.000Z', 'bench', [
        { weight: 60, reps: 5 },
        { weight: 70, reps: 5 },
      ]),
      [],
    );
    const prs = prsFromSession(s);
    expect(prs).toHaveLength(2);
    expect(prs[0].kinds).toContain('weight');
  });
});

describe('weeklyVolume', () => {
  it('returns empty weeks on empty archive', () => {
    expect(weeklyVolume([])).toEqual({ weeks: [] });
  });

  it('groups by ISO week and splits across patterns', () => {
    // push-bb-bench is in horizontal-press only — full volume to that pattern.
    const archive = [
      session('a', '2026-05-12T12:00:00.000Z', 'push-bb-bench', [
        { weight: 100, reps: 5 },
        { weight: 100, reps: 5 },
      ]),
    ];
    const { weeks } = weeklyVolume(archive, new Date('2026-05-15T12:00:00.000Z'));
    expect(weeks.length).toBeGreaterThanOrEqual(1);
    const wk = weeks.find((w) => w.key === '2026-05-11');
    expect(wk.perPattern['horizontal-press']).toBe(1000);
  });
});

describe('frequencyHeatmap', () => {
  it('produces an 8×7 grid by default', () => {
    const out = frequencyHeatmap([], { now: new Date('2026-05-15T12:00:00.000Z') });
    expect(out.weeks).toHaveLength(8);
    expect(out.grid).toHaveLength(8);
    expect(out.grid[0]).toHaveLength(7);
    expect(out.max).toBe(0);
  });

  it('places a Friday session in the Friday column', () => {
    // 2026-05-15 is a Friday → column 4 (Mon=0, Fri=4).
    const archive = [session('a', '2026-05-15T12:00:00.000Z', 'bench', [{ weight: 50, reps: 5 }])];
    const out = frequencyHeatmap(archive, { now: new Date('2026-05-15T12:00:00.000Z') });
    const lastRow = out.grid[out.grid.length - 1];
    expect(lastRow[4]).toBe(1);
    expect(out.max).toBe(1);
  });

  it('drops sessions older than the window', () => {
    const archive = [session('a', '2025-01-01T00:00:00.000Z', 'bench', [{ weight: 50, reps: 5 }])];
    const out = frequencyHeatmap(archive, { now: new Date('2026-05-15T12:00:00.000Z') });
    expect(out.max).toBe(0);
  });
});

describe('suggestNextLoad', () => {
  const RX_5_8 = { kind: 'straight', sets: 4, repsLow: 5, repsHigh: 8, repsMid: 7 };

  const histEntry = (weight, reps, daysAgo, rpe = null) => ({
    sessionId: `s-${daysAgo}`,
    endedAt: new Date(Date.now() - daysAgo * 24 * 3600 * 1000).toISOString(),
    dayKey: 'push',
    top: { weight, reps, unit: 'kg', rpe },
    setCount: 3,
  });

  it('first-time with empty history', () => {
    expect(suggestNextLoad([], RX_5_8)).toEqual({ kind: 'first-time' });
  });

  it('insufficient-data with free-text prescription', () => {
    expect(suggestNextLoad([histEntry(100, 5, 7)], { kind: 'free-text', raw: 'as many as possible' }))
      .toEqual({ kind: 'insufficient-data' });
  });

  it('progress when top of rep range cleared', () => {
    const history = [histEntry(100, 8, 7)];
    expect(suggestNextLoad(history, RX_5_8, 'kg'))
      .toEqual({ kind: 'progress', weight: 102.5, reps: 5, increment: 2.5 });
  });

  it('progress respects lb increment', () => {
    const history = [histEntry(225, 8, 7)];
    expect(suggestNextLoad(history, RX_5_8, 'lb'))
      .toEqual({ kind: 'progress', weight: 230, reps: 5, increment: 5 });
  });

  it('hold when mid-range', () => {
    const history = [histEntry(100, 6, 7)];
    const out = suggestNextLoad(history, RX_5_8, 'kg');
    expect(out.kind).toBe('hold');
    expect(out.weight).toBe(100);
  });

  it('deload after three same-weight non-improving sessions', () => {
    const history = [
      histEntry(100, 6, 21),
      histEntry(100, 6, 14),
      histEntry(100, 5, 7),
    ];
    const out = suggestNextLoad(history, RX_5_8, 'kg');
    expect(out.kind).toBe('deload');
    expect(out.weight).toBe(90); // 100 × 0.9 rounded to 2.5 → 90
    expect(out.reason).toMatch(/Stalled three sessions at 100kg/);
    expect(out.reason.split(/\s+/).length).toBeLessThanOrEqual(6);
  });

  it('hold (not deload) after a single regression', () => {
    const history = [
      histEntry(100, 6, 14),
      histEntry(100, 4, 7),
    ];
    const out = suggestNextLoad(history, RX_5_8, 'kg');
    expect(out.kind).toBe('hold');
    expect(out.reps).toBe(6);
    expect(out.reason).toMatch(/Reclaim 6 reps \(was 4\)/);
    expect(out.reason.split(/\s+/).length).toBeLessThanOrEqual(6);
  });

  // ─── RPE-aware branch (Wave 1.4) ─────────────────────────────────────
  it('RPE ≤ 7 progresses regardless of mid-range reps', () => {
    // Mid-range reps (6) would normally → hold; RPE 7 says "left reps in tank".
    const history = [histEntry(100, 6, 7, 7)];
    const out = suggestNextLoad(history, RX_5_8, 'kg');
    expect(out.kind).toBe('progress');
    expect(out.weight).toBe(102.5);
    expect(out.reason).toMatch(/RPE 7/);
  });

  it('RPE 8 falls through to range-based logic (hold at mid-range)', () => {
    const history = [histEntry(100, 6, 7, 8)];
    const out = suggestNextLoad(history, RX_5_8, 'kg');
    expect(out.kind).toBe('hold');
    expect(out.weight).toBe(100);
    // No RPE reason — the range logic applies, not the RPE branch.
    expect(out.reason).toBeUndefined();
  });

  it('RPE ≥ 9 holds even when reps cleared the top of the range', () => {
    // Reps would normally → progress; RPE 9 says "at or past failure".
    const history = [histEntry(100, 8, 7, 9)];
    const out = suggestNextLoad(history, RX_5_8, 'kg');
    expect(out.kind).toBe('hold');
    expect(out.weight).toBe(100);
    expect(out.reason).toMatch(/RPE 9/);
  });

  it('RPE ≥ 9 with regression at same weight deloads', () => {
    const history = [
      histEntry(100, 6, 14, 8),
      histEntry(100, 4, 7, 10),
    ];
    const out = suggestNextLoad(history, RX_5_8, 'kg');
    expect(out.kind).toBe('deload');
    expect(out.weight).toBe(90);
    expect(out.reason).toMatch(/RPE 10/);
  });

  it('null RPE preserves the legacy range-based heuristic', () => {
    // Same as the existing "progress when top of range cleared" test —
    // verifies the RPE branch only fires when RPE is present.
    const history = [histEntry(100, 8, 7)];
    const out = suggestNextLoad(history, RX_5_8, 'kg');
    expect(out.kind).toBe('progress');
    expect(out.reason).toBeUndefined();
  });

  it('progress not triggered by stalled sessions even at top of range', () => {
    // Three sessions at top-of-range, same weight, same reps — that's a plateau.
    const history = [
      histEntry(100, 8, 21),
      histEntry(100, 8, 14),
      histEntry(100, 8, 7),
    ];
    // Per current heuristic, this counts as stagnation (sameWeight + monotonic-non-improving).
    // Acceptable: if you've parked at top-of-range three sessions running you're
    // genuinely stuck (probably grinding the last rep with form drift).
    const out = suggestNextLoad(history, RX_5_8, 'kg');
    expect(out.kind).toBe('deload');
  });
});
