import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

const consoleErrorsByTest = new WeakMap();

test.beforeEach(async ({ page }, testInfo) => {
  const errors = [];
  consoleErrorsByTest.set(testInfo, errors);
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('requestfailed', (req) => {
    errors.push(`requestfailed ${req.url()} — ${req.failure()?.errorText ?? ''}`);
  });
  page.on('response', (res) => {
    if (res.status() >= 400) {
      errors.push(`HTTP ${res.status()} ${res.url()}`);
    }
  });
});

test.afterEach(async ({}, testInfo) => {
  const errors = consoleErrorsByTest.get(testInfo) ?? [];
  expect(errors, `console errors detected:\n${errors.join('\n')}`).toEqual([]);
});

test('home loads without console errors', async ({ page }) => {
  const response = await page.goto('./');
  expect(response?.ok()).toBe(true);
  await expect(page.locator('#root')).not.toBeEmpty();
});

test('home is a11y clean (no serious/critical violations)', async ({ page }) => {
  await page.goto('./');
  // Wait for fonts AND entrance animations to settle before axe samples
  // colours. CI was failing intermittently with `color-contrast` while
  // Newsreader was still loading — fallback Georgia rendered at different
  // weights, which axe sampled as low-contrast in mid-swap state.
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(700);
  await injectAxe(page);
  await checkA11y(page, undefined, {
    detailedReport: true,
    detailedReportOptions: { html: true },
    axeOptions: { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    includedImpacts: ['serious', 'critical'],
  });
});

// Phase 1 exit gate: axe scan on every primary route. If a serious/critical
// violation lands here, we fail loud before the rest of the route catches up.
const A11Y_ROUTES = [
  { name: 'today (root)', hash: '' },
  { name: 'library index', hash: '#/library' },
  { name: 'library pattern detail', hash: '#/library/movements/horizontal-press' },
  { name: 'exercise detail (canonical)', hash: '#/library/exercises/push-bb-bench' },
  { name: 'day (push)', hash: '#/push' },
  { name: 'log', hash: '#/log' },
  { name: 'about', hash: '#/me/about' },
  { name: 'glossary', hash: '#/me/glossary' },
  { name: 'me index', hash: '#/me' },
  { name: 'me settings', hash: '#/me/settings' },
];

for (const route of A11Y_ROUTES) {
  test(`${route.name} is a11y clean (no serious/critical violations)`, async ({ page }) => {
    await page.goto(`./${route.hash}`);
    // Wait for webfonts + entrance animations to settle so axe samples
    // final-state colours, not the in-flight fallback render.
    await page.evaluate(() => document.fonts && document.fonts.ready);
    await page.waitForTimeout(700);
    await injectAxe(page);
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      includedImpacts: ['serious', 'critical'],
    });
  });
}
