import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message, err.stack));
    page.on('requestfailed', request => {
        console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText);
    });
    // Fulfill Supabase calls to return an empty array instead of aborting
    await page.route(/supabase\.co/, route => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
    }));
});

test('advanced search to listings vehicle type filter works', async ({ page }) => {
    // Navigate to advanced search
    await page.goto('/iskanje');
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

test('advanced search preselects vehicle type from URL query', async ({ page }) => {
    await page.goto('/iskanje?cat=avto&vtype=Karavan');
    await expect(page.locator('#advancedSearchForm')).toBeVisible();

    const karavanCard = page.locator('#grid-cars .body-type-card[data-value="Karavan"]');
    await expect(karavanCard).toHaveClass(/active/);
    await expect(page.locator('#bodyTypeHidden')).toHaveValue('Karavan');
});

test('advanced search moto category selection and 4/3-wheel drill-down', async ({ page }) => {
    await page.goto('/iskanje?cat=moto');
    await expect(page.locator('#advancedSearchForm')).toBeVisible();

    // Moto grid should be visible
    await expect(page.locator('#grid-motorbikes')).toBeVisible();

    // Click Enduro
    const enduroCard = page.locator('#motoMainGrid .body-type-card[data-value="Enduro"]');
    await enduroCard.click();
    await expect(enduroCard).toHaveClass(/active/);
    await expect(page.locator('#bodyTypeHidden')).toHaveValue('Enduro');

    // Click 4in3kolesa group card to drill down
    const groupCard = page.locator('.moto-group-card[data-group="4in3kolesa"]');
    await groupCard.click();
    await expect(page.locator('#motoSubGrid')).toBeVisible();

    // Click ATV card
    const atvCard = page.locator('#motoSubGrid .body-type-card[data-value="ATV"]');
    await atvCard.click();
    await expect(atvCard).toHaveClass(/active/);

    // Back to main grid
    await page.click('#motoBackBtn');
    await expect(page.locator('#motoMainGrid')).toBeVisible();
    await expect(groupCard).toHaveClass(/active/);
});
