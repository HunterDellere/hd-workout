import { describe, it, expect } from 'vitest';
import { parsePrescription, parseRest } from './prescription';

describe('parsePrescription', () => {
  it('parses straight N × R-R', () => {
    expect(parsePrescription('4 × 5–8')).toMatchObject({
      kind: 'straight', sets: 4, setsTotal: 4, repsLow: 5, repsHigh: 8, repsMid: 7,
    });
  });
  it('parses N-N × R-R using the higher set count', () => {
    expect(parsePrescription('3–4 × 8–12')).toMatchObject({
      kind: 'straight', sets: 4, setsLow: 3, repsLow: 8, repsHigh: 12, repsMid: 10,
    });
  });
  it('parses single rep value', () => {
    expect(parsePrescription('3 × 5')).toMatchObject({
      kind: 'straight', sets: 3, repsLow: 5, repsHigh: 5, repsMid: 5,
    });
  });
  it('parses pyramid 10/8/6/4', () => {
    const r = parsePrescription('10/8/6/4');
    expect(r.kind).toBe('pyramid');
    expect(r.setsPerRep).toEqual([10, 8, 6, 4]);
    expect(r.setsTotal).toBe(4);
    expect(r.repsLow).toBe(4);
    expect(r.repsHigh).toBe(10);
  });
  it('accepts ASCII x', () => {
    expect(parsePrescription('4 x 6')).toMatchObject({ kind: 'straight', sets: 4 });
  });
  it('falls back to free-text on garbage', () => {
    expect(parsePrescription('AMRAP until failure')).toMatchObject({ kind: 'free-text' });
  });
  it('handles null/empty', () => {
    expect(parsePrescription(null).kind).toBe('free-text');
    expect(parsePrescription('').kind).toBe('free-text');
  });
});

describe('parseRest', () => {
  it('parses single colon time', () => {
    expect(parseRest('2:30')).toMatchObject({ lowerBoundSec: 150, upperBoundSec: 150 });
  });
  it('parses colon range', () => {
    expect(parseRest('2:30–3:00')).toMatchObject({ lowerBoundSec: 150, upperBoundSec: 180 });
  });
  it('parses bare seconds with s suffix', () => {
    expect(parseRest('90s')).toMatchObject({ lowerBoundSec: 90, upperBoundSec: 90 });
  });
  it('parses bare seconds without suffix', () => {
    expect(parseRest('45')).toMatchObject({ lowerBoundSec: 45, upperBoundSec: 45 });
  });
  it('returns nulls on empty', () => {
    expect(parseRest('')).toMatchObject({ lowerBoundSec: null, upperBoundSec: null });
  });
});
