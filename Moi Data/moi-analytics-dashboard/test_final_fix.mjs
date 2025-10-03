import { chromium } from 'playwright';

async function testFinalFix() {
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
    console.log('🚀 Testing final fix - public directory file access...');
    
    // Navigate to the app
    await page.goto('http://localhost:5175/');
    await page.waitForLoadState('networkidle');
    
    // Wait for data loading
    await page.waitForTimeout(5000);
    
    // Check if the correct data is now displayed
    const pageContent = await page.content();
    
    console.log('🔍 Checking for data indicators...');
    
    // Look for key indicators of the correct data
    if (pageContent.includes('57721') || pageContent.includes('57720')) {
      console.log('✅ SUCCESS: Found correct Meta spend (57721)!');
    } else {
      console.log('❌ Meta spend still not found');
    }
    
    if (pageContent.includes('28860')) {
      console.log('❌ Still showing old buggy spend (28860)');
    } else {
      console.log('✅ No longer showing buggy spend (28860)');
    }
    
    // Check for Sept 28
    if (pageContent.includes('Sep 28')) {
      console.log('❌ Still showing Sept 28');
    } else {
      console.log('✅ No Sept 28 found');
    }
    
    // Check if dashboard is populated
    if (pageContent.includes('Generate Reports')) {
      console.log('📋 Dashboard is empty - shows "Generate Reports"');
    } else {
      console.log('📊 Dashboard appears to have data loaded');
    }
    
    console.log('🔍 Visual check: Browser will stay open for 30 seconds');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

testFinalFix().catch(console.error);