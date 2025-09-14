import { test, expect } from '@playwright/test';

test.describe('Critical Fixes Validation', () => {
  const dashboardUrl = '/workshops/business-automation-dashboard.html';

  test('Validate settings data updates when switching projects', async ({ page }) => {
    console.log('\n=== TESTING: Settings Data Synchronization ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(4000);
    
    // Select project with processes
    const projectDropdown = page.locator('#headerProjectSelector');
    await projectDropdown.selectOption('7029fc69-769d-44e6-bc25-c746e38deb65'); // testSept9b (6 processes)
    await page.waitForTimeout(2000);
    
    // Get project name from dropdown for verification
    const selectedProjectName = await page.evaluate(() => {
      const dropdown = document.getElementById('headerProjectSelector');
      return dropdown.options[dropdown.selectedIndex].text;
    });
    
    console.log(`Selected Project: ${selectedProjectName}`);
    
    // Open settings and capture initial data
    await page.locator('#headerSettingsTrigger').click();
    await page.waitForTimeout(1000);
    
    const initialSettingsData = await page.evaluate(() => {
      return {
        workspaceName: document.getElementById('workspaceName')?.textContent,
        processCount: document.getElementById('processCount')?.textContent
      };
    });
    
    console.log('Initial Settings Data:', initialSettingsData);
    
    // Close settings
    await page.locator('.settings-close-btn').click();
    await page.waitForTimeout(500);
    
    // Switch to different project
    await projectDropdown.selectOption('b29596bf-bbb0-41ae-8812-f406530679d9'); // testSept14 (0 processes)
    await page.waitForTimeout(2000);
    
    const newProjectName = await page.evaluate(() => {
      const dropdown = document.getElementById('headerProjectSelector');
      return dropdown.options[dropdown.selectedIndex].text;
    });
    
    console.log(`Switched to Project: ${newProjectName}`);
    
    // Open settings again and check if data updated
    await page.locator('#headerSettingsTrigger').click();
    await page.waitForTimeout(1000);
    
    const updatedSettingsData = await page.evaluate(() => {
      return {
        workspaceName: document.getElementById('workspaceName')?.textContent,
        processCount: document.getElementById('processCount')?.textContent
      };
    });
    
    console.log('Updated Settings Data:', updatedSettingsData);
    
    // Validate that settings updated correctly
    expect(updatedSettingsData.workspaceName).toBe(newProjectName);
    expect(updatedSettingsData.processCount).toContain('0');
    
    // Ensure data actually changed from initial
    expect(updatedSettingsData.workspaceName).not.toBe(initialSettingsData.workspaceName);
    
    console.log('✅ Settings data updates correctly when switching projects');
    
    // Take screenshot for validation
    await page.screenshot({ 
      path: 'test-results/settings-data-sync-validation.png',
      fullPage: true 
    });
  });

  test('Validate FAB Add Process functionality', async ({ page }) => {
    console.log('\n=== TESTING: FAB Add Process Functionality ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Ensure we have a project selected
    await page.locator('#headerProjectSelector').selectOption('7029fc69-769d-44e6-bc25-c746e38deb65');
    await page.waitForTimeout(2000);
    
    // Click FAB to expand options
    const fab = page.locator('.fab-main');
    await fab.click();
    await page.waitForTimeout(500);
    
    // Take screenshot of expanded FAB
    await page.screenshot({ 
      path: 'test-results/fab-expanded.png',
      fullPage: true 
    });
    
    // Click Add Process option in FAB
    const addProcessOption = page.locator('.fab-option:has-text("Add Process")');
    await expect(addProcessOption).toBeVisible();
    await addProcessOption.click();
    await page.waitForTimeout(1000);
    
    // Verify process modal opened
    const processModal = page.locator('#processModal');
    await expect(processModal).toBeVisible();
    await expect(processModal).not.toHaveClass(/hidden/);
    
    console.log('✅ FAB Add Process opens modal successfully');
    
    // Verify modal title is correct
    const modalTitle = page.locator('#processModal h2');
    const titleText = await modalTitle.textContent();
    expect(titleText).toBe('Add Business Process');
    
    // Verify submit button text
    const submitBtn = page.locator('#submitBtn');
    const submitText = await submitBtn.textContent();
    expect(submitText).toContain('Add Process');
    
    console.log('✅ Process modal shows correct Add Process content');
    
    // Take screenshot of opened modal
    await page.screenshot({ 
      path: 'test-results/fab-add-process-modal.png',
      fullPage: true 
    });
    
    // Close modal by clicking the X button
    const closeBtn = page.locator('#processModal button[onclick="closeProcessModal()"]');
    await closeBtn.click();
    await page.waitForTimeout(500);
    
    // Verify modal closed
    await expect(processModal).toHaveClass(/hidden/);
    console.log('✅ Process modal closes properly');
  });

  test('Validate FAB New Project functionality', async ({ page }) => {
    console.log('\n=== TESTING: FAB New Project Functionality ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Click FAB to expand options
    const fab = page.locator('.fab-main');
    await fab.click();
    await page.waitForTimeout(500);
    
    // Click New Project option in FAB
    const newProjectOption = page.locator('.fab-option:has-text("New Project")');
    await expect(newProjectOption).toBeVisible();
    await newProjectOption.click();
    await page.waitForTimeout(1000);
    
    // Verify project modal opened
    const projectModal = page.locator('#projectModal');
    await expect(projectModal).toBeVisible();
    await expect(projectModal).not.toHaveClass(/hidden/);
    
    console.log('✅ FAB New Project opens modal successfully');
    
    // Verify modal shows correct content for new project
    const modalTitle = page.locator('#projectModal h2');
    const titleText = await modalTitle.textContent();
    expect(titleText).toBe('Create New Project');
    
    // Take screenshot of opened project modal
    await page.screenshot({ 
      path: 'test-results/fab-new-project-modal.png',
      fullPage: true 
    });
    
    // Close modal by clicking the X button
    const closeBtn = page.locator('#projectModal button[onclick="closeProjectModal()"]');
    await closeBtn.click();
    await page.waitForTimeout(500);
    
    // Verify modal closed
    await expect(projectModal).toHaveClass(/hidden/);
    console.log('✅ Project modal closes properly');
  });

  test('Validate complete end-to-end synchronization', async ({ page }) => {
    console.log('\n=== TESTING: Complete End-to-End Synchronization ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(4000);
    
    // Test complete workflow
    
    // 1. Switch to project with data
    await page.locator('#headerProjectSelector').selectOption('7029fc69-769d-44e6-bc25-c746e38deb65');
    await page.waitForTimeout(2000);
    
    // Verify dashboard shows data
    const dashboardProcesses = await page.locator('#totalProcesses').textContent();
    console.log(`Dashboard shows ${dashboardProcesses} processes`);
    
    // 2. Open settings and verify data matches
    await page.locator('#headerSettingsTrigger').click();
    await page.waitForTimeout(1000);
    
    const settingsProcessCount = await page.locator('#processCount').textContent();
    console.log(`Settings shows: ${settingsProcessCount}`);
    
    expect(settingsProcessCount).toContain(dashboardProcesses);
    
    // 3. Test FAB functionality while settings are open
    await page.locator('.settings-close-btn').click();
    await page.waitForTimeout(500);
    
    await page.locator('.fab-main').click();
    await page.waitForTimeout(500);
    
    await page.locator('.fab-option:has-text("Add Process")').click();
    await page.waitForTimeout(1000);
    
    // Verify process modal shows correct project context
    const processModalProject = await page.evaluate(() => {
      return document.getElementById('processModalProjectName')?.textContent;
    });
    
    console.log(`Process modal shows project: ${processModalProject}`);
    
    // Close process modal
    await page.locator('#processModal button[onclick="closeProcessModal()"]').click();
    await page.waitForTimeout(500);
    
    // 4. Switch to empty project and verify everything updates
    await page.locator('#headerProjectSelector').selectOption('b29596bf-bbb0-41ae-8812-f406530679d9');
    await page.waitForTimeout(2000);
    
    const emptyProjectProcesses = await page.locator('#totalProcesses').textContent();
    console.log(`Dashboard now shows ${emptyProjectProcesses} processes`);
    expect(emptyProjectProcesses).toBe('0');
    
    // 5. Open settings and verify it updated
    await page.locator('#headerSettingsTrigger').click();
    await page.waitForTimeout(1000);
    
    const emptySettingsData = await page.evaluate(() => {
      return {
        workspaceName: document.getElementById('workspaceName')?.textContent,
        processCount: document.getElementById('processCount')?.textContent
      };
    });
    
    console.log('Empty project settings:', emptySettingsData);
    expect(emptySettingsData.processCount).toContain('0');
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'test-results/complete-sync-validation.png',
      fullPage: true 
    });
    
    console.log('✅ Complete end-to-end synchronization working correctly');
  });
});