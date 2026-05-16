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

test('switching to Home shows the home program (push-up, KB press), not the gym build', async ({ page }) => {
  await page.goto('./#/today');
  // Gym default: barbell bench is in the preview.
  await expect(page.locator('[data-testid="preview-row"][data-exercise-id="push-bb-bench"]')).toBeVisible();
  // Push-up is NOT (it's home-only programming).
  await expect(page.locator('[data-testid="preview-row"][data-exercise-id="push-pushup"]')).toHaveCount(0);

  // Switch to home. Push-up appears; bench disappears.
  await page.getByTestId('location-home').click();
  await page.waitForTimeout(150);
  await expect(page.locator('[data-testid="preview-row"][data-exercise-id="push-pushup"]')).toBeVisible();
  await expect(page.locator('[data-testid="preview-row"][data-exercise-id="push-bb-bench"]')).toHaveCount(0);

  // Back to gym — symmetric.
  await page.getByTestId('location-gym').click();
  await page.waitForTimeout(150);
  await expect(page.locator('[data-testid="preview-row"][data-exercise-id="push-bb-bench"]')).toBeVisible();
});

test('per-preset overlay memory: an edit on gym does not bleed into home', async ({ page }) => {
  await page.goto('./#/today');
  // Remove bench on gym. Stays removed across location toggles and reloads.
  const benchSel = '[data-testid="preview-row"][data-exercise-id="push-bb-bench"]';
  await page.locator(benchSel).getByTestId('preview-remove').click();
  await expect(page.locator(benchSel)).toHaveCount(0);
  await page.waitForTimeout(150);

  // Home shows its own program (no bench in either case).
  await page.getByTestId('location-home').click();
  await page.waitForTimeout(150);
  await expect(page.locator('[data-testid="preview-row"][data-exercise-id="push-pushup"]')).toBeVisible();

  // Back to gym — the removal persists, not undone by the trip.
  await page.getByTestId('location-gym').click();
  await page.waitForTimeout(150);
  await expect(page.locator(benchSel)).toHaveCount(0);

  // Reload — gym overlay persists.
  await page.reload();
  await expect(page.locator(benchSel)).toHaveCount(0);
});
