import { chromium, FullConfig } from '@playwright/test';

/**
 * Global teardown for MOI Analytics Dashboard testing
 * Cleans up test environment and generates summary reports
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up MOI Analytics Dashboard test environment...');
  
  // Launch browser for cleanup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to the app
    await page.goto('http://localhost:5173');
    
    // Clean up test data from localStorage
    await page.evaluate(() => {
      // Remove test-specific keys but preserve any production data
      const testKeys = [
        'moi-meta-data',
        'moi-google-data', 
        'moi-shopify-data',
        'moi-server-topLevel',
        'moi-server-adset',
        'moi-server-topLevel-timestamp',
        'moi-server-adset-timestamp'
      ];
      
      testKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log('✅ Test data cleanup completed');
    });
    
    console.log('✅ Global teardown completed successfully');
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error to avoid failing the entire test suite
  } finally {
    await browser.close();
  }
}

export default globalTeardown;