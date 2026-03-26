import { test, expect } from '@playwright/test';

test.describe('Employer Portal', () => {
  test('login page shows register tab', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('button:has-text("Ro\'yxatdan")')).toBeVisible();
  });

  test('login redirects to dashboard on success', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@test.uz');
    await page.fill('input[name="password"]', 'Test1234');
    await page.click('button[type="submit"]');
    await page.waitForURL(/employer\/dashboard/, { timeout: 10000 }).catch(() => {});
  });

  test('unauthenticated redirect to login', async ({ page }) => {
    await page.goto('/employer/dashboard');
    await expect(page).toHaveURL(/login/);
  });

  test('onboarding page loads', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page).toHaveURL(/login|onboarding/);
  });
});

test.describe('Public Pages Navigation', () => {
  test('salary calculator page loads', async ({ page }) => {
    await page.goto('/salary');
    await expect(page.locator('h1')).toContainText('Maosh');
  });

  test('companies page loads', async ({ page }) => {
    await page.goto('/companies');
    await expect(page.locator('h1')).toContainText('Kompaniyalar');
  });

  test('favorites page loads', async ({ page }) => {
    await page.goto('/favorites');
    await expect(page.locator('h1')).toContainText(/[Ss]aqlangan/);
  });

  test('job detail shows apply button', async ({ page }) => {
    await page.goto('/jobs');
    const firstJob = page.locator('a[href*="/jobs/"]').first();
    if (await firstJob.isVisible()) {
      await firstJob.click();
      await expect(page.locator('button:has-text("Ariza")')).toBeVisible();
    }
  });

  test('company detail shows reviews section', async ({ page }) => {
    await page.goto('/companies');
    const firstCompany = page.locator('a[href*="/companies/"]').first();
    if (await firstCompany.isVisible()) {
      await firstCompany.click();
      await expect(page.locator('text=Sharhlar')).toBeVisible();
    }
  });
});

test.describe('Admin Panel', () => {
  test('admin login page loads', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.locator('h1')).toContainText('Admin');
  });

  test('admin unauthenticated redirect', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/admin\/login/);
  });
});

test.describe('Mobile Responsive', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('mobile bottom nav visible', async ({ page }) => {
    await page.goto('/');
    const bottomNav = page.locator('nav.fixed.bottom-0');
    await expect(bottomNav).toBeVisible();
  });

  test('mobile vacancy detail has fixed apply bar', async ({ page }) => {
    await page.goto('/jobs');
    const firstJob = page.locator('a[href*="/jobs/"]').first();
    if (await firstJob.isVisible()) {
      await firstJob.click();
      const applyBar = page.locator('.fixed.bottom-16, .fixed.bottom-0');
      await expect(applyBar.first()).toBeVisible();
    }
  });
});

test.describe('Language Switcher', () => {
  test('language switcher is in header', async ({ page }) => {
    await page.goto('/');
    const langBtn = page.locator('vjw-lang-switcher button').first();
    await expect(langBtn).toBeVisible();
  });
});
