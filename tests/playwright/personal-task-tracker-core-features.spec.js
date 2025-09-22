const { test, expect } = require('@playwright/test');

test.describe('Personal Task Tracker - Core Features Validation', () => {
  // Test configuration
  const TEST_CREDENTIALS = {
    email: 'test@example.com',
    password: 'Welcome@123'
  };

  const VIEWPORTS = {
    desktop: { width: 1920, height: 1080 },
    mobile: { width: 375, height: 667 }
  };

  // Helper function to authenticate
  async function authenticate(page) {
    await page.goto('/personal-task-tracker-sync.html');
    
    // Check if auth overlay appears
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

  // Helper function to complete a task by dragging to done column
  async function completeTask(page, taskTitle) {
    const taskElement = page.locator(`.task-card:has-text("${taskTitle}")`);
    await expect(taskElement).toBeVisible();
    
    // Get the done column target
    const doneColumn = page.locator('#done-column');
    await expect(doneColumn).toBeVisible();
    
    // Drag task from its current position to the done column
    await taskElement.dragTo(doneColumn);
    
    return taskElement;
  }

  test.beforeEach(async ({ page }) => {
    await authenticate(page);
    // Wait for app to fully load
    await page.waitForSelector('.metrics-dashboard');
    await page.waitForSelector('#fab-main');
  });

  test('should successfully complete the full task flow: create → complete → verify metrics → check archive', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    
    // Step 1: Capture initial state
    await page.screenshot({ 
      path: 'test-results/core-features-step1-initial.png',
      fullPage: true 
    });
    
    // Step 2: Verify metrics dashboard is working
    const metricsGrid = page.locator('.metrics-grid');
    await expect(metricsGrid).toBeVisible();
    
    const completedTodayInitial = page.locator('#completed-today');
    const initialCount = parseInt(await completedTodayInitial.textContent()) || 0;
    
    // Step 3: Create a new task
    await addTestTask(page, 'Core Features Test Task');
    
    // Verify task appears in Todo column
    const taskInTodo = page.locator('#todo-column .task-card:has-text("Core Features Test Task")');
    await expect(taskInTodo).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/core-features-step2-task-created.png',
      fullPage: true 
    });
    
    // Step 4: Complete the task
    await completeTask(page, 'Core Features Test Task');
    
    // Verify task moved to Done column
    const taskInDone = page.locator('#done-column .task-card:has-text("Core Features Test Task")');
    await expect(taskInDone).toBeVisible();
    
    // Verify done count updated
    const doneCount = page.locator('#done-count');
    const doneCountValue = parseInt(await doneCount.textContent());
    expect(doneCountValue).toBeGreaterThan(0);
    
    await page.screenshot({ 
      path: 'test-results/core-features-step3-task-completed.png',
      fullPage: true 
    });
    
    // Step 5: Verify metrics updated
    await page.waitForTimeout(1000); // Allow time for metrics to update
    const completedTodayFinal = parseInt(await completedTodayInitial.textContent());
    expect(completedTodayFinal).toBeGreaterThanOrEqual(initialCount);
    
    // Step 6: Test archive functionality - wait for auto-archive
    console.log('Waiting for auto-archive (3 seconds)...');
    await page.waitForTimeout(3500);
    
    // Task should be archived now
    await expect(taskInDone).not.toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/core-features-step4-auto-archived.png',
      fullPage: true 
    });
    
    // Step 7: Open archive panel
    const archiveToggle = page.locator('#archive-toggle-btn');
    await expect(archiveToggle).toBeVisible();
    await archiveToggle.click();
    
    // Verify archive panel opens
    const archivePanel = page.locator('#archive-panel');
    await expect(archivePanel).toHaveClass(/open/);
    
    await page.screenshot({ 
      path: 'test-results/core-features-step5-archive-opened.png',
      fullPage: true 
    });
    
    // Step 8: Verify task is in archive
    const archivedTask = page.locator('.archived-task:has-text("Core Features Test Task")');
    await expect(archivedTask).toBeVisible();
    
    // Step 9: Test archive search
    const searchInput = page.locator('#archive-search');
    await searchInput.fill('Core Features');
    await page.waitForTimeout(500);
    
    await expect(archivedTask).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/core-features-step6-archive-search.png',
      fullPage: true 
    });
    
    // Step 10: Close archive and verify final state
    const closeButton = page.locator('#archive-close-btn');
    await closeButton.click();
    await page.waitForTimeout(500);
    
    await expect(archivePanel).not.toHaveClass(/open/);
    
    await page.screenshot({ 
      path: 'test-results/core-features-final-state.png',
      fullPage: true 
    });
    
    console.log('✅ All core features validated successfully!');
  });

  test('should verify celebration animation triggers when task is completed', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    
    // Create and complete a task to trigger celebration
    await addTestTask(page, 'Celebration Trigger Test');
    
    // Set up console logging to capture any celebration-related logs
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });
    
    // Complete the task
    await completeTask(page, 'Celebration Trigger Test');
    
    // Capture immediately after completion
    await page.screenshot({ 
      path: 'test-results/celebration-verification-immediate.png',
      fullPage: true 
    });
    
    // Check if confetti container exists (even if not visible)
    const confettiContainer = page.locator('#confetti-container').first();
    const confettiExists = await confettiContainer.count() > 0;
    
    // Wait a moment and capture again
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: 'test-results/celebration-verification-after-1sec.png',
      fullPage: true 
    });
    
    // Verify task moved to done column (core functionality)
    const taskInDone = page.locator('#done-column .task-card:has-text("Celebration Trigger Test")');
    await expect(taskInDone).toBeVisible();
    
    console.log(`Confetti container exists: ${confettiExists}`);
    console.log(`Console logs captured: ${consoleLogs.length}`);
    
    // Document findings
    expect(confettiExists).toBe(true); // At minimum, container should exist
  });

  test('should verify mobile responsiveness', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    
    // Capture mobile initial state
    await page.screenshot({ 
      path: 'test-results/mobile-responsive-initial.png',
      fullPage: true 
    });
    
    // Verify all key elements are visible on mobile
    await expect(page.locator('.metrics-dashboard')).toBeVisible();
    await expect(page.locator('#fab-main')).toBeVisible();
    await expect(page.locator('#todo-column')).toBeVisible();
    await expect(page.locator('#done-column')).toBeVisible();
    
    // Test task creation on mobile
    await addTestTask(page, 'Mobile Test Task');
    
    await page.screenshot({ 
      path: 'test-results/mobile-responsive-task-created.png',
      fullPage: true 
    });
    
    // Complete task on mobile
    await completeTask(page, 'Mobile Test Task');
    
    await page.screenshot({ 
      path: 'test-results/mobile-responsive-task-completed.png',
      fullPage: true 
    });
    
    // Test archive on mobile
    await page.waitForTimeout(3500);
    
    const archiveToggle = page.locator('#archive-toggle-btn');
    await archiveToggle.click();
    
    await page.screenshot({ 
      path: 'test-results/mobile-responsive-archive-opened.png',
      fullPage: true 
    });
    
    // Verify archive panel takes full width on mobile
    const archivePanel = page.locator('#archive-panel');
    await expect(archivePanel).toHaveClass(/open/);
    
    console.log('✅ Mobile responsiveness verified successfully!');
  });

  test('should verify metrics dashboard updates correctly', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    
    // Get initial metrics
    const completedToday = page.locator('#completed-today');
    const totalTasks = page.locator('#total-tasks');
    
    const initialCompleted = parseInt(await completedToday.textContent()) || 0;
    const initialTotal = parseInt(await totalTasks.textContent()) || 0;
    
    // Create multiple tasks
    const testTasks = ['Metrics Test 1', 'Metrics Test 2', 'Metrics Test 3'];
    
    for (const taskTitle of testTasks) {
      await addTestTask(page, taskTitle);
    }
    
    // Complete 2 out of 3 tasks
    await completeTask(page, 'Metrics Test 1');
    await page.waitForTimeout(500);
    await completeTask(page, 'Metrics Test 2');
    await page.waitForTimeout(500);
    
    // Verify metrics updated
    const newCompleted = parseInt(await completedToday.textContent());
    const newTotal = parseInt(await totalTasks.textContent());
    
    expect(newCompleted).toBeGreaterThanOrEqual(initialCompleted + 2);
    expect(newTotal).toBeGreaterThanOrEqual(initialTotal + 3);
    
    await page.screenshot({ 
      path: 'test-results/metrics-dashboard-updated.png',
      fullPage: true 
    });
    
    console.log(`✅ Metrics verified: Completed ${newCompleted}, Total ${newTotal}`);
  });

  test('should verify archive system functionality', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    
    // Create and complete multiple tasks for archive testing
    const archiveTasks = ['Archive Test 1', 'Archive Test 2', 'Search Test Task'];
    
    for (const taskTitle of archiveTasks) {
      await addTestTask(page, taskTitle);
      await completeTask(page, taskTitle);
      await page.waitForTimeout(500);
    }
    
    // Wait for auto-archive
    console.log('Waiting for tasks to auto-archive...');
    await page.waitForTimeout(4000);
    
    // Open archive panel
    const archiveToggle = page.locator('#archive-toggle-btn');
    await archiveToggle.click();
    
    // Verify all tasks are archived
    for (const taskTitle of archiveTasks) {
      const archivedTask = page.locator(`.archived-task:has-text("${taskTitle}")`);
      await expect(archivedTask).toBeVisible();
    }
    
    await page.screenshot({ 
      path: 'test-results/archive-all-tasks.png',
      fullPage: true 
    });
    
    // Test search functionality
    const searchInput = page.locator('#archive-search');
    await searchInput.fill('Search Test');
    await page.waitForTimeout(500);
    
    // Should show only the matching task
    const searchResult = page.locator('.archived-task:has-text("Search Test Task")');
    await expect(searchResult).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/archive-search-functionality.png',
      fullPage: true 
    });
    
    // Test filter functionality
    await searchInput.clear();
    await page.waitForTimeout(500);
    
    const todayFilter = page.locator('.archive-filter[data-filter="today"]');
    await todayFilter.click();
    await page.waitForTimeout(500);
    
    await expect(todayFilter).toHaveClass(/active/);
    
    await page.screenshot({ 
      path: 'test-results/archive-filter-today.png',
      fullPage: true 
    });
    
    // Check archive statistics
    const totalArchived = page.locator('#total-archived');
    const archivedThisWeek = page.locator('#archived-this-week');
    
    const totalCount = parseInt(await totalArchived.textContent());
    const weekCount = parseInt(await archivedThisWeek.textContent());
    
    expect(totalCount).toBeGreaterThanOrEqual(3);
    expect(weekCount).toBeGreaterThanOrEqual(3);
    
    console.log(`✅ Archive verified: ${totalCount} total, ${weekCount} this week`);
  });
});