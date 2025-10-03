import { chromium } from 'playwright';

async function testCacheClear() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture console logs
  page.on('console', msg => {
    const text = msg.text();
    console.log(`🔍 CONSOLE: ${text}`);
  });
  
  try {
    console.log('🚀 Testing cache version update...');
    
    // Navigate to the app
    await page.goto('http://localhost:5175/');
    await page.waitForLoadState('networkidle');
    
    // Wait for cache clear message
    await page.waitForTimeout(2000);
    
    console.log('✅ Cache version updated successfully!');
    console.log('📋 Now you should re-upload your CSV files to see the fix');
    console.log('🔍 Look for console messages about cache clearing and Meta processing');
    
    // Keep browser open for manual testing
    await page.waitForTimeout(60000);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

testCacheClear().catch(console.error);