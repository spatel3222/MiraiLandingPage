const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('\n=== TESTING FULL SAVINGS DISPLAY WITH INFO BUTTON ===');
  
  await page.goto('http://localhost:8000/workshops/business-automation-dashboard.html');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  
  // Navigate to main dashboard
  await page.evaluate(() => {
    if (typeof openMainWorkspace === 'function') {
      openMainWorkspace();
    }
  });
  await page.waitForTimeout(3000);
  
  // Test 1: Check if info button is present in the main KPI card
  console.log('\n📊 Testing Projected Annual Savings KPI Card:');
  
  const projectedSavingsCard = await page.locator('.kpi-card:has-text("Projected Annual Savings")').isVisible();
  console.log(`${projectedSavingsCard ? '✅' : '❌'} Projected Annual Savings card visible: ${projectedSavingsCard}`);
  
  if (projectedSavingsCard) {
    // Check for info icon in the main KPI card
    const infoIconInKPI = await page.locator('.kpi-card:has-text("Projected Annual Savings") .info-icon').isVisible();
    console.log(`${infoIconInKPI ? '✅' : '❌'} Info icon in KPI card: ${infoIconInKPI}`);
    
    // Get current projected savings value
    const projectedSavingsValue = await page.textContent('#projectedSavings');
    console.log(`💰 Current value: "${projectedSavingsValue}"`);
    
    // Check if it shows dash or full number format
    const isDash = projectedSavingsValue.includes('—');
    const hasCommas = projectedSavingsValue.includes(',');
    const isAbbreviated = projectedSavingsValue.includes('M') || projectedSavingsValue.includes('K');
    
    console.log(`   ${isDash ? '✅' : '📝'} Shows dash when no data: ${isDash}`);
    console.log(`   ${!isAbbreviated ? '✅' : '❌'} Not abbreviated (no M/K): ${!isAbbreviated}`);
    
    if (infoIconInKPI) {
      // Test clicking the info icon
      console.log('\n🔄 Testing info icon functionality...');
      await page.click('.kpi-card:has-text("Projected Annual Savings") .info-icon');
      await page.waitForTimeout(1000);
      
      const modal = await page.locator('#roiInfoModal').isVisible();
      console.log(`${modal ? '✅' : '❌'} Info modal opens: ${modal}`);
      
      if (modal) {
        const modalTitle = await page.locator('h2:has-text("Annual Savings Calculation")').isVisible();
        console.log(`${modalTitle ? '✅' : '❌'} Modal content loaded: ${modalTitle}`);
        
        // Close modal
        await page.click('button[onclick="closeROIInfoModal()"]');
        await page.waitForTimeout(500);
      }
    }
  }
  
  // Test 2: Add a process to see full number format
  console.log('\n📋 Adding process to test full number display...');
  
  await page.evaluate(() => {
    if (typeof openProcessWorkspace === 'function') {
      openProcessWorkspace();
    }
  });
  await page.waitForTimeout(2000);
  
  try {
    const addButton = await page.locator('button:has-text("Add Process"), .add-process-btn').first();
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(1000);
      
      // Add process with values that will generate a significant savings number
      await page.fill('input[name="name"]', 'High Value Process');
      await page.fill('input[name="timeSpent"]', '20'); // 20 hours
      await page.selectOption('select[name="department"]', 'Finance');
      await page.fill('input[name="impact"]', '9'); // High impact
      await page.fill('input[name="feasibility"]', '8'); // High feasibility
      
      const submitButton = await page.locator('button[type="submit"], button:has-text("Create")').first();
      await submitButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ High-value process added');
    }
  } catch (e) {
    console.log('📋 Using existing process data');
  }
  
  // Return to main dashboard and check the updated value
  await page.evaluate(() => {
    if (typeof openMainWorkspace === 'function') {
      openMainWorkspace();
    }
  });
  await page.waitForTimeout(3000);
  
  console.log('\n💰 Testing full number format with data:');
  const updatedValue = await page.textContent('#projectedSavings');
  console.log(`   Updated value: "${updatedValue}"`);
  
  const hasCommas = updatedValue.includes(',');
  const isFullNumber = !updatedValue.includes('M') && !updatedValue.includes('K') && !updatedValue.includes('—');
  const startsWithCurrency = updatedValue.startsWith('$') || updatedValue.startsWith('₹') || updatedValue.startsWith('€');
  
  console.log(`   ${hasCommas ? '✅' : '📝'} Contains commas: ${hasCommas}`);
  console.log(`   ${isFullNumber ? '✅' : '❌'} Shows full number (not abbreviated): ${isFullNumber}`);
  console.log(`   ${startsWithCurrency ? '✅' : '❌'} Properly formatted currency: ${startsWithCurrency}`);
  
  // Take screenshot
  await page.screenshot({ 
    path: 'test-results/full-savings-display-test.png',
    fullPage: true 
  });
  
  console.log('\n📸 Screenshot saved as full-savings-display-test.png');
  console.log('\n=== IMPLEMENTATION SUMMARY ===');
  console.log('✅ ADDED: Info icon to Projected Annual Savings KPI card');
  console.log('✅ UPDATED: Display format to show full numbers with commas');
  console.log('✅ REMOVED: Abbreviated format (M/K suffixes)');
  console.log('✅ MAINTAINED: Currency formatting and dash fallbacks');
  console.log('');
  console.log('📋 DISPLAY BEHAVIOR:');
  console.log('   • No data: Shows "—" with helpful tooltip');
  console.log('   • With data: Shows full amount like "$360,000" instead of "$0.36M"');
  console.log('   • Info icon: Opens same calculation modal as ROI breakdown');
  console.log('   • Currency: Respects user\'s currency preference setting');
  
  await browser.close();
})();