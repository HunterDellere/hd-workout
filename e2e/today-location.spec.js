import { test, expect } from '@playwright/test';

// Phase 4 slice 4 + Wave 4.4: location presets (gym/home) — each preset
// has its own overlay; switching it swaps which set of pre-start edits
// applies. The toggle lived as a chip on /today through Wave 3; in
// Wave 4 it moved into Settings (audit item #10 — the chip was a
// hidden program-switcher one tap from anywhere).

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
  await page.goto('./');
});

async function setLocation(page, target) {
  await page.goto('./#/me/settings');
  await page.getByTestId('location-radiogroup').waitFor({ state: 'visible' });
  await page
    .getByTestId('location-radiogroup')
    .locator(`[data-radio="${target}"]`)
    .click();
  await page.waitForTimeout(150);
  await page.goto('./#/');
  await page.waitForTimeout(150);
}

test('switching to Home shows the home program (push-up, KB press), not the gym build', async ({ page }) => {
  // Gym default: barbell bench is in the preview.
  await expect(page.locator('[data-testid="preview-row"][data-exercise-id="push-bb-bench"]')).toBeVisible();
  await expect(page.locator('[data-testid="preview-row"][data-exercise-id="push-pushup"]')).toHaveCount(0);

  // Switch to home via Settings.
  await setLocation(page, 'home');
  await expect(page.locator('[data-testid="preview-row"][data-exercise-id="push-pushup"]')).toBeVisible();
  await expect(page.locator('[data-testid="preview-row"][data-exercise-id="push-bb-bench"]')).toHaveCount(0);

  // Back to gym — symmetric.
  await setLocation(page, 'gym');
  await expect(page.locator('[data-testid="preview-row"][data-exercise-id="push-bb-bench"]')).toBeVisible();
});

test('per-preset overlay memory: an edit on gym does not bleed into home', async ({ page }) => {
  // Remove bench on gym. Stays removed across location toggles and reloads.
  const benchSel = '[data-testid="preview-row"][data-exercise-id="push-bb-bench"]';
  await page.locator(benchSel).getByTestId('preview-remove').click();
  await expect(page.locator(benchSel)).toHaveCount(0);
  await page.waitForTimeout(150);

  // Home shows its own program (no bench in either case).
  await setLocation(page, 'home');
  await expect(page.locator('[data-testid="preview-row"][data-exercise-id="push-pushup"]')).toBeVisible();

  // Back to gym — the removal persists, not undone by the trip.
  await setLocation(page, 'gym');
  await expect(page.locator(benchSel)).toHaveCount(0);

  // Reload — gym overlay persists.
  await page.reload();
  await expect(page.locator(benchSel)).toHaveCount(0);
});
