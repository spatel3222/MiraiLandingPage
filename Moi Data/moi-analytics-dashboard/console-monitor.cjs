const { chromium } = require('@playwright/test');

async function monitorConsole() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Listen to console events
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    const timestamp = new Date().toLocaleTimeString();
    
    // Color code different message types
    let color = '\x1b[37m'; // white
    if (type === 'error') color = '\x1b[31m'; // red
    else if (type === 'warning') color = '\x1b[33m'; // yellow
    else if (type === 'info') color = '\x1b[36m'; // cyan
    else if (type === 'log') color = '\x1b[32m'; // green
    
    console.log(`${color}[${timestamp}] ${type.toUpperCase()}: ${text}\x1b[0m`);
  });

  // Listen to page errors
  page.on('pageerror', error => {
    console.log(`\x1b[41m[${new Date().toLocaleTimeString()}] PAGE ERROR: ${error.message}\x1b[0m`);
    console.log(error.stack);
  });

  // Listen to response errors
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`\x1b[31m[${new Date().toLocaleTimeString()}] HTTP ${response.status()}: ${response.url()}\x1b[0m`);
    }
  });

  // Navigate to the app
  console.log('\x1b[36m🚀 Starting console monitor for MOI Analytics Dashboard...\x1b[0m');
  console.log('\x1b[36m📱 Opening http://localhost:5174\x1b[0m');
  
  try {
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
    console.log('\x1b[32m✅ Page loaded successfully!\x1b[0m');
    
    // Check for common elements to verify app is working
    try {
      await page.waitForSelector('h1', { timeout: 5000 });
      console.log('\x1b[32m✅ Main content loaded\x1b[0m');
    } catch (e) {
      console.log('\x1b[33m⚠️  Main content not found within 5 seconds\x1b[0m');
    }
    
  } catch (error) {
    console.log(`\x1b[31m❌ Failed to load page: ${error.message}\x1b[0m`);
  }

  console.log('\x1b[36m🔍 Monitoring console output... Press Ctrl+C to stop\x1b[0m');
  console.log('\x1b[90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');

  // Keep the script running
  process.on('SIGINT', async () => {
    console.log('\n\x1b[36m🛑 Stopping console monitor...\x1b[0m');
    await browser.close();
    process.exit(0);
  });
}

monitorConsole().catch(console.error);