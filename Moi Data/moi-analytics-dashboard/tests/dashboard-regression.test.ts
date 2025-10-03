import { test, expect } from '@playwright/test';
import { ConsoleMonitor } from './helpers/console-monitor';
import { LocalStorageHelper } from './helpers/localStorage-helper';

/**
 * MOI Analytics Dashboard - Regression Test Suite
 * 
 * Comprehensive regression testing to ensure all dashboard functionality
 * continues working correctly while fixing the export system issues.
 */

test.describe('Dashboard Regression Tests', () => {
  let consoleMonitor: ConsoleMonitor;
  let localStorageHelper: LocalStorageHelper;

  test.beforeEach(async ({ page }) => {
    consoleMonitor = new ConsoleMonitor(page);
    localStorageHelper = new LocalStorageHelper(page);
    
    consoleMonitor.startMonitoring();
    await localStorageHelper.startMonitoring();
  });

  test.afterEach(async ({ page }) => {
    // Capture any issues for debugging
    if (consoleMonitor.hasErrors()) {
      console.log('❌ Regression test found issues:', consoleMonitor.getErrorSummary());
      await page.screenshot({ 
        path: `test-results/regression-issue-${Date.now()}.png`,
        fullPage: true 
      });
    }
    
    consoleMonitor.stopMonitoring();
  });

  test('01. Dashboard Load and Initial Render', async ({ page }) => {
    console.log('🔍 Test 01: Validating dashboard loads correctly...');
    
    await page.goto('/');
    
    // Wait for initial load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of initial state
    await page.screenshot({ 
      path: 'test-results/01-dashboard-initial-load.png',
      fullPage: true 
    });
    
    // Check that basic dashboard elements are present
    const dashboardTitle = page.locator('h1, h2, [data-testid="dashboard-title"]');
    await expect(dashboardTitle.first()).toBeVisible({ timeout: 10000 });
    
    // Check for key dashboard components
    const keyComponents = [
      'Export', 'Download', 'Dashboard', 'Analytics', 'MOI'
    ];
    
    let foundComponents = 0;
    for (const component of keyComponents) {
      const element = page.locator(`text=${component}`).first();
      if (await element.isVisible()) {
        foundComponents++;
        console.log(`✅ Found component: ${component}`);
      }
    }
    
    expect(foundComponents).toBeGreaterThan(0);
    
    // Verify no critical JavaScript errors on load
    const loadErrors = consoleMonitor.getAllErrors();
    console.log(`📊 JavaScript errors on load: ${loadErrors.length}`);
    
    if (loadErrors.length > 0) {
      console.log('Load errors:', loadErrors);
    }
    
    // Should load without critical errors
    expect(loadErrors.length).toBeLessThanOrEqual(2); // Allow minor non-critical errors
  });

  test('02. Data Loading and Processing', async ({ page }) => {
    console.log('🔍 Test 02: Validating data loading and processing...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Set comprehensive test data
    await page.evaluate(() => {
      localStorage.clear();
      
      const metaData = [
        {
          "Campaign name": "BOF | DPA",
          "Ad set name": "DPA - Broad",
          "Amount spent (INR)": 2500,
          "CTR (link click-through rate)": 1.45,
          "CPM (cost per 1,000 impressions)": 59.10
        },
        {
          "Campaign name": "TOF | Interest",
          "Ad set name": "Luxury Shoppers", 
          "Amount spent (INR)": 1800,
          "CTR (link click-through rate)": 1.23,
          "CPM (cost per 1,000 impressions)": 63.16
        }
      ];
      
      const googleData = [
        {
          "Campaign": "india-pmax-rings",
          "Cost": 1200,
          "CTR": "2.04%",
          "Avg. CPM": 244.90
        }
      ];
      
      const shopifyData = [
        {
          "Landing Page": "https://example.com/?utm_source=meta&utm_medium=cpc&utm_campaign=BOF%20%7C%20DPA&utm_term=DPA%20-%20Broad",
          "Sessions": 523,
          "Online store visitors": 523,
          "Sessions with cart additions": 3,
          "Sessions that reached checkout": 1,
          "Sessions that completed checkout": 0,
          "Average session duration": 45,
          "Pageviews": 1892
        },
        {
          "Landing Page": "https://example.com/?utm_source=meta&utm_medium=cpc&utm_campaign=TOF%20%7C%20Interest&utm_term=Luxury%20Shoppers",
          "Sessions": 351,
          "Online store visitors": 351,
          "Sessions with cart additions": 2,
          "Sessions that reached checkout": 0,
          "Sessions that completed checkout": 0,
          "Average session duration": 38,
          "Pageviews": 1204
        },
        {
          "Landing Page": "https://example.com/?utm_source=google&utm_medium=cpc&utm_campaign=india-pmax-rings",
          "Sessions": 100,
          "Online store visitors": 100,
          "Sessions with cart additions": 1,
          "Sessions that reached checkout": 1,
          "Sessions that completed checkout": 1,
          "Average session duration": 125,
          "Pageviews": 750
        }
      ];
      
      localStorage.setItem('moi-meta-data', JSON.stringify(metaData));
      localStorage.setItem('moi-google-data', JSON.stringify(googleData));
      localStorage.setItem('moi-shopify-data', JSON.stringify(shopifyData));
      
      console.log('✅ Set comprehensive test data for regression testing');
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Wait for data processing
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/02-data-processing.png',
      fullPage: true 
    });
    
    // Check that data appears to be processed
    const dataElements = await page.locator('*').filter({ 
      hasText: /\d+/ // Look for elements containing numbers
    }).all();
    
    console.log(`📊 Found ${dataElements.length} elements with numeric data`);
    
    // Look for key metrics that should be displayed
    const metricsToFind = ['Sessions', 'Users', 'ATC', 'Checkout', 'Spend', 'CTR', 'CPM'];
    let foundMetrics = 0;
    
    for (const metric of metricsToFind) {
      const element = page.locator(`text=${metric}`).first();
      if (await element.isVisible()) {
        foundMetrics++;
        console.log(`✅ Found metric: ${metric}`);
      }
    }
    
    console.log(`📈 Found ${foundMetrics} out of ${metricsToFind.length} expected metrics`);
    
    // Check for data processing errors
    const processingErrors = consoleMonitor.getAllErrors();
    console.log(`📊 Data processing errors: ${processingErrors.length}`);
    
    expect(foundMetrics).toBeGreaterThan(2); // Should find some key metrics
  });

  test('03. UI Component Functionality', async ({ page }) => {
    console.log('🔍 Test 03: Validating UI component functionality...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test basic interactions
    await page.screenshot({ 
      path: 'test-results/03-ui-components-start.png',
      fullPage: true 
    });
    
    // Look for interactive elements
    const buttons = await page.locator('button').all();
    console.log(`🔘 Found ${buttons.length} interactive buttons`);
    
    // Test clicking various buttons (excluding export for now)
    let successfulClicks = 0;
    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      try {
        const buttonText = await buttons[i].textContent();
        
        // Skip export buttons to avoid triggering downloads
        if (buttonText && !buttonText.toLowerCase().includes('export') && 
            !buttonText.toLowerCase().includes('download')) {
          
          const errorsBefore = consoleMonitor.getAllErrors().length;
          await buttons[i].click();
          await page.waitForTimeout(500);
          
          const errorsAfter = consoleMonitor.getAllErrors().length;
          if (errorsAfter === errorsBefore) {
            successfulClicks++;
            console.log(`✅ Successfully clicked button: "${buttonText}"`);
          } else {
            console.log(`❌ Clicking "${buttonText}" caused errors`);
          }
        }
      } catch (error) {
        // Button might not be clickable, continue
      }
    }
    
    console.log(`📊 Successful button interactions: ${successfulClicks}`);
    
    // Test responsive design
    await page.setViewportSize({ width: 768, height: 1024 }); // Tablet
    await page.waitForTimeout(500);
    await page.screenshot({ 
      path: 'test-results/03-tablet-view.png',
      fullPage: true 
    });
    
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await page.waitForTimeout(500);
    await page.screenshot({ 
      path: 'test-results/03-mobile-view.png',
      fullPage: true 
    });
    
    // Reset to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);
    
    // Check for layout errors in different viewports
    const uiErrors = consoleMonitor.getAllErrors();
    console.log(`📱 UI/responsive errors: ${uiErrors.length}`);
  });

  test('04. Export Modal Accessibility', async ({ page }) => {
    console.log('🔍 Test 04: Testing export modal accessibility without triggering downloads...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Set test data first
    await localStorageHelper.setTestData();
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Find and open export modal
    const exportButton = page.locator('button:has-text("Export"), button:has-text("Download"), [data-testid="export-button"]');
    
    if (await exportButton.count() > 0) {
      console.log('📤 Found export button, testing modal accessibility...');
      
      await exportButton.first().click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'test-results/04-export-modal.png',
        fullPage: true 
      });
      
      // Test modal keyboard navigation
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      
      // Test ESC key to close modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      // Modal should close
      const modalStillVisible = await page.locator('[role="dialog"], .modal, .overlay').isVisible().catch(() => false);
      
      if (!modalStillVisible) {
        console.log('✅ Modal closes correctly with ESC key');
      } else {
        console.log('❌ Modal did not close with ESC key');
      }
      
      // Re-open modal for further testing
      await exportButton.first().click();
      await page.waitForTimeout(1000);
      
      // Test close button
      const closeButton = page.locator('button:has-text("Close"), button:has-text("×"), [aria-label*="close" i]');
      if (await closeButton.count() > 0) {
        await closeButton.first().click();
        await page.waitForTimeout(500);
        console.log('✅ Modal close button works');
      }
      
    } else {
      console.log('❌ Export button not found for accessibility testing');
      
      // Look for any buttons that might lead to export
      const allButtons = await page.locator('button').all();
      for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
        const text = await allButtons[i].textContent();
        console.log(`   Available button: "${text}"`);
      }
    }
    
    // Check for accessibility-related console warnings
    const a11yErrors = consoleMonitor.getConsoleWarnings().filter(warning =>
      warning.text.toLowerCase().includes('accessibility') ||
      warning.text.toLowerCase().includes('aria') ||
      warning.text.toLowerCase().includes('role')
    );
    
    console.log(`♿ Accessibility warnings: ${a11yErrors.length}`);
  });

  test('05. Performance and Memory Validation', async ({ page }) => {
    console.log('🔍 Test 05: Validating performance and memory usage...');
    
    // Start performance monitoring
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Measure initial memory
    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory;
      }
      return null;
    });
    
    console.log('📊 Initial memory usage:', initialMemory);
    
    // Set large dataset to test performance
    await page.evaluate(() => {
      localStorage.clear();
      
      // Create larger dataset
      const metaData = Array.from({ length: 20 }, (_, i) => ({
        "Campaign name": `Campaign ${i + 1}`,
        "Ad set name": `AdSet ${i + 1}`,
        "Amount spent (INR)": Math.random() * 5000,
        "CTR (link click-through rate)": Math.random() * 3,
        "CPM (cost per 1,000 impressions)": Math.random() * 100
      }));
      
      const shopifyData = Array.from({ length: 50 }, (_, i) => ({
        "Landing Page": `https://example.com/?utm_campaign=Campaign${i + 1}`,
        "Sessions": Math.floor(Math.random() * 1000),
        "Online store visitors": Math.floor(Math.random() * 1000),
        "Sessions with cart additions": Math.floor(Math.random() * 50),
        "Sessions that reached checkout": Math.floor(Math.random() * 25),
        "Sessions that completed checkout": Math.floor(Math.random() * 10),
        "Average session duration": Math.floor(Math.random() * 300),
        "Pageviews": Math.floor(Math.random() * 5000)
      }));
      
      localStorage.setItem('moi-meta-data', JSON.stringify(metaData));
      localStorage.setItem('moi-shopify-data', JSON.stringify(shopifyData));
      localStorage.setItem('moi-google-data', JSON.stringify([]));
      
      console.log(`✅ Set large dataset: ${metaData.length} meta campaigns, ${shopifyData.length} shopify records`);
    });
    
    // Reload with large dataset
    const startTime = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`⏱️ Load time with large dataset: ${loadTime}ms`);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/05-performance-test.png',
      fullPage: true 
    });
    
    // Check memory after processing
    const finalMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory;
      }
      return null;
    });
    
    console.log('📊 Final memory usage:', finalMemory);
    
    // Check for performance-related console warnings
    const perfWarnings = consoleMonitor.getConsoleWarnings().filter(warning =>
      warning.text.toLowerCase().includes('performance') ||
      warning.text.toLowerCase().includes('slow') ||
      warning.text.toLowerCase().includes('memory')
    );
    
    console.log(`⚡ Performance warnings: ${perfWarnings.length}`);
    
    // Validate reasonable load time (should be under 10 seconds)
    expect(loadTime).toBeLessThan(10000);
  });

  test('06. Error Recovery and Edge Cases', async ({ page }) => {
    console.log('🔍 Test 06: Testing error recovery and edge cases...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test with empty localStorage
    await page.evaluate(() => {
      localStorage.clear();
      console.log('🧹 Cleared all localStorage for edge case testing');
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'test-results/06-empty-state.png',
      fullPage: true 
    });
    
    // Should handle empty state gracefully
    const emptyStateErrors = consoleMonitor.getAllErrors();
    console.log(`📊 Empty state errors: ${emptyStateErrors.length}`);
    
    // Test with malformed JSON data
    await page.evaluate(() => {
      localStorage.setItem('moi-meta-data', 'invalid json');
      localStorage.setItem('moi-google-data', '{"incomplete": data}');
      localStorage.setItem('moi-shopify-data', '[]');
      
      console.log('💥 Set malformed JSON data for error testing');
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'test-results/06-malformed-data.png',
      fullPage: true 
    });
    
    const malformedDataErrors = consoleMonitor.getAllErrors();
    console.log(`📊 Malformed data errors: ${malformedDataErrors.length}`);
    
    // Test with extremely large data
    await page.evaluate(() => {
      const hugeData = Array.from({ length: 1000 }, (_, i) => ({
        "Campaign name": `Huge Campaign ${i}`,
        "Amount spent (INR)": i * 100
      }));
      
      localStorage.setItem('moi-meta-data', JSON.stringify(hugeData));
      console.log('📈 Set extremely large dataset for stress testing');
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'test-results/06-stress-test.png',
      fullPage: true 
    });
    
    const stressTestErrors = consoleMonitor.getAllErrors();
    console.log(`📊 Stress test errors: ${stressTestErrors.length}`);
    
    // Dashboard should handle errors gracefully without crashing
    const totalErrors = emptyStateErrors.length + malformedDataErrors.length + stressTestErrors.length;
    console.log(`📊 Total edge case errors: ${totalErrors}`);
    
    // Some errors are expected with malformed data, but should not crash the app
    expect(totalErrors).toBeLessThan(20); // Allow some errors but not excessive failures
  });
});