const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:8000/workshops/business-automation-dashboard.html');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  
  // Open settings panel
  await page.locator('.settings-trigger').click();
  await page.waitForTimeout(1000);
  
  // Take screenshot of the settings layout
  await page.screenshot({ 
    path: 'test-results/settings-layout-separated.png',
    fullPage: false 
  });
  
  console.log('Settings layout screenshot taken!');
  
  await browser.close();
})();