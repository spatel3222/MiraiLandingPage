const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:8000/workshops/business-automation-dashboard.html');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  
  console.log('\n=== TESTING WORKSPACE PROJECT INDICATOR ===');
  
  // Open Process Management workspace
  await page.evaluate(() => {
    if (typeof openProcessWorkspace === 'function') {
      openProcessWorkspace();
    }
  });
  await page.waitForTimeout(2000);
  
  // Check for workspace project indicator in header
  const projectIndicator = await page.locator('.workspace-project-indicator').isVisible();
  if (projectIndicator) {
    console.log('✅ Workspace project indicator found in header');
    
    // Check project name
    const projectName = await page.locator('#workspaceProjectName').textContent();
    console.log('📋 Active project:', projectName);
    
    // Check indicator elements
    const projectDot = await page.locator('.workspace-project-dot').isVisible();
    const projectLabel = await page.locator('.workspace-project-label').isVisible();
    
    console.log(`${projectDot ? '✅' : '❌'} Project dot: ${projectDot ? 'Visible' : 'Not visible'}`);
    console.log(`${projectLabel ? '✅' : '❌'} Project label: ${projectLabel ? 'Visible' : 'Not visible'}`);
  } else {
    console.log('❌ Workspace project indicator not found in header');
  }
  
  // Take screenshot
  await page.screenshot({ 
    path: 'test-results/workspace-project-indicator.png',
    fullPage: true 
  });
  
  console.log('\n📸 Screenshot saved as workspace-project-indicator.png');
  
  await browser.close();
})();