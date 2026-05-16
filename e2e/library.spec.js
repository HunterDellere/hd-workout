import { test, expect } from '@playwright/test';

const PATTERNS = [
  'horizontal-press',
  'vertical-press',
  'horizontal-pull',
  'vertical-pull',
  'squat',
  'hinge',
  'lunge',
  'core-anti',
  'core-flexion',
  'mobility',
  'corrective',
  'healthspan',
];

const consoleErrorsByTest = new WeakMap();

test.beforeEach(async ({ page }, testInfo) => {
  const errors = [];
  consoleErrorsByTest.set(testInfo, errors);
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  // Pin theme for snapshot determinism.
  await page.addInitScript(() => {
    localStorage.setItem('hd:theme', 'light');
  });
});

test.afterEach(async ({}, testInfo) => {
  const errors = consoleErrorsByTest.get(testInfo) ?? [];
  expect(errors, `console errors:\n${errors.join('\n')}`).toEqual([]);
});

test('library lists all twelve movement patterns', async ({ page }) => {
  await page.goto('./#/library');
  const list = page.getByTestId('library-patterns');
  await expect(list).toBeVisible();
  for (const key of PATTERNS) {
    await expect(list.locator(`[data-pattern-key="${key}"]`)).toBeVisible();
  }
  await expect(list.locator('[data-pattern-key]')).toHaveCount(PATTERNS.length);
});

test('tapping a pattern navigates to its detail route', async ({ page }) => {
  await page.goto('./#/library');
  await page.locator('[data-pattern-key="horizontal-press"]').click();
  await expect(page).toHaveURL(/#\/library\/movements\/horizontal-press$/);
  const detail = page.getByTestId('pattern-detail');
  await expect(detail).toBeVisible();
  await expect(detail).toHaveAttribute('data-pattern', 'horizontal-press');
});

test('horizontal-press lists at least one exercise including BB bench', async ({ page }) => {
  await page.goto('./#/library/movements/horizontal-press');
  const list = page.getByTestId('pattern-exercises');
  await expect(list).toBeVisible();
  const rows = list.locator('[data-exercise-id]');
  expect(await rows.count()).toBeGreaterThan(0);
  await expect(list.locator('[data-exercise-id="push-bb-bench"]')).toBeVisible();
});

test('tapping an exercise opens the canonical exercise route', async ({ page }) => {
  await page.goto('./#/library/movements/horizontal-press');
  await page.locator('[data-exercise-id="push-bb-bench"]').click();
  await expect(page).toHaveURL(/#\/library\/exercises\/push-bb-bench$/);
  // ExerciseSheet renders the exercise name as a heading.
  await expect(page.getByRole('heading', { name: /barbell bench press/i })).toBeVisible();
});

test('LibraryPattern visual — horizontal-press', async ({ page }) => {
  await page.goto('./#/library/movements/horizontal-press');
  const detail = page.getByTestId('pattern-detail');
  await detail.waitFor({ state: 'visible' });
  await page.waitForTimeout(250);
  await expect(detail).toHaveScreenshot('library-pattern-horizontal-press.png', {
    maxDiffPixelRatio: 0.02,
    animations: 'disabled',
  });
});
