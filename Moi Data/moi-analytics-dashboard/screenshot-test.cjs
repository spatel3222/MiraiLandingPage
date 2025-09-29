const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('📱 Navigating to localhost:5174...');
    await page.goto('http://localhost:5174');
    
    // Wait for content to load
    await page.waitForTimeout(3000);
    
    // Take screenshot
    console.log('📸 Taking screenshot...');
    await page.screenshot({ 
      path: 'dashboard-screenshot.png', 
      fullPage: true 
    });
    
    // Get page title and some content
    const title = await page.title();
    console.log('📄 Page title:', title);
    
    // Check if Tailwind classes are being applied
    const element = await page.$('h1');
    if (element) {
      const styles = await page.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          fontSize: computed.fontSize,
          fontFamily: computed.fontFamily
        };
      }, element);
      console.log('🎨 H1 styles:', styles);
    }
    
    // Check if custom MOI colors are defined
    const cssVariables = await page.evaluate(() => {
      const style = document.createElement('div');
      style.className = 'text-moi-charcoal bg-moi-beige';
      document.body.appendChild(style);
      const computed = window.getComputedStyle(style);
      const result = {
        color: computed.color,
        backgroundColor: computed.backgroundColor
      };
      document.body.removeChild(style);
      return result;
    });
    console.log('🎯 MOI colors test:', cssVariables);
    
    console.log('✅ Screenshot saved as dashboard-screenshot.png');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
})();
