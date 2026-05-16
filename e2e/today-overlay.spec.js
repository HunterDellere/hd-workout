import { test, expect } from '@playwright/test';

// Phase 4 slice 2-3: pre-start day editing persists via the overlay.
// Remove an exercise on /today before starting; reload; it's still gone.
// Add an exercise via the SlotPicker; reload; it's still there.

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

test('preview Remove hides an exercise and survives reload', async ({ page }) => {
  await page.goto('./#/today');
  const benchRow = page.locator('[data-testid="preview-row"][data-exercise-id="push-bb-bench"]');
  await expect(benchRow).toBeVisible();
  await benchRow.getByTestId('preview-remove').click();
  await expect(benchRow).toHaveCount(0);
  // IDB writes are async-fire-and-forget; give the overlay save a tick to
  // commit before reloading the page, otherwise the seed gets dropped.
  await page.waitForTimeout(150);
  await page.reload();
  await expect(page.locator('[data-testid="preview-row"][data-exercise-id="push-bb-bench"]')).toHaveCount(0);
  // Reset day brings it back.
  await page.getByTestId('reset-day').click();
  await expect(page.locator('[data-testid="preview-row"][data-exercise-id="push-bb-bench"]')).toBeVisible();
});

test('preview + Add appends an exercise that survives reload', async ({ page }) => {
  await page.goto('./#/today');
  // First section's + Add. The default section-scoped picker may be empty
  // when every canonical exercise of that section is already programmed,
  // so toggle "All catalog" to widen the candidate pool.
  const firstAdd = page.getByTestId('preview-add').first();
  await firstAdd.click();
  await page.getByTestId('slot-filter-all').click();
  await expect(page.getByTestId('slot-picker-list')).toBeVisible();
  const firstCandidate = page.getByTestId('slot-candidate').first();
  const newId = await firstCandidate.getAttribute('data-exercise-id');
  await firstCandidate.click();
  // Now there should be a row with `data-exercise-id=newId` carrying ADDED label.
  await expect(page.locator(`[data-testid="preview-row"][data-exercise-id="${newId}"]`)).toBeVisible();
  await page.waitForTimeout(150);
  await page.reload();
  await expect(page.locator(`[data-testid="preview-row"][data-exercise-id="${newId}"]`)).toBeVisible();
});
