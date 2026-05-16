import { test, expect } from '@playwright/test';

// Phase 5: mid-session "+ Add group" now opens an inline bottom sheet
// with a text input and suggestion chips, instead of a window.prompt.

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

test('+ Add group opens an inline sheet (no window.prompt)', async ({ page }) => {
  await page.goto('./#/today');
  await page.getByTestId('start-session').click();
  await page.waitForTimeout(150);

  // The mid-session affordance lives in the active-session view.
  await page.getByTestId('add-group').click();
  await expect(page.getByTestId('add-group-input')).toBeVisible();

  // Pick a suggestion chip.
  await page.getByTestId('add-group-suggest-cardio').click();
  await expect(page.getByTestId('add-group-input')).toHaveValue('Cardio');

  // Continue → SlotPicker opens for the first exercise of the new section.
  await page.getByTestId('add-group-submit').click();
  await expect(page.getByTestId('slot-picker-list')).toBeVisible();
});
