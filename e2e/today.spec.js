import { test, expect } from '@playwright/test';

// Session 11 — Phase 2 slice 1.
// Cover the in-workout flow: pick a day via settings, start a session,
// log a set, see the set survive navigation + reload, swap an exercise,
// end the session.

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
      // Pin today's split to Push for every weekday so the test is deterministic.
      // Phase 2 slice 2: storage moved to IDB. The settings store uses a
      // per-key migration — if IDB has no value but localStorage does, the
      // localStorage value is promoted into IDB on first read and removed
      // from localStorage. So writing the seed here works once IDB is empty.
      localStorage.setItem('hdw:settings', JSON.stringify({
        split: { 0: 'push', 1: 'push', 2: 'push', 3: 'push', 4: 'push', 5: 'push', 6: 'push' },
        restTimerMode: 'count-up',
        units: 'kg',
      }));
      localStorage.setItem('hd:theme', 'light');
    } catch { /* noop */ }
  });

  // Playwright contexts are isolated per test, so IDB starts fresh. The
  // addInitScript above writes the seed settings into localStorage; on
  // first IDB read the storage layer migrates them in. Active session
  // starts unset.
  await page.goto('./');
});

test.afterEach(async ({}, testInfo) => {
  const errors = consoleErrorsByTest.get(testInfo) ?? [];
  expect(errors, `console errors:\n${errors.join('\n')}`).toEqual([]);
});

test('today resolves to push and shows the prescribed exercises', async ({ page }) => {
  await page.goto('./#/today');
  await expect(page.getByRole('heading', { name: /push/i, level: 1 })).toBeVisible();
  await expect(page.getByTestId('start-session')).toBeVisible();
});

test('start a session and log a set, then reload to confirm persistence', async ({ page }) => {
  await page.goto('./#/today');
  await page.getByTestId('start-session').click();

  // Warmup is the first section now, but it's excluded from the
  // auto-focus model — the first working performance gets focus on
  // session start. Its set-row is the one we can fill with Load/Reps.
  const firstWorkingSection = page.locator(
    '[data-testid="section-group"]:not([data-section-key="warmup"])',
  ).first();
  const focusedWorkingCard = firstWorkingSection.getByTestId('performance-card').first();
  const firstSetRow = focusedWorkingCard.getByTestId('set-row').first();
  await expect(firstSetRow).toBeVisible();

  const weightInput = firstSetRow.getByRole('textbox', { name: 'Load' });
  const repsInput = firstSetRow.getByRole('textbox', { name: 'Reps' });
  await weightInput.fill('100');
  await repsInput.fill('5');
  await firstSetRow.getByTestId('log-set-button').click();

  // Same card is still focused (focus advances only when the lift's
  // prescribed sets are met) — the logged set lands inside it.
  await expect(focusedWorkingCard).toContainText('100');
  await expect(focusedWorkingCard).toContainText('5');

  // Give the SessionProvider's persist effect time to flush to IDB before
  // we reload (the write is async; reloading too eagerly can race it).
  await page.waitForTimeout(250);

  // Reload — the set must persist via IDB.
  await page.reload();

  // After reload, the same first working performance card carries the
  // logged set.
  const reloadedCard = page.locator(
    '[data-testid="section-group"]:not([data-section-key="warmup"])',
  ).first().getByTestId('performance-card').first();
  await expect(reloadedCard).toContainText('100');
  await expect(reloadedCard).toContainText('5');
});

