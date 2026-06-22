import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:4173/hd-workout/#';
const OUT = '/tmp/hdw-shots';
mkdirSync(OUT, { recursive: true });

// route hash, label
const routes = [
  ['/', 'today'],
  ['/library', 'library'],
  ['/library/movements/horizontal-press', 'library-pattern'],
  ['/log', 'log-history'],
  ['/log/insights', 'log-insights'],
  ['/me', 'me'],
  ['/me/settings', 'me-settings'],
  ['/me/about', 'me-about'],
  ['/me/glossary', 'me-glossary'],
  ['/me/bodyweight', 'me-bodyweight'],
  ['/push', 'day-push'],
  ['/pull', 'day-pull'],
  ['/legs', 'day-legs'],
];

const themes = ['light', 'dark'];

const browser = await chromium.launch();
for (const theme of themes) {
  const ctx = await browser.newContext({
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 2,
    storageState: {
      cookies: [],
      origins: [{
        origin: 'http://localhost:4173',
        localStorage: [
          { name: 'hdw:settings', value: JSON.stringify({ onboarded: true }) },
          { name: 'hd:theme', value: theme },
        ],
      }],
    },
  });
  const page = await ctx.newPage();
  for (const [hash, label] of routes) {
    await page.goto(BASE + hash, { waitUntil: 'networkidle' });
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${OUT}/${label}-${theme}.png`, fullPage: true });
    console.log(`shot ${label}-${theme}`);
  }
  await ctx.close();
}
await browser.close();
console.log('done ->', OUT);
