const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false }); // Show browser
  const page = await browser.newPage();
  
  console.log('\n=== CHECKING testSept14 PROJECT AND DEPARTMENTS ===');
  
  await page.goto('http://localhost:8000/workshops/business-automation-dashboard.html');
  await page.waitForLoadState('networkidle'); // Wait for all network requests
  await page.waitForTimeout(5000);
  
  console.log('\n📊 Step 1: Check current project');
  
  // Get the project selector text
  const projectSelectorElement = await page.locator('#currentProject, .project-selector').first();
  const projectText = await projectSelectorElement.textContent();
  console.log(`   Project selector shows: "${projectText.trim()}"`);
  
  // Check if testSept14 is mentioned
  const hasTestSept14 = projectText.toLowerCase().includes('testsept14');
  console.log(`   testSept14 mentioned: ${hasTestSept14 ? '✅' : '❌'}`);
  
  if (hasTestSept14) {
    console.log('\n🔄 Step 2: Click on testSept14 to select it');
    
    // Try clicking on testSept14 text directly
    try {
      await page.click('text=testSept14');
      await page.waitForTimeout(3000);
      console.log('   ✅ Clicked on testSept14');
    } catch (e) {
      console.log('   ❌ Could not click testSept14 directly');
      
      // Try alternative: click the project selector then testSept14
      try {
        await projectSelectorElement.click();
        await page.waitForTimeout(1000);
        await page.click('text=testSept14');
        await page.waitForTimeout(3000);
        console.log('   ✅ Selected testSept14 from dropdown');
      } catch (e2) {
        console.log('   ❌ Could not select from dropdown either');
      }
    }
  }
  
  console.log('\n📋 Step 3: Open Process Management to check processes');
  
  // Try different ways to open Process Management
  const processManagementSelectors = [
    'button:has-text("Process Management")',
    'text=Process Management',
    '.workspace-card:has-text("Process Management")',
    '[onclick*="openProcessWorkspace"]'
  ];
  
  let processWorkspaceOpened = false;
  for (const selector of processManagementSelectors) {
    try {
      const element = await page.locator(selector).first();
      if (await element.isVisible()) {
        await element.click();
        await page.waitForTimeout(3000);
        console.log(`   ✅ Opened Process Management using: ${selector}`);
        processWorkspaceOpened = true;
        break;
      }
    } catch (e) {
      // Try next selector
    }
  }
  
  if (processWorkspaceOpened) {
    // Check what's in the Process Management workspace
    const processListContent = await page.locator('.process-list, .workspace-content').first().textContent();
    console.log(`   Process workspace content preview: "${processListContent.substring(0, 200)}..."`);
    
    // Count processes
    const processCount = await page.locator('.process-item, .process-card, .process-row').count();
    console.log(`   Number of processes: ${processCount}`);
    
    if (processCount > 0) {
      console.log('\n📊 Process details:');
      
      // Get first process details
      const firstProcess = await page.locator('.process-item, .process-card').first();
      const processText = await firstProcess.textContent();
      console.log(`   First process: "${processText.substring(0, 150)}..."`);
      
      // Look for department information
      const hasDepartment = processText.toLowerCase().includes('department') || 
                           processText.includes('Finance') || 
                           processText.includes('Marketing') ||
                           processText.includes('Sales') ||
                           processText.includes('IT');
      console.log(`   Has department info: ${hasDepartment ? '✅' : '❌'}`);
    }
    
    // Go back to main dashboard
    console.log('\n🏠 Step 4: Return to main dashboard');
    
    // Try to close the workspace
    const closeSelectors = [
      'button:has-text("×")',
      'button:has-text("Close")',
      '.back-button',
      '[onclick*="closeWorkspace"]',
      '.workspace-back-btn'
    ];
    
    for (const selector of closeSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          await element.click();
          await page.waitForTimeout(2000);
          console.log(`   ✅ Closed workspace using: ${selector}`);
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
  }
  
  console.log('\n🏢 Step 5: Check Department Rankings');
  
  // Scroll page to find department section
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  
  // Look for department section with various selectors
  const departmentSelectors = [
    '.analysis-card.departments',
    '#departmentRankings',
    'text=Department Rankings',
    '.department-list',
    '.department-rankings'
  ];
  
  let departmentSectionFound = false;
  for (const selector of departmentSelectors) {
    try {
      const element = await page.locator(selector).first();
      if (await element.isVisible()) {
        console.log(`   ✅ Department section found with: ${selector}`);
        departmentSectionFound = true;
        
        // Get the content
        const content = await element.textContent();
        console.log(`   Content: "${content.substring(0, 200)}..."`);
        
        // Check for empty state
        if (content.includes('No department data')) {
          console.log('   ⚠️ Shows empty state: "No department data available"');
          console.log('   This means processes exist but have no department field set');
        } else {
          // Count actual department items
          const deptItems = await page.locator('.department-item').count();
          console.log(`   Department items displayed: ${deptItems}`);
          
          if (deptItems > 0) {
            console.log('   ✅ Departments are showing!');
            
            // Get first department details
            const firstDept = await page.locator('.department-item').first().textContent();
            console.log(`   First department: "${firstDept}"`);
          }
        }
        break;
      }
    } catch (e) {
      // Try next selector
    }
  }
  
  if (!departmentSectionFound) {
    console.log('   ❌ Department section not found');
    
    // Try scrolling to find it
    console.log('   Scrolling page to search...');
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(500);
      
      const deptVisible = await page.locator('text=Department Rankings').isVisible();
      if (deptVisible) {
        console.log('   ✅ Found department section after scrolling!');
        const deptContent = await page.locator('.analysis-card.departments, #departmentRankings').first().textContent();
        console.log(`   Content: "${deptContent.substring(0, 200)}..."`);
        break;
      }
    }
  }
  
  console.log('\n📸 Taking final screenshots');
  
  await page.screenshot({ path: 'test-results/testsept14-final.png', fullPage: true });
  console.log('   Screenshot saved as testsept14-final.png');
  
  console.log('\n=== DIAGNOSIS ===');
  if (hasTestSept14) {
    console.log('✅ testSept14 project exists');
    if (processWorkspaceOpened) {
      console.log('✅ Process Management workspace accessible');
      console.log('🔍 Check if processes have department field populated');
    }
    if (departmentSectionFound) {
      console.log('✅ Department section exists on dashboard');
      console.log('🔍 If showing empty, processes need department data');
    }
  } else {
    console.log('❌ testSept14 project not found or not selected');
  }
  
  // Keep browser open for observation
  await page.waitForTimeout(5000);
  
  await browser.close();
})();