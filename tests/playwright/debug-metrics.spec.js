const { test, expect } = require('@playwright/test');

test.describe('Personal Task Tracker Metrics Debugging', () => {
  test('Debug metrics system data flow', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => {
      console.log(`CONSOLE [${msg.type()}]: ${msg.text()}`);
    });

    // Capture network requests
    page.on('request', request => {
      console.log(`REQUEST: ${request.method()} ${request.url()}`);
    });

    // Capture JavaScript errors
    page.on('pageerror', error => {
      console.log(`PAGE ERROR: ${error.message}`);
    });

    console.log('🔍 Starting metrics debugging session...');

    // Navigate to the task tracker
    console.log('📍 Navigating to personal task tracker...');
    await page.goto('http://localhost:8000/personal-task-tracker-sync.html');
    await page.waitForLoadState('networkidle');

    // Take initial screenshot
    await page.screenshot({ 
      path: '/Users/shivangpatel/Documents/GitHub/crtx.in/test-results/01-initial-page.png',
      fullPage: true 
    });

    // Login with test credentials (password only authentication)
    console.log('🔑 Logging in with test credentials...');
    await page.fill('#password-input', 'Welcome@123');
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await page.waitForTimeout(2000);

    // Check if we're logged in by looking for the metrics dashboard
    const metricsSection = await page.$('[data-testid="metrics"], .progress, h2:has-text("Today\'s Progress")');
    const todaysProgress = await page.$('text=Today\'s Progress');
    
    if (!todaysProgress) {
      console.log('❌ Login may have failed - no Today\'s Progress found');
      await page.screenshot({ 
        path: '/Users/shivangpatel/Documents/GitHub/crtx.in/test-results/02-login-failed.png',
        fullPage: true 
      });
      return;
    }

    console.log('✅ Login successful - Found Today\'s Progress section');

    // Inspect localStorage before any actions
    console.log('📊 Inspecting localStorage...');
    const beforeTasks = await page.evaluate(() => {
      return {
        tasks: localStorage.getItem('tasks'),
        archivedTasks: localStorage.getItem('archivedTasks'),
        allKeys: Object.keys(localStorage)
      };
    });

    console.log('BEFORE - localStorage contents:');
    console.log('Tasks:', beforeTasks.tasks);
    console.log('Archived Tasks:', beforeTasks.archivedTasks);
    console.log('All localStorage keys:', beforeTasks.allKeys);

    // Capture metrics before task completion
    const beforeMetrics = await page.evaluate(() => {
      const metricsElements = document.querySelectorAll('[class*="COMPLETED"], [class*="TOTAL"], [class*="WEEK"], [class*="STREAK"]');
      const metrics = {};
      
      // Look for specific metric values
      Array.from(metricsElements).forEach(el => {
        const text = el.textContent.trim();
        const parentText = el.parentElement?.textContent?.trim();
        
        if (text.includes('COMPLETED TODAY') || parentText?.includes('COMPLETED TODAY')) {
          metrics.completedToday = el.textContent.match(/\d+/)?.[0] || '0';
        }
        if (text.includes('TOTAL TASKS') || parentText?.includes('TOTAL TASKS')) {
          metrics.totalTasks = el.textContent.match(/\d+/)?.[0] || '0';
        }
        if (text.includes('THIS WEEK') || parentText?.includes('THIS WEEK')) {
          metrics.thisWeek = el.textContent.match(/\d+/)?.[0] || '0';
        }
        if (text.includes('DAY STREAK') || parentText?.includes('DAY STREAK')) {
          metrics.dayStreak = el.textContent.match(/\d+/)?.[0] || '0';
        }
      });
      
      // Also try to extract metrics by looking for large numbers
      const numbers = document.querySelectorAll('div, span');
      Array.from(numbers).forEach(el => {
        const text = el.textContent.trim();
        if (/^\d+$/.test(text) && el.className && el.className.includes('text-')) {
          const nextSibling = el.nextElementSibling?.textContent?.trim();
          const parentText = el.parentElement?.textContent?.trim();
          
          if (nextSibling?.includes('COMPLETED') || parentText?.includes('COMPLETED')) {
            metrics.completedToday = text;
          }
          if (nextSibling?.includes('TOTAL') || parentText?.includes('TOTAL')) {
            metrics.totalTasks = text;
          }
          if (nextSibling?.includes('WEEK') || parentText?.includes('WEEK')) {
            metrics.thisWeek = text;
          }
          if (nextSibling?.includes('STREAK') || parentText?.includes('STREAK')) {
            metrics.dayStreak = text;
          }
        }
      });
      
      return metrics;
    });
    
    console.log('📊 BEFORE METRICS:', beforeMetrics);

    // Take screenshot of current metrics
    await page.screenshot({ 
      path: '/Users/shivangpatel/Documents/GitHub/crtx.in/test-results/03-before-task-completion.png',
      fullPage: true 
    });

    // Look for metrics display elements
    const metricsElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('[class*="metric"], [class*="stat"], [id*="metric"], [id*="stat"], .dashboard-card, .metric-card');
      return Array.from(elements).map(el => ({
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        textContent: el.textContent.trim(),
        innerHTML: el.innerHTML
      }));
    });

    console.log('📈 Found metrics elements:', metricsElements);

    // Look for tasks on the page
    const tasks = await page.evaluate(() => {
      const taskElements = document.querySelectorAll('[class*="task"], .todo-item, li');
      return Array.from(taskElements).map((el, index) => ({
        index,
        textContent: el.textContent.trim(),
        className: el.className,
        hasCheckbox: !!el.querySelector('input[type="checkbox"]'),
        isCompleted: el.classList.contains('completed') || el.querySelector('input[type="checkbox"]')?.checked
      }));
    });

    console.log('📝 Found tasks on page:', tasks);

    // Create a new task first to ensure we have something to complete
    console.log('➕ Creating a new task to test completion...');
    
    // Look for the floating "+" button or add task interface
    const addButton = await page.$('button:has-text("+"), .add-task, [data-testid="add-task"]');
    if (addButton) {
      console.log('🎯 Found add button, clicking it...');
      await addButton.click();
      await page.waitForTimeout(500);
    }
    
    // Look for task input field that might appear after clicking the button
    const taskInputSelectors = [
      'input[placeholder*="task"]',
      'input[placeholder*="todo"]', 
      'input[placeholder*="Add"]',
      '#new-task',
      '.task-input',
      'input[type="text"]:visible'
    ];
    
    let taskInput = null;
    for (const selector of taskInputSelectors) {
      taskInput = await page.$(selector);
      if (taskInput) {
        console.log(`📝 Found task input with selector: ${selector}`);
        break;
      }
    }
    
    if (taskInput) {
      await taskInput.fill('Debug Test Task - Metrics Check');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      console.log('✅ Created new task: "Debug Test Task - Metrics Check"');
    } else {
      console.log('❌ Could not find task input field');
      // Try typing directly - maybe there's a hidden or auto-focused input
      await page.keyboard.type('Debug Test Task - Direct Type');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
    }

    // Try to complete a task by finding and clicking a checkbox
    console.log('✅ Attempting to complete a task...');
    
    // Multiple strategies to find and complete a task
    const completionStrategies = [
      'input[type="checkbox"]:not(:checked)',
      '.task input[type="checkbox"]:not(:checked)',
      '.todo-item input[type="checkbox"]:not(:checked)',
      'li input[type="checkbox"]:not(:checked)'
    ];

    let taskCompleted = false;
    for (const selector of completionStrategies) {
      const checkbox = await page.$(selector);
      if (checkbox) {
        console.log(`🎯 Found checkbox with selector: ${selector}`);
        
        // Get the task text before completing
        const taskText = await page.evaluate((el) => {
          const taskContainer = el.closest('li, .task, .todo-item');
          return taskContainer ? taskContainer.textContent.trim() : 'Unknown task';
        }, checkbox);
        
        console.log(`📋 Completing task: ${taskText}`);
        
        await checkbox.click();
        await page.waitForTimeout(1000); // Wait for any animations/updates
        taskCompleted = true;
        break;
      }
    }

    if (!taskCompleted) {
      console.log('❌ Could not find any tasks to complete');
      await page.screenshot({ 
        path: '/Users/shivangpatel/Documents/GitHub/crtx.in/test-results/04-no-tasks-found.png',
        fullPage: true 
      });
    } else {
      console.log('✅ Task completion attempted');
    }

    // Wait a moment for any async updates
    await page.waitForTimeout(2000);

    // Inspect localStorage after task completion
    const afterTasks = await page.evaluate(() => {
      return {
        tasks: localStorage.getItem('tasks'),
        archivedTasks: localStorage.getItem('archivedTasks'),
        allKeys: Object.keys(localStorage)
      };
    });

    console.log('AFTER - localStorage contents:');
    console.log('Tasks:', afterTasks.tasks);
    console.log('Archived Tasks:', afterTasks.archivedTasks);
    console.log('All localStorage keys:', afterTasks.allKeys);

    // Parse and analyze the data
    try {
      const beforeTasksData = beforeTasks.tasks ? JSON.parse(beforeTasks.tasks) : [];
      const afterTasksData = afterTasks.tasks ? JSON.parse(afterTasks.tasks) : [];
      const beforeArchivedData = beforeTasks.archivedTasks ? JSON.parse(beforeTasks.archivedTasks) : [];
      const afterArchivedData = afterTasks.archivedTasks ? JSON.parse(afterTasks.archivedTasks) : [];

      console.log('📊 Data Analysis:');
      console.log(`Before: ${beforeTasksData.length} tasks, ${beforeArchivedData.length} archived`);
      console.log(`After: ${afterTasksData.length} tasks, ${afterArchivedData.length} archived`);

      // Check for completedAt timestamps
      const completedTasks = [...afterTasksData, ...afterArchivedData].filter(task => task.completed || task.completedAt);
      console.log('✅ Tasks with completion data:', completedTasks.map(task => ({
        text: task.text || task.title,
        completed: task.completed,
        completedAt: task.completedAt,
        timestamp: task.timestamp
      })));

    } catch (error) {
      console.log('❌ Error parsing localStorage data:', error.message);
    }

    // Capture metrics after task completion
    const afterMetrics = await page.evaluate(() => {
      const metricsElements = document.querySelectorAll('[class*="COMPLETED"], [class*="TOTAL"], [class*="WEEK"], [class*="STREAK"]');
      const metrics = {};
      
      // Look for specific metric values
      Array.from(metricsElements).forEach(el => {
        const text = el.textContent.trim();
        const parentText = el.parentElement?.textContent?.trim();
        
        if (text.includes('COMPLETED TODAY') || parentText?.includes('COMPLETED TODAY')) {
          metrics.completedToday = el.textContent.match(/\d+/)?.[0] || '0';
        }
        if (text.includes('TOTAL TASKS') || parentText?.includes('TOTAL TASKS')) {
          metrics.totalTasks = el.textContent.match(/\d+/)?.[0] || '0';
        }
        if (text.includes('THIS WEEK') || parentText?.includes('THIS WEEK')) {
          metrics.thisWeek = el.textContent.match(/\d+/)?.[0] || '0';
        }
        if (text.includes('DAY STREAK') || parentText?.includes('DAY STREAK')) {
          metrics.dayStreak = el.textContent.match(/\d+/)?.[0] || '0';
        }
      });
      
      // Also try to extract metrics by looking for large numbers
      const numbers = document.querySelectorAll('div, span');
      Array.from(numbers).forEach(el => {
        const text = el.textContent.trim();
        if (/^\d+$/.test(text) && el.className && el.className.includes('text-')) {
          const nextSibling = el.nextElementSibling?.textContent?.trim();
          const parentText = el.parentElement?.textContent?.trim();
          
          if (nextSibling?.includes('COMPLETED') || parentText?.includes('COMPLETED')) {
            metrics.completedToday = text;
          }
          if (nextSibling?.includes('TOTAL') || parentText?.includes('TOTAL')) {
            metrics.totalTasks = text;
          }
          if (nextSibling?.includes('WEEK') || parentText?.includes('WEEK')) {
            metrics.thisWeek = text;
          }
          if (nextSibling?.includes('STREAK') || parentText?.includes('STREAK')) {
            metrics.dayStreak = text;
          }
        }
      });
      
      return metrics;
    });
    
    console.log('📊 AFTER METRICS:', afterMetrics);
    console.log('📈 METRICS COMPARISON:');
    console.log(`  Completed Today: ${beforeMetrics.completedToday || '?'} → ${afterMetrics.completedToday || '?'}`);
    console.log(`  Total Tasks: ${beforeMetrics.totalTasks || '?'} → ${afterMetrics.totalTasks || '?'}`);
    console.log(`  This Week: ${beforeMetrics.thisWeek || '?'} → ${afterMetrics.thisWeek || '?'}`);
    console.log(`  Day Streak: ${beforeMetrics.dayStreak || '?'} → ${afterMetrics.dayStreak || '?'}`);

    // Take final screenshot
    await page.screenshot({ 
      path: '/Users/shivangpatel/Documents/GitHub/crtx.in/test-results/05-after-task-completion.png',
      fullPage: true 
    });

    // Check for metrics calculation functions in the page
    const metricsInfo = await page.evaluate(() => {
      const info = {
        functions: [],
        errors: [],
        metricsElements: []
      };

      // Look for metrics-related functions
      if (window.updateMetrics) info.functions.push('updateMetrics');
      if (window.calculateMetrics) info.functions.push('calculateMetrics');
      if (window.refreshDashboard) info.functions.push('refreshDashboard');
      if (window.loadTasks) info.functions.push('loadTasks');

      // Try to call metrics update if available
      try {
        if (window.updateMetrics) {
          window.updateMetrics();
          info.functions.push('updateMetrics called successfully');
        }
      } catch (error) {
        info.errors.push(`updateMetrics error: ${error.message}`);
      }

      // Get current metrics display
      const metricsElements = document.querySelectorAll('[class*="metric"], [class*="stat"], [id*="metric"], [id*="stat"]');
      Array.from(metricsElements).forEach(el => {
        info.metricsElements.push({
          text: el.textContent.trim(),
          className: el.className,
          id: el.id
        });
      });

      return info;
    });

    console.log('🔧 Metrics system info:', metricsInfo);

    console.log('🔍 Debugging session complete!');
  });
});