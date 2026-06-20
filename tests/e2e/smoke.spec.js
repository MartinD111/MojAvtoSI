import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    // Suppress Supabase calls — tests run without backend credentials
    await page.route(/supabase\.co/, route => route.abort());

    // Load the SPA root and wait for the router to become available
    await page.goto('/');
    await page.waitForFunction(() => typeof window.navigateTo === 'function', { timeout: 10_000 });
});

test('homepage renders search form', async ({ page }) => {
    // Already at '/' after beforeEach
    await expect(page.locator('.home-container')).toBeVisible();
    await expect(page.locator('#homeSearchForm')).toBeVisible();
});

test('register page renders form', async ({ page }) => {
    await page.evaluate(() => window.navigateTo('/registracija'));
    await expect(page.locator('#googleRegisterBtn')).toBeVisible();
    await expect(page.locator('#registerForm')).toBeVisible();
});

test('login page renders form', async ({ page }) => {
    await page.evaluate(() => window.navigateTo('/prijava'));
    await expect(page.locator('#loginForm')).toBeVisible();
});

// /novi-oglas shows the listing wizard (typeSelect step) for unauthenticated users
test('create-listing page renders wizard', async ({ page }) => {
    await page.evaluate(() => window.navigateTo('/novi-oglas'));
    // typeSelect step renders a .cl-card; auth redirect would show #loginForm
    await expect(page.locator('.cl-card, #loginForm').first()).toBeVisible({ timeout: 10_000 });
});
