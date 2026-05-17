import { describe, it, expect } from 'vitest';
import {
  epleyE1RM,
  bestE1RMFromSets,
  e1rmSeriesForExercise,
  summarizeE1RM,
} from './e1rm.js';

describe('epleyE1RM', () => {
  it('computes 100 × 5 → 100 × (1 + 5/30) ≈ 116.67', () => {
    expect(epleyE1RM(100, 5)).toBeCloseTo(100 * (1 + 5 / 30), 5);
  });

  it('returns the weight at 1 rep', () => {
    expect(epleyE1RM(100, 1)).toBeCloseTo(100 * (1 + 1 / 30), 5);
  });

  it('caps reps at 12 to keep the estimate honest', () => {
    const at12 = epleyE1RM(100, 12);
    const at20 = epleyE1RM(100, 20);
    expect(at12).toBe(at20);
  });

  it('rejects invalid input', () => {
    expect(epleyE1RM(0, 5)).toBeNull();
    expect(epleyE1RM(-50, 5)).toBeNull();
    expect(epleyE1RM(100, 0)).toBeNull();
    expect(epleyE1RM(100, -1)).toBeNull();
    expect(epleyE1RM(null, 5)).toBeNull();
    expect(epleyE1RM(100, null)).toBeNull();
    expect(epleyE1RM(NaN, 5)).toBeNull();
  });
});

describe('bestE1RMFromSets', () => {
  it('picks the heaviest implied 1RM, not the heaviest weight', () => {
    // 100 × 5 → e1 ≈ 116.7
    // 110 × 3 → e1 ≈ 121
    // 110 wins because Epley(110, 3) > Epley(100, 5)
    const sets = [
      { weight: 100, reps: 5 },
      { weight: 110, reps: 3 },
    ];
    expect(bestE1RMFromSets(sets)).toBeCloseTo(110 * (1 + 3 / 30), 5);
  });

  it('skips warmup sets', () => {
    const sets = [
      { weight: 60, reps: 5, isWarmup: true },
      { weight: 100, reps: 5 },
    ];
    expect(bestE1RMFromSets(sets)).toBeCloseTo(100 * (1 + 5 / 30), 5);
  });

  it('returns null when no strength set exists', () => {
    expect(bestE1RMFromSets([])).toBeNull();
    expect(bestE1RMFromSets([{ isWarmup: true, weight: 50, reps: 5 }])).toBeNull();
    expect(bestE1RMFromSets([{ kind: 'duration', durationSec: 30 }])).toBeNull();
  });
});

describe('e1rmSeriesForExercise', () => {
  function session(endedAt, exerciseId, sets) {
    return {
      id: `s-${endedAt}`,
      endedAt,
      performances: [{ id: 'p', exerciseId, sets }],
    };
  }

  it('produces one point per session, oldest-first', () => {
    const archive = [
      session('2026-05-01T10:00:00Z', 'bench', [{ weight: 80, reps: 6 }]),
      session('2026-05-08T10:00:00Z', 'bench', [{ weight: 85, reps: 5 }]),
      session('2026-05-15T10:00:00Z', 'bench', [{ weight: 90, reps: 4 }]),
    ];
    const series = e1rmSeriesForExercise(archive, 'bench');
    expect(series).toHaveLength(3);
    expect(series[0].e1rm).toBeCloseTo(80 * (1 + 6 / 30), 5);
    expect(series[2].weight).toBe(90);
  });

  it('skips sessions where the exercise was not performed', () => {
    const archive = [
      session('2026-05-01T10:00:00Z', 'bench', [{ weight: 80, reps: 6 }]),
      session('2026-05-08T10:00:00Z', 'squat', [{ weight: 100, reps: 5 }]),
      session('2026-05-15T10:00:00Z', 'bench', [{ weight: 90, reps: 4 }]),
    ];
    expect(e1rmSeriesForExercise(archive, 'bench')).toHaveLength(2);
  });
});

describe('summarizeE1RM', () => {
  it('returns null for empty series', () => {
    expect(summarizeE1RM([])).toBeNull();
    expect(summarizeE1RM(null)).toBeNull();
  });

  it('returns latest only for single-point series', () => {
    const series = [{ endedAt: 'x', e1rm: 100, weight: 100, reps: 1 }];
    const s = summarizeE1RM(series);
    expect(s.latest).toBe(series[0]);
    expect(s.baseline).toBeNull();
    expect(s.delta).toBeNull();
  });

  it('computes delta and percent vs. baseline', () => {
    const series = [
      { endedAt: 'a', e1rm: 100 },
      { endedAt: 'b', e1rm: 110 },
      { endedAt: 'c', e1rm: 120 },
    ];
    const s = summarizeE1RM(series);
    expect(s.delta).toBe(20);
    expect(s.deltaPct).toBe(20);
  });

  it('respects lookbackSessions', () => {
    const series = [
      { endedAt: 'a', e1rm: 80 },
      { endedAt: 'b', e1rm: 90 },
      { endedAt: 'c', e1rm: 100 },
      { endedAt: 'd', e1rm: 110 },
    ];
    // Compare latest (110) against series[d.length-1-2] = series[1] (90)
    const s = summarizeE1RM(series, { lookbackSessions: 2 });
    expect(s.baseline.e1rm).toBe(90);
    expect(s.delta).toBe(20);
  });
});
