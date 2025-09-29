import { chromium } from 'playwright';

async function debugDashboard() {
  console.log('🔍 Starting debug test...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture console messages
  const messages = [];
  page.on('console', msg => {
    messages.push(`${msg.type()}: ${msg.text()}`);
    console.log(`CONSOLE ${msg.type()}: ${msg.text()}`);
  });
  
  // Capture errors
  page.on('pageerror', error => {
    console.log(`PAGE ERROR: ${error.message}`);
  });
  
  try {
    console.log('🌐 Navigating to dashboard...');
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(5000);
    
    // Check if React root element exists
    const rootElement = await page.$('#root');
    console.log('Root element found:', !!rootElement);
    
    // Check if any content is rendered
    const rootContent = await page.textContent('#root');
    console.log('Root content:', rootContent?.substring(0, 100) || 'empty');
    
    // Check page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Take screenshot
    await page.screenshot({ path: 'debug-screenshot.png' });
    console.log('Debug screenshot saved');
    
  } catch (error) {
    console.error('❌ Debug test failed:', error);
  } finally {
    await browser.close();
    console.log('Console messages captured:', messages.length);
    messages.forEach(msg => console.log('  -', msg));
  }
}

debugDashboard();