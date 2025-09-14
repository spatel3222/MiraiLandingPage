import { test, expect } from '@playwright/test';

test.describe('Settings Modal Data Validation', () => {
  const dashboardUrl = '/workshops/business-automation-dashboard.html';

  test('Verify settings shows correct project data', async ({ page }) => {
    console.log('\n=== TESTING: Settings Modal Data Updates ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(4000);
    
    // First select a project with processes
    const projectDropdown = page.locator('#headerProjectSelector');
    await projectDropdown.selectOption('7029fc69-769d-44e6-bc25-c746e38deb65'); // testSept9b (6 processes)
    await page.waitForTimeout(2000);
    
    // Get project name from dropdown
    const selectedProjectName = await page.evaluate(() => {
      const dropdown = document.getElementById('headerProjectSelector');
      return dropdown.options[dropdown.selectedIndex].text;
    });
    
    // Get process count from dashboard
    const dashboardProcessCount = await page.locator('#totalProcesses').textContent();
    
    console.log(`Selected Project: ${selectedProjectName}`);
    console.log(`Dashboard Process Count: ${dashboardProcessCount}`);
    
    // Open settings panel
    await page.locator('#headerSettingsTrigger').click();
    await page.waitForTimeout(1000);
    
    // Verify settings panel shows correct data
    const settingsData = await page.evaluate(() => {
      return {
        workspaceName: document.getElementById('workspaceName')?.textContent,
        processCount: document.getElementById('processCount')?.textContent,
        healthStatus: document.getElementById('healthStatus')?.textContent,
        healthDetail: document.getElementById('healthDetail')?.textContent
      };
    });
    
    console.log('Settings Panel Data:', settingsData);
    
    // Validate workspace name matches selected project
    expect(settingsData.workspaceName).toBe(selectedProjectName);
    console.log(`✅ Workspace name correct: ${settingsData.workspaceName}`);
    
    // Validate process count matches dashboard
    expect(settingsData.processCount).toContain(dashboardProcessCount);
    console.log(`✅ Process count matches: ${settingsData.processCount}`);
    
    // Validate health status is not empty
    expect(settingsData.healthStatus).toBeTruthy();
    expect(settingsData.healthStatus).not.toBe('Loading...');
    console.log(`✅ Health status showing: ${settingsData.healthStatus}`);
    
    // Take screenshot of updated settings
    await page.screenshot({ 
      path: 'test-results/settings-with-correct-data.png',
      fullPage: true 
    });
    
    // Close settings
    await page.locator('.settings-close-btn').click();
    await page.waitForTimeout(500);
    
    // Switch to different project
    await projectDropdown.selectOption('b29596bf-bbb0-41ae-8812-f406530679d9'); // testSept14 (0 processes)
    await page.waitForTimeout(2000);
    
    const emptyProjectName = await page.evaluate(() => {
      const dropdown = document.getElementById('headerProjectSelector');
      return dropdown.options[dropdown.selectedIndex].text;
    });
    
    const emptyProcessCount = await page.locator('#totalProcesses').textContent();
    
    console.log(`\nSwitched to Empty Project: ${emptyProjectName}`);
    console.log(`Empty Project Process Count: ${emptyProcessCount}`);
    
    // Open settings again
    await page.locator('#headerSettingsTrigger').click();
    await page.waitForTimeout(1000);
    
    // Verify settings updated for empty project
    const emptySettingsData = await page.evaluate(() => {
      return {
        workspaceName: document.getElementById('workspaceName')?.textContent,
        processCount: document.getElementById('processCount')?.textContent
      };
    });
    
    console.log('Empty Project Settings Data:', emptySettingsData);
    
    // Validate empty project shows correct data
    expect(emptySettingsData.workspaceName).toBe(emptyProjectName);
    expect(emptySettingsData.processCount).toContain('0');
    console.log('✅ Empty project data displays correctly');
    
    // Take screenshot of empty project settings
    await page.screenshot({ 
      path: 'test-results/settings-empty-project.png',
      fullPage: true 
    });
    
    console.log('✅ Settings modal correctly updates with project data');
  });

  test('Verify improved UI spacing and design', async ({ page }) => {
    console.log('\n=== TESTING: Improved UI Design ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Select project with data
    await page.locator('#headerProjectSelector').selectOption('7029fc69-769d-44e6-bc25-c746e38deb65');
    await page.waitForTimeout(2000);
    
    // Open settings
    await page.locator('#headerSettingsTrigger').click();
    await page.waitForTimeout(1000);
    
    // Capture improved UI sections
    const healthBar = page.locator('.system-health-bar');
    await healthBar.screenshot({ 
      path: 'test-results/improved-health-bar.png'
    });
    
    const toolsSection = page.locator('.process-tools-section');
    await toolsSection.screenshot({ 
      path: 'test-results/improved-tools-section.png'
    });
    
    const storageSection = page.locator('.storage-preferences');
    await storageSection.screenshot({ 
      path: 'test-results/improved-storage-section.png'
    });
    
    // Test storage toggle functionality
    const localRadio = page.locator('#storageLocal');
    await localRadio.click();
    await page.waitForTimeout(500);
    
    // Verify visual feedback
    const isLocalChecked = await localRadio.isChecked();
    expect(isLocalChecked).toBe(true);
    console.log('✅ Storage toggle works with improved design');
    
    // Open advanced actions
    await page.locator('.advanced-summary').click();
    await page.waitForTimeout(500);
    
    const advancedSection = page.locator('.advanced-actions');
    await advancedSection.screenshot({ 
      path: 'test-results/improved-advanced-section.png'
    });
    
    // Full panel screenshot
    const settingsPanel = page.locator('#headerSettingsPanel');
    await settingsPanel.screenshot({ 
      path: 'test-results/improved-full-panel.png'
    });
    
    // Verify CSS improvements applied
    const designValidation = await page.evaluate(() => {
      const healthBar = document.querySelector('.system-health-bar');
      const toolsGrid = document.querySelector('.tools-grid');
      const storageToggle = document.querySelector('.storage-toggle');
      
      const healthBarStyle = healthBar ? getComputedStyle(healthBar) : null;
      const toolsGridStyle = toolsGrid ? getComputedStyle(toolsGrid) : null;
      
      return {
        healthBarPadding: healthBarStyle?.padding,
        healthBarRadius: healthBarStyle?.borderRadius,
        toolsGridGap: toolsGridStyle?.gap,
        toolsGridColumns: toolsGridStyle?.gridTemplateColumns,
        hasStorageToggle: !!storageToggle,
        hasImprovedSpacing: healthBarStyle?.marginBottom === '24px'
      };
    });
    
    console.log('Design Improvements Applied:', designValidation);
    
    expect(designValidation.hasImprovedSpacing).toBe(true);
    console.log('✅ Improved spacing and design verified');
  });
});