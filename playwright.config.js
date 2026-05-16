import { defineConfig, devices } from '@playwright/test';

// vite preview honors the production base ('/hd-workout/').
// Use a baseURL that matches so spec navigation can use relative paths.
const PORT = 4173;
const BASE_PATH = '/hd-workout/';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  // Visual snapshots are a structural sanity check, not a per-pixel gate.
  // Drop {platform} from the snapshot path so a single baseline is reused
  // across darwin (local dev) and linux (CI). Font + sub-pixel rendering
  // differences are absorbed by per-test maxDiffPixelRatio.
  snapshotPathTemplate: '{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}-{projectName}{ext}',
  expect: {
    // Cross-OS font hinting accounts for ~3–5% of pixels diffing on
    // type-heavy snapshots. Lift the global ratio to 8% so structural
    // regressions still fail but font rendering noise doesn't.
    toHaveScreenshot: { maxDiffPixelRatio: 0.08 },
  },
  use: {
    baseURL: `http://localhost:${PORT}${BASE_PATH}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Onboarding overlay would otherwise block every E2E. Mark all test
    // sessions as onboarded by default; specs that seed their own
    // settings blob include onboarded:true alongside their fields so
    // legacy seeding paths keep working unchanged. New installs in
    // production still see the flow.
    storageState: {
      cookies: [],
      origins: [
        {
          origin: `http://localhost:${PORT}`,
          localStorage: [
            { name: 'hdw:settings', value: '{"onboarded":true}' },
          ],
        },
      ],
    },
  },
  projects: [
    {
      name: 'mobile-chrome',
      testIgnore: /lighthouse\/.*/,
      use: {
        ...devices['Pixel 7'],
        // Pixel 7 maps to chromium; use it as our mobile baseline so we
        // don't need to install webkit (which iPhone devices require).
      },
    },
    {
      name: 'desktop-chrome',
      testIgnore: /lighthouse\/.*/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'lighthouse',
      testDir: './e2e/lighthouse',
      testMatch: /.*\.spec\.js/,
      // Each lighthouse spec launches its own Chrome bound to LH_PORT. Running
      // them in parallel causes port collisions and zeroed-out audit scores.
      // Serialize this project.
      fullyParallel: false,
      workers: 1,
      use: {
        // Lighthouse drives its own Chrome via CDP; viewport is irrelevant here.
        ...devices['Desktop Chrome'],
      },
    },
  ],
  webServer: {
    command: 'npm run preview -- --port ' + PORT + ' --strictPort',
    url: `http://localhost:${PORT}${BASE_PATH}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
