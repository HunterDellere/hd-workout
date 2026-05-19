import { describe, it, expect } from 'vitest';
import {
  getDay,
  getSection,
  getExercise,
  findExerciseAnywhere,
  dayList,
} from './index';

// Phase 4 slice 1: prescription moved out of the catalog and into the
// program. These tests pin the hydrated shape so any future program
// edits don't silently regress the day-key consumers (Today, Day,
// Section, Library).

describe('hydrated days', () => {
  it('exposes all five days', () => {
    expect(dayList.map((d) => d.key).sort()).toEqual(
      ['core', 'legs', 'pull', 'push', 'recovery'],
    );
  });

  it('each day has at least one section with at least one exercise', () => {
    for (const day of dayList) {
      expect(day.sections.length).toBeGreaterThan(0);
      for (const section of day.sections) {
        expect(section.exercises.length).toBeGreaterThan(0);
      }
    }
  });

  it('every exercise carries catalog fields AND program-stamped prescription', () => {
    for (const day of dayList) {
      for (const section of day.sections) {
        for (const ex of section.exercises) {
          // Catalog fields
          expect(typeof ex.id).toBe('string');
          expect(typeof ex.name).toBe('string');
          // Program-stamped prescription
          expect(typeof ex.sets).toBe('string');
          expect(typeof ex.rest).toBe('string');
        }
      }
    }
  });
});

describe('getDay', () => {
  it('returns null for unknown keys', () => {
    expect(getDay('nope')).toBeNull();
  });
  it('returns hydrated push with prescription', () => {
    const push = getDay('push');
    expect(push.key).toBe('push');
    // Look up the bench by id rather than positional index — section
    // order is configurable via defaultSectionOrder on the catalog day.
    const bench = push.sections
      .flatMap((s) => s.exercises)
      .find((e) => e.id === 'push-bb-bench');
    expect(bench).toBeDefined();
    expect(bench.sets).toBe('4 × 5–8');
    expect(bench.rest).toBe('2:30–3:00');
  });

  it('honours defaultSectionOrder when set', () => {
    // Push has shoulders-rotator first per the catalog override — but
    // the synthetic 'warmup' section, when the program defines it,
    // always precedes the catalog-ordered sections. So shoulders-rotator
    // is the first CATALOG section after warmup.
    const push = getDay('push');
    const catalogSections = push.sections.filter((s) => s.key !== 'warmup');
    expect(catalogSections[0].key).toBe('shoulders-rotator');
  });

  it('surfaces synthetic warmup section first when the program defines warmup drills', () => {
    const push = getDay('push');
    expect(push.sections[0].key).toBe('warmup');
    // Warmup section has its title synthesized; no blurb.
    expect(push.sections[0].title).toBe('Warmup');
    expect(push.sections[0].blurb).toBeNull();
    expect(push.sections[0].exercises.length).toBeGreaterThan(0);
  });
});

describe('getSection', () => {
  it('returns the named section', () => {
    const sec = getSection('push', 'chest-horizontal');
    expect(sec).not.toBeNull();
    expect(sec.title).toMatch(/horizontal/i);
  });
  it('returns null for unknown section', () => {
    expect(getSection('push', 'nope')).toBeNull();
  });
});

describe('getExercise', () => {
  it('returns the exercise with full context', () => {
    const out = getExercise('push', 'push-bb-bench');
    expect(out.exercise.id).toBe('push-bb-bench');
    expect(out.section.key).toBe('chest-horizontal');
    expect(out.day.key).toBe('push');
  });
  it('returns null when the exercise is not in that day', () => {
    expect(getExercise('push', 'pull-deadlift')).toBeNull();
  });
});

describe('findExerciseAnywhere', () => {
  it('locates a known pull exercise without knowing the day', () => {
    const out = findExerciseAnywhere('pull-deadlift');
    expect(out.exercise.id).toBe('pull-deadlift');
    expect(out.day.key).toBe('pull');
  });
  it('returns null for unknown ids', () => {
    expect(findExerciseAnywhere('does-not-exist')).toBeNull();
  });
});
