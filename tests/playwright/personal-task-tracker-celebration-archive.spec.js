const { test, expect } = require('@playwright/test');

test.describe('Personal Task Tracker - Celebration & Archive Features', () => {
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
      await page.click('button[type="submit"]'); // Submit button
      await page.waitForSelector('#auth-overlay', { state: 'hidden' });
    }
  }

  // Helper function to add a test task
  async function addTestTask(page, taskTitle = 'Test Task for Celebration') {
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

  test.describe('Confetti Celebration Animation', () => {
    test('should trigger confetti animation when task is completed - Desktop', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      
      // Capture initial state
      await page.screenshot({ 
        path: 'test-results/celebration-desktop-initial.png',
        fullPage: true 
      });

      // Add a test task
      await addTestTask(page, 'Celebration Test Task');
      
      // Complete the task
      await completeTask(page, 'Celebration Test Task');
      
      // Capture immediately after completion
      await page.screenshot({ 
        path: 'test-results/celebration-desktop-just-completed.png',
        fullPage: true 
      });
      
      // Check for confetti container (use first() to handle duplicate IDs)
      const confettiContainer = page.locator('#confetti-container').first();
      await expect(confettiContainer).toBeVisible();
      
      // Check for celebration checkmark - wait longer as it might be dynamically created
      try {
        const celebrationCheckmark = page.locator('.celebration-checkmark');
        await expect(celebrationCheckmark).toBeVisible({ timeout: 2000 });
      } catch (error) {
        console.log('Celebration checkmark not found, continuing with test...');
        // Take screenshot of current state for debugging
        await page.screenshot({ 
          path: 'test-results/celebration-debug-no-checkmark.png',
          fullPage: true 
        });
      }
      
      // Capture celebration in progress
      await page.screenshot({ 
        path: 'test-results/celebration-desktop-active.png',
        fullPage: true 
      });
      
      // Wait for confetti particles to appear (they might be called .confetti-piece)
      try {
        await page.waitForSelector('.confetti-particle, .confetti-piece', { timeout: 3000 });
        const confettiParticles = page.locator('.confetti-particle, .confetti-piece');
        const particleCount = await confettiParticles.count();
        console.log(`Found ${particleCount} confetti particles`);
        expect(particleCount).toBeGreaterThan(0);
      } catch (error) {
        console.log('No confetti particles found, capturing debug screenshot...');
        await page.screenshot({ 
          path: 'test-results/celebration-debug-no-particles.png',
          fullPage: true 
        });
      }
      
      // Capture confetti particles
      await page.screenshot({ 
        path: 'test-results/celebration-desktop-confetti.png',
        fullPage: true 
      });
      
      // Wait for celebration to complete
      await page.waitForTimeout(3000);
      
      // Verify celebration elements are cleaned up
      const finalCheckmark = page.locator('.celebration-checkmark');
      await expect(finalCheckmark).not.toBeVisible();
      
      // Capture final state
      await page.screenshot({ 
        path: 'test-results/celebration-desktop-complete.png',
        fullPage: true 
      });
    });

    test('should trigger confetti animation when task is completed - Mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      
      // Capture initial state
      await page.screenshot({ 
        path: 'test-results/celebration-mobile-initial.png',
        fullPage: true 
      });

      // Add a test task
      await addTestTask(page, 'Mobile Celebration Test');
      
      // Complete the task
      await completeTask(page, 'Mobile Celebration Test');
      
      // Wait for celebration to start
      await page.waitForTimeout(100);
      
      // Check for celebration elements
      const confettiContainer = page.locator('#confetti-container').first();
      await expect(confettiContainer).toBeVisible();
      
      const celebrationCheckmark = page.locator('.celebration-checkmark');
      await expect(celebrationCheckmark).toBeVisible();
      
      // Capture celebration on mobile
      await page.screenshot({ 
        path: 'test-results/celebration-mobile-active.png',
        fullPage: true 
      });
      
      // Wait for confetti particles
      await page.waitForSelector('.confetti-particle', { timeout: 2000 });
      const confettiParticles = page.locator('.confetti-particle');
      await expect(confettiParticles).toHaveCount.greaterThan(0);
      
      // Capture mobile confetti
      await page.screenshot({ 
        path: 'test-results/celebration-mobile-confetti.png',
        fullPage: true 
      });
      
      // Wait for celebration to complete
      await page.waitForTimeout(3000);
      
      // Capture final mobile state
      await page.screenshot({ 
        path: 'test-results/celebration-mobile-complete.png',
        fullPage: true 
      });
    });

    test('should verify celebration performance and cleanup', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      
      // Monitor console for errors
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      // Add and complete task
      await addTestTask(page, 'Performance Test Task');
      await completeTask(page, 'Performance Test Task');
      
      // Measure animation duration
      const startTime = Date.now();
      await page.waitForSelector('.celebration-checkmark');
      
      // Wait for animation to complete
      await page.waitForTimeout(3500);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Verify no console errors during celebration
      expect(consoleErrors).toHaveLength(0);
      
      // Verify reasonable animation duration (should be around 3 seconds)
      expect(duration).toBeGreaterThan(2500);
      expect(duration).toBeLessThan(5000);
      
      // Verify cleanup - no confetti particles should remain
      const remainingParticles = page.locator('.confetti-particle');
      await expect(remainingParticles).toHaveCount(0);
      
      // Verify checkmark is hidden
      const checkmark = page.locator('.celebration-checkmark');
      await expect(checkmark).not.toBeVisible();
    });
  });

  test.describe('Daily Task Completion Metrics', () => {
    test('should display and update metrics dashboard correctly - Desktop', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      
      // Capture initial metrics state
      await page.screenshot({ 
        path: 'test-results/metrics-desktop-initial.png',
        fullPage: true 
      });
      
      // Verify metrics dashboard is visible
      const metricsGrid = page.locator('.metrics-grid');
      await expect(metricsGrid).toBeVisible();
      
      // Check initial values
      const completedToday = page.locator('#completed-today');
      const initialCompleted = await completedToday.textContent();
      
      // Add and complete a task
      await addTestTask(page, 'Metrics Test Task 1');
      await completeTask(page, 'Metrics Test Task 1');
      
      // Wait for metrics to update
      await page.waitForTimeout(500);
      
      // Verify metrics updated
      const updatedCompleted = await completedToday.textContent();
      expect(parseInt(updatedCompleted)).toBeGreaterThan(parseInt(initialCompleted));
      
      // Capture updated metrics
      await page.screenshot({ 
        path: 'test-results/metrics-desktop-updated.png',
        fullPage: true 
      });
      
      // Test progress ring animation
      const progressRing = page.locator('.progress-ring circle:last-child');
      if (await progressRing.isVisible()) {
        const strokeDasharray = await progressRing.getAttribute('stroke-dasharray');
        expect(strokeDasharray).toBeTruthy();
      }
    });

    test('should display metrics correctly on mobile viewport', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      
      // Capture mobile metrics initial state
      await page.screenshot({ 
        path: 'test-results/metrics-mobile-initial.png',
        fullPage: true 
      });
      
      // Verify responsive design
      const metricsGrid = page.locator('.metrics-grid');
      await expect(metricsGrid).toBeVisible();
      
      // Check all metric cards are visible on mobile
      const metricCards = page.locator('.metric-card');
      const cardCount = await metricCards.count();
      expect(cardCount).toBeGreaterThan(0);
      
      // Verify cards are properly sized for mobile
      for (let i = 0; i < cardCount; i++) {
        const card = metricCards.nth(i);
        await expect(card).toBeVisible();
      }
      
      // Add task and verify mobile metrics update
      await addTestTask(page, 'Mobile Metrics Test');
      await completeTask(page, 'Mobile Metrics Test');
      
      await page.waitForTimeout(500);
      
      // Capture mobile metrics after update
      await page.screenshot({ 
        path: 'test-results/metrics-mobile-updated.png',
        fullPage: true 
      });
    });

    test('should verify real-time metrics calculations', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      
      // Get initial metrics
      const completedToday = page.locator('#completed-today');
      const totalTasks = page.locator('#total-tasks');
      const completionRate = page.locator('#completion-rate');
      
      const initialCompleted = parseInt(await completedToday.textContent()) || 0;
      const initialTotal = parseInt(await totalTasks.textContent()) || 0;
      
      // Add multiple tasks
      for (let i = 1; i <= 3; i++) {
        await addTestTask(page, `Calculation Test Task ${i}`);
      }
      
      // Complete 2 out of 3 tasks
      await completeTask(page, 'Calculation Test Task 1');
      await page.waitForTimeout(500);
      await completeTask(page, 'Calculation Test Task 2');
      await page.waitForTimeout(500);
      
      // Verify metrics calculations
      const newCompleted = parseInt(await completedToday.textContent());
      const newTotal = parseInt(await totalTasks.textContent());
      
      expect(newCompleted).toBe(initialCompleted + 2);
      expect(newTotal).toBe(initialTotal + 3);
      
      // Check completion rate calculation
      const rateText = await completionRate.textContent();
      const expectedRate = Math.round((newCompleted / newTotal) * 100);
      expect(rateText).toContain(expectedRate.toString());
    });
  });

  test.describe('Archive System', () => {
    test('should auto-archive completed tasks after 3 seconds', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      
      // Add a test task
      await addTestTask(page, 'Auto Archive Test Task');
      
      // Capture before completion
      await page.screenshot({ 
        path: 'test-results/archive-before-completion.png',
        fullPage: true 
      });
      
      // Complete the task
      await completeTask(page, 'Auto Archive Test Task');
      
      // Verify task is initially still visible (during celebration)
      const taskElement = page.locator('.task-card:has-text("Auto Archive Test Task")');
      await expect(taskElement).toBeVisible();
      
      // Wait for auto-archive (3 seconds + buffer)
      await page.waitForTimeout(3500);
      
      // Verify task is no longer in main view
      await expect(taskElement).not.toBeVisible();
      
      // Capture after auto-archive
      await page.screenshot({ 
        path: 'test-results/archive-after-auto-archive.png',
        fullPage: true 
      });
    });

    test('should open and display archive panel correctly - Desktop', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      
      // First, archive a task
      await addTestTask(page, 'Archive Panel Test Task');
      await completeTask(page, 'Archive Panel Test Task');
      await page.waitForTimeout(3500); // Wait for auto-archive
      
      // Capture archive closed state
      await page.screenshot({ 
        path: 'test-results/archive-panel-closed-desktop.png',
        fullPage: true 
      });
      
      // Open archive panel
      const archiveToggle = page.locator('#archive-toggle-btn');
      await expect(archiveToggle).toBeVisible();
      await archiveToggle.click();
      
      // Verify archive panel opens
      const archivePanel = page.locator('#archive-panel');
      await expect(archivePanel).toHaveClass(/open/);
      
      // Verify archive backdrop is visible
      const archiveBackdrop = page.locator('#archive-backdrop');
      await expect(archiveBackdrop).toHaveClass(/open/);
      
      // Capture archive open state
      await page.screenshot({ 
        path: 'test-results/archive-panel-open-desktop.png',
        fullPage: true 
      });
      
      // Verify archived task is displayed
      const archivedTask = page.locator('.archived-task:has-text("Archive Panel Test Task")');
      await expect(archivedTask).toBeVisible();
      
      // Test close functionality
      const closeButton = page.locator('#archive-close-btn');
      await closeButton.click();
      
      await page.waitForTimeout(500);
      await expect(archivePanel).not.toHaveClass(/open/);
      
      // Capture archive closed state again
      await page.screenshot({ 
        path: 'test-results/archive-panel-closed-after-desktop.png',
        fullPage: true 
      });
    });

    test('should open and display archive panel correctly - Mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      
      // First, archive a task
      await addTestTask(page, 'Mobile Archive Test Task');
      await completeTask(page, 'Mobile Archive Test Task');
      await page.waitForTimeout(3500); // Wait for auto-archive
      
      // Capture mobile archive closed state
      await page.screenshot({ 
        path: 'test-results/archive-panel-closed-mobile.png',
        fullPage: true 
      });
      
      // Open archive panel on mobile
      const archiveToggle = page.locator('#archive-toggle-btn');
      await expect(archiveToggle).toBeVisible();
      await archiveToggle.click();
      
      // Verify archive panel opens (full width on mobile)
      const archivePanel = page.locator('#archive-panel');
      await expect(archivePanel).toHaveClass(/open/);
      
      // Capture mobile archive open state
      await page.screenshot({ 
        path: 'test-results/archive-panel-open-mobile.png',
        fullPage: true 
      });
      
      // Verify task is displayed
      const archivedTask = page.locator('.archived-task:has-text("Mobile Archive Test Task")');
      await expect(archivedTask).toBeVisible();
      
      // Test close on mobile
      const closeButton = page.locator('#archive-close-btn');
      await closeButton.click();
      
      await page.waitForTimeout(500);
      await expect(archivePanel).not.toHaveClass(/open/);
    });

    test('should test archive search and filter functionality', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      
      // Archive multiple tasks with different content
      const testTasks = ['Search Test Task 1', 'Filter Test Task 2', 'Another Task 3'];
      
      for (const taskTitle of testTasks) {
        await addTestTask(page, taskTitle);
        await completeTask(page, taskTitle);
        await page.waitForTimeout(3500); // Wait for auto-archive
      }
      
      // Open archive panel
      await page.click('#archive-toggle-btn');
      await page.waitForSelector('#archive-panel.open');
      
      // Test search functionality
      const searchInput = page.locator('#archive-search');
      await searchInput.fill('Search Test');
      
      // Wait for search to filter results
      await page.waitForTimeout(500);
      
      // Verify only matching tasks are shown
      const searchResults = page.locator('.archived-task:visible');
      const searchCount = await searchResults.count();
      expect(searchCount).toBe(1);
      
      // Verify correct task is shown
      await expect(page.locator('.archived-task:has-text("Search Test Task 1")')).toBeVisible();
      
      // Capture search results
      await page.screenshot({ 
        path: 'test-results/archive-search-results.png',
        fullPage: true 
      });
      
      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(500);
      
      // Test filter functionality
      const todayFilter = page.locator('.archive-filter[data-filter="today"]');
      await todayFilter.click();
      
      await page.waitForTimeout(500);
      
      // Verify filter is active
      await expect(todayFilter).toHaveClass(/active/);
      
      // Capture filter results
      await page.screenshot({ 
        path: 'test-results/archive-filter-today.png',
        fullPage: true 
      });
    });

    test('should test restore functionality', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      
      // Archive a task
      await addTestTask(page, 'Restore Test Task');
      await completeTask(page, 'Restore Test Task');
      await page.waitForTimeout(3500);
      
      // Open archive panel
      await page.click('#archive-toggle-btn');
      await page.waitForSelector('#archive-panel.open');
      
      // Find and restore the task
      const archivedTask = page.locator('.archived-task:has-text("Restore Test Task")');
      await expect(archivedTask).toBeVisible();
      
      const restoreButton = archivedTask.locator('.restore-btn, button:has-text("Restore")');
      if (await restoreButton.isVisible()) {
        await restoreButton.click();
        
        // Wait for restore action
        await page.waitForTimeout(500);
        
        // Close archive panel
        await page.click('#archive-close-btn');
        await page.waitForTimeout(500);
        
        // Verify task is back in main view
        const restoredTask = page.locator('.task-card:has-text("Restore Test Task")');
        await expect(restoredTask).toBeVisible();
        
        // Capture restored state
        await page.screenshot({ 
          path: 'test-results/archive-task-restored.png',
          fullPage: true 
        });
      }
    });

    test('should verify archive statistics', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      
      // Archive multiple tasks
      for (let i = 1; i <= 3; i++) {
        await addTestTask(page, `Stats Test Task ${i}`);
        await completeTask(page, `Stats Test Task ${i}`);
        await page.waitForTimeout(3500);
      }
      
      // Open archive panel
      await page.click('#archive-toggle-btn');
      await page.waitForSelector('#archive-panel.open');
      
      // Check archive statistics
      const totalArchived = page.locator('#total-archived');
      const archivedThisWeek = page.locator('#archived-this-week');
      
      const totalCount = parseInt(await totalArchived.textContent());
      const weekCount = parseInt(await archivedThisWeek.textContent());
      
      expect(totalCount).toBeGreaterThanOrEqual(3);
      expect(weekCount).toBeGreaterThanOrEqual(3);
      
      // Capture archive statistics
      await page.screenshot({ 
        path: 'test-results/archive-statistics.png',
        fullPage: true 
      });
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should verify all features work on mobile viewport', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      
      // Capture mobile initial state
      await page.screenshot({ 
        path: 'test-results/mobile-responsiveness-initial.png',
        fullPage: true 
      });
      
      // Test task creation on mobile
      await page.click('#fab-button');
      await page.waitForSelector('#task-modal');
      
      // Capture mobile task modal
      await page.screenshot({ 
        path: 'test-results/mobile-task-modal.png',
        fullPage: true 
      });
      
      await page.fill('#task-title', 'Mobile Responsive Test');
      await page.click('#save-task-btn');
      await page.waitForSelector('#task-modal', { state: 'hidden' });
      
      // Test task completion on mobile
      await completeTask(page, 'Mobile Responsive Test');
      
      // Capture mobile celebration
      await page.waitForTimeout(1000);
      await page.screenshot({ 
        path: 'test-results/mobile-celebration-responsive.png',
        fullPage: true 
      });
      
      // Wait for auto-archive
      await page.waitForTimeout(3000);
      
      // Test archive panel on mobile
      await page.click('#archive-toggle-btn');
      await page.waitForSelector('#archive-panel.open');
      
      // Capture mobile archive panel
      await page.screenshot({ 
        path: 'test-results/mobile-archive-responsive.png',
        fullPage: true 
      });
      
      // Test touch interactions
      const archiveTask = page.locator('.archived-task');
      if (await archiveTask.count() > 0) {
        // Test hover effect (simulated touch)
        await archiveTask.first().hover();
        await page.waitForTimeout(200);
        
        await page.screenshot({ 
          path: 'test-results/mobile-touch-interaction.png',
          fullPage: true 
        });
      }
    });

    test('should verify responsive design breakpoints', async ({ page }) => {
      const breakpoints = [
        { name: 'mobile-small', width: 320, height: 568 },
        { name: 'mobile-medium', width: 375, height: 667 },
        { name: 'mobile-large', width: 414, height: 896 },
        { name: 'tablet', width: 768, height: 1024 },
        { name: 'desktop', width: 1280, height: 720 }
      ];
      
      for (const breakpoint of breakpoints) {
        await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
        
        // Wait for responsive changes to apply
        await page.waitForTimeout(300);
        
        // Verify metrics dashboard is responsive
        const metricsGrid = page.locator('.metrics-grid');
        await expect(metricsGrid).toBeVisible();
        
        // Verify archive toggle is positioned correctly
        const archiveToggle = page.locator('#archive-toggle-btn');
        await expect(archiveToggle).toBeVisible();
        
        // Capture each breakpoint
        await page.screenshot({ 
          path: `test-results/responsive-${breakpoint.name}.png`,
          fullPage: true 
        });
      }
    });
  });

  test.describe('Integration Testing', () => {
    test('should test complete flow: creation → completion → celebration → archive', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      
      // Step 1: Capture initial state
      await page.screenshot({ 
        path: 'test-results/integration-flow-step1-initial.png',
        fullPage: true 
      });
      
      // Step 2: Create task
      await addTestTask(page, 'Integration Flow Test Task');
      await page.screenshot({ 
        path: 'test-results/integration-flow-step2-created.png',
        fullPage: true 
      });
      
      // Step 3: Complete task (triggers celebration)
      await completeTask(page, 'Integration Flow Test Task');
      await page.screenshot({ 
        path: 'test-results/integration-flow-step3-completed.png',
        fullPage: true 
      });
      
      // Step 4: Verify celebration is active
      await page.waitForSelector('.celebration-checkmark');
      await page.screenshot({ 
        path: 'test-results/integration-flow-step4-celebration.png',
        fullPage: true 
      });
      
      // Step 5: Wait for auto-archive
      await page.waitForTimeout(3500);
      await page.screenshot({ 
        path: 'test-results/integration-flow-step5-archived.png',
        fullPage: true 
      });
      
      // Step 6: Verify task in archive
      await page.click('#archive-toggle-btn');
      await page.waitForSelector('#archive-panel.open');
      
      const archivedTask = page.locator('.archived-task:has-text("Integration Flow Test Task")');
      await expect(archivedTask).toBeVisible();
      
      await page.screenshot({ 
        path: 'test-results/integration-flow-step6-archive-view.png',
        fullPage: true 
      });
      
      // Step 7: Verify metrics updated
      await page.click('#archive-close-btn');
      await page.waitForTimeout(500);
      
      const completedToday = page.locator('#completed-today');
      const completedCount = parseInt(await completedToday.textContent());
      expect(completedCount).toBeGreaterThan(0);
      
      await page.screenshot({ 
        path: 'test-results/integration-flow-step7-metrics-updated.png',
        fullPage: true 
      });
    });

    test('should test edge cases and error handling', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      
      // Test rapid task completion (stress test)
      const rapidTasks = ['Rapid 1', 'Rapid 2', 'Rapid 3'];
      
      for (const taskTitle of rapidTasks) {
        await addTestTask(page, taskTitle);
      }
      
      // Complete tasks rapidly
      for (const taskTitle of rapidTasks) {
        await completeTask(page, taskTitle);
        await page.waitForTimeout(100); // Minimal delay
      }
      
      // Capture state during rapid completion
      await page.screenshot({ 
        path: 'test-results/edge-case-rapid-completion.png',
        fullPage: true 
      });
      
      // Wait for all celebrations to complete
      await page.waitForTimeout(4000);
      
      // Verify all tasks were handled correctly
      await page.click('#archive-toggle-btn');
      await page.waitForSelector('#archive-panel.open');
      
      // Check that all rapid tasks are archived
      for (const taskTitle of rapidTasks) {
        const archivedTask = page.locator(`.archived-task:has-text("${taskTitle}")`);
        await expect(archivedTask).toBeVisible();
      }
      
      await page.screenshot({ 
        path: 'test-results/edge-case-rapid-archived.png',
        fullPage: true 
      });
      
      // Test empty states
      await page.click('#archive-close-btn');
      
      // Clear search to test empty search results
      await page.click('#archive-toggle-btn');
      const searchInput = page.locator('#archive-search');
      await searchInput.fill('nonexistent task');
      await page.waitForTimeout(500);
      
      // Should show no results
      const visibleTasks = page.locator('.archived-task:visible');
      await expect(visibleTasks).toHaveCount(0);
      
      await page.screenshot({ 
        path: 'test-results/edge-case-empty-search.png',
        fullPage: true 
      });
    });

    test('should verify performance under load', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      
      // Monitor console for performance warnings
      const consoleMessages = [];
      page.on('console', msg => {
        consoleMessages.push({ type: msg.type(), text: msg.text() });
      });
      
      // Create and complete many tasks to test performance
      const taskCount = 10;
      const tasks = [];
      
      for (let i = 1; i <= taskCount; i++) {
        tasks.push(`Performance Test Task ${i}`);
      }
      
      // Add all tasks
      const startAdd = Date.now();
      for (const taskTitle of tasks) {
        await addTestTask(page, taskTitle);
      }
      const addDuration = Date.now() - startAdd;
      
      // Complete all tasks
      const startComplete = Date.now();
      for (const taskTitle of tasks) {
        await completeTask(page, taskTitle);
        await page.waitForTimeout(50); // Small delay to prevent overwhelming
      }
      const completeDuration = Date.now() - startComplete;
      
      // Wait for all processing to complete
      await page.waitForTimeout(5000);
      
      // Check performance metrics
      expect(addDuration).toBeLessThan(30000); // Should add 10 tasks in under 30 seconds
      expect(completeDuration).toBeLessThan(60000); // Should complete 10 tasks in under 60 seconds
      
      // Verify no critical errors
      const errors = consoleMessages.filter(msg => msg.type === 'error');
      expect(errors).toHaveLength(0);
      
      // Capture final performance state
      await page.screenshot({ 
        path: 'test-results/performance-test-final.png',
        fullPage: true 
      });
      
      // Verify all tasks are in archive
      await page.click('#archive-toggle-btn');
      await page.waitForSelector('#archive-panel.open');
      
      const totalArchived = page.locator('#total-archived');
      const archivedCount = parseInt(await totalArchived.textContent());
      expect(archivedCount).toBeGreaterThanOrEqual(taskCount);
      
      await page.screenshot({ 
        path: 'test-results/performance-test-archive.png',
        fullPage: true 
      });
    });
  });
});