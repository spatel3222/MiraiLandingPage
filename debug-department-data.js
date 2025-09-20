const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('\n=== DEBUGGING DEPARTMENT DATA STRUCTURE ===');
  
  await page.goto('http://localhost:8000/workshops/business-automation-dashboard.html');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);
  
  console.log('\n🔍 Step 1: Force load testSept14 project data');
  
  // Try to manually load the project data
  const loadResult = await page.evaluate(async () => {
    // Find testSept14 project
    let testProject = null;
    
    // Check if we have projects loaded
    if (window.projects && window.projects.length > 0) {
      testProject = window.projects.find(p => 
        p.name && p.name.toLowerCase().includes('testsept14')
      );
    }
    
    if (!testProject) {
      // Try to load projects if not loaded
      if (typeof loadProjects === 'function') {
        try {
          await loadProjects();
          testProject = window.projects.find(p => 
            p.name && p.name.toLowerCase().includes('testsept14')
          );
        } catch (e) {
          return { error: 'Failed to load projects: ' + e.message };
        }
      }
    }
    
    if (!testProject) {
      return { error: 'testSept14 project not found in projects array' };
    }
    
    // Now load processes for testSept14
    try {
      window.currentProjectId = testProject.id;
      
      if (typeof loadProcesses === 'function') {
        await loadProcesses(testProject.id);
        
        return {
          success: true,
          projectId: testProject.id,
          projectName: testProject.name,
          processesCount: window.processes ? window.processes.length : 0,
          processes: window.processes ? window.processes.map(p => ({
            id: p.id,
            name: p.name,
            department: p.department,
            customDepartment: p.customDepartment || p.custom_department,
            impact: p.impact,
            feasibility: p.feasibility,
            timeSpent: p.timeSpent || p.time_spent
          })) : []
        };
      } else {
        return { error: 'loadProcesses function not found' };
      }
    } catch (e) {
      return { error: 'Failed to load processes: ' + e.message };
    }
  });
  
  console.log('\n📊 Load Result:', JSON.stringify(loadResult, null, 2));
  
  if (loadResult.success) {
    console.log('\n🔍 Step 2: Analyze process data structure');
    
    console.log(`   Project: ${loadResult.projectName} (${loadResult.projectId})`);
    console.log(`   Processes count: ${loadResult.processesCount}`);
    
    if (loadResult.processes.length > 0) {
      console.log('\n📋 Process Details:');
      loadResult.processes.forEach((process, index) => {
        console.log(`   Process ${index + 1}:`);
        console.log(`      Name: ${process.name}`);
        console.log(`      Department: ${process.department || 'NOT SET'}`);
        console.log(`      Custom Department: ${process.customDepartment || 'NOT SET'}`);
        console.log(`      Impact: ${process.impact || 'NOT SET'}`);
        console.log(`      Feasibility: ${process.feasibility || 'NOT SET'}`);
        console.log(`      Time Spent: ${process.timeSpent || 'NOT SET'}`);
        console.log('   ---');
      });
      
      // Check if any processes have department data
      const processesWithDepartments = loadResult.processes.filter(p => p.department);
      const processesWithCustomDepartments = loadResult.processes.filter(p => p.customDepartment);
      
      console.log(`\n📊 Department Analysis:`);
      console.log(`   Processes with department field: ${processesWithDepartments.length}`);
      console.log(`   Processes with custom department: ${processesWithCustomDepartments.length}`);
      
      if (processesWithDepartments.length > 0) {
        console.log(`   Departments found:`, [...new Set(processesWithDepartments.map(p => p.department))]);
      }
      
      // Step 3: Manually test updateDepartmentRankings function
      console.log('\n🔍 Step 3: Test updateDepartmentRankings function');
      
      const updateResult = await page.evaluate(() => {
        try {
          // Check current processes array
          const currentProcesses = window.processes || [];
          console.log('Current processes array length:', currentProcesses.length);
          
          if (currentProcesses.length > 0) {
            console.log('First process department:', currentProcesses[0].department);
          }
          
          // Call updateDepartmentRankings manually
          if (typeof updateDepartmentRankings === 'function') {
            updateDepartmentRankings();
            
            // Check what was rendered
            const departmentContainer = document.getElementById('departmentRankings');
            const departmentItems = document.querySelectorAll('.department-item');
            
            return {
              success: true,
              containerExists: !!departmentContainer,
              containerHTML: departmentContainer ? departmentContainer.innerHTML : null,
              departmentItemsCount: departmentItems.length,
              processesAtCallTime: currentProcesses.length
            };
          } else {
            return { error: 'updateDepartmentRankings function not found' };
          }
        } catch (e) {
          return { error: 'Error in updateDepartmentRankings: ' + e.message };
        }
      });
      
      console.log('\n🔧 Update Result:', JSON.stringify(updateResult, null, 2));
      
      // Step 4: Check if the issue is in the department filtering logic
      console.log('\n🔍 Step 4: Debug department filtering logic');
      
      const debugResult = await page.evaluate(() => {
        if (!window.processes || window.processes.length === 0) {
          return { error: 'No processes array' };
        }
        
        const processes = window.processes;
        const debugInfo = {
          totalProcesses: processes.length,
          processesWithDepartment: 0,
          departmentStats: {},
          processDetails: []
        };
        
        processes.forEach(process => {
          const processInfo = {
            name: process.name,
            department: process.department,
            customDepartment: process.customDepartment || process.custom_department,
            hasDepartment: !!process.department
          };
          
          debugInfo.processDetails.push(processInfo);
          
          if (process.department) {
            debugInfo.processesWithDepartment++;
            
            if (!debugInfo.departmentStats[process.department]) {
              debugInfo.departmentStats[process.department] = {
                processCount: 0,
                totalScore: 0,
                totalImpact: 0,
                totalFeasibility: 0
              };
            }
            
            const dept = debugInfo.departmentStats[process.department];
            dept.processCount++;
            
            const automationScore = ((process.impact || 0) + (process.feasibility || 0)) / 2;
            dept.totalScore += automationScore;
            dept.totalImpact += (process.impact || 0);
            dept.totalFeasibility += (process.feasibility || 0);
          }
        });
        
        return debugInfo;
      });
      
      console.log('\n🔧 Debug Result:', JSON.stringify(debugResult, null, 2));
      
      if (debugResult.processesWithDepartment > 0) {
        console.log('\n✅ PROCESSES HAVE DEPARTMENTS - The issue is elsewhere!');
        console.log('🔍 Checking if updateDashboard() calls updateDepartmentRankings()...');
        
        // Force call updateDashboard
        await page.evaluate(() => {
          if (typeof updateDashboard === 'function') {
            console.log('Calling updateDashboard...');
            updateDashboard();
          }
        });
        
        await page.waitForTimeout(2000);
        
        // Check final result
        const finalCheck = await page.evaluate(() => {
          const departmentItems = document.querySelectorAll('.department-item');
          const departmentContainer = document.getElementById('departmentRankings');
          
          return {
            departmentItemsCount: departmentItems.length,
            containerHTML: departmentContainer ? departmentContainer.innerHTML.substring(0, 300) : 'not found'
          };
        });
        
        console.log('\n🏁 Final Check:', finalCheck);
        
        if (finalCheck.departmentItemsCount === 0) {
          console.log('\n❌ STILL NOT SHOWING - There\'s a bug in the updateDepartmentRankings function!');
        } else {
          console.log('\n✅ DEPARTMENTS NOW SHOWING!');
        }
      }
      
    } else {
      console.log('\n❌ No processes found in testSept14');
    }
  }
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/department-debug-detailed.png', fullPage: true });
  console.log('\n📸 Screenshot saved as department-debug-detailed.png');
  
  // Keep browser open for inspection
  await page.waitForTimeout(5000);
  
  await browser.close();
})();