const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Collect console logs
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push(`${msg.type()}: ${msg.text()}`);
  });

  // Collect any errors
  const errors = [];
  page.on('pageerror', error => {
    errors.push(error.toString());
  });

  try {
    console.log('Navigating to http://localhost:5173/...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    
    // Wait a bit for React to fully load
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'site-screenshot.png', 
      fullPage: true 
    });
    
    console.log('Screenshot saved as site-screenshot.png');
    console.log('\n=== CONSOLE LOGS ===');
    consoleLogs.forEach(log => console.log(log));
    
    console.log('\n=== ERRORS ===');
    errors.forEach(error => console.log(error));
    
    console.log('\n=== PAGE TITLE ===');
    console.log(await page.title());
    
  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await browser.close();
  }
})();