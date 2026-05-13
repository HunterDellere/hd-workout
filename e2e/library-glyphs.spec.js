import { test, expect } from '@playwright/test';

// Session 09 — the Library index renders a bespoke 1.5px-stroke movement
// glyph in every row. If a glyph is missing for any pattern, this fails loud.

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
];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('hd:theme', 'light');
  });
});

test('every library row renders its pattern glyph', async ({ page }) => {
  await page.goto('./#/library');
  await page.getByTestId('library-group-by-movement').click();
  for (const key of PATTERNS) {
    const row = page.locator(`[data-pattern-key="${key}"]`);
    await expect(row).toBeVisible();
    await expect(row.locator(`svg[data-glyph="${key}"]`)).toBeVisible();
  }
});

test('pattern detail renders the pattern glyph', async ({ page }) => {
  await page.goto('./#/library/movements/hinge');
  const detail = page.getByTestId('pattern-detail');
  await expect(detail).toBeVisible();
  await expect(detail.locator('svg[data-glyph="hinge"]')).toBeVisible();
});

test('Library visual — index', async ({ page }) => {
  await page.goto('./#/library');
  await page.getByTestId('library-group-by-movement').click();
  const list = page.getByTestId('library-patterns');
  await list.waitFor({ state: 'visible' });
  await page.waitForTimeout(200);
  await expect(list).toHaveScreenshot('library-index.png', {
    maxDiffPixelRatio: 0.02,
    animations: 'disabled',
  });
});

test('unknown pattern shows deliberate empty state with Library CTA', async ({ page }) => {
  await page.goto('./#/library/movements/not-a-real-pattern');
  await expect(page.getByRole('heading', { name: /unknown pattern/i })).toBeVisible();
  const cta = page.getByRole('link', { name: /back to the library/i });
  await expect(cta).toBeVisible();
  await cta.click();
  await expect(page).toHaveURL(/#\/library$/);
});

test('unknown exercise id shows deliberate not-found state with Library CTA', async ({ page }) => {
  await page.goto('./#/library/exercises/not-a-real-id');
  await expect(page.getByRole('heading', { name: /exercise not found/i })).toBeVisible();
  const cta = page.getByRole('link', { name: /back to the library/i });
  await expect(cta).toBeVisible();
});
