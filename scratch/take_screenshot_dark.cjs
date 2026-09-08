const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
  await page.goto('file:///' + path.resolve('scratch/test_dark.html').replace(/\\/g, '/'));
  await page.screenshot({ path: 'scratch/dark_comparison.png', fullPage: true });
  await browser.close();
  console.log('Dark screenshot saved');
})();
