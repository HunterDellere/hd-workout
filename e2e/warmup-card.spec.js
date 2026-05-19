import { test, expect } from '@playwright/test';

// E2E: WarmupCard lifecycle on /today.
//
// Surface contract:
//   1. Pre-start, the read-only preview shows the warmup drills above the
//      first PreviewSection.
//   2. After starting a session, the in-session WarmupCard renders above
//      the first PerformanceCard, with a "× Hide warmup" affordance.
//   3. Hiding it collapses to the single-line "Warmup · N drills · ~M min"
//      summary and persists in localStorage across reload.
//   4. Showing it again re-expands.
//   5. Logging the first working set auto-collapses the card.
//   6. Starting a *new* session (different sessionId) resets the state —
//      the card is expanded again, no stale storage.

const consoleErrorsByTest = new WeakMap();

test.beforeEach(async ({ page }, testInfo) => {
  const errors = [];
  consoleErrorsByTest.set(testInfo, errors);
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

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

test.afterEach(async ({}, testInfo) => {
  const errors = consoleErrorsByTest.get(testInfo) ?? [];
  expect(errors, `console errors:\n${errors.join('\n')}`).toEqual([]);
});

test('preview surface renders the read-only warmup card with drills', async ({ page }) => {
  await page.goto('./#/today');
  const card = page.getByTestId('warmup-card');
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute('data-state', 'expanded');
  // Read-only: no "× Hide warmup" button on the preview.
  await expect(card.getByTestId('warmup-card-hide')).toHaveCount(0);
  // Push day's warmup is the band pull-apart + Y-raise + thoracic rotation.
  const drills = page.getByTestId('warmup-drill');
  await expect(drills).toHaveCount(3);
});

test('in-session warmup card hides, persists across reload, and re-shows', async ({ page }) => {
  await page.goto('./#/today');
  await page.getByTestId('start-session').click();

  const card = page.getByTestId('warmup-card');
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute('data-state', 'expanded');

  // Hide it.
  await page.getByTestId('warmup-card-hide').click();
  await expect(card).toHaveAttribute('data-state', 'hidden');
  // Collapsed summary surfaces drill count + estimate.
  await expect(page.getByTestId('warmup-card-show')).toContainText(/Warmup.*\d drill.*min/i);

  // Reload — the card stays hidden (state lives in localStorage keyed
  // by sessionId).
  await page.waitForTimeout(150); // let the localStorage write settle
  await page.reload();
  await expect(page.getByTestId('warmup-card')).toHaveAttribute('data-state', 'hidden');

  // Re-expand.
  await page.getByTestId('warmup-card-show').click();
  await expect(page.getByTestId('warmup-card')).toHaveAttribute('data-state', 'expanded');
});

test('logging the first working set auto-collapses the warmup card', async ({ page }) => {
  await page.goto('./#/today');
  await page.getByTestId('start-session').click();

  await expect(page.getByTestId('warmup-card')).toHaveAttribute('data-state', 'expanded');

  // Log a set on the first PerformanceCard.
  const firstSetRow = page.getByTestId('set-row').first();
  await firstSetRow.getByRole('textbox', { name: 'Load' }).fill('100');
  await firstSetRow.getByRole('textbox', { name: 'Reps' }).fill('5');
  await firstSetRow.getByTestId('log-set-button').click();

  // The card auto-collapses on the next render after the set lands.
  await expect(page.getByTestId('warmup-card')).toHaveAttribute('data-state', 'hidden');
});
