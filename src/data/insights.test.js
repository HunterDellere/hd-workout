import { describe, it, expect } from 'vitest';
import {
  sessionVolume,
  sessionWorkingSets,
  sessionStreak,
  topExercises,
  weeklyVolumeDelta,
  patternTrends,
  prsThisMonth,
} from './insights';

function makeSession({ id = 'A', endedAt = '2026-05-08T11:00:00.000Z', performances = [] } = {}) {
  return { id, startedAt: endedAt, endedAt, performances };
}

const ONE_KG_SET = { weight: 100, reps: 5 };

describe('sessionVolume', () => {
  it('sums working-set volume', () => {
    const s = makeSession({
      performances: [{
        exerciseId: 'bench',
        sets: [
          { weight: 100, reps: 5 }, // 500
          { weight: 100, reps: 5 }, // 500
          { weight: 100, reps: 3 }, // 300
        ],
      }],
    });
    expect(sessionVolume(s)).toBe(1300);
  });

  it('skips warmup sets', () => {
    const s = makeSession({
      performances: [{
        exerciseId: 'bench',
        sets: [
          { weight: 60, reps: 5, isWarmup: true }, // skip
          { weight: 100, reps: 5 },                 // 500
        ],
      }],
    });
    expect(sessionVolume(s)).toBe(500);
  });

  it('skips duration sets', () => {
    const s = makeSession({
      performances: [{
        exerciseId: 'stretch',
        sets: [
          { kind: 'duration', durationSec: 30 }, // skip
        ],
      }],
    });
    expect(sessionVolume(s)).toBe(0);
  });
});

describe('sessionWorkingSets', () => {
  it('counts only strength working sets', () => {
    const s = makeSession({
      performances: [{
        sets: [
          { weight: 60, reps: 5, isWarmup: true },
          { weight: 100, reps: 5 },
          { weight: 100, reps: 5 },
          { kind: 'duration', durationSec: 30 },
        ],
      }],
    });
    expect(sessionWorkingSets(s)).toBe(2);
  });
});

describe('sessionStreak', () => {
  it('returns zero for empty archive', () => {
    expect(sessionStreak([])).toEqual({ current: 0, longest: 0 });
  });

  it('counts a three-day streak ending today', () => {
    const now = new Date('2026-05-10T12:00:00.000Z');
    const archive = [
      makeSession({ id: 'A', endedAt: '2026-05-08T11:00:00.000Z' }),
      makeSession({ id: 'B', endedAt: '2026-05-09T11:00:00.000Z' }),
      makeSession({ id: 'C', endedAt: '2026-05-10T11:00:00.000Z' }),
    ];
    expect(sessionStreak(archive, { now })).toMatchObject({ current: 3, longest: 3 });
  });

  it('grace-day for unlogged today (streak survives until tomorrow)', () => {
    const now = new Date('2026-05-10T12:00:00.000Z');
    const archive = [
      makeSession({ id: 'A', endedAt: '2026-05-08T11:00:00.000Z' }),
      makeSession({ id: 'B', endedAt: '2026-05-09T11:00:00.000Z' }),
      // No session on 2026-05-10 yet — streak is still 2.
    ];
    expect(sessionStreak(archive, { now }).current).toBe(2);
  });

  it('longest captures the historical max even when broken', () => {
    const now = new Date('2026-05-15T12:00:00.000Z');
    const archive = [
      // A 5-day run in the past.
      makeSession({ id: 'A', endedAt: '2026-05-01T11:00:00.000Z' }),
      makeSession({ id: 'B', endedAt: '2026-05-02T11:00:00.000Z' }),
      makeSession({ id: 'C', endedAt: '2026-05-03T11:00:00.000Z' }),
      makeSession({ id: 'D', endedAt: '2026-05-04T11:00:00.000Z' }),
      makeSession({ id: 'E', endedAt: '2026-05-05T11:00:00.000Z' }),
      // Big gap, then one session today.
      makeSession({ id: 'F', endedAt: '2026-05-15T11:00:00.000Z' }),
    ];
    expect(sessionStreak(archive, { now })).toMatchObject({ current: 1, longest: 5 });
  });
});

