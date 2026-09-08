import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.route(/supabase\.co/, route => route.abort());
    await page.goto('/');
    await page.waitForFunction(() => typeof window.navigateTo === 'function', { timeout: 10_000 });
});

test('brand logos render in car make dropdown and trigger', async ({ page }) => {
    // Wait for car brands to load
    await page.locator('#home-make option[value="Audi"]').first().waitFor({ state: 'attached', timeout: 10_000 });

    const container = page.locator('.custom-select-container:has(+ #home-make)').first();
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

    // Click on Audi option
    const audiOption = menu.locator('.custom-select-option').filter({ hasText: 'Audi' }).first();
    await audiOption.click();

    // Verify trigger now displays the brand logo and text
    const triggerLogo = trigger.locator('.custom-select-brand-logo');
    await expect(triggerLogo).toBeVisible();
    await expect(trigger).toContainText('Audi');
});

test('brand logos render for motorbikes and commercial vehicles', async ({ page }) => {
    // 1. Switch to Motorji tab
    const motoTab = page.locator('.tab-btn[data-category="motor"]');
    await motoTab.click();

    // Wait for moto brands to be fetched and loaded into the select
    await page.locator('#home-make option[value="Yamaha"]').first().waitFor({ state: 'attached', timeout: 10_000 });

    const container = page.locator('.custom-select-container:has(+ #home-make)').first();
    const trigger = container.locator('.custom-select-trigger');
    const menu = container.locator('.custom-select-menu');

    await trigger.click();
    await expect(menu).toHaveClass(/open/);

    // Verify Yamaha has a logo
    const yamahaOption = menu.locator('.custom-select-option').filter({ hasText: 'Yamaha' }).first();
    await expect(yamahaOption.locator('.custom-select-brand-logo')).toBeVisible();

    // Select Yamaha
    await yamahaOption.click();
    await expect(trigger.locator('.custom-select-brand-logo')).toBeVisible();
    await expect(trigger).toContainText('Yamaha');

    // 2. Switch to Gospodarska tab
    const gospTab = page.locator('.tab-btn[data-category="gospodarska"]');
    await gospTab.click();

    // Wait for commercial vehicle brands to be fetched and loaded
    await page.locator('#home-make option[value="MAN"]').first().waitFor({ state: 'attached', timeout: 10_000 });

    await trigger.click();
    await expect(menu).toHaveClass(/open/);

    // Verify MAN has a logo
    const manOption = menu.locator('.custom-select-option').filter({ hasText: 'MAN' }).first();
    await expect(manOption.locator('.custom-select-brand-logo')).toBeVisible();

    // Select MAN
    await manOption.click();
    await expect(trigger.locator('.custom-select-brand-logo')).toBeVisible();
    await expect(trigger).toContainText('MAN');
});

test('motorcycle dropdown renders newly added brand logos and popular brands', async ({ page }) => {
    // Switch to Motorji tab
    const motoTab = page.locator('.tab-btn[data-category="motor"]');
    await motoTab.click();

    // Wait for moto brands to be fetched and loaded into the select
    await page.locator('#home-make option[value="Cagiva"]').first().waitFor({ state: 'attached', timeout: 10_000 });

    const container = page.locator('.custom-select-container:has(+ #home-make)').first();
    const trigger = container.locator('.custom-select-trigger');
    const menu = container.locator('.custom-select-menu');

    await trigger.click();
    await expect(menu).toHaveClass(/open/);

    // Verify popular brands include BMW Motorrad and CFMoto
    const bmwOption = menu.locator('.custom-select-option[data-popular="true"]').filter({ hasText: 'BMW Motorrad' }).first();
    await expect(bmwOption).toBeVisible();
    await expect(bmwOption.locator('.custom-select-brand-logo')).toBeVisible();

    const cfOption = menu.locator('.custom-select-option[data-popular="true"]').filter({ hasText: 'CFMoto' }).first();
    await expect(cfOption).toBeVisible();
    await expect(cfOption.locator('.custom-select-brand-logo')).toBeVisible();

    // Verify multiple other previously-missing motorcycle brands have visible logos
    const checkBrands = ['Cagiva', 'Gilera', 'Buell', 'Lambretta', 'Moto Morini', 'Norton', 'Rieju', 'Sherco', 'SWM', 'TM', 'Ural', 'Zündapp'];
    for (const b of checkBrands) {
        const opt = menu.locator('.custom-select-option').filter({ hasText: b }).first();
        await expect(opt).toBeAttached();
        const logo = opt.locator('.custom-select-brand-logo');
        await expect(logo).toBeAttached();
    }
});

