import { test, expect } from '@playwright/test';

test.describe('Personal Task Tracker - Celebration System Fix Tests', () => {
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

    console.log('🎯 Starting Celebration System Fix Test with enhanced monitoring...');
  });

  test.afterEach(async () => {
    // Generate comprehensive error report
    if (errors.length > 0 || warnings.length > 0) {
      console.log('\n📊 CELEBRATION SYSTEM TEST REPORT:');
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
          path: `test-results/celebration-system-error-${Date.now()}.png`,
          fullPage: true 
        });
        console.log(`📸 Screenshot captured due to console errors`);
      }
    } else {
      console.log('✅ No console errors or warnings detected in Celebration System test!');
    }

    console.log(`\n📝 Total console logs: ${logs.length}`);
    console.log('=====================================\n');
  });

  test('should verify celebration system is globally accessible and functional', async () => {
    console.log('🎉 Celebration System Fix Test - Direct System Verification');
    
    // Step 1: Navigate to the application
    console.log('📍 Step 1: Navigating to personal task tracker...');
    await page.goto('/personal-task-tracker-sync.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Take initial screenshot
    await page.screenshot({ 
      path: `test-results/celebration-1-initial-load-${Date.now()}.png`,
      fullPage: true 
    });
    
    // Step 2: Handle authentication
    console.log('🔐 Step 2: Handling authentication...');
    
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
    
    await page.waitForTimeout(1000);
    console.log('✅ Authentication completed');
    
    // Take post-auth screenshot
    await page.screenshot({ 
      path: `test-results/celebration-2-post-auth-${Date.now()}.png`,
      fullPage: true 
    });
    
    const authErrors = errors.length;
    
    // Step 3: Verify celebration system is available globally
    console.log('🔍 Step 3: Verifying celebration system availability...');
    
    const celebrationSystemCheck = await page.evaluate(() => {
      return {
        windowCelebrationSystem: typeof window.celebrationSystem !== 'undefined',
        celebrateFunction: typeof window.celebrationSystem?.celebrate === 'function',
        celebrationSystemConstructor: typeof window.CelebrationSystem !== 'undefined',
        availableProperties: window.celebrationSystem ? Object.keys(window.celebrationSystem) : [],
        globalScope: typeof celebrationSystem !== 'undefined'
      };
    });
    
    console.log('Celebration System Check Results:', celebrationSystemCheck);
    
    // Critical assertion - celebration system must be available
    expect(celebrationSystemCheck.windowCelebrationSystem).toBe(true);
    expect(celebrationSystemCheck.celebrateFunction).toBe(true);
    
    // Step 4: Test direct celebration system call
    console.log('🎯 Step 4: Testing direct celebration system call...');
    
    const directCallResult = await page.evaluate(() => {
      try {
        // This is the exact call that was failing in Focus Mode
        window.celebrationSystem.celebrate();
        return { success: true, error: null };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    console.log('Direct celebration call result:', directCallResult);
    
    // Take screenshot after celebration call
    await page.screenshot({ 
      path: `test-results/celebration-3-after-direct-call-${Date.now()}.png`,
      fullPage: true 
    });
    
    // Wait for celebration animation
    await page.waitForTimeout(3000);
    
    // Step 5: Verify no console errors occurred during direct call
    console.log('🔍 Step 5: Verifying no console errors occurred...');
    
    const newErrors = errors.slice(authErrors);
    const celebrationErrors = newErrors.filter(error => 
      error.text.includes('celebrationSystem.celebrate is not a function')
    );
    
    if (celebrationErrors.length > 0) {
      console.log('🚨 CRITICAL FAILURE: celebrationSystem.celebrate error detected!');
      celebrationErrors.forEach(error => {
        console.log(`❌ ${error.text}`);
      });
    }
    
    // Main assertion - NO celebration system errors should occur
    expect(celebrationErrors).toHaveLength(0);
    expect(directCallResult.success).toBe(true);
    expect(newErrors).toHaveLength(0);
    
    console.log('✅ Direct celebration system call successful');
    
    // Step 6: Test metrics system availability
    console.log('📊 Step 6: Testing metrics system availability...');
    
    const metricsSystemCheck = await page.evaluate(() => {
      return {
        windowMetricsSystem: typeof window.metricsSystem !== 'undefined',
        updateMetricsFunction: typeof window.metricsSystem?.updateMetrics === 'function',
        availableProperties: window.metricsSystem ? Object.keys(window.metricsSystem) : []
      };
    });
    
    console.log('Metrics System Check Results:', metricsSystemCheck);
    expect(metricsSystemCheck.windowMetricsSystem).toBe(true);
    expect(metricsSystemCheck.updateMetricsFunction).toBe(true);
    
    // Step 7: Test the exact sequence that happens in Focus Mode
    console.log('🎯 Step 7: Testing Focus Mode celebration sequence...');
    
    const focusSequenceResult = await page.evaluate(() => {
      try {
        // This mimics the exact sequence from Focus Mode task completion
        window.celebrationSystem.celebrate();
        window.metricsSystem.updateMetrics();
        return { success: true, error: null };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    console.log('Focus sequence result:', focusSequenceResult);
    expect(focusSequenceResult.success).toBe(true);
    
    // Wait for any async operations
    await page.waitForTimeout(2000);
    
    // Step 8: Final verification
    console.log('✅ Step 8: Final verification...');
    
    const finalErrors = errors.slice(authErrors);
    expect(finalErrors).toHaveLength(0);
    
    // Take final screenshot
    await page.screenshot({ 
      path: `test-results/celebration-4-final-verification-${Date.now()}.png`,
      fullPage: true 
    });
    
    console.log('🎉 CELEBRATION SYSTEM FIX TEST PASSED SUCCESSFULLY!');
    console.log('✅ No "celebrationSystem.celebrate is not a function" errors detected');
    console.log('✅ Direct celebration calls working properly');
    console.log('✅ Focus Mode sequence simulation successful');
    console.log('✅ All systems functioning correctly');
  });

  test('should test actual task completion celebration flow', async () => {
    console.log('📝 Task Completion Celebration Flow Test');
    
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
    
    const authErrors = errors.length;
    
    // Create a task if none exist
    console.log('Creating a test task for completion...');
    const existingTasks = page.locator('.task-item, .task, [data-task-id]');
    const taskCount = await existingTasks.count();
    
    if (taskCount === 0) {
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
      await taskTitleInput.fill('Celebration Test Task');
      
      // Submit the task
      const saveTaskBtn = page.locator('#save-task-btn');
      await saveTaskBtn.click();
      await page.waitForTimeout(1000);
      
      console.log('✅ Test task created');
    }
    
    // Find and complete a task to trigger the celebration
    console.log('Completing task to trigger celebration...');
    const tasks = page.locator('.task-item, .task, [data-task-id]');
    if (await tasks.count() > 0) {
      const firstTask = tasks.first();
      const checkbox = firstTask.locator('input[type="checkbox"]');
      if (await checkbox.isVisible() && !(await checkbox.isChecked())) {
        await checkbox.click();
        
        // Wait for celebration and metrics update
        await page.waitForTimeout(3000);
        
        console.log('✅ Task completed - celebration should have triggered');
      }
    }
    
    // Verify no errors occurred during task completion
    const newErrors = errors.slice(authErrors);
    const celebrationErrors = newErrors.filter(error => 
      error.text.includes('celebrationSystem.celebrate is not a function')
    );
    
    expect(celebrationErrors).toHaveLength(0);
    expect(newErrors).toHaveLength(0);
    
    console.log('✅ Task completion celebration flow test passed!');
  });
});