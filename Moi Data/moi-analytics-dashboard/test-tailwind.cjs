const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Testing basic Tailwind classes...');
    await page.goto('http://localhost:5174');
    await page.waitForTimeout(2000);
    
    // Test basic Tailwind classes
    const testResult = await page.evaluate(() => {
      // Create test element with basic Tailwind classes
      const testDiv = document.createElement('div');
      testDiv.className = 'bg-red-500 text-white p-4';
      document.body.appendChild(testDiv);
      
      const computed = window.getComputedStyle(testDiv);
      const result = {
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        padding: computed.padding
      };
      
      document.body.removeChild(testDiv);
      return result;
    });
    
    console.log('🎨 Basic Tailwind test result:', testResult);
    
    // Check if we're getting any CSS at all
    const cssLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      return links.map(link => link.href);
    });
    
    console.log('🔗 CSS links found:', cssLinks);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
})();