describe('topExercises', () => {
  it('ranks by working-set count over the window', () => {
    const archive = [
      makeSession({
        id: 'A',
        endedAt: '2026-05-08T11:00:00.000Z',
        performances: [
          { exerciseId: 'bench', sets: [ONE_KG_SET, ONE_KG_SET, ONE_KG_SET] },
          { exerciseId: 'row',   sets: [ONE_KG_SET] },
        ],
      }),
      makeSession({
        id: 'B',
        endedAt: '2026-05-09T11:00:00.000Z',
        performances: [
          { exerciseId: 'bench', sets: [ONE_KG_SET, ONE_KG_SET] },
          { exerciseId: 'squat', sets: [ONE_KG_SET, ONE_KG_SET, ONE_KG_SET, ONE_KG_SET] },
        ],
      }),
    ];
    const out = topExercises(archive, {
      now: new Date('2026-05-15T12:00:00.000Z'),
      days: 30,
      limit: 3,
    });
    expect(out[0]).toMatchObject({ exerciseId: 'bench', sets: 5 });
    expect(out[1]).toMatchObject({ exerciseId: 'squat', sets: 4 });
    expect(out[2]).toMatchObject({ exerciseId: 'row', sets: 1 });
  });

  it('respects the window cutoff', () => {
    const archive = [
      makeSession({ id: 'old', endedAt: '2026-01-01T11:00:00.000Z',
        performances: [{ exerciseId: 'bench', sets: [ONE_KG_SET] }] }),
      makeSession({ id: 'new', endedAt: '2026-05-10T11:00:00.000Z',
        performances: [{ exerciseId: 'squat', sets: [ONE_KG_SET] }] }),
    ];
    const out = topExercises(archive, { now: new Date('2026-05-15T12:00:00.000Z'), days: 30 });
    expect(out.map((e) => e.exerciseId)).toEqual(['squat']);
  });
});

describe('weeklyVolumeDelta', () => {
  it('computes pct delta when both weeks have volume', () => {
    const frame = {
      weeks: [
        { perPattern: { 'horizontal-press': 800 } },
        { perPattern: { 'horizontal-press': 1000 } },
      ],
    };
    const r = weeklyVolumeDelta(frame);
    expect(r.thisWeek).toBe(1000);
    expect(r.lastWeek).toBe(800);
    expect(r.delta).toBe(200);
    expect(r.pct).toBe(25);
  });

  it('returns null pct when lastWeek is zero', () => {
    const frame = {
      weeks: [
        { perPattern: {} },
        { perPattern: { 'horizontal-press': 500 } },
      ],
    };
    expect(weeklyVolumeDelta(frame).pct).toBeNull();
  });

  it('returns zeroes for short frames', () => {
    expect(weeklyVolumeDelta({ weeks: [] })).toMatchObject({ thisWeek: 0, lastWeek: 0 });
  });
});

describe('patternTrends', () => {
  it('marks up when this week beats prior 4-week avg by >10%', () => {
    const frame = {
      weeks: [
        { perPattern: { 'horizontal-press': 500 } },
        { perPattern: { 'horizontal-press': 500 } },
        { perPattern: { 'horizontal-press': 500 } },
        { perPattern: { 'horizontal-press': 500 } },
        { perPattern: { 'horizontal-press': 1000 } }, // this week — 2× avg
      ],
    };
    expect(patternTrends(frame)['horizontal-press'].direction).toBe('up');
  });

  it('marks down when this week falls 10%+ below avg', () => {
    const frame = {
      weeks: [
        { perPattern: { 'hinge': 1000 } },
        { perPattern: { 'hinge': 1000 } },
        { perPattern: { 'hinge': 1000 } },
        { perPattern: { 'hinge': 1000 } },
        { perPattern: { 'hinge': 200 } },
      ],
    };
    expect(patternTrends(frame)['hinge'].direction).toBe('down');
  });

  it('marks up when previously zero', () => {
    const frame = {
      weeks: [
        { perPattern: {} },
        { perPattern: {} },
        { perPattern: { 'squat': 500 } },
      ],
    };
    expect(patternTrends(frame)['squat'].direction).toBe('up');
  });
});

describe('prsThisMonth', () => {
  it('returns PRs from the current calendar month only', () => {
    const now = new Date('2026-05-15T12:00:00.000Z');
    const archive = [
      {
        endedAt: '2026-05-08T11:00:00.000Z',
        performances: [{
          exerciseId: 'bench',
          sets: [{ weight: 100, reps: 5, pr: { weight: true } }],
        }],
      },
      {
        endedAt: '2026-04-30T11:00:00.000Z',
        performances: [{
          exerciseId: 'squat',
          sets: [{ weight: 120, reps: 5, pr: { weight: true } }],
        }],
      },
    ];
    const out = prsThisMonth(archive, { now });
    expect(out.length).toBe(1);
    expect(out[0].perf.exerciseId).toBe('bench');
  });
});
