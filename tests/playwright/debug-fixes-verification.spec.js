import { test, expect } from '@playwright/test';

test.describe('Business Automation Dashboard - Debug Fixes Verification', () => {
  const dashboardUrl = '/workshops/business-automation-dashboard.html';

  test.beforeEach(async ({ page }) => {
    // Set up console message tracking
    page.on('console', msg => {
      console.log(`Console ${msg.type()}: ${msg.text()}`);
    });

    // Set up error tracking
    page.on('pageerror', error => {
      console.error(`Page error: ${error.message}`);
    });
  });

  test('1. UI/Visual Verification - Clean Interface Without Debug Messages', async ({ page }) => {
    console.log('\n=== TESTING: Clean UI without debug messages ===');
    
    // Navigate to dashboard without debug parameter
    await page.goto(dashboardUrl);
    
    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000); // Allow for initialization
    
    // Check that debug containers are hidden
    const debugInfo = page.locator('#debug-info');
    await expect(debugInfo).toHaveCSS('display', 'none');
    
    // Check debug panel is hidden  
    const debugPanel = page.locator('.debug-panel');
    if (await debugPanel.count() > 0) {
      await expect(debugPanel).toHaveCSS('display', 'none');
    }
    
    // Verify page height is reasonable (not 3x viewport)
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    const heightRatio = bodyHeight / viewportHeight;
    
    console.log(`Body height: ${bodyHeight}px, Viewport: ${viewportHeight}px, Ratio: ${heightRatio.toFixed(2)}`);
    
    // Page should not be excessively tall (less than 3x viewport height)
    expect(heightRatio).toBeLessThan(3.0);
    
    // Check that no debug messages are visible in the UI
    const visibleDebugText = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const debugKeywords = ['debug:', 'console.log', 'Debug Information:', '🔄', '⚙️', '🚀'];
      
      for (let element of elements) {
        if (element.offsetParent !== null) { // Element is visible
          const text = element.textContent || '';
          for (let keyword of debugKeywords) {
            if (text.includes(keyword)) {
              return { found: true, text: text.substring(0, 100), keyword };
            }
          }
        }
      }
      return { found: false };
    });
    
    expect(visibleDebugText.found).toBeFalsy();
    console.log('✅ No debug messages visible in UI');
  });

  test('2. Mobile Responsive Behavior', async ({ page }) => {
    console.log('\n=== TESTING: Mobile responsive behavior ===');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // Check page height in mobile view
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    const heightRatio = bodyHeight / viewportHeight;
    
    console.log(`Mobile - Body height: ${bodyHeight}px, Viewport: ${viewportHeight}px, Ratio: ${heightRatio.toFixed(2)}`);
    
    // Should have reasonable scrolling in mobile
    expect(heightRatio).toBeLessThan(4.0); // Mobile can be taller but not excessive
    
    // Check that debug containers are still hidden in mobile
    const debugInfo = page.locator('#debug-info');
    await expect(debugInfo).toHaveCSS('display', 'none');
    
    console.log('✅ Mobile responsive behavior is normal');
  });

  test('3. Core Functionality Testing', async ({ page }) => {
    console.log('\n=== TESTING: Core dashboard functionality ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Test project selector
    const projectSelector = page.locator('#projectSelector');
    await expect(projectSelector).toBeVisible();
    
    // Test that testSept9b option exists and can be selected
    const testOption = page.locator('#projectSelector option[value="testSept9b"]');
    await expect(testOption).toBeVisible();
    
    // Select testSept9b project
    await projectSelector.selectOption('testSept9b');
    await page.waitForTimeout(2000);
    
    // Check that charts container exists and is visible
    const chartsContainer = page.locator('#charts-container, .charts-container, #chart-container, .chart-container');
    if (await chartsContainer.count() > 0) {
      await expect(chartsContainer.first()).toBeVisible();
    }
    
    // Test FAB button
    const fabButton = page.locator('.fab, .floating-action-button, #fab-button');
    if (await fabButton.count() > 0) {
      await expect(fabButton.first()).toBeVisible();
      console.log('✅ FAB button is visible');
    }
    
    // Test settings panel opening
    const settingsButton = page.locator('[data-action="settings"], .settings-button, #settings-button');
    if (await settingsButton.count() > 0) {
      await settingsButton.first().click();
      await page.waitForTimeout(1000);
      
      const settingsPanel = page.locator('.settings-panel, #settings-panel, .settings-modal');
      if (await settingsPanel.count() > 0) {
        await expect(settingsPanel.first()).toBeVisible();
        console.log('✅ Settings panel opens correctly');
        
        // Close settings
        const closeButton = page.locator('.close-button, [data-action="close"], .settings-close');
        if (await closeButton.count() > 0) {
          await closeButton.first().click();
          await page.waitForTimeout(500);
        }
      }
    }
    
    console.log('✅ Core functionality tests completed');
  });

  test('4. Console Verification - No Errors', async ({ page }) => {
    console.log('\n=== TESTING: Console errors and debug messages ===');
    
    const consoleMessages = [];
    const jsErrors = [];
    
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text()
      });
    });
    
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000); // Allow time for all initialization
    
    // Check for JavaScript errors
    console.log(`Found ${jsErrors.length} JavaScript errors`);
    jsErrors.forEach(error => console.error(`JS Error: ${error}`));
    expect(jsErrors.length).toBe(0);
    
    // Check console messages - should be minimal without debug=true
    const debugMessages = consoleMessages.filter(msg => 
      msg.text.includes('🔄') || 
      msg.text.includes('⚙️') || 
      msg.text.includes('🚀') ||
      msg.text.includes('debug:') ||
      msg.text.includes('Debug')
    );
    
    console.log(`Found ${debugMessages.length} debug-related console messages (should be 0 or very few)`);
    debugMessages.forEach(msg => console.log(`Debug msg: ${msg.type} - ${msg.text}`));
    
    // Should have very few or no debug messages without debug=true
    expect(debugMessages.length).toBeLessThan(5);
    
    console.log('✅ Console verification completed');
  });

  test('5. Debug Mode Testing with debug=true Parameter', async ({ page }) => {
    console.log('\n=== TESTING: Debug mode with debug=true ===');
    
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text()
      });
    });
    
    // Navigate with debug=true parameter
    await page.goto(`${dashboardUrl}?debug=true`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Now debug messages should appear in console
    const debugMessages = consoleMessages.filter(msg => 
      msg.text.includes('🔄') || 
      msg.text.includes('⚙️') || 
      msg.text.includes('🚀') ||
      msg.text.includes('debug:') ||
      msg.text.includes('Debug')
    );
    
    console.log(`Found ${debugMessages.length} debug messages with debug=true (should be more than 0)`);
    
    // Should have debug messages when debug=true is used
    expect(debugMessages.length).toBeGreaterThan(0);
    
    console.log('✅ Debug mode works correctly');
  });

  test('6. Network Requests Verification', async ({ page }) => {
    console.log('\n=== TESTING: Network requests and loading ===');
    
    const failedRequests = [];
    
    page.on('requestfailed', request => {
      failedRequests.push({
        url: request.url(),
        failure: request.failure()
      });
    });
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);
    
    // Check for failed requests (excluding known unavailable resources)
    const criticalFailures = failedRequests.filter(req => 
      !req.url.includes('favicon') && 
      !req.url.includes('manifest') &&
      !req.url.includes('sw.js') &&
      !req.url.includes('service-worker')
    );
    
    console.log(`Found ${criticalFailures.length} critical failed requests`);
    criticalFailures.forEach(req => {
      console.error(`Failed request: ${req.url} - ${req.failure?.errorText}`);
    });
    
    // Should have no critical failed requests
    expect(criticalFailures.length).toBe(0);
    
    console.log('✅ Network requests verification completed');
  });

  test('7. Performance and Loading Speed', async ({ page }) => {
    console.log('\n=== TESTING: Performance and loading speed ===');
    
    const startTime = Date.now();
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    
    const domLoadTime = Date.now() - startTime;
    console.log(`DOM load time: ${domLoadTime}ms`);
    
    // Wait for full load
    await page.waitForLoadState('load');
    const fullLoadTime = Date.now() - startTime;
    console.log(`Full load time: ${fullLoadTime}ms`);
    
    // Should load reasonably fast (under 10 seconds for initial load)
    expect(fullLoadTime).toBeLessThan(10000);
    
    // Check that main elements are present
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('#projectSelector')).toBeVisible();
    
    console.log('✅ Performance testing completed');
  });

  test('8. Comprehensive UI State Verification', async ({ page }) => {
    console.log('\n=== TESTING: Comprehensive UI state ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Take screenshot for manual review
    await page.screenshot({ 
      path: 'test-results/dashboard-clean-state.png',
      fullPage: true 
    });
    
    // Verify professional appearance elements
    const mainContainer = page.locator('body, .dashboard-container, .main-container');
    await expect(mainContainer.first()).toBeVisible();
    
    // Check that page title is appropriate
    const title = await page.title();
    console.log(`Page title: "${title}"`);
    expect(title).toBeTruthy();
    expect(title).not.toContain('debug');
    expect(title).not.toContain('Debug');
    
    // Verify no technical error messages are visible
    const errorPatterns = ['Error:', 'undefined', 'null', 'NaN', 'TypeError', 'ReferenceError'];
    
    for (const pattern of errorPatterns) {
      const errorElements = page.locator(`text=${pattern}`);
      const count = await errorElements.count();
      if (count > 0) {
        console.warn(`Found ${count} elements containing "${pattern}"`);
      }
    }
    
    console.log('✅ UI state verification completed');
  });
});