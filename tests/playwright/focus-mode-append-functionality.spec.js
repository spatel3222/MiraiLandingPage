/**
 * Focus Mode Append Functionality Test
 * 
 * Tests the fix for the issue where clicking "Select Tasks" in Focus Mode
 * was starting selection from scratch instead of showing current tasks as pre-checked.
 * 
 * Fix implemented: Modified line 3072 in showTaskSelection() method from:
 * selectedTasks: new Set()
 * to:
 * selectedTasks: new Set(this.focusTasks.map(task => task.id))
 * 
 * This test verifies the user scenario:
 * "when I have already added task to the focus mode and I want to add more 
 * that is the time when I have to add everything again from scratch I am 
 * expecting to append to the current focus mode task over adding from scratch"
 */

import { test, expect } from '@playwright/test';

test.describe('Focus Mode Append Functionality', () => {
    let page;

    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
        
        // Handle authentication first
        await page.goto('/personal-task-tracker-sync.html');
        
        // Check if auth is required and handle it
        const authOverlay = await page.locator('#auth-overlay').isVisible().catch(() => false);
        if (authOverlay) {
            await page.fill('#password-input', 'Welcome@123');
            await page.click('button[type="submit"]');
            await page.waitForSelector('#app-content', { timeout: 10000 });
        }
        
        // Wait for the page to be fully loaded
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('#fab-main', { timeout: 10000 });
        
        // Clear any existing data to start fresh
        await page.evaluate(() => {
            localStorage.clear();
        });
        
        // Reload to ensure clean state
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Handle auth again after reload if needed
        const authOverlayAfterReload = await page.locator('#auth-overlay').isVisible().catch(() => false);
        if (authOverlayAfterReload) {
            await page.fill('#password-input', 'Welcome@123');
            await page.click('button[type="submit"]');
            await page.waitForSelector('#app-content', { timeout: 10000 });
        }
        
        await page.waitForSelector('#fab-main', { timeout: 10000 });
    });

    test('should preserve existing Focus Mode tasks when opening task selection', async () => {
        // Step 1: Add some tasks to the regular task list
        console.log('📝 Step 1: Adding tasks to regular task list');
        await page.screenshot({ path: 'test-results/focus-append-01-initial-state.png', fullPage: true });
        
        const tasksToAdd = [
            { title: 'First Task', category: 'day-job', priority: 'high', description: 'This is the first task' },
            { title: 'Second Task', category: 'home', priority: 'medium', description: 'This is the second task' },
            { title: 'Third Task', category: 'side-gig', priority: 'low', description: 'This is the third task' },
            { title: 'Fourth Task', category: 'day-job', priority: 'high', description: 'This is the fourth task' },
            { title: 'Fifth Task', category: 'home', priority: 'medium', description: 'This is the fifth task' }
        ];
        
        // Add each task
        for (const task of tasksToAdd) {
            // Click the main FAB to open action menu
            await page.click('#fab-main');
            
            // Wait for FAB actions to be visible
            await page.waitForSelector('#fab-add-btn', { timeout: 5000 });
            
            // Click the add task action button
            await page.click('#fab-add-btn');
            
            // Wait for the modal to open
            await page.waitForSelector('#task-form', { timeout: 5000 });
            
            // Fill in the task details
            await page.fill('#task-title', task.title);
            await page.selectOption('#task-category', task.category);
            await page.selectOption('#task-priority', task.priority);
            await page.fill('#task-description', task.description);
            
            // Submit the form using the save button
            await page.click('#save-task-btn');
            
            // Wait for modal to close and task to appear in the list
            await page.waitForSelector(`text="${task.title}"`, { timeout: 5000 });
            await page.waitForSelector('#task-form', { state: 'hidden', timeout: 5000 });
        }
        
        await page.screenshot({ path: 'test-results/focus-append-02-tasks-added.png', fullPage: true });
        
        // Verify tasks were added by checking the task counters
        const allTasksCounter = page.locator('button:has-text("All Tasks")');
        await expect(allTasksCounter).toContainText('5');
        
        // Also verify individual tasks are visible
        await expect(page.locator('text="First Task"')).toBeVisible();
        await expect(page.locator('text="Second Task"')).toBeVisible();
        
        // Step 2: Enter Focus Mode
        console.log('🎯 Step 2: Entering Focus Mode');
        await page.click('#focus-mode-btn');
        await page.waitForSelector('#focus-mode-view:not(.hidden)', { timeout: 5000 });
        
        await page.screenshot({ path: 'test-results/focus-append-03-focus-mode-empty.png', fullPage: true });
        
        // Verify Focus Mode is active
        const focusModeView = page.locator('#focus-mode-view');
        await expect(focusModeView).not.toHaveClass(/hidden/);
        
        // Step 3: Select initial tasks for Focus Mode
        console.log('✅ Step 3: Selecting initial tasks for Focus Mode');
        await page.click('#select-focus-tasks-btn');
        
        // Wait for the task selection modal to open
        await page.waitForSelector('text="Select Focus Tasks"', { timeout: 5000 });
        
        await page.screenshot({ path: 'test-results/focus-append-04-task-selection-modal-initial.png', fullPage: true });
        
        // Select first two tasks by clicking their checkboxes
        // Use more direct selectors for the checkboxes
        await page.locator('input[type="checkbox"]').first().check(); // Fifth Task
        await page.locator('input[type="checkbox"]').nth(1).check();  // Fourth Task
        
        await page.screenshot({ path: 'test-results/focus-append-05-initial-tasks-selected.png', fullPage: true });
        
        // Confirm selection - from screenshot I can see "Start Focus Mode" button
        await page.click('button:has-text("Start Focus Mode")');
        
        // Wait for modal to close and tasks to be added to focus mode
        await page.waitForSelector('text="Select Focus Tasks"', { state: 'hidden', timeout: 5000 });
        
        await page.screenshot({ path: 'test-results/focus-append-06-focus-mode-with-initial-tasks.png', fullPage: true });
        
        // Step 4: Verify initial tasks appear in Focus Mode
        console.log('🔍 Step 4: Verifying initial tasks appear in Focus Mode');
        
        // Verify Focus Mode is active by checking the header
        await expect(page.locator('text="🎯 Daily Focus"')).toBeVisible();
        
        // Verify the progress shows 2 tasks
        await expect(page.locator('text="0 of 2 completed"')).toBeVisible();
        
        // Verify the correct tasks are shown in Focus Mode
        await expect(page.locator('text="Fifth Task"')).toBeVisible();
        await expect(page.locator('text="Fourth Task"')).toBeVisible();
        
        // Step 5: Click "Select Tasks" again to test the append functionality
        console.log('🔄 Step 5: Opening task selection again to test append functionality');
        await page.click('#select-focus-tasks-btn');
        
        // Wait for modal to open
        await page.waitForSelector('text="Select Focus Tasks"', { timeout: 5000 });
        
        await page.screenshot({ path: 'test-results/focus-append-07-task-selection-modal-reopened.png', fullPage: true });
        
        // Step 6: Verify previously selected tasks are pre-checked (THIS IS THE KEY TEST)
        console.log('✨ Step 6: Verifying previously selected tasks are pre-checked');
        
        // Check if first checkbox is pre-checked (it should be - Fifth Task)
        const fifthTaskCheckbox = page.locator('input[type="checkbox"]').first();
        const fifthTaskChecked = await fifthTaskCheckbox.isChecked();
        console.log(`First checkbox (Fifth Task) is ${fifthTaskChecked ? 'checked' : 'unchecked'}`);
        
        // Check if second checkbox is pre-checked (it should be - Fourth Task)
        const fourthTaskCheckbox = page.locator('input[type="checkbox"]').nth(1);
        const fourthTaskChecked = await fourthTaskCheckbox.isChecked();
        console.log(`Second checkbox (Fourth Task) is ${fourthTaskChecked ? 'checked' : 'unchecked'}`);
        
        // Check if third checkbox is NOT pre-checked (it should not be - Third Task)
        const thirdTaskCheckbox = page.locator('input[type="checkbox"]').nth(2);
        const thirdTaskChecked = await thirdTaskCheckbox.isChecked();
        console.log(`Third checkbox (Third Task) is ${thirdTaskChecked ? 'checked' : 'unchecked'}`);
        
        // Critical assertions - the fix should make these pass
        expect(fifthTaskChecked).toBe(true);   // Should be pre-checked from previous selection
        expect(fourthTaskChecked).toBe(true);  // Should be pre-checked from previous selection  
        expect(thirdTaskChecked).toBe(false);  // Should not be checked (was not selected initially)
        
        // Step 7: Test adding a new task while maintaining existing selections
        console.log('➕ Step 7: Adding new task while maintaining existing selections');
        
        // Select the third task (in addition to the already selected ones)
        await thirdTaskCheckbox.check();
        
        await page.screenshot({ path: 'test-results/focus-append-08-additional-task-selected.png', fullPage: true });
        
        // Confirm the new selection
        await page.click('button:has-text("Start Focus Mode")');
        
        // Wait for modal to close
        await page.waitForSelector('text="Select Focus Tasks"', { state: 'hidden', timeout: 5000 });
        
        await page.screenshot({ path: 'test-results/focus-append-09-focus-mode-with-three-tasks.png', fullPage: true });
        
        // Step 8: Verify all three tasks are now in Focus Mode
        console.log('🎯 Step 8: Verifying all three tasks are in Focus Mode');
        
        // Verify the progress shows 3 tasks
        await expect(page.locator('text="0 of 3 completed"')).toBeVisible();
        
        // Verify all three tasks are present in Focus Mode
        await expect(page.locator('text="Fifth Task"')).toBeVisible();
        await expect(page.locator('text="Fourth Task"')).toBeVisible();
        await expect(page.locator('text="Third Task"')).toBeVisible();
        
        // Step 9: Test removing a task while maintaining others
        console.log('➖ Step 9: Testing removal of tasks while maintaining others');
        
        await page.click('#select-focus-tasks-btn');
        await page.waitForSelector('text="Select Focus Tasks"', { timeout: 5000 });
        
        await page.screenshot({ path: 'test-results/focus-append-10-task-selection-with-three-checked.png', fullPage: true });
        
        // Uncheck the Fourth Task (removing it from selection)
        await fourthTaskCheckbox.uncheck();
        
        await page.screenshot({ path: 'test-results/focus-append-11-second-task-unchecked.png', fullPage: true });
        
        // Confirm the updated selection
        await page.click('button:has-text("Start Focus Mode")');
        await page.waitForSelector('text="Select Focus Tasks"', { state: 'hidden', timeout: 5000 });
        
        await page.screenshot({ path: 'test-results/focus-append-12-final-focus-mode-state.png', fullPage: true });
        
        // Step 10: Final verification - should now have only Fifth Task and Third Task
        console.log('🏁 Step 10: Final verification of Focus Mode state');
        
        // Verify the progress shows 2 tasks again
        await expect(page.locator('text="0 of 2 completed"')).toBeVisible();
        
        // Verify correct tasks remain in Focus Mode
        await expect(page.locator('text="Fifth Task"')).toBeVisible();
        await expect(page.locator('text="Third Task"')).toBeVisible();
        
        // Verify Fourth Task is no longer in Focus Mode
        await expect(page.locator('text="Fourth Task"')).not.toBeVisible();
        
        console.log('✅ All tests passed! Focus Mode append functionality is working correctly.');
    });

    test('should handle edge case of no existing focus tasks', async () => {
        // Test the edge case where there are no existing focus tasks
        console.log('🔍 Testing edge case: No existing focus tasks');
        
        // Add one task
        await page.click('#fab-main');
        await page.waitForSelector('#fab-add-btn', { timeout: 5000 });
        await page.click('#fab-add-btn');
        await page.waitForSelector('#task-form', { timeout: 5000 });
        
        await page.fill('#task-title', 'Only Task');
        await page.selectOption('#task-category', 'day-job');
        await page.selectOption('#task-priority', 'high');
        await page.fill('#task-description', 'This is the only task');
        await page.click('#save-task-btn');
        
        await page.waitForSelector('text="Only Task"', { timeout: 5000 });
        
        // Enter Focus Mode (should be empty)
        await page.click('#focus-mode-btn');
        await page.waitForSelector('#focus-mode-view:not(.hidden)', { timeout: 5000 });
        
        // Open task selection
        await page.click('#select-focus-tasks-btn');
        await page.waitForSelector('.modal:not(.hidden)', { timeout: 5000 });
        
        // No tasks should be pre-checked
        const checkbox = page.locator('.task-checkbox').first();
        const isChecked = await checkbox.isChecked();
        expect(isChecked).toBe(false);
        
        await page.screenshot({ path: 'test-results/focus-append-edge-case-no-existing-tasks.png', fullPage: true });
        
        console.log('✅ Edge case test passed!');
    });

    test('should handle maximum focus task limit', async () => {
        // Test that the system handles the maximum limit of focus tasks correctly
        console.log('🔢 Testing maximum focus task limit');
        
        // Add 7 tasks (more than the limit of 5)
        const tasks = [];
        for (let i = 1; i <= 7; i++) {
            const task = {
                title: `Limit Test Task ${i}`,
                category: 'day-job',
                priority: 'high',
                description: `Task ${i} for limit testing`
            };
            tasks.push(task);
            
            await page.click('#fab-main');
            await page.waitForSelector('#fab-add-btn', { timeout: 5000 });
            await page.click('#fab-add-btn');
            await page.waitForSelector('#task-form', { timeout: 5000 });
            
            await page.fill('#task-title', task.title);
            await page.selectOption('#task-category', task.category);
            await page.selectOption('#task-priority', task.priority);
            await page.fill('#task-description', task.description);
            await page.click('#save-task-btn');
            
            await page.waitForSelector(`text="${task.title}"`, { timeout: 5000 });
            await page.waitForSelector('#task-form', { state: 'hidden', timeout: 5000 });
        }
        
        // Enter Focus Mode
        await page.click('#focus-mode-btn');
        await page.waitForSelector('#focus-mode-view:not(.hidden)', { timeout: 5000 });
        
        // Try to select all 7 tasks
        await page.click('#select-focus-tasks-btn');
        await page.waitForSelector('.modal:not(.hidden)', { timeout: 5000 });
        
        // Check all available checkboxes
        const allCheckboxes = page.locator('.task-checkbox');
        const checkboxCount = await allCheckboxes.count();
        
        for (let i = 0; i < checkboxCount; i++) {
            await allCheckboxes.nth(i).check();
        }
        
        await page.click('button:has-text("Add Selected Tasks")');
        await page.waitForSelector('.modal.hidden', { timeout: 5000 });
        
        // Should only have maximum 5 tasks in focus mode
        const focusTaskItems = page.locator('#focus-tasks-container .focus-task-item');
        const focusTaskCount = await focusTaskItems.count();
        expect(focusTaskCount).toBeLessThanOrEqual(5);
        
        await page.screenshot({ path: 'test-results/focus-append-max-limit-test.png', fullPage: true });
        
        console.log(`✅ Maximum limit test passed! Focus Mode has ${focusTaskCount} tasks (max 5)`);
    });
});