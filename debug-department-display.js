const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('\n=== DEBUGGING DEPARTMENT RANKINGS DISPLAY ===');
  
  await page.goto('http://localhost:8000/workshops/business-automation-dashboard.html');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);
  
  console.log('\n🔍 Step 1: Check current project and switch to testSept9b');
  
  const switchProject = await page.evaluate(async () => {
    try {
      // Check current project
      const currentProject = window.currentProjectId;
      console.log('Current project ID:', currentProject);
      
      // Find testSept9b project
      if (!window.projects || window.projects.length === 0) {
        return { error: 'No projects loaded' };
      }
      
      const testSept9b = window.projects.find(p => p.name === 'testSept9b');
      if (!testSept9b) {
        return { error: 'testSept9b not found in projects' };
      }
      
      console.log('Found testSept9b:', testSept9b.id);
      
      // Switch to testSept9b
      window.currentProjectId = testSept9b.id;
      
      // Load processes for testSept9b
      if (typeof loadProcesses === 'function') {
        await loadProcesses(testSept9b.id);
        console.log('Processes loaded:', window.processes ? window.processes.length : 'undefined');
      }
      
      return {
        success: true,
        projectId: testSept9b.id,
        projectName: testSept9b.name,
        processesLoaded: window.processes ? window.processes.length : 0
      };
      
    } catch (error) {
      return { error: error.message };
    }
  });
  
  console.log('🔍 Project Switch Result:', switchProject);
  
  console.log('\n📊 Step 2: Check processes data and call updateDepartmentRankings');
  
  const departmentCheck = await page.evaluate(() => {
    try {
      console.log('Checking processes array...');
      console.log('window.processes:', window.processes ? window.processes.length : 'undefined');
      
      if (window.processes && window.processes.length > 0) {
        console.log('First process:', window.processes[0]);
        
        // Check if processes have departments
        const processesWithDepts = window.processes.filter(p => p.department);
        console.log('Processes with departments:', processesWithDepts.length);
        
        processesWithDepts.forEach(p => {
          console.log(`- ${p.name}: ${p.department} (impact: ${p.impact}, feasibility: ${p.feasibility})`);
        });
      }
      
      // Call updateDepartmentRankings manually
      console.log('Calling updateDepartmentRankings...');
      if (typeof updateDepartmentRankings === 'function') {
        updateDepartmentRankings();
        console.log('updateDepartmentRankings called');
      } else {
        console.log('updateDepartmentRankings function not found');
      }
      
      // Check the department container content
      const container = document.getElementById('departmentRankings');
      const containerHTML = container ? container.innerHTML : 'container not found';
      
      return {
        success: true,
        processesCount: window.processes ? window.processes.length : 0,
        processesWithDepts: window.processes ? window.processes.filter(p => p.department).length : 0,
        containerContent: containerHTML.substring(0, 200)
      };
      
    } catch (error) {
      return { error: error.message };
    }
  });
  
  console.log('📊 Department Check Result:', departmentCheck);
  
  console.log('\n🔧 Step 3: Force update dropdown and dashboard');
  
  const forceUpdate = await page.evaluate(() => {
    try {
      // Update project dropdown to show testSept9b as selected
      const dropdown = document.getElementById('headerProjectSelector');
      if (dropdown) {
        dropdown.value = window.currentProjectId;
        console.log('Dropdown updated to:', dropdown.value);
      }
      
      // Update project name display
      const projectNameElement = document.getElementById('currentProjectName');
      if (projectNameElement) {
        const currentProject = window.projects.find(p => p.id === window.currentProjectId);
        if (currentProject) {
          projectNameElement.textContent = currentProject.name;
          console.log('Project name updated to:', currentProject.name);
        }
      }
      
      // Call updateDashboard if available
      if (typeof updateDashboard === 'function') {
        updateDashboard();
        console.log('updateDashboard called');
      }
      
      // Force department rankings update again
      if (typeof updateDepartmentRankings === 'function') {
        updateDepartmentRankings();
        console.log('updateDepartmentRankings called again');
      }
      
      // Check final state
      const container = document.getElementById('departmentRankings');
      const departmentItems = document.querySelectorAll('.department-item');
      
      return {
        success: true,
        departmentItemsCount: departmentItems.length,
        containerContent: container ? container.innerHTML.substring(0, 300) : 'not found'
      };
      
    } catch (error) {
      return { error: error.message };
    }
  });
  
  console.log('🔧 Force Update Result:', forceUpdate);
  
  await page.screenshot({ path: 'test-results/department-debug-final.png', fullPage: true });
  console.log('\n📸 Screenshot saved: department-debug-final.png');
  
  await page.waitForTimeout(3000);
  await browser.close();
})();