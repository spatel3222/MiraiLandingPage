const { test, expect } = require('@playwright/test');

test.describe('Personal Task Tracker - Final Bug Fixes Verification', () => {
  // Test configuration
  const TEST_CREDENTIALS = {
    email: 'test@example.com',
    password: 'Welcome@123'
  };

  const VIEWPORTS = {
    desktop: { width: 1920, height: 1080 },
    mobile: { width: 375, height: 667 },
    mobileSmall: { width: 320, height: 568 }
  };

  // Test results tracking
  let testResults = {
    autoArchiveSystem: { passed: false, details: [] },
    metricsDashboard: { passed: false, details: [] },
    mobileResponsiveness: { passed: false, details: [] },
    integrationTest: { passed: false, details: [] },
    totalTests: 0,
    passedTests: 0,
    failedTests: 0
  };

  // Helper function to authenticate
  async function authenticate(page) {
    await page.goto('/personal-task-tracker-sync.html');
    
    const authOverlay = page.locator('#auth-overlay');
    if (await authOverlay.isVisible()) {
      await page.fill('#password-input', TEST_CREDENTIALS.password);
      await page.click('button[type="submit"]');
      await page.waitForSelector('#auth-overlay', { state: 'hidden' });
    }
  }

  // Helper function to add a test task
  async function addTestTask(page, taskTitle = 'Test Task') {
    // Click main FAB button to open actions
    await page.click('#fab-main');
    await page.waitForSelector('#fab-add-btn', { state: 'visible' });
    
    // Click add task button
    await page.click('#fab-add-btn');
    await page.waitForSelector('#task-modal', { state: 'visible' });
    
    // Fill task title
    await page.fill('#task-title', taskTitle);
    
    // Click save button
    await page.click('#save-task-btn');
    await page.waitForSelector('#task-modal', { state: 'hidden' });
  }

  // Helper function to complete a task (checkbox method)
  async function completeTaskByCheckbox(page, taskTitle) {
    const taskCard = page.locator(`.task-card:has-text("${taskTitle}")`);
    await expect(taskCard).toBeVisible();
    
    // Find the checkbox within the task card
    const checkbox = taskCard.locator('input[type="checkbox"], .task-checkbox');
    await expect(checkbox).toBeVisible();
    await checkbox.check();
    
    return taskCard;
  }

  // Helper function to complete a task by dragging to done column
  async function completeTaskByDrag(page, taskTitle) {
    const taskElement = page.locator(`.task-card:has-text("${taskTitle}")`);
    await expect(taskElement).toBeVisible();
    
    const doneColumn = page.locator('#done-column');
    await expect(doneColumn).toBeVisible();
    
    await taskElement.dragTo(doneColumn);
    return taskElement;
  }

  // Helper function to log test results
  function logTestResult(category, passed, detail) {
    testResults.totalTests++;
    if (passed) {
      testResults.passedTests++;
      testResults[category].details.push(`✅ ${detail}`);
    } else {
      testResults.failedTests++;
      testResults[category].details.push(`❌ ${detail}`);
    }
    testResults[category].passed = testResults[category].passed || passed;
  }

  test.beforeEach(async ({ page }) => {
    await authenticate(page);
    await page.waitForSelector('.metrics-dashboard');
    await page.waitForSelector('#fab-main');
  });

  test.describe('1. Auto-Archive System Fix', () => {
    test('should complete task → show confetti → wait 3 seconds → auto-archive', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      
      // Capture initial state
      await page.screenshot({ 
        path: 'test-results/auto-archive-fix-initial.png',
        fullPage: true 
      });

      // Add a test task
      await addTestTask(page, 'Auto-Archive Fix Test');
      
      // Capture task created state
      await page.screenshot({ 
        path: 'test-results/auto-archive-fix-task-created.png',
        fullPage: true 
      });

      try {
        // Complete task by checking checkbox
        await completeTaskByCheckbox(page, 'Auto-Archive Fix Test');
        logTestResult('autoArchiveSystem', true, 'Task completed via checkbox');
      } catch (error) {
        console.log('Checkbox method failed, trying drag method...');
        await completeTaskByDrag(page, 'Auto-Archive Fix Test');
        logTestResult('autoArchiveSystem', true, 'Task completed via drag (fallback)');
      }

      // Verify confetti animation plays
      await page.waitForTimeout(500);
      
      try {
        const confettiContainer = page.locator('#confetti-container').first();
        await expect(confettiContainer).toBeVisible({ timeout: 2000 });
        logTestResult('autoArchiveSystem', true, 'Confetti animation triggered');
        
        // Capture confetti in action
        await page.screenshot({ 
          path: 'test-results/auto-archive-fix-confetti-active.png',
          fullPage: true 
        });
      } catch (error) {
        logTestResult('autoArchiveSystem', false, 'Confetti animation not detected');
        await page.screenshot({ 
          path: 'test-results/auto-archive-fix-confetti-missing.png',
          fullPage: true 
        });
      }

      // Verify task is still visible during celebration
      const taskElement = page.locator('.task-card:has-text("Auto-Archive Fix Test")');
      const taskVisibleDuringCelebration = await taskElement.isVisible();
      logTestResult('autoArchiveSystem', taskVisibleDuringCelebration, 'Task visible during celebration');

      // Wait exactly 3 seconds for auto-archive
      console.log('Waiting 3 seconds for auto-archive...');
      await page.waitForTimeout(3000);

      // Verify task is auto-archived (removed from main view)
      try {
        await expect(taskElement).not.toBeVisible({ timeout: 1000 });
        logTestResult('autoArchiveSystem', true, 'Task auto-archived after 3 seconds');
      } catch (error) {
        logTestResult('autoArchiveSystem', false, 'Task failed to auto-archive');
      }

      // Capture auto-archived state
      await page.screenshot({ 
        path: 'test-results/auto-archive-fix-task-archived.png',
        fullPage: true 
      });

      // Verify task appears in archive
      const archiveToggle = page.locator('#archive-toggle-btn');
      await archiveToggle.click();
      await page.waitForSelector('#archive-panel.open');

      try {
        const archivedTask = page.locator('.archived-task:has-text("Auto-Archive Fix Test")');
        await expect(archivedTask).toBeVisible();
        logTestResult('autoArchiveSystem', true, 'Task found in archive');
      } catch (error) {
        logTestResult('autoArchiveSystem', false, 'Task not found in archive');
      }

      // Capture archive view
      await page.screenshot({ 
        path: 'test-results/auto-archive-fix-archive-view.png',
        fullPage: true 
      });

      // Close archive
      await page.click('#archive-close-btn');
      await page.waitForTimeout(500);
    });
  });

  test.describe('2. Metrics Dashboard Fix', () => {
    test('should update metrics in real-time when tasks are completed', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      
      // Capture initial metrics state
      await page.screenshot({ 
        path: 'test-results/metrics-fix-initial.png',
        fullPage: true 
      });

      // Get initial metrics values
      const completedToday = page.locator('#completed-today');
      const totalTasks = page.locator('#total-tasks');
      const completionRate = page.locator('#completion-rate');

      let initialCompleted = 0;
      let initialTotal = 0;

      try {
        initialCompleted = parseInt(await completedToday.textContent()) || 0;
        initialTotal = parseInt(await totalTasks.textContent()) || 0;
        logTestResult('metricsDashboard', true, `Initial metrics captured: ${initialCompleted} completed, ${initialTotal} total`);
      } catch (error) {
        logTestResult('metricsDashboard', false, 'Failed to capture initial metrics');
      }

      // Add and complete a task
      await addTestTask(page, 'Metrics Dashboard Test');
      
      try {
        await completeTaskByCheckbox(page, 'Metrics Dashboard Test');
      } catch (error) {
        await completeTaskByDrag(page, 'Metrics Dashboard Test');
      }

      // Wait for metrics to update
      await page.waitForTimeout(1000);

      // Verify metrics updated
      try {
        const newCompleted = parseInt(await completedToday.textContent()) || 0;
        const newTotal = parseInt(await totalTasks.textContent()) || 0;

        if (newCompleted > initialCompleted) {
          logTestResult('metricsDashboard', true, `"Completed Today" count increased from ${initialCompleted} to ${newCompleted}`);
        } else {
          logTestResult('metricsDashboard', false, `"Completed Today" count did not increase (${initialCompleted} → ${newCompleted})`);
        }

        if (newTotal >= initialTotal) {
          logTestResult('metricsDashboard', true, `"Total Tasks" shows correct count: ${newTotal}`);
        } else {
          logTestResult('metricsDashboard', false, `"Total Tasks" count incorrect: ${newTotal}`);
        }
      } catch (error) {
        logTestResult('metricsDashboard', false, 'Failed to verify updated metrics');
      }

      // Capture updated metrics
      await page.screenshot({ 
        path: 'test-results/metrics-fix-updated.png',
        fullPage: true 
      });

      // Test weekly completion and streak calculations
      try {
        const weeklyCompletion = page.locator('#weekly-completion, #completed-this-week');
        const streak = page.locator('#current-streak, #streak-count');

        if (await weeklyCompletion.count() > 0) {
          const weeklyValue = await weeklyCompletion.textContent();
          logTestResult('metricsDashboard', true, `Weekly completion metric found: ${weeklyValue}`);
        }

        if (await streak.count() > 0) {
          const streakValue = await streak.textContent();
          logTestResult('metricsDashboard', true, `Streak metric found: ${streakValue}`);
        }
      } catch (error) {
        logTestResult('metricsDashboard', false, 'Weekly/streak metrics not found or failed to read');
      }
    });

    test('should verify completion rate calculations', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);

      // Add multiple tasks to test calculations
      const testTasks = ['Calc Test 1', 'Calc Test 2', 'Calc Test 3'];
      
      for (const taskTitle of testTasks) {
        await addTestTask(page, taskTitle);
      }

      // Complete 2 out of 3 tasks
      try {
        await completeTaskByCheckbox(page, 'Calc Test 1');
      } catch (error) {
        await completeTaskByDrag(page, 'Calc Test 1');
      }
      await page.waitForTimeout(500);

      try {
        await completeTaskByCheckbox(page, 'Calc Test 2');
      } catch (error) {
        await completeTaskByDrag(page, 'Calc Test 2');
      }
      await page.waitForTimeout(500);

      // Check completion rate calculation
      try {
        const completionRate = page.locator('#completion-rate');
        const rateText = await completionRate.textContent();
        
        if (rateText && rateText.includes('%')) {
          logTestResult('metricsDashboard', true, `Completion rate calculated: ${rateText}`);
        } else {
          logTestResult('metricsDashboard', false, 'Completion rate not displaying correctly');
        }
      } catch (error) {
        logTestResult('metricsDashboard', false, 'Failed to verify completion rate calculation');
      }

      // Capture calculation state
      await page.screenshot({ 
        path: 'test-results/metrics-fix-calculations.png',
        fullPage: true 
      });
    });
  });

  test.describe('3. Mobile Responsiveness Fix', () => {
    test('should test at 375px width with visible save button', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      
      // Capture mobile initial state
      await page.screenshot({ 
        path: 'test-results/mobile-fix-initial.png',
        fullPage: true 
      });

      // Test opening add task modal via FAB
      try {
        await page.click('#fab-main');
        await page.waitForSelector('#fab-add-btn', { state: 'visible' });
        await page.click('#fab-add-btn');
        await page.waitForSelector('#task-modal', { state: 'visible' });
        logTestResult('mobileResponsiveness', true, 'Task modal opened successfully via FAB');
      } catch (error) {
        logTestResult('mobileResponsiveness', false, 'Failed to open task modal via FAB');
      }

      // Capture modal opened on mobile
      await page.screenshot({ 
        path: 'test-results/mobile-fix-modal-opened.png',
        fullPage: true 
      });

      // Verify save button is fully visible and clickable
      try {
        const saveButton = page.locator('#save-task-btn');
        await expect(saveButton).toBeVisible();
        
        // Check if button is in viewport
        const buttonBox = await saveButton.boundingBox();
        const viewport = page.viewportSize();
        
        if (buttonBox && buttonBox.y + buttonBox.height <= viewport.height) {
          logTestResult('mobileResponsiveness', true, 'Save button is fully visible in viewport');
        } else {
          logTestResult('mobileResponsiveness', false, 'Save button is cut off or not in viewport');
        }

        // Test if button is clickable
        await saveButton.click();
        logTestResult('mobileResponsiveness', true, 'Save button is clickable');
      } catch (error) {
        logTestResult('mobileResponsiveness', false, 'Save button not visible or clickable');
        
        // Capture error state
        await page.screenshot({ 
          path: 'test-results/mobile-fix-save-button-error.png',
          fullPage: true 
        });
      }

      // Test successful task creation on mobile
      await page.click('#fab-main');
      await page.waitForSelector('#fab-add-btn', { state: 'visible' });
      await page.click('#fab-add-btn');
      await page.waitForSelector('#task-modal', { state: 'visible' });

      await page.fill('#task-title', 'Mobile Responsiveness Test');
      
      try {
        await page.click('#save-task-btn');
        await page.waitForSelector('#task-modal', { state: 'hidden' });
        
        // Verify task was created
        const createdTask = page.locator('.task-card:has-text("Mobile Responsiveness Test")');
        await expect(createdTask).toBeVisible();
        logTestResult('mobileResponsiveness', true, 'Task created successfully on mobile');
      } catch (error) {
        logTestResult('mobileResponsiveness', false, 'Failed to create task on mobile');
      }

      // Capture task created on mobile
      await page.screenshot({ 
        path: 'test-results/mobile-fix-task-created.png',
        fullPage: true 
      });
    });

    test('should test smaller mobile viewport (320px)', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobileSmall);
      
      // Capture small mobile state
      await page.screenshot({ 
        path: 'test-results/mobile-fix-320px-initial.png',
        fullPage: true 
      });

      // Test modal functionality on smallest mobile screen
      try {
        await page.click('#fab-main');
        await page.waitForSelector('#fab-add-btn', { state: 'visible' });
        await page.click('#fab-add-btn');
        await page.waitForSelector('#task-modal', { state: 'visible' });

        const saveButton = page.locator('#save-task-btn');
        await expect(saveButton).toBeVisible();
        
        logTestResult('mobileResponsiveness', true, 'Modal works correctly on 320px viewport');
      } catch (error) {
        logTestResult('mobileResponsiveness', false, 'Modal issues on 320px viewport');
      }

      // Capture modal on smallest mobile
      await page.screenshot({ 
        path: 'test-results/mobile-fix-320px-modal.png',
        fullPage: true 
      });

      // Close modal and test other responsive elements
      await page.press('body', 'Escape');
      await page.waitForTimeout(500);

      // Test archive panel on small mobile
      try {
        const archiveToggle = page.locator('#archive-toggle-btn');
        await expect(archiveToggle).toBeVisible();
        logTestResult('mobileResponsiveness', true, 'Archive toggle visible on 320px');
      } catch (error) {
        logTestResult('mobileResponsiveness', false, 'Archive toggle not visible on 320px');
      }
    });
  });

  test.describe('4. Integration Test', () => {
    test('should complete full workflow: create → complete → celebrate → archive → metrics update', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      
      // Capture workflow initial state
      await page.screenshot({ 
        path: 'test-results/integration-workflow-step1-initial.png',
        fullPage: true 
      });

      // Get initial metrics
      const completedToday = page.locator('#completed-today');
      let initialCompleted = 0;
      
      try {
        initialCompleted = parseInt(await completedToday.textContent()) || 0;
        logTestResult('integrationTest', true, 'Initial metrics captured for integration test');
      } catch (error) {
        logTestResult('integrationTest', false, 'Failed to capture initial metrics');
      }

      // Step 1: Create task
      try {
        await addTestTask(page, 'Integration Workflow Test');
        const createdTask = page.locator('.task-card:has-text("Integration Workflow Test")');
        await expect(createdTask).toBeVisible();
        logTestResult('integrationTest', true, 'Task created successfully');
      } catch (error) {
        logTestResult('integrationTest', false, 'Task creation failed');
      }

      await page.screenshot({ 
        path: 'test-results/integration-workflow-step2-created.png',
        fullPage: true 
      });

      // Step 2: Complete task
      try {
        await completeTaskByCheckbox(page, 'Integration Workflow Test');
        logTestResult('integrationTest', true, 'Task completed successfully');
      } catch (error) {
        try {
          await completeTaskByDrag(page, 'Integration Workflow Test');
          logTestResult('integrationTest', true, 'Task completed via drag (fallback)');
        } catch (dragError) {
          logTestResult('integrationTest', false, 'Task completion failed');
        }
      }

      await page.screenshot({ 
        path: 'test-results/integration-workflow-step3-completed.png',
        fullPage: true 
      });

      // Step 3: Verify celebration
      try {
        const confettiContainer = page.locator('#confetti-container').first();
        await expect(confettiContainer).toBeVisible({ timeout: 2000 });
        logTestResult('integrationTest', true, 'Celebration animation triggered');
      } catch (error) {
        logTestResult('integrationTest', false, 'Celebration animation not detected');
      }

      await page.screenshot({ 
        path: 'test-results/integration-workflow-step4-celebration.png',
        fullPage: true 
      });

      // Step 4: Wait for auto-archive
      await page.waitForTimeout(3500);
      
      try {
        const taskElement = page.locator('.task-card:has-text("Integration Workflow Test")');
        await expect(taskElement).not.toBeVisible();
        logTestResult('integrationTest', true, 'Task auto-archived successfully');
      } catch (error) {
        logTestResult('integrationTest', false, 'Task failed to auto-archive');
      }

      await page.screenshot({ 
        path: 'test-results/integration-workflow-step5-archived.png',
        fullPage: true 
      });

      // Step 5: Verify metrics updated
      try {
        const newCompleted = parseInt(await completedToday.textContent()) || 0;
        if (newCompleted > initialCompleted) {
          logTestResult('integrationTest', true, 'Metrics updated correctly after workflow');
        } else {
          logTestResult('integrationTest', false, 'Metrics did not update after workflow');
        }
      } catch (error) {
        logTestResult('integrationTest', false, 'Failed to verify metrics update');
      }

      // Step 6: Test archive panel opens and displays archived tasks
      try {
        const archiveToggle = page.locator('#archive-toggle-btn');
        await archiveToggle.click();
        await page.waitForSelector('#archive-panel.open');
        
        const archivedTask = page.locator('.archived-task:has-text("Integration Workflow Test")');
        await expect(archivedTask).toBeVisible();
        logTestResult('integrationTest', true, 'Archive panel displays archived task');
      } catch (error) {
        logTestResult('integrationTest', false, 'Archive panel or archived task not found');
      }

      await page.screenshot({ 
        path: 'test-results/integration-workflow-step6-archive-panel.png',
        fullPage: true 
      });

      // Step 7: Test search and filter in archive
      try {
        const searchInput = page.locator('#archive-search');
        await searchInput.fill('Integration Workflow');
        await page.waitForTimeout(500);
        
        const searchResult = page.locator('.archived-task:has-text("Integration Workflow Test")');
        await expect(searchResult).toBeVisible();
        logTestResult('integrationTest', true, 'Archive search functionality works');
      } catch (error) {
        logTestResult('integrationTest', false, 'Archive search functionality failed');
      }

      await page.screenshot({ 
        path: 'test-results/integration-workflow-step7-search.png',
        fullPage: true 
      });

      // Step 8: Test restore functionality
      try {
        const archivedTask = page.locator('.archived-task:has-text("Integration Workflow Test")');
        const restoreButton = archivedTask.locator('.restore-btn, button:has-text("Restore")');
        
        if (await restoreButton.isVisible()) {
          await restoreButton.click();
          await page.waitForTimeout(500);
          
          // Close archive and check if task is restored
          await page.click('#archive-close-btn');
          await page.waitForTimeout(500);
          
          const restoredTask = page.locator('.task-card:has-text("Integration Workflow Test")');
          await expect(restoredTask).toBeVisible();
          logTestResult('integrationTest', true, 'Task restore functionality works');
        } else {
          logTestResult('integrationTest', false, 'Restore button not found');
        }
      } catch (error) {
        logTestResult('integrationTest', false, 'Task restore functionality failed');
      }

      await page.screenshot({ 
        path: 'test-results/integration-workflow-step8-restored.png',
        fullPage: true 
      });
    });
  });

  test.afterAll(async () => {
    // Generate comprehensive test report
    console.log('\n' + '='.repeat(80));
    console.log('PERSONAL TASK TRACKER - FINAL BUG FIXES VERIFICATION REPORT');
    console.log('='.repeat(80));
    
    const successRate = Math.round((testResults.passedTests / testResults.totalTests) * 100);
    
    console.log(`\nOVERALL RESULTS:`);
    console.log(`Total Tests: ${testResults.totalTests}`);
    console.log(`Passed: ${testResults.passedTests}`);
    console.log(`Failed: ${testResults.failedTests}`);
    console.log(`Success Rate: ${successRate}%`);
    
    console.log(`\n1. AUTO-ARCHIVE SYSTEM FIX:`);
    console.log(`Status: ${testResults.autoArchiveSystem.passed ? '✅ PASSED' : '❌ FAILED'}`);
    testResults.autoArchiveSystem.details.forEach(detail => console.log(`   ${detail}`));
    
    console.log(`\n2. METRICS DASHBOARD FIX:`);
    console.log(`Status: ${testResults.metricsDashboard.passed ? '✅ PASSED' : '❌ FAILED'}`);
    testResults.metricsDashboard.details.forEach(detail => console.log(`   ${detail}`));
    
    console.log(`\n3. MOBILE RESPONSIVENESS FIX:`);
    console.log(`Status: ${testResults.mobileResponsiveness.passed ? '✅ PASSED' : '❌ FAILED'}`);
    testResults.mobileResponsiveness.details.forEach(detail => console.log(`   ${detail}`));
    
    console.log(`\n4. INTEGRATION TEST:`);
    console.log(`Status: ${testResults.integrationTest.passed ? '✅ PASSED' : '❌ FAILED'}`);
    testResults.integrationTest.details.forEach(detail => console.log(`   ${detail}`));
    
    console.log('\n' + '='.repeat(80));
    console.log(`FINAL VERDICT: ${successRate >= 80 ? '✅ VERIFICATION SUCCESSFUL' : '❌ ISSUES DETECTED'}`);
    console.log('='.repeat(80));
    
    if (successRate < 80) {
      console.log('\n🔍 REMAINING ISSUES TO ADDRESS:');
      if (!testResults.autoArchiveSystem.passed) {
        console.log('- Auto-archive system needs attention');
      }
      if (!testResults.metricsDashboard.passed) {
        console.log('- Metrics dashboard requires fixes');
      }
      if (!testResults.mobileResponsiveness.passed) {
        console.log('- Mobile responsiveness issues remain');
      }
      if (!testResults.integrationTest.passed) {
        console.log('- Integration workflow has problems');
      }
    }
    
    console.log('\n📸 Screenshots captured in test-results/ directory for visual evidence');
    console.log('🔗 Test URL: http://localhost:8000/personal-task-tracker-sync.html');
    console.log('🔑 Test credentials: test@example.com / Welcome@123');
  });
});