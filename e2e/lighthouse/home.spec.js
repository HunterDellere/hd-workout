import { test } from '@playwright/test';
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { playAudit } from 'playwright-lighthouse';
import { lighthouseThresholds, lighthouseOpts, LH_PORT } from '../../playwright/lighthouse.config.js';

// Lighthouse needs a Chrome with a remote-debugging port. Playwright's
// default browser doesn't expose one, so we launch our own per-test instance
// and point playAudit at it. Slow, but isolated.

test('lighthouse — home meets mobile budgets', async () => {
  test.setTimeout(180_000);
  const reportDir = `${process.cwd()}/lighthouse-report`;
  mkdirSync(reportDir, { recursive: true });
  const browser = await chromium.launch({
    args: [`--remote-debugging-port=${LH_PORT}`],
  });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`http://localhost:4173/hd-workout/`);
    const auditResults = await playAudit({
      page,
      port: LH_PORT,
      thresholds: lighthouseThresholds,
      opts: lighthouseOpts,
      reports: {
        formats: { html: true, json: true },
        name: `lh-home`,
        directory: reportDir,
      },
      ignoreError: process.env.LH_DIAGNOSE === '1',
    });
    if (process.env.LH_DIAGNOSE === '1' && auditResults?.lhr) {
      const { writeFileSync, existsSync } = await import('node:fs');
      console.log('reportDir:', reportDir, 'exists:', existsSync(reportDir));
      writeFileSync(`${reportDir}/lhr.json`, JSON.stringify(auditResults.lhr, null, 2));
      console.log('wrote lhr.json, size:', JSON.stringify(auditResults.lhr).length);
    } else if (process.env.LH_DIAGNOSE === '1') {
      console.log('no auditResults.lhr:', Object.keys(auditResults || {}));
    }
  } finally {
    await browser.close();
  }
});
