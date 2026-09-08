import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.route(/supabase\.co/, route => route.abort());
    await page.goto('/');
    await page.waitForFunction(() => typeof window.navigateTo === 'function', { timeout: 10_000 });
});

test('country flags render with coat of arms in dropdown and trigger', async ({ page }) => {
    const container = page.locator('.custom-select-container:has(+ #home-country)').first();
    await container.waitFor({ state: 'visible', timeout: 10_000 });

    const trigger = container.locator('.custom-select-trigger');
    const menu = container.locator('.custom-select-menu');

    // Click trigger to open dropdown
    await trigger.click();
    await expect(menu).toHaveClass(/open/);

    // Wait for animation
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'scratch/country_dropdown_open.png', clip: { x: 50, y: 350, width: 600, height: 450 } });

    // Verify country flag images render inside options
    const flagImages = menu.locator('.custom-select-country-flag');
    await expect(flagImages.first()).toBeVisible();
    const count = await flagImages.count();
    expect(count).toBeGreaterThanOrEqual(10);

    // Verify specific country option has country-option class and flag
    const sloveniaOpt = menu.locator('.custom-select-option').filter({ hasText: 'Slovenija' }).first();
    await expect(sloveniaOpt).toHaveClass(/country-option/);
    const siFlag = sloveniaOpt.locator('.custom-select-country-flag');
    await expect(siFlag).toBeVisible();
    await expect(siFlag).toHaveAttribute('src', '/images/flags/si.svg');

    // Select Slovenija
    await sloveniaOpt.click();

    // Verify trigger now displays the country flag and styling
    await expect(trigger).toHaveClass(/country-selected/);
    const triggerFlag = trigger.locator('.custom-select-country-flag');
    await expect(triggerFlag).toBeVisible();
    await expect(triggerFlag).toHaveAttribute('src', '/images/flags/si.svg');
    await expect(trigger).toContainText('Slovenija');

    // Screenshot of country selected
    await page.screenshot({ path: 'scratch/country_test_screenshot.png' });
});
