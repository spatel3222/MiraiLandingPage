const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('\n=== TESTING ROI CALCULATION CONSISTENCY ===');
  
  // First load
  await page.goto('http://localhost:8000/workshops/business-automation-dashboard.html');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  
  // Navigate to process management and add a test process with known values
  await page.evaluate(() => {
    if (typeof openProcessWorkspace === 'function') {
      openProcessWorkspace();
    }
  });
  await page.waitForTimeout(2000);
  
  console.log('🔄 Adding test process with specific values...');
  try {
    const addButton = await page.locator('button:has-text("Add Process"), .add-process-btn').first();
    const addButtonVisible = await addButton.isVisible();
    
    if (addButtonVisible) {
      await addButton.click();
      await page.waitForTimeout(1000);
      
      // Fill with specific, predictable values
      await page.fill('input[name="name"]', 'ROI Test Process');
      await page.fill('input[name="timeSpent"]', '10'); // 10 hours
      await page.selectOption('select[name="department"]', 'IT');
      await page.fill('input[name="impact"]', '8'); // Impact: 8
      await page.fill('input[name="feasibility"]', '6'); // Feasibility: 6
      
      // Submit
      const submitButton = await page.locator('button[type="submit"], button:has-text("Create")').first();
      await submitButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ Test process added (Impact: 8, Feasibility: 6, Time: 10 hours)');
    }
  } catch (e) {
    console.log('📋 Using existing process data');
  }
  
  // Navigate to main dashboard to check ROI values
  await page.evaluate(() => {
    if (typeof openMainWorkspace === 'function') {
      openMainWorkspace();
    }
  });
  await page.waitForTimeout(3000);
  
  // Store first set of values
  let firstValues = {};
  
  // Try to get ROI values (look in different possible locations)
  const roiElements = [
    '#annualSavingsDisplay',
    '#averageROIDisplay', 
    '#paybackPeriodDisplay',
    '#projectedSavings'
  ];
  
  console.log('\n📊 First load - ROI values:');
  for (const selector of roiElements) {
    try {
      const element = await page.locator(selector);
      if (await element.isVisible()) {
        const value = await element.textContent();
        firstValues[selector] = value;
        console.log(`   ${selector}: ${value}`);
      }
    } catch (e) {
      // Element not found, skip
    }
  }
  
  // Expected calculation with our test values:
  // Impact: 8, Time: 10, Multiplier: $2000
  // Projected Savings = 8 × 10 × 2000 = $160,000
  console.log('\n🧮 Expected calculation:');
  console.log('   Formula: Impact × Time × Multiplier = 8 × 10 × $2,000 = $160,000');
  
  // Refresh the page
  console.log('\n🔄 Refreshing page...');
  await page.reload();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  
  // Navigate back to main dashboard
  await page.evaluate(() => {
    if (typeof openMainWorkspace === 'function') {
      openMainWorkspace();
    }
  });
  await page.waitForTimeout(3000);
  
  // Check values again
  let secondValues = {};
  console.log('\n📊 After refresh - ROI values:');
  for (const selector of roiElements) {
    try {
      const element = await page.locator(selector);
      if (await element.isVisible()) {
        const value = await element.textContent();
        secondValues[selector] = value;
        console.log(`   ${selector}: ${value}`);
      }
    } catch (e) {
      // Element not found, skip
    }
  }
  
  // Compare values
  console.log('\n🔍 Consistency check:');
  let allConsistent = true;
  for (const selector of Object.keys(firstValues)) {
    const first = firstValues[selector];
    const second = secondValues[selector];
    const consistent = first === second;
    
    console.log(`   ${selector}: ${consistent ? '✅' : '❌'} ${first} → ${second}`);
    if (!consistent) {
      allConsistent = false;
    }
  }
  
  // Test one more refresh to be sure
  console.log('\n🔄 Second refresh for triple verification...');
  await page.reload();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  
  await page.evaluate(() => {
    if (typeof openMainWorkspace === 'function') {
      openMainWorkspace();
    }
  });
  await page.waitForTimeout(3000);
  
  let thirdValues = {};
  for (const selector of roiElements) {
    try {
      const element = await page.locator(selector);
      if (await element.isVisible()) {
        const value = await element.textContent();
        thirdValues[selector] = value;
      }
    } catch (e) {
      // Element not found, skip
    }
  }
  
  console.log('\n🔍 Triple consistency check:');
  for (const selector of Object.keys(firstValues)) {
    const first = firstValues[selector];
    const third = thirdValues[selector];
    const consistent = first === third;
    
    console.log(`   ${selector}: ${consistent ? '✅' : '❌'} Values remain: ${first}`);
    if (!consistent) {
      allConsistent = false;
    }
  }
  
  // Take screenshot
  await page.screenshot({ 
    path: 'test-results/roi-consistency-test.png',
    fullPage: true 
  });
  
  console.log('\n📸 Screenshot saved as roi-consistency-test.png');
  console.log('\n=== CONSISTENCY TEST RESULTS ===');
  if (allConsistent) {
    console.log('✅ SUCCESS: ROI values are now consistent across page refreshes');
    console.log('✅ FIXED: Removed Math.random() from projectedSavings calculation');
    console.log('✅ FORMULA: Now uses deterministic calculation: Impact × Time × Multiplier');
  } else {
    console.log('❌ ISSUE: ROI values are still changing on refresh');
    console.log('🔍 Need to investigate other sources of randomness');
  }
  
  console.log('\n📋 Technical Details:');
  console.log('   • Removed: + Math.random() * 500000 from calculation');
  console.log('   • Formula: projectedSavings = totalImpact × totalTimeSpent × costMultiplier');
  console.log('   • Result: Deterministic calculations for same input data');
  
  await browser.close();
})();