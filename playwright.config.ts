import { defineConfig } from '@playwright/test';

const HOST = process.env.TEST_HOST ?? 'http://localhost';
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],
  use: {
    baseURL: HOST,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
});