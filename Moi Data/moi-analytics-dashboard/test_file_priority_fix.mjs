import { chromium } from 'playwright';

async function testFilePriorityFix() {
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
    console.log('🚀 Testing file priority fix...');
    
    // Navigate to the app
    await page.goto('http://localhost:5175/');
    await page.waitForLoadState('networkidle');
    
    // Wait for cache clear and data loading
    await page.waitForTimeout(3000);
    
    // Check if the correct data is displayed
    const pageContent = await page.content();
    
    // Look for key indicators of the correct data
    if (pageContent.includes('57721') || pageContent.includes('57720')) {
      console.log('✅ SUCCESS: Found correct Meta spend (57721)');
    } else {
      console.log('❌ ISSUE: Meta spend not found or still wrong');
    }
    
    if (pageContent.includes('28860')) {
      console.log('❌ ISSUE: Still showing old buggy spend (28860)');
    } else {
      console.log('✅ SUCCESS: No longer showing buggy spend (28860)');
    }
    
    // Check for Sept 28
    if (pageContent.includes('Sep 28')) {
      console.log('❌ ISSUE: Still showing Sept 28');
    } else {
      console.log('✅ SUCCESS: No Sept 28 found');
    }
    
    console.log('🔍 Check the browser for visual confirmation');
    console.log('📋 Export a new CSV to verify the fix');
    
    // Keep browser open for manual testing
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

testFilePriorityFix().catch(console.error);