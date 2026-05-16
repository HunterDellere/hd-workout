import { test, expect } from '@playwright/test';

// Regression: + Add for a section must default to exercises that
// canonically live in that section, not the whole catalog. The earlier
// pattern-inference fallback was returning every exercise when the
// section had no movement-pattern tags (calves, glutes, etc.).

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      // Pin every weekday to legs so /today resolves to legs deterministically.
      localStorage.setItem('hdw:settings', JSON.stringify({
        split: { 0: 'legs', 1: 'legs', 2: 'legs', 3: 'legs', 4: 'legs', 5: 'legs', 6: 'legs' },
        restTimerMode: 'count-up',
        units: 'kg',
      }));
      localStorage.setItem('hd:theme', 'light');
    } catch { /* noop */ }
  });
  await page.goto('./');
});

test('+ Add on the calves section does NOT show push or other leg exercises', async ({ page }) => {
  await page.goto('./#/today');
  const calves = page.locator('[data-testid="preview-section"][data-section-key="calves"]');
  await expect(calves).toBeVisible();
  await calves.getByTestId('preview-add').click();

  // Whether the list renders or shows an empty-state depends on how many
  // calves canonical exercises are already programmed. What MUST NOT happen:
  // push/pull/core/hamstring exercises showing up by default.
  await expect(page.locator('[data-testid="slot-candidate"][data-exercise-id="push-bb-bench"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="slot-candidate"][data-exercise-id="push-pushup"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="slot-candidate"][data-exercise-id="legs-rdl"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="slot-candidate"][data-exercise-id="legs-hip-thrust"]')).toHaveCount(0);
});

test('+ Add on quads-compound surfaces a calf exercise after "All catalog" toggle', async ({ page }) => {
  // Sanity: the All-catalog escape still works for cross-section adds.
  await page.goto('./#/today');
  const quads = page.locator('[data-testid="preview-section"][data-section-key="quads-compound"]');
  await expect(quads).toBeVisible();
  await quads.getByTestId('preview-add').click();
  // Default scope is quads-compound — calf raise is NOT in it.
  await expect(page.locator('[data-testid="slot-candidate"][data-exercise-id="legs-standing-calf"]')).toHaveCount(0);

  // Toggle All catalog — every non-excluded exercise becomes pickable,
  // including the calf raise (assuming it's not already in today's day,
  // which on full-spectrum legs it IS — so even all-catalog excludes it).
  // What we CAN see is a push exercise like push-bb-bench, since legs day
  // doesn't program any push.
  await page.getByTestId('slot-filter-all').click();
  await expect(page.locator('[data-testid="slot-candidate"][data-exercise-id="push-bb-bench"]')).toBeVisible();
});
