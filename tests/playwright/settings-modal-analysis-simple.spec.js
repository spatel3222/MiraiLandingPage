import { test, expect } from '@playwright/test';

test.describe('Settings Modal Structure Analysis', () => {
  const dashboardUrl = '/workshops/business-automation-dashboard.html';

  test('Find and analyze settings modal structure', async ({ page }) => {
    console.log('\n=== ANALYZING: Settings Modal Structure ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(4000);
    
    // Search for settings-related elements in the DOM
    const settingsAnalysis = await page.evaluate(() => {
      const results = {
        settingsElements: [],
        modals: [],
        fabOptions: [],
        headerElements: []
      };
      
      // Find all elements that might be settings-related
      document.querySelectorAll('*').forEach(el => {
        const text = el.textContent?.toLowerCase() || '';
        const className = el.className?.toLowerCase() || '';
        const id = el.id?.toLowerCase() || '';
        
        if (text.includes('setting') || className.includes('setting') || id.includes('setting')) {
          results.settingsElements.push({
            tagName: el.tagName,
            className: el.className,
            id: el.id,
            textContent: el.textContent?.trim(),
            onclick: el.getAttribute('onclick'),
            visible: el.offsetParent !== null
          });
        }
      });
      
      // Find all modal elements
      document.querySelectorAll('*[class*="modal"], *[id*="modal"]').forEach(el => {
        results.modals.push({
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          visible: el.offsetParent !== null,
          display: getComputedStyle(el).display,
          innerHTML: el.innerHTML?.substring(0, 300) + '...'
        });
      });
      
      // Find FAB options
      document.querySelectorAll('.fab-option, *[class*="fab"]').forEach(el => {
        results.fabOptions.push({
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          textContent: el.textContent?.trim(),
          onclick: el.getAttribute('onclick'),
          visible: el.offsetParent !== null
        });
      });
      
      // Find header elements
      document.querySelectorAll('header *, .header *, .top-nav *').forEach(el => {
        const text = el.textContent?.toLowerCase() || '';
        if (text.includes('setting') || text.includes('menu') || text.includes('option')) {
          results.headerElements.push({
            tagName: el.tagName,
            className: el.className,
            id: el.id,
            textContent: el.textContent?.trim(),
            onclick: el.getAttribute('onclick'),
            visible: el.offsetParent !== null
          });
        }
      });
      
      return results;
    });
    
    console.log('Settings Analysis Results:');
    console.log('Settings Elements Found:', settingsAnalysis.settingsElements.length);
    console.log('Modal Elements Found:', settingsAnalysis.modals.length);
    console.log('FAB Options Found:', settingsAnalysis.fabOptions.length);
    console.log('Header Elements Found:', settingsAnalysis.headerElements.length);
    
    console.log('\nDetailed Analysis:');
    console.log('Settings Elements:', JSON.stringify(settingsAnalysis.settingsElements, null, 2));
    console.log('Modals:', JSON.stringify(settingsAnalysis.modals, null, 2));
    console.log('FAB Options:', JSON.stringify(settingsAnalysis.fabOptions, null, 2));
    console.log('Header Elements:', JSON.stringify(settingsAnalysis.headerElements, null, 2));
    
    // Try to open FAB and look for settings
    const fabMain = page.locator('#fabMainBtn, .fab-main');
    if (await fabMain.count() > 0) {
      console.log('\nOpening FAB to check for settings options...');
      await fabMain.click();
      await page.waitForTimeout(1000);
      
      // Take screenshot of open FAB
      await page.screenshot({ 
        path: 'test-results/fab-menu-open.png'
      });
      
      // Check what options are now visible
      const fabOptionsVisible = await page.evaluate(() => {
        const options = [];
        document.querySelectorAll('.fab-option, *[class*="fab"]').forEach(el => {
          if (el.offsetParent !== null) {
            options.push({
              tagName: el.tagName,
              className: el.className,
              id: el.id,
              textContent: el.textContent?.trim(),
              onclick: el.getAttribute('onclick')
            });
          }
        });
        return options;
      });
      
      console.log('Visible FAB options:', JSON.stringify(fabOptionsVisible, null, 2));
    }
    
    // Take final screenshot of current state
    await page.screenshot({ 
      path: 'test-results/settings-analysis-final-state.png',
      fullPage: true 
    });
    
    console.log('✅ Settings modal structure analysis completed');
    
    return settingsAnalysis;
  });
});