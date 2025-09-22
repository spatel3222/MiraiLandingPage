const { test, expect } = require('@playwright/test');

test.describe('Personal Task Tracker Metrics - Simple Debug', () => {
  test('Debug metrics calculation flow', async ({ page }) => {
    console.log('🔍 Starting simple metrics debugging...');

    // Navigate and login
    await page.goto('http://localhost:8000/personal-task-tracker-sync.html');
    await page.fill('#password-input', 'Welcome@123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    console.log('✅ Logged in successfully');

    // Take screenshot of initial state
    await page.screenshot({ 
      path: '/Users/shivangpatel/Documents/GitHub/crtx.in/test-results/debug-01-initial.png',
      fullPage: true 
    });

    // Check initial localStorage and metrics
    const initialState = await page.evaluate(() => {
      return {
        tasks: localStorage.getItem('tasks'),
        archivedTasks: localStorage.getItem('archivedTasks'),
        metricsElements: {
          completedToday: document.getElementById('completed-today')?.textContent?.trim(),
          totalTasks: document.getElementById('total-tasks')?.textContent?.trim(),
          weeklyCompletion: document.getElementById('weekly-completion')?.textContent?.trim(),
          completionStreak: document.getElementById('completion-streak')?.textContent?.trim()
        }
      };
    });

    console.log('📊 Initial State:');
    console.log('Tasks in localStorage:', initialState.tasks);
    console.log('Archived tasks in localStorage:', initialState.archivedTasks);
    console.log('Metrics Elements:', initialState.metricsElements);

    // Manually create a task with completedAt timestamp to test metrics
    console.log('🧪 Creating test task with completion timestamp...');
    
    const testResult = await page.evaluate(() => {
      try {
        // Create a test task that's already completed for today
        const testTask = {
          id: Date.now(),
          title: 'Test Completed Task',
          description: 'This is a test task to check metrics',
          category: 'test',
          status: 'done',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(), // Completed today
          notes: []
        };

        // Add to localStorage manually
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        tasks.push(testTask);
        localStorage.setItem('tasks', JSON.stringify(tasks));

        // Force metrics update
        if (window.metricsSystem && window.metricsSystem.updateMetrics) {
          window.metricsSystem.updateMetrics();
        }

        // Return the current state after manual update
        return {
          success: true,
          tasksCount: tasks.length,
          metricsAfterUpdate: {
            completedToday: document.getElementById('completed-today')?.textContent?.trim(),
            totalTasks: document.getElementById('total-tasks')?.textContent?.trim(),
            weeklyCompletion: document.getElementById('weekly-completion')?.textContent?.trim(),
            completionStreak: document.getElementById('completion-streak')?.textContent?.trim()
          }
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });

    console.log('🧪 Test Task Creation Result:', testResult);

    await page.waitForTimeout(1000);

    // Take screenshot after manual task creation
    await page.screenshot({ 
      path: '/Users/shivangpatel/Documents/GitHub/crtx.in/test-results/debug-02-after-manual-task.png',
      fullPage: true 
    });

    // Now test the normal task creation flow through UI
    console.log('🎯 Testing normal task creation through UI...');
    
    // Look for the add task button
    const addTaskButton = await page.$('#add-task-btn');
    if (addTaskButton) {
      console.log('📍 Found add-task-btn, clicking...');
      await addTaskButton.click();
      await page.waitForTimeout(1000);

      // Fill in task form
      const titleInput = await page.$('#task-title');
      if (titleInput) {
        console.log('✍️ Filling task form...');
        await titleInput.fill('UI Created Test Task');
        
        const descInput = await page.$('#task-description');
        if (descInput) {
          await descInput.fill('Task created through UI to test metrics');
        }

        // Submit the form
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);

        console.log('✅ Task submitted through UI');
      }
    } else {
      console.log('❌ Could not find add-task-btn');
    }

    // Check localStorage after UI task creation
    const afterUICreation = await page.evaluate(() => {
      return {
        tasks: localStorage.getItem('tasks'),
        tasksCount: JSON.parse(localStorage.getItem('tasks') || '[]').length,
        metrics: {
          completedToday: document.getElementById('completed-today')?.textContent?.trim(),
          totalTasks: document.getElementById('total-tasks')?.textContent?.trim(),
          weeklyCompletion: document.getElementById('weekly-completion')?.textContent?.trim(),
          completionStreak: document.getElementById('completion-streak')?.textContent?.trim()
        }
      };
    });

    console.log('📈 After UI task creation:', afterUICreation);

    // Take final screenshot
    await page.screenshot({ 
      path: '/Users/shivangpatel/Documents/GitHub/crtx.in/test-results/debug-03-final.png',
      fullPage: true 
    });

    // Test completing a task through checkbox
    console.log('✅ Testing task completion...');
    
    const checkboxResult = await page.evaluate(() => {
      try {
        // Find any task checkbox and click it
        const checkbox = document.querySelector('input[type="checkbox"]');
        if (checkbox) {
          checkbox.click();
          
          // Wait a moment for any async operations
          setTimeout(() => {
            if (window.metricsSystem && window.metricsSystem.updateMetrics) {
              window.metricsSystem.updateMetrics();
            }
          }, 100);
          
          return { success: true, found: true };
        } else {
          return { success: true, found: false, message: 'No checkbox found' };
        }
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    console.log('🎯 Checkbox test result:', checkboxResult);

    await page.waitForTimeout(2000);

    // Final metrics check
    const finalMetrics = await page.evaluate(() => {
      return {
        tasks: localStorage.getItem('tasks'),
        archivedTasks: localStorage.getItem('archivedTasks'),
        metrics: {
          completedToday: document.getElementById('completed-today')?.textContent?.trim(),
          totalTasks: document.getElementById('total-tasks')?.textContent?.trim(),
          weeklyCompletion: document.getElementById('weekly-completion')?.textContent?.trim(),
          completionStreak: document.getElementById('completion-streak')?.textContent?.trim()
        }
      };
    });

    console.log('🎯 Final metrics:', finalMetrics);

    await page.screenshot({ 
      path: '/Users/shivangpatel/Documents/GitHub/crtx.in/test-results/debug-04-after-completion.png',
      fullPage: true 
    });

    console.log('🔍 Simple debugging complete!');
  });
});