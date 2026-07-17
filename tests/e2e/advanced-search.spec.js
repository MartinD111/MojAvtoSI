import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('requestfailed', request => {
        console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText);
    });
    // Fulfill Supabase calls to return an empty array instead of aborting
    await page.route(/supabase\.co/, route => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
    }));
    await page.goto('/');
    await page.waitForFunction(() => typeof window.navigateTo === 'function', { timeout: 10_000 });
});

test('advanced search to listings vehicle type filter works', async ({ page }) => {
    // Navigate to advanced search
    await page.evaluate(() => window.navigateTo('/iskanje'));
    await expect(page.locator('#advancedSearchForm')).toBeVisible();

    // Click 'Limuzina'
    await page.click('.body-type-card[data-value="Limuzina"]');
    await expect(page.locator('.body-type-card[data-value="Limuzina"]')).toHaveClass(/active/);

    // Submit form
    await page.click('#searchBtnText');

    // Wait for listings page to load
    await page.waitForURL(/\/oglasi/);

    // Verify URL parameters
    const url = page.url();
    expect(url).toContain('bodyType=Limuzina');

    // Check sidebar filter matches (using auto-waiting assertion)
    await expect(page.locator('#sidebarBodyType')).toHaveValue('Limuzina');
});
