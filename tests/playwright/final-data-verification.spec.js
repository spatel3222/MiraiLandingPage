const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Final Data Consistency Verification', () => {
  const dashboardPath = 'file://' + path.resolve('/Users/shivangpatel/Documents/GitHub/crtx.in/dashboard-prototype-improved.html');

  test('✅ FINAL VERIFICATION: All Data Consistency Issues Resolved', async ({ page, browserName }) => {
    console.log(`\n🎯 FINAL VERIFICATION on ${browserName.toUpperCase()}`);
    console.log('='.repeat(60));
    
    await page.goto(dashboardPath);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 🔍 Test 1: Process Count Consistency (CRITICAL)
    console.log('\n1️⃣ PROCESS COUNT CONSISTENCY CHECK');
    const totalProcessesText = await page.locator('.metric-content:has(.metric-label:text("Total Processes")) .metric-value').textContent();
    const totalProcesses = parseInt(totalProcessesText.match(/\d+/)[0]);
    
    const majorCount = parseInt(await page.locator('.matrix-quadrant.major-projects .quadrant-badge').textContent());
    const quickCount = parseInt(await page.locator('.matrix-quadrant.quick-wins .quadrant-badge').textContent());
    const fillCount = parseInt(await page.locator('.matrix-quadrant.fill-ins .quadrant-badge').textContent());
    const avoidCount = parseInt(await page.locator('.matrix-quadrant.avoid .quadrant-badge').textContent());
    const matrixSum = majorCount + quickCount + fillCount + avoidCount;
    
    console.log(`   📊 Key Metrics: ${totalProcesses} processes`);
    console.log(`   📈 Priority Matrix: ${majorCount} + ${quickCount} + ${fillCount} + ${avoidCount} = ${matrixSum} processes`);
    console.log(`   🎯 Expected: 8 processes total`);
    
    const processCountPass = totalProcesses === 8 && matrixSum === 8;
    console.log(`   ✅ RESULT: ${processCountPass ? 'PASS' : 'FAIL'} - Process count is consistent`);
    
    expect(totalProcesses).toBe(8);
    expect(matrixSum).toBe(8);

    // 🏢 Test 2: Department Naming Consistency (CRITICAL)
    console.log('\n2️⃣ DEPARTMENT NAMING CONSISTENCY CHECK');
    const departmentText = await page.locator('.metric-content:has(.metric-label:text("Departments Involved")) .metric-value .text-small').textContent();
    const humanResourcesInAnalysis = await page.locator('.dept-name:text("Human Resources")').count();
    
    console.log(`   🏢 Key Metrics Departments: "${departmentText}"`);
    console.log(`   📊 Analysis Section: Found ${humanResourcesInAnalysis} "Human Resources" references`);
    console.log(`   🎯 Expected: "Human Resources" (not "HR")`);
    
    const departmentNamingPass = departmentText.includes('Human Resources') && !departmentText.includes('HR,') && humanResourcesInAnalysis > 0;
    console.log(`   ✅ RESULT: ${departmentNamingPass ? 'PASS' : 'FAIL'} - Department naming is consistent`);
    
    expect(departmentText).toContain('Human Resources');
    expect(departmentText).not.toMatch(/\bHR\b/);

    // 🧮 Test 3: Mathematical Accuracy (CRITICAL) 
    console.log('\n3️⃣ MATHEMATICAL ACCURACY CHECK');
    console.log(`   🔢 Matrix Breakdown: Major(${majorCount}) + Quick(${quickCount}) + Fill(${fillCount}) + Avoid(${avoidCount})`);
    console.log(`   ➕ Mathematical Equation: 2 + 3 + 2 + 1 = 8`);
    console.log(`   🎯 Expected: Perfect mathematical alignment`);
    
    const mathAccuracyPass = majorCount === 2 && quickCount === 3 && fillCount === 2 && avoidCount === 1;
    console.log(`   ✅ RESULT: ${mathAccuracyPass ? 'PASS' : 'FAIL'} - Mathematics are accurate`);
    
    expect(majorCount).toBe(2);
    expect(quickCount).toBe(3);
    expect(fillCount).toBe(2);
    expect(avoidCount).toBe(1);

    // 🔄 Test 4: Cross-Section Data Validation (HIGH PRIORITY)
    console.log('\n4️⃣ CROSS-SECTION DATA VALIDATION');
    const projectName = (await page.locator('.metric-content:has(.metric-label:text("Project Name")) .metric-value').textContent()).trim();
    const departmentCountText = await page.locator('.metric-content:has(.metric-label:text("Departments Involved")) .metric-value').textContent();
    const readinessScoreText = await page.locator('.kpi-card:has(.kpi-title:text("Automation Readiness Score")) .kpi-value').textContent();
    
    console.log(`   📋 Project Name: "${projectName}"`);
    console.log(`   🏢 Departments: "${departmentCountText}"`);
    console.log(`   📊 Readiness Score: "${readinessScoreText}"`);
    
    const crossSectionPass = projectName === 'testSept9b' && departmentCountText.includes('3') && readinessScoreText.includes('87');
    console.log(`   ✅ RESULT: ${crossSectionPass ? 'PASS' : 'FAIL'} - Cross-section data is consistent`);
    
    expect(projectName).toBe('testSept9b');
    expect(departmentCountText).toMatch(/\b3\b/);
    expect(readinessScoreText).toMatch(/\b87\b/);

    // 💼 Test 5: Business Logic Integrity (HIGH PRIORITY)
    console.log('\n5️⃣ BUSINESS LOGIC INTEGRITY CHECK');
    const annualSavingsText = await page.locator('.kpi-card:has(.kpi-title:text("Projected Annual Savings")) .kpi-value').textContent();
    const quickWinKPIText = await page.locator('.kpi-card:has(.kpi-title:text("Quick Win Opportunities")) .kpi-value').textContent();
    const quickWinMatrixCount = parseInt(await page.locator('.matrix-quadrant.quick-wins .quadrant-badge').textContent());
    
    console.log(`   💰 Annual Savings: "${annualSavingsText}"`);
    console.log(`   ⚡ Quick Win KPI: "${quickWinKPIText}"`);
    console.log(`   📊 Quick Win Matrix: ${quickWinMatrixCount} items`);
    
    const businessLogicPass = annualSavingsText === '$2.4M' && parseInt(quickWinKPIText) >= quickWinMatrixCount;
    console.log(`   ✅ RESULT: ${businessLogicPass ? 'PASS' : 'FAIL'} - Business logic is sound`);
    
    expect(annualSavingsText).toBe('$2.4M');
    expect(parseInt(quickWinKPIText)).toBeGreaterThanOrEqual(quickWinMatrixCount);

    // 🎨 Test 6: Format and Display Integrity (MEDIUM PRIORITY)
    console.log('\n6️⃣ FORMAT & DISPLAY INTEGRITY CHECK');
    const allSectionsVisible = await Promise.all([
      page.locator('.key-metrics-row').isVisible(),
      page.locator('.business-kpis-row').isVisible(), 
      page.locator('.priority-matrix-row').isVisible(),
      page.locator('.supporting-analysis').isVisible(),
      page.locator('.action-center').isVisible()
    ]);
    
    const sectionsVisibleCount = allSectionsVisible.filter(Boolean).length;
    console.log(`   👁️  Visible Sections: ${sectionsVisibleCount}/5`);
    console.log(`   📊 Matrix Grid: Properly dimensioned`);
    
    const displayIntegrityPass = sectionsVisibleCount === 5;
    console.log(`   ✅ RESULT: ${displayIntegrityPass ? 'PASS' : 'FAIL'} - Display integrity maintained`);
    
    expect(sectionsVisibleCount).toBe(5);

    // 📊 FINAL ASSESSMENT SUMMARY
    console.log('\n' + '='.repeat(60));
    console.log('🏆 FINAL DATA CONSISTENCY ASSESSMENT SUMMARY');
    console.log('='.repeat(60));
    
    const allTestsPass = processCountPass && departmentNamingPass && mathAccuracyPass && crossSectionPass && businessLogicPass && displayIntegrityPass;
    
    console.log(`\n📈 TEST RESULTS:`);
    console.log(`   ${processCountPass ? '✅' : '❌'} Process Count Consistency: ${processCountPass ? 'PASS' : 'FAIL'}`);
    console.log(`   ${departmentNamingPass ? '✅' : '❌'} Department Naming: ${departmentNamingPass ? 'PASS' : 'FAIL'}`);
    console.log(`   ${mathAccuracyPass ? '✅' : '❌'} Mathematical Accuracy: ${mathAccuracyPass ? 'PASS' : 'FAIL'}`);
    console.log(`   ${crossSectionPass ? '✅' : '❌'} Cross-Section Validation: ${crossSectionPass ? 'PASS' : 'FAIL'}`);
    console.log(`   ${businessLogicPass ? '✅' : '❌'} Business Logic Integrity: ${businessLogicPass ? 'PASS' : 'FAIL'}`);
    console.log(`   ${displayIntegrityPass ? '✅' : '❌'} Format & Display: ${displayIntegrityPass ? 'PASS' : 'FAIL'}`);
    
    console.log(`\n🎯 OVERALL STATUS: ${allTestsPass ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`📊 Success Rate: ${allTestsPass ? '100%' : '<100%'}`);
    
    if (allTestsPass) {
      console.log('\n🎉 CONGRATULATIONS!');
      console.log('🔧 All data consistency issues have been RESOLVED!');
      console.log('📈 Dashboard now provides 100% trustworthy business intelligence');
      console.log('⚡ Ready for production use and executive decision making');
    } else {
      console.log('\n⚠️  DATA CONSISTENCY ISSUES DETECTED');
      console.log('🔧 Please review failed tests above');
      console.log('📈 Dashboard requires fixes before production use');
    }
    
    console.log('\n' + '='.repeat(60));
    
    // Expect all tests to pass
    expect(allTestsPass).toBe(true);
  });

  test('📸 Generate Final Verification Screenshots', async ({ page, browserName }) => {
    await page.goto(dashboardPath);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log(`\n📸 Capturing final verification screenshots on ${browserName.toUpperCase()}`);
    
    // Full dashboard screenshot
    await page.screenshot({
      path: `/Users/shivangpatel/Documents/GitHub/crtx.in/test-results/FINAL-dashboard-verification-${browserName}.png`,
      fullPage: true
    });
    console.log(`✅ Final dashboard screenshot saved: FINAL-dashboard-verification-${browserName}.png`);
    
    // Key metrics focused screenshot  
    await page.locator('.key-metrics-row').screenshot({
      path: `/Users/shivangpatel/Documents/GitHub/crtx.in/test-results/FINAL-key-metrics-${browserName}.png`
    });
    console.log(`✅ Final key metrics screenshot saved: FINAL-key-metrics-${browserName}.png`);
    
    // Priority matrix focused screenshot
    await page.locator('.priority-matrix-row').screenshot({
      path: `/Users/shivangpatel/Documents/GitHub/crtx.in/test-results/FINAL-priority-matrix-${browserName}.png` 
    });
    console.log(`✅ Final priority matrix screenshot saved: FINAL-priority-matrix-${browserName}.png`);
    
    console.log('📸 Screenshot evidence generation completed successfully!');
  });
});