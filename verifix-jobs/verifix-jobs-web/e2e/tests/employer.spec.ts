import fs from 'node:fs';
import path from 'node:path';
import { expect, Page, test } from '@playwright/test';

type EmployerSeed = {
  email: string;
  password: string;
};

function loadEmployerSeed(): EmployerSeed {
  const seedPath = path.resolve(__dirname, '../../../../qa-logs/qa-employer-seed.json');
  return JSON.parse(fs.readFileSync(seedPath, 'utf8')) as EmployerSeed;
}

const employerSeed = loadEmployerSeed();
const adminEmail = 'admin@verifix.uz';
const adminPassword = 'Admin1234';

async function loginAsEmployer(page: Page) {
  await page.goto('/login');
  await page.locator('input[name="email"]').waitFor({ state: 'visible' });
  await page.locator('input[name="email"]').fill(employerSeed.email);
  await page.locator('input[name="password"]').fill(employerSeed.password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/employer\/dashboard/, { timeout: 20000 });
}

async function loginAsEmbeddedAdmin(page: Page) {
  await page.goto('/admin/login');
  await page.locator('input[name="email"]').waitFor({ state: 'visible' });
  await page.locator('input[name="email"]').fill(adminEmail);
  await page.locator('input[name="password"]').fill(adminPassword);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/admin\/dashboard/, { timeout: 20000 });
}

async function loginAsStandaloneAdmin(page: Page) {
  await page.goto('http://localhost:4201/login');
  await page.locator('input[name="email"]').waitFor({ state: 'visible' });
  await page.locator('input[name="email"]').fill(adminEmail);
  await page.locator('input[name="password"]').fill(adminPassword);
  await page.locator('input[name="totp"]').fill('000000');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/http:\/\/localhost:4201\/dashboard/, { timeout: 20000 });
}

test.describe('Employer portal smoke', () => {
  test('auth shell works and employer sections render', async ({ page }) => {
    await loginAsEmployer(page);

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Task inbox/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Civility score/i })).toBeVisible();

    await page.goto('/employer/vacancies');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('link', { name: /Yangi vakansiya/i })).toBeVisible();

    await page.getByRole('link', { name: /Yangi vakansiya/i }).click();
    await expect(page).toHaveURL(/\/employer\/vacancies\/new$/);
    await expect(page.locator('form')).toBeVisible();

    await page.goto('/employer/candidates');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Qidirish' })).toBeVisible();

    await page.goto('/employer/talent-hub');
    await expect(page.locator('h1')).toContainText('Talent Hub');
    await expect(page.getByRole('button', { name: /Search/i })).toBeVisible();

    await page.goto('/employer/settings');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Saqlash' })).toBeVisible();
  });

  test('mobile employer shell keeps navigation visible', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'Mobile', 'Mobile only');

    await loginAsEmployer(page);
    await expect(page.locator('nav.fixed.bottom-0')).toBeVisible();

    await page.goto('/employer/vacancies');
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('Embedded admin smoke', () => {
  test('embedded admin login and sections render', async ({ page }) => {
    await loginAsEmbeddedAdmin(page);

    await expect(page.locator('h1')).toBeVisible();

    await page.goto('/admin/employers');
    await expect(page.locator('h1')).toBeVisible();

    await page.goto('/admin/moderation');
    await expect(page.locator('h1')).toBeVisible();

    await page.goto('/admin/fraud');
    await expect(page.locator('h1')).toBeVisible();

    await page.goto('/admin/gov-sync');
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('Standalone admin smoke', () => {
  test('standalone admin login and main sections render', async ({ page }) => {
    await loginAsStandaloneAdmin(page);

    await expect(page.locator('h1')).toBeVisible();

    await page.goto('http://localhost:4201/users');
    await expect(page.locator('h1')).toBeVisible();

    await page.goto('http://localhost:4201/audit');
    await expect(page.locator('h1')).toBeVisible();

    await page.goto('http://localhost:4201/analytics');
    await expect(page.locator('h1')).toBeVisible();

    await page.goto('http://localhost:4201/settings');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('standalone admin mobile menu is reachable', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'Mobile', 'Mobile only');

    await loginAsStandaloneAdmin(page);
    await expect(page.getByRole('button', { name: /toggle admin menu/i })).toBeVisible();
  });
});
