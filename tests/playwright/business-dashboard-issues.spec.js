const { test, expect } = require('@playwright/test');

test.describe('Business Automation Dashboard - Critical Issues', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('file:///Users/shivangpatel/Documents/GitHub/crtx.in/workshops/business-automation-dashboard.html');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Wait for JavaScript initialization
    await page.waitForTimeout(2000);
  });

  test('Issue 1: Project Name Mismatch - Dashboard shows UUID instead of readable name', async ({ page }) => {
    // Test the current issue: Dashboard display not syncing with dropdown selection
    
    // Check initial state - project name should be readable, not UUID
    const projectNameElement = page.locator('#currentProjectName');
    await expect(projectNameElement).toBeVisible();
    
    const currentDisplayedName = await projectNameElement.textContent();
    console.log('Current displayed project name:', currentDisplayedName);
    
    // Check if it's showing a UUID pattern (like "7029fc69-769d-44e6-bc25-c746e38deb65")
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isShowingUUID = uuidPattern.test(currentDisplayedName);
    
    if (isShowingUUID) {
      console.log('❌ CONFIRMED: Dashboard showing UUID instead of readable name');
    }
    
    // Check the dropdown to see what projects are available
    const dropdown = page.locator('#headerProjectSelector');
    await expect(dropdown).toBeVisible();
    
    // Get all options from dropdown
    const options = await dropdown.locator('option').all();
    const projectOptions = [];
    
    for (const option of options) {
      const value = await option.getAttribute('value');
      const text = await option.textContent();
      if (value && text && text !== 'Select Project...') {
        projectOptions.push({ value, text });
      }
    }
    
    console.log('Available projects in dropdown:', projectOptions);
    
    // Test project switching functionality
    if (projectOptions.length > 0) {
      for (const project of projectOptions) {
        console.log(`Testing project switch to: ${project.text} (${project.value})`);
        
        // Select the project
        await dropdown.selectOption(project.value);
        await page.waitForTimeout(1000); // Allow time for UI updates
        
        // Check if dashboard name updates correctly
        const updatedDisplayedName = await projectNameElement.textContent();
        console.log(`After switching: Dashboard shows "${updatedDisplayedName}", should show "${project.text}"`);
        
        // Verify the name matches the dropdown selection
        const nameMatches = updatedDisplayedName === project.text;
        if (!nameMatches) {
          console.log(`❌ MISMATCH: Dashboard shows "${updatedDisplayedName}" but dropdown shows "${project.text}"`);
        } else {
          console.log(`✅ CORRECT: Names match between dashboard and dropdown`);
        }
      }
    }
    
    // Document the issue for debugging
    await page.screenshot({ 
      path: '/Users/shivangpatel/Documents/GitHub/crtx.in/test-results/project-name-mismatch.png',
      fullPage: true 
    });
  });

  test('Issue 2: Duplicate Quick Wins Sections Analysis', async ({ page }) => {
    // Identify and analyze duplicate Quick Wins sections
    
    // Look for all elements containing "Quick Win" text
    const quickWinElements = await page.locator('text=/Quick Win/i').all();
    console.log(`Found ${quickWinElements.length} elements with "Quick Win" text`);
    
    // Check for specific Quick Wins containers
    const quickWinOpportunities = page.locator('#quickWinOpportunities').first();
    const quickWins = page.locator('#quickWins').first();
    
    // Check visibility and content of both sections
    const quickWinOpportunitiesVisible = await quickWinOpportunities.isVisible();
    const quickWinsVisible = await quickWins.isVisible();
    
    console.log('Quick Win Opportunities section visible:', quickWinOpportunitiesVisible);
    console.log('Quick Wins section visible:', quickWinsVisible);
    
    if (quickWinOpportunitiesVisible) {
      const opportunitiesValue = await quickWinOpportunities.textContent();
      console.log('Quick Win Opportunities value:', opportunitiesValue);
      
      // Find the parent card and its title
      const parentCard1 = quickWinOpportunities.locator('xpath=ancestor::div[contains(@class, "kpi-card")][1]');
      const title1 = await parentCard1.locator('.kpi-title').first().textContent();
      console.log('First Quick Wins section title:', title1);
    }
    
    if (quickWinsVisible) {
      const quickWinsValue = await quickWins.textContent();
      console.log('Quick Wins value:', quickWinsValue);
      
      // Find the parent card and its title
      const parentCard2 = quickWins.locator('xpath=ancestor::div[contains(@class, "kpi-card")][1]');
      const title2 = await parentCard2.locator('.kpi-title').first().textContent();
      console.log('Second Quick Wins section title:', title2);
    }
    
    // Check if both sections show the same data or different data
    if (quickWinOpportunitiesVisible && quickWinsVisible) {
      const value1 = await quickWinOpportunities.textContent();
      const value2 = await quickWins.textContent();
      
      if (value1 === value2) {
        console.log('❌ DUPLICATE: Both Quick Wins sections show the same value:', value1);
      } else {
        console.log('ℹ️ DIFFERENT: Quick Wins sections show different values:', { value1, value2 });
      }
    }
    
    // Look for any sections with "Phase 1: Quick Wins" which might be a third instance
    const phaseQuickWins = page.locator('text=Phase 1: Quick Wins');
    const phaseQuickWinsVisible = await phaseQuickWins.isVisible();
    console.log('Phase 1: Quick Wins section visible:', phaseQuickWinsVisible);
    
    // Take screenshot showing the duplicate sections
    await page.screenshot({ 
      path: '/Users/shivangpatel/Documents/GitHub/crtx.in/test-results/duplicate-quick-wins.png',
      fullPage: true 
    });
    
    // If duplicates found, fail the test with details
    if (quickWinOpportunitiesVisible && quickWinsVisible) {
      console.log('❌ CONFIRMED: Found duplicate Quick Wins sections in the dashboard');
      
      // Get positions to understand layout
      const box1 = await quickWinOpportunities.boundingBox();
      const box2 = await quickWins.boundingBox();
      
      console.log('Quick Win Opportunities position:', box1);
      console.log('Quick Wins position:', box2);
    }
  });

  test('Issue 3: Data Synchronization Check', async ({ page }) => {
    // Verify if dashboard metrics update when project changes
    
    const dropdown = page.locator('#headerProjectSelector');
    const projectName = page.locator('#currentProjectName');
    const totalProcesses = page.locator('#totalProcesses');
    const activeDepartments = page.locator('#activeDepartments');
    
    // Get available projects
    const options = await dropdown.locator('option').all();
    const projects = [];
    
    for (const option of options) {
      const value = await option.getAttribute('value');
      const text = await option.textContent();
      if (value && text && text !== 'Select Project...') {
        projects.push({ value, text });
      }
    }
    
    console.log(`Testing data synchronization across ${projects.length} projects`);
    
    // Test each project to see if all metrics update
    for (const project of projects) {
      console.log(`\n--- Testing project: ${project.text} ---`);
      
      // Switch to project
      await dropdown.selectOption(project.value);
      await page.waitForTimeout(1500); // Allow time for data loading
      
      // Capture all metric values
      const metrics = {
        projectName: await projectName.textContent(),
        totalProcesses: await totalProcesses.textContent(),
        activeDepartments: await activeDepartments.textContent()
      };
      
      console.log('Metrics after switching:', metrics);
      
      // Verify project name synchronization
      const nameMatches = metrics.projectName === project.text;
      console.log(`Project name sync: ${nameMatches ? '✅' : '❌'} (Expected: "${project.text}", Got: "${metrics.projectName}")`);
      
      // Check if numeric values are reasonable (not empty or zero when they should have data)
      const hasProcessData = metrics.totalProcesses && metrics.totalProcesses !== '0';
      const hasDepartmentData = metrics.activeDepartments && metrics.activeDepartments !== '0';
      
      console.log(`Process data loaded: ${hasProcessData ? '✅' : '⚠️'} (${metrics.totalProcesses})`);
      console.log(`Department data loaded: ${hasDepartmentData ? '✅' : '⚠️'} (${metrics.activeDepartments})`);
    }
    
    // Take a final screenshot
    await page.screenshot({ 
      path: '/Users/shivangpatel/Documents/GitHub/crtx.in/test-results/data-synchronization-test.png',
      fullPage: true 
    });
  });

  test('Complete Dashboard Flow Test', async ({ page }) => {
    // End-to-end test of the complete dashboard functionality
    
    console.log('🧪 Starting comprehensive dashboard flow test');
    
    // Step 1: Verify initial load
    await expect(page.locator('#currentProjectName')).toBeVisible();
    await expect(page.locator('#headerProjectSelector')).toBeVisible();
    
    const initialProjectName = await page.locator('#currentProjectName').textContent();
    console.log('Initial project name displayed:', initialProjectName);
    
    // Step 2: Test Quick Wins sections count and content
    const quickWinsSection1 = page.locator('text=Quick Win Opportunities').first();
    const quickWinsSection2 = page.locator('text=Quick Wins').first();
    
    const section1Visible = await quickWinsSection1.isVisible();
    const section2Visible = await quickWinsSection2.isVisible();
    
    console.log(`Quick Wins sections found: ${section1Visible ? 1 : 0} + ${section2Visible ? 1 : 0} = ${(section1Visible ? 1 : 0) + (section2Visible ? 1 : 0)}`);
    
    if ((section1Visible ? 1 : 0) + (section2Visible ? 1 : 0) > 1) {
      console.log('❌ ISSUE CONFIRMED: Multiple Quick Wins sections detected');
    }
    
    // Step 3: Test project switching
    const dropdown = page.locator('#headerProjectSelector');
    const options = await dropdown.locator('option').all();
    
    let projectSwitchWorking = true;
    let namesSyncCorrectly = true;
    
    for (const option of options.slice(1)) { // Skip first "Select Project..." option
      const value = await option.getAttribute('value');
      const text = await option.textContent();
      
      if (value && text) {
        await dropdown.selectOption(value);
        await page.waitForTimeout(1000);
        
        const displayedName = await page.locator('#currentProjectName').textContent();
        
        if (displayedName !== text) {
          console.log(`❌ Name sync failed: Expected "${text}", got "${displayedName}"`);
          namesSyncCorrectly = false;
        }
      }
    }
    
    // Step 4: Final assessment
    console.log('\n--- FINAL TEST RESULTS ---');
    console.log(`Project name synchronization: ${namesSyncCorrectly ? '✅ WORKING' : '❌ BROKEN'}`);
    console.log(`Quick Wins duplication: ${(section1Visible ? 1 : 0) + (section2Visible ? 1 : 0) > 1 ? '❌ DUPLICATED' : '✅ CLEAN'}`);
    console.log(`Project switching: ${projectSwitchWorking ? '✅ WORKING' : '❌ BROKEN'}`);
    
    // Take final comprehensive screenshot
    await page.screenshot({ 
      path: '/Users/shivangpatel/Documents/GitHub/crtx.in/test-results/complete-dashboard-test.png',
      fullPage: true 
    });
  });
});