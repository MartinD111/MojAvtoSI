import { test, expect } from '@playwright/test';

test.use({ baseURL: 'http://localhost:4174' });

test.beforeEach(async ({ page }) => {
    await page.route(/supabase\.co/, route => route.abort());
    await page.goto('/');
    await page.waitForFunction(() => typeof window.navigateTo === 'function', { timeout: 10_000 });
});

test('brand logos render in MojaNavtika make dropdown and trigger', async ({ page }) => {
    // Wait for nautical vessel brands to load into #nav-home-make
    await page.locator('#nav-home-make option[value="Bavaria"]').first().waitFor({ state: 'attached', timeout: 10_000 });

    const container = page.locator('.custom-select-container:has(+ #nav-home-make)').first();
    const trigger = container.locator('.custom-select-trigger');
    const menu = container.locator('.custom-select-menu');

    // Click trigger to open dropdown
    await trigger.click();
    await expect(menu).toHaveClass(/open/);

    // Verify brand logos are rendered inside options
    const brandLogos = menu.locator('.custom-select-brand-logo');
    await expect(brandLogos.first()).toBeVisible();
    const count = await brandLogos.count();
    expect(count).toBeGreaterThan(10);

    // Click on Bavaria option
    const bavariaOption = menu.locator('.custom-select-option').filter({ hasText: 'Bavaria' }).first();
    await bavariaOption.click();

    // Verify trigger now displays the brand logo and text
    const triggerLogo = trigger.locator('.custom-select-brand-logo');
    await expect(triggerLogo).toBeVisible();
    await expect(trigger).toContainText('Bavaria');

    // Verify model dropdown was populated and enabled
    const modelContainer = page.locator('.custom-select-container:has(+ #nav-home-model)').first();
    await expect(modelContainer).not.toHaveClass(/disabled/);
});

test('brand logos update when switching MojaNavtika category to outboard engines', async ({ page }) => {
    // Wait for category options to attach
    await page.locator('#nav-home-cat option[value="izvenkrmni-motorji"]').first().waitFor({ state: 'attached', timeout: 10_000 });

    const catContainer = page.locator('.custom-select-container:has(+ #nav-home-cat)').first();
    const catTrigger = catContainer.locator('.custom-select-trigger');
    const catMenu = catContainer.locator('.custom-select-menu');

    // Click category dropdown and choose Izvenkrmni motorji
    await catTrigger.click();
    await expect(catMenu).toHaveClass(/open/);
    const engineOption = catMenu.locator('.custom-select-option').filter({ hasText: /Izvenkrmni motorji/i }).first();
    await engineOption.click();

    // Wait for engine brands like Yamaha / Tohatsu to load
    await page.locator('#nav-home-make option[value="Yamaha"]').first().waitFor({ state: 'attached', timeout: 10_000 });

    const container = page.locator('.custom-select-container:has(+ #nav-home-make)').first();
    const trigger = container.locator('.custom-select-trigger');
    const menu = container.locator('.custom-select-menu');

    await trigger.click();
    await expect(menu).toHaveClass(/open/);

    // Verify Yamaha option has a brand logo
    const yamahaOption = menu.locator('.custom-select-option').filter({ hasText: 'Yamaha' }).first();
    await expect(yamahaOption.locator('.custom-select-brand-logo')).toBeVisible();

    // Select Yamaha
    await yamahaOption.click();
    await expect(trigger.locator('.custom-select-brand-logo')).toBeVisible();
    await expect(trigger).toContainText('Yamaha');
});
