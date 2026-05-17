import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('hdw:settings', JSON.stringify({
      split: { 0: 'push', 1: 'push', 2: 'push', 3: 'push', 4: 'push', 5: 'push', 6: 'push' },
      restTimerMode: 'count-up',
      units: 'kg',
    }));
    localStorage.setItem('hd:theme', 'light');
  });
  await page.setViewportSize({ width: 1280, height: 1000 });
});

test('library anchor rail scrolls, does not break routing', async ({ page }) => {
  await page.goto('./#/library');
  await page.waitForTimeout(400);
  // Click the Days anchor in the right-side rail.
  await page.getByRole('button', { name: /^days/i }).first().click();
  await page.waitForTimeout(400);
  // The route should still be /library — NOT "Unknown day".
  await expect(page).toHaveURL(/#\/library$/);
  await expect(page.locator('text=Unknown day')).toHaveCount(0);
  // The Days section should be visible.
  await expect(page.locator('h2#library-days')).toBeVisible();
});

test('library movements anchor scrolls too', async ({ page }) => {
  await page.goto('./#/library');
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: /^movements/i }).first().click();
  await page.waitForTimeout(400);
  await expect(page).toHaveURL(/#\/library$/);
  await expect(page.locator('h2#library-movements')).toBeVisible();
});
