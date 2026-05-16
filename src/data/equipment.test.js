import { describe, it, expect } from 'vitest';
import { classifyOne, classifyExercise, isExerciseExcludedByEquipment } from './equipment';

describe('classifyOne', () => {
  it('matches barbell variants', () => {
    expect(classifyOne('Olympic barbell')).toEqual(new Set(['barbell']));
    expect(classifyOne('Deadlift bar')).toEqual(new Set(['barbell']));
  });

  it('matches dumbbells', () => {
    expect(classifyOne('Dumbbells')).toEqual(new Set(['dumbbell']));
  });

  it('matches cable + d-handle to cable', () => {
    expect(classifyOne('Dual cable column')).toEqual(new Set(['cable']));
    expect(classifyOne('D-handle')).toEqual(new Set(['cable']));
  });

  it('treats benches as their own category', () => {
    expect(classifyOne('Adjustable bench at 30–45°')).toEqual(new Set(['bench']));
    expect(classifyOne('Flat bench')).toEqual(new Set(['bench']));
  });

  it('routes pull-up bar and rings into pull-up-bar', () => {
    expect(classifyOne('Pull-up bar')).toEqual(new Set(['pull-up-bar']));
    expect(classifyOne('Rings')).toEqual(new Set(['pull-up-bar']));
  });

  it('returns empty for neutral strings', () => {
    expect(classifyOne('None')).toEqual(new Set());
    expect(classifyOne('Mat')).toEqual(new Set());
    expect(classifyOne('Open floor')).toEqual(new Set());
    expect(classifyOne('Walking surface')).toEqual(new Set());
    expect(classifyOne('Light plate (2.5–5 kg)')).toEqual(new Set());
  });

  it('handles a compound string', () => {
    expect(classifyOne('Power rack with safeties')).toEqual(new Set(['rack']));
  });
});

describe('classifyExercise', () => {
  it('unions categories across the equipment list', () => {
    const ex = {
      equipment: ['Flat bench', 'Olympic barbell', 'Power rack with safeties'],
    };
    const cats = classifyExercise(ex);
    expect(cats.has('barbell')).toBe(true);
    expect(cats.has('bench')).toBe(true);
    expect(cats.has('rack')).toBe(true);
  });

  it('returns empty for bodyweight exercises', () => {
    const ex = { equipment: ['Mat'] };
    expect(classifyExercise(ex).size).toBe(0);
  });

  it('handles missing equipment', () => {
    expect(classifyExercise({}).size).toBe(0);
    expect(classifyExercise(null).size).toBe(0);
  });
});

describe('isExerciseExcludedByEquipment', () => {
  const bench = {
    id: 'push-bb-bench',
    equipment: ['Flat bench', 'Olympic barbell', 'Power rack with safeties'],
  };
  const pushup = { id: 'push-up', equipment: ['Open floor'] };
  const dbBench = { id: 'push-db-bench', equipment: ['Adjustable bench', 'Dumbbells'] };

  it('hides barbell exercises when barbell is excluded', () => {
    expect(isExerciseExcludedByEquipment(bench, ['barbell'])).toBe(true);
  });

  it('hides dumbbell exercises when dumbbell is excluded', () => {
    expect(isExerciseExcludedByEquipment(dbBench, ['dumbbell'])).toBe(true);
  });

  it('does not hide bodyweight even when everything is excluded', () => {
    expect(isExerciseExcludedByEquipment(pushup, ['barbell', 'dumbbell', 'cable', 'machine', 'rack', 'bench'])).toBe(false);
  });

  it('does not hide anything when the exclusion list is empty', () => {
    expect(isExerciseExcludedByEquipment(bench, [])).toBe(false);
    expect(isExerciseExcludedByEquipment(bench, null)).toBe(false);
  });

  it('hides when only ONE of multiple categories is excluded', () => {
    // Excluding just "rack" still hides the bench press — the barbell
    // bench needs a rack to be safe.
    expect(isExerciseExcludedByEquipment(bench, ['rack'])).toBe(true);
  });
});
