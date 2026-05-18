import { test, expect } from '@playwright/test';

// Phase 4 slice 4: /history surface — list view of completed sessions
// plus inline editor for per-set edits and full-session delete.

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

test('history is empty until a session is logged', async ({ page }) => {
  await page.goto('./#/history');
  // Anchor on the testid, not the copy — the empty-state line rotates
  // daily through HISTORY_EMPTY voices.
  await expect(page.getByTestId('history-empty')).toBeVisible();
});

test('an active session with logged sets surfaces in history with the in-progress badge', async ({ page }) => {
  // Start session and log one set on /today.
  await page.goto('./#/today');
  await page.getByTestId('start-session').click();
  const firstSetRow = page.getByTestId('set-row').first();
  await firstSetRow.getByRole('textbox', { name: 'Load' }).fill('100');
  await firstSetRow.getByRole('textbox', { name: 'Reps' }).fill('5');
  await firstSetRow.getByTestId('log-set-button').click();
  await page.waitForTimeout(250);

  // Navigate to /history — the active session is pinned at the top with the badge.
  await page.goto('./#/history');
  const rows = page.getByTestId('history-row');
  await expect(rows).toHaveCount(1);
  await expect(page.getByText('In progress')).toBeVisible();

  // Open the detail — the logged set is visible.
  await rows.first().click();
  // Each set renders as a clean read-mode summary; tap to expand into edit
  // inputs so the form fields don't drown out the actual logged values.
  await expect(page.getByTestId('edit-set-toggle').first()).toBeVisible();
  await page.getByTestId('edit-set-toggle').first().click();
  await expect(page.getByTestId('edit-set-weight').first()).toHaveValue('100');
  await expect(page.getByTestId('edit-set-reps').first()).toHaveValue('5');

  // Active session cannot be deleted from history.
  await expect(page.getByTestId('history-delete')).toHaveCount(0);
});
