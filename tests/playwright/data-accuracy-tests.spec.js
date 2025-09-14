import { test, expect } from '@playwright/test';

test.describe('Business Automation Dashboard - Data Accuracy Tests', () => {
  const dashboardUrl = '/workshops/business-automation-dashboard.html';

  test.beforeEach(async ({ page }) => {
    // Set up console message tracking
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'error') {
        console.log(`Console ${msg.type()}: ${msg.text()}`);
      }
    });

    page.on('pageerror', error => {
      console.error(`Page error: ${error.message}`);
    });
  });

  test('Data Consistency: Dashboard Metrics vs Project Data', async ({ page }) => {
    console.log('\n=== TESTING: Dashboard Data Accuracy ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(4000); // Allow for full data loading
    
    // Get all projects from dropdown
    const dropdown = page.locator('#headerProjectSelector, #projectSelector');
    await expect(dropdown.first()).toBeVisible();
    
    const options = await dropdown.first().locator('option').all();
    const projects = [];
    
    for (const option of options) {
      const value = await option.getAttribute('value');
      const text = await option.textContent();
      if (value && text && text !== 'Select Project...') {
        projects.push({ value, text });
      }
    }
    
    console.log(`Found ${projects.length} projects in dropdown:`, projects);
    
    // Test each project individually
    for (const project of projects) {
      console.log(`\n--- Testing Project: ${project.text} (${project.value}) ---`);
      
      // Select the project
      await dropdown.first().selectOption(project.value);
      await page.waitForTimeout(3000); // Allow data to load
      
      // Get dashboard metrics
      const metrics = {};
      
      // Try different selectors for metrics
      const metricSelectors = [
        { name: 'totalProcesses', selectors: ['#totalProcesses', '.total-processes', '[data-metric="total-processes"]'] },
        { name: 'activeDepartments', selectors: ['#activeDepartments', '.active-departments', '[data-metric="active-departments"]'] },
        { name: 'quickWins', selectors: ['#quickWinOpportunities', '#quickWins', '.quick-wins'] },
        { name: 'costSavings', selectors: ['#costSavings', '.cost-savings', '[data-metric="cost-savings"]'] },
        { name: 'implementation', selectors: ['#implementation', '.implementation', '[data-metric="implementation"]'] }
      ];
      
      for (const metric of metricSelectors) {
        let found = false;
        for (const selector of metric.selectors) {
          const element = page.locator(selector);
          if (await element.count() > 0 && await element.isVisible()) {
            const value = await element.textContent();
            metrics[metric.name] = value?.trim();
            found = true;
            break;
          }
        }
        if (!found) {
          metrics[metric.name] = 'NOT_FOUND';
        }
      }
      
      console.log('Dashboard metrics:', metrics);
      
      // Get actual process count from database via JavaScript
      const actualData = await page.evaluate(async (projectId) => {
        try {
          // Try to get actual data from the dashboard's data structures
          const processes = window.processes || [];
          const currentProjectProcesses = processes.filter(p => p.project_id === projectId);
          
          // Also check if we can access the database directly
          let dbProcessCount = 0;
          if (window.workshopDB && window.workshopDB.getProcessesByProject) {
            try {
              const dbProcesses = await window.workshopDB.getProcessesByProject(projectId);
              dbProcessCount = dbProcesses ? dbProcesses.length : 0;
            } catch (e) {
              console.log('Database access failed:', e.message);
            }
          }
          
          return {
            inMemoryProcesses: currentProjectProcesses.length,
            dbProcessCount,
            hasDbAccess: !!(window.workshopDB && window.workshopDB.getProcessesByProject)
          };
        } catch (error) {
          return { error: error.message };
        }
      }, project.value);
      
      console.log('Actual data:', actualData);
      
      // Compare dashboard display vs actual data
      const dashboardProcessCount = parseInt(metrics.totalProcesses) || 0;
      const actualProcessCount = actualData.dbProcessCount || actualData.inMemoryProcesses || 0;
      
      console.log(`Process count comparison:`);
      console.log(`  Dashboard shows: ${dashboardProcessCount}`);
      console.log(`  Actual data: ${actualProcessCount}`);
      
      if (dashboardProcessCount === actualProcessCount) {
        console.log(`  ✅ Data matches for ${project.text}`);
      } else {
        console.log(`  ❌ Data MISMATCH for ${project.text}: Dashboard=${dashboardProcessCount}, Actual=${actualProcessCount}`);
      }
      
      // Check if showing hardcoded values (common signs)
      if (metrics.totalProcesses === '3' && project.text.includes('testSept14')) {
        console.log(`  ⚠️  Potential hardcoded value: testSept14 showing 3 processes`);
      }
      
      if (dashboardProcessCount > 0 && actualProcessCount === 0) {
        console.log(`  ⚠️  Suspicious: Dashboard shows ${dashboardProcessCount} but actual data is 0`);
      }
    }
    
    // Take screenshot of final state
    await page.screenshot({ 
      path: 'test-results/data-accuracy-test.png',
      fullPage: true 
    });
  });

  test('Project Switching: Real-time Data Updates', async ({ page }) => {
    console.log('\n=== TESTING: Real-time Data Updates on Project Switch ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    const dropdown = page.locator('#headerProjectSelector, #projectSelector');
    await expect(dropdown.first()).toBeVisible();
    
    // Get testSept9b and testSept14 projects specifically
    const testProjects = [];
    const options = await dropdown.first().locator('option').all();
    
    for (const option of options) {
      const value = await option.getAttribute('value');
      const text = await option.textContent();
      if (text && (text.includes('testSept9b') || text.includes('testSept14'))) {
        testProjects.push({ value, text });
      }
    }
    
    console.log('Found test projects:', testProjects);
    
    if (testProjects.length >= 2) {
      const project1 = testProjects[0];
      const project2 = testProjects[1];
      
      // Test switching between projects
      console.log(`\n--- Switching from ${project1.text} to ${project2.text} ---`);
      
      // Select first project
      await dropdown.first().selectOption(project1.value);
      await page.waitForTimeout(2000);
      
      const metrics1 = await page.evaluate(() => {
        return {
          totalProcesses: document.querySelector('#totalProcesses, .total-processes')?.textContent?.trim(),
          activeDepartments: document.querySelector('#activeDepartments, .active-departments')?.textContent?.trim(),
          currentProject: document.querySelector('#currentProjectName, .current-project-name')?.textContent?.trim()
        };
      });
      
      console.log(`${project1.text} metrics:`, metrics1);
      
      // Select second project
      await dropdown.first().selectOption(project2.value);
      await page.waitForTimeout(2000);
      
      const metrics2 = await page.evaluate(() => {
        return {
          totalProcesses: document.querySelector('#totalProcesses, .total-processes')?.textContent?.trim(),
          activeDepartments: document.querySelector('#activeDepartments, .active-departments')?.textContent?.trim(),
          currentProject: document.querySelector('#currentProjectName, .current-project-name')?.textContent?.trim()
        };
      });
      
      console.log(`${project2.text} metrics:`, metrics2);
      
      // Check if data actually changed
      const dataChanged = (
        metrics1.totalProcesses !== metrics2.totalProcesses ||
        metrics1.activeDepartments !== metrics2.activeDepartments
      );
      
      const nameUpdated = metrics1.currentProject !== metrics2.currentProject;
      
      if (dataChanged) {
        console.log('✅ Dashboard metrics updated when switching projects');
      } else {
        console.log('❌ Dashboard metrics DID NOT update when switching projects');
        console.log('This suggests hardcoded values or broken data binding');
      }
      
      if (nameUpdated) {
        console.log('✅ Project name updated correctly');
      } else {
        console.log('❌ Project name did not update');
      }
    }
  });

  test('Process Addition Auto-Refresh Check', async ({ page }) => {
    console.log('\n=== TESTING: Process Addition Auto-Refresh ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Check if process addition functions exist
    const processRefreshFunctions = await page.evaluate(() => {
      return {
        refreshProcessList: typeof refreshProcessList === 'function',
        onProcessCreated: typeof onProcessCreated === 'function',
        refreshDashboardMetrics: typeof refreshDashboardMetrics === 'function',
        updateProcessMetrics: typeof updateProcessMetrics === 'function'
      };
    });
    
    console.log('Process refresh functions availability:', processRefreshFunctions);
    
    Object.entries(processRefreshFunctions).forEach(([funcName, exists]) => {
      if (exists) {
        console.log(`✅ ${funcName} function is available`);
      } else {
        console.log(`❌ ${funcName} function is missing`);
      }
    });
    
    // Test if process refresh functions work
    if (processRefreshFunctions.refreshProcessList) {
      try {
        await page.evaluate(() => refreshProcessList());
        console.log('✅ refreshProcessList executed successfully');
      } catch (error) {
        console.log(`❌ refreshProcessList error: ${error.message}`);
      }
    }
    
    // Check if adding a process would auto-refresh the dashboard
    if (processRefreshFunctions.onProcessCreated) {
      console.log('✅ Process auto-refresh mechanism is in place');
    } else {
      console.log('❌ Process auto-refresh mechanism is missing');
      console.log('   Dashboard will not update automatically when processes are added');
    }
  });

  test('Hardcoded Values Detection', async ({ page }) => {
    console.log('\n=== TESTING: Hardcoded Values Detection ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Get the source code of metric update functions
    const metricSources = await page.evaluate(() => {
      const sources = {};
      
      // Try to get function source code
      if (typeof updateDashboardMetrics === 'function') {
        sources.updateDashboardMetrics = updateDashboardMetrics.toString();
      }
      
      if (typeof loadProjectData === 'function') {
        sources.loadProjectData = loadProjectData.toString();
      }
      
      if (typeof renderProcessData === 'function') {
        sources.renderProcessData = renderProcessData.toString();
      }
      
      return sources;
    });
    
    console.log('Checking function sources for hardcoded values...');
    
    // Check for suspicious hardcoded values
    const suspiciousPatterns = [
      /totalProcesses.*=.*[0-9]+/g,
      /activeDepartments.*=.*[0-9]+/g,
      /innerHTML.*[0-9]+/g,
      /textContent.*[0-9]+/g
    ];
    
    Object.entries(metricSources).forEach(([funcName, source]) => {
      console.log(`\nAnalyzing ${funcName}:`);
      
      suspiciousPatterns.forEach((pattern, index) => {
        const matches = source.match(pattern);
        if (matches) {
          console.log(`  ⚠️  Potential hardcoded value found: ${matches.join(', ')}`);
        }
      });
      
      // Check for data-driven vs hardcoded approaches
      if (source.includes('processes.length') || source.includes('data.length')) {
        console.log(`  ✅ Uses data-driven approach (processes.length or data.length)`);
      } else if (source.match(/[=:]\s*[0-9]+/)) {
        console.log(`  ⚠️  May contain hardcoded numeric values`);
      }
    });
    
    // Test with empty project to see if it shows 0 or hardcoded values
    const dropdown = page.locator('#headerProjectSelector, #projectSelector');
    if (await dropdown.count() > 0) {
      // Try to find an empty project or create one
      const emptyTestResult = await page.evaluate(async () => {
        // Simulate empty project data
        const originalProcesses = window.processes;
        window.processes = []; // Temporarily empty
        
        try {
          if (typeof updateDashboardMetrics === 'function') {
            updateDashboardMetrics();
          }
          
          const metrics = {
            totalProcesses: document.querySelector('#totalProcesses')?.textContent?.trim(),
            activeDepartments: document.querySelector('#activeDepartments')?.textContent?.trim()
          };
          
          // Restore original data
          window.processes = originalProcesses;
          
          return metrics;
        } catch (error) {
          window.processes = originalProcesses; // Restore on error
          return { error: error.message };
        }
      });
      
      console.log('\nEmpty project simulation result:', emptyTestResult);
      
      if (emptyTestResult.totalProcesses === '0' || emptyTestResult.totalProcesses === '') {
        console.log('✅ Dashboard correctly shows 0 for empty project');
      } else {
        console.log(`❌ Dashboard shows "${emptyTestResult.totalProcesses}" for empty project (should be 0)`);
      }
    }
  });

  test('Comprehensive Data Flow Test', async ({ page }) => {
    console.log('\n=== TESTING: Complete Data Flow ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(4000);
    
    // Get current state
    const initialState = await page.evaluate(() => {
      return {
        currentProject: document.querySelector('#currentProjectName')?.textContent?.trim(),
        totalProcesses: document.querySelector('#totalProcesses')?.textContent?.trim(),
        activeDepartments: document.querySelector('#activeDepartments')?.textContent?.trim(),
        projectsInDropdown: Array.from(document.querySelectorAll('#headerProjectSelector option, #projectSelector option'))
          .map(opt => ({ value: opt.value, text: opt.textContent }))
          .filter(p => p.text !== 'Select Project...')
      };
    });
    
    console.log('Initial dashboard state:', initialState);
    
    // Test data consistency across all projects
    const dropdown = page.locator('#headerProjectSelector, #projectSelector');
    
    for (const project of initialState.projectsInDropdown) {
      if (project.value && project.text) {
        console.log(`\n--- Testing data flow for ${project.text} ---`);
        
        await dropdown.first().selectOption(project.value);
        await page.waitForTimeout(2500);
        
        const projectState = await page.evaluate(() => {
          return {
            displayedName: document.querySelector('#currentProjectName')?.textContent?.trim(),
            totalProcesses: document.querySelector('#totalProcesses')?.textContent?.trim(),
            activeDepartments: document.querySelector('#activeDepartments')?.textContent?.trim(),
            quickWins: document.querySelector('#quickWinOpportunities, #quickWins')?.textContent?.trim()
          };
        });
        
        console.log(`  Project display: ${projectState.displayedName}`);
        console.log(`  Processes: ${projectState.totalProcesses}`);
        console.log(`  Departments: ${projectState.activeDepartments}`);
        console.log(`  Quick Wins: ${projectState.quickWins}`);
        
        // Validate name consistency
        if (projectState.displayedName === project.text) {
          console.log('  ✅ Project name matches dropdown');
        } else {
          console.log(`  ❌ Name mismatch: Display="${projectState.displayedName}", Dropdown="${project.text}"`);
        }
        
        // Check for reasonable values
        const processCount = parseInt(projectState.totalProcesses) || 0;
        const deptCount = parseInt(projectState.activeDepartments) || 0;
        
        if (processCount >= 0 && processCount < 1000) {
          console.log('  ✅ Process count seems reasonable');
        } else {
          console.log(`  ⚠️  Process count seems suspicious: ${processCount}`);
        }
        
        if (deptCount >= 0 && deptCount <= processCount + 1) {
          console.log('  ✅ Department count seems reasonable');
        } else {
          console.log(`  ⚠️  Department count seems suspicious: ${deptCount} (processes: ${processCount})`);
        }
      }
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'test-results/data-flow-test.png',
      fullPage: true 
    });
  });
});