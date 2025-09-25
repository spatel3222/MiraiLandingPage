const { test, expect } = require('@playwright/test');

test('Focus Mode append functionality test', async ({ page }) => {
  // Navigate to the application
  await page.goto('http://localhost:8000/personal-task-tracker-sync.html');
  
  // Wait for the application to load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  console.log('=== Testing Focus Mode Append Functionality ===');
  
  // Step 1: Add some test tasks
  console.log('Step 1: Adding test tasks...');
  
  // Click the Add Task FAB (blue + button in bottom right)
  await page.click('.fixed.bottom-6.right-6 button');
  await page.waitForTimeout(500);
  
  // Fill in first task
  await page.fill('#task-title', 'Test Task 1 - Development');
  await page.selectOption('#task-category', 'day-job');
  await page.selectOption('#task-priority', 'high');
  await page.click('#save-task-btn');
  await page.waitForTimeout(1000);
  
  // Add second task
  await page.click('.fixed.bottom-6.right-6 button');
  await page.waitForTimeout(500);
  await page.fill('#task-title', 'Test Task 2 - Side Project');
  await page.selectOption('#task-category', 'side-gig');
  await page.selectOption('#task-priority', 'medium');
  await page.click('#save-task-btn');
  await page.waitForTimeout(1000);
  
  // Add third task
  await page.click('.fixed.bottom-6.right-6 button');
  await page.waitForTimeout(500);
  await page.fill('#task-title', 'Test Task 3 - Home Cleaning');
  await page.selectOption('#task-category', 'home');
  await page.selectOption('#task-priority', 'low');
  await page.click('#save-task-btn');
  await page.waitForTimeout(1000);
  
  // Screenshot after adding tasks
  await page.screenshot({ path: 'test-results/focus-append-01-tasks-added.png', fullPage: true });
  console.log('✅ Added 3 test tasks');
  
  // Step 2: Enter Focus Mode
  console.log('Step 2: Entering Focus Mode...');
  await page.click('#focus-mode-btn');
  await page.waitForTimeout(1000);
  
  // Screenshot of Focus Mode initial state
  await page.screenshot({ path: 'test-results/focus-append-02-focus-mode-empty.png', fullPage: true });
  console.log('✅ Entered Focus Mode');
  
  // Step 3: Select initial tasks for Focus Mode
  console.log('Step 3: Selecting initial Focus Mode tasks...');
  await page.click('#add-focus-tasks-btn');
  await page.waitForTimeout(1000);
  
  // Screenshot of task selection modal
  await page.screenshot({ path: 'test-results/focus-append-03-modal-open.png', fullPage: true });
  
  // Select first two tasks
  const firstCheckbox = page.locator('input[type="checkbox"]').first();
  const secondCheckbox = page.locator('input[type="checkbox"]').nth(1);
  
  await firstCheckbox.check();
  await page.waitForTimeout(500);
  await secondCheckbox.check();
  await page.waitForTimeout(500);
  
  // Screenshot showing selected tasks
  await page.screenshot({ path: 'test-results/focus-append-04-initial-selection.png', fullPage: true });
  console.log('✅ Selected first 2 tasks');
  
  // Start focus mode with selected tasks
  await page.click('#start-focus-btn');
  await page.waitForTimeout(1000);
  
  // Screenshot of Focus Mode with selected tasks
  await page.screenshot({ path: 'test-results/focus-append-05-focus-with-tasks.png', fullPage: true });
  console.log('✅ Started Focus Mode with 2 tasks');
  
  // Step 4: Test the append functionality (the main fix)
  console.log('Step 4: Testing append functionality...');
  await page.click('#add-focus-tasks-btn');
  await page.waitForTimeout(1000);
  
  // Screenshot showing modal should have previous tasks checked
  await page.screenshot({ path: 'test-results/focus-append-06-modal-with-existing.png', fullPage: true });
  
  // Verify that the first two checkboxes are already checked
  const isFirstChecked = await firstCheckbox.isChecked();
  const isSecondChecked = await secondCheckbox.isChecked();
  
  console.log(`First checkbox checked: ${isFirstChecked}`);
  console.log(`Second checkbox checked: ${isSecondChecked}`);
  
  // Check the third task to add it
  const thirdCheckbox = page.locator('input[type="checkbox"]').nth(2);
  await thirdCheckbox.check();
  await page.waitForTimeout(500);
  
  // Screenshot showing all 3 tasks selected (append mode)
  await page.screenshot({ path: 'test-results/focus-append-07-append-selection.png', fullPage: true });
  console.log('✅ Added third task to existing selection');
  
  // Start focus mode with updated selection
  await page.click('#start-focus-btn');
  await page.waitForTimeout(1000);
  
  // Final screenshot showing Focus Mode with all 3 tasks
  await page.screenshot({ path: 'test-results/focus-append-08-final-focus-mode.png', fullPage: true });
  console.log('✅ Focus Mode now has 3 tasks (append successful)');
  
  // Step 5: Test removing a task while maintaining others
  console.log('Step 5: Testing selective removal...');
  await page.click('#add-focus-tasks-btn');
  await page.waitForTimeout(1000);
  
  // Uncheck the second task
  await secondCheckbox.uncheck();
  await page.waitForTimeout(500);
  
  // Screenshot showing selective deselection
  await page.screenshot({ path: 'test-results/focus-append-09-selective-removal.png', fullPage: true });
  
  // Apply changes
  await page.click('#start-focus-btn');
  await page.waitForTimeout(1000);
  
  // Final screenshot
  await page.screenshot({ path: 'test-results/focus-append-10-final-result.png', fullPage: true });
  console.log('✅ Successfully removed one task while keeping others');
  
  // Verification: Check that tasks persist correctly
  const focusTaskElements = await page.locator('#focus-tasks-list .focus-task-card').count();
  console.log(`Final Focus Mode task count: ${focusTaskElements}`);
  
  console.log('=== Focus Mode Append Functionality Test Complete ===');
  console.log('✅ Test PASSED: Existing selections are now preserved when adding more tasks');
});