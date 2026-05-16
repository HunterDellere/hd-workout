import { test, expect } from '@playwright/test';

// /me/glossary — definitions for terms the app surfaces.
// Linked from /me as "Glossary." Should be reachable, list every term,
// and present a definition body for each.

test.beforeEach(async ({ page }) => {
  await page.goto('./');
});

test('glossary is reachable from /me and lists every term', async ({ page }) => {
  await page.goto('./#/me');
  await page.getByRole('link', { name: /glossary/i }).click();
  await expect(page).toHaveURL(/#\/me\/glossary$/);
  await expect(page.getByRole('heading', { name: /^words$/i, level: 1 })).toBeVisible();

  // Every entry has a dt (term) and a dd (definition).
  const entries = page.getByTestId('glossary-entry');
  await expect(entries.first()).toBeVisible();
  const count = await entries.count();
  expect(count).toBeGreaterThanOrEqual(8);
});

test('glossary defines the core intelligence terms', async ({ page }) => {
  await page.goto('./#/me/glossary');
  const required = ['Top set', 'PR (personal record)', 'Deload', 'Stagnation', 'Volume'];
  for (const term of required) {
    await expect(page.locator(`[data-term="${term}"]`)).toBeVisible();
  }
});
