import { test } from '@playwright/test';
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { playAudit } from 'playwright-lighthouse';
import { lighthouseOpts, LH_PORT } from '../../playwright/lighthouse.config.js';

// /insights is gated on settings.intelligenceEnabled. Before the audit
// we seed IDB with that flag + a small archive (one session, two PRs)
// so the page actually has volume / PR content to lay out — auditing an
// empty state is the wrong budget signal.
//
// Perf budget mirrors /today (perf 70). Insights does more aggregation
// work than the editorial routes, less than the SetRow surface.

const insightsThresholds = {
  performance: 70,
  accessibility: 95,
  'best-practices': 95,
  seo: 90,
};

const SEED_SESSION = {
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
};

test('lighthouse — insights meets mobile budgets', async () => {
  test.setTimeout(180_000);
  const reportDir = `${process.cwd()}/lighthouse-report`;
  mkdirSync(reportDir, { recursive: true });
  const browser = await chromium.launch({
    args: [`--remote-debugging-port=${LH_PORT}`],
  });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    // Seed IDB on the right origin BEFORE the audit navigation. We open
    // the app first to set up storage, then navigate to /insights.
    await page.goto(`http://localhost:4173/hd-workout/`);
    await page.evaluate(async (session) => {
      await new Promise((resolve) => {
        const open = indexedDB.open('keyval-store', 1);
        open.onupgradeneeded = () => open.result.createObjectStore('keyval');
        open.onsuccess = () => {
          const tx = open.result.transaction('keyval', 'readwrite');
          const store = tx.objectStore('keyval');
          store.put({ split: { 0:'push', 1:'push', 2:'push', 3:'push', 4:'push', 5:'push', 6:'push' }, restTimerMode: 'count-up', units: 'kg', haptics: 'standard', intelligenceEnabled: true }, 'hdw:settings');
          store.put([session], 'hdw:sessions:archive');
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        };
        open.onerror = () => resolve();
      });
    }, SEED_SESSION);
    await page.goto(`http://localhost:4173/hd-workout/#/insights`);
    await playAudit({
      page,
      port: LH_PORT,
      thresholds: insightsThresholds,
      opts: lighthouseOpts,
      reports: {
        formats: { html: true, json: true },
        name: `lh-insights`,
        directory: reportDir,
      },
    });
  } finally {
    await browser.close();
  }
});
