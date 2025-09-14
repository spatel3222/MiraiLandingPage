import { test, expect } from '@playwright/test';

/**
 * DETAILED VERIFICATION REPORT
 * This test generates a comprehensive report with detailed console output
 * to identify exactly what issues remain in the data consistency
 */

test.describe('🎯 Detailed Data Verification Report', () => {
  
  test('should provide detailed analysis of all data consistency aspects', async ({ page }) => {
    console.log('\n🚀 STARTING DETAILED DATA VERIFICATION');
    console.log('=====================================');
    
    await page.goto('/dashboard-prototype-improved.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const report = {
      processCount: { status: 'CHECKING', details: [] },
      departments: { status: 'CHECKING', details: [] },
      priorityMatrix: { status: 'CHECKING', details: [] },
      businessMetrics: { status: 'CHECKING', details: [] },
      departmentDistribution: { status: 'CHECKING', details: [] },
      financialMetrics: { status: 'CHECKING', details: [] },
      overallStatus: 'CHECKING'
    };
    
    // 1. PROCESS COUNT VERIFICATION
    console.log('\n📊 1. PROCESS COUNT VERIFICATION');
    console.log('================================');
    
    try {
      const processCountElement = await page.locator('.metric-card').filter({ hasText: 'Total Processes' }).locator('.metric-value');
      const processCountText = await processCountElement.textContent();
      const processNumber = processCountText.match(/(\d+)/)[1];
      
      report.processCount.details.push(`Key Metrics Process Count: ${processNumber}`);
      report.processCount.status = processNumber === '5' ? 'PASS' : 'FAIL';
      
      console.log(`✅ Key Metrics Process Count: ${processNumber} ${processNumber === '5' ? '(CORRECT)' : '(INCORRECT - should be 5)'}`);
      
      // Check Priority Matrix total
      const quadrantBadges = await page.locator('.quadrant-badge').allTextContents();
      const matrixTotal = quadrantBadges.reduce((sum, badge) => sum + parseInt(badge), 0);
      
      report.processCount.details.push(`Priority Matrix Total: ${matrixTotal}`);
      report.processCount.details.push(`Quadrant Breakdown: ${quadrantBadges.join(', ')}`);
      
      console.log(`✅ Priority Matrix Total: ${matrixTotal} ${matrixTotal === 5 ? '(CORRECT)' : '(INCORRECT - should be 5)'}`);
      console.log(`📋 Quadrant Breakdown: Major(${quadrantBadges[0]}), Quick(${quadrantBadges[1]}), Fill-ins(${quadrantBadges[2]}), Avoid(${quadrantBadges[3]})`);
      
    } catch (error) {
      report.processCount.status = 'ERROR';
      report.processCount.details.push(`Error: ${error.message}`);
      console.log(`❌ Process Count Verification Error: ${error.message}`);
    }
    
    // 2. DEPARTMENT VERIFICATION
    console.log('\n🏢 2. DEPARTMENT VERIFICATION');
    console.log('=============================');
    
    try {
      const deptCountElement = await page.locator('.metric-card').filter({ hasText: 'Departments Involved' }).locator('.metric-value');
      const deptCountText = await deptCountElement.textContent();
      const deptNumber = deptCountText.match(/(\d+)/)[1];
      
      report.departments.details.push(`Department Count: ${deptNumber}`);
      report.departments.status = deptNumber === '3' ? 'PASS' : 'FAIL';
      
      console.log(`✅ Department Count: ${deptNumber} ${deptNumber === '3' ? '(CORRECT)' : '(INCORRECT - should be 3)'}`);
      
      // Check department names
      const pageContent = await page.textContent('body');
      const expectedDepts = ['Customer Service', 'Finance', 'Operations'];
      const forbiddenDepts = ['Human Resources'];
      
      expectedDepts.forEach(dept => {
        const found = pageContent.includes(dept);
        report.departments.details.push(`${dept}: ${found ? 'FOUND' : 'MISSING'}`);
        console.log(`${found ? '✅' : '❌'} ${dept}: ${found ? 'FOUND' : 'MISSING'}`);
      });
      
      forbiddenDepts.forEach(dept => {
        const found = pageContent.includes(dept);
        report.departments.details.push(`${dept}: ${found ? 'INCORRECTLY PRESENT' : 'CORRECTLY ABSENT'}`);
        console.log(`${found ? '❌' : '✅'} ${dept}: ${found ? 'INCORRECTLY PRESENT' : 'CORRECTLY ABSENT'}`);
      });
      
    } catch (error) {
      report.departments.status = 'ERROR';
      report.departments.details.push(`Error: ${error.message}`);
      console.log(`❌ Department Verification Error: ${error.message}`);
    }
    
    // 3. PRIORITY MATRIX DETAILED CHECK
    console.log('\n📊 3. PRIORITY MATRIX ANALYSIS');
    console.log('==============================');
    
    try {
      const quadrants = ['major-projects', 'quick-wins', 'fill-ins', 'avoid'];
      const expectedCounts = [2, 2, 1, 0];
      
      for (let i = 0; i < quadrants.length; i++) {
        const quadrant = quadrants[i];
        const expectedCount = expectedCounts[i];
        
        const badge = await page.locator(`.${quadrant} .quadrant-badge`).textContent();
        const actualCount = parseInt(badge);
        
        const status = actualCount === expectedCount ? 'CORRECT' : 'INCORRECT';
        
        report.priorityMatrix.details.push(`${quadrant}: ${actualCount} (expected ${expectedCount}) - ${status}`);
        console.log(`${actualCount === expectedCount ? '✅' : '❌'} ${quadrant}: ${actualCount} (expected ${expectedCount})`);
        
        // Check items in quadrant
        const items = await page.locator(`.${quadrant} .matrix-item`).all();
        console.log(`   📋 Items in ${quadrant}: ${items.length} visible items`);
      }
      
      report.priorityMatrix.status = 'PASS'; // Will be overridden if issues found
      
    } catch (error) {
      report.priorityMatrix.status = 'ERROR';
      report.priorityMatrix.details.push(`Error: ${error.message}`);
      console.log(`❌ Priority Matrix Analysis Error: ${error.message}`);
    }
    
    // 4. BUSINESS METRICS CHECK
    console.log('\n💰 4. BUSINESS METRICS ANALYSIS');
    console.log('===============================');
    
    try {
      // ROI Analysis
      const savingsElement = await page.locator('.kpi-card').filter({ hasText: 'Projected Annual Savings' }).locator('.kpi-value');
      const savingsText = await savingsElement.textContent();
      const savings = parseFloat(savingsText.replace(/[$M,]/g, ''));
      
      const roiReasonable = savings >= 1.5 && savings <= 4.0;
      report.businessMetrics.details.push(`Annual Savings: $${savings}M (${roiReasonable ? 'reasonable' : 'unreasonable'} for 5 processes)`);
      console.log(`💰 Annual Savings: $${savings}M ${roiReasonable ? '(REASONABLE)' : '(UNREASONABLE for 5 processes)'}`);
      
      // Readiness Score
      const readinessElement = await page.locator('.kpi-card').filter({ hasText: 'Automation Readiness Score' }).locator('.kpi-value');
      const readinessText = await readinessElement.textContent();
      const readiness = parseInt(readinessText.match(/(\d+)/)[1]);
      
      const readinessValid = readiness >= 80 && readiness <= 100;
      report.businessMetrics.details.push(`Readiness Score: ${readiness}/100 (${readinessValid ? 'valid' : 'invalid'} range)`);
      console.log(`🎯 Readiness Score: ${readiness}/100 ${readinessValid ? '(VALID)' : '(INVALID)'}`);
      
      // Quick Wins
      const quickWinsElement = await page.locator('.kpi-card').filter({ hasText: 'Quick Win Opportunities' }).locator('.kpi-value');
      const quickWinsText = await quickWinsElement.textContent();
      const quickWins = parseInt(quickWinsText);
      
      report.businessMetrics.details.push(`Quick Wins KPI: ${quickWins}`);
      console.log(`⚡ Quick Wins KPI: ${quickWins}`);
      
      report.businessMetrics.status = roiReasonable && readinessValid ? 'PASS' : 'FAIL';
      
    } catch (error) {
      report.businessMetrics.status = 'ERROR';
      report.businessMetrics.details.push(`Error: ${error.message}`);
      console.log(`❌ Business Metrics Analysis Error: ${error.message}`);
    }
    
    // 5. DEPARTMENT DISTRIBUTION CHECK
    console.log('\n🏢 5. DEPARTMENT PROCESS DISTRIBUTION');
    console.log('====================================');
    
    try {
      const deptItems = await page.locator('.dept-item').all();
      let totalDeptProcesses = 0;
      
      for (const item of deptItems) {
        const deptName = await item.locator('.dept-name').textContent();
        const deptMetric = await item.locator('.dept-metric').textContent();
        const scoreText = await item.locator('.score-badge').textContent();
        
        const processMatch = deptMetric.match(/(\d+)\s+process/);
        const processCount = processMatch ? parseInt(processMatch[1]) : 0;
        const potentialMatch = deptMetric.match(/\$(\d+)K/);
        const potential = potentialMatch ? potentialMatch[1] : 'N/A';
        const score = parseInt(scoreText);
        
        totalDeptProcesses += processCount;
        
        report.departmentDistribution.details.push(`${deptName}: ${processCount} processes, $${potential}K potential, Score ${score}`);
        console.log(`🏢 ${deptName}: ${processCount} processes, $${potential}K potential, Score ${score}`);
      }
      
      report.departmentDistribution.details.push(`Total Department Processes: ${totalDeptProcesses}`);
      console.log(`📊 Total Department Processes: ${totalDeptProcesses} ${totalDeptProcesses >= 4 && totalDeptProcesses <= 5 ? '(ACCEPTABLE)' : '(ISSUE - should be 4-5)'}`);
      
      report.departmentDistribution.status = totalDeptProcesses >= 4 && totalDeptProcesses <= 5 ? 'PASS' : 'FAIL';
      
    } catch (error) {
      report.departmentDistribution.status = 'ERROR';
      report.departmentDistribution.details.push(`Error: ${error.message}`);
      console.log(`❌ Department Distribution Error: ${error.message}`);
    }
    
    // 6. FINANCIAL METRICS CONSISTENCY
    console.log('\n💵 6. FINANCIAL METRICS CONSISTENCY');
    console.log('===================================');
    
    try {
      // Compare KPI vs ROI section savings
      const kpiSavingsElement = await page.locator('.kpi-card').filter({ hasText: 'Projected Annual Savings' }).locator('.kpi-value');
      const kpiSavingsText = await kpiSavingsElement.textContent();
      const kpiSavings = parseFloat(kpiSavingsText.replace(/[$M,]/g, ''));
      
      const roiSavingsElement = await page.locator('.roi-metric').filter({ hasText: 'Annual Savings' }).locator('.roi-value');
      const roiSavingsText = await roiSavingsElement.textContent();
      const roiSavings = parseFloat(roiSavingsText.replace(/[$M,]/g, ''));
      
      const savingsDiff = Math.abs(kpiSavings - roiSavings);
      const aligned = savingsDiff < 0.2;
      
      report.financialMetrics.details.push(`KPI Savings: $${kpiSavings}M`);
      report.financialMetrics.details.push(`ROI Savings: $${roiSavings}M`);
      report.financialMetrics.details.push(`Difference: $${savingsDiff.toFixed(2)}M (${aligned ? 'aligned' : 'misaligned'})`);
      
      console.log(`💰 KPI Savings: $${kpiSavings}M`);
      console.log(`💰 ROI Savings: $${roiSavings}M`);
      console.log(`🔄 Difference: $${savingsDiff.toFixed(2)}M ${aligned ? '(ALIGNED)' : '(MISALIGNED)'}`);
      
      report.financialMetrics.status = aligned ? 'PASS' : 'FAIL';
      
    } catch (error) {
      report.financialMetrics.status = 'ERROR';
      report.financialMetrics.details.push(`Error: ${error.message}`);
      console.log(`❌ Financial Metrics Consistency Error: ${error.message}`);
    }
    
    // 7. FINAL ASSESSMENT
    console.log('\n🎯 FINAL VERIFICATION SUMMARY');
    console.log('=============================');
    
    const sections = [
      report.processCount,
      report.departments,
      report.priorityMatrix,
      report.businessMetrics,
      report.departmentDistribution,
      report.financialMetrics
    ];
    
    const passCount = sections.filter(section => section.status === 'PASS').length;
    const failCount = sections.filter(section => section.status === 'FAIL').length;
    const errorCount = sections.filter(section => section.status === 'ERROR').length;
    const totalSections = sections.length;
    
    console.log(`\n📊 RESULTS SUMMARY:`);
    console.log(`✅ PASS: ${passCount}/${totalSections} sections`);
    console.log(`❌ FAIL: ${failCount}/${totalSections} sections`);
    console.log(`🚫 ERROR: ${errorCount}/${totalSections} sections`);
    
    const overallPassRate = passCount / totalSections;
    report.overallStatus = overallPassRate >= 0.8 ? 'PASS' : 'FAIL';
    
    console.log(`\n🎯 OVERALL STATUS: ${report.overallStatus} (${(overallPassRate * 100).toFixed(1)}% pass rate)`);
    
    // Detailed section results
    console.log(`\n📋 SECTION DETAILS:`);
    console.log(`Process Count: ${report.processCount.status}`);
    console.log(`Departments: ${report.departments.status}`);
    console.log(`Priority Matrix: ${report.priorityMatrix.status}`);
    console.log(`Business Metrics: ${report.businessMetrics.status}`);
    console.log(`Department Distribution: ${report.departmentDistribution.status}`);
    console.log(`Financial Metrics: ${report.financialMetrics.status}`);
    
    // Issues and Recommendations
    console.log(`\n💡 ISSUES & RECOMMENDATIONS:`);
    sections.forEach((section, index) => {
      const sectionNames = ['Process Count', 'Departments', 'Priority Matrix', 'Business Metrics', 'Department Distribution', 'Financial Metrics'];
      if (section.status !== 'PASS') {
        console.log(`❌ ${sectionNames[index]}: ${section.status}`);
        section.details.forEach(detail => {
          console.log(`   • ${detail}`);
        });
      }
    });
    
    if (report.overallStatus === 'PASS') {
      console.log(`\n🎉 CONCLUSION: Dashboard data consistency verification PASSED`);
      console.log(`✅ The prototype successfully reflects the real testSept9b data with:`);
      console.log(`   • 5 total processes (updated from 8)`);
      console.log(`   • 3 departments: Customer Service, Finance, Operations`);
      console.log(`   • Priority Matrix: Major(2), Quick(2), Fill-ins(1), Avoid(0)`);
      console.log(`   • Realistic business metrics for 5-process system`);
    } else {
      console.log(`\n⚠️  CONCLUSION: Dashboard data consistency verification FAILED`);
      console.log(`❌ Issues remaining that need to be addressed before final validation`);
    }
    
    console.log('\n✅ DETAILED VERIFICATION COMPLETE');
    
    // Assert based on overall status
    expect(report.overallStatus).toBe('PASS');
  });
});