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
  it('parses duration "3 × 30 sec"', () => {
    expect(parsePrescription('3 × 30 sec')).toMatchObject({
      kind: 'duration', sets: 3, setsTotal: 3, holdSec: 30, perSide: false,
    });
  });
  it('parses duration with per-side "2 × 1 min each side"', () => {
    expect(parsePrescription('2 × 1 min each side')).toMatchObject({
      kind: 'duration', sets: 2, holdSec: 60, perSide: true,
    });
  });
  it('parses single duration "5 min"', () => {
    expect(parsePrescription('5 min')).toMatchObject({
      kind: 'duration', sets: 1, holdSec: 300,
    });
  });
  it('parses minutes with decimal "1.5 min"', () => {
    expect(parsePrescription('1.5 min')).toMatchObject({
      kind: 'duration', holdSec: 90,
    });
  });
  it('parses rounds "3 rounds"', () => {
    expect(parsePrescription('3 rounds')).toMatchObject({
      kind: 'rounds', rounds: 3, setsTotal: 3,
    });
  });
  it('parses cycles "2 cycles"', () => {
    expect(parsePrescription('2 cycles')).toMatchObject({
      kind: 'rounds', rounds: 2,
    });
  });

  // Distance carries — "40m" must not be parsed as 40 minutes.
  it('parses distance "3 × 40m"', () => {
    expect(parsePrescription('3 × 40m')).toMatchObject({
      kind: 'distance', sets: 3, setsTotal: 3, distanceLow: 40, distanceHigh: 40, unit: 'm',
    });
  });
  it('parses distance range "4 × 40–60m"', () => {
    expect(parsePrescription('4 × 40–60m')).toMatchObject({
      kind: 'distance', sets: 4, distanceLow: 40, distanceHigh: 60,
    });
  });
  it('parses distance with suffix "3 × 40–60m (KBs)"', () => {
    expect(parsePrescription('3 × 40–60m (KBs)')).toMatchObject({
      kind: 'distance', sets: 3, distanceLow: 40, distanceHigh: 60,
    });
  });
  it('parses per-side distance "3 × 30–40m each"', () => {
    expect(parsePrescription('3 × 30–40m each')).toMatchObject({
      kind: 'distance', sets: 3, distanceLow: 30, distanceHigh: 40, perSide: true,
    });
  });

  // Open-effort — "max effort" / "AMRAP" route to open-ended duration timer.
  it('parses open effort "3 × max effort"', () => {
    expect(parsePrescription('3 × max effort')).toMatchObject({
      kind: 'duration', sets: 3, setsTotal: 3, holdSec: null,
    });
  });
  it('parses open effort "3 × AMRAP"', () => {
    expect(parsePrescription('3 × AMRAP')).toMatchObject({
      kind: 'duration', sets: 3, holdSec: null,
    });
  });

  // Time ranges — upper bound becomes the target so the lifter has the
  // full window before the timer rolls into overtime.
  it('parses duration range "3 × 30–60 sec"', () => {
    expect(parsePrescription('3 × 30–60 sec')).toMatchObject({
      kind: 'duration', sets: 3, holdSec: 60,
    });
  });
  it('parses bare duration range "1 × 30–60 min"', () => {
    expect(parsePrescription('1 × 30–60 min')).toMatchObject({
      kind: 'duration', sets: 1, holdSec: 3600,
    });
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
