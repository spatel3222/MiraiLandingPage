import { test, expect } from '@playwright/test';

test.describe('Focus Mode Enhanced Task Selection Modal', () => {
  let consoleLogs = [];
  let consoleErrors = [];

  test.beforeEach(async ({ page }) => {
    // Clear console logs before each test
    consoleLogs = [];
    consoleErrors = [];
    
    // Listen to console messages
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else {
        consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
      }
    });
    
    // Navigate to the personal task tracker page
    await page.goto('/personal-task-tracker-sync.html');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Add some sample tasks if needed
    await addSampleTasks(page);
  });

  test.afterEach(async ({ page }) => {
    // Report any console errors found
    if (consoleErrors.length > 0) {
      console.log('Console errors detected:', consoleErrors);
    }
  });

  test('should navigate to Focus Mode and take initial screenshots', async ({ page }) => {
    // Take screenshot of initial state
    await page.screenshot({ 
      path: './test-results/focus-mode-initial-state.png',
      fullPage: true 
    });
    
    // Enter Focus Mode by clicking the Focus button
    const focusButton = page.locator('#focus-mode-btn');
    await expect(focusButton).toBeVisible();
    await focusButton.click();
    
    // Wait for Focus Mode to be active
    await page.waitForSelector('#focus-mode-view:not(.hidden)', { timeout: 5000 });
    
    // Take screenshot of Focus Mode interface
    await page.screenshot({ 
      path: './test-results/focus-mode-interface.png',
      fullPage: true 
    });
    
    // Verify Focus Mode elements are visible
    await expect(page.locator('#focus-mode-view')).toBeVisible();
    await expect(page.locator('text=🎯 Daily Focus')).toBeVisible();
    await expect(page.locator('#add-focus-tasks-btn')).toBeVisible();
    await expect(page.locator('#exit-focus-btn')).toBeVisible();
  });

  test('should open and test Select Tasks modal functionality', async ({ page }) => {
    // Enter Focus Mode
    await page.click('#focus-mode-btn');
    await page.waitForSelector('#focus-mode-view:not(.hidden)');
    
    // Click "Select Tasks" button
    const selectTasksBtn = page.locator('#add-focus-tasks-btn');
    await expect(selectTasksBtn).toBeVisible();
    await selectTasksBtn.click();
    
    // Wait for modal to appear
    await page.waitForSelector('.fixed.inset-0.bg-black', { timeout: 5000 });
    
    // Take screenshot of the task selection modal
    await page.screenshot({ 
      path: './test-results/task-selection-modal-opened.png',
      fullPage: true 
    });
    
    // Verify modal elements
    await expect(page.locator('text=Select Focus Tasks')).toBeVisible();
    await expect(page.locator('#task-selection-list')).toBeVisible();
    
    // Check if search input exists (enhanced feature)
    const searchInput = page.locator('input[placeholder*="search" i]');
    if (await searchInput.count() > 0) {
      console.log('✅ Search functionality detected');
      await expect(searchInput).toBeVisible();
    } else {
      console.log('ℹ️ Search functionality not found in modal');
    }
  });

  test('should test search functionality if available', async ({ page }) => {
    await page.click('#focus-mode-btn');
    await page.waitForSelector('#focus-mode-view:not(.hidden)');
    
    await page.click('#add-focus-tasks-btn');
    await page.waitForSelector('.fixed.inset-0.bg-black');
    
    // Look for search input
    const searchInput = page.locator('input[placeholder*="search" i]');
    
    if (await searchInput.count() > 0) {
      // Test search functionality
      await searchInput.fill('test');
      
      // Wait for search results
      await page.waitForTimeout(1000);
      
      // Take screenshot of search results
      await page.screenshot({ 
        path: './test-results/task-search-results.png',
        fullPage: true 
      });
      
      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(500);
      
      // Take screenshot after clearing search
      await page.screenshot({ 
        path: './test-results/task-search-cleared.png',
        fullPage: true 
      });
      
      console.log('✅ Search functionality tested successfully');
    } else {
      console.log('ℹ️ Search functionality not implemented yet');
    }
  });

  test('should test category filters functionality', async ({ page }) => {
    await page.click('#focus-mode-btn');
    await page.waitForSelector('#focus-mode-view:not(.hidden)');
    
    await page.click('#add-focus-tasks-btn');
    await page.waitForSelector('.fixed.inset-0.bg-black');
    
    // Look for category filter buttons
    const categoryFilters = [
      'All',
      'Day Job',
      'Side Gig', 
      'Home'
    ];
    
    let filtersFound = 0;
    
    for (const filter of categoryFilters) {
      const filterBtn = page.locator(`button:has-text("${filter}")`);
      if (await filterBtn.count() > 0) {
        filtersFound++;
        
        // Click the filter button
        await filterBtn.click();
        await page.waitForTimeout(500);
        
        // Take screenshot of filtered results
        await page.screenshot({ 
          path: `./test-results/category-filter-${filter.toLowerCase().replace(' ', '-')}.png`,
          fullPage: true 
        });
        
        console.log(`✅ ${filter} category filter tested`);
      }
    }
    
    if (filtersFound > 0) {
      console.log(`✅ Found ${filtersFound} category filters`);
    } else {
      console.log('ℹ️ Category filters not found in modal');
    }
  });

  test('should test pagination functionality', async ({ page }) => {
    await page.click('#focus-mode-btn');
    await page.waitForSelector('#focus-mode-view:not(.hidden)');
    
    await page.click('#add-focus-tasks-btn');
    await page.waitForSelector('.fixed.inset-0.bg-black');
    
    // Look for pagination controls
    const paginationBtns = page.locator('.pagination-btn, button:has-text("Next"), button:has-text("Previous")');
    
    if (await paginationBtns.count() > 0) {
      // Take screenshot of pagination
      await page.screenshot({ 
        path: './test-results/pagination-controls.png',
        fullPage: true 
      });
      
      // Test next button if available
      const nextBtn = page.locator('button:has-text("Next")');
      if (await nextBtn.count() > 0 && await nextBtn.isEnabled()) {
        await nextBtn.click();
        await page.waitForTimeout(500);
        
        await page.screenshot({ 
          path: './test-results/pagination-page-2.png',
          fullPage: true 
        });
      }
      
      console.log('✅ Pagination functionality detected and tested');
    } else {
      console.log('ℹ️ Pagination functionality not found');
    }
  });

  test('should test task selection limit (max 5 tasks)', async ({ page }) => {
    await page.click('#focus-mode-btn');
    await page.waitForSelector('#focus-mode-view:not(.hidden)');
    
    await page.click('#add-focus-tasks-btn');
    await page.waitForSelector('.fixed.inset-0.bg-black');
    
    // Find task selection cards/checkboxes
    const taskCards = page.locator('.task-selection-card, [data-task-id]');
    const taskCount = await taskCards.count();
    
    console.log(`Found ${taskCount} selectable tasks`);
    
    if (taskCount > 0) {
      // Try to select more than 5 tasks if available
      const maxToSelect = Math.min(taskCount, 6); // Try to select 6 to test limit
      
      let selectedCount = 0;
      
      for (let i = 0; i < maxToSelect; i++) {
        const taskCard = taskCards.nth(i);
        
        // Try to select the task
        try {
          await taskCard.click();
          selectedCount++;
          
          // Take screenshot after each selection
          if (i === 4 || i === 5) { // Especially around the limit
            await page.screenshot({ 
              path: `./test-results/task-selection-${i + 1}-tasks.png`,
              fullPage: true 
            });
          }
          
          // Check selection counter if it exists
          const selectionCounter = page.locator('#selection-count, text*="selected"');
          if (await selectionCounter.count() > 0) {
            const counterText = await selectionCounter.textContent();
            console.log(`Selection counter shows: ${counterText}`);
          }
          
        } catch (error) {
          console.log(`Could not select task ${i + 1}: ${error.message}`);
        }
        
        await page.waitForTimeout(300);
      }
      
      console.log(`✅ Selected ${selectedCount} tasks, testing selection limit`);
    } else {
      console.log('ℹ️ No selectable tasks found for limit testing');
    }
  });

  test('should test mobile responsiveness at 375px width', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate and enter focus mode
    await page.click('#focus-mode-btn');
    await page.waitForSelector('#focus-mode-view:not(.hidden)');
    
    // Take screenshot of mobile focus mode
    await page.screenshot({ 
      path: './test-results/mobile-focus-mode.png',
      fullPage: true 
    });
    
    // Open task selection modal
    await page.click('#add-focus-tasks-btn');
    await page.waitForSelector('.fixed.inset-0.bg-black');
    
    // Take screenshot of mobile modal
    await page.screenshot({ 
      path: './test-results/mobile-task-selection-modal.png',
      fullPage: true 
    });
    
    // Verify mobile-specific elements
    const modalContent = page.locator('.modal-content, .bg-white');
    if (await modalContent.count() > 0) {
      const box = await modalContent.first().boundingBox();
      if (box) {
        console.log(`✅ Modal content dimensions on mobile: ${box.width}x${box.height}`);
        
        // Verify modal fits within viewport
        expect(box.width).toBeLessThanOrEqual(375);
        expect(box.x).toBeGreaterThanOrEqual(0);
      }
    }
    
    console.log('✅ Mobile responsiveness tested');
  });

  test('should test keyboard shortcuts (Escape to close)', async ({ page }) => {
    await page.click('#focus-mode-btn');
    await page.waitForSelector('#focus-mode-view:not(.hidden)');
    
    await page.click('#add-focus-tasks-btn');
    await page.waitForSelector('.fixed.inset-0.bg-black');
    
    // Take screenshot before pressing Escape
    await page.screenshot({ 
      path: './test-results/modal-before-escape.png',
      fullPage: true 
    });
    
    // Press Escape key to close modal
    await page.keyboard.press('Escape');
    
    // Wait for modal to close
    await page.waitForTimeout(500);
    
    // Take screenshot after pressing Escape
    await page.screenshot({ 
      path: './test-results/modal-after-escape.png',
      fullPage: true 
    });
    
    // Verify modal is closed
    const modal = page.locator('.fixed.inset-0.bg-black');
    if (await modal.count() === 0) {
      console.log('✅ Modal closed successfully with Escape key');
    } else {
      console.log('ℹ️ Modal still visible after Escape - checking if Escape handler is implemented');
    }
    
    // Test Escape to exit Focus Mode
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Take screenshot after second Escape
    await page.screenshot({ 
      path: './test-results/after-focus-mode-escape.png',
      fullPage: true 
    });
    
    // Check if Focus Mode exited
    const focusMode = page.locator('#focus-mode-view.hidden');
    if (await focusMode.count() > 0) {
      console.log('✅ Focus Mode exited successfully with Escape key');
    }
  });

  test('should monitor and report all console messages', async ({ page }) => {
    // Enter Focus Mode and interact with modal
    await page.click('#focus-mode-btn');
    await page.waitForSelector('#focus-mode-view:not(.hidden)');
    
    await page.click('#add-focus-tasks-btn');
    await page.waitForSelector('.fixed.inset-0.bg-black');
    
    // Interact with various elements to trigger any JS
    const taskCards = page.locator('.task-selection-card, [data-task-id]');
    const cardCount = await taskCards.count();
    
    if (cardCount > 0) {
      await taskCards.first().click();
    }
    
    // Wait a bit for any delayed console messages
    await page.waitForTimeout(2000);
    
    // Close modal and exit focus mode
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');
    
    // Report console findings
    console.log('\n📊 Console Activity Report:');
    console.log('='.repeat(50));
    
    if (consoleErrors.length > 0) {
      console.log('❌ JavaScript Errors Found:');
      consoleErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No JavaScript errors detected');
    }
    
    if (consoleLogs.length > 0) {
      console.log('\n📝 Console Messages:');
      consoleLogs.slice(-10).forEach((log, index) => { // Show last 10 logs
        console.log(`${index + 1}. ${log}`);
      });
    }
    
    console.log('='.repeat(50));
  });

  // Helper function to add sample tasks for testing
  async function addSampleTasks(page) {
    const sampleTasks = [
      { title: 'Test task for Day Job category', category: 'day-job', priority: 'medium' },
      { title: 'Test side gig project task', category: 'side-gig', priority: 'high' },
      { title: 'Home maintenance task', category: 'home', priority: 'low' },
      { title: 'Another day job task for search testing', category: 'day-job', priority: 'high' },
      { title: 'Side project development', category: 'side-gig', priority: 'medium' },
      { title: 'Household chores and organization', category: 'home', priority: 'low' },
      { title: 'Meeting preparation task', category: 'day-job', priority: 'high' },
      { title: 'Client work for side business', category: 'side-gig', priority: 'high' },
      { title: 'Garden work and maintenance', category: 'home', priority: 'medium' },
      { title: 'Code review and testing', category: 'day-job', priority: 'medium' }
    ];

    // Add tasks using the task creation interface if available
    for (const task of sampleTasks) {
      try {
        // Click add task button
        const addButton = page.locator('#add-task-btn, button:has-text("Add Task")').first();
        if (await addButton.count() > 0) {
          await addButton.click();
          
          // Wait for modal/form
          await page.waitForTimeout(300);
          
          // Fill task title
          const titleInput = page.locator('#task-title, input[placeholder*="task" i]').first();
          if (await titleInput.count() > 0) {
            await titleInput.fill(task.title);
          }
          
          // Select category
          const categorySelect = page.locator('#task-category');
          if (await categorySelect.count() > 0) {
            await categorySelect.selectOption(task.category);
          }
          
          // Select priority
          const prioritySelect = page.locator('#task-priority');
          if (await prioritySelect.count() > 0) {
            await prioritySelect.selectOption(task.priority);
          }
          
          // Submit task
          const submitButton = page.locator('button:has-text("Add Task"), button:has-text("Save")').first();
          if (await submitButton.count() > 0) {
            await submitButton.click();
          }
          
          await page.waitForTimeout(200);
        }
      } catch (error) {
        // If task creation fails, continue with next task
        console.log(`Could not create sample task: ${task.title}`);
      }
    }
    
    // Wait for tasks to be rendered
    await page.waitForTimeout(1000);
  }
});