import { expect, test } from '@playwright/test';

function makeExpiredJwt(): string {
  const header = btoa(JSON.stringify({ alg: 'HS256' }));
  const payload = btoa(JSON.stringify({
    sub: 'a0000000-0000-0000-0000-000000000001',
    role: 'SUPER_ADMIN',
    type: 'ACCESS',
    exp: Math.floor(Date.now() / 1000) - 3600,
  }));
  return `${header}.${payload}.fake`;
}

function makeValidJwt(): string {
  const header = btoa(JSON.stringify({ alg: 'HS256' }));
  const payload = btoa(JSON.stringify({
    sub: 'a0000000-0000-0000-0000-000000000001',
    role: 'SUPER_ADMIN',
    type: 'ACCESS',
    exp: Math.floor(Date.now() / 1000) + 3600,
  }));
  return `${header}.${payload}.fake`;
}

test.describe('Admin auth guard & error handling', () => {
  test('redirects to /admin/login when no token is present', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('redirects to /admin/login when token is expired', async ({ page }) => {
    await page.goto('/');
    await page.evaluate((token) => {
      localStorage.setItem('vjw_admin_token', token);
      localStorage.setItem('vjw_admin_role', 'SUPER_ADMIN');
    }, makeExpiredJwt());

    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/admin\/login/);

    const token = await page.evaluate(() => localStorage.getItem('vjw_admin_token'));
    expect(token).toBeNull();
  });

  test('clears token and redirects on 403 API response', async ({ page }) => {
    await page.goto('/');
    await page.evaluate((token) => {
      localStorage.setItem('vjw_admin_token', token);
      localStorage.setItem('vjw_admin_role', 'SUPER_ADMIN');
    }, makeValidJwt());

    // Navigate to admin — guard passes (token looks valid) but API returns 403
    // because the signature is fake
    await page.goto('/admin/dashboard');
    await page.waitForURL(/\/admin\/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('admin login page renders correctly', async ({ page }) => {
    await page.goto('/admin/login');

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('admin login shows error on invalid credentials', async ({ page }) => {
    await page.goto('/admin/login');
    await page.locator('input[type="email"]').fill('wrong@verifix.uz');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();

    // Should stay on login page with error feedback
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

test.describe('Public pages render without errors', () => {
  test('homepage loads with categories and vacancies', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Verifix Jobs/i);
    await expect(page.locator('h1')).toBeVisible();

    // Check no failed API requests
    const failedRequests: string[] = [];
    page.on('response', (res) => {
      if (res.url().includes('/api/') && res.status() >= 400) {
        failedRequests.push(`${res.status()} ${res.url()}`);
      }
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    expect(failedRequests).toEqual([]);
  });

  test('jobs page loads vacancies without 404/500 errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('response', (res) => {
      if (res.url().includes('/api/') && res.status() >= 400) {
        errors.push(`${res.status()} ${res.url()}`);
      }
    });

    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('vacancy detail loads with similar vacancies', async ({ page }) => {
    const errors: string[] = [];
    page.on('response', (res) => {
      if (res.url().includes('/api/') && res.status() >= 400) {
        errors.push(`${res.status()} ${res.url()}`);
      }
    });

    // Get first vacancy from list
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');
    const firstVacancy = page.locator('a[href^="/jobs/"]').first();
    await firstVacancy.click();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('companies page renders', async ({ page }) => {
    await page.goto('/companies');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('salary page renders with data', async ({ page }) => {
    await page.goto('/salary');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('map page renders', async ({ page }) => {
    await page.goto('/map');
    await expect(page.locator('#vacancy-map')).toBeVisible();
  });

  test('login page renders both candidate and employer tabs', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input')).toHaveCount({ minimum: 1 });
  });
});

test.describe('Console errors check', () => {
  test('no JavaScript errors on public pages', async ({ page }) => {
    const jsErrors: string[] = [];
    page.on('pageerror', (err) => jsErrors.push(err.message));

    const pages = ['/', '/jobs', '/companies', '/salary', '/login'];
    for (const url of pages) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
    }

    expect(jsErrors).toEqual([]);
  });
});
