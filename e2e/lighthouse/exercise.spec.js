import { test } from '@playwright/test';
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { playAudit } from 'playwright-lighthouse';
import { lighthouseThresholds, lighthouseOpts, LH_PORT } from '../../playwright/lighthouse.config.js';

test('lighthouse — exercise detail meets mobile budgets', async () => {
  test.setTimeout(180_000);
  const reportDir = `${process.cwd()}/lighthouse-report`;
  mkdirSync(reportDir, { recursive: true });
  const browser = await chromium.launch({
    args: [`--remote-debugging-port=${LH_PORT}`],
  });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`http://localhost:4173/hd-workout/#/library/exercises/push-bb-bench`);
    await playAudit({
      page,
      port: LH_PORT,
      thresholds: lighthouseThresholds,
      opts: lighthouseOpts,
      reports: {
        formats: { html: true, json: true },
        name: `lh-exercise`,
        directory: reportDir,
      },
    });
  } finally {
    await browser.close();
  }
});
