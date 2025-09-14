import { test, expect } from '@playwright/test';

test('Capture console logs to debug Supabase errors', async ({ page }) => {
  // Array to store console messages
  const consoleMessages = [];
  
  // Listen to all console events
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    const location = msg.location();
    
    consoleMessages.push({
      type,
      text,
      location: location ? `${location.url}:${location.lineNumber}` : 'unknown'
    });
    
    // Print to test output immediately
    console.log(`[${type.toUpperCase()}] ${text}`);
  });
  
  // Listen to page errors
  page.on('pageerror', error => {
    console.log(`[PAGE ERROR] ${error.message}`);
    consoleMessages.push({
      type: 'error',
      text: `PAGE ERROR: ${error.message}`,
      location: 'page'
    });
  });
  
  // Navigate to the dashboard
  await page.goto('/workshops/business-automation-dashboard.html');
  
  // Wait for the page to load and initialize
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000); // Give it time to initialize and make API calls
  
  // Try to interact with project selection to trigger process loading
  const projectSelector = await page.$('#headerProjectSelector');
  if (projectSelector) {
    const options = await page.$$eval('#headerProjectSelector option', opts => 
      opts.filter(opt => opt.value).map(opt => ({ value: opt.value, text: opt.textContent }))
    );
    
    if (options.length > 0) {
      console.log(`[TEST] Found ${options.length} projects, selecting first one`);
      await page.selectOption('#headerProjectSelector', options[0].value);
      await page.waitForTimeout(3000); // Wait for process loading
    }
  }
  
  // Print summary of console messages
  console.log('\n=== CONSOLE LOGS SUMMARY ===');
  const errorLogs = consoleMessages.filter(msg => msg.type === 'error');
  const warningLogs = consoleMessages.filter(msg => msg.type === 'warn');
  const infoLogs = consoleMessages.filter(msg => msg.type === 'log');
  
  console.log(`Total messages: ${consoleMessages.length}`);
  console.log(`Errors: ${errorLogs.length}`);
  console.log(`Warnings: ${warningLogs.length}`);
  console.log(`Info/Logs: ${infoLogs.length}`);
  
  if (errorLogs.length > 0) {
    console.log('\n=== ERROR MESSAGES ===');
    errorLogs.forEach((msg, i) => {
      console.log(`${i + 1}. [${msg.location}] ${msg.text}`);
    });
  }
  
  if (warningLogs.length > 0) {
    console.log('\n=== WARNING MESSAGES ===');
    warningLogs.forEach((msg, i) => {
      console.log(`${i + 1}. [${msg.location}] ${msg.text}`);
    });
  }
  
  // Look specifically for Supabase-related errors
  const supabaseErrors = consoleMessages.filter(msg => 
    msg.text.includes('Supabase') || 
    msg.text.includes('Process fetch failed') ||
    msg.text.includes('400') ||
    msg.location.includes('supabase-config.js')
  );
  
  if (supabaseErrors.length > 0) {
    console.log('\n=== SUPABASE-RELATED ERRORS ===');
    supabaseErrors.forEach((msg, i) => {
      console.log(`${i + 1}. [${msg.type}] [${msg.location}] ${msg.text}`);
    });
  }
  
  // The test passes regardless - we just want to capture logs
  expect(consoleMessages.length).toBeGreaterThan(0);
});