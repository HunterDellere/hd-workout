import { test, expect } from '@playwright/test';

// The inline script in index.html must apply data-theme="dark" BEFORE the
// React bundle parses/executes. We prove this by:
//   1. Setting localStorage via addInitScript (runs before any page script).
//   2. Registering a second init script that, the moment the document element
//      exists, captures `document.documentElement.dataset.theme` AND whether
//      the module script has been evaluated. We then read those captures
//      after load and assert ordering.

test('pre-paint script applies stored dark theme before app bundle runs', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('hd:theme', 'dark');
  });

  // The inline <head> script in index.html sets data-theme synchronously
  // during HTML parsing. The app bundle is a `type="module"` script and is
  // therefore deferred — it cannot execute until after DOMContentLoaded.
  // So at DCL: data-theme must already be "dark" and #root must still be empty.
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      window.__fouc = {
        theme: document.documentElement.dataset.theme ?? null,
        rootHasChildren: !!document.getElementById('root')?.firstElementChild,
      };
    }, { once: true });
  });

  await page.goto('./');
  const captured = await page.evaluate(() => window.__fouc);

  expect(captured?.theme).toBe('dark');
  expect(captured?.rootHasChildren).toBe(false);
});

test('no stored theme leaves data-theme unset (system follows)', async ({ page }) => {
  await page.addInitScript(() => {
    try { localStorage.removeItem('hd:theme'); } catch { /* noop */ }
  });
  await page.goto('./');
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);
});
