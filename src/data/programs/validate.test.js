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

  describe('warmup synthetic section', () => {
    // `warmup` is a program-level block (movement-prep drills) that doesn't
    // exist in any catalog day. The validator must accept it as a special
    // key — still checking exercise ids — while skipping the per-day
    // section-key check that would otherwise flag it as missing-section.
    it('accepts a warmup section even though no catalog day defines it', () => {
      const program = {
        key: 'p',
        days: { push: { warmup: [{ id: 'bench' }], chest: [{ id: 'fly' }] } },
      };
      expect(validateProgram(program, catalog)).toEqual([]);
    });

    it('still flags unknown exercise ids inside a warmup section', () => {
      const program = {
        key: 'p',
        days: { push: { warmup: [{ id: 'no-such-id' }] } },
      };
      const issues = validateProgram(program, catalog);
      expect(issues).toHaveLength(1);
      expect(issues[0].kind).toBe('missing-exercise');
      expect(issues[0].sectionKey).toBe('warmup');
    });

    it('still flags malformed entries inside a warmup section', () => {
      const program = {
        key: 'p',
        days: { push: { warmup: [{ sets: '2 × 10' }] } },
      };
      const issues = validateProgram(program, catalog);
      expect(issues).toHaveLength(1);
      expect(issues[0].kind).toBe('malformed-entry');
      expect(issues[0].sectionKey).toBe('warmup');
    });
  });
});
