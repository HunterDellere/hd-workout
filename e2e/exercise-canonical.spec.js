import { test, expect } from '@playwright/test';

// Phase 1, slice 5 — exercise canonicalization.
// Legacy day-rooted URLs redirect to /library/exercises/:id; the canonical
// URL opens the exercise sheet directly; closing the sheet returns to /library.

const consoleErrorsByTest = new WeakMap();

test.beforeEach(async ({ page }, testInfo) => {
  const errors = [];
  consoleErrorsByTest.set(testInfo, errors);
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  await page.addInitScript(() => {
    localStorage.setItem('hd:theme', 'light');
  });
});

test.afterEach(async ({}, testInfo) => {
  const errors = consoleErrorsByTest.get(testInfo) ?? [];
  expect(errors, `console errors:\n${errors.join('\n')}`).toEqual([]);
});

test('legacy day-rooted exercise URL redirects to canonical route', async ({ page }) => {
  await page.goto('./#/push/exercise/push-bb-bench');
  await expect(page).toHaveURL(/#\/library\/exercises\/push-bb-bench$/);
  await expect(page.getByRole('heading', { name: /barbell bench press/i })).toBeVisible();
});

test('canonical exercise URL opens the sheet directly', async ({ page }) => {
  await page.goto('./#/library/exercises/push-bb-bench');
  await expect(page.getByRole('heading', { name: /barbell bench press/i })).toBeVisible();
});

test('closing the exercise sheet returns to /library', async ({ page }) => {
  await page.goto('./#/library/exercises/push-bb-bench');
  await expect(page.getByRole('heading', { name: /barbell bench press/i })).toBeVisible();
  // ExerciseSheet exposes a close button — try common accessible names first,
  // then fall back to pressing Escape, which the sheet should honor.
  const closeByLabel = page.getByRole('button', { name: /close/i });
  if (await closeByLabel.count()) {
    await closeByLabel.first().click();
  } else {
    await page.keyboard.press('Escape');
  }
  await expect(page).toHaveURL(/#\/library$/);
});

test('Day card tap navigates to canonical exercise route', async ({ page }) => {
  // Day page now shows the planner instead of the duplicate Reference
  // section. Tap a preview-row name link to navigate.
  await page.goto('./#/push');
  const firstLink = page.locator('[data-testid="preview-name-link"]').first();
  await firstLink.waitFor({ state: 'visible' });
  await firstLink.click();
  await expect(page).toHaveURL(/#\/library\/exercises\/[^/]+$/);
});
