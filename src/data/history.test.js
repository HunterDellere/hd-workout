import { describe, it, expect } from 'vitest';
import { topSet, historyForExercise, lastTopSetForExercise } from './history';

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
