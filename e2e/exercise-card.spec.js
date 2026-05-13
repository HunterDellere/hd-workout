import { test, expect } from '@playwright/test';

// Snapshot the first v2 ExerciseCard on a Day page across mobile + desktop.
// Day data is seeded in code; the first day route is `#/push` (per Day.jsx).

test.beforeEach(async ({ page }) => {
  // Pin a theme so the snapshot is deterministic across runs.
  await page.addInitScript(() => {
    localStorage.setItem('hd:theme', 'light');
  });
});

test('ExerciseCardV2 visual — light theme', async ({ page }) => {
  await page.goto('./#/push');
  const card = page.locator('[data-testid="exercise-card-v2"]').first();
  await card.waitFor({ state: 'visible' });

  // Wait for entrance animation to settle (220ms anim + buffer).
  await page.waitForTimeout(350);

  await expect(card).toHaveScreenshot('exercise-card-v2.png', {
    maxDiffPixelRatio: 0.02,
    animations: 'disabled',
  });
});
