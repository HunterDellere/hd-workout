import { describe, it, expect } from 'vitest';
import {
  topSet,
  historyForExercise,
  lastTopSetForExercise,
  lastWorkingSetsForExercise,
  autoProgressionFor,
} from './history';

const SESSION_A = {
  id: 'A',
  dayKey: 'push',
  startedAt: '2026-05-01T10:00:00.000Z',
  endedAt: '2026-05-01T11:00:00.000Z',
  performances: [
    {
      exerciseId: 'bench',
      sets: [
        { weight: 60, reps: 8, unit: 'kg', loggedAt: '2026-05-01T10:10:00.000Z' },
        { weight: 70, reps: 5, unit: 'kg', loggedAt: '2026-05-01T10:20:00.000Z' },
      ],
    },
    { exerciseId: 'row', sets: [] },
  ],
};

const SESSION_B = {
  id: 'B',
  dayKey: 'push',
  startedAt: '2026-05-08T10:00:00.000Z',
  endedAt: '2026-05-08T11:00:00.000Z',
  performances: [
    {
      exerciseId: 'bench',
      sets: [
        { weight: 70, reps: 6, unit: 'kg', loggedAt: '2026-05-08T10:10:00.000Z' },
        { weight: 70, reps: 7, unit: 'kg', loggedAt: '2026-05-08T10:20:00.000Z' },
      ],
    },
  ],
};

describe('topSet', () => {
  it('returns null on empty', () => {
    expect(topSet([])).toBeNull();
    expect(topSet(undefined)).toBeNull();
  });
  it('picks heaviest weight', () => {
    expect(topSet([{ weight: 60, reps: 8 }, { weight: 70, reps: 5 }])).toMatchObject({ weight: 70, reps: 5 });
  });
  it('ties broken by higher reps', () => {
    expect(topSet([{ weight: 70, reps: 6 }, { weight: 70, reps: 7 }])).toMatchObject({ reps: 7 });
  });
  // Wave 3.2: warmups are not working sets, so they can't be "top".
  it('skips warmup sets even when heavier', () => {
    const sets = [
      { weight: 100, reps: 5, isWarmup: true },
      { weight: 80, reps: 6 },
    ];
    expect(topSet(sets)).toMatchObject({ weight: 80, reps: 6 });
  });
  it('returns null when every set is a warmup', () => {
    const sets = [
      { weight: 60, reps: 8, isWarmup: true },
      { weight: 70, reps: 5, isWarmup: true },
    ];
    expect(topSet(sets)).toBeNull();
  });
  // Pure duration/distance work has no weight — it must still surface a
  // representative set rather than being dropped.
  it('returns a duration set for a time-only exercise', () => {
    const sets = [
      { kind: 'duration', durationSec: 30 },
      { kind: 'duration', durationSec: 45 },
    ];
    expect(topSet(sets)).toMatchObject({ kind: 'duration', durationSec: 30 });
  });
  // When a weighted working set exists alongside a duration set, the
  // weighted one wins so the "Last time" line shows real load.
  it('prefers a weighted set over a duration set', () => {
    const sets = [
      { kind: 'duration', durationSec: 45 },
      { weight: 80, reps: 6 },
    ];
    expect(topSet(sets)).toMatchObject({ weight: 80, reps: 6 });
  });
});

describe('historyForExercise', () => {
  it('returns empty for unknown exercise', () => {
    expect(historyForExercise([SESSION_A], 'nope')).toEqual([]);
  });
  it('returns empty for empty archive', () => {
    expect(historyForExercise([], 'bench')).toEqual([]);
    expect(historyForExercise(null, 'bench')).toEqual([]);
  });
  it('summarises each session that touched the exercise', () => {
    const out = historyForExercise([SESSION_A, SESSION_B], 'bench');
    expect(out).toHaveLength(2);
    expect(out[0].sessionId).toBe('A');
    expect(out[0].top).toMatchObject({ weight: 70, reps: 5 });
    expect(out[1].top).toMatchObject({ weight: 70, reps: 7 });
  });
  it('skips performances with no logged sets', () => {
    expect(historyForExercise([SESSION_A], 'row')).toEqual([]);
  });
  it('honours the limit (keeps newest)', () => {
    const out = historyForExercise([SESSION_A, SESSION_B], 'bench', 1);
    expect(out).toHaveLength(1);
    expect(out[0].sessionId).toBe('B');
  });
});

