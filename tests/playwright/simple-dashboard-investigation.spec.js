const { test, expect } = require('@playwright/test');

/**
 * SIMPLE DASHBOARD INVESTIGATION
 * 
 * Basic investigation of the dashboard structure and data to understand
 * how the system actually works.
 */

test.describe('Dashboard Investigation', () => {
  const dashboardPath = '/workshops/business-automation-dashboard.html';

  test('🔍 Investigate Dashboard Structure and Data', async ({ page }) => {
    console.log('\n🔍 DASHBOARD STRUCTURE INVESTIGATION');
    console.log('=' * 50);
    
    // Navigate to dashboard
    await page.goto(dashboardPath);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // Give it more time to load
    
    // Check projects dropdown
    console.log('\n📋 PROJECT DROPDOWN INVESTIGATION:');
    const projectSelector = page.locator('#headerProjectSelector');
    const selectorExists = await projectSelector.count() > 0;
    console.log(`   Project selector exists: ${selectorExists}`);
    
    if (selectorExists) {
      const options = await projectSelector.evaluate(el => {
        return Array.from(el.options).map(option => ({
          value: option.value,
          text: option.text,
          selected: option.selected
        }));
      });
      
      console.log(`   Available options: ${options.length}`);
      options.forEach((option, index) => {
        console.log(`     ${index + 1}. "${option.text}" (ID: ${option.value}) ${option.selected ? '← SELECTED' : ''}`);
      });
      
      // Try selecting testSept9b
      const testSept9bOption = options.find(o => o.text.includes('testSept9b'));
      if (testSept9bOption) {
        console.log(`\n🔄 Attempting to select testSept9b (${testSept9bOption.value})...`);
        await projectSelector.selectOption(testSept9bOption.value);
        await page.waitForTimeout(5000); // Wait for data to load
        
        // Check what happened after selection
        const newSelection = await projectSelector.evaluate(el => el.options[el.selectedIndex]?.text);
        console.log(`   New selection: "${newSelection}"`);
      }
    }
    
    // Check global JavaScript state
    console.log('\n🔧 JAVASCRIPT STATE INVESTIGATION:');
    const jsState = await page.evaluate(() => {
      return {
        currentProjectId: window.currentProjectId,
        currentProject: window.currentProject,
        projects: window.projects ? window.projects.length : 'undefined',
        processes: window.processes ? window.processes.length : 'undefined',
        workshopDB: !!window.workshopDB,
        supabaseConnected: !!(window.workshopDB && window.workshopDB.isConnected && window.workshopDB.isConnected()),
        localStorage: {
          businessProjects: !!localStorage.getItem('businessProjects'),
          processKeys: Object.keys(localStorage).filter(k => k.startsWith('processes_')).length
        }
      };
    });
    
    console.log(`   currentProjectId: "${jsState.currentProjectId}"`);
    console.log(`   currentProject: "${jsState.currentProject}"`);
    console.log(`   projects array length: ${jsState.projects}`);
    console.log(`   processes array length: ${jsState.processes}`);
    console.log(`   workshopDB available: ${jsState.workshopDB}`);
    console.log(`   supabase connected: ${jsState.supabaseConnected}`);
    console.log(`   localStorage business projects: ${jsState.localStorage.businessProjects}`);
    console.log(`   localStorage process keys: ${jsState.localStorage.processKeys}`);
    
    // Look for dashboard elements
    console.log('\n🎨 DASHBOARD ELEMENTS INVESTIGATION:');
    
    // Check for common dashboard selectors
    const selectors = [
      '.metric-card',
      '.kpi-card',
      '.matrix-quadrant',
      '.dashboard-container',
      '.metric-label',
      '.metric-value',
      '.kpi-title',
      '.kpi-value'
    ];
    
    for (const selector of selectors) {
      const count = await page.locator(selector).count();
      console.log(`   ${selector}: ${count} elements`);
    }
    
    // Try to find any elements with "process" text
    const processElements = await page.locator('text=process').count();
    console.log(`   Elements containing "process": ${processElements}`);
    
    // Try to find any elements with numbers
    const numberElements = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const elementsWithNumbers = [];
      allElements.forEach(el => {
        if (el.textContent && /\d+/.test(el.textContent) && el.textContent.trim().length < 50) {
          elementsWithNumbers.push({
            tag: el.tagName,
            class: el.className,
            text: el.textContent.trim()
          });
        }
      });
      return elementsWithNumbers.slice(0, 10); // First 10 only
    });
    
    console.log(`\n🔢 ELEMENTS WITH NUMBERS (sample):`)
    numberElements.forEach((el, index) => {
      console.log(`   ${index + 1}. <${el.tag.toLowerCase()} class="${el.class}"> "${el.text}"`);
    });
    
    // Check page HTML structure
    const bodyText = await page.locator('body').textContent();
    console.log(`\n📄 BODY TEXT LENGTH: ${bodyText.length} characters`);
    
    // Look for key phrases
    const keyPhrases = ['Total Processes', 'Departments', 'Automation Readiness', 'Annual Savings', 'Quick Win'];
    console.log(`\n🔍 KEY PHRASES SEARCH:`);
    for (const phrase of keyPhrases) {
      const found = bodyText.includes(phrase);
      console.log(`   "${phrase}": ${found ? '✅ Found' : '❌ Not found'}`);
    }
    
    // Take a screenshot for manual inspection
    await page.screenshot({
      path: '/Users/shivangpatel/Documents/GitHub/crtx.in/test-results/dashboard-investigation.png',
      fullPage: true
    });
    console.log(`\n📸 Screenshot saved: dashboard-investigation.png`);
    
    console.log('\n' + '=' * 50);
    
    expect(selectorExists).toBeTruthy();
  });
});