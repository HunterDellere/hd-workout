import { test, expect } from '@playwright/test';

// Phase 4 slice 7: excludedEquipment filter — chips in /me/settings let
// the user mark equipment they don't have; SubstituteSheet + SlotPicker
// hide candidates whose equipment is excluded.

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

test('excluding barbell hides barbell exercises from SlotPicker', async ({ page }) => {
  // Confirm bench (barbell-required) is reachable via + Add before exclusion.
  await page.goto('./#/today');
  // Remove the bench from preview to free its id for the picker exclusion test.
  await page.locator('[data-testid="preview-row"][data-exercise-id="push-bb-bench"] [data-testid="preview-remove"]').click();
  await page.waitForTimeout(150);
  // Open + Add for the first section — should be a horizontal-press section.
  await page.getByTestId('preview-add').first().click();
  await expect(page.getByTestId('slot-picker-list')).toBeVisible();
  // Toggle "All catalog" to ensure bench (barbell) is showable.
  await page.getByTestId('slot-filter-all').click().catch(() => {});
  // Bench should be a candidate at this point.
  await expect(page.locator('[data-testid="slot-candidate"][data-exercise-id="push-bb-bench"]')).toBeVisible();

  // Close picker, go exclude barbell, return.
  await page.keyboard.press('Escape');
  await page.goto('./#/me/settings');
  await page.getByTestId('exclude-barbell').click();
  await page.waitForTimeout(150);

  await page.goto('./#/today');
  await page.getByTestId('preview-add').first().click();
  await expect(page.getByTestId('slot-picker-list')).toBeVisible();
  await page.getByTestId('slot-filter-all').click().catch(() => {});
  // Bench must NOT appear now.
  await expect(page.locator('[data-testid="slot-candidate"][data-exercise-id="push-bb-bench"]')).toHaveCount(0);
});

test('exclude toggle keeps state across reload', async ({ page }) => {
  await page.goto('./#/me/settings');
  await page.getByTestId('exclude-cable').click();
  await expect(page.getByTestId('exclude-cable')).toHaveAttribute('data-active', '1');
  await page.waitForTimeout(150);
  await page.reload();
  await expect(page.getByTestId('exclude-cable')).toHaveAttribute('data-active', '1');
  // Toggle off; persists too.
  await page.getByTestId('exclude-cable').click();
  await expect(page.getByTestId('exclude-cable')).toHaveAttribute('data-active', '0');
});