describe('lastTopSetForExercise', () => {
  it('returns null on empty history', () => {
    expect(lastTopSetForExercise([], 'bench')).toBeNull();
  });
  it('returns the newest summary', () => {
    const last = lastTopSetForExercise([SESSION_A, SESSION_B], 'bench');
    expect(last.sessionId).toBe('B');
    expect(last.top).toMatchObject({ weight: 70, reps: 7 });
  });
});

describe('auto-progression', () => {
  const PRESCRIPTION_5_8 = {
    kind: 'straight',
    sets: 3,
    setsTotal: 3,
    repsLow: 5,
    repsHigh: 8,
    repsMid: 7,
  };

  function makeSession(id, sets) {
    return {
      id,
      dayKey: 'push',
      endedAt: '2026-05-08T11:00:00.000Z',
      performances: [{ exerciseId: 'bench', sets }],
    };
  }

  it('bumps when all working sets hit the top of the rep range', () => {
    const sets = [
      { weight: 100, reps: 8, unit: 'kg' },
      { weight: 100, reps: 8, unit: 'kg' },
      { weight: 100, reps: 8, unit: 'kg' },
    ];
    const ws = lastWorkingSetsForExercise([makeSession('A', sets)], 'bench');
    expect(autoProgressionFor(ws, PRESCRIPTION_5_8, 'kg')).toMatchObject({
      from: 100, to: 102.5, increment: 2.5,
    });
  });

  it('lb uses 5lb increment', () => {
    const sets = [
      { weight: 225, reps: 8, unit: 'lb' },
      { weight: 225, reps: 8, unit: 'lb' },
      { weight: 225, reps: 8, unit: 'lb' },
    ];
    const ws = lastWorkingSetsForExercise([makeSession('A', sets)], 'bench');
    expect(autoProgressionFor(ws, PRESCRIPTION_5_8, 'lb')).toMatchObject({
      from: 225, to: 230, increment: 5,
    });
  });

  it('does not bump when one set fell short', () => {
    const sets = [
      { weight: 100, reps: 8, unit: 'kg' },
      { weight: 100, reps: 8, unit: 'kg' },
      { weight: 100, reps: 7, unit: 'kg' },
    ];
    const ws = lastWorkingSetsForExercise([makeSession('A', sets)], 'bench');
    expect(autoProgressionFor(ws, PRESCRIPTION_5_8, 'kg')).toBeNull();
  });

  it('does not bump on RPE 9+', () => {
    const sets = [
      { weight: 100, reps: 8, rpe: 8, unit: 'kg' },
      { weight: 100, reps: 8, rpe: 9, unit: 'kg' },
      { weight: 100, reps: 8, rpe: 8, unit: 'kg' },
    ];
    const ws = lastWorkingSetsForExercise([makeSession('A', sets)], 'bench');
    expect(autoProgressionFor(ws, PRESCRIPTION_5_8, 'kg')).toBeNull();
  });

  it('does not bump when fewer sets were logged than prescribed', () => {
    const sets = [
      { weight: 100, reps: 8, unit: 'kg' },
      { weight: 100, reps: 8, unit: 'kg' },
    ];
    const ws = lastWorkingSetsForExercise([makeSession('A', sets)], 'bench');
    expect(autoProgressionFor(ws, PRESCRIPTION_5_8, 'kg')).toBeNull();
  });

  it('ignores warmup sets', () => {
    const sets = [
      { weight: 60, reps: 8, isWarmup: true, unit: 'kg' },
      { weight: 100, reps: 8, unit: 'kg' },
      { weight: 100, reps: 8, unit: 'kg' },
      { weight: 100, reps: 8, unit: 'kg' },
    ];
    const ws = lastWorkingSetsForExercise([makeSession('A', sets)], 'bench');
    expect(autoProgressionFor(ws, PRESCRIPTION_5_8, 'kg')).toMatchObject({
      to: 102.5,
    });
  });

  it('returns null on empty history', () => {
    expect(autoProgressionFor([], PRESCRIPTION_5_8, 'kg')).toBeNull();
    expect(autoProgressionFor(null, PRESCRIPTION_5_8, 'kg')).toBeNull();
  });
});
