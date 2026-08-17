import { test, expect } from '@playwright/test';

/**
 * Client use case: a reader browsing feeds through the UI.
 */
test.describe('RSS Client — browsing feeds', () => {
  test('lists items and opens one', async ({ page }) => {
    await page.goto('/feeds');
    await expect(page.getByRole('heading', { name: 'RSS Client' })).toBeVisible();

    const articles = page.locator('article');
    await expect(articles.first()).toBeVisible();
    expect(await articles.count()).toBeGreaterThan(0);

    await page.getByRole('link', { name: 'Read more' }).first().click();
    await expect(page).toHaveURL(/\/feeds\/[0-9a-f-]{36}/);
    await expect(page.getByRole('link', { name: /Back to all items/ })).toBeVisible();
  });

    test('filters items by feed', async ({ page }) => {
    await page.goto('/feeds');
    const select = page.getByLabel('Filter by feed');
    await expect(select).toBeVisible();

    // Wait for the feed list to load before counting — the page fetches
    // feeds and items independently, so options arrive asynchronously.
    await expect(select.locator('option')).not.toHaveCount(1, { timeout: 10_000 });

    const options = await select.locator('option').count();
    expect(options).toBeGreaterThan(1);

    await select.selectOption({ index: 1 });
    await expect(page.locator('article').first()).toBeVisible({ timeout: 10_000 });
  });
  test('dashboard shows live operational metrics', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Operations dashboard' })).toBeVisible();
    await expect(page.getByText('Total requests')).toBeVisible();
    await expect(page.getByText('Unique clients')).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });
});