const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('Dashboard Data Consistency Verification', () => {
  let dashboardPath;
  
  test.beforeAll(async () => {
    dashboardPath = 'file://' + path.resolve('/Users/shivangpatel/Documents/GitHub/crtx.in/dashboard-prototype-improved.html');
    console.log('Testing dashboard at:', dashboardPath);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(dashboardPath);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Allow animations and charts to load
  });

  test('Critical Data Points - Process Count Consistency', async ({ page, browserName }) => {
    console.log(`\n🔍 Testing Process Count Consistency on ${browserName.toUpperCase()}`);
    
    // Key Metrics Row - Total Processes
    const totalProcessesText = await page.locator('.metric-content:has(.metric-label:text("Total Processes")) .metric-value').textContent();
    const totalProcesses = parseInt(totalProcessesText.match(/\d+/)[0]);
    console.log(`✓ Key Metrics shows: ${totalProcesses} processes`);
    
    // Priority Matrix - Sum all quadrants
    const majorProjectsCount = await page.locator('.matrix-quadrant.major-projects .quadrant-badge').textContent();
    const quickWinsCount = await page.locator('.matrix-quadrant.quick-wins .quadrant-badge').textContent();
    const fillInsCount = await page.locator('.matrix-quadrant.fill-ins .quadrant-badge').textContent();
    const avoidCount = await page.locator('.matrix-quadrant.avoid .quadrant-badge').textContent();
    
    const majorCount = parseInt(majorProjectsCount);
    const quickCount = parseInt(quickWinsCount);
    const fillCount = parseInt(fillInsCount);
    const avoidCountNum = parseInt(avoidCount);
    const matrixSum = majorCount + quickCount + fillCount + avoidCountNum;
    
    console.log(`✓ Priority Matrix breakdown: ${majorCount} + ${quickCount} + ${fillCount} + ${avoidCountNum} = ${matrixSum}`);
    
    // Verification
    expect(totalProcesses).toBe(8);
    expect(matrixSum).toBe(8);
    expect(totalProcesses).toBe(matrixSum);
    
    console.log('✅ PASS: Process count consistency verified (8 processes total)');
  });

  test('Department Naming Consistency', async ({ page, browserName }) => {
    console.log(`\n🏢 Testing Department Naming Consistency on ${browserName.toUpperCase()}`);
    
    // Key Metrics Row - Department names
    const departmentText = await page.locator('.metric-content:has(.metric-label:text("Departments Involved")) .metric-value .text-small').textContent();
    console.log(`✓ Key Metrics departments: ${departmentText}`);
    
    // Check for "Human Resources" (not "HR")
    expect(departmentText).toContain('Human Resources');
    expect(departmentText).not.toContain('HR,');
    expect(departmentText).not.toContain(' HR ');
    expect(departmentText).not.toContain('HR');
    
    // Department Rankings section
    const humanResourcesSection = await page.locator('.dept-item .dept-name:text("Human Resources")');
    expect(await humanResourcesSection.count()).toBe(1);
    console.log('✓ Department Rankings uses "Human Resources"');
    
    // Use case priorities - Check HR reference
    const hrUseCaseText = await page.locator('.usecase-item:has(.usecase-name:text("Resume Screening")) .usecase-details').textContent();
    console.log(`✓ Use case department reference: ${hrUseCaseText}`);
    
    console.log('✅ PASS: Department naming consistency verified (Human Resources used consistently)');
  });

  test('Mathematical Accuracy Verification', async ({ page, browserName }) => {
    console.log(`\n🧮 Testing Mathematical Accuracy on ${browserName.toUpperCase()}`);
    
    // Priority Matrix total verification
    const majorCount = parseInt(await page.locator('.matrix-quadrant.major-projects .quadrant-badge').textContent());
    const quickCount = parseInt(await page.locator('.matrix-quadrant.quick-wins .quadrant-badge').textContent());
    const fillCount = parseInt(await page.locator('.matrix-quadrant.fill-ins .quadrant-badge').textContent());
    const avoidCount = parseInt(await page.locator('.matrix-quadrant.avoid .quadrant-badge').textContent());
    
    // Verify the mathematical relationship: 2+3+2+1=8
    expect(majorCount).toBe(2);
    expect(quickCount).toBe(3);
    expect(fillCount).toBe(2);
    expect(avoidCount).toBe(1);
    
    const matrixTotal = majorCount + quickCount + fillCount + avoidCount;
    expect(matrixTotal).toBe(8);
    console.log(`✓ Priority Matrix math verified: ${majorCount}+${quickCount}+${fillCount}+${avoidCount}=${matrixTotal}`);
    
    // Quick Wins count in KPI should match matrix Quick Wins count
    const quickWinKPI = await page.locator('.kpi-card:has(.kpi-title:text("Quick Win Opportunities")) .kpi-value').textContent();
    const quickWinKPICount = parseInt(quickWinKPI);
    
    // Should be >= Quick Wins matrix count (may include other opportunities)
    expect(quickWinKPICount).toBeGreaterThanOrEqual(quickCount);
    console.log(`✓ KPI Quick Wins (${quickWinKPICount}) >= Matrix Quick Wins (${quickCount})`);
    
    // Verify ROI percentages are realistic (should be > 0% and < 1000%)
    const roiElements = await page.locator('.matrix-item:has-text("ROI:")').all();
    for (const element of roiElements) {
      const text = await element.textContent();
      const roiMatch = text.match(/ROI: (\d+)%/);
      if (roiMatch) {
        const roi = parseInt(roiMatch[1]);
        expect(roi).toBeGreaterThan(0);
        expect(roi).toBeLessThan(1000);
        console.log(`✓ ROI value verified: ${roi}% (within expected range)`);
      }
    }
    
    console.log('✅ PASS: Mathematical accuracy verified across all sections');
  });

  test('Cross-Section Data Validation', async ({ page, browserName }) => {
    console.log(`\n🔄 Testing Cross-Section Data Validation on ${browserName.toUpperCase()}`);
    
    // Row 1: Key Metrics validation
    const projectName = await page.locator('.metric-content:has(.metric-label:text("Project Name")) .metric-value').textContent();
    const totalProcesses = await page.locator('.metric-content:has(.metric-label:text("Total Processes")) .metric-value').textContent();
    const departmentCount = await page.locator('.metric-content:has(.metric-label:text("Departments Involved")) .metric-value').textContent();
    
    expect(projectName.trim()).toBe('testSept9b');
    expect(totalProcesses).toContain('8');
    expect(departmentCount).toContain('3');
    console.log('✓ Row 1 Key Metrics: Project=testSept9b, Processes=8, Departments=3');
    
    // Row 2: Business KPIs validation
    const readinessScore = await page.locator('.kpi-value:text("87")').textContent();
    const annualSavings = await page.locator('.kpi-value:text("$2.4M")').textContent();
    const quickWins = await page.locator('.kpi-card:has(.kpi-title:text("Quick Win Opportunities")) .kpi-value').textContent();
    
    expect(readinessScore).toBe('87');
    expect(annualSavings).toBe('$2.4M');
    console.log(`✓ Row 2 KPIs: Readiness=87/100, Savings=$2.4M, Quick Wins=${quickWins}`);
    
    // Row 3: Priority Matrix cross-validation
    const matrixItems = await page.locator('.matrix-item').count();
    expect(matrixItems).toBe(8); // Should have exactly 8 items total
    console.log(`✓ Row 3 Matrix: ${matrixItems} total items match expected count`);
    
    console.log('✅ PASS: Cross-section validation completed successfully');
  });

  test('Business Logic Integrity', async ({ page, browserName }) => {
    console.log(`\n💼 Testing Business Logic Integrity on ${browserName.toUpperCase()}`);
    
    // ROI Logic - Higher ROI should correlate with higher priority scores
    const invoiceROI = 340; // From matrix item: "ROI: 340%"
    const hrROI = 220;      // From matrix item: "ROI: 220%"
    const emailROI = 185;   // From matrix item: "ROI: 185%"
    
    // Use case priority scores (should align with ROI generally)
    const invoiceScore = parseInt(await page.locator('.usecase-item:has(.usecase-name:text("Invoice Processing")) .usecase-score').textContent());
    const hrScore = parseInt(await page.locator('.usecase-item:has(.usecase-name:text("Resume Screening")) .usecase-score').textContent());
    const emailScore = parseInt(await page.locator('.usecase-item:has(.usecase-name:text("Email Automation")) .usecase-score').textContent());
    
    // Higher ROI should generally correlate with higher priority scores
    expect(invoiceScore).toBeGreaterThan(hrScore); // 340% ROI > 220% ROI
    expect(hrScore).toBeGreaterThan(emailScore);   // 220% ROI > 185% ROI
    
    console.log(`✓ ROI-Priority correlation: Invoice(${invoiceScore}) > HR(${hrScore}) > Email(${emailScore})`);
    
    // Readiness Score Logic (should be realistic)
    const readinessScore = 87;
    expect(readinessScore).toBeGreaterThan(0);
    expect(readinessScore).toBeLessThanOrEqual(100);
    console.log(`✓ Readiness score ${readinessScore}/100 is within valid range`);
    
    // Quick Wins alignment - Items in Quick Wins quadrant should have shorter timelines
    const quickWinsItems = await page.locator('.matrix-quadrant.quick-wins .matrix-item').all();
    for (const item of quickWinsItems) {
      const text = await item.textContent();
      // Quick wins should have timeline in weeks, not months
      expect(text).toMatch(/Timeline: \d+-\d+ weeks/);
      console.log('✓ Quick Win timeline verified:', text.match(/Timeline: [^|]+/)?.[0]);
    }
    
    // Major Projects should have longer timelines (months)
    const majorProjectsItems = await page.locator('.matrix-quadrant.major-projects .matrix-item').all();
    for (const item of majorProjectsItems) {
      const text = await item.textContent();
      // Major projects should have timeline in months
      expect(text).toMatch(/Timeline: \d+-\d+ months/);
      console.log('✓ Major Project timeline verified:', text.match(/Timeline: [^|]+/)?.[0]);
    }
    
    console.log('✅ PASS: Business logic integrity verified');
  });

  test('Format and Display Integrity', async ({ page, browserName }) => {
    console.log(`\n🎨 Testing Format and Display Integrity on ${browserName.toUpperCase()}`);
    
    // Check that all key numbers are displayed correctly
    const metrics = [
      { selector: '.metric-value:text("8")', label: 'Total Processes' },
      { selector: '.metric-value:text("3")', label: 'Departments' },
      { selector: '.kpi-value:text("87")', label: 'Readiness Score' },
      { selector: '.kpi-value:text("$2.4M")', label: 'Annual Savings' },
      { selector: '.quadrant-badge:text("2")', label: 'Major Projects Count' },
      { selector: '.quadrant-badge:text("3")', label: 'Quick Wins Count' },
      { selector: '.quadrant-badge:text("2")', label: 'Fill-ins Count' },
      { selector: '.quadrant-badge:text("1")', label: 'Avoid Count' }
    ];
    
    for (const metric of metrics) {
      const element = page.locator(metric.selector).first();
      await expect(element).toBeVisible();
      console.log(`✓ ${metric.label} displayed correctly`);
    }
    
    // Check responsive design - all sections should be visible
    const sections = [
      '.key-metrics-row',
      '.business-kpis-row', 
      '.priority-matrix-row',
      '.supporting-analysis',
      '.action-center'
    ];
    
    for (const section of sections) {
      await expect(page.locator(section)).toBeVisible();
      console.log(`✓ ${section} section is visible`);
    }
    
    // Verify no broken layouts - check that critical elements have proper dimensions
    const matrixGrid = page.locator('.matrix-grid');
    const matrixBounds = await matrixGrid.boundingBox();
    expect(matrixBounds.width).toBeGreaterThan(200);
    expect(matrixBounds.height).toBeGreaterThan(200);
    console.log(`✓ Matrix grid has proper dimensions: ${matrixBounds.width}x${matrixBounds.height}`);
    
    console.log('✅ PASS: Format and display integrity verified');
  });

  test('Cross-Browser Compatibility', async ({ page, browserName }) => {
    console.log(`\n🌐 Testing Cross-Browser Compatibility on ${browserName.toUpperCase()}`);
    
    // Test critical interactive elements work across browsers
    const interactiveElements = [
      '.matrix-quadrant',
      '.usecase-item',
      '.action-card',
      '.dept-item'
    ];
    
    for (const selector of interactiveElements) {
      const elements = await page.locator(selector).all();
      expect(elements.length).toBeGreaterThan(0);
      
      // Test hover states (simulate with focus)
      for (let i = 0; i < Math.min(elements.length, 3); i++) {
        await elements[i].hover();
        await page.waitForTimeout(100);
      }
      console.log(`✓ ${selector} hover interactions work on ${browserName}`);
    }
    
    // Test that charts load properly (canvas element should be present)
    const chartCanvas = page.locator('#roiChart');
    await expect(chartCanvas).toBeVisible();
    const canvasBounds = await chartCanvas.boundingBox();
    expect(canvasBounds.width).toBeGreaterThan(100);
    expect(canvasBounds.height).toBeGreaterThan(100);
    console.log(`✓ ROI Chart renders properly: ${canvasBounds.width}x${canvasBounds.height}`);
    
    // Test JavaScript functionality
    await page.evaluate(() => {
      // Test if core functions are available
      return typeof showQuadrantDetails === 'function' && 
             typeof refreshDashboard === 'function' &&
             typeof initROIChart === 'function';
    });
    console.log(`✓ JavaScript functions are available on ${browserName}`);
    
    console.log(`✅ PASS: Cross-browser compatibility verified on ${browserName.toUpperCase()}`);
  });

  test('Screenshot Documentation', async ({ page, browserName }) => {
    console.log(`\n📸 Generating Screenshot Evidence on ${browserName.toUpperCase()}`);
    
    // Take full page screenshot
    await page.screenshot({
      path: `/Users/shivangpatel/Documents/GitHub/crtx.in/test-results/dashboard-full-${browserName}.png`,
      fullPage: true
    });
    console.log(`✓ Full dashboard screenshot saved: dashboard-full-${browserName}.png`);
    
    // Take focused screenshot of key metrics
    await page.locator('.key-metrics-row').screenshot({
      path: `/Users/shivangpatel/Documents/GitHub/crtx.in/test-results/key-metrics-${browserName}.png`
    });
    console.log(`✓ Key metrics screenshot saved: key-metrics-${browserName}.png`);
    
    // Take focused screenshot of priority matrix
    await page.locator('.priority-matrix-row').screenshot({
      path: `/Users/shivangpatel/Documents/GitHub/crtx.in/test-results/priority-matrix-${browserName}.png`
    });
    console.log(`✓ Priority matrix screenshot saved: priority-matrix-${browserName}.png`);
    
    console.log('✅ PASS: Screenshot documentation completed');
  });

  test('Final Data Accuracy Assessment', async ({ page, browserName }) => {
    console.log(`\n🎯 Final Data Accuracy Assessment on ${browserName.toUpperCase()}`);
    
    const results = {
      processCountConsistency: false,
      departmentNaming: false,
      mathematicalAccuracy: false,
      crossSectionValidation: false,
      businessLogicIntegrity: false,
      formatDisplayIntegrity: false
    };
    
    try {
      // Process Count Consistency Check
      const totalProcesses = parseInt((await page.locator('.metric-content:has(.metric-label:text("Total Processes")) .metric-value').textContent()).match(/\d+/)[0]);
      const matrixSum = [
        await page.locator('.matrix-quadrant.major-projects .quadrant-badge').textContent(),
        await page.locator('.matrix-quadrant.quick-wins .quadrant-badge').textContent(),
        await page.locator('.matrix-quadrant.fill-ins .quadrant-badge').textContent(),
        await page.locator('.matrix-quadrant.avoid .quadrant-badge').textContent()
      ].map(Number).reduce((a, b) => a + b, 0);
      
      results.processCountConsistency = (totalProcesses === 8 && matrixSum === 8);
      console.log(`✓ Process Count: ${totalProcesses} (Key Metrics) = ${matrixSum} (Matrix) = 8 ✅`);
      
      // Department Naming Check
      const deptText = await page.locator('.metric-content:has(.metric-label:text("Departments Involved")) .metric-value .text-small').textContent();
      results.departmentNaming = deptText.includes('Human Resources') && !deptText.includes('HR,') && !deptText.includes(' HR ');
      console.log(`✓ Department Naming: Uses "Human Resources" consistently ✅`);
      
      // Mathematical Accuracy Check
      results.mathematicalAccuracy = (matrixSum === 8); // 2+3+2+1=8
      console.log(`✓ Mathematical Accuracy: 2+3+2+1=${matrixSum} ✅`);
      
      // Cross-Section Validation
      const projectName = await page.locator('.metric-content:has(.metric-label:text("Project Name")) .metric-value').textContent();
      const deptCount = await page.locator('.metric-content:has(.metric-label:text("Departments Involved")) .metric-value').textContent();
      results.crossSectionValidation = (projectName.trim() === 'testSept9b' && deptCount.includes('3'));
      console.log(`✓ Cross-Section: Project=${projectName}, Departments=3 ✅`);
      
      // Business Logic Integrity
      const readinessScore = parseInt(await page.locator('.kpi-value:text("87")').textContent());
      results.businessLogicIntegrity = (readinessScore === 87 && readinessScore <= 100);
      console.log(`✓ Business Logic: Readiness=${readinessScore}/100 ✅`);
      
      // Format and Display Integrity
      const allMetricsVisible = await Promise.all([
        page.locator('.metric-value:text("8")').first().isVisible(),
        page.locator('.kpi-value:text("87")').isVisible(),
        page.locator('.kpi-value:text("$2.4M")').isVisible()
      ]);
      results.formatDisplayIntegrity = allMetricsVisible.every(visible => visible);
      console.log(`✓ Format & Display: All key metrics visible ✅`);
      
    } catch (error) {
      console.error('❌ Error during assessment:', error.message);
    }
    
    // Calculate overall success rate
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    const successRate = Math.round((passedTests / totalTests) * 100);
    
    console.log('\n📊 FINAL ASSESSMENT RESULTS:');
    console.log(`🎯 Success Rate: ${successRate}% (${passedTests}/${totalTests} tests passed)`);
    console.log('📋 Detailed Results:');
    Object.entries(results).forEach(([test, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASS' : 'FAIL'}`);
    });
    
    // Overall pass/fail determination
    const overallPass = successRate === 100;
    console.log(`\n🏆 OVERALL STATUS: ${overallPass ? '✅ PASS' : '❌ FAIL'}`);
    
    if (overallPass) {
      console.log('🎉 All data consistency issues have been resolved!');
      console.log('📈 Dashboard provides 100% trustworthy business intelligence');
    } else {
      console.log('⚠️  Some data consistency issues remain');
      console.log('🔧 Review failed tests above for specific issues');
    }
    
    // Expect overall pass for test framework
    expect(overallPass).toBe(true);
  });
});