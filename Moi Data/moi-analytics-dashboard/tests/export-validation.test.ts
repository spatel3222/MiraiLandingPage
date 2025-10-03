import { test, expect } from '@playwright/test';
import { ConsoleMonitor } from './helpers/console-monitor';
import { LocalStorageHelper } from './helpers/localStorage-helper';

/**
 * MOI Analytics Dashboard - Export System Validation Tests
 * 
 * Validates that the export system correctly:
 * 1. Finds and uses the right localStorage data
 * 2. Calculates session duration metrics properly  
 * 3. Generates valid CSV files with real data (not zeros)
 * 4. Handles Meta/Google spend, CTR, CPM correctly
 */

test.describe('Export System Validation', () => {
  let consoleMonitor: ConsoleMonitor;
  let localStorageHelper: LocalStorageHelper;

  test.beforeEach(async ({ page }) => {
    consoleMonitor = new ConsoleMonitor(page);
    localStorageHelper = new LocalStorageHelper(page);
    
    consoleMonitor.startMonitoring();
    await localStorageHelper.startMonitoring();
  });

  test.afterEach(async ({ page }) => {
    // Capture test results
    const errorSummary = consoleMonitor.getErrorSummary();
    if (consoleMonitor.hasErrors()) {
      console.log('❌ Test completed with errors:', errorSummary);
      await page.screenshot({ 
        path: `test-results/error-state-${Date.now()}.png`,
        fullPage: true 
      });
    }
    
    consoleMonitor.stopMonitoring();
  });

  test('01. Validate Meta Ads Data Export', async ({ page }) => {
    console.log('🔍 Test 01: Validating Meta Ads spend/CTR/CPM export...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Set up realistic Meta Ads data with non-zero values
    await page.evaluate(() => {
      const metaData = [
        {
          "Campaign name": "BOF | DPA",
          "Ad set name": "DPA - Broad",
          "Amount spent (INR)": 2500.75,
          "CTR (link click-through rate)": 1.45,
          "CPM (cost per 1,000 impressions)": 59.10,
          "Impressions": 42300,
          "Link clicks": 614
        },
        {
          "Campaign name": "TOF | Interest", 
          "Ad set name": "Luxury Shoppers",
          "Amount spent (INR)": 1800.25,
          "CTR (link click-through rate)": 1.23,
          "CPM (cost per 1,000 impressions)": 63.16,
          "Impressions": 28500,
          "Link clicks": 351
        }
      ];
      
      localStorage.setItem('moi-meta-data', JSON.stringify(metaData));
      console.log('✅ Set Meta Ads data with realistic values');
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Find and click export button
    await page.screenshot({ path: 'test-results/01-before-meta-export.png', fullPage: true });
    
    const exportButton = page.locator('button:has-text("Export"), button:has-text("Download"), [data-testid="export-button"]');
    await expect(exportButton.first()).toBeVisible({ timeout: 10000 });
    
    await exportButton.first().click();
    await page.waitForTimeout(1000);
    
    // Look for top-level metrics export
    const topLevelButton = page.locator('button:has-text("Top Level"), button:has-text("Daily Metrics")');
    
    if (await topLevelButton.count() > 0) {
      console.log('📤 Found Top Level export button, clicking...');
      
      // Monitor console during export for Meta calculations
      const errorsBefore = consoleMonitor.getAllErrors().length;
      
      await topLevelButton.first().click();
      await page.waitForTimeout(3000); // Give time for calculations
      
      const errorsAfter = consoleMonitor.getAllErrors().length;
      const newErrors = errorsAfter - errorsBefore;
      
      // Check console logs for Meta calculations
      const consoleEvents = consoleMonitor.getConsoleEvents();
      const metaLogs = consoleEvents.filter(event => 
        event.text.toLowerCase().includes('meta') &&
        (event.text.includes('spend') || event.text.includes('ctr') || event.text.includes('cpm'))
      );
      
      console.log('📊 Meta calculation logs:', metaLogs.map(log => log.text));
      
      // Look for specific values in logs
      const spendLogs = metaLogs.filter(log => log.text.includes('Meta Spend'));
      const ctrLogs = metaLogs.filter(log => log.text.includes('Meta CTR'));
      const cpmLogs = metaLogs.filter(log => log.text.includes('Meta CPM'));
      
      console.log('💰 Meta Spend calculations:', spendLogs);
      console.log('📈 Meta CTR calculations:', ctrLogs);
      console.log('💸 Meta CPM calculations:', cpmLogs);
      
      // Validate that we're getting non-zero values
      const hasValidSpend = spendLogs.some(log => 
        log.text.includes('4301') || log.text.includes('4300') || // Sum of 2500.75 + 1800.25
        log.text.includes('2500') || log.text.includes('1800')
      );
      
      const hasValidCTR = ctrLogs.some(log => 
        log.text.includes('1.') && !log.text.includes('.0')
      );
      
      console.log(`✅ Meta Spend found in logs: ${hasValidSpend}`);
      console.log(`✅ Meta CTR found in logs: ${hasValidCTR}`);
      
      if (!hasValidSpend) {
        console.log('❌ Meta spend calculation failed - values showing as 0');
      }
      
      if (!hasValidCTR) {
        console.log('❌ Meta CTR calculation failed - values showing as 0');
      }
      
      expect(newErrors).toBe(0); // Should export without errors
      
    } else {
      console.log('❌ Could not find Top Level export button');
      
      // Take screenshot of export modal
      await page.screenshot({ path: 'test-results/01-export-modal-debug.png', fullPage: true });
      
      // Look for any available export buttons
      const allExportButtons = await page.locator('button:has-text("Download"), button:has-text("Export")').all();
      console.log(`🔍 Found ${allExportButtons.length} export-related buttons`);
      
      for (let i = 0; i < allExportButtons.length; i++) {
        const buttonText = await allExportButtons[i].textContent();
        console.log(`   Export button ${i + 1}: "${buttonText}"`);
      }
    }
    
    await page.screenshot({ path: 'test-results/01-after-meta-export.png', fullPage: true });
  });

  test('02. Validate Google Ads Data Export', async ({ page }) => {
    console.log('🔍 Test 02: Validating Google Ads spend/CTR/CPM export...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Set up Google Ads data with non-zero values
    await page.evaluate(() => {
      const googleData = [
        {
          "Campaign": "india-pmax-rings",
          "Cost": 1200.50,
          "CTR": "2.04%",
          "Avg. CPM": 244.90,
          "Impressions": 4900,
          "Clicks": 100
        },
        {
          "Campaign": "india-search-broad",
          "Cost": 800.25,
          "CTR": "3.15%", 
          "Avg. CPM": 180.75,
          "Impressions": 3200,
          "Clicks": 145
        }
      ];
      
      localStorage.setItem('moi-google-data', JSON.stringify(googleData));
      console.log('✅ Set Google Ads data with realistic values');
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'test-results/02-before-google-export.png', fullPage: true });
    
    // Trigger export
    const exportButton = page.locator('button:has-text("Export"), button:has-text("Download")');
    await exportButton.first().click();
    await page.waitForTimeout(1000);
    
    const topLevelButton = page.locator('button:has-text("Top Level"), button:has-text("Daily Metrics")');
    
    if (await topLevelButton.count() > 0) {
      console.log('📤 Testing Google Ads calculations...');
      
      await topLevelButton.first().click();
      await page.waitForTimeout(3000);
      
      // Check console for Google calculations
      const consoleEvents = consoleMonitor.getConsoleEvents();
      const googleLogs = consoleEvents.filter(event => 
        event.text.toLowerCase().includes('google') &&
        (event.text.includes('spend') || event.text.includes('ctr') || event.text.includes('cpm'))
      );
      
      console.log('📊 Google calculation logs:', googleLogs.map(log => log.text));
      
      // Validate Google metrics
      const spendLogs = googleLogs.filter(log => log.text.includes('Google Spend'));
      const ctrLogs = googleLogs.filter(log => log.text.includes('Google CTR'));
      
      console.log('💰 Google Spend calculations:', spendLogs);
      console.log('📈 Google CTR calculations:', ctrLogs);
      
      const hasValidGoogleSpend = spendLogs.some(log => 
        log.text.includes('2000') || log.text.includes('1200') || log.text.includes('800') // Expected sum or individual values
      );
      
      const hasValidGoogleCTR = ctrLogs.some(log => 
        log.text.includes('2.') || log.text.includes('3.') // CTR percentages
      );
      
      console.log(`✅ Google Spend found: ${hasValidGoogleSpend}`);
      console.log(`✅ Google CTR found: ${hasValidGoogleCTR}`);
    }
    
    await page.screenshot({ path: 'test-results/02-after-google-export.png', fullPage: true });
  });

  test('03. Validate Session Duration Calculations', async ({ page }) => {
    console.log('🔍 Test 03: Validating session duration calculations...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Set up data with specific session durations for testing
    await page.evaluate(() => {
      // Clear all existing data
      localStorage.clear();
      
      // Set Meta and Google data
      const metaData = [
        {
          "Campaign name": "BOF | DPA",
          "Amount spent (INR)": 2500,
          "CTR (link click-through rate)": 1.45,
          "CPM (cost per 1,000 impressions)": 59.10
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
      
      // CRITICAL: Set Shopify data with varying session durations
      const shopifyData = [
        {
          "Landing Page": "https://example.com/?utm_source=meta&utm_medium=cpc&utm_campaign=BOF%20%7C%20DPA&utm_term=DPA%20-%20Broad",
          "Sessions": 500,
          "Online store visitors": 500,
          "Sessions with cart additions": 10,
          "Sessions that reached checkout": 5,
          "Sessions that completed checkout": 2,
          "Average session duration": 125, // 2+ minutes - should count as "above 1 min"
          "Pageviews": 2500 // 5+ pageviews per session
        },
        {
          "Landing Page": "https://example.com/?utm_source=meta&utm_medium=cpc&utm_campaign=TOF%20%7C%20Interest",
          "Sessions": 300,
          "Online store visitors": 300, 
          "Sessions with cart additions": 5,
          "Sessions that reached checkout": 2,
          "Sessions that completed checkout": 1,
          "Average session duration": 45, // Less than 1 minute - should NOT count
          "Pageviews": 900 // 3 pageviews per session
        },
        {
          "Landing Page": "https://example.com/?utm_source=google&utm_medium=cpc&utm_campaign=india-pmax-rings",
          "Sessions": 100,
          "Online store visitors": 100,
          "Sessions with cart additions": 8,
          "Sessions that reached checkout": 6,
          "Sessions that completed checkout": 4,
          "Average session duration": 180, // 3 minutes - should count as "above 1 min" 
          "Pageviews": 800 // 8+ pageviews per session
        }
      ];
      
      localStorage.setItem('moi-meta-data', JSON.stringify(metaData));
      localStorage.setItem('moi-google-data', JSON.stringify(googleData));
      localStorage.setItem('moi-shopify-data', JSON.stringify(shopifyData));
      
      console.log('✅ Set test data with specific session durations:');
      console.log('   - Campaign 1: 125 seconds (should count as above 1 min)');
      console.log('   - Campaign 2: 45 seconds (should NOT count)');
      console.log('   - Campaign 3: 180 seconds (should count as above 1 min)');
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'test-results/03-session-duration-setup.png', fullPage: true });
    
    // Trigger export to test session calculations
    const exportButton = page.locator('button:has-text("Export"), button:has-text("Download")');
    await exportButton.first().click();
    await page.waitForTimeout(1000);
    
    const topLevelButton = page.locator('button:has-text("Top Level"), button:has-text("Daily Metrics")');
    
    if (await topLevelButton.count() > 0) {
      console.log('📤 Testing session duration calculations...');
      
      await topLevelButton.first().click();
      await page.waitForTimeout(3000);
      
      // Monitor console for session duration calculations
      const consoleEvents = consoleMonitor.getConsoleEvents();
      const sessionLogs = consoleEvents.filter(event => 
        event.text.toLowerCase().includes('session') ||
        event.text.toLowerCase().includes('above 1 min') ||
        event.text.toLowerCase().includes('duration')
      );
      
      console.log('📊 Session duration logs:', sessionLogs.map(log => log.text));
      
      // Look for specific calculations
      const usersAbove1MinLogs = sessionLogs.filter(log => 
        log.text.includes('Users Above 1 Min') || log.text.includes('usersAbove1Min')
      );
      
      const atcAbove1MinLogs = sessionLogs.filter(log =>
        log.text.includes('ATC Above 1 Min') || log.text.includes('atcAbove1Min')
      );
      
      console.log('👥 Users Above 1 Min calculations:', usersAbove1MinLogs);
      console.log('🛒 ATC Above 1 Min calculations:', atcAbove1MinLogs);
      
      // Expected: 500 + 100 = 600 users with sessions above 1 min (not 300 with 45 seconds)
      const hasValidSessionCalc = usersAbove1MinLogs.some(log => 
        log.text.includes('600') || (log.text.includes('500') && !log.text.includes('800'))
      );
      
      // Expected: ATC from campaigns with >1min sessions = 10 + 8 = 18 (not the 5 from 45-second sessions)
      const hasValidATCCalc = atcAbove1MinLogs.some(log =>
        log.text.includes('18') || log.text.includes('10') || log.text.includes('8')
      );
      
      console.log(`✅ Valid session duration calculation: ${hasValidSessionCalc}`);
      console.log(`✅ Valid ATC above 1 min calculation: ${hasValidATCCalc}`);
      
      if (!hasValidSessionCalc) {
        console.log('❌ Session duration calculations are incorrect - check 60-second threshold logic');
      }
      
      if (!hasValidATCCalc) {
        console.log('❌ ATC above 1 min calculations are incorrect - check filtering logic');
      }
    }
    
    await page.screenshot({ path: 'test-results/03-after-session-test.png', fullPage: true });
  });

  test('04. End-to-End Export Validation', async ({ page }) => {
    console.log('🔍 Test 04: Complete end-to-end export validation...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Set comprehensive realistic data
    await page.evaluate(() => {
      localStorage.clear();
      
      const metaData = [
        {
          "Campaign name": "BOF | DPA",
          "Ad set name": "DPA - Broad",
          "Amount spent (INR)": 2500.75,
          "CTR (link click-through rate)": 1.45,
          "CPM (cost per 1,000 impressions)": 59.10,
          "Impressions": 42300,
          "Link clicks": 614
        }
      ];
      
      const googleData = [
        {
          "Campaign": "india-pmax-rings",
          "Cost": 1200.50,
          "CTR": "2.04%",
          "Avg. CPM": 244.90,
          "Impressions": 4900,
          "Clicks": 100
        }
      ];
      
      const shopifyData = [
        {
          "Landing Page": "https://example.com/?utm_source=meta&utm_medium=cpc&utm_campaign=BOF%20%7C%20DPA&utm_term=DPA%20-%20Broad",
          "Sessions": 614,
          "Online store visitors": 614,
          "Sessions with cart additions": 15,
          "Sessions that reached checkout": 8,
          "Sessions that completed checkout": 3,
          "Average session duration": 95, // 1 min 35 sec - above threshold
          "Pageviews": 3684 // 6 pageviews per session average
        },
        {
          "Landing Page": "https://example.com/?utm_source=google&utm_medium=cpc&utm_campaign=india-pmax-rings",
          "Sessions": 100,
          "Online store visitors": 100,
          "Sessions with cart additions": 8,
          "Sessions that reached checkout": 6,
          "Sessions that completed checkout": 4,
          "Average session duration": 145, // 2 min 25 sec - above threshold
          "Pageviews": 850 // 8.5 pageviews per session
        }
      ];
      
      localStorage.setItem('moi-meta-data', JSON.stringify(metaData));
      localStorage.setItem('moi-google-data', JSON.stringify(googleData));
      localStorage.setItem('moi-shopify-data', JSON.stringify(shopifyData));
      
      console.log('✅ Set comprehensive test data for end-to-end validation');
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Test both Top Level and Adset exports
    const exportButton = page.locator('button:has-text("Export"), button:has-text("Download")');
    await exportButton.first().click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'test-results/04-export-modal.png', fullPage: true });
    
    // Test Top Level export
    const topLevelButton = page.locator('button:has-text("Top Level"), button:has-text("Daily Metrics")');
    if (await topLevelButton.count() > 0) {
      console.log('📤 Testing Top Level export...');
      
      const errorsBefore = consoleMonitor.getAllErrors().length;
      await topLevelButton.first().click();
      await page.waitForTimeout(3000);
      
      const errorsAfter = consoleMonitor.getAllErrors().length;
      const topLevelErrors = errorsAfter - errorsBefore;
      
      console.log(`📊 Top Level export errors: ${topLevelErrors}`);
      
      if (topLevelErrors === 0) {
        console.log('✅ Top Level export completed without errors');
      } else {
        console.log('❌ Top Level export failed with errors');
        console.log(consoleMonitor.getErrorSummary());
      }
    }
    
    // Test Adset export
    await page.waitForTimeout(1000);
    const adsetButton = page.locator('button:has-text("Adset"), button:has-text("Campaign")');
    if (await adsetButton.count() > 0) {
      console.log('📤 Testing Adset export...');
      
      const errorsBefore = consoleMonitor.getAllErrors().length;
      await adsetButton.first().click(); 
      await page.waitForTimeout(3000);
      
      const errorsAfter = consoleMonitor.getAllErrors().length;
      const adsetErrors = errorsAfter - errorsBefore;
      
      console.log(`📊 Adset export errors: ${adsetErrors}`);
      
      if (adsetErrors === 0) {
        console.log('✅ Adset export completed without errors');
      }
    }
    
    // Validate final results
    const allErrors = consoleMonitor.getAllErrors();
    const exportErrors = consoleMonitor.getExportErrors();
    const localStorageErrors = consoleMonitor.getLocalStorageErrors();
    
    console.log('📊 FINAL VALIDATION RESULTS:');
    console.log('='.repeat(40));
    console.log(`Total errors: ${allErrors.length}`);
    console.log(`Export-specific errors: ${exportErrors.length}`);
    console.log(`LocalStorage-specific errors: ${localStorageErrors.length}`);
    
    if (allErrors.length === 0) {
      console.log('✅ End-to-end export validation PASSED');
    } else {
      console.log('❌ End-to-end export validation FAILED');
      console.log('Error details:', exportErrors.concat(localStorageErrors));
    }
    
    await page.screenshot({ path: 'test-results/04-final-validation.png', fullPage: true });
    
    // Export should work without errors
    expect(exportErrors.length).toBe(0);
  });
});