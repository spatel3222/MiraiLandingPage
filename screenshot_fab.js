// Simple Node.js script to capture screenshots
console.log('Starting screenshot capture...');

// Import playwright dynamically to handle potential missing dependency
let playwright;
try {
  playwright = require('playwright');
} catch (error) {
  console.error('Playwright not found. Please install with: npm install playwright');
  process.exit(1);
}

(async () => {
  let browser;
  
  try {
    console.log('Launching browser...');
    browser = await playwright.chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Desktop screenshot
    console.log('Setting desktop viewport...');
    await page.setViewportSize({ width: 1280, height: 720 });
    
    console.log('Navigating to page...');
    await page.goto('http://localhost:8000/personal-task-tracker-sync.html', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    // Wait a bit for content to load
    await page.waitForTimeout(2000);
    
    console.log('Taking desktop screenshot...');
    await page.screenshot({ 
      path: '/Users/shivangpatel/Documents/GitHub/crtx.in/current-ui-desktop.png',
      fullPage: true 
    });
    
    // Mobile screenshot
    console.log('Setting mobile viewport...');
    await page.setViewportSize({ width: 375, height: 667 });
    
    console.log('Taking mobile screenshot...');
    await page.screenshot({ 
      path: '/Users/shivangpatel/Documents/GitHub/crtx.in/current-ui-mobile.png',
      fullPage: true 
    });
    
    console.log('Screenshots captured successfully!');
    
  } catch (error) {
    console.error('Error during screenshot capture:', error.message);
    
    if (error.message.includes('ERR_CONNECTION_REFUSED')) {
      console.log('\nPlease make sure the local server is running on http://localhost:8000');
      console.log('You can start it with: python -m http.server 8000');
    }
    
  } finally {
    if (browser) {
      await browser.close();
      console.log('Browser closed.');
    }
  }
})();