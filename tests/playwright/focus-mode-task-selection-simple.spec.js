import { test, expect } from '@playwright/test';

test.describe('Focus Mode Task Selection Modal - Simple Test', () => {
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
  });

  test('should navigate to Focus Mode and capture screenshots', async ({ page }) => {
    // Take screenshot of initial state
    await page.screenshot({ 
      path: './test-results/focus-mode-initial-state.png',
      fullPage: true 
    });
    
    // Verify Focus Mode button exists
    const focusButton = page.locator('#focus-mode-btn');
    await expect(focusButton).toBeVisible();
    
    // Enter Focus Mode
    await focusButton.click();
    
    // Wait for Focus Mode to be active
    await page.waitForSelector('#focus-mode-view:not(.hidden)', { timeout: 10000 });
    
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
    
    console.log('✅ Successfully entered Focus Mode and captured screenshots');
  });

  test('should open Select Tasks modal and analyze structure', async ({ page }) => {
    // Enter Focus Mode
    await page.click('#focus-mode-btn');
    await page.waitForSelector('#focus-mode-view:not(.hidden)');
    
    // Click "Select Tasks" button
    const selectTasksBtn = page.locator('#add-focus-tasks-btn');
    await expect(selectTasksBtn).toBeVisible();
    await selectTasksBtn.click();
    
    // Wait for modal to appear and take screenshot
    await page.waitForSelector('.fixed.inset-0.bg-black', { timeout: 5000 });
    await page.screenshot({ 
      path: './test-results/task-selection-modal-opened.png',
      fullPage: true 
    });
    
    // Analyze modal structure
    const modalElements = {
      modal: await page.locator('.fixed.inset-0.bg-black').count(),
      title: await page.locator('text=Select Focus Tasks').count(),
      taskList: await page.locator('#task-selection-list').count(),
      closeButton: await page.locator('button:has-text("×"), button[title*="close" i], button:has(svg)').count(),
      searchInput: await page.locator('input[placeholder*="search" i]').count(),
      categoryFilters: await page.locator('.category-filter-btn, button:has-text("All"), button:has-text("Day Job")').count(),
      paginationControls: await page.locator('.pagination-btn, button:has-text("Next"), button:has-text("Previous")').count(),
      sortOptions: await page.locator('select[name*="sort" i], .sort-dropdown').count(),
      selectionCounter: await page.locator('#selection-count').count() + await page.locator('text=/selected/').count(),
      startButton: await page.locator('#start-focus-btn, button:has-text("Start Focus Mode")').count()
    };
    
    console.log('\n📊 Modal Structure Analysis:');
    console.log('='.repeat(50));
    console.log(`✅ Modal container: ${modalElements.modal > 0 ? 'Found' : 'Missing'}`);
    console.log(`${modalElements.title > 0 ? '✅' : '❌'} Modal title: ${modalElements.title > 0 ? 'Found' : 'Missing'}`);
    console.log(`${modalElements.taskList > 0 ? '✅' : '❌'} Task list container: ${modalElements.taskList > 0 ? 'Found' : 'Missing'}`);
    console.log(`${modalElements.closeButton > 0 ? '✅' : '❌'} Close button: ${modalElements.closeButton > 0 ? 'Found' : 'Missing'}`);
    console.log(`${modalElements.searchInput > 0 ? '✅' : '⚠️'} Search input: ${modalElements.searchInput > 0 ? 'Found' : 'Not implemented'}`);
    console.log(`${modalElements.categoryFilters > 0 ? '✅' : '⚠️'} Category filters: ${modalElements.categoryFilters > 0 ? `Found (${modalElements.categoryFilters})` : 'Not implemented'}`);
    console.log(`${modalElements.paginationControls > 0 ? '✅' : '⚠️'} Pagination controls: ${modalElements.paginationControls > 0 ? 'Found' : 'Not implemented'}`);
    console.log(`${modalElements.sortOptions > 0 ? '✅' : '⚠️'} Sort options: ${modalElements.sortOptions > 0 ? 'Found' : 'Not implemented'}`);
    console.log(`${modalElements.selectionCounter > 0 ? '✅' : '⚠️'} Selection counter: ${modalElements.selectionCounter > 0 ? 'Found' : 'Not implemented'}`);
    console.log(`${modalElements.startButton > 0 ? '✅' : '❌'} Start button: ${modalElements.startButton > 0 ? 'Found' : 'Missing'}`);
    console.log('='.repeat(50));
  });

  test('should test available tasks and interaction', async ({ page }) => {
    // Enter Focus Mode and open modal
    await page.click('#focus-mode-btn');
    await page.waitForSelector('#focus-mode-view:not(.hidden)');
    await page.click('#add-focus-tasks-btn');
    await page.waitForSelector('.fixed.inset-0.bg-black');
    
    // Look for existing tasks in the system
    const taskElements = await page.locator('#task-selection-list .task-selection-card, #task-selection-list [data-task-id], #task-selection-list li, #task-selection-list .task-item').count();
    
    console.log(`Found ${taskElements} task elements for selection`);
    
    if (taskElements > 0) {
      // Try to interact with first task
      const firstTask = page.locator('#task-selection-list .task-selection-card, #task-selection-list [data-task-id], #task-selection-list li, #task-selection-list .task-item').first();
      
      await page.screenshot({ 
        path: './test-results/tasks-before-selection.png',
        fullPage: true 
      });
      
      // Try to select the task
      await firstTask.click();
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: './test-results/tasks-after-selection.png',
        fullPage: true 
      });
      
      // Check if selection was successful
      const selectedTasks = await page.locator('.task-selection-card.selected, .selected, [aria-selected="true"]').count();
      console.log(`✅ Selected ${selectedTasks} task(s)`);
    } else {
      console.log('ℹ️ No existing tasks found - this is expected for a fresh instance');
      
      // Look for "no tasks" message or empty state
      const emptyState = await page.locator(':text("No tasks"), :text("Empty"), :text("Add some tasks")').count();
      if (emptyState > 0) {
        console.log('✅ Empty state message found');
      }
    }
  });

  test('should test keyboard shortcuts', async ({ page }) => {
    // Enter Focus Mode and open modal
    await page.click('#focus-mode-btn');
    await page.waitForSelector('#focus-mode-view:not(.hidden)');
    await page.click('#add-focus-tasks-btn');
    await page.waitForSelector('.fixed.inset-0.bg-black');
    
    await page.screenshot({ 
      path: './test-results/modal-before-escape.png',
      fullPage: true 
    });
    
    // Test Escape to close modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: './test-results/modal-after-escape.png',
      fullPage: true 
    });
    
    // Check if modal closed
    const modalVisible = await page.locator('.fixed.inset-0.bg-black').count();
    if (modalVisible === 0) {
      console.log('✅ Modal closed successfully with Escape key');
    } else {
      console.log('⚠️ Modal still visible - Escape handler may not be implemented');
    }
    
    // Test Escape to exit Focus Mode
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: './test-results/after-focus-mode-escape.png',
      fullPage: true 
    });
    
    // Check if Focus Mode exited
    const focusModeHidden = await page.locator('#focus-mode-view.hidden').count();
    if (focusModeHidden > 0) {
      console.log('✅ Focus Mode exited successfully with Escape key');
    } else {
      console.log('⚠️ Focus Mode still active - Escape handler may not be fully implemented');
    }
  });

  test('should test mobile responsiveness', async ({ page }) => {
    // Set mobile viewport (iPhone 12 Pro)
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Enter Focus Mode
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
    
    // Check modal dimensions and positioning
    const modalContent = page.locator('.bg-white, .bg-gray-800').first();
    if (await modalContent.count() > 0) {
      const box = await modalContent.boundingBox();
      if (box) {
        console.log(`📱 Mobile Modal Dimensions: ${Math.round(box.width)}x${Math.round(box.height)}`);
        console.log(`📱 Modal Position: x=${Math.round(box.x)}, y=${Math.round(box.y)}`);
        
        // Verify modal fits within viewport
        const fitsWidth = box.width <= 375;
        const fitsHeight = box.height <= 667;
        const properlyPositioned = box.x >= 0 && box.y >= 0;
        
        console.log(`${fitsWidth ? '✅' : '❌'} Modal width fits viewport: ${fitsWidth}`);
        console.log(`${fitsHeight ? '✅' : '❌'} Modal height fits viewport: ${fitsHeight}`);
        console.log(`${properlyPositioned ? '✅' : '❌'} Modal properly positioned: ${properlyPositioned}`);
      }
    }
    
    console.log('✅ Mobile responsiveness tested');
  });

  test('should monitor console for errors and log activity', async ({ page }) => {
    console.log('\n🔍 Starting comprehensive console monitoring...');
    
    // Navigate through the Focus Mode workflow
    await page.click('#focus-mode-btn');
    await page.waitForSelector('#focus-mode-view:not(.hidden)');
    await page.waitForTimeout(1000);
    
    await page.click('#add-focus-tasks-btn');
    await page.waitForSelector('.fixed.inset-0.bg-black');
    await page.waitForTimeout(1000);
    
    // Try to interact with any available tasks
    const taskElements = page.locator('#task-selection-list .task-selection-card, #task-selection-list [data-task-id], #task-selection-list li');
    const taskCount = await taskElements.count();
    
    if (taskCount > 0) {
      await taskElements.first().click();
      await page.waitForTimeout(500);
    }
    
    // Close modal and exit focus mode
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
    // Final screenshot
    await page.screenshot({ 
      path: './test-results/final-state-after-testing.png',
      fullPage: true 
    });
    
    // Report findings
    console.log('\n📊 Console Activity Report:');
    console.log('='.repeat(60));
    
    if (consoleErrors.length > 0) {
      console.log('❌ JavaScript Errors Found:');
      consoleErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No JavaScript errors detected');
    }
    
    if (consoleLogs.length > 0) {
      console.log('\n📝 Recent Console Messages:');
      const relevantLogs = consoleLogs.filter(log => 
        !log.includes('DevTools') && 
        !log.includes('Extension') &&
        !log.includes('[HMR]')
      ).slice(-8); // Show last 8 relevant logs
      
      relevantLogs.forEach((log, index) => {
        console.log(`   ${index + 1}. ${log}`);
      });
      
      if (relevantLogs.length === 0) {
        console.log('   (No relevant application logs found)');
      }
    } else {
      console.log('📝 No console messages detected');
    }
    
    console.log('='.repeat(60));
    
    // Summary of findings
    console.log('\n📋 Test Summary:');
    console.log(`• JavaScript Errors: ${consoleErrors.length === 0 ? 'None' : consoleErrors.length + ' found'}`);
    console.log(`• Focus Mode: ${await page.locator('#focus-mode-btn').count() > 0 ? 'Available' : 'Missing'}`);
    console.log(`• Task Selection Modal: ${await page.locator('#add-focus-tasks-btn').count() > 0 ? 'Available' : 'Missing'}`);
    console.log(`• Tasks Available: ${taskCount} found`);
    console.log('• Screenshots: Generated for all test stages');
  });
});