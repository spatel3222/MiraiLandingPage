import { test, expect } from '@playwright/test';

test.describe('Settings UI Screenshots for Validation', () => {
  const dashboardUrl = '/workshops/business-automation-dashboard.html';

  test('Capture new settings UI for agent assessment', async ({ page }) => {
    console.log('\n=== CAPTURING: New Settings UI for Agent Assessment ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(4000);
    
    // Capture dashboard before settings
    await page.screenshot({ 
      path: 'test-results/ui-validation-dashboard-before.png',
      fullPage: true 
    });
    
    // Open settings
    const settingsButton = page.locator('#headerSettingsTrigger');
    await settingsButton.click();
    await page.waitForTimeout(1000);
    
    // Capture full new settings structure
    await page.screenshot({ 
      path: 'test-results/ui-validation-new-settings-full.png',
      fullPage: true 
    });
    
    // Capture just the settings panel
    const settingsPanel = page.locator('#headerSettingsPanel');
    await settingsPanel.screenshot({ 
      path: 'test-results/ui-validation-settings-panel-only.png'
    });
    
    // Test and capture health bar
    const healthBar = page.locator('.system-health-bar');
    await healthBar.screenshot({ 
      path: 'test-results/ui-validation-health-bar.png'
    });
    
    // Test and capture process tools section
    const toolsSection = page.locator('.process-tools-section');
    await toolsSection.screenshot({ 
      path: 'test-results/ui-validation-process-tools.png'
    });
    
    // Test storage preferences
    const storageSection = page.locator('.storage-preferences');
    await storageSection.screenshot({ 
      path: 'test-results/ui-validation-storage-preferences.png'
    });
    
    // Open advanced actions
    const advancedSummary = page.locator('.advanced-summary');
    await advancedSummary.click();
    await page.waitForTimeout(500);
    
    // Capture advanced actions expanded
    await page.screenshot({ 
      path: 'test-results/ui-validation-advanced-expanded.png',
      fullPage: true 
    });
    
    // Capture just the advanced section
    const advancedSection = page.locator('.advanced-actions');
    await advancedSection.screenshot({ 
      path: 'test-results/ui-validation-advanced-section.png'
    });
    
    // Test mobile responsive
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'test-results/ui-validation-mobile-view.png',
      fullPage: true 
    });
    
    // Test tablet view
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'test-results/ui-validation-tablet-view.png',
      fullPage: true 
    });
    
    // Reset to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);
    
    console.log('✅ All UI validation screenshots captured successfully');
    
    // Log the structure for reference
    const structureValidation = await page.evaluate(() => {
      const panel = document.getElementById('headerSettingsPanel');
      if (!panel) return { error: 'Panel not found' };
      
      return {
        title: document.querySelector('.settings-title')?.textContent,
        subtitle: document.querySelector('.settings-subtitle')?.textContent,
        healthBar: !!document.querySelector('.system-health-bar'),
        processTools: !!document.querySelector('.process-tools-section'),
        toolButtons: Array.from(document.querySelectorAll('.tool-btn')).map(btn => btn.textContent?.trim()),
        storageOptions: Array.from(document.querySelectorAll('.storage-option')).length,
        advancedActions: !!document.querySelector('.advanced-actions'),
        dangerZone: !!document.querySelector('.danger-zone'),
        warningNotice: !!document.querySelector('.warning-notice')
      };
    });
    
    console.log('Structure Validation:', JSON.stringify(structureValidation, null, 2));
    
    return structureValidation;
  });
});