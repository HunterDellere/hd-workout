import { describe, it, expect } from 'vitest';
import { validateProgram } from './validate';

const catalog = {
  push: {
    sections: [
      { key: 'chest', exercises: [{ id: 'bench' }, { id: 'fly' }] },
    ],
  },
};

describe('validateProgram', () => {
  it('returns [] for a clean program', () => {
    const program = {
      key: 'p', days: { push: { chest: [{ id: 'bench' }] } },
    };
    expect(validateProgram(program, catalog)).toEqual([]);
  });

  it('flags a missing day', () => {
    const program = { key: 'p', days: { legs: { chest: [{ id: 'bench' }] } } };
    const issues = validateProgram(program, catalog);
    expect(issues).toHaveLength(1);
    expect(issues[0].kind).toBe('missing-day');
  });

  it('flags a missing section', () => {
    const program = { key: 'p', days: { push: { abs: [{ id: 'bench' }] } } };
    const issues = validateProgram(program, catalog);
    expect(issues).toHaveLength(1);
    expect(issues[0].kind).toBe('missing-section');
  });

  it('flags a missing exercise id', () => {
    const program = { key: 'p', days: { push: { chest: [{ id: 'nope' }] } } };
    const issues = validateProgram(program, catalog);
    expect(issues).toHaveLength(1);
    expect(issues[0].kind).toBe('missing-exercise');
  });

  it('flags a malformed entry without an id', () => {
    const program = { key: 'p', days: { push: { chest: [{ sets: '5 × 5' }] } } };
    const issues = validateProgram(program, catalog);
    expect(issues).toHaveLength(1);
    expect(issues[0].kind).toBe('malformed-entry');
  });
});
