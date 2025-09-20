const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('\n=== DEBUGGING testSept14 PROJECT SPECIFICALLY ===');
  
  // Enable debug mode for more console logs
  await page.goto('http://localhost:8000/workshops/business-automation-dashboard.html?debug=true');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(5000); // Wait longer for data to load
  
  // Get all console logs to see what's happening
  page.on('console', msg => {
    if (msg.text().includes('Department') || msg.text().includes('Process') || msg.text().includes('Project')) {
      console.log(`🖥️ Console: ${msg.text()}`);
    }
  });
  
  console.log('\n🔍 Step 1: Check if projects load...');
  
  // Wait for projects to load and list all available projects
  await page.waitForTimeout(3000);
  
  const allProjects = await page.evaluate(() => {
    // Try different ways projects might be stored
    const sources = [
      { name: 'window.projects', data: window.projects },
      { name: 'localStorage projects', data: localStorage.getItem('projects') },
      { name: 'sessionStorage projects', data: sessionStorage.getItem('projects') }
    ];
    
    return sources.map(source => ({
      source: source.name,
      exists: !!source.data,
      data: source.data ? (typeof source.data === 'string' ? JSON.parse(source.data) : source.data) : null
    }));
  });
  
  console.log('\n📊 Available project data sources:');
  allProjects.forEach(source => {
    console.log(`   ${source.source}: ${source.exists ? '✅ Found' : '❌ Not found'}`);
    if (source.exists && source.data) {
      console.log(`      Projects: ${JSON.stringify(source.data.slice(0, 3), null, 2)}`); // Show first 3 projects
    }
  });
  
  // Try to find testSept14 project in any of the sources
  const testSept14Data = await page.evaluate(() => {
    const searchPatterns = ['testsept14', 'test-sept-14', 'sept14', 'test sept 14'];
    let foundProject = null;
    
    // Check window.projects
    if (window.projects) {
      foundProject = window.projects.find(p => 
        searchPatterns.some(pattern => 
          p.name.toLowerCase().includes(pattern) || 
          p.id.toLowerCase().includes(pattern)
        )
      );
    }
    
    if (!foundProject) {
      // Check localStorage
      try {
        const storedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
        foundProject = storedProjects.find(p => 
          searchPatterns.some(pattern => 
            p.name.toLowerCase().includes(pattern) || 
            p.id.toLowerCase().includes(pattern)
          )
        );
      } catch (e) {}
    }
    
    return foundProject;
  });
  
  console.log(`\n🎯 testSept14 project search result:`, testSept14Data);
  
  if (testSept14Data) {
    console.log(`\n🔄 Step 2: Load testSept14 processes...`);
    
    // Load the project and its processes
    await page.evaluate((projectId) => {
      window.currentProjectId = projectId;
      console.log('🔄 Setting currentProjectId to:', projectId);
      
      if (typeof loadProcesses === 'function') {
        console.log('🔄 Calling loadProcesses...');
        return loadProcesses(projectId);
      } else {
        console.log('❌ loadProcesses function not found');
        return Promise.resolve([]);
      }
    }, testSept14Data.id);
    
    await page.waitForTimeout(5000); // Wait for async loading
    
    // Check what processes were loaded
    const processesData = await page.evaluate(() => {
      return {
        processesArray: window.processes || [],
        currentProjectId: window.currentProjectId,
        processCount: window.processes ? window.processes.length : 0
      };
    });
    
    console.log(`\n📋 Loaded processes data:`, processesData);
    
    if (processesData.processesArray.length > 0) {
      console.log(`\n📊 Process details:`);
      processesData.processesArray.forEach((process, index) => {
        console.log(`   Process ${index + 1}:`);
        console.log(`      Name: ${process.name}`);
        console.log(`      Department: ${process.department || 'NOT SET'}`);
        console.log(`      Custom Department: ${process.customDepartment || 'NOT SET'}`);
        console.log(`      Impact: ${process.impact || 'NOT SET'}`);
        console.log(`      Feasibility: ${process.feasibility || 'NOT SET'}`);
      });
      
      // Step 3: Manually call updateDashboard and updateDepartmentRankings
      console.log(`\n🔄 Step 3: Manually trigger dashboard update...`);
      
      const updateResult = await page.evaluate(() => {
        try {
          if (typeof updateDashboard === 'function') {
            updateDashboard();
            return 'updateDashboard called successfully';
          } else {
            return 'updateDashboard function not found';
          }
        } catch (error) {
          return 'Error calling updateDashboard: ' + error.message;
        }
      });
      
      console.log(`   Update result: ${updateResult}`);
      
      // Navigate to main dashboard to see results
      await page.evaluate(() => {
        if (typeof openMainWorkspace === 'function') {
          openMainWorkspace();
        }
      });
      await page.waitForTimeout(3000);
      
      // Check final department display
      const finalCheck = await page.evaluate(() => {
        const departmentContainer = document.getElementById('departmentRankings');
        const departmentItems = document.querySelectorAll('.department-item');
        
        return {
          containerExists: !!departmentContainer,
          containerHTML: departmentContainer ? departmentContainer.innerHTML.substring(0, 300) : 'not found',
          departmentItemsCount: departmentItems.length,
          departmentSectionVisible: document.querySelector('.analysis-card.departments') ? true : false
        };
      });
      
      console.log(`\n🏢 Final department display check:`, finalCheck);
      
    } else {
      console.log(`\n❌ No processes found in testSept14 project`);
    }
  } else {
    console.log(`\n❌ testSept14 project not found in any data source`);
    
    // Show what projects are available
    const availableProjectNames = await page.evaluate(() => {
      if (window.projects) {
        return window.projects.map(p => p.name);
      }
      return [];
    });
    
    console.log(`\n📝 Available project names:`, availableProjectNames);
  }
  
  // Take screenshot
  await page.screenshot({ 
    path: 'test-results/testsept14-debug.png',
    fullPage: true 
  });
  
  console.log('\n📸 Debug screenshot saved as testsept14-debug.png');
  
  await browser.close();
})();