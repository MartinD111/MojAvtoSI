import { test, expect } from '@playwright/test';

test('debug BMW logo in trigger', async ({ page }) => {
    await page.route(/supabase\.co/, route => route.abort());
    await page.goto('/');
    await page.waitForFunction(() => typeof window.navigateTo === 'function', { timeout: 10_000 });
    await page.locator('#home-make option[value=BMW]').first().waitFor({ state: 'attached', timeout: 10_000 });
    const container = page.locator('.custom-select-container:has(+ #home-make)').first();
    const trigger = container.locator('.custom-select-trigger');
    await trigger.click();
    const menu = container.locator('.custom-select-menu');
    const bmwOption = menu.locator('.custom-select-option').filter({ hasText: 'BMW' }).first();
    await bmwOption.click();
    
    // Check HTML of trigger
    const triggerHtml = await trigger.innerHTML();
    console.log('TRIGGER HTML:', triggerHtml);

    // Check if img is visible or what bounding box it has
    const img = trigger.locator('img');
    const isVisible = await img.isVisible();
    const box = await img.boundingBox();
    console.log('IMG isVisible:', isVisible, 'boundingBox:', box);

    await trigger.screenshot({ path: 'scratch/bmw_trigger_debug.png' });
});
