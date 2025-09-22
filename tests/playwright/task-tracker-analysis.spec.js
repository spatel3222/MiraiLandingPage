import { test, expect } from '@playwright/test';

test.describe('Personal Task Tracker Analysis', () => {
  test('analyze current task state and capture metrics', async ({ page }) => {
    console.log('🔍 Starting Personal Task Tracker Analysis...');
    
    // Navigate to the task tracker
    await page.goto('/personal-task-tracker-sync.html');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for any dynamic content to load
    await page.waitForTimeout(2000);
    
    console.log('📊 Extracting localStorage data...');
    
    // Extract localStorage data
    const localStorageData = await page.evaluate(() => {
      const tasks = localStorage.getItem('tasks');
      const archivedTasks = localStorage.getItem('archivedTasks');
      
      return {
        tasks: tasks ? JSON.parse(tasks) : [],
        archivedTasks: archivedTasks ? JSON.parse(archivedTasks) : [],
        tasksRaw: tasks,
        archivedTasksRaw: archivedTasks
      };
    });
    
    console.log('📝 Raw localStorage data:');
    console.log('Tasks raw:', localStorageData.tasksRaw);
    console.log('Archived tasks raw:', localStorageData.archivedTasksRaw);
    
    // Parse and analyze tasks
    const tasks = localStorageData.tasks;
    const archivedTasks = localStorageData.archivedTasks;
    
    console.log('📈 Task Analysis:');
    console.log('Active tasks:', tasks);
    console.log('Archived tasks:', archivedTasks);
    
    // Count tasks by status
    const taskCounts = {
      todo: 0,
      'in-progress': 0,
      done: 0,
      archived: archivedTasks.length,
      total: tasks.length + archivedTasks.length
    };
    
    tasks.forEach(task => {
      if (task.status === 'todo') taskCounts.todo++;
      else if (task.status === 'in-progress') taskCounts['in-progress']++;
      else if (task.status === 'done') taskCounts.done++;
    });
    
    console.log('📊 Task Count Breakdown:');
    console.log(`Total Tasks: ${taskCounts.total}`);
    console.log(`To-Do: ${taskCounts.todo}`);
    console.log(`In Progress: ${taskCounts['in-progress']}`);
    console.log(`Done: ${taskCounts.done}`);
    console.log(`Archived: ${taskCounts.archived}`);
    console.log(`Active Tasks: ${tasks.length}`);
    
    // Capture metrics from the dashboard
    console.log('📋 Capturing metrics dashboard data...');
    
    const metricsData = await page.evaluate(() => {
      const metrics = {};
      
      // Try to find metric elements
      const totalTasksEl = document.querySelector('[data-metric="total-tasks"], .metric-total-tasks, #totalTasks');
      const activeTasksEl = document.querySelector('[data-metric="active-tasks"], .metric-active-tasks, #activeTasks');
      const completedTasksEl = document.querySelector('[data-metric="completed-tasks"], .metric-completed-tasks, #completedTasks');
      const todoTasksEl = document.querySelector('[data-metric="todo-tasks"], .metric-todo-tasks, #todoTasks');
      const inProgressTasksEl = document.querySelector('[data-metric="in-progress-tasks"], .metric-in-progress-tasks, #inProgressTasks');
      
      // Also check for text content that might contain numbers
      const allElements = document.querySelectorAll('*');
      const textContents = Array.from(allElements).map(el => el.textContent).filter(text => text && text.trim());
      
      return {
        totalTasks: totalTasksEl ? totalTasksEl.textContent : 'not found',
        activeTasks: activeTasksEl ? activeTasksEl.textContent : 'not found',
        completedTasks: completedTasksEl ? completedTasksEl.textContent : 'not found',
        todoTasks: todoTasksEl ? todoTasksEl.textContent : 'not found',
        inProgressTasks: inProgressTasksEl ? inProgressTasksEl.textContent : 'not found',
        allTextContents: textContents.slice(0, 50) // Limit to first 50 for readability
      };
    });
    
    console.log('🎯 Metrics Dashboard Data:');
    console.log('Total Tasks Display:', metricsData.totalTasks);
    console.log('Active Tasks Display:', metricsData.activeTasks);
    console.log('Completed Tasks Display:', metricsData.completedTasks);
    console.log('Todo Tasks Display:', metricsData.todoTasks);
    console.log('In Progress Tasks Display:', metricsData.inProgressTasks);
    
    // Look for any numbers in the page content
    const numbersInContent = metricsData.allTextContents
      .filter(text => /\d+/.test(text))
      .slice(0, 20);
    
    console.log('🔢 Text content with numbers found on page:');
    numbersInContent.forEach((text, index) => {
      console.log(`${index + 1}. "${text}"`);
    });
    
    // Capture page elements that might show task counts
    const pageElements = await page.evaluate(() => {
      const elements = {};
      
      // Look for common class names and IDs that might contain metrics
      const selectors = [
        '.metric', '.count', '.total', '.badge', '.number',
        '[class*="metric"]', '[class*="count"]', '[class*="total"]',
        '[id*="metric"]', '[id*="count"]', '[id*="total"]'
      ];
      
      selectors.forEach(selector => {
        try {
          const els = document.querySelectorAll(selector);
          if (els.length > 0) {
            elements[selector] = Array.from(els).map(el => ({
              text: el.textContent,
              className: el.className,
              id: el.id
            }));
          }
        } catch (e) {
          // Ignore selector errors
        }
      });
      
      return elements;
    });
    
    console.log('🎨 Page elements that might contain metrics:');
    Object.entries(pageElements).forEach(([selector, elements]) => {
      console.log(`${selector}:`, elements);
    });
    
    // Take screenshot
    console.log('📸 Taking screenshot...');
    await page.screenshot({ 
      path: '/Users/shivangpatel/Documents/GitHub/crtx.in/task-tracker-current-state.png',
      fullPage: true 
    });
    
    // Summary report
    console.log('📋 FINAL SUMMARY REPORT:');
    console.log('========================');
    console.log(`📊 TASK COUNTS FROM LOCALSTORAGE:`);
    console.log(`   Total Tasks: ${taskCounts.total}`);
    console.log(`   Active Tasks: ${tasks.length}`);
    console.log(`   - To-Do: ${taskCounts.todo}`);
    console.log(`   - In Progress: ${taskCounts['in-progress']}`);
    console.log(`   - Done: ${taskCounts.done}`);
    console.log(`   Archived Tasks: ${taskCounts.archived}`);
    console.log('');
    console.log(`🎯 DASHBOARD DISPLAY:`);
    console.log(`   Total Tasks: ${metricsData.totalTasks}`);
    console.log(`   Active Tasks: ${metricsData.activeTasks}`);
    console.log(`   Completed Tasks: ${metricsData.completedTasks}`);
    console.log('');
    console.log(`📸 Screenshot saved to: task-tracker-current-state.png`);
    
    // Assertions to verify the test ran correctly
    expect(localStorageData).toBeDefined();
    expect(taskCounts.total).toBeGreaterThanOrEqual(0);
  });
});