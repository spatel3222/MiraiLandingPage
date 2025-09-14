import { test, expect } from '@playwright/test';

test.describe('Settings Modal Capture', () => {
  const dashboardUrl = '/workshops/business-automation-dashboard.html';

  test('Capture settings modal for UI analysis', async ({ page }) => {
    console.log('\n=== CAPTURING: Settings Modal Structure ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(4000);
    
    // Take screenshot before opening settings
    await page.screenshot({ 
      path: 'test-results/settings-before-open.png',
      fullPage: true 
    });
    
    // Click the settings button in header
    const settingsButton = page.locator('#headerSettingsTrigger, .settings-trigger');
    await expect(settingsButton).toBeVisible();
    console.log('✅ Settings button found and visible');
    
    await settingsButton.click();
    await page.waitForTimeout(1000);
    
    // Verify settings panel is open
    const settingsPanel = page.locator('#headerSettingsPanel');
    await expect(settingsPanel).toBeVisible();
    console.log('✅ Settings panel opened successfully');
    
    // Take screenshot of open settings
    await page.screenshot({ 
      path: 'test-results/settings-modal-open.png',
      fullPage: true 
    });
    
    // Take screenshot of just the settings panel
    await settingsPanel.screenshot({ 
      path: 'test-results/settings-panel-only.png'
    });
    
    // Log the structure for analysis
    const settingsStructure = await page.evaluate(() => {
      const panel = document.getElementById('headerSettingsPanel');
      if (!panel) return null;
      
      const sections = [];
      panel.querySelectorAll('.settings-section').forEach(section => {
        const title = section.querySelector('.settings-section-title')?.textContent?.trim();
        const items = Array.from(section.querySelectorAll('.settings-item, button')).map(item => {
          return {
            type: item.tagName,
            text: item.textContent?.trim(),
            className: item.className,
            onclick: item.getAttribute('onclick')
          };
        });
        sections.push({ title, items });
      });
      
      return {
        visible: panel.offsetParent !== null,
        className: panel.className,
        sections: sections
      };
    });
    
    console.log('Settings Structure:', JSON.stringify(settingsStructure, null, 2));
    
    console.log('✅ Settings modal capture completed');
    
    return settingsStructure;
  });
});