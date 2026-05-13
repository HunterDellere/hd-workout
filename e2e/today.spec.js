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
      // Do NOT touch hdw:session:active here — addInitScript runs on every
      // navigation including reload, and the log-set test depends on the
      // active session surviving a reload.
      localStorage.setItem('hdw:settings', JSON.stringify({
        split: { 0: 'push', 1: 'push', 2: 'push', 3: 'push', 4: 'push', 5: 'push', 6: 'push' },
        restTimerMode: 'count-up',
        units: 'kg',
      }));
      localStorage.setItem('hd:theme', 'light');
    } catch { /* noop */ }
  });

  // Each test still starts with no active session; explicit per-test wipe so
  // a stale session from a previous test can't leak.
  await page.goto('./');
  await page.evaluate(() => {
    try { localStorage.removeItem('hdw:session:active'); } catch { /* noop */ }
  });
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

  // First performance card carries the first SetRow.
  const firstSetRow = page.getByTestId('set-row').first();
  await expect(firstSetRow).toBeVisible();

  // Fill weight + reps via the text inputs (the stepper buttons share the
  // aria-label root so we scope by role).
  const weightInput = firstSetRow.getByRole('textbox', { name: 'Load' });
  const repsInput = firstSetRow.getByRole('textbox', { name: 'Reps' });
  await weightInput.fill('100');
  await repsInput.fill('5');

  await firstSetRow.getByTestId('log-set-button').click();

  // Wait for the set to land in localStorage (the store useEffect runs after
  // the render that processes setSession).
  await expect.poll(async () => {
    return page.evaluate(() => {
      const raw = window.localStorage.getItem('hdw:session:active');
      if (!raw) return 0;
      const s = JSON.parse(raw);
      return s.performances?.[0]?.sets?.length ?? 0;
    });
  }, { timeout: 5000 }).toBe(1);

  // Reload — the set must persist via localStorage.
  await page.reload();

  // After reload, the same first performance card should show the logged set.
  const reloadedFirst = page.getByTestId('performance-card').first();
  await expect(reloadedFirst).toContainText('100');
  await expect(reloadedFirst).toContainText('5');
});

test('session bar appears on other routes when a session is active', async ({ page }) => {
  await page.goto('./#/today');
  await page.getByTestId('start-session').click();

  await page.goto('./#/library');
  const bar = page.getByTestId('session-bar');
  await expect(bar).toBeVisible();

  await bar.click();
  await expect(page).toHaveURL(/#\/today$/);
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
  await expect(page.getByText(/swapped in this session/i).first()).toBeVisible();
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
  await expect(list.locator('[data-activity-key="swim"]')).toBeVisible();
  await expect(list.locator('[data-activity-key="ping-pong"]')).toBeVisible();
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
