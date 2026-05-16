import { test } from '@playwright/test';
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { playAudit } from 'playwright-lighthouse';
import { lighthouseOpts, LH_PORT } from '../../playwright/lighthouse.config.js';

// /today is the most interactive surface in the app. It composes session +
// settings + SetRow + RestTimer + SubstituteSheet + the long-gap-resume
// prompt, so it carries the most JS of any route. Its perf budget is
// intentionally lower than the editorial routes (lighthouseThresholds.perf 80)
// while a11y / best-practices / SEO stay at parity. Tighten once the route's
// perf profile stabilises.

const todayThresholds = {
  performance: 70,
  accessibility: 95,
  'best-practices': 95,
  seo: 90,
};

test('lighthouse — today meets mobile budgets', async () => {
  test.setTimeout(180_000);
  const reportDir = `${process.cwd()}/lighthouse-report`;
  mkdirSync(reportDir, { recursive: true });
  const browser = await chromium.launch({
    args: [`--remote-debugging-port=${LH_PORT}`],
  });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`http://localhost:4173/hd-workout/#/today`);
    await playAudit({
      page,
      port: LH_PORT,
      thresholds: todayThresholds,
      opts: lighthouseOpts,
      reports: {
        formats: { html: true, json: true },
        name: `lh-today`,
        directory: reportDir,
      },
    });
  } finally {
    await browser.close();
  }
});
