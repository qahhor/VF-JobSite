import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

type QaSeed = {
  vacancies: Array<{ id: string; slug: string | null; title: string }>;
};

function loadQaSeed(): QaSeed {
  const seedPath = path.resolve(__dirname, '../../../../qa-logs/qa-employer-seed.json');
  return JSON.parse(fs.readFileSync(seedPath, 'utf8')) as QaSeed;
}

const qaSeed = loadQaSeed();
const vacancySlug = qaSeed.vacancies[0]?.slug || qaSeed.vacancies[0]?.id;

test.describe('Public smoke', () => {
  test('home page renders hero, categories, and desktop header navigation', async ({ page }, testInfo) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Verifix Jobs/i);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('a[href^="/vacancies/category/"]')).toHaveCount(14);

    if (testInfo.project.name === 'Desktop') {
      await page.locator('header a[href="/jobs"]').first().click();
      await expect(page).toHaveURL(/\/jobs$/);
      await expect(page.locator('h1')).toBeVisible();

      await page.goto('/');
      await page.locator('header a[href="/companies"]').first().click();
      await expect(page).toHaveURL(/\/companies$/);
      await expect(page.locator('h1')).toBeVisible();

      await page.goto('/');
      await page.locator('header a[href="/map"]').first().click();
      await expect(page).toHaveURL(/\/map$/);
      await expect(page.locator('h1')).toBeVisible();

      await page.goto('/');
      await page.locator('header a[href="/salary"]').first().click();
      await expect(page).toHaveURL(/\/salary$/);
      await expect(page.locator('h1')).toBeVisible();
    }
  });

  test('home search navigates to jobs with query', async ({ page }) => {
    await page.goto('/');
    await page.locator('input[type="text"]').first().fill('driver');
    await page.locator('section').first().locator('a[href^="/jobs"]').last().click();
    await expect(page).toHaveURL(/\/jobs\?q=driver/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('jobs page shows filters and desktop split view', async ({ page }, testInfo) => {
    await page.goto('/jobs');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[placeholder*="Qidirish"], input[placeholder*="search"], input[type="text"]').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Toshkent' })).toBeVisible();

    await page.getByRole('button', { name: 'Toshkent' }).click();
    await expect(page).toHaveURL(/\/vacancies\/Toshkent/);

    if (testInfo.project.name === 'Desktop') {
      await expect(page.getByText('Split View', { exact: true })).toBeVisible();
      await expect(page.getByRole('link', { name: /Batafsil|Detail/i }).first()).toBeVisible();
    }
  });

  test('job detail page shows primary actions and similar vacancies', async ({ page }, testInfo) => {
    test.skip(!vacancySlug, 'QA vacancy seed is missing');

    await page.goto(`/jobs/${vacancySlug}`);

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button, a').filter({ hasText: /Ariza|Отклик|Apply/i }).first()).toBeVisible();
    await expect(page.locator('body')).toContainText(/Salary Intelligence|Imtiyozlar|Описание|Tavsif/i);

    if (testInfo.project.name === 'Mobile') {
      await expect(page.locator('.fixed.bottom-16, .fixed.bottom-0').first()).toBeVisible();
    }
  });

  test('companies, map, salary, and favorites pages render', async ({ page }) => {
    await page.goto('/companies');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[type="text"]').first()).toBeVisible();

    await page.goto('/map');
    await expect(page.locator('#vacancy-map')).toBeVisible();
    await expect(page.locator('button').filter({ hasText: /top|найти|locate/i }).first()).toBeVisible();

    await page.goto('/salary');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button').nth(0)).toBeVisible();

    await page.goto('/favorites');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('mobile shell keeps bottom navigation visible', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'Mobile', 'Mobile only');

    await page.goto('/');
    await expect(page.locator('nav.fixed.bottom-0')).toBeVisible();

    await page.locator('nav.fixed.bottom-0 a[href="/jobs"]').click();
    await expect(page).toHaveURL(/\/jobs$/);
    await expect(page.locator('h1')).toBeVisible();
  });
});
