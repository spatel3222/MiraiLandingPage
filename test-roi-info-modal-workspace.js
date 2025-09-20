const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:8000/workshops/business-automation-dashboard.html');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  
  console.log('\n=== TESTING ROI INFO IN DIFFERENT WORKSPACES ===');
  
  // Try Process Management workspace first
  await page.evaluate(() => {
    if (typeof openProcessWorkspace === 'function') {
      openProcessWorkspace();
    }
  });
  await page.waitForTimeout(2000);
  
  console.log('\n📋 In Process Management workspace:');
  
  // Check if info icon is present
  const infoIcon = await page.locator('.info-icon').isVisible();
  console.log(`${infoIcon ? '✅' : '❌'} Info icon visible: ${infoIcon}`);
  
  // Check if ROI stats section exists
  const roiStats = await page.locator('.roi-stats').isVisible();
  console.log(`${roiStats ? '✅' : '❌'} ROI stats section visible: ${roiStats}`);
  
  if (roiStats) {
    // Check individual ROI elements
    const annualSavingsElement = await page.locator('#annualSavingsDisplay').isVisible();
    console.log(`${annualSavingsElement ? '✅' : '❌'} Annual savings display: ${annualSavingsElement}`);
    
    const averageROIElement = await page.locator('#averageROIDisplay').isVisible();
    console.log(`${averageROIElement ? '✅' : '❌'} Average ROI display: ${averageROIElement}`);
    
    const paybackPeriodElement = await page.locator('#paybackPeriodDisplay').isVisible();
    console.log(`${paybackPeriodElement ? '✅' : '❌'} Payback period display: ${paybackPeriodElement}`);
    
    if (infoIcon) {
      // Test the modal
      await page.click('.info-icon');
      await page.waitForTimeout(1000);
      
      const modal = await page.locator('#roiInfoModal').isVisible();
      console.log(`${modal ? '✅' : '❌'} Modal opens: ${modal}`);
      
      if (modal) {
        const modalTitle = await page.locator('h2:has-text("Annual Savings Calculation")').isVisible();
        console.log(`${modalTitle ? '✅' : '❌'} Modal content loaded: ${modalTitle}`);
        
        // Close modal and test functionality
        await page.click('button[onclick="closeROIInfoModal()"]');
        await page.waitForTimeout(500);
      }
    }
    
    // Get current values
    if (annualSavingsElement) {
      const savingsText = await page.textContent('#annualSavingsDisplay');
      console.log(`💰 Annual savings value: ${savingsText}`);
    }
  }
  
  // Try main dashboard workspace
  console.log('\n🏠 Trying main dashboard workspace:');
  await page.evaluate(() => {
    if (typeof openMainWorkspace === 'function') {
      openMainWorkspace();
    }
  });
  await page.waitForTimeout(2000);
  
  const mainRoiStats = await page.locator('.roi-stats').isVisible();
  console.log(`${mainRoiStats ? '✅' : '❌'} ROI stats in main workspace: ${mainRoiStats}`);
  
  // Take screenshot
  await page.screenshot({ 
    path: 'test-results/roi-info-workspace-test.png',
    fullPage: true 
  });
  
  console.log('\n📸 Screenshot saved as roi-info-workspace-test.png');
  
  await browser.close();
})();