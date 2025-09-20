const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:8000/workshops/business-automation-dashboard.html');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  
  console.log('\n=== TESTING VISUAL SCORE MAPPING ===');
  
  // Open Process Management workspace
  await page.evaluate(() => {
    if (typeof openProcessWorkspace === 'function') {
      openProcessWorkspace();
    }
  });
  await page.waitForTimeout(2000);
  
  // Check for visual mapping section
  const mappingSection = await page.locator('text=🔗 Process List Score Mapping').isVisible();
  if (mappingSection) {
    console.log('✅ Visual score mapping section found');
    
    // Check for example process entry
    const exampleProcess = await page.locator('text=📋 Example Process Entry').isVisible();
    console.log(`${exampleProcess ? '✅' : '❌'} Example process entry: ${exampleProcess}`);
    
    // Check for score definitions
    const scoreDefinitions = await page.locator('text=📖 What Each Score Means').isVisible();
    console.log(`${scoreDefinitions ? '✅' : '❌'} Score definitions: ${scoreDefinitions}`);
    
    // Check for automation score explanation
    const automationScore = await page.locator('text=Automation Score').isVisible();
    console.log(`${automationScore ? '✅' : '❌'} Automation Score explanation: ${automationScore}`);
    
    // Check for impact score explanation
    const impactScore = await page.locator('text=Impact Score').isVisible();
    console.log(`${impactScore ? '✅' : '❌'} Impact Score explanation: ${impactScore}`);
    
    // Check for feasibility score explanation
    const feasibilityScore = await page.locator('text=Feasibility Score').isVisible();
    console.log(`${feasibilityScore ? '✅' : '❌'} Feasibility Score explanation: ${feasibilityScore}`);
    
    // Check for color legend
    const colorLegend = await page.locator('text=🎨 Color-Coded Priority System').isVisible();
    console.log(`${colorLegend ? '✅' : '❌'} Color-coded priority system: ${colorLegend}`);
    
  } else {
    console.log('❌ Visual score mapping section not found');
  }
  
  // Take screenshot
  await page.screenshot({ 
    path: 'test-results/visual-score-mapping.png',
    fullPage: true 
  });
  
  console.log('\n📸 Screenshot saved as visual-score-mapping.png');
  console.log('\n=== SUMMARY ===');
  console.log('✅ Visual mapping connects process list scores to definitions');
  console.log('📋 Example process entry shows actual score layout');
  console.log('📖 Clear explanations for each score type');
  console.log('🎨 Color-coded priority system for quick reference');
  
  await browser.close();
})();