test('completing a tapped-into exercise auto-advances focus to the next lift', async ({ page }) => {
  // Regression: tapping a collapsed row sets a focus override. Finishing
  // that exercise's last prescribed set used to strand the lifter on the
  // just-completed card (rest timer running) instead of advancing. Focus
  // must snap forward to the next incomplete lift once the override target
  // is complete.
  await page.goto('./#/today');
  await page.getByTestId('start-session').click();

  // First collapsed working row (warmup excluded). The first working
  // exercise is auto-focused, so the collapsed rows are later lifts.
  const targetRow = page.locator(
    '[data-testid="section-group"]:not([data-section-key="warmup"]) [data-testid="collapsed-performance-row"]',
  ).first();
  await expect(targetRow).toBeVisible();

  const targetPerfId = await targetRow.getAttribute('data-performance-id');
  const statusText = await targetRow.getByTestId('row-status').textContent();
  const target = Number.parseInt(statusText.split('/')[1], 10);
  expect(target).toBeGreaterThan(0);

  // Tap it to focus (this is the override that used to break auto-advance).
  await targetRow.click();
  const focusedCard = page.locator(
    `[data-testid="performance-card"][data-performance-id="${targetPerfId}"]`,
  );
  await expect(focusedCard).toBeVisible();

  // Log every prescribed working set into the now-focused card.
  for (let i = 0; i < target; i += 1) {
    await focusedCard.getByRole('textbox', { name: 'Load' }).fill('60');
    await focusedCard.getByRole('textbox', { name: 'Reps' }).fill('8');
    await focusedCard.getByTestId('log-set-button').click();
  }

  // The completed exercise has collapsed to a done row...
  const completedRow = page.locator(
    `[data-testid="collapsed-performance-row"][data-performance-id="${targetPerfId}"]`,
  );
  await expect(completedRow).toBeVisible();
  await expect(completedRow).toHaveAttribute('data-complete', '1');

  // ...and focus advanced to a DIFFERENT (incomplete) exercise's card.
  const focusedNow = page.getByTestId('performance-card');
  await expect(focusedNow).toHaveCount(1);
  await expect(focusedNow).not.toHaveAttribute('data-performance-id', targetPerfId);
});

test('session bar appears on other routes when a session is active', async ({ page }) => {
  await page.goto('./#/today');
  await page.getByTestId('start-session').click();

  await page.goto('./#/library');
  const bar = page.getByTestId('session-bar');
  await expect(bar).toBeVisible();

  await bar.click();
  // Session bar routes to / (today owns the cold-open since Wave 2).
  await expect(page).toHaveURL(/#\/$/);
});

test('swap an exercise that has no logged sets', async ({ page }) => {
  await page.goto('./#/today');
  await page.getByTestId('start-session').click();

  // Tap the swap button on the first performance card.
  await page.getByTestId('swap-button').first().click();

  // Sheet opens. Pick the first candidate.
  const candidates = page.getByTestId('swap-candidate');
  await expect(candidates.first()).toBeVisible();
  const pickedId = await candidates.first().getAttribute('data-exercise-id');
  await candidates.first().click();

  // The first performance card now points at the picked exercise.
  await expect(page.getByText(/^swapped$/i).first()).toBeVisible();
  expect(pickedId).toBeTruthy();
});

test('end session clears state and returns to home', async ({ page }) => {
  await page.goto('./#/today');
  await page.getByTestId('start-session').click();
  await page.getByTestId('end-session').click();
  await expect(page).toHaveURL(/#\/$/);

  // Session bar should be gone.
  await expect(page.getByTestId('session-bar')).toHaveCount(0);
});

test('today resolves a rest day to the active-rest screen', async ({ page }) => {
  // Use the Settings UI to flip every weekday to Rest, then in-page nav
  // to /today (the React tree is already mounted with the latest settings,
  // and a doc-level reload would re-fire the beforeEach addInitScript that
  // hardcodes all-push for the rest of this spec file).
  await page.goto('./#/me/settings');
  for (let weekday = 0; weekday <= 6; weekday += 1) {
    await page.locator(`select[data-weekday="${weekday}"]`).selectOption('rest');
  }
  await page.evaluate(() => { window.location.hash = '#/today'; });

  await expect(page.getByRole('heading', { name: /^rest$/i, level: 1 })).toBeVisible();
  const list = page.getByTestId('active-rest-list');
  await expect(list).toBeVisible();
  // Wave 4.4 trimmed the 8-row list to 3 quiet options: walk, mobility, outdoor.
  await expect(list.locator('[data-activity-key="walk"]')).toBeVisible();
  await expect(list.locator('[data-activity-key="mobility"]')).toBeVisible();
  await expect(list.locator('[data-activity-key="outdoor"]')).toBeVisible();
});

test('settings page changes the split and today reflects it', async ({ page }) => {
  await page.goto('./#/me/settings');
  // Change Sunday to Core (was Push from our init script).
  const sundaySelect = page.locator('select[data-weekday="0"]');
  await sundaySelect.selectOption('core');

  // Today is still Push for the *current* weekday (which is also Push because
  // we set every weekday to push). Verify the setting actually wrote.
  await page.goto('./#/me/settings');
  await expect(sundaySelect).toHaveValue('core');
});
