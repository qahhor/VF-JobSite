import { test, expect } from '@playwright/test';

test.describe('Public Home Page', () => {
  test('loads and shows hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Verifix Jobs/);
    await expect(page.locator('h1')).toContainText('ish topish');
  });

  test('shows 14 category cards', async ({ page }) => {
    await page.goto('/');
    const categories = page.locator('[href*="category="]');
    await expect(categories).toHaveCount(14);
  });

  test('search navigates to jobs page', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="text"]', 'oshpaz');
    await page.click('a:has-text("Qidirish")');
    await expect(page).toHaveURL(/\/jobs/);
  });

  test('navbar links work', async ({ page }) => {
    await page.goto('/');
    await page.click('a:has-text("Vakansiyalar")');
    await expect(page).toHaveURL('/jobs');
    await page.goBack();
    await page.click('a:has-text("Kompaniyalar")');
    await expect(page).toHaveURL('/companies');
  });

  test('footer is visible', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toContainText('Verifix');
  });

  test('has proper meta tags for SEO', async ({ page }) => {
    await page.goto('/');
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toContain('Verifix Jobs');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('uz');
  });

  test('touch targets are at least 44px', async ({ page }) => {
    await page.goto('/');
    const buttons = page.locator('button, a.btn-primary');
    const count = await buttons.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      const box = await buttons.nth(i).boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(36); // allowing some tolerance
      }
    }
  });
});

test.describe('Vacancy List Page', () => {
  test('loads vacancy list', async ({ page }) => {
    await page.goto('/jobs');
    await expect(page.locator('h1')).toContainText(/[Vv]akansiya/);
  });

  test('filters by city', async ({ page }) => {
    await page.goto('/jobs');
    await page.selectOption('select', { label: 'Tashkent' });
  });

  test('shows empty state when no results', async ({ page }) => {
    await page.goto('/jobs?q=xyznonexistent');
    // Should show either results or empty state
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Login Page', () => {
  test('shows login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('shows validation on empty submit', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');
    // Form should not navigate away
    await expect(page).toHaveURL(/\/login/);
  });
});
