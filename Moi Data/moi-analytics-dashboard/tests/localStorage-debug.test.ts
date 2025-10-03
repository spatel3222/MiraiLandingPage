import { test, expect } from '@playwright/test';
import { ConsoleMonitor } from './helpers/console-monitor';
import { LocalStorageHelper } from './helpers/localStorage-helper';

/**
 * MOI Analytics Dashboard - localStorage Debugging Test Suite
 * 
 * CRITICAL ISSUE: Export system looks for 'moi-meta-data' and 'moi-google-data'
 * but localStorage contains 'moi-server-topLevel' and 'moi-server-adset' with actual data.
 * 
 * These tests systematically identify and fix the disconnect.
 */

test.describe('localStorage Debugging Suite', () => {
  let consoleMonitor: ConsoleMonitor;
  let localStorageHelper: LocalStorageHelper;

  test.beforeEach(async ({ page }) => {
    consoleMonitor = new ConsoleMonitor(page);
    localStorageHelper = new LocalStorageHelper(page);
    
    // Start monitoring before any page navigation
    consoleMonitor.startMonitoring();
    await localStorageHelper.startMonitoring();
  });

  test.afterEach(async ({ page }) => {
    // Generate debugging report for each test
    const storageState = await localStorageHelper.exportStorageState();
    const errorSummary = consoleMonitor.getErrorSummary();
    const storageChanges = await localStorageHelper.getStorageChanges();
    
    // Save debugging information
    await page.evaluate((debugInfo) => {
      console.log('🐛 Test Debug Report:', debugInfo);
    }, {
      storageState,
      errorSummary,
      storageChanges,
      timestamp: new Date().toISOString()
    });
    
    consoleMonitor.stopMonitoring();
  });

  test('01. Identify localStorage Key Mismatch', async ({ page }) => {
    console.log('🔍 Test 01: Investigating localStorage key structure...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of initial state
    await page.screenshot({ 
      path: 'test-results/01-initial-state.png',
      fullPage: true 
    });
    
    // Debug the exact key mismatch issue
    const debugInfo = await localStorageHelper.debugExportSystemKeys();
    
    console.log('📊 Key Analysis Results:');
    console.log('Expected keys status:', debugInfo.expectedKeys);
    console.log('Available keys:', debugInfo.availableKeys);
    console.log('Mismatch analysis:', debugInfo.mismatchAnalysis);
    
    // Check if we have any console errors during initial load
    const errors = consoleMonitor.getAllErrors();
    if (errors.length > 0) {
      console.log('❌ Console errors during load:', errors);
    }
    
    // Validate our findings
    expect(debugInfo.availableKeys.length).toBeGreaterThan(0);
    
    // Check for the key issue: export system expects different keys
    const hasMetaData = debugInfo.expectedKeys['moi-meta-data'];
    const hasGoogleData = debugInfo.expectedKeys['moi-google-data'];
    
    // Document the issue
    if (!hasMetaData || !hasGoogleData) {
      console.log('🚨 ISSUE CONFIRMED: Export system expects keys that do not exist');
      console.log(`   moi-meta-data exists: ${hasMetaData}`);
      console.log(`   moi-google-data exists: ${hasGoogleData}`);
    }
    
    // Check if we have data in server-side keys instead
    const moiKeys = debugInfo.availableKeys.filter(key => key.includes('moi-server'));
    console.log('📂 Server-side keys found:', moiKeys);
    
    // Generate detailed report
    const allStorageData = await localStorageHelper.getAllStorageData();
    console.log('💾 Complete localStorage state:', Object.keys(allStorageData));
  });

  test('02. Reproduce Export System Failure', async ({ page }) => {
    console.log('🔍 Test 02: Reproducing export system failure...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard"], .dashboard, h1, h2', { timeout: 10000 });
    
    // Try to trigger export - look for export button or modal
    await page.screenshot({ 
      path: 'test-results/02-before-export.png',
      fullPage: true 
    });
    
    // Find and click export button
    const exportButton = page.locator('button:has-text("Export"), button:has-text("Download"), button[title*="export" i], button[aria-label*="export" i]');
    
    if (await exportButton.count() > 0) {
      console.log('📤 Found export button, attempting to click...');
      await exportButton.first().click();
      
      // Wait for export modal or process
      await page.waitForTimeout(1000);
      
      // Take screenshot of export interface
      await page.screenshot({ 
        path: 'test-results/02-export-modal.png',
        fullPage: true 
      });
      
      // Try to trigger an actual export
      const downloadButton = page.locator('button:has-text("Download"), button:has-text("Export")');
      if (await downloadButton.count() > 0) {
        console.log('⬇️ Found download button, attempting export...');
        
        // Monitor console during export
        const errorsBefore = consoleMonitor.getAllErrors().length;
        
        await downloadButton.first().click();
        await page.waitForTimeout(2000); // Give time for export process
        
        const errorsAfter = consoleMonitor.getAllErrors().length;
        const newErrors = errorsAfter - errorsBefore;
        
        if (newErrors > 0) {
          console.log(`❌ ${newErrors} new errors during export process`);
          const exportErrors = consoleMonitor.getExportErrors();
          const localStorageErrors = consoleMonitor.getLocalStorageErrors();
          
          console.log('Export-related errors:', exportErrors);
          console.log('LocalStorage-related errors:', localStorageErrors);
        }
        
        // Check localStorage after export attempt
        const debugInfo = await localStorageHelper.debugExportSystemKeys();
        console.log('📊 Post-export localStorage analysis:', debugInfo.mismatchAnalysis);
      }
    } else {
      console.log('❌ No export button found on page');
      
      // Look for other UI elements that might lead to export
      const allButtons = await page.locator('button').all();
      console.log(`🔍 Found ${allButtons.length} buttons on page`);
      
      for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
        const buttonText = await allButtons[i].textContent();
        console.log(`   Button ${i + 1}: "${buttonText}"`);
      }
    }
    
    // Final screenshot
    await page.screenshot({ 
      path: 'test-results/02-after-export-attempt.png',
      fullPage: true 
    });
  });

  test('03. Fix localStorage Key Issue', async ({ page }) => {
    console.log('🔍 Test 03: Testing localStorage key fix...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // First, verify the current broken state
    const brokenState = await localStorageHelper.debugExportSystemKeys();
    console.log('📊 Initial broken state:', brokenState.mismatchAnalysis);
    
    // Clear storage and set correct test data
    await localStorageHelper.clearStorage();
    await localStorageHelper.setTestData();
    
    // Verify the fix
    const fixedState = await localStorageHelper.debugExportSystemKeys();
    console.log('📊 Fixed state:', fixedState.expectedKeys);
    
    // Verify that expected keys now exist
    expect(fixedState.expectedKeys['moi-meta-data']).toBe(true);
    expect(fixedState.expectedKeys['moi-google-data']).toBe(true);
    
    // Refresh page to test with corrected data
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of fixed state
    await page.screenshot({ 
      path: 'test-results/03-fixed-state.png',
      fullPage: true 
    });
    
    // Try export again with corrected data
    const exportButton = page.locator('button:has-text("Export"), button:has-text("Download")');
    
    if (await exportButton.count() > 0) {
      console.log('📤 Testing export with corrected localStorage...');
      
      const errorsBefore = consoleMonitor.getAllErrors().length;
      await exportButton.first().click();
      await page.waitForTimeout(1000);
      
      // Try to download a report
      const downloadButton = page.locator('button:has-text("Download")');
      if (await downloadButton.count() > 0) {
        await downloadButton.first().click();
        await page.waitForTimeout(2000);
        
        const errorsAfter = consoleMonitor.getAllErrors().length;
        const newErrors = errorsAfter - errorsBefore;
        
        console.log(`📊 Export attempt with corrected data: ${newErrors} new errors`);
        
        if (newErrors === 0) {
          console.log('✅ Export succeeded with corrected localStorage keys!');
        } else {
          console.log('❌ Export still failing, checking errors...');
          console.log(consoleMonitor.getErrorSummary());
        }
      }
    }
    
    // Final verification
    const finalState = await localStorageHelper.exportStorageState();
    console.log('📊 Final localStorage state:', finalState.keys);
  });

  test('04. Test Session Duration Calculations', async ({ page }) => {
    console.log('🔍 Test 04: Testing session duration calculations...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Set up test data with proper session duration values
    await page.evaluate(() => {
      // Clear and set data with specific session duration values
      localStorage.clear();
      
      const shopifyData = [
        {
          "Landing Page": "https://example.com/?utm_source=meta&utm_medium=cpc&utm_campaign=BOF%20%7C%20DPA&utm_term=DPA%20-%20Broad",
          "Sessions": 523,
          "Online store visitors": 523,
          "Sessions with cart additions": 3,
          "Sessions that reached checkout": 1,
          "Sessions that completed checkout": 0,
          "Average session duration": 125, // 2+ minutes - should count as above 1 min
          "Pageviews": 1892
        },
        {
          "Landing Page": "https://example.com/?utm_source=meta&utm_medium=cpc&utm_campaign=TOF%20%7C%20Interest&utm_term=Luxury%20Shoppers", 
          "Sessions": 351,
          "Online store visitors": 351,
          "Sessions with cart additions": 2,
          "Sessions that reached checkout": 0,
          "Sessions that completed checkout": 0,
          "Average session duration": 38, // Less than 1 min - should NOT count
          "Pageviews": 1204
        }
      ];
      
      const metaData = [
        {
          "Campaign name": "BOF | DPA",
          "Amount spent (INR)": 2500,
          "CTR (link click-through rate)": 1.45,
          "CPM (cost per 1,000 impressions)": 59.10
        },
        {
          "Campaign name": "TOF | Interest",
          "Amount spent (INR)": 1800,
          "CTR (link click-through rate)": 1.23,
          "CPM (cost per 1,000 impressions)": 63.16
        }
      ];
      
      localStorage.setItem('moi-shopify-data', JSON.stringify(shopifyData));
      localStorage.setItem('moi-meta-data', JSON.stringify(metaData));
      localStorage.setItem('moi-google-data', JSON.stringify([]));
      
      console.log('✅ Set test data with specific session durations');
    });
    
    // Reload to process the new data
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Take screenshot to see dashboard state
    await page.screenshot({ 
      path: 'test-results/04-session-duration-test.png',
      fullPage: true 
    });
    
    // Check if session duration calculations are working
    const sessionMetrics = await page.evaluate(() => {
      // Look for session duration related elements
      const elements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent?.toLowerCase() || '';
        return text.includes('session') || text.includes('min') || text.includes('duration');
      });
      
      return elements.map(el => ({
        tag: el.tagName,
        text: el.textContent?.trim(),
        className: el.className
      }));
    });
    
    console.log('📊 Session-related UI elements found:', sessionMetrics);
    
    // Try to trigger export to see session duration in exported data
    const exportButton = page.locator('button:has-text("Export"), button:has-text("Download")');
    if (await exportButton.count() > 0) {
      await exportButton.first().click();
      await page.waitForTimeout(1000);
      
      // Monitor console for session duration calculation logs
      const consoleEvents = consoleMonitor.getConsoleEvents();
      const sessionLogs = consoleEvents.filter(event => 
        event.text.toLowerCase().includes('session') ||
        event.text.toLowerCase().includes('duration') ||
        event.text.toLowerCase().includes('above 1 min')
      );
      
      console.log('🔍 Session duration calculation logs:', sessionLogs);
      
      // Take screenshot of export modal
      await page.screenshot({ 
        path: 'test-results/04-export-with-session-data.png',
        fullPage: true 
      });
    }
    
    // Check for any errors in session duration calculations
    const errors = consoleMonitor.getAllErrors();
    console.log(`📊 Total errors during session duration test: ${errors.length}`);
    if (errors.length > 0) {
      console.log('Session duration calculation errors:', errors);
    }
  });

  test('05. Comprehensive Data Flow Analysis', async ({ page }) => {
    console.log('🔍 Test 05: Analyzing complete data flow from load to export...');
    
    await page.goto('/');
    
    // Track localStorage changes during app initialization
    const initialStorage = await localStorageHelper.getAllStorageData();
    console.log('📊 Initial localStorage keys:', Object.keys(initialStorage));
    
    await page.waitForLoadState('networkidle');
    
    // Check localStorage after page load
    const afterLoadStorage = await localStorageHelper.getAllStorageData();
    console.log('📊 After load localStorage keys:', Object.keys(afterLoadStorage));
    
    // Set comprehensive test data
    await localStorageHelper.setTestData();
    
    // Also add additional data that should trigger the issue
    await page.evaluate(() => {
      // Add server-side data that exists but export system can't find
      const topLevelCSV = `Date,Meta Spend,Meta CTR,Meta CPM,Google Spend,Google CTR,Google CPM,Total Users,Total ATC,Total Reached Checkout,Total Abandoned Checkout,Session Duration,Users with Session above 1 min,Users with Above 5 page views and above 1 min,ATC with session duration above 1 min,Reached Checkout with session duration above 1 min
2025-09-29,4300,1.34,61.13,1200,2.04,244.90,974,6,2,0,52,0,0,0,0`;
      
      localStorage.setItem('moi-server-topLevel', topLevelCSV);
      localStorage.setItem('moi-server-topLevel-timestamp', new Date().toISOString());
      
      console.log('🔍 Set server-side data that should be accessible');
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Take comprehensive screenshot
    await page.screenshot({ 
      path: 'test-results/05-comprehensive-analysis.png',
      fullPage: true 
    });
    
    // Analyze the complete data flow
    const finalDebugInfo = await localStorageHelper.debugExportSystemKeys();
    const storageChanges = await localStorageHelper.getStorageChanges();
    const allErrors = consoleMonitor.getAllErrors();
    
    console.log('📊 COMPREHENSIVE ANALYSIS RESULTS:');
    console.log('='.repeat(50));
    console.log('Expected keys status:', finalDebugInfo.expectedKeys);
    console.log('Available keys:', finalDebugInfo.availableKeys);
    console.log('Mismatch analysis:', finalDebugInfo.mismatchAnalysis);
    console.log('Storage changes during test:', storageChanges.length);
    console.log('Total errors encountered:', allErrors.length);
    
    // Export complete debug report
    const debugReport = {
      testName: 'Comprehensive Data Flow Analysis',
      timestamp: new Date().toISOString(),
      localStorage: {
        initial: Object.keys(initialStorage),
        afterLoad: Object.keys(afterLoadStorage),
        final: finalDebugInfo.availableKeys
      },
      keyMismatchAnalysis: finalDebugInfo.mismatchAnalysis,
      consoleErrors: allErrors,
      storageChanges: storageChanges,
      recommendations: [
        'Export system expects moi-meta-data but data might be in moi-server-* keys',
        'Session duration calculations showing 0 - check calculation logic',
        'LocalStorage key naming inconsistency between load and export systems',
        'Need to standardize key naming or create bridge between systems'
      ]
    };
    
    // Save debug report
    await page.evaluate((report) => {
      console.log('🐛 COMPLETE DEBUG REPORT:', JSON.stringify(report, null, 2));
    }, debugReport);
    
    // Verify we can identify the core issues
    expect(finalDebugInfo.availableKeys.length).toBeGreaterThan(0);
    
    const hasDataMismatch = finalDebugInfo.mismatchAnalysis.some(analysis => 
      analysis.includes('moi-server') || analysis.includes('Missing')
    );
    
    if (hasDataMismatch) {
      console.log('✅ Successfully identified localStorage key mismatch issue');
    }
  });
});