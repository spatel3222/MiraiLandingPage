const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('\n=== DEBUGGING PROJECT LOADING MECHANISM ===');
  
  await page.goto('http://localhost:8000/workshops/business-automation-dashboard.html');
  await page.waitForLoadState('networkidle');
  
  // Wait progressively longer to see when data appears
  for (let wait = 2; wait <= 10; wait += 2) {
    await page.waitForTimeout(wait * 1000);
    
    console.log(`\n⏰ After ${wait} seconds:`);
    
    const dataCheck = await page.evaluate(() => {
      return {
        windowProjects: typeof window.projects,
        projectsLength: window.projects ? window.projects.length : 'undefined',
        windowProcesses: typeof window.processes,  
        processesLength: window.processes ? window.processes.length : 'undefined',
        currentProjectId: window.currentProjectId || 'not set',
        supabaseDB: typeof window.workshopDB,
        supabaseConnected: window.workshopDB ? window.workshopDB.isConnected() : 'no workshopDB',
        localStorage_projects: localStorage.getItem('projects') ? 'exists' : 'null',
        localStorage_currentProject: localStorage.getItem('currentProjectId') || 'not set'
      };
    });
    
    console.log('   Data Status:', dataCheck);
    
    // Check what the project selector shows
    const projectSelectorText = await page.locator('#currentProject, .project-selector').first().textContent();
    console.log(`   Project Selector: "${projectSelectorText.trim()}"`);
    
    // If we see testSept14 in the selector, try to understand how it's accessed
    if (projectSelectorText.includes('testSept14')) {
      console.log(`   ✅ testSept14 is visible in UI`);
      
      // Try to get the actual data behind the UI
      const uiDataCheck = await page.evaluate(() => {
        // Check all possible storage locations
        const checks = {};
        
        // Check DOM for project data
        const projectElements = document.querySelectorAll('[data-project-id], .project-item');
        checks.projectElementsCount = projectElements.length;
        
        // Check if project data is in DOM attributes
        checks.projectElementsData = [];
        projectElements.forEach(el => {
          checks.projectElementsData.push({
            text: el.textContent.trim(),
            dataId: el.getAttribute('data-project-id'),
            className: el.className
          });
        });
        
        // Check if there's a different global variable for projects
        checks.globalVariables = Object.keys(window).filter(key => 
          key.toLowerCase().includes('project') || 
          key.toLowerCase().includes('data')
        );
        
        return checks;
      });
      
      console.log('   UI Data Check:', uiDataCheck);
      
      // Try to manually select testSept14 using different approaches
      console.log('\n🔄 Attempting to select testSept14...');
      
      const selectionAttempts = [
        async () => {
          await page.click('text=testSept14');
          return 'clicked text=testSept14';
        },
        async () => {
          await page.click('#currentProject');
          await page.waitForTimeout(500);
          await page.click('text=testSept14');
          return 'clicked selector then testSept14';
        },
        async () => {
          const element = await page.locator('[data-project-id*="Sept14"]').first();
          if (await element.isVisible()) {
            await element.click();
            return 'clicked data-project-id element';
          }
          throw new Error('No data-project-id element');
        }
      ];
      
      for (const [index, attempt] of selectionAttempts.entries()) {
        try {
          const result = await attempt();
          console.log(`   Attempt ${index + 1}: ${result} - SUCCESS`);
          
          // Wait and check if anything changed
          await page.waitForTimeout(3000);
          
          const afterSelection = await page.evaluate(() => ({
            currentProjectId: window.currentProjectId || 'not set',
            processes: window.processes ? window.processes.length : 'undefined'
          }));
          
          console.log(`   After selection:`, afterSelection);
          
          if (afterSelection.currentProjectId !== 'not set') {
            console.log('   ✅ Project selection worked!');
            break;
          }
          
        } catch (e) {
          console.log(`   Attempt ${index + 1}: FAILED - ${e.message}`);
        }
      }
      
      break; // Exit the time loop once we see testSept14
    }
  }
  
  // Final check of what we have
  console.log('\n🏁 FINAL STATE CHECK');
  
  const finalState = await page.evaluate(() => {
    return {
      projects: window.projects || 'undefined',
      processes: window.processes || 'undefined', 
      currentProjectId: window.currentProjectId || 'not set',
      selectedProjectText: document.querySelector('#currentProject, .project-selector')?.textContent?.trim()
    };
  });
  
  console.log('Final State:', finalState);
  
  // If we still don't have project data, let's check the console for errors
  console.log('\n🔍 CHECKING CONSOLE ERRORS');
  
  const consoleErrors = await page.evaluate(() => {
    // Return any errors that might be in the console
    const errors = [];
    
    // Override console.error to catch errors
    const originalError = console.error;
    console.error = (...args) => {
      errors.push(args.join(' '));
      originalError.apply(console, args);
    };
    
    return errors;
  });
  
  console.log('Console errors:', consoleErrors);
  
  // Take screenshot for manual inspection
  await page.screenshot({ path: 'test-results/project-loading-debug.png', fullPage: true });
  console.log('\n📸 Screenshot saved: project-loading-debug.png');
  
  console.log('\n=== SUMMARY ===');
  console.log('If testSept14 appears in UI but window.projects is undefined,');
  console.log('the project data might be:');
  console.log('1. Stored differently (not in window.projects)');
  console.log('2. Loading asynchronously and not accessible via JavaScript');
  console.log('3. Hardcoded in DOM rather than dynamic data');
  console.log('4. Behind authentication or permission issues');
  
  await page.waitForTimeout(5000);
  await browser.close();
})();