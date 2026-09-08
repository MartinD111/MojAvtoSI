const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // Route supabase to avoid network wait
  await page.route(/supabase\.co/, route => route.abort());

  // Go to home page
  await page.goto('http://localhost:5173/');
  await page.waitForFunction(() => typeof window.navigateTo === 'function', { timeout: 10000 });

  // Wait for country select to be initialized
  const container = page.locator('.custom-select-container:has(+ #home-country)').first();
  await container.waitFor({ state: 'visible', timeout: 10000 });

  const trigger = container.locator('.custom-select-trigger');
  await trigger.click();

  const menu = container.locator('.custom-select-menu');
  await menu.waitFor({ state: 'visible' });

  // Wait a bit for animations and images
  await page.waitForTimeout(600);

  // Take screenshot of search card area
  const searchBox = page.locator('#homeSearchForm');
  const screenshotPath = path.resolve('scratch/country_dropdown_preview.png');
  await page.screenshot({ path: screenshotPath, clip: { x: 100, y: 300, width: 850, height: 600 } });
  console.log('Screenshot saved to', screenshotPath);

  // Also select Slovenia and take a screenshot of the trigger
  const sloveniaOpt = menu.locator('.custom-select-option').filter({ hasText: 'Slovenija' }).first();
  await sloveniaOpt.click();
  await page.waitForTimeout(400);

  const selectedScreenshotPath = path.resolve('scratch/country_selected_preview.png');
  await page.screenshot({ path: selectedScreenshotPath, clip: { x: 100, y: 400, width: 850, height: 350 } });
  console.log('Selected screenshot saved to', selectedScreenshotPath);

  await browser.close();
})();
