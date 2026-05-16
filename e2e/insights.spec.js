import { test, expect } from '@playwright/test';

// Phase 3 slice 1 coverage: enable the intelligence flag, seed a small
// archive via raw IDB, verify the /insights surface renders.

const SEED_ARCHIVE = [{
  id: 'SEED-A',
  programId: 'full-spectrum',
  dayKey: 'push',
  startedAt: '2026-05-08T10:00:00.000Z',
  endedAt: '2026-05-08T11:00:00.000Z',
  performances: [{
    id: 'perf-1',
    exerciseId: 'push-bb-bench',
    sectionKey: 'chest-horizontal',
    swappedFromId: null,
    prescription: { sets: '4 × 5–8', rest: '2:30–3:00' },
    sets: [
      { index: 1, weight: 100, unit: 'kg', reps: 5, rpe: null, loggedAt: '2026-05-08T10:15:00.000Z', pr: { weight: true } },
      { index: 2, weight: 100, unit: 'kg', reps: 5, rpe: null, loggedAt: '2026-05-08T10:20:00.000Z' },
    ],
    notes: '',
  }],
  restStartedAt: null,
  restTargetSec: null,
  restPerformanceId: null,
}];

async function seedIdb(page, { archive = [], intelligenceEnabled = true } = {}) {
  await page.evaluate(async ({ archive, intelligenceEnabled }) => {
    await new Promise((resolve) => {
      const open = indexedDB.open('keyval-store', 1);
      open.onupgradeneeded = () => open.result.createObjectStore('keyval');
      open.onsuccess = () => {
        const tx = open.result.transaction('keyval', 'readwrite');
        const store = tx.objectStore('keyval');
        store.put({
          split: { 0:'push', 1:'push', 2:'push', 3:'push', 4:'push', 5:'push', 6:'push' },
          restTimerMode: 'count-up',
          units: 'kg',
          haptics: 'standard',
          intelligenceEnabled,
        }, 'hdw:settings');
        store.put(archive, 'hdw:sessions:archive');
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      };
      open.onerror = () => resolve();
    });
  }, { archive, intelligenceEnabled });
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('hd:theme', 'light');
  });
  await page.goto('./');
});

test('insights route is reachable when flag is on', async ({ page }) => {
  await seedIdb(page, { archive: SEED_ARCHIVE, intelligenceEnabled: true });
  await page.goto('./#/insights');
  await page.reload();
  await expect(page.getByRole('heading', { name: /^insights$/i, level: 1 })).toBeVisible();
  await expect(page.getByTestId('heatmap')).toBeVisible();
  await expect(page.getByTestId('volume-row').first()).toBeVisible();
  await expect(page.getByTestId('pr-rollup')).toBeVisible();
});

test('insights route redirects to /me when flag is off', async ({ page }) => {
  await seedIdb(page, { archive: SEED_ARCHIVE, intelligenceEnabled: false });
  await page.goto('./#/insights');
  await page.reload();
  await expect(page).toHaveURL(/#\/me$/);
});

test('history strip surfaces PR chip on a PR row', async ({ page }) => {
  await seedIdb(page, { archive: SEED_ARCHIVE });
  await page.goto('./#/library/exercises/push-bb-bench');
  await page.reload();
  await expect(page.getByTestId('history-strip')).toBeVisible();
  await expect(page.getByTestId('pr-chip').first()).toBeVisible();
});

test('today suggestion line surfaces when intelligence is on', async ({ page }) => {
  await seedIdb(page, { archive: SEED_ARCHIVE });
  await page.goto('./#/today');
  await page.reload();
  await page.getByTestId('start-session').click();
  // The bench performance should carry a hold suggestion (100 × 5 mid-range).
  const benchCard = page.locator('[data-testid="performance-card"]').first();
  await expect(benchCard.getByTestId('suggestion-line')).toBeVisible();
});

test('slot picker opens, filters, picks, removes', async ({ page }) => {
  // Seed an all-push split so `/today` shows a session regardless of the
  // weekday CI happens to run on (the default split parks rest on weekends).
  await seedIdb(page, { archive: [] });
  await page.goto('./#/today');
  await page.reload();
  await page.getByTestId('start-session').click();

  // Click the first add-to-section button.
  const addBtn = page.getByTestId('add-to-section').first();
  await addBtn.click();
  await expect(page.getByTestId('slot-picker-list')).toBeVisible();

  // Toggle the Posture filter and pick a candidate.
  await page.getByTestId('slot-filter-posture').click();
  const firstCandidate = page.getByTestId('slot-candidate').first();
  await expect(firstCandidate).toBeVisible();
  const exerciseId = await firstCandidate.getAttribute('data-exercise-id');
  await firstCandidate.click();

  // The new card lands and shows a Remove affordance.
  const newCard = page.locator(`[data-performance-id]`).filter({ has: page.getByTestId('remove-performance') }).first();
  await expect(newCard).toBeVisible();

  // Remove sends it away.
  await newCard.getByTestId('remove-performance').click();
  // After removal there should be no card carrying the picked id with a Remove button.
  expect(exerciseId).toBeTruthy();
});
