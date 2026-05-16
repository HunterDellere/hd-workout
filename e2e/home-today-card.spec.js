import { test, expect } from '@playwright/test';

// Phase 5: Home gained a contextual Today card — the primary CTA into
// /today, with three shapes (in-progress / training day / rest day).

test.beforeEach(async ({ page }) => {
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
});

test('Home surfaces a Today card that opens /today', async ({ page }) => {
  await page.goto('./');
  const card = page.getByTestId('home-today-card');
  await expect(card).toBeVisible();
  // Should show "Today" eyebrow + day name + open button.
  await expect(card).toContainText(/Push/i);
  await page.getByTestId('home-start').click();
  await expect(page).toHaveURL(/#\/today$/);
});

test('Home Today card switches to in-progress copy once a session is active', async ({ page }) => {
  await page.goto('./#/today');
  await page.getByTestId('start-session').click();
  await page.waitForTimeout(150);
  await page.goto('./');
  const card = page.getByTestId('home-today-card');
  await expect(card).toContainText(/In progress/i);
  await expect(page.getByTestId('home-resume')).toBeVisible();
});

test('BottomNav now exposes a Me tab', async ({ page }) => {
  await page.goto('./');
  // The 4-tab nav. Me link is reachable directly.
  await page.locator('nav[aria-label="Primary"]').getByRole('link', { name: 'Me', exact: true }).click();
  await expect(page).toHaveURL(/#\/me$/);
});
