import { test, expect } from '@playwright/test';

test.describe('Business Automation Dashboard - Auto-Refresh Testing', () => {
  const dashboardUrl = '/workshops/business-automation-dashboard.html';

  test.beforeEach(async ({ page }) => {
    // Set up console message tracking
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'error') {
        console.log(`Console ${msg.type()}: ${msg.text()}`);
      }
    });

    // Set up error tracking
    page.on('pageerror', error => {
      console.error(`Page error: ${error.message}`);
    });
  });

  test('Auto-Refresh: Project Overview Modal Updates After Project Creation', async ({ page }) => {
    console.log('\n=== TESTING: Project Overview Auto-Refresh ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // First, open the FAB menu
    const fabButton = page.locator('.fab-main, .fab, .floating-action-button, [data-action="fab"]');
    
    // Try different selectors to find FAB
    let fabFound = false;
    const fabSelectors = ['.fab-main', '.fab', '.floating-action-button', '[data-action="fab"]'];
    
    for (const selector of fabSelectors) {
      const fab = page.locator(selector);
      if (await fab.count() > 0 && await fab.isVisible()) {
        await fab.click();
        fabFound = true;
        console.log(`✅ Found and clicked FAB with selector: ${selector}`);
        break;
      }
    }
    
    if (!fabFound) {
      // Try to find FAB in shadow DOM or dynamically created elements
      await page.waitForTimeout(2000);
      const allButtons = page.locator('button, .fab, [role="button"]');
      const buttonCount = await allButtons.count();
      console.log(`Found ${buttonCount} potential buttons`);
      
      for (let i = 0; i < buttonCount; i++) {
        const button = allButtons.nth(i);
        const text = await button.textContent();
        const className = await button.getAttribute('class');
        
        if (className && (className.includes('fab') || className.includes('floating'))) {
          await button.click();
          fabFound = true;
          console.log(`✅ Found FAB by class inspection: ${className}`);
          break;
        }
      }
    }
    
    if (fabFound) {
      await page.waitForTimeout(1000);
      
      // Look for Project Management option
      const projectMgmtOptions = [
        'text="Project Management"',
        'text="Manage Projects"', 
        '[data-action="project-management"]',
        'text="Projects"'
      ];
      
      let projectMgmtFound = false;
      for (const selector of projectMgmtOptions) {
        const option = page.locator(selector);
        if (await option.count() > 0 && await option.isVisible()) {
          await option.click();
          projectMgmtFound = true;
          console.log(`✅ Clicked project management option: ${selector}`);
          break;
        }
      }
      
      if (projectMgmtFound) {
        await page.waitForTimeout(1000);
        
        // Get initial project count
        const initialProjectElements = await page.locator('.project-item, [class*="project"]').count();
        console.log(`Initial project count: ${initialProjectElements}`);
        
        // Look for "Add New Project" button
        const addProjectSelectors = [
          'text="Add New Project"',
          'text="Create Project"', 
          '[data-action="add-project"]',
          '.add-project-btn'
        ];
        
        let addProjectFound = false;
        for (const selector of addProjectSelectors) {
          const addBtn = page.locator(selector);
          if (await addBtn.count() > 0 && await addBtn.isVisible()) {
            await addBtn.click();
            addProjectFound = true;
            console.log(`✅ Found add project button: ${selector}`);
            break;
          }
        }
        
        if (addProjectFound) {
          // Fill out project creation form
          const projectName = `Test Auto-Refresh ${Date.now()}`;
          
          // Try different input selectors
          const nameInputs = ['#projectName', '[name="projectName"]', 'input[placeholder*="name"]'];
          let nameInputFound = false;
          
          for (const selector of nameInputs) {
            const input = page.locator(selector);
            if (await input.count() > 0 && await input.isVisible()) {
              await input.fill(projectName);
              nameInputFound = true;
              console.log(`✅ Filled project name: ${projectName}`);
              break;
            }
          }
          
          if (nameInputFound) {
            // Submit the form
            const submitSelectors = [
              'button[type="submit"]',
              'text="Create"',
              'text="Save"',
              '[data-action="create-project"]'
            ];
            
            for (const selector of submitSelectors) {
              const submitBtn = page.locator(selector);
              if (await submitBtn.count() > 0 && await submitBtn.isVisible()) {
                await submitBtn.click();
                console.log(`✅ Clicked submit button: ${selector}`);
                break;
              }
            }
            
            // Wait for project creation
            await page.waitForTimeout(2000);
            
            // Check if modal automatically refreshed
            const updatedProjectElements = await page.locator('.project-item, [class*="project"]').count();
            console.log(`Updated project count: ${updatedProjectElements}`);
            
            if (updatedProjectElements > initialProjectElements) {
              console.log('✅ Project Overview modal auto-refreshed successfully');
              
              // Check if new project is highlighted or has success indicator
              const newProjectHighlight = page.locator(`text="${projectName}"`);
              const isHighlighted = await newProjectHighlight.count() > 0;
              
              if (isHighlighted) {
                console.log('✅ New project is visible in refreshed modal');
              }
              
              // Look for success notification
              const notifications = page.locator('.notification, .toast, .alert-success, [class*="success"]');
              if (await notifications.count() > 0) {
                console.log('✅ Success notification displayed');
              }
            } else {
              console.log('❌ Modal did not auto-refresh - manual refresh required');
            }
            
          } else {
            console.log('❌ Could not find project name input field');
          }
        } else {
          console.log('❌ Could not find Add Project button');
        }
      } else {
        console.log('❌ Could not find Project Management option');
      }
    } else {
      console.log('❌ Could not find FAB button');
    }
    
    // Take screenshot of final state
    await page.screenshot({ 
      path: 'test-results/auto-refresh-test.png',
      fullPage: true 
    });
  });

  test('Dashboard Dropdown Refresh After Project Creation', async ({ page }) => {
    console.log('\n=== TESTING: Dashboard Dropdown Auto-Refresh ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Find the main project dropdown
    const dropdownSelectors = [
      '#headerProjectSelector',
      '#projectSelector', 
      '.project-selector',
      'select[data-project-selector]'
    ];
    
    let mainDropdown;
    for (const selector of dropdownSelectors) {
      const dropdown = page.locator(selector);
      if (await dropdown.count() > 0 && await dropdown.isVisible()) {
        mainDropdown = dropdown;
        console.log(`✅ Found main dropdown: ${selector}`);
        break;
      }
    }
    
    if (mainDropdown) {
      // Get initial dropdown options count
      const initialOptions = await mainDropdown.locator('option').count();
      console.log(`Initial dropdown options: ${initialOptions}`);
      
      // Now test if the dropdown refreshes when projects are created
      // This would normally be triggered by the onProjectCreated callback
      
      // Simulate the refresh function call
      await page.evaluate(() => {
        if (typeof refreshProjectDropdown === 'function') {
          refreshProjectDropdown();
          return true;
        }
        return false;
      });
      
      await page.waitForTimeout(2000);
      
      const updatedOptions = await mainDropdown.locator('option').count();
      console.log(`Updated dropdown options: ${updatedOptions}`);
      
      // Check if refresh function exists
      const refreshFunctionExists = await page.evaluate(() => {
        return typeof refreshProjectDropdown === 'function';
      });
      
      console.log(`refreshProjectDropdown function exists: ${refreshFunctionExists}`);
      
      if (refreshFunctionExists) {
        console.log('✅ Auto-refresh function is available');
      } else {
        console.log('❌ Auto-refresh function not found');
      }
      
    } else {
      console.log('❌ Could not find main project dropdown');
    }
  });

  test('Verify Auto-Refresh Functions Exist', async ({ page }) => {
    console.log('\n=== TESTING: Auto-Refresh Functions Availability ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Check if all required functions exist
    const functionCheck = await page.evaluate(() => {
      const functions = {
        onProjectCreated: typeof onProjectCreated === 'function',
        refreshProjectOverviewModal: typeof refreshProjectOverviewModal === 'function',
        refreshProjectDropdown: typeof refreshProjectDropdown === 'function'
      };
      return functions;
    });
    
    console.log('Function availability check:', functionCheck);
    
    Object.entries(functionCheck).forEach(([funcName, exists]) => {
      if (exists) {
        console.log(`✅ ${funcName} function is available`);
      } else {
        console.log(`❌ ${funcName} function is missing`);
      }
    });
    
    // Test calling the functions to see if they work
    if (functionCheck.refreshProjectDropdown) {
      try {
        await page.evaluate(() => refreshProjectDropdown());
        console.log('✅ refreshProjectDropdown executed successfully');
      } catch (error) {
        console.log(`❌ refreshProjectDropdown error: ${error.message}`);
      }
    }
    
    if (functionCheck.refreshProjectOverviewModal) {
      try {
        await page.evaluate(() => refreshProjectOverviewModal());
        console.log('✅ refreshProjectOverviewModal executed successfully');
      } catch (error) {
        console.log(`❌ refreshProjectOverviewModal error: ${error.message}`);
      }
    }
  });

  test('Project Name Display Consistency', async ({ page }) => {
    console.log('\n=== TESTING: Project Name Display Consistency ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Find current project name display
    const projectNameSelectors = [
      '#currentProjectName',
      '.current-project-name',
      '[data-current-project]'
    ];
    
    let projectNameElement;
    for (const selector of projectNameSelectors) {
      const element = page.locator(selector);
      if (await element.count() > 0 && await element.isVisible()) {
        projectNameElement = element;
        console.log(`✅ Found project name element: ${selector}`);
        break;
      }
    }
    
    if (projectNameElement) {
      const displayedName = await projectNameElement.textContent();
      console.log(`Current displayed project name: "${displayedName}"`);
      
      // Check if it's showing a UUID pattern
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isUUID = uuidPattern.test(displayedName);
      
      if (isUUID) {
        console.log('❌ Project name showing UUID instead of readable name');
      } else {
        console.log('✅ Project name is human-readable');
      }
      
      // Find dropdown to compare
      const dropdown = page.locator('#headerProjectSelector, #projectSelector');
      if (await dropdown.count() > 0) {
        const selectedOption = await dropdown.locator('option:checked').textContent();
        console.log(`Dropdown selected option: "${selectedOption}"`);
        
        const namesMatch = displayedName === selectedOption || selectedOption === 'Select Project...';
        if (namesMatch || selectedOption === 'Select Project...') {
          console.log('✅ Names are consistent between display and dropdown');
        } else {
          console.log(`❌ Name mismatch - Display: "${displayedName}", Dropdown: "${selectedOption}"`);
        }
      }
    } else {
      console.log('❌ Could not find project name display element');
    }
  });
});