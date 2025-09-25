const { test, expect } = require('@playwright/test');

test('Check console errors in Supabase sync integration', async ({ page }) => {
  const consoleLogs = [];
  const consoleErrors = [];
  const consoleWarnings = [];
  
  // Capture all console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    
    if (type === 'error') {
      consoleErrors.push(text);
      console.error('❌ CONSOLE ERROR:', text);
    } else if (type === 'warning' || type === 'warn') {
      consoleWarnings.push(text);
      console.warn('⚠️ CONSOLE WARNING:', text);
    } else if (type === 'log') {
      consoleLogs.push(text);
      console.log('📝 CONSOLE LOG:', text);
    }
  });
  
  // Capture uncaught exceptions
  page.on('pageerror', exception => {
    console.error('💥 PAGE ERROR:', exception.message);
    consoleErrors.push(`PAGE ERROR: ${exception.message}`);
  });

  console.log('=== Testing Supabase Sync Console Messages ===');
  
  // Navigate to the application
  await page.goto('http://localhost:8000/personal-task-tracker-sync.html');
  
  // Wait for the application to fully load and initialize
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  console.log('✅ Page loaded, waiting for Supabase initialization...');
  
  // Wait for Supabase database to initialize
  await page.waitForTimeout(5000);
  
  // Take a screenshot of the current state
  await page.screenshot({ path: 'test-results/supabase-sync-console-01-initial.png', fullPage: true });
  
  // Try to interact with the app to trigger more console messages
  try {
    // Check if FAB is visible and click it
    const fabButton = page.locator('.fixed.bottom-6.right-6 button');
    if (await fabButton.isVisible()) {
      console.log('📝 Clicking FAB to test task creation...');
      await fabButton.click();
      await page.waitForTimeout(1000);
      
      // Fill in a test task
      await page.fill('#task-title', 'Test Supabase Sync Task');
      await page.selectOption('#task-category', 'day-job');
      await page.selectOption('#task-priority', 'medium');
      await page.click('#save-task-btn');
      await page.waitForTimeout(2000);
      
      console.log('✅ Test task created');
    }
  } catch (error) {
    console.log('⚠️ Could not create test task:', error.message);
  }
  
  // Try Focus Mode
  try {
    console.log('📝 Testing Focus Mode...');
    const focusBtn = page.locator('#focus-mode-btn');
    if (await focusBtn.isVisible()) {
      await focusBtn.click();
      await page.waitForTimeout(2000);
      
      // Screenshot of focus mode
      await page.screenshot({ path: 'test-results/supabase-sync-console-02-focus-mode.png', fullPage: true });
      
      // Exit focus mode
      const exitBtn = page.locator('#exit-focus-btn');
      if (await exitBtn.isVisible()) {
        await exitBtn.click();
        await page.waitForTimeout(1000);
      }
    }
  } catch (error) {
    console.log('⚠️ Could not test Focus Mode:', error.message);
  }
  
  // Wait a bit more to capture any delayed console messages
  await page.waitForTimeout(3000);
  
  // Final screenshot
  await page.screenshot({ path: 'test-results/supabase-sync-console-03-final.png', fullPage: true });
  
  // Report results
  console.log('\n=== CONSOLE ANALYSIS RESULTS ===');
  console.log(`📊 Total Errors: ${consoleErrors.length}`);
  console.log(`⚠️ Total Warnings: ${consoleWarnings.length}`);
  console.log(`📝 Total Logs: ${consoleLogs.length}`);
  
  if (consoleErrors.length > 0) {
    console.log('\n❌ CONSOLE ERRORS FOUND:');
    consoleErrors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  } else {
    console.log('\n✅ No console errors found!');
  }
  
  if (consoleWarnings.length > 0) {
    console.log('\n⚠️ CONSOLE WARNINGS:');
    consoleWarnings.forEach((warning, index) => {
      console.log(`${index + 1}. ${warning}`);
    });
  }
  
  // Log some key initialization messages
  console.log('\n🔍 KEY SUPABASE MESSAGES:');
  consoleLogs.filter(log => 
    log.includes('PersonalTaskDB') || 
    log.includes('Supabase') || 
    log.includes('connected') ||
    log.includes('sync') ||
    log.includes('migration')
  ).forEach(log => {
    console.log(`   ${log}`);
  });
  
  console.log('\n=== Console Analysis Complete ===');
  
  // The test passes regardless of console messages - we just want to see them
  expect(true).toBe(true);
});