test('search bar filters options correctly and renders car logos for Winton and Wolseley', async ({ page }) => {
    // Wait for car brands to load
    await page.locator('#home-make option[value="Audi"]').first().waitFor({ state: 'attached', timeout: 10_000 });

    const container = page.locator('.custom-select-container:has(+ #home-make)').first();
    const trigger = container.locator('.custom-select-trigger');
    const menu = container.locator('.custom-select-menu');
    const searchInput = menu.locator('.custom-select-search');

    await trigger.click();
    await expect(menu).toHaveClass(/open/);

    // 1. Search for Winton
    await searchInput.fill('winton');
    const wintonOption = menu.locator('.custom-select-option').filter({ hasText: 'Winton' }).first();
    await expect(wintonOption).toBeVisible();
    await expect(wintonOption.locator('.custom-select-brand-logo')).toBeVisible();

    // Verify other brands like Audi and BMW are hidden
    const audiOption = menu.locator('.custom-select-option').filter({ hasText: 'Audi' }).first();
    await expect(audiOption).not.toBeVisible();

    // 2. Search for Wolseley
    await searchInput.fill('wolseley');
    const wolseleyOption = menu.locator('.custom-select-option').filter({ hasText: 'Wolseley' }).first();
    await expect(wolseleyOption).toBeVisible();
    await expect(wolseleyOption.locator('.custom-select-brand-logo')).toBeVisible();
    await expect(wintonOption).not.toBeVisible();

    // 3. Search with diacritics: typing "skoda" matches "Škoda"
    await searchInput.fill('skoda');
    const skodaOption = menu.locator('.custom-select-option:not([data-popular="true"])').filter({ hasText: 'Škoda' }).first();
    await expect(skodaOption).toBeVisible();
    await expect(skodaOption.locator('.custom-select-brand-logo')).toBeVisible();

    // 4. Click Wolseley and verify trigger displays logo
    await searchInput.fill('wolseley');
    await expect(wolseleyOption).toBeVisible();
    await wolseleyOption.click();
    await expect(trigger.locator('.custom-select-brand-logo')).toBeVisible();
    await expect(trigger).toContainText('Wolseley');
});

test('popular brands include BMW, Polestar, Jaecoo, and custom logos render for Bristol, Devon, Dome', async ({ page }) => {
    await page.locator('#home-make option[value="BMW"]').first().waitFor({ state: 'attached', timeout: 10_000 });

    const container = page.locator('.custom-select-container:has(+ #home-make)').first();
    const trigger = container.locator('.custom-select-trigger');
    const menu = container.locator('.custom-select-menu');
    const searchInput = menu.locator('.custom-select-search');

    await trigger.click();
    await expect(menu).toHaveClass(/open/);

    // 1. Verify BMW and Polestar are in the popular section
    const bmwPopular = menu.locator('.custom-select-option[data-popular="true"]').filter({ hasText: 'BMW' }).first();
    await expect(bmwPopular).toBeVisible();
    await expect(bmwPopular.locator('.custom-select-brand-logo')).toBeVisible();

    const polestarPopular = menu.locator('.custom-select-option[data-popular="true"]').filter({ hasText: 'Polestar' }).first();
    await expect(polestarPopular).toBeVisible();
    await expect(polestarPopular.locator('.custom-select-brand-logo')).toBeVisible();

    const jaecooPopular = menu.locator('.custom-select-option[data-popular="true"]').filter({ hasText: 'Jaecoo' }).first();
    await expect(jaecooPopular).toBeVisible();
    await expect(jaecooPopular.locator('.custom-select-brand-logo')).toBeVisible();

    // 2. Search for Bristol and verify logo renders
    await searchInput.fill('bristol');
    const bristolOption = menu.locator('.custom-select-option').filter({ hasText: 'Bristol' }).first();
    await expect(bristolOption).toBeVisible();
    await expect(bristolOption.locator('.custom-select-brand-logo')).toBeVisible();

    // 3. Search for Devon and verify logo renders
    await searchInput.fill('devon');
    const devonOption = menu.locator('.custom-select-option').filter({ hasText: 'Devon' }).first();
    await expect(devonOption).toBeVisible();
    await expect(devonOption.locator('.custom-select-brand-logo')).toBeVisible();

    // 4. Search for Dome and verify logo renders
    await searchInput.fill('dome');
    const domeOption = menu.locator('.custom-select-option').filter({ hasText: 'Dome' }).first();
    await expect(domeOption).toBeVisible();
    await expect(domeOption.locator('.custom-select-brand-logo')).toBeVisible();

    // 5. Select Polestar and verify trigger logo
    await searchInput.fill('polestar');
    const polestarOption = menu.locator('.custom-select-option:not([data-popular="true"])').filter({ hasText: 'Polestar' }).first();
    await expect(polestarOption).toBeVisible();
    await polestarOption.click();
    await expect(trigger.locator('.custom-select-brand-logo')).toBeVisible();
    await expect(trigger).toContainText('Polestar');
});



