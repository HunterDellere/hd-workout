import { test, expect } from '@playwright/test';

const consoleErrorsByTest = new WeakMap();

test.beforeEach(async ({ page, context }, testInfo) => {
  await context.clearCookies();
  const errors = [];
  consoleErrorsByTest.set(testInfo, errors);
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
});

test.afterEach(async ({}, testInfo) => {
  const errors = consoleErrorsByTest.get(testInfo) ?? [];
  expect(errors, `console errors:\n${errors.join('\n')}`).toEqual([]);
});

async function rootVar(page, name) {
  return page.evaluate(
    (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(),
    name,
  );
}

// Session 10 — the theme toggle lives inline in every Page's top-right.
// It cycles system → light → dark → system on each tap.

test('theme toggle cycles system → light → dark and flips CSS vars', async ({ page }) => {
  await page.addInitScript(() => {
    try { localStorage.removeItem('hd:theme'); } catch { /* noop */ }
  });
  await page.goto('./#/library');

  const toggle = page.getByTestId('theme-toggle').first();
  await expect(toggle).toHaveAttribute('data-theme-state', 'system');

  // Cycle once → light.
  await toggle.click();
  await expect(toggle).toHaveAttribute('data-theme-state', 'light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  const lightBg = await rootVar(page, '--surface-page');
  expect(lightBg).not.toBe('');

  // Cycle again → dark.
  await toggle.click();
  await expect(toggle).toHaveAttribute('data-theme-state', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const darkBg = await rootVar(page, '--surface-page');
  expect(darkBg).not.toBe('');
  expect(darkBg).not.toBe(lightBg);

  // Cycle again → system (clears attribute).
  await toggle.click();
  await expect(toggle).toHaveAttribute('data-theme-state', 'system');
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);
});

test('selected theme persists across navigation', async ({ page }) => {
  await page.addInitScript(() => {
    try { localStorage.removeItem('hd:theme'); } catch { /* noop */ }
  });
  await page.goto('./#/library');
  const toggle = page.getByTestId('theme-toggle').first();
  // system → light → dark
  await toggle.click();
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.goto('./#/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
