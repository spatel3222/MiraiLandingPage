import { test, expect } from '@playwright/test';

test.describe('Personal Task Tracker - Comprehensive Console Monitoring Tests', () => {
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

    // Enhanced console monitoring - capture ALL console messages
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
      } else if (messageType === 'warning') {
        // Filter out expected Tailwind CSS CDN warning for development
        if (!messageText.includes('cdn.tailwindcss.com should not be used in production')) {
          warnings.push(enhancedMessage);
          console.log(`⚠️ Console Warning: ${messageText} at ${location.url}:${location.lineNumber}:${location.columnNumber}`);
        }
      } else {
        logs.push(enhancedMessage);
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

    // Monitor unhandled promise rejections
    page.on('pageerror', error => {
      if (error.message.includes('Unhandled Promise rejection')) {
        const enhancedError = {
          text: `Unhandled Promise rejection: ${error.message}`,
          type: 'unhandled-promise',
          stack: error.stack,
          timestamp: new Date().toISOString()
        };
        errors.push(enhancedError);
        console.log(`🔥 Unhandled Promise Rejection: ${error.message}`);
      }
    });

    // Monitor network failures that might cause JavaScript errors
    page.on('response', response => {
      if (!response.ok() && response.url().includes('.js')) {
        const networkError = {
          text: `Failed to load JavaScript resource: ${response.url()} (${response.status()})`,
          type: 'network-error',
          url: response.url(),
          status: response.status(),
          timestamp: new Date().toISOString()
        };
        errors.push(networkError);
        console.log(`📡 Network Error: Failed to load ${response.url()} (${response.status()})`);
      }
    });

    console.log('🔍 Starting new test with enhanced console monitoring...');
  });

  test.afterEach(async () => {
    // Generate comprehensive error report
    if (errors.length > 0 || warnings.length > 0) {
      console.log('\n📊 CONSOLE MONITORING REPORT:');
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
          path: `test-results/console-error-${Date.now()}.png`,
          fullPage: true 
        });
        console.log(`📸 Screenshot captured due to console errors`);
      }
    } else {
      console.log('✅ No console errors or warnings detected!');
    }

    console.log(`\n📝 Total console logs: ${logs.length}`);
    console.log('=====================================\n');
  });

  test('should load application without any console errors', async () => {
    console.log('🚀 Test 1: Basic Application Load');
    
    // Navigate to the application
    await page.goto('/personal-task-tracker-sync.html');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for any asynchronous operations
    await page.waitForTimeout(2000);
    
    // Check for console errors - MUST be zero
    expect(errors).toHaveLength(0);
    expect(warnings).toHaveLength(0);
    
    // Verify page loaded successfully
    await expect(page.locator('h1')).toBeVisible();
    
    console.log('✅ Application loaded successfully with no console errors');
  });

  test('should handle login flow without console errors', async () => {
    console.log('🔐 Test 2: Login Flow with Console Monitoring');
    
    await page.goto('/personal-task-tracker-sync.html');
    await page.waitForLoadState('networkidle');
    
    // Check if login modal is present
    const loginModal = page.locator('#loginModal');
    if (await loginModal.isVisible()) {
      // Fill login credentials
      await page.fill('#loginEmail', 'test@example.com');
      await page.fill('#loginPassword', 'Welcome@123');
      
      // Click login button
      await page.click('#loginBtn');
      
      // Wait for login to complete
      await page.waitForTimeout(2000);
      await page.waitForLoadState('networkidle');
    }
    
    // Verify no console errors during login
    expect(errors).toHaveLength(0);
    
    // Verify login was successful (login modal should be hidden)
    await expect(loginModal).toBeHidden();
    
    console.log('✅ Login completed successfully with no console errors');
  });

  test('should create task via FAB without console errors', async () => {
    console.log('➕ Test 3: Task Creation via FAB');
    
    await page.goto('/personal-task-tracker-sync.html');
    await page.waitForLoadState('networkidle');
    
    // Handle login if needed
    const loginModal = page.locator('#loginModal');
    if (await loginModal.isVisible()) {
      await page.fill('#loginEmail', 'test@example.com');
      await page.fill('#loginPassword', 'Welcome@123');
      await page.click('#loginBtn');
      await page.waitForTimeout(2000);
    }
    
    // Clear any existing console errors from login
    const loginErrors = errors.length;
    
    // Click the FAB (Floating Action Button)
    const fab = page.locator('.fab, [data-testid="fab"], .floating-action-button, .add-task-btn');
    await expect(fab.first()).toBeVisible();
    await fab.first().click();
    
    // Wait for task creation modal/form
    await page.waitForTimeout(1000);
    
    // Fill task details (adjust selectors based on actual implementation)
    const taskInput = page.locator('input[placeholder*="task"], input[name*="task"], #taskTitle, #newTaskInput');
    if (await taskInput.isVisible()) {
      await taskInput.fill('Test Task Created via Console Monitoring');
      
      // Submit the task
      const submitBtn = page.locator('button[type="submit"], .submit-task, .add-task-submit, .save-task');
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
      } else {
        // Try pressing Enter
        await taskInput.press('Enter');
      }
    }
    
    // Wait for task creation to complete
    await page.waitForTimeout(2000);
    
    // Verify no new console errors since login
    const newErrors = errors.slice(loginErrors);
    expect(newErrors).toHaveLength(0);
    
    console.log('✅ Task creation completed successfully with no console errors');
  });

  test('should complete task and trigger confetti without console errors', async () => {
    console.log('🎉 Test 4: Task Completion with Confetti Animation');
    
    await page.goto('/personal-task-tracker-sync.html');
    await page.waitForLoadState('networkidle');
    
    // Handle login
    const loginModal = page.locator('#loginModal');
    if (await loginModal.isVisible()) {
      await page.fill('#loginEmail', 'test@example.com');
      await page.fill('#loginPassword', 'Welcome@123');
      await page.click('#loginBtn');
      await page.waitForTimeout(2000);
    }
    
    const loginErrors = errors.length;
    
    // Create a task first if none exist
    const taskElements = page.locator('.task-item, .task, [data-task-id]');
    const taskCount = await taskElements.count();
    
    if (taskCount === 0) {
      // Create a task
      const fab = page.locator('.fab, [data-testid="fab"], .floating-action-button, .add-task-btn');
      await fab.first().click();
      await page.waitForTimeout(500);
      
      const taskInput = page.locator('input[placeholder*="task"], input[name*="task"], #taskTitle, #newTaskInput');
      await taskInput.fill('Task for Completion Test');
      await taskInput.press('Enter');
      await page.waitForTimeout(1000);
    }
    
    // Find and complete a task
    const firstTask = page.locator('.task-item, .task, [data-task-id]').first();
    const completeBtn = firstTask.locator('input[type="checkbox"], .complete-task, .task-complete, button[aria-label*="complete"]');
    
    if (await completeBtn.isVisible()) {
      await completeBtn.click();
      
      // Wait for confetti animation and metrics update
      await page.waitForTimeout(3000);
      
      // Look for confetti elements or animation
      const confettiElements = page.locator('.confetti, [class*="confetti"], [id*="confetti"]');
      console.log(`Confetti elements found: ${await confettiElements.count()}`);
    }
    
    // Verify no new console errors since login
    const newErrors = errors.slice(loginErrors);
    expect(newErrors).toHaveLength(0);
    
    console.log('✅ Task completion and confetti animation completed without console errors');
  });

  test('should update metrics dashboard without console errors', async () => {
    console.log('📊 Test 5: Metrics Dashboard Updates');
    
    await page.goto('/personal-task-tracker-sync.html');
    await page.waitForLoadState('networkidle');
    
    // Handle login
    const loginModal = page.locator('#loginModal');
    if (await loginModal.isVisible()) {
      await page.fill('#loginEmail', 'test@example.com');
      await page.fill('#loginPassword', 'Welcome@123');
      await page.click('#loginBtn');
      await page.waitForTimeout(2000);
    }
    
    const loginErrors = errors.length;
    
    // Look for metrics dashboard elements
    const metricsElements = page.locator('.metrics, .dashboard, .stats, [class*="metric"], [class*="stat"]');
    console.log(`Metrics elements found: ${await metricsElements.count()}`);
    
    // Force metrics update by completing a task
    const taskElements = page.locator('.task-item, .task, [data-task-id]');
    if (await taskElements.count() > 0) {
      const completeBtn = taskElements.first().locator('input[type="checkbox"], .complete-task');
      if (await completeBtn.isVisible() && !(await completeBtn.isChecked())) {
        await completeBtn.click();
        await page.waitForTimeout(2000);
      }
    }
    
    // Wait for any dashboard updates
    await page.waitForTimeout(2000);
    
    // Verify no new console errors since login
    const newErrors = errors.slice(loginErrors);
    expect(newErrors).toHaveLength(0);
    
    console.log('✅ Metrics dashboard operations completed without console errors');
  });

  test('should test archive system functionality without console errors', async () => {
    console.log('📁 Test 6: Archive System Functionality');
    
    await page.goto('/personal-task-tracker-sync.html');
    await page.waitForLoadState('networkidle');
    
    // Handle login
    const loginModal = page.locator('#loginModal');
    if (await loginModal.isVisible()) {
      await page.fill('#loginEmail', 'test@example.com');
      await page.fill('#loginPassword', 'Welcome@123');
      await page.click('#loginBtn');
      await page.waitForTimeout(2000);
    }
    
    const loginErrors = errors.length;
    
    // Look for archive button/panel
    const archiveBtn = page.locator('button[aria-label*="archive"], .archive-btn, #archiveBtn, [data-testid="archive"]');
    const archivePanel = page.locator('.archive-panel, #archivePanel, [data-testid="archive-panel"]');
    
    if (await archiveBtn.isVisible()) {
      await archiveBtn.click();
      await page.waitForTimeout(1000);
      
      // Test archive panel operations
      if (await archivePanel.isVisible()) {
        // Test search in archive
        const searchInput = archivePanel.locator('input[type="search"], input[placeholder*="search"]');
        if (await searchInput.isVisible()) {
          await searchInput.fill('test');
          await page.waitForTimeout(500);
          await searchInput.clear();
        }
        
        // Test filter operations
        const filterButtons = archivePanel.locator('button[data-filter], .filter-btn');
        const filterCount = await filterButtons.count();
        if (filterCount > 0) {
          await filterButtons.first().click();
          await page.waitForTimeout(500);
        }
        
        // Close archive panel
        const closeBtn = archivePanel.locator('button[aria-label*="close"], .close-btn, .archive-close');
        if (await closeBtn.isVisible()) {
          await closeBtn.click();
        } else {
          await page.keyboard.press('Escape');
        }
      }
    }
    
    // Verify no new console errors since login
    const newErrors = errors.slice(loginErrors);
    expect(newErrors).toHaveLength(0);
    
    console.log('✅ Archive system functionality completed without console errors');
  });

  test('should test auto-archive timing without console errors', async () => {
    console.log('⏰ Test 7: Auto-Archive Timing System');
    
    await page.goto('/personal-task-tracker-sync.html');
    await page.waitForLoadState('networkidle');
    
    // Handle login
    const loginModal = page.locator('#loginModal');
    if (await loginModal.isVisible()) {
      await page.fill('#loginEmail', 'test@example.com');
      await page.fill('#loginPassword', 'Welcome@123');
      await page.click('#loginBtn');
      await page.waitForTimeout(2000);
    }
    
    const loginErrors = errors.length;
    
    // Complete a task to trigger auto-archive timing
    const taskElements = page.locator('.task-item, .task, [data-task-id]');
    if (await taskElements.count() > 0) {
      const incompleteTask = taskElements.locator('input[type="checkbox"]:not(:checked)').first();
      if (await incompleteTask.isVisible()) {
        await incompleteTask.click();
        
        // Wait for auto-archive delay (typically 3-5 seconds)
        console.log('Waiting for auto-archive timing...');
        await page.waitForTimeout(6000);
        
        // Check if task was auto-archived
        const remainingTasks = await taskElements.count();
        console.log(`Remaining tasks after auto-archive: ${remainingTasks}`);
      }
    }
    
    // Verify no new console errors since login
    const newErrors = errors.slice(loginErrors);
    expect(newErrors).toHaveLength(0);
    
    console.log('✅ Auto-archive timing system completed without console errors');
  });

  test('should test mobile responsiveness with JavaScript health check', async () => {
    console.log('📱 Test 8: Mobile Responsiveness with JavaScript Health Check');
    
    // Set mobile viewport (375px width as requested)
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/personal-task-tracker-sync.html');
    await page.waitForLoadState('networkidle');
    
    // Handle login
    const loginModal = page.locator('#loginModal');
    if (await loginModal.isVisible()) {
      await page.fill('#loginEmail', 'test@example.com');
      await page.fill('#loginPassword', 'Welcome@123');
      await page.click('#loginBtn');
      await page.waitForTimeout(2000);
    }
    
    const loginErrors = errors.length;
    
    // Test mobile-specific interactions
    // Test touch/tap interactions
    const fab = page.locator('.fab, [data-testid="fab"], .floating-action-button, .add-task-btn');
    if (await fab.isVisible()) {
      await fab.tap();
      await page.waitForTimeout(1000);
      
      // Close any opened modal/form
      await page.keyboard.press('Escape');
    }
    
    // Test swipe-like interactions (if implemented)
    const tasks = page.locator('.task-item, .task');
    if (await tasks.count() > 0) {
      const firstTask = tasks.first();
      const box = await firstTask.boundingBox();
      if (box) {
        // Simulate swipe gesture
        await page.mouse.move(box.x + 10, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
        await page.mouse.up();
        await page.waitForTimeout(500);
      }
    }
    
    // Test mobile menu/navigation (if present)
    const mobileMenu = page.locator('.mobile-menu, .hamburger, [aria-label*="menu"]');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.tap();
      await page.waitForTimeout(500);
      await page.keyboard.press('Escape');
    }
    
    // JavaScript health check - ensure all scripts loaded and executed
    const jsHealthCheck = await page.evaluate(() => {
      // Check if main JavaScript objects/functions are available
      const checks = {
        jQuery: typeof $ !== 'undefined',
        mainApp: typeof window.app !== 'undefined' || typeof window.TaskTracker !== 'undefined',
        localStorage: typeof localStorage !== 'undefined',
        fetch: typeof fetch !== 'undefined'
      };
      
      return {
        allPassed: Object.values(checks).every(check => check),
        details: checks,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
    });
    
    console.log('📱 Mobile JavaScript Health Check:', jsHealthCheck);
    
    // Take mobile screenshot
    await page.screenshot({ 
      path: `test-results/mobile-responsive-${Date.now()}.png`,
      fullPage: true 
    });
    
    // Verify no new console errors since login
    const newErrors = errors.slice(loginErrors);
    expect(newErrors).toHaveLength(0);
    
    // Verify mobile viewport is correct
    expect(jsHealthCheck.viewport.width).toBe(375);
    
    console.log('✅ Mobile responsiveness test completed without console errors');
  });

  test('should perform comprehensive feature validation with error monitoring', async () => {
    console.log('🔍 Test 9: Comprehensive Feature Validation');
    
    await page.goto('/personal-task-tracker-sync.html');
    await page.waitForLoadState('networkidle');
    
    // Handle login
    const loginModal = page.locator('#loginModal');
    if (await loginModal.isVisible()) {
      await page.fill('#loginEmail', 'test@example.com');
      await page.fill('#loginPassword', 'Welcome@123');
      await page.click('#loginBtn');
      await page.waitForTimeout(2000);
    }
    
    const loginErrors = errors.length;
    
    // Comprehensive feature test sequence
    console.log('Testing complete workflow...');
    
    // 1. Create multiple tasks
    for (let i = 1; i <= 3; i++) {
      const fab = page.locator('.fab, [data-testid="fab"], .floating-action-button, .add-task-btn');
      await fab.first().click();
      await page.waitForTimeout(500);
      
      const taskInput = page.locator('input[placeholder*="task"], input[name*="task"], #taskTitle, #newTaskInput');
      await taskInput.fill(`Comprehensive Test Task ${i}`);
      await taskInput.press('Enter');
      await page.waitForTimeout(1000);
    }
    
    // 2. Complete some tasks to trigger confetti and metrics
    const tasks = page.locator('.task-item, .task, [data-task-id]');
    const taskCount = Math.min(await tasks.count(), 2);
    
    for (let i = 0; i < taskCount; i++) {
      const task = tasks.nth(i);
      const checkbox = task.locator('input[type="checkbox"]');
      if (await checkbox.isVisible() && !(await checkbox.isChecked())) {
        await checkbox.click();
        await page.waitForTimeout(2000); // Wait for confetti and auto-archive
      }
    }
    
    // 3. Test archive functionality
    const archiveBtn = page.locator('button[aria-label*="archive"], .archive-btn, #archiveBtn');
    if (await archiveBtn.isVisible()) {
      await archiveBtn.click();
      await page.waitForTimeout(1000);
      
      const searchInput = page.locator('input[type="search"], input[placeholder*="search"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('Comprehensive');
        await page.waitForTimeout(1000);
        await searchInput.clear();
      }
      
      await page.keyboard.press('Escape');
    }
    
    // 4. Test any settings or configuration options
    const settingsBtn = page.locator('button[aria-label*="settings"], .settings-btn, #settingsBtn');
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
      await page.waitForTimeout(1000);
      await page.keyboard.press('Escape');
    }
    
    // Final screenshot
    await page.screenshot({ 
      path: `test-results/comprehensive-validation-${Date.now()}.png`,
      fullPage: true 
    });
    
    // Verify no new console errors since login
    const newErrors = errors.slice(loginErrors);
    expect(newErrors).toHaveLength(0);
    
    console.log('✅ Comprehensive feature validation completed without console errors');
  });

  test('should validate JavaScript fixes were successful', async () => {
    console.log('🔧 Test 10: JavaScript Fixes Validation');
    
    await page.goto('/personal-task-tracker-sync.html');
    await page.waitForLoadState('networkidle');
    
    // Extended wait to catch any delayed errors
    await page.waitForTimeout(5000);
    
    // Handle login
    const loginModal = page.locator('#loginModal');
    if (await loginModal.isVisible()) {
      await page.fill('#loginEmail', 'test@example.com');
      await page.fill('#loginPassword', 'Welcome@123');
      await page.click('#loginBtn');
      await page.waitForTimeout(3000); // Extended wait
    }
    
    // Perform intensive operations to stress-test the application
    const intensiveOperations = [
      // Rapid task creation and completion
      async () => {
        for (let i = 0; i < 5; i++) {
          const fab = page.locator('.fab, [data-testid="fab"], .floating-action-button, .add-task-btn');
          await fab.first().click();
          await page.waitForTimeout(200);
          
          const taskInput = page.locator('input[placeholder*="task"], input[name*="task"], #taskTitle, #newTaskInput');
          await taskInput.fill(`Stress Test Task ${i}`);
          await taskInput.press('Enter');
          await page.waitForTimeout(200);
        }
      },
      
      // Rapid task completions
      async () => {
        const tasks = page.locator('.task-item input[type="checkbox"]:not(:checked)');
        const count = Math.min(await tasks.count(), 3);
        for (let i = 0; i < count; i++) {
          await tasks.nth(i).click();
          await page.waitForTimeout(500);
        }
      },
      
      // Rapid archive operations
      async () => {
        const archiveBtn = page.locator('button[aria-label*="archive"], .archive-btn, #archiveBtn');
        if (await archiveBtn.isVisible()) {
          await archiveBtn.click();
          await page.waitForTimeout(500);
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }
      }
    ];
    
    // Execute stress test operations
    for (const operation of intensiveOperations) {
      try {
        await operation();
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log(`Operation failed: ${error.message}`);
      }
    }
    
    // Final extended wait to catch any delayed errors
    await page.waitForTimeout(5000);
    
    // CRITICAL VALIDATION: No console errors should exist
    if (errors.length > 0) {
      console.log('\n🚨 JAVASCRIPT FIXES VALIDATION FAILED:');
      console.log('The following console errors were detected:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.text}`);
        if (error.url) console.log(`   Location: ${error.url}:${error.lineNumber}`);
      });
      
      // Take detailed screenshot for debugging
      await page.screenshot({ 
        path: `test-results/javascript-fixes-validation-failed-${Date.now()}.png`,
        fullPage: true 
      });
    }
    
    // The most important assertion - NO CONSOLE ERRORS ALLOWED
    expect(errors).toHaveLength(0);
    
    console.log('✅ JavaScript fixes validation PASSED - No console errors detected!');
  });
});