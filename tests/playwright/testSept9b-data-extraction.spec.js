const { test, expect } = require('@playwright/test');

/**
 * TESTSEPT9B PROJECT DATA EXTRACTION
 * 
 * This test specifically extracts data from the testSept9b project to verify
 * its actual content against prototype assumptions.
 */

test.describe('testSept9b Project Data Extraction', () => {
  const dashboardPath = '/workshops/business-automation-dashboard.html';

  test('🎯 Extract Complete testSept9b Project Data', async ({ page }) => {
    console.log('\n🔍 TESTSEPT9B PROJECT DATA EXTRACTION');
    console.log('=' * 60);
    
    // Navigate to the dashboard
    await page.goto(dashboardPath);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // First, verify testSept9b exists
    const projectSelector = await page.locator('#headerProjectSelector').first();
    const allOptions = await projectSelector.evaluate(el => {
      return Array.from(el.options).map(option => ({
        value: option.value,
        text: option.text
      }));
    });
    
    console.log('📋 Available Projects:');
    allOptions.forEach((project, index) => {
      console.log(`   ${index + 1}. "${project.text}" (ID: ${project.value})`);
    });
    
    // Find testSept9b project
    const testSept9bProject = allOptions.find(p => p.text.includes('testSept9b'));
    
    if (!testSept9bProject) {
      console.log('❌ testSept9b project not found!');
      expect(testSept9bProject).toBeDefined();
      return;
    }
    
    console.log(`\n🎯 Found testSept9b Project:`);
    console.log(`   Text: "${testSept9bProject.text}"`);
    console.log(`   ID: "${testSept9bProject.value}"`);
    
    // Switch to testSept9b project
    console.log('\n🔄 Switching to testSept9b project...');
    await projectSelector.selectOption(testSept9bProject.value);
    await page.waitForTimeout(2000); // Wait for project switch
    
    // Wait for data to load
    await page.waitForTimeout(3000);
    
    // Extract project data after switch
    const projectData = await page.evaluate(() => {
      return {
        currentProjectId: window.currentProjectId,
        currentProject: window.currentProject,
        projects: window.projects || [],
        processes: window.processes || [],
        globalData: {
          projectsLength: window.projects ? window.projects.length : 0,
          processesLength: window.processes ? window.processes.length : 0
        }
      };
    });
    
    console.log('\n📊 POST-SWITCH PROJECT DATA:');
    console.log(`   Current Project ID: "${projectData.currentProjectId}"`);
    console.log(`   Current Project: "${projectData.currentProject}"`);
    console.log(`   Global Projects Count: ${projectData.globalData.projectsLength}`);
    console.log(`   Global Processes Count: ${projectData.globalData.processesLength}`);
    
    // Extract processes data
    if (projectData.processes.length > 0) {
      console.log('\n📋 TESTSEPT9B PROCESSES:');
      projectData.processes.forEach((process, index) => {
        console.log(`   ${index + 1}. "${process.name}"`);
        console.log(`      Department: ${process.department}`);
        console.log(`      Impact: ${process.impact}, Feasibility: ${process.feasibility}`);
        console.log(`      Time Spent: ${process.timeSpent} hours`);
        if (process.scores) {
          console.log(`      Scores: Repetitive(${process.scores.repetitive}), DataDriven(${process.scores.dataDriven}), RuleBased(${process.scores.ruleBased}), HighVolume(${process.scores.highVolume})`);
        }
        console.log('');
      });
      
      // Department analysis
      const departments = [...new Set(projectData.processes.map(p => p.department).filter(d => d))];
      console.log(`🏢 Unique Departments in testSept9b: ${departments.length}`);
      departments.forEach((dept, index) => {
        const count = projectData.processes.filter(p => p.department === dept).length;
        console.log(`   ${index + 1}. "${dept}" (${count} processes)`);
      });
    } else {
      console.log('\n❌ No processes found for testSept9b project');
    }
    
    // Extract dashboard metrics after project switch
    const dashboardMetrics = await page.evaluate(() => {
      const metrics = {};
      
      // Try to get total processes
      const totalProcessesEl = document.querySelector('.metric-content:has(.metric-label:text("Total Processes")) .metric-value');
      if (totalProcessesEl) {
        metrics.totalProcesses = totalProcessesEl.textContent.trim();
      }
      
      // Try to get departments
      const departmentsEl = document.querySelector('.metric-content:has(.metric-label:text("Departments")) .metric-value');
      if (departmentsEl) {
        metrics.departments = departmentsEl.textContent.trim();
      }
      
      // Try to get readiness score
      const readinessEl = document.querySelector('.kpi-card:has(.kpi-title:text("Automation Readiness")) .kpi-value');
      if (readinessEl) {
        metrics.readinessScore = readinessEl.textContent.trim();
      }
      
      // Try to get annual savings
      const savingsEl = document.querySelector('.kpi-card:has(.kpi-title:text("Annual Savings")) .kpi-value');
      if (savingsEl) {
        metrics.annualSavings = savingsEl.textContent.trim();
      }
      
      // Try to get quick wins
      const quickWinsEl = document.querySelector('.kpi-card:has(.kpi-title:text("Quick Win")) .kpi-value');
      if (quickWinsEl) {
        metrics.quickWins = quickWinsEl.textContent.trim();
      }
      
      // Get priority matrix data
      const matrixData = {};
      const quadrants = document.querySelectorAll('.matrix-quadrant');
      quadrants.forEach(quadrant => {
        const title = quadrant.querySelector('.quadrant-info h3')?.textContent?.trim();
        const badge = quadrant.querySelector('.quadrant-badge')?.textContent?.trim();
        
        if (title && badge) {
          const count = parseInt(badge) || 0;
          if (title.includes('Major')) matrixData.major = count;
          else if (title.includes('Quick')) matrixData.quick = count;
          else if (title.includes('Fill')) matrixData.fill = count;
          else if (title.includes('Avoid')) matrixData.avoid = count;
        }
      });
      
      metrics.priorityMatrix = matrixData;
      return metrics;
    });
    
    console.log('\n💰 TESTSEPT9B DASHBOARD METRICS:');
    console.log(`   Total Processes: "${dashboardMetrics.totalProcesses || 'Not Found'}"`);
    console.log(`   Departments: "${dashboardMetrics.departments || 'Not Found'}"`);
    console.log(`   Readiness Score: "${dashboardMetrics.readinessScore || 'Not Found'}"`);
    console.log(`   Annual Savings: "${dashboardMetrics.annualSavings || 'Not Found'}"`);
    console.log(`   Quick Wins: "${dashboardMetrics.quickWins || 'Not Found'}"`);
    
    if (Object.keys(dashboardMetrics.priorityMatrix).length > 0) {
      console.log('\n📊 PRIORITY MATRIX DATA:');
      Object.entries(dashboardMetrics.priorityMatrix).forEach(([key, value]) => {
        console.log(`   ${key}: ${value} processes`);
      });
      const matrixTotal = Object.values(dashboardMetrics.priorityMatrix).reduce((sum, val) => sum + val, 0);
      console.log(`   Total: ${matrixTotal} processes`);
    } else {
      console.log('\n❌ Priority matrix data not found');
    }
    
    // Comprehensive comparison
    console.log('\n📋 PROTOTYPE VS REAL TESTSETP9B COMPARISON:');
    console.log('=' * 60);
    
    const prototype = {
      totalProcesses: 8,
      departments: 3,
      departmentNames: ['Finance', 'Human Resources', 'Operations'],
      priorityMatrix: { major: 2, quick: 3, fill: 2, avoid: 1 },
      readinessScore: '87/100',
      annualSavings: '$2.4M',
      quickWins: '6'
    };
    
    const real = {
      totalProcesses: projectData.processes.length,
      departments: [...new Set(projectData.processes.map(p => p.department).filter(d => d))],
      dashboardMetrics: dashboardMetrics
    };
    
    console.log('\n📊 PROCESS COUNT COMPARISON:');
    console.log(`   Prototype Expected: ${prototype.totalProcesses} processes`);
    console.log(`   Real testSept9b: ${real.totalProcesses} processes`);
    console.log(`   Match: ${real.totalProcesses === prototype.totalProcesses ? '✅ YES' : '❌ NO'}`);
    
    console.log('\n🏢 DEPARTMENT COMPARISON:');
    console.log(`   Prototype Expected: ${prototype.departments} departments`);
    console.log(`   Prototype Names: [${prototype.departmentNames.join(', ')}]`);
    console.log(`   Real testSept9b: ${real.departments.length} departments`);
    console.log(`   Real Names: [${real.departments.join(', ')}]`);
    console.log(`   Count Match: ${real.departments.length === prototype.departments ? '✅ YES' : '❌ NO'}`);
    
    // Check department name matching
    const deptMatches = prototype.departmentNames.map(expectedDept => {
      const found = real.departments.some(realDept => {
        const normalized = realDept.toLowerCase().replace(/[^a-z]/g, '');
        const expectedNormalized = expectedDept.toLowerCase().replace(/[^a-z]/g, '');
        return normalized.includes(expectedNormalized) || expectedNormalized.includes(normalized);
      });
      return { expected: expectedDept, found };
    });
    
    console.log('\n🎯 DEPARTMENT NAME MATCHING:');
    deptMatches.forEach(match => {
      console.log(`   "${match.expected}": ${match.found ? '✅ Found' : '❌ Missing'}`);
    });
    
    console.log('\n💰 BUSINESS METRICS COMPARISON:');
    console.log(`   Readiness Score - Expected: "${prototype.readinessScore}", Real: "${dashboardMetrics.readinessScore || 'Not Found'}"`);
    console.log(`   Annual Savings - Expected: "${prototype.annualSavings}", Real: "${dashboardMetrics.annualSavings || 'Not Found'}"`);
    console.log(`   Quick Wins - Expected: "${prototype.quickWins}", Real: "${dashboardMetrics.quickWins || 'Not Found'}"`);
    
    // Final assessment
    console.log('\n🎯 CRITICAL FINDINGS:');
    console.log('=' * 60);
    
    const findings = [];
    
    if (real.totalProcesses !== prototype.totalProcesses) {
      findings.push(`❌ Process count mismatch: Expected ${prototype.totalProcesses}, found ${real.totalProcesses}`);
    } else {
      findings.push(`✅ Process count matches: ${real.totalProcesses} processes`);
    }
    
    if (real.departments.length !== prototype.departments) {
      findings.push(`❌ Department count mismatch: Expected ${prototype.departments}, found ${real.departments.length}`);
    } else {
      findings.push(`✅ Department count matches: ${real.departments.length} departments`);
    }
    
    const missingDepts = deptMatches.filter(m => !m.found);
    if (missingDepts.length > 0) {
      findings.push(`❌ Missing departments: ${missingDepts.map(m => m.expected).join(', ')}`);
    } else {
      findings.push(`✅ All expected departments found`);
    }
    
    if (!dashboardMetrics.readinessScore || !dashboardMetrics.readinessScore.includes('87')) {
      findings.push(`❌ Readiness score mismatch: Expected "87/100", found "${dashboardMetrics.readinessScore || 'Not Found'}"`);
    } else {
      findings.push(`✅ Readiness score matches expectations`);
    }
    
    findings.forEach(finding => console.log(finding));
    
    console.log('\n📝 RECOMMENDED ACTIONS:');
    if (findings.some(f => f.includes('❌'))) {
      console.log('🔧 Data inconsistencies detected - prototype needs updates');
      console.log('1. Update prototype to match real testSept9b data');
      console.log('2. OR update testSept9b to match prototype assumptions');
      console.log('3. Verify business logic calculations');
    } else {
      console.log('🎉 All data consistent - no actions required');
    }
    
    console.log('\n' + '=' * 60);
    
    // Assertions
    expect(testSept9bProject).toBeDefined();
    expect(projectData.processes).toBeDefined();
    expect(real.totalProcesses).toBeGreaterThanOrEqual(0);
  });
});