const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:8000/workshops/business-automation-dashboard.html');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(4000);
  
  console.log('\n=== TESTING CURRENCY CONVERSION ON DASHBOARD ===');
  
  // Check initial display
  let projectedSavings = await page.locator('#projectedSavings').textContent();
  console.log('Initial projected savings:', projectedSavings);
  
  // Open settings
  await page.locator('.settings-trigger').click();
  await page.waitForTimeout(1000);
  
  // Change to INR
  console.log('\n🔄 Changing currency to INR...');
  await page.locator('#currencySelector').selectOption('INR');
  await page.waitForTimeout(1000);
  
  // Close settings
  await page.locator('.settings-close-btn').click();
  await page.waitForTimeout(2000);
  
  // Check if display changed
  projectedSavings = await page.locator('#projectedSavings').textContent();
  console.log('After changing to INR:', projectedSavings);
  
  if (projectedSavings.includes('₹')) {
    console.log('✅ SUCCESS: Currency symbol changed to ₹');
  } else {
    console.log('❌ FAILED: Currency symbol did not change to ₹');
  }
  
  // Change to EUR to test another currency
  await page.locator('.settings-trigger').click();
  await page.waitForTimeout(1000);
  
  console.log('\n🔄 Changing currency to EUR...');
  await page.locator('#currencySelector').selectOption('EUR');
  await page.waitForTimeout(1000);
  
  await page.locator('.settings-close-btn').click();
  await page.waitForTimeout(2000);
  
  projectedSavings = await page.locator('#projectedSavings').textContent();
  console.log('After changing to EUR:', projectedSavings);
  
  if (projectedSavings.includes('€')) {
    console.log('✅ SUCCESS: Currency symbol changed to €');
  } else {
    console.log('❌ FAILED: Currency symbol did not change to €');
  }
  
  // Take screenshot for verification
  await page.screenshot({ 
    path: 'test-results/currency-conversion-test.png',
    fullPage: true 
  });
  
  console.log('\n📸 Screenshot saved as currency-conversion-test.png');
  
  await browser.close();
})();