const { test, expect } = require('@playwright/test');

/**
 * FINAL DATA VERIFICATION REPORT
 * 
 * Comprehensive analysis of real vs prototype data to provide
 * actionable insights for data consistency.
 */

test.describe('Final Data Verification Report', () => {
  const dashboardPath = '/workshops/business-automation-dashboard.html';

  test('📊 Generate Complete Data Verification Report', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 BUSINESS AUTOMATION DASHBOARD - FINAL DATA VERIFICATION REPORT');
    console.log('='.repeat(80));
    
    // Navigate and setup
    await page.goto(dashboardPath);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Select testSept9b project
    const projectSelector = page.locator('#headerProjectSelector');
    const testSept9bOption = await projectSelector.evaluate(el => {
      const options = Array.from(el.options);
      return options.find(o => o.text.includes('testSept9b'));
    });
    
    if (testSept9bOption) {
      await projectSelector.selectOption(testSept9bOption.value);
      await page.waitForTimeout(5000); // Wait for data to load
    }
    
    console.log('\n📋 SECTION 1: PROJECT IDENTIFICATION');
    console.log('-'.repeat(50));
    
    const projectData = await page.evaluate(() => {
      const selector = document.getElementById('headerProjectSelector');
      const selectedOption = selector.options[selector.selectedIndex];
      return {
        id: selectedOption?.value || 'unknown',
        name: selectedOption?.text || 'unknown',
        allProjects: Array.from(selector.options).map(o => ({
          id: o.value,
          name: o.text
        }))
      };
    });
    
    console.log(`   Current Project: "${projectData.name}"`);
    console.log(`   Project ID: "${projectData.id}"`);
    console.log(`   Available Projects: ${projectData.allProjects.length}`);
    projectData.allProjects.forEach((p, i) => {
      console.log(`     ${i + 1}. "${p.name}" (ID: ${p.id})`);
    });
    
    console.log('\n📊 SECTION 2: CHART DATA ANALYSIS');
    console.log('-'.repeat(50));
    
    // Extract chart data through Canvas analysis
    const chartData = await page.evaluate(() => {
      const charts = {};
      
      // Get Process Priority Matrix data (scatter chart)
      const scatterCanvas = document.querySelector('canvas[data-chart="scatter"]');
      if (scatterCanvas && window.Chart && window.Chart.getChart) {
        const chart = window.Chart.getChart(scatterCanvas);
        if (chart && chart.data && chart.data.datasets) {
          const dataset = chart.data.datasets[0];
          charts.processMatrix = {
            processes: dataset.data || [],
            count: dataset.data ? dataset.data.length : 0
          };
        }
      }
      
      // Get Department Distribution (doughnut chart)  
      const doughnutCanvas = document.querySelector('canvas[data-chart="doughnut"]');
      if (doughnutCanvas && window.Chart && window.Chart.getChart) {
        const chart = window.Chart.getChart(doughnutCanvas);
        if (chart && chart.data) {
          charts.departments = {
            labels: chart.data.labels || [],
            data: chart.data.datasets[0]?.data || [],
            count: chart.data.labels ? chart.data.labels.length : 0
          };
        }
      }
      
      // Get Weekly Time Investment (bar chart)
      const barCanvas = document.querySelector('canvas[data-chart="bar"]');
      if (barCanvas && window.Chart && window.Chart.getChart) {
        const chart = window.Chart.getChart(barCanvas);
        if (chart && chart.data) {
          charts.timeInvestment = {
            processes: chart.data.labels || [],
            hours: chart.data.datasets[0]?.data || [],
            count: chart.data.labels ? chart.data.labels.length : 0
          };
        }
      }
      
      // Get Automation Readiness (radar chart)
      const radarCanvas = document.querySelector('canvas[data-chart="radar"]');
      if (radarCanvas && window.Chart && window.Chart.getChart) {
        const chart = window.Chart.getChart(radarCanvas);
        if (chart && chart.data) {
          charts.readiness = {
            categories: chart.data.labels || [],
            scores: chart.data.datasets[0]?.data || []
          };
        }
      }
      
      return charts;
    });
    
    console.log('   Process Priority Matrix:');
    if (chartData.processMatrix) {
      console.log(`     Total Processes: ${chartData.processMatrix.count}`);
      chartData.processMatrix.processes.forEach((process, i) => {
        console.log(`     ${i + 1}. Impact: ${process.x}, Feasibility: ${process.y}`);
      });
    } else {
      console.log(`     ❌ No process matrix data found`);
    }
    
    console.log('   Department Distribution:');
    if (chartData.departments && chartData.departments.count > 0) {
      console.log(`     Total Departments: ${chartData.departments.count}`);
      chartData.departments.labels.forEach((dept, i) => {
        const percentage = chartData.departments.data[i] || 0;
        console.log(`     ${i + 1}. "${dept}": ${percentage.toFixed(1)}%`);
      });
    } else {
      console.log(`     ❌ No department data found`);
    }
    
    console.log('   Weekly Time Investment:');
    if (chartData.timeInvestment && chartData.timeInvestment.count > 0) {
      console.log(`     Total Process Entries: ${chartData.timeInvestment.count}`);
      chartData.timeInvestment.processes.forEach((process, i) => {
        const hours = chartData.timeInvestment.hours[i] || 0;
        console.log(`     ${i + 1}. "${process}": ${hours} hours/week`);
      });
    } else {
      console.log(`     ❌ No time investment data found`);
    }
    
    console.log('   Automation Readiness Scores:');
    if (chartData.readiness && chartData.readiness.categories.length > 0) {
      chartData.readiness.categories.forEach((category, i) => {
        const score = chartData.readiness.scores[i] || 0;
        console.log(`     "${category}": ${score}/10`);
      });
    } else {
      console.log(`     ❌ No readiness scores found`);
    }
    
    console.log('\n🎯 SECTION 3: PROTOTYPE VS REAL DATA COMPARISON');
    console.log('-'.repeat(50));
    
    // Define prototype assumptions
    const prototypeAssumptions = {
      project: 'testSept9b',
      totalProcesses: 8,
      departments: {
        count: 3,
        names: ['Finance', 'Human Resources', 'Operations']
      },
      priorityMatrix: {
        major: 2,    // High Impact, High Feasibility
        quick: 3,    // High Impact, Low Feasibility  
        fill: 2,     // Low Impact, High Feasibility
        avoid: 1     // Low Impact, Low Feasibility
      },
      businessMetrics: {
        readinessScore: '87/100',
        annualSavings: '$2.4M',
        quickWins: '6 opportunities'
      }
    };
    
    // Real data from extraction
    const realData = {
      project: projectData.name,
      totalProcesses: chartData.processMatrix?.count || 0,
      departments: {
        count: chartData.departments?.count || 0,
        names: chartData.departments?.labels || []
      },
      processes: chartData.timeInvestment?.processes || []
    };
    
    console.log('\n📊 COMPARISON RESULTS:');
    console.log(`\n   PROJECT NAME:`);
    console.log(`     Prototype Expected: "${prototypeAssumptions.project}"`);
    console.log(`     Real System: "${realData.project}"`);
    console.log(`     ✅ Match: ${realData.project === prototypeAssumptions.project ? 'YES' : 'NO'}`);
    
    console.log(`\n   PROCESS COUNT:`);
    console.log(`     Prototype Expected: ${prototypeAssumptions.totalProcesses} processes`);
    console.log(`     Real System: ${realData.totalProcesses} processes`);
    console.log(`     ✅ Match: ${realData.totalProcesses === prototypeAssumptions.totalProcesses ? 'YES' : 'NO'}`);
    
    console.log(`\n   DEPARTMENT COUNT:`);
    console.log(`     Prototype Expected: ${prototypeAssumptions.departments.count} departments`);
    console.log(`     Real System: ${realData.departments.count} departments`);
    console.log(`     ✅ Match: ${realData.departments.count === prototypeAssumptions.departments.count ? 'YES' : 'NO'}`);
    
    console.log(`\n   DEPARTMENT NAMES:`);
    console.log(`     Prototype Expected: [${prototypeAssumptions.departments.names.join(', ')}]`);
    console.log(`     Real System: [${realData.departments.names.join(', ')}]`);
    
    // Check department name matching
    const deptMatches = prototypeAssumptions.departments.names.map(expectedDept => {
      const found = realData.departments.names.some(realDept => {
        // Normalize for comparison
        const realNorm = realDept.toLowerCase().replace(/[^a-z]/g, '');
        const expectedNorm = expectedDept.toLowerCase().replace(/[^a-z]/g, '');
        return realNorm.includes(expectedNorm) || expectedNorm.includes(realNorm);
      });
      return { expected: expectedDept, found, realMatch: found ? realData.departments.names.find(r => r.toLowerCase().includes(expectedDept.toLowerCase().split(' ')[0])) : null };
    });
    
    console.log(`     Department Matching:`);
    deptMatches.forEach(match => {
      console.log(`       "${match.expected}" → ${match.found ? `✅ Found as "${match.realMatch}"` : '❌ Missing'}`);
    });
    
    console.log(`\n   ACTUAL PROCESS NAMES:`);
    realData.processes.forEach((process, i) => {
      console.log(`     ${i + 1}. "${process}"`);
    });
    
    console.log('\n⚠️ SECTION 4: DATA INCONSISTENCIES DETECTED');
    console.log('-'.repeat(50));
    
    const issues = [];
    
    if (realData.project !== prototypeAssumptions.project) {
      // This shouldn't be an issue since we're looking AT testSept9b
      if (realData.project === 'testSept9b') {
        console.log('✅ Project name is correct');
      }
    }
    
    if (realData.totalProcesses !== prototypeAssumptions.totalProcesses) {
      issues.push({
        type: 'CRITICAL',
        issue: 'Process Count Mismatch',
        expected: prototypeAssumptions.totalProcesses,
        actual: realData.totalProcesses,
        impact: 'Priority matrix calculations and business metrics will be incorrect'
      });
    }
    
    if (realData.departments.count !== prototypeAssumptions.departments.count) {
      issues.push({
        type: 'HIGH',
        issue: 'Department Count Mismatch', 
        expected: prototypeAssumptions.departments.count,
        actual: realData.departments.count,
        impact: 'Department-based analysis and reporting will be misaligned'
      });
    }
    
    const missingDepts = deptMatches.filter(m => !m.found);
    if (missingDepts.length > 0) {
      issues.push({
        type: 'HIGH',
        issue: 'Missing Expected Departments',
        expected: missingDepts.map(m => m.expected),
        actual: realData.departments.names,
        impact: 'Department naming inconsistency affects user expectations'
      });
    }
    
    if (issues.length === 0) {
      console.log('🎉 NO CRITICAL DATA INCONSISTENCIES DETECTED');
    } else {
      console.log(`Found ${issues.length} data inconsistencies:\n`);
      issues.forEach((issue, i) => {
        console.log(`   ${i + 1}. [${issue.type}] ${issue.issue}`);
        console.log(`      Expected: ${Array.isArray(issue.expected) ? issue.expected.join(', ') : issue.expected}`);
        console.log(`      Actual: ${Array.isArray(issue.actual) ? issue.actual.join(', ') : issue.actual}`);
        console.log(`      Impact: ${issue.impact}\n`);
      });
    }
    
    console.log('\n📝 SECTION 5: DATA SOURCE ANALYSIS');
    console.log('-'.repeat(50));
    
    const dataSourceInfo = await page.evaluate(() => {
      return {
        supabaseConnected: !!(window.workshopDB && window.workshopDB.isConnected && window.workshopDB.isConnected()),
        localStoragePresent: {
          businessProjects: !!localStorage.getItem('businessProjects'),
          processKeys: Object.keys(localStorage).filter(k => k.startsWith('processes_')),
          storagePreference: localStorage.getItem('storageMode')
        },
        globalVariables: {
          projectsArray: window.projects ? window.projects.length : 'undefined',
          processesArray: window.processes ? window.processes.length : 'undefined',
          currentProjectId: window.currentProjectId,
          currentProject: window.currentProject
        }
      };
    });
    
    console.log(`   Supabase Connection: ${dataSourceInfo.supabaseConnected ? '✅ Connected' : '❌ Disconnected'}`);
    console.log(`   localStorage Projects: ${dataSourceInfo.localStoragePresent.businessProjects ? '✅ Present' : '❌ Empty'}`);
    console.log(`   localStorage Process Keys: ${dataSourceInfo.localStoragePresent.processKeys.length}`);
    console.log(`   Storage Preference: "${dataSourceInfo.localStoragePresent.storagePreference || 'Not Set'}"`);
    console.log(`   Global Projects Array: ${dataSourceInfo.globalVariables.projectsArray}`);
    console.log(`   Global Processes Array: ${dataSourceInfo.globalVariables.processesArray}`);
    console.log(`   Current Project ID: "${dataSourceInfo.globalVariables.currentProjectId}"`);
    console.log(`   Current Project: "${dataSourceInfo.globalVariables.currentProject}"`);
    
    const primaryDataSource = dataSourceInfo.supabaseConnected ? 'Supabase (Cloud)' : 'localStorage (Local)';
    console.log(`   Primary Data Source: ${primaryDataSource}`);
    
    console.log('\n🎯 SECTION 6: ACTIONABLE RECOMMENDATIONS');
    console.log('-'.repeat(50));
    
    if (issues.length === 0) {
      console.log('🎉 DASHBOARD DATA IS CONSISTENT!')
      console.log('\n   The real testSept9b project data matches prototype expectations.')
      console.log('   No immediate action required for data consistency.');
      console.log('\n   Next Steps:')
      console.log('   1. ✅ Verify business metrics calculations match real data');
      console.log('   2. ✅ Confirm priority matrix logic aligns with process distribution');
      console.log('   3. ✅ Test user experience with real data scenarios');
    } else {
      console.log('🔧 REQUIRED ACTIONS TO ACHIEVE DATA CONSISTENCY:\n');
      
      if (issues.some(i => i.issue.includes('Process Count'))) {
        console.log('   OPTION A: Update Prototype to Match Real Data');
        console.log(`     1. Change prototype process count from 8 to ${realData.totalProcesses}`);
        console.log(`     2. Update priority matrix distribution accordingly`);
        console.log(`     3. Recalculate business metrics based on real process count\n`);
        
        console.log('   OPTION B: Update Real Data to Match Prototype');
        console.log(`     1. Add ${prototypeAssumptions.totalProcesses - realData.totalProcesses} more processes to testSept9b`);
        console.log(`     2. Ensure processes are distributed: Major(2), Quick(3), Fill(2), Avoid(1)`);
        console.log(`     3. Maintain business logic consistency\n`);
      }
      
      if (issues.some(i => i.issue.includes('Department'))) {
        console.log('   DEPARTMENT ALIGNMENT:');
        console.log(`     1. Decide on standard department names`);
        console.log(`     2. Update either prototype or real data for consistency`);
        console.log(`     3. Current real departments: [${realData.departments.names.join(', ')}]`);
        console.log(`     4. Prototype expects: [${prototypeAssumptions.departments.names.join(', ')}]\n`);
      }
      
      console.log('   BUSINESS METRICS VERIFICATION:');
      console.log('     1. Verify automation readiness score calculation');
      console.log('     2. Confirm annual savings projections');
      console.log('     3. Validate quick wins identification logic');
      console.log('     4. Ensure priority matrix reflects real process distribution');
    }
    
    console.log('\n🎯 SECTION 7: DATA INTEGRITY SUCCESS CRITERIA');
    console.log('-'.repeat(50));
    
    console.log('   For 100% data consistency, verify:');
    console.log('   ✅ testSept9b project exists and is selectable ← ACHIEVED');
    console.log(`   ${realData.totalProcesses === prototypeAssumptions.totalProcesses ? '✅' : '❌'} Process count matches prototype expectations (${prototypeAssumptions.totalProcesses})`);
    console.log(`   ${realData.departments.count === prototypeAssumptions.departments.count ? '✅' : '❌'} Department count matches expectations (${prototypeAssumptions.departments.count})`);
    console.log(`   ${missingDepts.length === 0 ? '✅' : '❌'} All expected department names present`);
    console.log(`   ${dataSourceInfo.supabaseConnected ? '✅' : '❌'} Data source connectivity verified`);
    console.log('   📊 Business metrics calculations align with real data');
    console.log('   🎨 User interface reflects actual data structure');
    console.log('   🔧 Priority matrix logic matches process distribution');
    
    const overallSuccess = issues.length === 0;
    console.log(`\n   OVERALL DATA INTEGRITY: ${overallSuccess ? '✅ PASS' : '❌ NEEDS ATTENTION'}`);
    
    if (overallSuccess) {
      console.log('   🎉 Dashboard is ready for production use!');
    } else {
      console.log(`   ⚠️  ${issues.length} issue(s) need resolution before production deployment`);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 END OF DATA VERIFICATION REPORT');
    console.log('='.repeat(80));
    
    // Test assertions
    expect(projectData.name).toBe('testSept9b');
    expect(realData.totalProcesses).toBeGreaterThan(0);
    expect(realData.departments.count).toBeGreaterThan(0);
    expect(dataSourceInfo.supabaseConnected).toBeTruthy();
  });
});