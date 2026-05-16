import { test, expect } from '@playwright/test';

// Phase 4 slice 4: location presets (gym/home) — each preset has its own
// overlay; switching the chip swaps which set of pre-start edits applies.

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
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

test('location chips switch overlays so edits are scoped per preset', async ({ page }) => {
  await page.goto('./#/today');
  // Default is gym. Remove bench in the gym preset.
  const benchSel = '[data-testid="preview-row"][data-exercise-id="push-bb-bench"]';
  await expect(page.locator(benchSel)).toBeVisible();
  await page.locator(benchSel).getByTestId('preview-remove').click();
  await expect(page.locator(benchSel)).toHaveCount(0);
  await page.waitForTimeout(150);

  // Switch to home. Bench should be back (different overlay slot).
  await page.getByTestId('location-home').click();
  await expect(page.locator(benchSel)).toBeVisible();

  // Switch back to gym. Bench is still gone (per-preset memory).
  await page.getByTestId('location-gym').click();
  await expect(page.locator(benchSel)).toHaveCount(0);

  // Reload — gym overlay persists.
  await page.waitForTimeout(150);
  await page.reload();
  await expect(page.locator(benchSel)).toHaveCount(0);
});
