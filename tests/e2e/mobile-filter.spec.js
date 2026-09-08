import { test, expect } from '@playwright/test';

test.describe('Mobile Filter Dropdown Behavior', () => {
    test.use({
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
    });

    test.beforeEach(async ({ page }) => {
        await page.route(/supabase\.co/, route => route.abort());
        await page.goto('/');
        await page.waitForFunction(() => typeof window.navigateTo === 'function', { timeout: 10_000 });
    });

    test('mobile layout renders brand with proper spacing in trigger', async ({ page }) => {
        await page.locator('#home-make option[value=Cadillac]').first().waitFor({ state: 'attached', timeout: 10_000 });
        const container = page.locator('.custom-select-container:has(+ #home-make)').first();
        const trigger = container.locator('.custom-select-trigger');
        await trigger.click();
        const menu = container.locator('.custom-select-menu');
        await expect(menu).toBeVisible();
        const cadillacOption = menu.locator('.custom-select-option').filter({ hasText: 'Cadillac' }).first();
        await cadillacOption.click();
        await expect(trigger).toContainText('Cadillac');
        const searchBox = page.locator('#homeSearchForm');
        await searchBox.screenshot({ path: 'scratch/mobile_cadillac_trigger_spacing.png' });
    });
});
