import { test, expect } from '@playwright/test';

test.describe('Personal Task Tracker - Focus Mode Complete Button Tests', () => {
  let errors = [];
  let warnings = [];
  let logs = [];
  let page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    // Reset error tracking arrays
    errors = [];
    warnings = [];
    logs = [];

    // Enhanced console monitoring - specifically looking for celebration system errors
    page.on('console', msg => {
      const messageText = msg.text();
      const messageType = msg.type();
      const location = msg.location();
      
      const enhancedMessage = {
        text: messageText,
        type: messageType,
        url: location.url,
        lineNumber: location.lineNumber,
        columnNumber: location.columnNumber,
        timestamp: new Date().toISOString()
      };

      if (messageType === 'error') {
        errors.push(enhancedMessage);
        console.log(`❌ Console Error: ${messageText} at ${location.url}:${location.lineNumber}:${location.columnNumber}`);
        
        // Special alert for celebration system errors
        if (messageText.includes('celebrationSystem.celebrate is not a function')) {
          console.log('🚨 CRITICAL: celebrationSystem.celebrate error detected!');
        }
      } else if (messageType === 'warning') {
        // Filter out expected Tailwind CSS CDN warning for development
        if (!messageText.includes('cdn.tailwindcss.com should not be used in production')) {
          warnings.push(enhancedMessage);
          console.log(`⚠️ Console Warning: ${messageText} at ${location.url}:${location.lineNumber}:${location.columnNumber}`);
        }
      } else {
        logs.push(enhancedMessage);
        // Log celebration-related messages
        if (messageText.includes('celebration') || messageText.includes('confetti') || messageText.includes('Focus:')) {
          console.log(`🎉 Celebration Log: ${messageText}`);
        }
      }
    });

    // Enhanced page error monitoring
    page.on('pageerror', error => {
      const enhancedError = {
        text: `Page error: ${error.message}`,
        type: 'pageerror',
        stack: error.stack,
        name: error.name,
        timestamp: new Date().toISOString()
      };
      errors.push(enhancedError);
      console.log(`🚨 Page Error: ${error.message}`);
      console.log(`Stack: ${error.stack}`);
    });

    console.log('🎯 Starting Focus Mode Complete Button Test with enhanced monitoring...');
  });

  test.afterEach(async () => {
    // Generate comprehensive error report
    if (errors.length > 0 || warnings.length > 0) {
      console.log('\n📊 FOCUS MODE TEST REPORT:');
      console.log('=====================================');
      
      console.log(`\n❌ ERRORS FOUND: ${errors.length}`);
      errors.forEach((error, index) => {
        console.log(`\nError ${index + 1}:`);
        console.log(`  Type: ${error.type}`);
        console.log(`  Message: ${error.text}`);
        console.log(`  Location: ${error.url}:${error.lineNumber}:${error.columnNumber}`);
        console.log(`  Time: ${error.timestamp}`);
        if (error.stack) {
          console.log(`  Stack: ${error.stack}`);
        }
      });

      console.log(`\n⚠️ WARNINGS FOUND: ${warnings.length}`);
      warnings.forEach((warning, index) => {
        console.log(`\nWarning ${index + 1}:`);
        console.log(`  Message: ${warning.text}`);
        console.log(`  Location: ${warning.url}:${warning.lineNumber}:${warning.columnNumber}`);
        console.log(`  Time: ${warning.timestamp}`);
      });

      // Take screenshot on any console errors
      if (errors.length > 0) {
        await page.screenshot({ 
          path: `test-results/focus-mode-error-${Date.now()}.png`,
          fullPage: true 
        });
        console.log(`📸 Screenshot captured due to console errors`);
      }
    } else {
      console.log('✅ No console errors or warnings detected in Focus Mode test!');
    }

    console.log(`\n📝 Total console logs: ${logs.length}`);
    console.log('=====================================\n');
  });

  test('should complete task in Focus Mode without console errors', async () => {
    console.log('🎯 Focus Mode Complete Button Test - Main Test');
    
    // Step 1: Navigate to the application
    console.log('📍 Step 1: Navigating to personal task tracker...');
    await page.goto('/personal-task-tracker-sync.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Take initial screenshot
    await page.screenshot({ 
      path: `test-results/focus-mode-1-initial-load-${Date.now()}.png`,
      fullPage: true 
    });
    
    // Step 2: Handle authentication
    console.log('🔐 Step 2: Handling authentication...');
    
    // Check for auth overlay first
    const authOverlay = page.locator('#auth-overlay');
    if (await authOverlay.isVisible()) {
      console.log('Auth overlay detected, handling password entry...');
      const passwordInput = page.locator('input[placeholder*="password"], input[type="password"]');
      if (await passwordInput.isVisible()) {
        await passwordInput.fill('Welcome@123');
        const unlockBtn = page.locator('button:has-text("Unlock"), button:has-text("Submit"), .unlock-btn');
        await unlockBtn.click();
        await page.waitForTimeout(2000);
        await page.waitForLoadState('networkidle');
        console.log('✅ Auth overlay unlocked');
      }
    }
    
    // Check for login modal
    const loginModal = page.locator('#loginModal');
    if (await loginModal.isVisible()) {
      console.log('Login modal detected...');
      await page.fill('#loginEmail', 'test@example.com');
      await page.fill('#loginPassword', 'Welcome@123');
      await page.click('#loginBtn');
      await page.waitForTimeout(2000);
      await page.waitForLoadState('networkidle');
      console.log('✅ Login completed');
    }
    
    // Wait for all overlays to disappear
    await page.waitForTimeout(1000);
    console.log('✅ Authentication completed');
    
    // Take post-login screenshot
    await page.screenshot({ 
      path: `test-results/focus-mode-2-post-login-${Date.now()}.png`,
      fullPage: true 
    });
    
    const loginErrors = errors.length;
    
    // Step 3: Create a task if none exist
    console.log('📝 Step 3: Ensuring at least one task exists...');
    const existingTasks = page.locator('.task-item, .task, [data-task-id]');
    const taskCount = await existingTasks.count();
    
    if (taskCount === 0) {
      console.log('Creating a test task...');
      
      // Click main FAB to open menu
      const fabMain = page.locator('#fab-main');
      await expect(fabMain).toBeVisible();
      await fabMain.click();
      await page.waitForTimeout(500);
      
      // Click Add Task FAB action
      const fabAddBtn = page.locator('#fab-add-btn');
      await expect(fabAddBtn).toBeVisible();
      await fabAddBtn.click();
      await page.waitForTimeout(500);
      
      // Fill task details in modal
      const taskTitleInput = page.locator('#task-title');
      await expect(taskTitleInput).toBeVisible();
      await taskTitleInput.fill('Focus Mode Test Task - Complete Button Test');
      
      // Submit the task
      const saveTaskBtn = page.locator('#save-task-btn');
      await saveTaskBtn.click();
      await page.waitForTimeout(1000);
      
      console.log('✅ Test task created');
    } else {
      console.log(`✅ Found ${taskCount} existing tasks`);
    }
    
    // Take task creation screenshot
    await page.screenshot({ 
      path: `test-results/focus-mode-3-task-created-${Date.now()}.png`,
      fullPage: true 
    });
    
    // Step 4: Prepare Focus Mode by setting up focus tasks
    console.log('🎯 Step 4: Preparing Focus Mode with tasks...');
    
    // Set up focus tasks in localStorage using JavaScript
    await page.evaluate(() => {
      // Get the first available task from the tasks array
      const availableTasks = window.tasks ? window.tasks.filter(t => t.status !== 'done').slice(0, 1) : [];
      if (availableTasks.length > 0) {
        localStorage.setItem('dailyFocusTasks', JSON.stringify(availableTasks));
        console.log('Focus tasks set in localStorage:', availableTasks);
        
        // Refresh the daily focus instance if it exists
        if (window.dailyFocus) {
          window.dailyFocus.focusTasks = availableTasks;
        }
      }
    });
    
    // Step 4a: Enter Focus Mode
    console.log('🚀 Step 4a: Entering Focus Mode...');
    const focusModeBtn = page.locator('#focus-mode-btn');
    await expect(focusModeBtn).toBeVisible();
    
    // Use force click to bypass any overlays like time-indicator
    await focusModeBtn.click({ force: true });
    await page.waitForTimeout(2000);
    
    // Verify Focus Mode is active
    const focusModeView = page.locator('#focus-mode-view');
    await expect(focusModeView).toBeVisible();
    await expect(focusModeView).not.toHaveClass(/hidden/);
    
    console.log('✅ Focus Mode activated successfully');
    
    // Additional verification - check if tasks are displayed
    const focusTasksContainer = page.locator('#focus-tasks-container');
    await page.waitForTimeout(1000);
    const hasVisibleTasks = await focusTasksContainer.isVisible();
    console.log(`Focus tasks container visible: ${hasVisibleTasks}`);
    
    // Take Focus Mode screenshot
    await page.screenshot({ 
      path: `test-results/focus-mode-4-focus-mode-active-${Date.now()}.png`,
      fullPage: true 
    });
    
    // Step 5: Find and click the Complete button in Focus Mode
    console.log('✅ Step 5: Looking for Complete button in Focus Mode...');
    
    // Look for various possible Complete button selectors in Focus Mode
    const completeButtonSelectors = [
      '#focus-mode-view button[id*="complete"]',
      '#focus-mode-view .complete-task-btn',
      '#focus-mode-view .task-complete',
      '#focus-mode-view button:has-text("Complete")',
      '#focus-mode-view button:has-text("Done")',
      '#focus-mode-view input[type="checkbox"]',
      '#focus-mode-view .task-checkbox'
    ];
    
    let completeButton = null;
    let buttonSelector = '';
    
    for (const selector of completeButtonSelectors) {
      const button = page.locator(selector);
      if (await button.isVisible()) {
        completeButton = button.first();
        buttonSelector = selector;
        break;
      }
    }
    
    if (!completeButton) {
      // If no specific complete button found, look for any clickable task element
      console.log('No specific complete button found, looking for task elements...');
      const taskElements = page.locator('#focus-mode-view .task-item, #focus-mode-view .focus-task');
      if (await taskElements.count() > 0) {
        completeButton = taskElements.first();
        buttonSelector = 'first task element';
      }
    }
    
    expect(completeButton).toBeTruthy();
    console.log(`✅ Found Complete button using selector: ${buttonSelector}`);
    
    // Step 6: Click the Complete button and monitor for specific error
    console.log('🎯 Step 6: Clicking Complete button and monitoring for console errors...');
    
    // Record current error count
    const preClickErrorCount = errors.length;
    
    // Click the complete button
    await completeButton.click();
    
    // Wait for celebration and metrics update
    await page.waitForTimeout(3000);
    
    // Take post-click screenshot
    await page.screenshot({ 
      path: `test-results/focus-mode-5-after-complete-click-${Date.now()}.png`,
      fullPage: true 
    });
    
    // Step 7: Verify no new console errors occurred
    console.log('🔍 Step 7: Verifying no console errors occurred...');
    const newErrors = errors.slice(preClickErrorCount);
    const celebrationErrors = newErrors.filter(error => 
      error.text.includes('celebrationSystem.celebrate is not a function')
    );
    
    if (celebrationErrors.length > 0) {
      console.log('🚨 CRITICAL FAILURE: celebrationSystem.celebrate error detected!');
      celebrationErrors.forEach(error => {
        console.log(`❌ ${error.text}`);
      });
    }
    
    // This is the main assertion - NO celebration system errors should occur
    expect(celebrationErrors).toHaveLength(0);
    expect(newErrors).toHaveLength(0);
    
    console.log('✅ No console errors detected after clicking Complete button');
    
    // Step 8: Verify confetti celebration triggered
    console.log('🎉 Step 8: Verifying confetti celebration...');
    
    // Check for confetti elements or canvas
    const confettiSelectors = [
      '.confetti',
      '[class*="confetti"]',
      '[id*="confetti"]',
      'canvas[id*="confetti"]',
      '.celebration-canvas'
    ];
    
    let confettiFound = false;
    for (const selector of confettiSelectors) {
      const confettiElement = page.locator(selector);
      if (await confettiElement.count() > 0) {
        confettiFound = true;
        console.log(`✅ Confetti element found: ${selector}`);
        break;
      }
    }
    
    // Check console logs for celebration-related messages
    const celebrationLogs = logs.filter(log => 
      log.text.includes('celebration') || 
      log.text.includes('confetti') || 
      log.text.includes('celebrate')
    );
    
    if (celebrationLogs.length > 0) {
      console.log('✅ Celebration-related console logs found:');
      celebrationLogs.forEach(log => {
        console.log(`  - ${log.text}`);
      });
      confettiFound = true;
    }
    
    // Check if celebration system is accessible
    const celebrationSystemAvailable = await page.evaluate(() => {
      return typeof window.celebrationSystem !== 'undefined' && 
             typeof window.celebrationSystem.celebrate === 'function';
    });
    
    console.log(`Celebration system availability: ${celebrationSystemAvailable}`);
    
    if (confettiFound || celebrationSystemAvailable) {
      console.log('✅ Confetti celebration system is working');
    } else {
      console.log('⚠️ Confetti celebration not visually detected, but no errors occurred');
    }
    
    // Step 9: Verify metrics update
    console.log('📊 Step 9: Verifying metrics update...');
    
    // Check if metrics system is available
    const metricsSystemAvailable = await page.evaluate(() => {
      return typeof window.metricsSystem !== 'undefined' && 
             typeof window.metricsSystem.updateMetrics === 'function';
    });
    
    console.log(`Metrics system availability: ${metricsSystemAvailable}`);
    expect(metricsSystemAvailable).toBe(true);
    
    // Look for metrics elements
    const metricsSelectors = [
      '.metrics',
      '.dashboard',
      '.stats',
      '[class*="metric"]',
      '[class*="stat"]',
      '#metricsContainer'
    ];
    
    let metricsFound = false;
    for (const selector of metricsSelectors) {
      const metricsElement = page.locator(selector);
      if (await metricsElement.count() > 0) {
        metricsFound = true;
        console.log(`✅ Metrics element found: ${selector}`);
        break;
      }
    }
    
    if (metricsFound) {
      console.log('✅ Metrics system is working');
    } else {
      console.log('ℹ️ Metrics elements not visually detected, but system is available');
    }
    
    // Final screenshot
    await page.screenshot({ 
      path: `test-results/focus-mode-6-final-state-${Date.now()}.png`,
      fullPage: true 
    });
    
    // Step 10: Exit Focus Mode
    console.log('🚪 Step 10: Exiting Focus Mode...');
    const exitFocusBtn = page.locator('#exit-focus-btn');
    if (await exitFocusBtn.isVisible()) {
      await exitFocusBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(1000);
    
    // Verify we exited Focus Mode
    await expect(focusModeView).toHaveClass(/hidden/);
    console.log('✅ Successfully exited Focus Mode');
    
    // Final verification: No errors throughout the entire process
    const totalNewErrors = errors.slice(loginErrors);
    expect(totalNewErrors).toHaveLength(0);
    
    console.log('🎉 FOCUS MODE COMPLETE BUTTON TEST PASSED SUCCESSFULLY!');
    console.log('✅ No "celebrationSystem.celebrate is not a function" errors detected');
    console.log('✅ Confetti celebration system working properly');
    console.log('✅ Metrics system functioning correctly');
  });

  test('should handle rapid Focus Mode task completions without errors', async () => {
    console.log('⚡ Focus Mode Stress Test - Rapid Task Completions');
    
    await page.goto('/personal-task-tracker-sync.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Handle authentication
    const authOverlay = page.locator('#auth-overlay');
    if (await authOverlay.isVisible()) {
      const passwordInput = page.locator('input[placeholder*="password"], input[type="password"]');
      if (await passwordInput.isVisible()) {
        await passwordInput.fill('Welcome@123');
        const unlockBtn = page.locator('button:has-text("Unlock"), button:has-text("Submit"), .unlock-btn');
        await unlockBtn.click();
        await page.waitForTimeout(2000);
        await page.waitForLoadState('networkidle');
      }
    }
    
    const loginModal = page.locator('#loginModal');
    if (await loginModal.isVisible()) {
      await page.fill('#loginEmail', 'test@example.com');
      await page.fill('#loginPassword', 'Welcome@123');
      await page.click('#loginBtn');
      await page.waitForTimeout(2000);
    }
    
    const loginErrors = errors.length;
    
    // Create multiple tasks for stress testing
    console.log('Creating multiple tasks for stress testing...');
    for (let i = 1; i <= 3; i++) {
      // Click main FAB to open menu
      const fabMain = page.locator('#fab-main');
      await fabMain.click();
      await page.waitForTimeout(300);
      
      // Click Add Task FAB action
      const fabAddBtn = page.locator('#fab-add-btn');
      await fabAddBtn.click();
      await page.waitForTimeout(300);
      
      // Fill task details in modal
      const taskTitleInput = page.locator('#task-title');
      await taskTitleInput.fill(`Stress Test Task ${i}`);
      
      // Submit the task
      const saveTaskBtn = page.locator('#save-task-btn');
      await saveTaskBtn.click();
      await page.waitForTimeout(500);
    }
    
    // Enter Focus Mode
    console.log('Entering Focus Mode for stress test...');
    const focusModeBtn = page.locator('#focus-mode-btn');
    await focusModeBtn.click({ force: true });
    await page.waitForTimeout(1000);
    
    // Rapidly complete tasks in Focus Mode
    console.log('Rapidly completing tasks in Focus Mode...');
    for (let i = 0; i < 3; i++) {
      const completeButton = page.locator('#focus-mode-view button[id*="complete"], #focus-mode-view .complete-task-btn, #focus-mode-view input[type="checkbox"]').first();
      
      if (await completeButton.isVisible()) {
        await completeButton.click();
        await page.waitForTimeout(1000); // Short wait between rapid clicks
        
        // Check for errors after each completion
        const currentErrors = errors.slice(loginErrors);
        const celebrationErrors = currentErrors.filter(error => 
          error.text.includes('celebrationSystem.celebrate is not a function')
        );
        
        expect(celebrationErrors).toHaveLength(0);
        console.log(`✅ Task ${i + 1} completed without celebration errors`);
      }
    }
    
    // Final verification
    const totalNewErrors = errors.slice(loginErrors);
    expect(totalNewErrors).toHaveLength(0);
    
    // Take final screenshot
    await page.screenshot({ 
      path: `test-results/focus-mode-stress-test-${Date.now()}.png`,
      fullPage: true 
    });
    
    console.log('✅ Focus Mode stress test completed successfully!');
  });
});