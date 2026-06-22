import { describe, it, expect } from 'vitest';
import { platesPerSide, formatPlateList, defaultBarFor } from './plates';

describe('plates', () => {
  it('returns null at or under the bar', () => {
    expect(platesPerSide(20, { barWeight: 20 })).toBeNull();
    expect(platesPerSide(15, { barWeight: 20 })).toBeNull();
    expect(platesPerSide(0, {})).toBeNull();
  });

  it('breaks 100kg with default kg plates → 40 per side as 25+15', () => {
    const r = platesPerSide(100, { barWeight: 20 });
    expect(r.perSide).toEqual([25, 15]);
    expect(r.residual).toBe(0);
  });

  it('breaks 102.5kg with default kg plates → 41.25 per side ends with 1.25', () => {
    const r = platesPerSide(102.5, { barWeight: 20 });
    expect(r.perSide).toEqual([25, 15, 1.25]);
    expect(r.residual).toBe(0);
  });

  it('reports residual when inventory cannot satisfy the load', () => {
    // Only 25s and 5s available → 100kg → 40/side = 25 + 5 + 5 + 5 = 40
    const r = platesPerSide(100, { barWeight: 20, plates: [25, 5] });
    expect(r.perSide).toEqual([25, 5, 5, 5]);
    expect(r.residual).toBe(0);
  });

  it('reports residual for impossible totals', () => {
    // 22kg, bar 20, only 25 plate available → impossible
    const r = platesPerSide(22, { barWeight: 20, plates: [25] });
    expect(r.perSide).toEqual([]);
    expect(r.residual).toBe(1);
  });

  it('formatPlateList renders plus-separated', () => {
    expect(formatPlateList([25, 15, 1.25])).toBe('25+15+1.25');
    expect(formatPlateList([])).toBe('—');
    expect(formatPlateList(null)).toBe('—');
  });

  it('defaultBarFor picks the right unit', () => {
    expect(defaultBarFor('kg')).toBe(20);
    expect(defaultBarFor('lb')).toBe(45);
  });

  it('uses lb defaults for an lb user with no configured inventory', () => {
    // 225 lb, bar 45 → 90/side → 45 + 45 with lb plates, not kg denominations.
    const r = platesPerSide(225, { barWeight: 45, unit: 'lb' });
    expect(r.perSide).toEqual([45, 45]);
    expect(r.residual).toBe(0);
  });

  it('explicit kg params are unaffected by the unit option', () => {
    const r = platesPerSide(100, { barWeight: 20, plates: [25, 20, 15, 10, 5, 2.5, 1.25] });
    expect(r.residual).toBe(0);
  });
});
