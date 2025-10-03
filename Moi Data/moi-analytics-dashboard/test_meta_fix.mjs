import { chromium } from 'playwright';

async function testMetaFix() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture all console logs
  const consoleMessages = [];
  page.on('console', msg => {
    const text = msg.text();
    console.log(`🔍 CONSOLE: ${text}`);
    consoleMessages.push(text);
  });
  
  try {
    console.log('🚀 Testing Meta processor fix...');
    
    // Navigate to debug page
    await page.goto('http://localhost:5175/debug_meta_fix.html');
    await page.waitForLoadState('networkidle');
    
    // Wait for test to complete
    await page.waitForTimeout(3000);
    
    // Get the result from the page
    const resultText = await page.locator('#result').textContent();
    console.log('📊 Test Result:', resultText);
    
    // Check if fix is working
    const isWorking = resultText.includes('✅ META FIX WORKING CORRECTLY');
    
    if (isWorking) {
      console.log('✅ SUCCESS: Meta fix is working!');
    } else {
      console.log('❌ ISSUE: Meta fix is not working');
    }
    
    // Look for key console messages
    const hasUsingEndDateOnly = consoleMessages.some(msg => msg.includes('USING END DATE ONLY'));
    const hasCriticalDebug = consoleMessages.some(msg => msg.includes('CRITICAL DEBUG'));
    const hasCorrectDayCount = consoleMessages.some(msg => msg.includes('shouldBe1Day: true'));
    
    console.log('🔍 Debug Console Analysis:');
    console.log('- Has "USING END DATE ONLY":', hasUsingEndDateOnly);
    console.log('- Has "CRITICAL DEBUG":', hasCriticalDebug);
    console.log('- Has correct dayCount:', hasCorrectDayCount);
    
    // Keep browser open for manual inspection
    console.log('🔍 Browser will stay open for 10 seconds...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

testMetaFix().catch(console.error);