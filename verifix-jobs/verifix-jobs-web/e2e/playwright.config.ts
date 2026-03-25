import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:4200',
    headless: true,
    viewport: { width: 375, height: 812 }, // iPhone-like (mobile-first)
    locale: 'uz-UZ',
  },
  projects: [
    { name: 'Mobile', use: { viewport: { width: 375, height: 812 } } },
    { name: 'Desktop', use: { viewport: { width: 1280, height: 720 } } },
  ],
  webServer: {
    command: 'npx ng serve --port 4200',
    port: 4200,
    reuseExistingServer: true,
  },
});
