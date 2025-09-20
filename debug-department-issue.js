const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('\n=== DEBUGGING DEPARTMENT DISPLAY ISSUE ===');
  
  await page.goto('http://localhost:8000/workshops/business-automation-dashboard.html');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  
  // Check current project and processes data
  const projectInfo = await page.evaluate(() => {
    return {
      currentProjectId: window.currentProjectId || 'not set',
      processesLength: window.processes ? window.processes.length : 'processes array not found',
      projects: window.projects ? window.projects.map(p => ({ id: p.id, name: p.name })) : 'projects array not found'
    };
  });
  
  console.log('\n📊 Current State:');
  console.log(`   Current Project ID: ${projectInfo.currentProjectId}`);
  console.log(`   Processes Length: ${projectInfo.processesLength}`);
  console.log(`   Available Projects:`, projectInfo.projects);
  
  // Look for testSept14 project specifically
  const testSept14Project = await page.evaluate(() => {
    if (window.projects) {
      return window.projects.find(p => p.name.toLowerCase().includes('testsept14') || p.name.toLowerCase().includes('test') || p.id.includes('sept14'));
    }
    return null;
  });
  
  console.log(`\n🔍 testSept14 Project Found:`, testSept14Project);
  
  if (testSept14Project) {
    // Switch to testSept14 project
    console.log(`\n🔄 Switching to testSept14 project...`);
    await page.evaluate((projectId) => {
      window.currentProjectId = projectId;
      if (typeof loadProcesses === 'function') {
        loadProcesses(projectId);
      }
    }, testSept14Project.id);
    
    await page.waitForTimeout(3000);
    
    // Check processes data after loading
    const processesData = await page.evaluate(() => {
      if (window.processes && window.processes.length > 0) {
        return window.processes.map(p => ({
          id: p.id,
          name: p.name,
          department: p.department,
          customDepartment: p.customDepartment,
          impact: p.impact,
          feasibility: p.feasibility,
          timeSpent: p.timeSpent
        }));
      }
      return [];
    });
    
    console.log(`\n📋 Processes in testSept14:`, processesData);
    
    // Check if department rankings function exists and call it manually
    const departmentRankingsResult = await page.evaluate(() => {
      if (typeof updateDepartmentRankings === 'function') {
        try {
          updateDepartmentRankings();
          return 'Function called successfully';
        } catch (error) {
          return 'Error calling function: ' + error.message;
        }
      }
      return 'Function not found';
    });
    
    console.log(`\n🔧 Manual department rankings update: ${departmentRankingsResult}`);
    
    // Navigate to main dashboard to see departments
    await page.evaluate(() => {
      if (typeof openMainWorkspace === 'function') {
        openMainWorkspace();
      }
    });
    await page.waitForTimeout(3000);
    
    // Check department rankings display
    const departmentDisplay = await page.locator('#departmentRankings').innerHTML();
    console.log(`\n🏢 Department Rankings HTML:`, departmentDisplay.substring(0, 200) + '...');
    
    // Check if department section is visible
    const departmentSectionVisible = await page.locator('.analysis-card.departments').isVisible();
    console.log(`\n📊 Department section visible: ${departmentSectionVisible}`);
    
    if (departmentSectionVisible) {
      const departmentItems = await page.locator('.department-item').count();
      console.log(`   Department items count: ${departmentItems}`);
      
      if (departmentItems === 0) {
        // Check for empty state message
        const emptyMessage = await page.locator('text=No department data available').isVisible();
        console.log(`   Shows empty message: ${emptyMessage}`);
      }
    }
    
    // Force update dashboard to ensure everything is refreshed
    console.log(`\n🔄 Forcing dashboard update...`);
    await page.evaluate(() => {
      if (typeof updateDashboard === 'function') {
        updateDashboard();
      }
    });
    await page.waitForTimeout(2000);
    
    // Check again after forced update
    const finalDepartmentItems = await page.locator('.department-item').count();
    console.log(`   Department items after update: ${finalDepartmentItems}`);
  }
  
  // Take screenshot for debugging
  await page.screenshot({ 
    path: 'test-results/department-debug.png',
    fullPage: true 
  });
  
  console.log('\n📸 Debug screenshot saved as department-debug.png');
  console.log('\n=== DEBUGGING COMPLETE ===');
  
  await browser.close();
})();