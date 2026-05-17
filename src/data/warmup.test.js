import { describe, it, expect } from 'vitest';
import { warmupLadder, formatLadder } from './warmup';

describe('warmupLadder', () => {
  it('builds a 3-rung ladder at 40/60/80%', () => {
    const ladder = warmupLadder(100, { unit: 'kg' });
    expect(ladder).toHaveLength(3);
    expect(ladder[0]).toEqual({ weight: 40, reps: 5, percent: 0.4 });
    expect(ladder[1]).toEqual({ weight: 60, reps: 3, percent: 0.6 });
    expect(ladder[2]).toEqual({ weight: 80, reps: 2, percent: 0.8 });
  });

  it('rounds kg to nearest 2.5', () => {
    // 102.5 → 40% = 41 → round to 40
    //       → 60% = 61.5 → round to 62.5
    //       → 80% = 82 → round to 82.5
    const ladder = warmupLadder(102.5, { unit: 'kg' });
    expect(ladder[0].weight).toBe(40);
    expect(ladder[1].weight).toBe(62.5);
    expect(ladder[2].weight).toBe(82.5);
  });

  it('rounds lb to nearest 5', () => {
    // 225 lb → 40% = 90, 60% = 135, 80% = 180
    const ladder = warmupLadder(225, { unit: 'lb' });
    expect(ladder[0].weight).toBe(90);
    expect(ladder[1].weight).toBe(135);
    expect(ladder[2].weight).toBe(180);
  });

  it('returns empty array below threshold (kg default 40)', () => {
    expect(warmupLadder(30, { unit: 'kg' })).toEqual([]);
    expect(warmupLadder(40, { unit: 'kg' })).not.toEqual([]);
  });

  it('returns empty array below threshold (lb default 90)', () => {
    expect(warmupLadder(80, { unit: 'lb' })).toEqual([]);
    expect(warmupLadder(90, { unit: 'lb' })).not.toEqual([]);
  });

  it('returns empty array for invalid input', () => {
    expect(warmupLadder(0)).toEqual([]);
    expect(warmupLadder(-50)).toEqual([]);
    expect(warmupLadder(null)).toEqual([]);
    expect(warmupLadder(undefined)).toEqual([]);
    expect(warmupLadder(NaN)).toEqual([]);
  });

  it('never returns 0 as a rung weight', () => {
    // At threshold, 40% × 40kg = 16, rounds to 15 → never 0
    const ladder = warmupLadder(40, { unit: 'kg' });
    expect(ladder.every((r) => r.weight > 0)).toBe(true);
  });
});

describe('formatLadder', () => {
  it('joins rungs with the centered dot', () => {
    const ladder = warmupLadder(100, { unit: 'kg' });
    expect(formatLadder(ladder, 'kg')).toBe('40kg × 5 · 60kg × 3 · 80kg × 2');
  });

  it('returns empty string for an empty ladder', () => {
    expect(formatLadder([], 'kg')).toBe('');
    expect(formatLadder(null, 'kg')).toBe('');
  });
});
