import fs from 'node:fs';
import path from 'node:path';
import { expect, Page, test } from '@playwright/test';

type EmployerSeed = {
  email: string;
  password: string;
};

const nextButtonPattern = /keyingi|next|далее/i;

function loadEmployerSeed(): EmployerSeed | null {
  const seedPath = path.resolve(__dirname, '../../../../qa-logs/qa-employer-seed.json');
  if (!fs.existsSync(seedPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(seedPath, 'utf8')) as EmployerSeed;
}

const employerSeed = loadEmployerSeed();
const adminEmail = 'admin@verifix.uz';
const adminPassword = 'Admin1234';

async function ensureStablePage(page: Page) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await page.waitForLoadState('networkidle');
    if (await page.locator('vite-error-overlay').count() === 0) {
      return;
    }
    await page.reload({ waitUntil: 'networkidle' });
  }

  await expect(page.locator('vite-error-overlay')).toHaveCount(0);
}

async function createEmployerViaApi(page: Page): Promise<EmployerSeed> {
  const unique = Date.now().toString();
  const email = `qa.flow.${unique}@verifix.uz`;
  const password = 'Test1234A';

  const response = await page.request.post('http://localhost:7777/api/v1/auth/employer/register', {
    data: {
      companyName: `QA Flow ${unique}`,
      inn: `QA${unique}`,
      email,
      password,
      phone: '+998901112233',
    },
  });

  expect(response.ok()).toBeTruthy();
  return { email, password };
}

async function loginAsEmployer(page: Page, credentials?: EmployerSeed) {
  const resolvedCredentials = credentials ?? employerSeed ?? await createEmployerViaApi(page);
  await page.goto('/login');
  await ensureStablePage(page);
  await page.locator('input[name="email"]').waitFor({ state: 'visible' });
  await page.locator('input[name="email"]').fill(resolvedCredentials.email);
  await page.locator('input[name="password"]').fill(resolvedCredentials.password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/employer\/dashboard/, { timeout: 20000 });
}

async function loginAsEmbeddedAdmin(page: Page) {
  await page.goto('/admin/login');
  await ensureStablePage(page);
  await page.locator('input[name="email"]').waitFor({ state: 'visible' });
  await page.locator('input[name="email"]').fill(adminEmail);
  await page.locator('input[name="password"]').fill(adminPassword);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/admin\/dashboard/, { timeout: 20000 });
}

async function loginAsStandaloneAdmin(page: Page) {
  await page.goto('http://localhost:4201/login');
  await ensureStablePage(page);
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

  test('vacancy create/edit flow keeps gps and expiry date', async ({ page }) => {
    const credentials = await createEmployerViaApi(page);
    const title = `QA GPS Vacancy ${Date.now()}`;

    await loginAsEmployer(page, credentials);
    await page.goto('/employer/vacancies/new');

    await page.locator('input[type="text"]').first().fill(title);
    await page.locator('input[placeholder="41.311081"]').fill('41.311081');
    await page.locator('input[placeholder="69.240562"]').fill('69.240562');
    await page.getByRole('button', { name: nextButtonPattern }).click();

    await page.locator('textarea').fill('Vakansiya toliq flow uchun yaratildi. GPS va expiry tekshiriladi.');
    await page.getByRole('button', { name: nextButtonPattern }).click();
    await page.getByRole('button', { name: nextButtonPattern }).click();

    await page.locator('input[type="number"]').first().fill('2500000');
    await page.locator('input[type="number"]').nth(1).fill('3500000');
    await page.locator('input[type="date"]').fill('2026-07-15');
    await page.getByRole('button', { name: nextButtonPattern }).click();

    await expect(page.locator('body')).toContainText(title);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/employer\/vacancies$/, { timeout: 20000 });

    const row = page.locator('tbody tr').filter({ hasText: title }).first();
    await expect(row).toBeVisible();
    await expect(row).toContainText(/Moderat|модерац|pending/i);

    await row.getByRole('link', { name: /tahrirlash|edit/i }).click();
    await expect(page).toHaveURL(/\/edit$/);

    await expect(page.locator('input[placeholder="41.311081"]')).toHaveValue('41.311081');
    await expect(page.locator('input[placeholder="69.240562"]')).toHaveValue('69.240562');

    await page.getByRole('button', { name: nextButtonPattern }).click();
    await page.getByRole('button', { name: nextButtonPattern }).click();
    await page.getByRole('button', { name: nextButtonPattern }).click();
    await expect(page.locator('input[type="date"]')).toHaveValue('2026-07-15');
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
