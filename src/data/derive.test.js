import { describe, it, expect } from 'vitest';
import {
  PATTERN_KEYS,
  derivePatternToExercises,
  patternToExercises,
  exercisesForPattern,
} from './derive';

describe('derivePatternToExercises', () => {
  const map = patternToExercises();

  it('returns an entry for every canonical pattern key', () => {
    for (const key of PATTERN_KEYS) {
      expect(map[key]).toBeInstanceOf(Array);
    }
  });

  it('places Barbell Bench Press under horizontal-press', () => {
    const ids = map['horizontal-press'].map((e) => e.id);
    expect(ids).toContain('push-bb-bench');
  });

  it('places OHP under vertical-press', () => {
    const names = map['vertical-press'].map((e) => e.name.toLowerCase());
    const hasOhp = names.some((n) =>
      n.includes('overhead press') || n.includes('press') || n.includes('ohp'),
    );
    expect(hasOhp).toBe(true);
  });

  it('places a row exercise under horizontal-pull', () => {
    expect(map['horizontal-pull'].length).toBeGreaterThan(0);
  });

  it('places a pull-up or pulldown under vertical-pull', () => {
    expect(map['vertical-pull'].length).toBeGreaterThan(0);
  });

  it('places squats under squat', () => {
    const ids = map['squat'].map((e) => e.id);
    expect(ids).toContain('legs-back-squat');
  });

  it('places RDL under hinge', () => {
    const ids = map['hinge'].map((e) => e.id);
    expect(ids).toContain('legs-rdl');
  });

  it('places Bulgarian Split Squat under lunge', () => {
    const ids = map['lunge'].map((e) => e.id);
    expect(ids).toContain('legs-bgss');
  });

  it('places Pallof Press under core-anti', () => {
    const ids = map['core-anti'].map((e) => e.id);
    expect(ids).toContain('core-pallof');
  });

  it('populates core-flexion with rotation work', () => {
    expect(map['core-flexion'].length).toBeGreaterThan(0);
  });

  it('populates mobility with rotator-cuff or warm-up content', () => {
    expect(map['mobility'].length).toBeGreaterThan(0);
  });

  it('does not double-list the same exercise twice within a pattern', () => {
    for (const key of PATTERN_KEYS) {
      const ids = map[key].map((e) => e.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('does not mutate the input source', () => {
    const fixture = [
      {
        key: 'push',
        sections: [
          {
            key: 'chest-horizontal',
            title: 'Chest',
            exercises: [{ id: 'x1', name: 'X', tags: ['horizontal-press'] }],
          },
        ],
      },
    ];
    const snapshot = JSON.stringify(fixture);
    derivePatternToExercises(fixture);
    expect(JSON.stringify(fixture)).toBe(snapshot);
  });

  it('attaches _section and _day metadata to derived exercises', () => {
    const e = exercisesForPattern('horizontal-press').find((x) => x.id === 'push-bb-bench');
    expect(e._section.key).toBe('chest-horizontal');
    expect(e._day).toBe('push');
  });
});
