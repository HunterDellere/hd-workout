import { describe, it, expect } from 'vitest';
import { applyOverlay, emptyOverlay } from './overlay';

const program = {
  key: 'test',
  days: {
    push: {
      'chest': [
        { id: 'bench', sets: '4 × 5–8', rest: '2:30' },
        { id: 'fly',   sets: '3 × 12',  rest: '1:30' },
      ],
    },
  },
};

describe('applyOverlay', () => {
  it('returns the program unchanged when overlay is empty', () => {
    const out = applyOverlay(program, emptyOverlay());
    expect(out.days.push.chest).toEqual(program.days.push.chest);
  });

  it('overrides sets and rest', () => {
    const overlay = {
      test: { push: { chest: { bench: { sets: '5 × 5', rest: '3:00' } } } },
    };
    const out = applyOverlay(program, overlay);
    expect(out.days.push.chest[0]).toEqual(
      { id: 'bench', sets: '5 × 5', rest: '3:00' },
    );
    // Unmodified entry untouched.
    expect(out.days.push.chest[1]).toEqual(
      { id: 'fly', sets: '3 × 12', rest: '1:30' },
    );
  });

  it('hides an exercise when hidden:true', () => {
    const overlay = {
      test: { push: { chest: { bench: { hidden: true } } } },
    };
    const out = applyOverlay(program, overlay);
    expect(out.days.push.chest).toHaveLength(1);
    expect(out.days.push.chest[0].id).toBe('fly');
  });

  it('leaves original program object untouched (immutability)', () => {
    const overlay = {
      test: { push: { chest: { bench: { sets: '5 × 5' } } } },
    };
    applyOverlay(program, overlay);
    expect(program.days.push.chest[0].sets).toBe('4 × 5–8');
  });

  it('returns the program when overlay has no key for this program', () => {
    const out = applyOverlay(program, { 'other-program': { push: {} } });
    expect(out).toBe(program);
  });
});
