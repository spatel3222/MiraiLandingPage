import { test, expect } from '@playwright/test';

test.describe('Currency System - Simple Testing', () => {
  const dashboardUrl = '/workshops/business-automation-dashboard.html';
  const currencies = ['AUD', 'CAD', 'CHF', 'EUR', 'GBP', 'INR', 'JPY', 'USD'];
  
  test.beforeEach(async ({ page }) => {
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
  });

  test('Currency selector should work in settings', async ({ page }) => {
    console.log('\n=== TESTING: Currency Selector Functionality ===');
    
    // Open settings
    await page.locator('.settings-trigger').click();
    await page.waitForTimeout(1000);
    
    // Test changing currency to INR
    await page.locator('#currencySelector').selectOption('INR');
    await page.waitForTimeout(500);
    
    const selectedValue = await page.locator('#currencySelector').inputValue();
    expect(selectedValue).toBe('INR');
    console.log('✅ Currency changed to INR');
    
    // Close and reopen to verify persistence
    await page.locator('.settings-close-btn').click();
    await page.waitForTimeout(500);
    
    await page.locator('.settings-trigger').click();
    await page.waitForTimeout(500);
    
    const persistedValue = await page.locator('#currencySelector').inputValue();
    expect(persistedValue).toBe('INR');
    console.log('✅ INR currency persisted');
  });

  test('All currencies should be available and alphabetically sorted', async ({ page }) => {
    console.log('\n=== TESTING: Currency Options ===');
    
    // Open settings
    await page.locator('.settings-trigger').click();
    await page.waitForTimeout(1000);
    
    // Get all currency options
    const options = await page.locator('#currencySelector option').allTextContents();
    console.log('Available currencies:', options);
    
    // Check alphabetical order
    const sortedOptions = [...options].sort();
    expect(options).toEqual(sortedOptions);
    console.log('✅ Currencies are alphabetically sorted');
    
    // Verify all expected currencies are present
    for (const currency of currencies) {
      const option = page.locator(`#currencySelector option[value="${currency}"]`);
      await expect(option).toBeAttached();
      console.log(`✅ ${currency} option available`);
    }
  });

  test('Currency conversion function should work correctly', async ({ page }) => {
    console.log('\n=== TESTING: Currency Conversion Logic ===');
    
    // Test the conversion function directly
    const conversionResults = await page.evaluate(() => {
      // Test conversion from USD to other currencies
      const testAmount = 100;
      const results = {};
      
      if (typeof convertCurrency === 'function') {
        results.usdToInr = convertCurrency(testAmount, 'USD', 'INR');
        results.usdToEur = convertCurrency(testAmount, 'USD', 'EUR');
        results.usdToGbp = convertCurrency(testAmount, 'USD', 'GBP');
        results.usdToJpy = convertCurrency(testAmount, 'USD', 'JPY');
        
        // Test reverse conversion
        results.inrToUsd = convertCurrency(8300, 'INR', 'USD');
        
        // Test same currency
        results.usdToUsd = convertCurrency(testAmount, 'USD', 'USD');
      }
      
      return results;
    });
    
    console.log('Conversion results:', conversionResults);
    
    // Verify conversions are in expected ranges
    expect(conversionResults.usdToInr).toBeCloseTo(8300, -1); // ~83 INR per USD
    expect(conversionResults.usdToEur).toBeCloseTo(85, -1);   // ~0.85 EUR per USD
    expect(conversionResults.usdToGbp).toBeCloseTo(75, -1);   // ~0.75 GBP per USD
    expect(conversionResults.usdToJpy).toBeCloseTo(15000, -2); // ~150 JPY per USD
    expect(conversionResults.inrToUsd).toBeCloseTo(100, 0);   // Should convert back to ~100 USD
    expect(conversionResults.usdToUsd).toBe(100);              // Same currency should be identical
    
    console.log('✅ Currency conversion logic working correctly');
  });

  test('Currency preference updates all displays', async ({ page }) => {
    console.log('\n=== TESTING: Currency Display Updates ===');
    
    // Set currency to INR
    await page.locator('.settings-trigger').click();
    await page.waitForTimeout(1000);
    await page.locator('#currencySelector').selectOption('INR');
    await page.waitForTimeout(500);
    
    // Check that the currency preference function was called
    const currencyState = await page.evaluate(() => {
      return {
        currentCurrency: window.currentCurrency,
        localStorage: localStorage.getItem('preferredCurrency')
      };
    });
    
    expect(currencyState.currentCurrency).toBe('INR');
    expect(currencyState.localStorage).toBe('INR');
    console.log('✅ Currency preference updated globally');
    
    // Close settings
    await page.locator('.settings-close-btn').click();
    await page.waitForTimeout(500);
    
    // Take screenshot showing INR is selected
    await page.screenshot({ 
      path: 'test-results/currency-inr-selected.png',
      fullPage: true 
    });
    console.log('✅ Screenshot taken with INR selected');
  });

  test('Exchange rates are properly defined', async ({ page }) => {
    console.log('\n=== TESTING: Exchange Rates ===');
    
    const exchangeRates = await page.evaluate(() => {
      return window.EXCHANGE_RATES;
    });
    
    console.log('Exchange rates:', exchangeRates);
    
    // Verify all currencies have exchange rates
    for (const currency of currencies) {
      expect(exchangeRates[currency]).toBeDefined();
      expect(exchangeRates[currency]).toBeGreaterThan(0);
      console.log(`✅ ${currency}: ${exchangeRates[currency]}`);
    }
    
    // Verify INR exchange rate is reasonable
    expect(exchangeRates.INR).toBeGreaterThan(80);
    expect(exchangeRates.INR).toBeLessThan(90);
    console.log(`✅ INR exchange rate is ${exchangeRates.INR} (reasonable range)`);
  });

  test('Currency symbols are correctly mapped', async ({ page }) => {
    console.log('\n=== TESTING: Currency Symbols ===');
    
    const currencySymbols = await page.evaluate(() => {
      return window.CURRENCY_SYMBOLS;
    });
    
    console.log('Currency symbols:', currencySymbols);
    
    // Verify key currency symbols
    expect(currencySymbols.INR).toBe('₹');
    expect(currencySymbols.USD).toBe('$');
    expect(currencySymbols.EUR).toBe('€');
    expect(currencySymbols.GBP).toBe('£');
    expect(currencySymbols.JPY).toBe('¥');
    
    console.log('✅ All currency symbols correctly mapped');
  });
});