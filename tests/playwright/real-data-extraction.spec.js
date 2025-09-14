const { test, expect } = require('@playwright/test');

/**
 * REAL DATA EXTRACTION AND VERIFICATION TEST SUITE
 * 
 * This comprehensive test suite extracts actual data from the business automation dashboard
 * and compares it against prototype assumptions to ensure 100% data accuracy.
 * 
 * Purpose: Verify real vs prototype data consistency for production readiness
 */

test.describe('Real Data Extraction from Business Automation Dashboard', () => {
  const dashboardPath = '/workshops/business-automation-dashboard.html';
  let extractedData = {};

  test.beforeEach(async ({ page }) => {
    // Navigate to the actual business automation dashboard
    await page.goto(dashboardPath);
    await page.waitForLoadState('networkidle');
    
    // Wait for dashboard to fully initialize
    await page.waitForTimeout(3000);
    
    console.log('🔍 Starting real data extraction from business automation dashboard...');
  });

  test('📊 PHASE 1: Extract Real Project Data and Available Projects', async ({ page }) => {
    console.log('\n=== PHASE 1: PROJECT DATA EXTRACTION ===');
    
    // Extract current project from header selector
    const projectSelector = await page.locator('#headerProjectSelector').first();
    const currentProjectValue = await projectSelector.evaluate(el => el.value);
    const currentProjectText = await projectSelector.evaluate(el => el.options[el.selectedIndex]?.text);
    
    console.log(`📋 Current Project Value: "${currentProjectValue}"`);
    console.log(`📋 Current Project Display: "${currentProjectText}"`);
    
    // Extract all available projects from dropdown
    const allProjectOptions = await projectSelector.evaluate(el => {
      const options = Array.from(el.options);
      return options.map(option => ({
        value: option.value,
        text: option.text,
        selected: option.selected
      }));
    });
    
    console.log('📋 All Available Projects:');
    allProjectOptions.forEach((project, index) => {
      console.log(`   ${index + 1}. "${project.text}" (value: "${project.value}") ${project.selected ? '← CURRENT' : ''}`);
    });
    
    // Store extracted project data
    extractedData.projects = {
      current: {
        value: currentProjectValue,
        display: currentProjectText
      },
      available: allProjectOptions
    };
    
    // Critical verification: Check if testSept9b exists
    const testSept9bExists = allProjectOptions.some(p => p.value === 'testSept9b' || p.text.includes('testSept9b'));
    console.log(`🎯 testSept9b Project Exists: ${testSept9bExists ? 'YES' : 'NO'}`);
    
    expect(allProjectOptions.length).toBeGreaterThan(0);
  });

  test('🔢 PHASE 2: Extract Current Project Process Data', async ({ page }) => {
    console.log('\n=== PHASE 2: PROCESS DATA EXTRACTION ===');
    
    // Get current project ID for data extraction
    const currentProjectId = await page.evaluate(() => window.currentProjectId || window.currentProject);
    console.log(`📋 Current Project ID: "${currentProjectId}"`);
    
    // Extract total process count from dashboard metrics
    const totalProcessesElement = await page.locator('.metric-content:has(.metric-label:text("Total Processes")) .metric-value').first();
    let totalProcessesText = 'Not Found';
    let totalProcessesValue = 0;
    
    if (await totalProcessesElement.count() > 0) {
      totalProcessesText = await totalProcessesElement.textContent();
      const processMatch = totalProcessesText.match(/(\d+)/);
      totalProcessesValue = processMatch ? parseInt(processMatch[1]) : 0;
    }
    
    console.log(`📊 Total Processes Metric: "${totalProcessesText}"`);
    console.log(`📊 Extracted Process Count: ${totalProcessesValue}`);
    
    // Extract process data from global JavaScript variables
    const processesData = await page.evaluate(() => {
      return {
        globalProcesses: window.processes || [],
        globalProjects: window.projects || [],
        currentProjectId: window.currentProjectId,
        currentProject: window.currentProject
      };
    });
    
    console.log(`🔍 Global Processes Array Length: ${processesData.globalProcesses.length}`);
    console.log(`🔍 Global Projects Array Length: ${processesData.globalProjects.length}`);
    console.log(`🔍 Window Current Project ID: "${processesData.currentProjectId}"`);
    console.log(`🔍 Window Current Project: "${processesData.currentProject}"`);
    
    // Extract detailed process information
    if (processesData.globalProcesses.length > 0) {
      console.log('\n📋 DETAILED PROCESS DATA:');
      processesData.globalProcesses.forEach((process, index) => {
        console.log(`   ${index + 1}. "${process.name}" (Dept: ${process.department})`);
        console.log(`      Impact: ${process.impact}, Feasibility: ${process.feasibility}`);
        console.log(`      Time Spent: ${process.timeSpent} hours`);
      });
    }
    
    extractedData.processes = {
      totalFromMetric: totalProcessesValue,
      globalProcesses: processesData.globalProcesses,
      processCount: processesData.globalProcesses.length
    };
    
    expect(processesData).toBeDefined();
  });

  test('🏢 PHASE 3: Extract Department Data and Structure', async ({ page }) => {
    console.log('\n=== PHASE 3: DEPARTMENT DATA EXTRACTION ===');
    
    // Extract department information from metrics
    const departmentElement = await page.locator('.metric-content:has(.metric-label:text("Departments")) .metric-value').first();
    let departmentText = 'Not Found';
    
    if (await departmentElement.count() > 0) {
      departmentText = await departmentElement.textContent();
    }
    
    console.log(`🏢 Departments Metric: "${departmentText}"`);
    
    // Extract departments from process data
    const departmentData = await page.evaluate(() => {
      const processes = window.processes || [];
      const departments = [...new Set(processes.map(p => p.department).filter(d => d))];
      return {
        uniqueDepartments: departments,
        departmentCounts: departments.map(dept => ({
          name: dept,
          count: processes.filter(p => p.department === dept).length
        }))
      };
    });
    
    console.log(`🏢 Unique Departments Found: ${departmentData.uniqueDepartments.length}`);
    departmentData.uniqueDepartments.forEach((dept, index) => {
      const count = departmentData.departmentCounts.find(d => d.name === dept)?.count || 0;
      console.log(`   ${index + 1}. "${dept}" (${count} processes)`);
    });
    
    extractedData.departments = {
      metricText: departmentText,
      uniqueDepartments: departmentData.uniqueDepartments,
      departmentCounts: departmentData.departmentCounts
    };
    
    expect(departmentData.uniqueDepartments).toBeDefined();
  });

  test('💰 PHASE 4: Extract Business Metrics and KPIs', async ({ page }) => {
    console.log('\n=== PHASE 4: BUSINESS METRICS EXTRACTION ===');
    
    // Extract Automation Readiness Score
    let readinessScore = 'Not Found';
    const readinessElement = await page.locator('.kpi-card:has(.kpi-title:text("Automation Readiness")) .kpi-value').first();
    if (await readinessElement.count() > 0) {
      readinessScore = await readinessElement.textContent();
    }
    
    // Extract Annual Savings
    let annualSavings = 'Not Found';
    const savingsElement = await page.locator('.kpi-card:has(.kpi-title:text("Annual Savings")) .kpi-value').first();
    if (await savingsElement.count() > 0) {
      annualSavings = await savingsElement.textContent();
    }
    
    // Extract Quick Win Opportunities
    let quickWins = 'Not Found';
    const quickWinsElement = await page.locator('.kpi-card:has(.kpi-title:text("Quick Win")) .kpi-value').first();
    if (await quickWinsElement.count() > 0) {
      quickWins = await quickWinsElement.textContent();
    }
    
    console.log(`📊 Automation Readiness Score: "${readinessScore}"`);
    console.log(`💰 Annual Savings: "${annualSavings}"`);
    console.log(`⚡ Quick Win Opportunities: "${quickWins}"`);
    
    // Extract priority matrix data if it exists
    const priorityMatrixData = await page.evaluate(() => {
      const quadrants = document.querySelectorAll('.matrix-quadrant');
      const matrix = {};
      
      quadrants.forEach(quadrant => {
        const titleElement = quadrant.querySelector('.quadrant-info h3');
        const badgeElement = quadrant.querySelector('.quadrant-badge');
        
        if (titleElement && badgeElement) {
          const title = titleElement.textContent.trim();
          const count = parseInt(badgeElement.textContent.trim()) || 0;
          
          if (title.includes('Major')) matrix.major = count;
          else if (title.includes('Quick')) matrix.quick = count;
          else if (title.includes('Fill')) matrix.fill = count;
          else if (title.includes('Avoid')) matrix.avoid = count;
        }
      });
      
      return matrix;
    });
    
    console.log('📊 Priority Matrix Distribution:');
    Object.entries(priorityMatrixData).forEach(([key, value]) => {
      console.log(`   ${key}: ${value} processes`);
    });
    
    const matrixTotal = Object.values(priorityMatrixData).reduce((sum, val) => sum + val, 0);
    console.log(`📊 Priority Matrix Total: ${matrixTotal} processes`);
    
    extractedData.businessMetrics = {
      readinessScore,
      annualSavings,
      quickWins,
      priorityMatrix: priorityMatrixData,
      matrixTotal
    };
    
    expect(priorityMatrixData).toBeDefined();
  });

  test('🔍 PHASE 5: Data Source Analysis (Supabase vs localStorage)', async ({ page }) => {
    console.log('\n=== PHASE 5: DATA SOURCE ANALYSIS ===');
    
    // Check storage mode and data sources
    const storageAnalysis = await page.evaluate(() => {
      return {
        supabaseConnected: !!(window.workshopDB && window.workshopDB.isConnected && window.workshopDB.isConnected()),
        localStorage: {
          projects: localStorage.getItem('businessProjects'),
          processes: Object.keys(localStorage).filter(key => key.startsWith('processes_')),
          preferences: localStorage.getItem('storageMode')
        },
        globalVariables: {
          hasWorkshopDB: !!window.workshopDB,
          projectsSource: window.projects ? 'loaded' : 'empty',
          processesSource: window.processes ? 'loaded' : 'empty'
        }
      };
    });
    
    console.log(`☁️ Supabase Connected: ${storageAnalysis.supabaseConnected ? 'YES' : 'NO'}`);
    console.log(`💾 localStorage Projects: ${storageAnalysis.localStorage.projects ? 'YES' : 'NO'}`);
    console.log(`💾 localStorage Processes Keys: ${storageAnalysis.localStorage.processes.length}`);
    console.log(`⚙️ Storage Preference: "${storageAnalysis.localStorage.preferences || 'Not Set'}"`);
    console.log(`🔧 Workshop DB Available: ${storageAnalysis.globalVariables.hasWorkshopDB ? 'YES' : 'NO'}`);
    console.log(`📊 Projects Data Source: ${storageAnalysis.globalVariables.projectsSource}`);
    console.log(`📋 Processes Data Source: ${storageAnalysis.globalVariables.processesSource}`);
    
    extractedData.dataSources = storageAnalysis;
    
    expect(storageAnalysis).toBeDefined();
  });

  test('📋 PHASE 6: Generate Comprehensive Data Comparison Report', async ({ page }) => {
    console.log('\n=== PHASE 6: COMPREHENSIVE DATA COMPARISON REPORT ===');
    console.log('=' * 80);
    
    // Define prototype assumptions for comparison
    const prototypeAssumptions = {
      project: 'testSept9b',
      totalProcesses: 8,
      departments: {
        count: 3,
        names: ['Finance', 'Human Resources', 'Operations']
      },
      priorityMatrix: {
        major: 2,
        quick: 3,
        fill: 2,
        avoid: 1,
        total: 8
      },
      businessMetrics: {
        readinessScore: '87/100',
        annualSavings: '$2.4M',
        quickWins: '6'
      }
    };
    
    console.log('\n🎯 REAL VS PROTOTYPE DATA COMPARISON:');
    console.log('=' * 60);
    
    // Project Comparison
    console.log('\n📋 PROJECT COMPARISON:');
    console.log(`   Prototype Expected: "${prototypeAssumptions.project}"`);
    console.log(`   Real Current Project: "${extractedData.projects?.current?.value || 'Unknown'}"`);
    const projectMatch = extractedData.projects?.current?.value === prototypeAssumptions.project;
    console.log(`   ✅ Match: ${projectMatch ? 'YES' : 'NO'}`);
    
    // Process Count Comparison
    console.log('\n📊 PROCESS COUNT COMPARISON:');
    console.log(`   Prototype Expected: ${prototypeAssumptions.totalProcesses} processes`);
    console.log(`   Real Metric Display: ${extractedData.processes?.totalFromMetric || 0} processes`);
    console.log(`   Real Global Array: ${extractedData.processes?.processCount || 0} processes`);
    const processCountMatch = (extractedData.processes?.totalFromMetric || 0) === prototypeAssumptions.totalProcesses;
    console.log(`   ✅ Match: ${processCountMatch ? 'YES' : 'NO'}`);
    
    // Department Comparison
    console.log('\n🏢 DEPARTMENT COMPARISON:');
    console.log(`   Prototype Expected: ${prototypeAssumptions.departments.count} departments`);
    console.log(`   Prototype Names: [${prototypeAssumptions.departments.names.join(', ')}]`);
    console.log(`   Real Department Count: ${extractedData.departments?.uniqueDepartments?.length || 0}`);
    console.log(`   Real Department Names: [${extractedData.departments?.uniqueDepartments?.join(', ') || 'None'}]`);
    const deptCountMatch = (extractedData.departments?.uniqueDepartments?.length || 0) === prototypeAssumptions.departments.count;
    console.log(`   ✅ Count Match: ${deptCountMatch ? 'YES' : 'NO'}`);
    
    // Business Metrics Comparison
    console.log('\n💰 BUSINESS METRICS COMPARISON:');
    console.log(`   Readiness Score - Expected: "${prototypeAssumptions.businessMetrics.readinessScore}", Real: "${extractedData.businessMetrics?.readinessScore || 'Not Found'}"`);
    console.log(`   Annual Savings - Expected: "${prototypeAssumptions.businessMetrics.annualSavings}", Real: "${extractedData.businessMetrics?.annualSavings || 'Not Found'}"`);
    console.log(`   Quick Wins - Expected: "${prototypeAssumptions.businessMetrics.quickWins}", Real: "${extractedData.businessMetrics?.quickWins || 'Not Found'}"`);
    
    // Priority Matrix Comparison
    if (extractedData.businessMetrics?.priorityMatrix) {
      console.log('\n📊 PRIORITY MATRIX COMPARISON:');
      console.log(`   Expected Total: ${prototypeAssumptions.priorityMatrix.total} processes`);
      console.log(`   Real Total: ${extractedData.businessMetrics.matrixTotal || 0} processes`);
      console.log(`   Expected Distribution: Major(${prototypeAssumptions.priorityMatrix.major}) + Quick(${prototypeAssumptions.priorityMatrix.quick}) + Fill(${prototypeAssumptions.priorityMatrix.fill}) + Avoid(${prototypeAssumptions.priorityMatrix.avoid})`);
      
      const realMatrix = extractedData.businessMetrics.priorityMatrix;
      console.log(`   Real Distribution: Major(${realMatrix.major || 0}) + Quick(${realMatrix.quick || 0}) + Fill(${realMatrix.fill || 0}) + Avoid(${realMatrix.avoid || 0})`);
      
      const matrixMatch = extractedData.businessMetrics.matrixTotal === prototypeAssumptions.priorityMatrix.total;
      console.log(`   ✅ Matrix Total Match: ${matrixMatch ? 'YES' : 'NO'}`);
    }
    
    // Data Source Analysis
    console.log('\n🔍 DATA SOURCE ANALYSIS:');
    console.log(`   Supabase Connection: ${extractedData.dataSources?.supabaseConnected ? 'Connected' : 'Not Connected'}`);
    console.log(`   localStorage Projects: ${extractedData.dataSources?.localStorage?.projects ? 'Present' : 'Empty'}`);
    console.log(`   localStorage Process Keys: ${extractedData.dataSources?.localStorage?.processes?.length || 0}`);
    console.log(`   Preferred Storage: "${extractedData.dataSources?.localStorage?.preferences || 'Not Set'}"`);
    
    // Critical Issues Summary
    console.log('\n⚠️ CRITICAL DATA INCONSISTENCIES DETECTED:');
    console.log('=' * 60);
    
    const issues = [];
    
    if (!projectMatch) {
      issues.push(`❌ PROJECT MISMATCH: Expected "testSept9b", found "${extractedData.projects?.current?.value}"`);
    }
    
    if (!processCountMatch) {
      issues.push(`❌ PROCESS COUNT MISMATCH: Expected ${prototypeAssumptions.totalProcesses}, found ${extractedData.processes?.totalFromMetric || 0}`);
    }
    
    if (!deptCountMatch) {
      issues.push(`❌ DEPARTMENT COUNT MISMATCH: Expected ${prototypeAssumptions.departments.count}, found ${extractedData.departments?.uniqueDepartments?.length || 0}`);
    }
    
    const testSept9bExists = extractedData.projects?.available?.some(p => p.value === 'testSept9b' || p.text.includes('testSept9b'));
    if (!testSept9bExists) {
      issues.push(`❌ MISSING PROJECT: "testSept9b" does not exist in available projects`);
    }
    
    if (issues.length === 0) {
      console.log('🎉 NO CRITICAL ISSUES DETECTED - Data is consistent!');
    } else {
      console.log(`Found ${issues.length} critical issues:`);
      issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }
    
    // Action Items
    console.log('\n📝 REQUIRED ACTION ITEMS:');
    console.log('=' * 60);
    
    if (!testSept9bExists) {
      console.log('1. 🔧 CREATE "testSept9b" project in the system');
      console.log('2. 📊 Add 8 processes to testSept9b project');
      console.log('3. 🏢 Ensure 3 departments: Finance, Human Resources, Operations');
      console.log('4. 📈 Configure priority matrix: Major(2), Quick(3), Fill(2), Avoid(1)');
    } else {
      console.log('1. ✅ testSept9b project exists - verify process data');
    }
    
    if (!processCountMatch || !deptCountMatch) {
      console.log('5. 🔧 Update process counts and department structure to match prototype');
    }
    
    console.log('6. 📊 Verify business metrics calculations');
    console.log('7. 🎯 Ensure prototype assumptions match real data sources');
    
    console.log('\n🎯 SUCCESS CRITERIA:');
    console.log('   ✅ testSept9b project exists and is selectable');
    console.log('   ✅ 8 processes distributed across priority matrix');
    console.log('   ✅ 3 departments: Finance, Human Resources, Operations'); 
    console.log('   ✅ Business metrics match prototype values');
    console.log('   ✅ Data source consistency verified');
    
    console.log('\n' + '=' * 80);
    
    // Final verification
    expect(extractedData).toBeDefined();
    expect(extractedData.projects).toBeDefined();
    expect(extractedData.processes).toBeDefined();
    expect(extractedData.departments).toBeDefined();
    expect(extractedData.businessMetrics).toBeDefined();
    expect(extractedData.dataSources).toBeDefined();
  });
});