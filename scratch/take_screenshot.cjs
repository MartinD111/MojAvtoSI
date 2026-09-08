const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 800 } });
  const filePath = 'file:///' + path.resolve('scratch/test_comparison.html').replace(/\\/g, '/');
  await page.goto(filePath);
  await page.screenshot({ path: 'scratch/comparison.png', fullPage: true });
  await browser.close();
  console.log('Comparison screenshot saved');
})();
