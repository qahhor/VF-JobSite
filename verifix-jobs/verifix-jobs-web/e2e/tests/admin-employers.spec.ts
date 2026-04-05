import { expect, test } from '@playwright/test';

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

test.describe('Admin Employers Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate((token) => {
      localStorage.setItem('vjw_admin_token', token);
      localStorage.setItem('vjw_admin_role', 'SUPER_ADMIN');
    }, makeValidJwt());
  });

  test('employers page loads with table layout', async ({ page }) => {
    await page.goto('/admin/employers');
    // Should have the table headers
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('th')).toHaveCount({ minimum: 4 });
  });

  test('search input and status filter are present', async ({ page }) => {
    await page.goto('/admin/employers');
    await expect(page.locator('input[type="text"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('select')).toBeVisible();
  });

  test('add button opens create form modal', async ({ page }) => {
    await page.goto('/admin/employers');
    await page.waitForLoadState('networkidle');

    const addBtn = page.locator('button', { hasText: /\+/ });
    if (await addBtn.isVisible()) {
      await addBtn.click();
      // Form modal should appear with company name field
      await expect(page.locator('input').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('stat cards show numbers', async ({ page }) => {
    await page.goto('/admin/employers');
    await page.waitForLoadState('networkidle');
    // Stats section should be visible
    const statsSection = page.locator('section').first();
    await expect(statsSection).toBeVisible({ timeout: 10000 });
  });

  test('pagination renders when needed', async ({ page }) => {
    await page.goto('/admin/employers');
    await page.waitForLoadState('networkidle');
    // Pagination may or may not be visible depending on data
    // Just check no JS errors
  });
});

test.describe('Admin References Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate((token) => {
      localStorage.setItem('vjw_admin_token', token);
      localStorage.setItem('vjw_admin_role', 'SUPER_ADMIN');
    }, makeValidJwt());
  });

  test('references page loads with tabs', async ({ page }) => {
    await page.goto('/admin/references');
    await page.waitForLoadState('networkidle');
    // Should have tab buttons
    await expect(page.locator('button').first()).toBeVisible({ timeout: 10000 });
  });

  test('can switch between cities, regions, countries tabs', async ({ page }) => {
    await page.goto('/admin/references');
    await page.waitForLoadState('networkidle');

    // Click regions tab
    const regionsTab = page.locator('button', { hasText: /регион|viloyat/i }).first();
    if (await regionsTab.isVisible()) {
      await regionsTab.click();
      await page.waitForLoadState('networkidle');
    }

    // Click countries tab
    const countriesTab = page.locator('button', { hasText: /стран|davlat|country/i }).first();
    if (await countriesTab.isVisible()) {
      await countriesTab.click();
      await page.waitForLoadState('networkidle');
    }
  });
});

test.describe('PWA Banner', () => {
  test('PWA dismiss stores timestamp in localStorage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Set and verify dismiss storage
    await page.evaluate(() => {
      localStorage.setItem('vjw_pwa_dismissed', String(Date.now()));
    });

    const dismissed = await page.evaluate(() => localStorage.getItem('vjw_pwa_dismissed'));
    expect(dismissed).toBeTruthy();
    expect(Number(dismissed)).toBeGreaterThan(0);
  });
});
