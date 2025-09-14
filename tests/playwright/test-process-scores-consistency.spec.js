const { test, expect } = require('@playwright/test');

test.describe('Process Scores Consistency Tests', () => {
  const baseUrl = 'http://localhost:8000';
  let supabaseProcesses = [];
  
  test.beforeAll(async () => {
    // First, get the actual data from Supabase for testSept9b
    console.log('📊 Fetching testSept9b data from Supabase...');
  });

  test('Process scores should be consistent across Supabase, Process Entry, and Dashboard', async ({ page }) => {
    console.log('\n🔍 Testing process scores consistency for testSept9b project\n');
    
    let chartData = []; // Initialize chartData variable
    
    // Step 1: Get data directly from Supabase
    console.log('Step 1: Fetching data from Supabase...');
    
    await page.goto(`${baseUrl}/check-testSept9b-processes.html`);
    await page.waitForTimeout(3000); // Wait for Supabase query to complete
    
    // Extract process data from the Supabase query page
    const processCount = await page.locator('h3:has-text("Number of Processes")').textContent();
    console.log('✅ Supabase Query Result:', processCount);
    
    // Get all process details from the list
    const processElements = await page.locator('ol li').all();
    const supabaseData = [];
    
    for (const element of processElements) {
      const text = await element.textContent();
      const nameMatch = text.match(/^(.+?)\s*\(/);
      const impactMatch = text.match(/Impact:\s*(\d+)/);
      const feasibilityMatch = text.match(/Feasibility:\s*(\d+)/);
      
      if (nameMatch && impactMatch && feasibilityMatch) {
        supabaseData.push({
          name: nameMatch[1].trim(),
          impact: parseInt(impactMatch[1]),
          feasibility: parseInt(feasibilityMatch[1])
        });
      }
    }
    
    console.log('\n📊 Supabase Process Data:');
    supabaseData.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name}`);
      console.log(`     - Impact: ${p.impact}/10`);
      console.log(`     - Feasibility: ${p.feasibility}/10`);
    });
    
    // Step 2: Check Process Entry screen
    console.log('\n\nStep 2: Checking Process Entry screen...');
    
    await page.goto(`${baseUrl}/workshops/business-automation-dashboard.html`);
    await page.waitForTimeout(2000);
    
    // Select testSept9b project
    const projectSelector = page.locator('#headerProjectSelector');
    
    // Check if testSept9b exists in the dropdown
    const options = await projectSelector.locator('option').all();
    let hasTestSept9b = false;
    
    for (const option of options) {
      const text = await option.textContent();
      if (text.includes('testSept9b')) {
        hasTestSept9b = true;
        await projectSelector.selectOption({ label: text });
        console.log(`✅ Selected project: ${text}`);
        break;
      }
    }
    
    if (!hasTestSept9b) {
      console.log('⚠️  testSept9b not found in project dropdown');
      console.log('Available projects:');
      for (const option of options) {
        console.log(`  - ${await option.textContent()}`);
      }
    }
    
    await page.waitForTimeout(2000); // Wait for project data to load
    
    // Open Process Entry workspace
    console.log('\nOpening Process Entry workspace...');
    
    // Click the FAB button to expand menu
    await page.click('#primaryFab');
    await page.waitForTimeout(500);
    
    // Click on Process Entry (Add Process) button
    await page.click('button[onclick="openProcessWorkspace()"]');
    await page.waitForTimeout(2000); // Give more time for workspace to load
    
    // Check if process list shows the correct scores
    // The Process Entry workspace shows recent processes in admin-control-card divs
    const processListItems = await page.locator('.admin-control-card').all();
    
    console.log(`\n📋 Process Entry Screen - Found ${processListItems.length} processes:`);
    
    for (let i = 0; i < processListItems.length; i++) {
      const item = processListItems[i];
      // Extract process name from h4 element
      const nameElement = await item.locator('h4').textContent().catch(() => 'N/A');
      // Extract department from first p element
      const deptElement = await item.locator('p').first().textContent().catch(() => 'N/A');
      // Extract score from the colored span element
      const scoreElement = await item.locator('span.rounded-full').textContent().catch(() => 'N/A');
      
      console.log(`  ${i + 1}. Process: ${nameElement}`);
      console.log(`     - Department: ${deptElement}`);
      console.log(`     - Automation Score: ${scoreElement}`);
      
      // Check for zero scores issue
      if (scoreElement.includes('0.0') || scoreElement === '0/10') {
        console.log(`     ⚠️  WARNING: Zero score detected!`);
      }
    }
    
    // Close the Process Entry workspace
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Step 3: Check Dashboard charts
    console.log('\n\nStep 3: Checking Dashboard charts...');
    
    // Check the Impact vs Feasibility chart
    const chartCanvas = page.locator('canvas').first();
    const isChartVisible = await chartCanvas.isVisible();
    console.log(`\n📈 Chart visibility: ${isChartVisible ? 'Visible' : 'Not visible'}`);
    
    if (isChartVisible) {
      // Execute JavaScript to get chart data
      chartData = await page.evaluate(() => {
        // Try to access the chart instance
        const charts = window.Chart?.instances;
        if (charts && Object.keys(charts).length > 0) {
          const firstChart = Object.values(charts)[0];
          if (firstChart && firstChart.data && firstChart.data.datasets) {
            return firstChart.data.datasets[0]?.data || [];
          }
        }
        return [];
      });
      
      console.log('\n📊 Chart Data Points:');
      if (chartData.length > 0) {
        chartData.forEach((point, i) => {
          console.log(`  Point ${i + 1}: x=${point.x || 0}, y=${point.y || 0}`);
          if (point.x === 0 && point.y === 0) {
            console.log(`     ⚠️  WARNING: Zero values in chart!`);
          }
        });
      } else {
        console.log('  ⚠️  No data points found in chart');
      }
    }
    
    // Step 4: Verify consistency
    console.log('\n\n📊 CONSISTENCY CHECK SUMMARY:');
    console.log('================================');
    
    let issuesFound = [];
    
    // Extract the actual process count from Supabase
    const processCountMatch = processCount.match(/(\d+)/);
    const supabaseProcessCount = processCountMatch ? parseInt(processCountMatch[1]) : 0;
    
    // Check if we have data in Supabase
    if (supabaseProcessCount > 0) {
      console.log(`✅ Supabase has ${supabaseProcessCount} processes`);
      
      // Check Process Entry (shows last 5)
      if (processListItems.length === 0) {
        issuesFound.push('❌ Process Entry screen shows no processes');
      } else {
        console.log(`✅ Process Entry screen shows ${processListItems.length} processes (last 5 of ${supabaseProcessCount})`);
      }
      
      // Check chart data points (chartData was collected earlier)
      if (chartData && chartData.length === supabaseProcessCount) {
        console.log(`✅ Chart has ${chartData.length} data points matching Supabase count`);
      } else if (chartData && chartData.length > 0) {
        console.log(`⚠️  Chart has ${chartData.length} data points, Supabase has ${supabaseProcessCount} processes`);
        if (chartData.length < supabaseProcessCount) {
          issuesFound.push(`⚠️  Chart missing ${supabaseProcessCount - chartData.length} processes`);
        }
      } else {
        issuesFound.push('❌ Chart has no data points');
      }
      
      // Check for zero values in chart
      if (chartData && chartData.length > 0) {
        const zeroValuePoints = chartData.filter(p => p.x === 0 && p.y === 0);
        if (zeroValuePoints.length > 0) {
          issuesFound.push(`⚠️  ${zeroValuePoints.length} chart points have zero values`);
        } else {
          console.log('✅ All chart points have non-zero values');
        }
      }
    } else {
      issuesFound.push('⚠️  No processes found in Supabase for testSept9b');
    }
    
    if (issuesFound.length > 0) {
      console.log('\n⚠️  Issues Found:');
      issuesFound.forEach(issue => console.log(`  ${issue}`));
    } else {
      console.log('\n✅ All consistency checks passed!');
    }
    
    // Take screenshots for documentation
    await page.screenshot({ 
      path: 'test-results/process-scores-dashboard.png', 
      fullPage: true 
    });
    
    console.log('\n📸 Screenshot saved to test-results/process-scores-dashboard.png');
  });

  test('Detailed score tracking through data flow', async ({ page }) => {
    console.log('\n🔬 Detailed Score Tracking Test\n');
    
    // This test will trace how scores flow from Supabase to UI
    await page.goto(`${baseUrl}/workshops/business-automation-dashboard.html`);
    
    // Enable console logging to catch any errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      }
    });
    
    // Inject debugging code to track score values
    await page.evaluate(() => {
      console.log('🔍 Starting score tracking...');
      
      // Override loadProcesses to log what's being loaded
      const originalLoad = window.loadProcesses;
      if (originalLoad) {
        window.loadProcesses = async function(projectId) {
          console.log(`📥 Loading processes for project: ${projectId}`);
          const result = await originalLoad.call(this, projectId);
          console.log(`📊 Loaded ${result?.length || 0} processes`);
          if (result && result.length > 0) {
            result.forEach((p, i) => {
              console.log(`Process ${i + 1}: ${p.name}`);
              console.log(`  Impact: ${p.impact || p.impact_score || 0}`);
              console.log(`  Feasibility: ${p.feasibility || p.feasibility_score || 0}`);
            });
          }
          return result;
        };
      }
    });
    
    // Select testSept9b project to trigger data load
    const projectSelector = page.locator('#headerProjectSelector');
    const options = await projectSelector.locator('option').all();
    
    for (const option of options) {
      const text = await option.textContent();
      if (text.includes('testSept9b')) {
        await projectSelector.selectOption({ label: text });
        console.log(`✅ Selected project: ${text}`);
        break;
      }
    }
    
    await page.waitForTimeout(3000); // Wait for data to load
    
    // Check the actual process array in memory
    const processData = await page.evaluate(() => {
      return window.processes || [];
    });
    
    console.log('\n📊 In-Memory Process Data:');
    if (processData.length > 0) {
      processData.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.name || 'Unnamed'}`);
        console.log(`     - Impact: ${p.impact || p.impact_score || 0}`);
        console.log(`     - Feasibility: ${p.feasibility || p.feasibility_score || 0}`);
        console.log(`     - All fields:`, Object.keys(p).join(', '));
      });
    } else {
      console.log('  ⚠️  No processes in memory');
    }
    
    // Final diagnosis
    console.log('\n\n🔍 DIAGNOSIS:');
    console.log('================');
    
    if (processData.length === 0) {
      console.log('❌ Issue: Processes not loading from Supabase to memory');
      console.log('   Possible causes:');
      console.log('   - Connection issue with Supabase');
      console.log('   - Project ID mismatch');
      console.log('   - Data not syncing properly');
    } else {
      const hasZeroScores = processData.some(p => 
        (p.impact === 0 || p.impact_score === 0) && 
        (p.feasibility === 0 || p.feasibility_score === 0)
      );
      
      if (hasZeroScores) {
        console.log('❌ Issue: Scores are zero in memory despite being non-zero in Supabase');
        console.log('   Possible causes:');
        console.log('   - Field name mismatch (impact vs impact_score)');
        console.log('   - Data transformation issue');
        console.log('   - Score fields not being properly mapped');
      } else {
        console.log('✅ Scores are correctly loaded in memory');
        console.log('   Next check: UI rendering of these scores');
      }
    }
  });
});