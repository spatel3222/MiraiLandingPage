const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false }); // Show browser for debugging
  const page = await browser.newPage();
  
  console.log('\n=== INTERACTIVE DEPARTMENT CHECK WITH PLAYWRIGHT ===');
  
  await page.goto('http://localhost:8000/workshops/business-automation-dashboard.html');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(5000); // Give time for everything to load
  
  console.log('\n📊 Step 1: Check initial page state');
  
  // Check if main dashboard is visible
  const mainDashboardVisible = await page.locator('.dashboard-container, .main-content').first().isVisible();
  console.log(`   Main dashboard visible: ${mainDashboardVisible ? '✅' : '❌'}`);
  
  // Check for project selector
  const projectSelector = await page.locator('#currentProject, .project-selector, button:has-text("Select Project")').first().isVisible();
  console.log(`   Project selector visible: ${projectSelector ? '✅' : '❌'}`);
  
  console.log('\n🔍 Step 2: Look for existing projects');
  
  // Try to open project selector/dropdown
  if (projectSelector) {
    const projectSelectorText = await page.locator('#currentProject, .project-selector').first().textContent();
    console.log(`   Current project text: "${projectSelectorText}"`);
    
    // Click to open project list
    await page.click('#currentProject, .project-selector, button:has-text("Select Project")', { force: true });
    await page.waitForTimeout(1000);
    
    // Check for project list items
    const projectItems = await page.locator('.project-item, .dropdown-item, [role="option"]').count();
    console.log(`   Available projects in dropdown: ${projectItems}`);
    
    if (projectItems > 0) {
      // Get all project names
      const projectNames = await page.locator('.project-item, .dropdown-item, [role="option"]').allTextContents();
      console.log(`   Project names found:`, projectNames);
      
      // Look for testSept14 or any test project
      const testProjectFound = projectNames.some(name => 
        name.toLowerCase().includes('test') || 
        name.toLowerCase().includes('sept')
      );
      
      if (testProjectFound) {
        console.log(`   ✅ Test project found!`);
        
        // Click on the test project
        const testProject = projectNames.find(name => 
          name.toLowerCase().includes('test') || 
          name.toLowerCase().includes('sept')
        );
        
        console.log(`\n🔄 Step 3: Selecting project: "${testProject}"`);
        await page.click(`text="${testProject}"`);
        await page.waitForTimeout(3000); // Wait for project to load
        
      } else {
        console.log(`   ❌ No test project found, creating one...`);
      }
    } else {
      console.log(`   ❌ No projects in dropdown`);
    }
  }
  
  console.log('\n📋 Step 4: Check Process Management workspace');
  
  // Try to open Process Management workspace
  const processWorkspaceButton = await page.locator('button:has-text("Process Management"), text=Process Management').first();
  if (await processWorkspaceButton.isVisible()) {
    console.log(`   Opening Process Management workspace...`);
    await processWorkspaceButton.click();
    await page.waitForTimeout(2000);
    
    // Check for processes
    const processCount = await page.locator('.process-item, .process-row, .process-card').count();
    console.log(`   Processes found: ${processCount}`);
    
    if (processCount === 0) {
      console.log(`   No processes found, trying to add one...`);
      
      // Try to add a process
      const addProcessButton = await page.locator('button:has-text("Add Process"), .add-process-btn').first();
      if (await addProcessButton.isVisible()) {
        console.log(`\n➕ Step 5: Adding a test process`);
        await addProcessButton.click();
        await page.waitForTimeout(1000);
        
        // Fill in the form
        await page.fill('input[name="name"], #processName', 'Test Process for Departments');
        
        // Select department
        const departmentSelect = await page.locator('select[name="department"], #processDepartment').first();
        if (await departmentSelect.isVisible()) {
          await departmentSelect.selectOption({ index: 1 }); // Select first available department
          const selectedDepartment = await departmentSelect.inputValue();
          console.log(`   Selected department: ${selectedDepartment}`);
        }
        
        // Fill other required fields
        await page.fill('input[name="timeSpent"], #processTimeSpent', '10');
        await page.fill('input[name="impact"], #processImpact', '8');
        await page.fill('input[name="feasibility"], #processFeasibility', '7');
        
        // Submit the form
        const submitButton = await page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")').first();
        if (await submitButton.isVisible()) {
          await submitButton.click();
          console.log(`   ✅ Process submitted`);
          await page.waitForTimeout(3000);
        }
      }
    } else {
      console.log(`   ✅ Processes exist, checking their departments...`);
      
      // Get process details
      const processDetails = await page.locator('.process-item, .process-row').first().textContent();
      console.log(`   First process details: "${processDetails}"`);
    }
  }
  
  console.log('\n🏠 Step 6: Navigate to main dashboard');
  
  // Go back to main dashboard
  const backButton = await page.locator('button:has-text("Back"), .back-button, .close-button').first();
  if (await backButton.isVisible()) {
    await backButton.click();
    await page.waitForTimeout(2000);
  } else {
    // Try clicking on a main dashboard button/link
    const mainDashboardButton = await page.locator('button:has-text("Dashboard"), text=Dashboard').first();
    if (await mainDashboardButton.isVisible()) {
      await mainDashboardButton.click();
      await page.waitForTimeout(2000);
    }
  }
  
  console.log('\n🏢 Step 7: Check Department Rankings section');
  
  // Look for department section
  const departmentSection = await page.locator('.analysis-card.departments, .department-rankings, text=Department Rankings').first().isVisible();
  console.log(`   Department section visible: ${departmentSection ? '✅' : '❌'}`);
  
  if (departmentSection) {
    // Check department rankings content
    const departmentRankings = await page.locator('#departmentRankings, .department-list').first();
    if (await departmentRankings.isVisible()) {
      const rankingsContent = await departmentRankings.textContent();
      console.log(`   Department rankings content: "${rankingsContent.substring(0, 100)}..."`);
      
      // Count department items
      const departmentItems = await page.locator('.department-item').count();
      console.log(`   Department items count: ${departmentItems}`);
      
      if (departmentItems > 0) {
        console.log(`   ✅ Departments are displaying!`);
        
        // Get department details
        for (let i = 0; i < Math.min(departmentItems, 3); i++) {
          const deptName = await page.locator('.department-item .department-name').nth(i).textContent();
          const deptStats = await page.locator('.department-item .department-stats').nth(i).textContent();
          console.log(`      Department ${i+1}: ${deptName} - ${deptStats}`);
        }
      } else {
        // Check for empty state message
        const emptyMessage = await page.locator('text=No department data available').isVisible();
        console.log(`   ${emptyMessage ? '⚠️' : '❌'} Empty state message: ${emptyMessage}`);
        
        if (emptyMessage) {
          console.log(`   The department section is showing the empty state (no processes with departments)`);
        }
      }
    }
  } else {
    console.log(`   ❌ Department section not found on page`);
    
    // Try scrolling to find it
    console.log(`   Scrolling to look for department section...`);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    const departmentSectionAfterScroll = await page.locator('.analysis-card.departments, text=Department Rankings').first().isVisible();
    console.log(`   Department section after scroll: ${departmentSectionAfterScroll ? '✅ Found!' : '❌ Still not visible'}`);
  }
  
  console.log('\n📸 Step 8: Take diagnostic screenshots');
  
  // Take screenshots at different scroll positions
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'test-results/departments-top.png' });
  
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await page.screenshot({ path: 'test-results/departments-middle.png' });
  
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.screenshot({ path: 'test-results/departments-bottom.png' });
  
  console.log(`   Screenshots saved: departments-top.png, departments-middle.png, departments-bottom.png`);
  
  console.log('\n=== DIAGNOSTIC SUMMARY ===');
  console.log('1. Check if projects are loading from database');
  console.log('2. Verify processes have department field set');
  console.log('3. Ensure updateDepartmentRankings() is called after data loads');
  console.log('4. Confirm department section is visible on main dashboard');
  
  // Keep browser open for 5 seconds to observe
  await page.waitForTimeout(5000);
  
  await browser.close();
})();