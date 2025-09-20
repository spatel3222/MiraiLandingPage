const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:8000/workshops/business-automation-dashboard.html');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(4000);
  
  console.log('\n=== TESTING CURRENCY CONVERSION WITH SAMPLE DATA ===');
  
  // First, let's add some sample processes via JavaScript
  await page.evaluate(() => {
    // Add sample processes with potential savings
    window.processes = [
      {
        id: 'test1',
        name: 'Invoice Processing',
        potentialSavings: 500000, // $500k
        impact: 8,
        complexity: 4
      },
      {
        id: 'test2', 
        name: 'Data Entry Automation',
        potentialSavings: 750000, // $750k
        impact: 7,
        complexity: 3
      }
    ];
    
    // Set current project
    window.currentProject = {
      id: 'test-project',
      name: 'Test Project'
    };
    
    console.log('💾 Added sample processes with total savings:', window.processes.reduce((sum, p) => sum + p.potentialSavings, 0));
  });
  
  // Force refresh the displays
  await page.evaluate(() => {
    if (typeof refreshAllMonetaryDisplays === 'function') {
      refreshAllMonetaryDisplays();
    }
  });
  
  await page.waitForTimeout(2000);
  
  // Check initial display (should show some value now)
  let projectedSavings = await page.locator('#projectedSavings').textContent();
  console.log('Initial projected savings with data:', projectedSavings);
  
  // Test currency conversion
  console.log('\n🔄 Testing USD → INR conversion...');
  
  // Open settings
  await page.locator('.settings-trigger').click();
  await page.waitForTimeout(1000);
  
  // Change to INR
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
    
    // Test the conversion amount
    const numericValue = projectedSavings.replace(/[₹,M]/g, '');
    const expectedValue = 1.25 * 83; // $1.25M * 83 INR/USD ≈ ₹104M
    console.log(`Expected around ₹${expectedValue.toFixed(0)}M, got: ${projectedSavings}`);
    
  } else {
    console.log('❌ FAILED: Currency symbol did not change to ₹');
  }
  
  // Test EUR conversion
  console.log('\n🔄 Testing INR → EUR conversion...');
  
  await page.locator('.settings-trigger').click();
  await page.waitForTimeout(1000);
  
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
    path: 'test-results/currency-conversion-with-data.png',
    fullPage: true 
  });
  
  console.log('\n📸 Screenshot saved as currency-conversion-with-data.png');
  
  await browser.close();
})();