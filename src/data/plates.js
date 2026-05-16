// Plate calculator — pure utilities for breaking a barbell load into a
// per-side plate list. Unit-aware; respects the user's plate inventory.
//
// Algorithm: greedy descending. For each available plate weight, take as
// many as fit per side. If the target can't be reached exactly (no
// quarter-pound plates, only the user's inventory), we still return the
// best-fit list and report the residual so the UI can flag it.

const DEFAULT_PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25];
const DEFAULT_PLATES_LB = [45, 35, 25, 10, 5, 2.5];

export const DEFAULT_BAR_KG = 20;
export const DEFAULT_BAR_LB = 45;

export function defaultPlatesFor(unit) {
  return unit === 'lb' ? DEFAULT_PLATES_LB : DEFAULT_PLATES_KG;
}

export function defaultBarFor(unit) {
  return unit === 'lb' ? DEFAULT_BAR_LB : DEFAULT_BAR_KG;
}

/**
 * Given a barbell load and a plate inventory, return the per-side plate
 * breakdown. Returns null when the load is at or below the bar (no plates
 * to load).
 *
 * @param {number} totalWeight  total bar + plates weight (per the user's input)
 * @param {object} opts
 * @param {number} opts.barWeight  bar weight (e.g. 20kg / 45lb)
 * @param {number[]} opts.plates   plate weights available, descending
 * @returns {{ perSide: number[], residual: number } | null}
 */
export function platesPerSide(totalWeight, { barWeight, plates } = {}) {
  if (!Number.isFinite(totalWeight) || totalWeight <= 0) return null;
  const bar = Number.isFinite(barWeight) ? barWeight : DEFAULT_BAR_KG;
  if (totalWeight <= bar) return null;
  const inventory = (plates && plates.length > 0)
    ? [...plates].sort((a, b) => b - a)
    : DEFAULT_PLATES_KG;

  let perSide = (totalWeight - bar) / 2;
  if (perSide <= 0) return null;

  const out = [];
  for (const p of inventory) {
    while (perSide + 1e-9 >= p) {
      out.push(p);
      perSide -= p;
    }
  }
  // Residual rounded to 2 decimals — anything smaller than the smallest
  // plate is unloadable on this inventory.
  const residual = Math.round(perSide * 100) / 100;
  return { perSide: out, residual };
}

/**
 * Format a plate list as a short display string: "20+10+5".
 * Returns "—" for empty lists.
 */
export function formatPlateList(perSide) {
  if (!perSide || perSide.length === 0) return '—';
  return perSide
    .map((p) => (Number.isInteger(p) ? String(p) : p.toString()))
    .join('+');
}
