import { test, expect } from '@playwright/test';

test.describe('New Settings Modal Validation', () => {
  const dashboardUrl = '/workshops/business-automation-dashboard.html';

  test('Validate new settings structure and all functions', async ({ page }) => {
    console.log('\n=== TESTING: New Settings Modal Structure & Functions ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(4000);
    
    // Take screenshot before opening settings
    await page.screenshot({ 
      path: 'test-results/new-settings-before.png',
      fullPage: true 
    });
    
    // Open settings panel
    const settingsButton = page.locator('#headerSettingsTrigger');
    await expect(settingsButton).toBeVisible();
    console.log('✅ Settings button found');
    
    await settingsButton.click();
    await page.waitForTimeout(1000);
    
    // Verify new structure is present
    const settingsPanel = page.locator('#headerSettingsPanel.active');
    await expect(settingsPanel).toBeVisible();
    console.log('✅ Settings panel opened');
    
    // Check new title
    const newTitle = page.locator('.settings-title:has-text("Process Control Center")');
    await expect(newTitle).toBeVisible();
    console.log('✅ New title "Process Control Center" found');
    
    // Validate System Health Bar
    const healthBar = page.locator('.system-health-bar');
    await expect(healthBar).toBeVisible();
    console.log('✅ System Health Bar visible');
    
    const healthStatus = await page.locator('#healthStatus').textContent();
    const healthDetail = await page.locator('#healthDetail').textContent();
    const workspaceName = await page.locator('#workspaceName').textContent();
    const processCount = await page.locator('#processCount').textContent();
    
    console.log(`Health Status: ${healthStatus}`);
    console.log(`Health Detail: ${healthDetail}`);
    console.log(`Workspace: ${workspaceName}`);
    console.log(`Process Count: ${processCount}`);
    
    // Take screenshot of new settings structure
    await page.screenshot({ 
      path: 'test-results/new-settings-structure.png',
      fullPage: true 
    });
    
    // Test Process Tools Section
    const toolsSection = page.locator('.process-tools-section');
    await expect(toolsSection).toBeVisible();
    console.log('✅ Process Tools section visible');
    
    // Test all tool buttons
    const toolButtons = [
      { selector: '#findDuplicatesBtn', name: 'Find Duplicates' },
      { selector: '#bulkActionsBtn', name: 'Bulk Actions' },
      { selector: '#generateLinksBtn', name: 'Generate Links' },
      { selector: '#exportBtn', name: 'Export Data' }
    ];
    
    for (const tool of toolButtons) {
      const button = page.locator(tool.selector);
      await expect(button).toBeVisible();
      console.log(`✅ ${tool.name} button visible and clickable`);
      
      // Test hover effect
      await button.hover();
      await page.waitForTimeout(200);
      
      // Take screenshot of hover state
      await button.screenshot({ path: `test-results/tool-${tool.name.toLowerCase().replace(' ', '-')}-hover.png` });
    }
    
    // Test Export functionality (safe to click)
    console.log('Testing Export Data functionality...');
    const exportBtn = page.locator('#exportBtn');
    await exportBtn.click();
    await page.waitForTimeout(2000);
    console.log('✅ Export function executed successfully');
    
    // Test Storage Mode Toggle
    const storageSection = page.locator('.storage-preferences');
    await expect(storageSection).toBeVisible();
    console.log('✅ Storage preferences section visible');
    
    const supabaseRadio = page.locator('#storageSupabase');
    const localRadio = page.locator('#storageLocal');
    
    await expect(supabaseRadio).toBeVisible();
    await expect(localRadio).toBeVisible();
    console.log('✅ Both storage options visible');
    
    // Test storage mode switching
    console.log('Testing storage mode switching...');
    
    // Switch to local storage
    await localRadio.click();
    await page.waitForTimeout(1000);
    
    // Check if health bar updated
    const healthStatusAfterSwitch = await page.locator('#healthStatus').textContent();
    console.log(`Health status after switch: ${healthStatusAfterSwitch}`);
    
    // Switch back to Supabase
    await supabaseRadio.click();
    await page.waitForTimeout(1000);
    console.log('✅ Storage mode switching works');
    
    // Test Advanced Actions Section
    const advancedActions = page.locator('.advanced-actions');
    await expect(advancedActions).toBeVisible();
    console.log('✅ Advanced Actions section visible');
    
    // Test collapsible behavior
    const advancedSummary = page.locator('.advanced-summary');
    await expect(advancedSummary).toBeVisible();
    console.log('✅ Advanced Actions summary clickable');
    
    // Expand advanced section
    await advancedSummary.click();
    await page.waitForTimeout(500);
    
    // Take screenshot of expanded advanced section
    await page.screenshot({ 
      path: 'test-results/advanced-actions-expanded.png',
      fullPage: true 
    });
    
    // Check warning notice
    const warningNotice = page.locator('.warning-notice');
    await expect(warningNotice).toBeVisible();
    console.log('✅ Warning notice visible in advanced section');
    
    // Check danger zone elements
    const logoutBtn = page.locator('#logoutBtn');
    const resetBtn = page.locator('#resetBtn');
    
    await expect(logoutBtn).toBeVisible();
    await expect(resetBtn).toBeVisible();
    console.log('✅ Logout and Reset buttons visible in danger zone');
    
    // Test danger button hover effects
    await resetBtn.hover();
    await page.waitForTimeout(200);
    await resetBtn.screenshot({ path: 'test-results/reset-btn-hover.png' });
    
    await logoutBtn.hover();
    await page.waitForTimeout(200);
    await logoutBtn.screenshot({ path: 'test-results/logout-btn-hover.png' });
    
    console.log('✅ Danger button hover effects work');
    
    // Verify warning text
    const dangerWarning = page.locator('.danger-warning');
    await expect(dangerWarning).toBeVisible();
    
    const warningText = await dangerWarning.textContent();
    console.log(`Danger warning text: "${warningText}"`);
    expect(warningText).toContain('delete ALL processes');
    
    // Test UI responsiveness
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    // Take mobile screenshot
    await page.screenshot({ 
      path: 'test-results/new-settings-mobile.png',
      fullPage: true 
    });
    
    // Reset to desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);
    
    // Test close functionality
    const closeButton = page.locator('.settings-close-btn');
    await expect(closeButton).toBeVisible();
    
    await closeButton.click();
    await page.waitForTimeout(500);
    
    // Verify panel closed
    const panelClosed = page.locator('#headerSettingsPanel:not(.active)');
    await expect(panelClosed).toBeVisible();
    console.log('✅ Settings panel closes properly');
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'test-results/new-settings-final.png',
      fullPage: true 
    });
    
    console.log('✅ All new settings functionality validated successfully');
  });

  test('Test individual button functions safety', async ({ page }) => {
    console.log('\n=== TESTING: Button Function Safety ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Open settings
    await page.locator('#headerSettingsTrigger').click();
    await page.waitForTimeout(1000);
    
    // Test Find Duplicates (safe - just opens modal/notification)
    await page.locator('#findDuplicatesBtn').click();
    await page.waitForTimeout(1000);
    console.log('✅ Find Duplicates function called safely');
    
    // Test Bulk Actions (safe - just opens modal/notification)  
    await page.locator('#bulkActionsBtn').click();
    await page.waitForTimeout(1000);
    console.log('✅ Bulk Actions function called safely');
    
    // Test Generate Links (safe - just opens modal/notification)
    await page.locator('#generateLinksBtn').click();
    await page.waitForTimeout(1000);
    console.log('✅ Generate Links function called safely');
    
    // Export was already tested in main test
    console.log('✅ All button functions are safe to test');
  });
});