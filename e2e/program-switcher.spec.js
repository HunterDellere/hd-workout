import { test, expect } from '@playwright/test';

// Phase 4 slice 5: program switcher in /me/settings. Switching to PPL
// changes which exercises render on /today (PPL is leaner than Full
// Spectrum) and unlocks the "apply suggested split" affordance.

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      // Pin every weekday to push so /today is deterministic, regardless
      // of which program is active (both fullSpectrum and ppl-6 define a
      // push day).
      localStorage.setItem('hdw:settings', JSON.stringify({
        split: { 0: 'push', 1: 'push', 2: 'push', 3: 'push', 4: 'push', 5: 'push', 6: 'push' },
        restTimerMode: 'count-up',
        units: 'kg',
      }));
      localStorage.setItem('hd:theme', 'light');
    } catch { /* noop */ }
  });
  await page.goto('./');
});

test('switching to PPL changes the prescribed exercises on /today', async ({ page }) => {
  // PPL programs a dumbbell bench (push-db-bench) on push day to fill the
  // extra horizontal-press volume that twice-weekly frequency calls for.
  // Full Spectrum doesn't — it leans on barbell bench + fly + incline.
  await page.goto('./#/today');
  await expect(page.locator('[data-testid="preview-row"][data-exercise-id="push-db-bench"]')).toHaveCount(0);

  // Switch to PPL.
  await page.goto('./#/me/settings');
  await expect(page.getByTestId('program-switcher')).toBeVisible();
  await page.locator('[data-testid="program-switcher"] [data-radio="ppl-6"]').click();
  await page.waitForTimeout(150);

  // Back to /today — DB bench should now be programmed.
  await page.goto('./#/today');
  await expect(page.locator('[data-testid="preview-row"][data-exercise-id="push-db-bench"]')).toBeVisible();
  // Barbell bench is in both — sanity check the page rendered the right day.
  await expect(page.locator('[data-testid="preview-row"][data-exercise-id="push-bb-bench"]')).toBeVisible();
});

test('apply-program-split affordance appears when split diverges and disappears after applying', async ({ page }) => {
  await page.goto('./#/me/settings');
  // Switch to PPL — our seeded split is all-push, which diverges from PPL's
  // defaultSplit, so the affordance must appear.
  await page.locator('[data-testid="program-switcher"] [data-radio="ppl-6"]').click();
  await page.waitForTimeout(50);
  const apply = page.getByTestId('apply-program-split');
  await expect(apply).toBeVisible();
  await apply.click();
  await page.waitForTimeout(50);
  // After apply, split matches → affordance is gone.
  await expect(page.getByTestId('apply-program-split')).toHaveCount(0);
});
