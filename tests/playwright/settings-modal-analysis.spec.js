import { test, expect } from '@playwright/test';

test.describe('Settings Modal Structure Analysis', () => {
  const dashboardUrl = '/workshops/business-automation-dashboard.html';

  test('Analyze settings modal structure and components', async ({ page }) => {
    console.log('\n=== ANALYZING: Settings Modal Structure ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(4000);
    
    // First, let's find all possible settings buttons/triggers
    const settingsTriggers = await page.evaluate(() => {
      const triggers = [];
      
      // Look for settings elements with simpler selectors
      const settingsElements = document.querySelectorAll('*[class*="setting"], *[id*="setting"], button');
      settingsElements.forEach((el, index) => {
        // Filter for settings-related elements
        if (el.className?.toLowerCase().includes('setting') || 
            el.id?.toLowerCase().includes('setting') || 
            el.textContent?.toLowerCase().includes('setting') ||
            el.onclick?.toString().includes('setting')) {
        triggers.push({
          type: 'settings_element',
          index,
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          onclick: el.getAttribute('onclick'),
          textContent: el.textContent?.trim(),
          visible: el.offsetParent !== null
        });
      });
      
      // Look for gear icons or cog icons
      const gearIcons = document.querySelectorAll('svg[class*="gear"], svg[class*="cog"], .fa-gear, .fa-cog, [class*="gear"], [class*="cog"]');
      gearIcons.forEach((el, index) => {
        triggers.push({
          type: 'gear_icon',
          index,
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          parent: el.parentElement?.tagName,
          parentClass: el.parentElement?.className,
          visible: el.offsetParent !== null
        });
      });
      
      // Look for menu buttons that might open settings
      const menuButtons = document.querySelectorAll('[class*="menu"], [id*="menu"], button:has-text("Menu")');
      menuButtons.forEach((el, index) => {
        triggers.push({
          type: 'menu_element',
          index,
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          onclick: el.getAttribute('onclick'),
          textContent: el.textContent?.trim(),
          visible: el.offsetParent !== null
        });
      });
      
      return triggers;
    });
    
    console.log('Found potential settings triggers:', JSON.stringify(settingsTriggers, null, 2));
    
    // Look for existing settings modals in the DOM
    const settingsModals = await page.evaluate(() => {
      const modals = [];
      
      // Look for modal elements that might be settings
      const modalElements = document.querySelectorAll('[class*="modal"], [id*="modal"], [class*="settings"], [id*="settings"]');
      modalElements.forEach((el, index) => {
        if (el.textContent?.toLowerCase().includes('setting') || 
            el.className?.toLowerCase().includes('setting') ||
            el.id?.toLowerCase().includes('setting')) {
          
          modals.push({
            type: 'settings_modal',
            index,
            tagName: el.tagName,
            className: el.className,
            id: el.id,
            visible: el.offsetParent !== null,
            display: getComputedStyle(el).display,
            innerHTML: el.innerHTML?.substring(0, 500) + '...' // First 500 chars
          });
        }
      });
      
      return modals;
    });
    
    console.log('Found existing settings modals:', JSON.stringify(settingsModals, null, 2));
    
    // Check FAB menu for settings option
    const fabMain = page.locator('#fabMainBtn, .fab-main');
    if (await fabMain.count() > 0) {
      await fabMain.click();
      await page.waitForTimeout(1000);
      
      // Check FAB options for settings
      const fabOptions = await page.evaluate(() => {
        const options = [];
        const fabElements = document.querySelectorAll('.fab-option, [class*="fab"]');
        
        fabElements.forEach((el, index) => {
          if (el.textContent?.toLowerCase().includes('setting') ||
              el.className?.toLowerCase().includes('setting') ||
              el.onclick?.toString().includes('setting')) {
            options.push({
              type: 'fab_settings_option',
              index,
              tagName: el.tagName,
              className: el.className,
              id: el.id,
              onclick: el.getAttribute('onclick'),
              textContent: el.textContent?.trim(),
              visible: el.offsetParent !== null
            });
          }
        });
        
        return options;
      });
      
      console.log('FAB settings options found:', JSON.stringify(fabOptions, null, 2));
      
      // Try to find and click any settings option in FAB
      const settingsOption = page.locator('.fab-option:has-text("Settings"), [onclick*="setting"]').first();
      if (await settingsOption.count() > 0) {
        console.log('Clicking settings option in FAB...');
        await settingsOption.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Look for header settings button
    const headerSettings = page.locator('header [class*="setting"], .header [class*="setting"], .top-nav [class*="setting"]');
    if (await headerSettings.count() > 0) {
      console.log('Found header settings button, clicking...');
      await headerSettings.first().click();
      await page.waitForTimeout(1000);
    }
    
    // Check if any settings modal is now visible
    const activeModal = await page.evaluate(() => {
      const modals = document.querySelectorAll('[class*="modal"]');
      let activeModalInfo = null;
      
      modals.forEach(modal => {
        const isVisible = modal.offsetParent !== null && 
                         getComputedStyle(modal).display !== 'none' &&
                         getComputedStyle(modal).visibility !== 'hidden';
        
        if (isVisible && (modal.className.includes('active') || 
                         modal.textContent?.toLowerCase().includes('setting'))) {
          activeModalInfo = {
            tagName: modal.tagName,
            className: modal.className,
            id: modal.id,
            innerHTML: modal.innerHTML,
            computedStyle: {
              display: getComputedStyle(modal).display,
              visibility: getComputedStyle(modal).visibility,
              opacity: getComputedStyle(modal).opacity,
              zIndex: getComputedStyle(modal).zIndex
            }
          };
        }
      });
      
      return activeModalInfo;
    });
    
    if (activeModal) {
      console.log('Active settings modal found!');
      console.log('Modal info:', JSON.stringify(activeModal, null, 2));
      
      // Take screenshot of settings modal
      await page.screenshot({ 
        path: 'test-results/settings-modal-structure.png',
        fullPage: true 
      });
      
      // Analyze modal content structure
      const modalContent = await page.evaluate(() => {
        const modal = document.querySelector('[class*="modal"].active, [class*="modal"][style*="block"]');
        if (!modal) return null;
        
        return {
          formElements: Array.from(modal.querySelectorAll('input, select, textarea, button')).map(el => ({
            tag: el.tagName,
            type: el.type,
            name: el.name,
            id: el.id,
            className: el.className,
            placeholder: el.placeholder,
            value: el.value,
            textContent: el.textContent?.trim()
          })),
          sections: Array.from(modal.querySelectorAll('section, div[class*="section"], .setting-group')).map(el => ({
            className: el.className,
            id: el.id,
            textContent: el.textContent?.trim().substring(0, 100)
          })),
          headers: Array.from(modal.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(el => ({
            tag: el.tagName,
            textContent: el.textContent?.trim(),
            className: el.className
          }))
        };
      });
      
      console.log('Settings modal content structure:', JSON.stringify(modalContent, null, 2));
      
    } else {
      console.log('No active settings modal found. Settings might not exist or need different trigger.');
      
      // Take screenshot of current state anyway
      await page.screenshot({ 
        path: 'test-results/dashboard-no-settings-modal.png',
        fullPage: true 
      });
    }
    
    console.log('✅ Settings modal structure analysis completed');
  });
});