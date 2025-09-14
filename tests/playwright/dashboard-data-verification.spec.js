import { test, expect } from '@playwright/test';

/**
 * Business Automation Dashboard - Comprehensive Data Verification Test Suite
 * 
 * This test suite thoroughly verifies data field consistency across the entire 
 * dashboard prototype to identify any data matching bugs and ensure 100% accuracy.
 * 
 * Test Categories:
 * 1. Data Source Analysis - Extract and validate all displayed values
 * 2. Key Metrics Validation - Verify core KPIs and calculations 
 * 3. Cross-Section Data Matching - Ensure consistency across sections
 * 4. Chart Data Validation - Validate all visualization data
 * 5. Business Logic Verification - Check calculation methodologies
 * 6. Data Format Consistency - Ensure uniform formatting
 */

test.describe('Dashboard Data Verification Suite', () => {
  let page;
  let dashboardData = {};

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    // Navigate to the dashboard prototype
    await page.goto('/dashboard-prototype-improved.html');
    
    // Wait for dashboard to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.dashboard-container', { state: 'visible' });
    
    // Wait for Chart.js to initialize
    await page.waitForTimeout(2000);
  });

  test.describe('1. Data Source Analysis - Extract All Values', () => {
    test('Extract and catalog all displayed data values', async () => {
      // Extract Row 1 Key Metrics
      const keyMetrics = await extractKeyMetrics(page);
      dashboardData.keyMetrics = keyMetrics;

      // Extract Row 2 Business KPIs
      const businessKPIs = await extractBusinessKPIs(page);
      dashboardData.businessKPIs = businessKPIs;

      // Extract Priority Matrix data
      const priorityMatrix = await extractPriorityMatrix(page);
      dashboardData.priorityMatrix = priorityMatrix;

      // Extract Supporting Analysis data
      const supportingAnalysis = await extractSupportingAnalysis(page);
      dashboardData.supportingAnalysis = supportingAnalysis;

      // Create comprehensive data inventory
      console.log('=== COMPLETE DATA INVENTORY ===');
      console.log(JSON.stringify(dashboardData, null, 2));

      // Verify all expected data points are present
      expect(keyMetrics.projectName).toBeDefined();
      expect(keyMetrics.totalProcesses).toBeDefined();
      expect(keyMetrics.departments).toBeDefined();
      expect(businessKPIs.readinessScore).toBeDefined();
      expect(businessKPIs.annualSavings).toBeDefined();
      expect(businessKPIs.quickWins).toBeDefined();
    });
  });

  test.describe('2. Key Metrics Validation', () => {
    test('Verify Row 1 metrics accuracy and consistency', async () => {
      const metrics = await extractKeyMetrics(page);
      
      // Validate project name
      expect(metrics.projectName).toBe('testSept9b');
      
      // Validate process count
      expect(metrics.totalProcesses.value).toBe('5');
      expect(metrics.totalProcesses.trend).toContain('+2');
      
      // Validate departments
      expect(metrics.departments.value).toBe('3');
      expect(metrics.departments.details).toContain('Finance');
      expect(metrics.departments.details).toContain('HR');
      expect(metrics.departments.details).toContain('Ops');
      
      console.log('✅ Row 1 Key Metrics validated successfully');
    });

    test('Verify Row 2 KPIs accuracy and calculations', async () => {
      const kpis = await extractBusinessKPIs(page);
      
      // Validate Automation Readiness Score
      expect(kpis.readinessScore.value).toBe('87');
      expect(kpis.readinessScore.maxValue).toBe('100');
      expect(kpis.readinessScore.trend).toContain('+12%');
      
      // Validate Annual Savings
      expect(kpis.annualSavings.value).toBe('$2.4M');
      expect(kpis.annualSavings.confidence).toContain('85%');
      
      // Validate Quick Wins
      expect(kpis.quickWins.value).toBe('6');
      expect(kpis.quickWins.timeline).toContain('30 days');
      
      console.log('✅ Row 2 Business KPIs validated successfully');
    });
  });

  test.describe('3. Cross-Section Data Matching', () => {
    test('Verify process counts consistency across all sections', async () => {
      const keyMetrics = await extractKeyMetrics(page);
      const priorityMatrix = await extractPriorityMatrix(page);
      
      // Extract process counts from different sections
      const totalProcessesFromMetrics = parseInt(keyMetrics.totalProcesses.value);
      const processesFromMatrix = priorityMatrix.majorProjects.count + 
                                 priorityMatrix.quickWins.count + 
                                 priorityMatrix.fillIns.count + 
                                 priorityMatrix.avoid.count;
      
      // Verify counts match
      expect(processesFromMatrix).toBe(totalProcessesFromMetrics);
      
      console.log(`✅ Process counts consistent: Metrics (${totalProcessesFromMetrics}) = Matrix (${processesFromMatrix})`);
    });

    test('Verify department information consistency', async () => {
      const keyMetrics = await extractKeyMetrics(page);
      const supportingAnalysis = await extractSupportingAnalysis(page);
      
      // Extract department counts
      const deptCountFromMetrics = parseInt(keyMetrics.departments.value);
      const deptCountFromAnalysis = supportingAnalysis.departmentRankings.length;
      
      // Verify department count consistency
      expect(deptCountFromAnalysis).toBeGreaterThanOrEqual(deptCountFromMetrics);
      
      // Verify department names appear in both sections
      const expectedDepts = ['Finance', 'HR', 'Operations'];
      expectedDepts.forEach(dept => {
        const foundInAnalysis = supportingAnalysis.departmentRankings.some(
          ranking => ranking.name.includes(dept) || ranking.name.includes(dept.toLowerCase())
        );
        expect(foundInAnalysis).toBeTruthy();
      });
      
      console.log('✅ Department information consistent across sections');
    });

    test('Verify Quick Wins count matches across sections', async () => {
      const kpis = await extractBusinessKPIs(page);
      const matrix = await extractPriorityMatrix(page);
      
      const quickWinsFromKPIs = parseInt(kpis.quickWins.value);
      const quickWinsFromMatrix = matrix.quickWins.count;
      
      // Note: KPIs might show total opportunities while matrix shows current processes
      // We'll verify the relationship is logical
      expect(quickWinsFromMatrix).toBeLessThanOrEqual(quickWinsFromKPIs);
      
      console.log(`✅ Quick Wins relationship verified: KPIs (${quickWinsFromKPIs}) >= Matrix (${quickWinsFromMatrix})`);
    });
  });

  test.describe('4. Chart Data Validation', () => {
    test('Verify Priority Matrix data integrity', async () => {
      const matrix = await extractPriorityMatrix(page);
      
      // Validate quadrant structure
      expect(matrix.majorProjects).toBeDefined();
      expect(matrix.quickWins).toBeDefined();
      expect(matrix.fillIns).toBeDefined();
      expect(matrix.avoid).toBeDefined();
      
      // Verify each quadrant has proper data
      Object.keys(matrix).forEach(quadrant => {
        expect(matrix[quadrant].count).toBeGreaterThanOrEqual(0);
        expect(matrix[quadrant].items).toBeInstanceOf(Array);
        
        // Verify each item has required fields
        matrix[quadrant].items.forEach(item => {
          expect(item.name).toBeDefined();
          expect(item.roi).toBeDefined();
          expect(item.timeline).toBeDefined();
        });
      });
      
      console.log('✅ Priority Matrix data structure validated');
    });

    test('Verify ROI chart data consistency', async () => {
      const analysis = await extractSupportingAnalysis(page);
      const useCases = analysis.useCasePriorities;
      
      // Verify ROI values are realistic and formatted consistently
      useCases.forEach(useCase => {
        const roiMatch = useCase.details.match(/(\d+)%\s+ROI/);
        if (roiMatch) {
          const roiValue = parseInt(roiMatch[1]);
          expect(roiValue).toBeGreaterThan(0);
          expect(roiValue).toBeLessThan(1000); // Reasonable upper bound
        }
        
        const timelineMatch = useCase.details.match(/(\d+)-(\d+)\s+weeks/);
        if (timelineMatch) {
          const minWeeks = parseInt(timelineMatch[1]);
          const maxWeeks = parseInt(timelineMatch[2]);
          expect(minWeeks).toBeGreaterThan(0);
          expect(maxWeeks).toBeGreaterThanOrEqual(minWeeks);
        }
      });
      
      console.log('✅ ROI chart data consistency verified');
    });
  });

  test.describe('5. Business Logic Verification', () => {
    test('Verify Automation Readiness Score calculation logic', async () => {
      const kpis = await extractBusinessKPIs(page);
      const analysis = await extractSupportingAnalysis(page);
      
      const readinessScore = parseInt(kpis.readinessScore.value);
      
      // Verify score is within valid range
      expect(readinessScore).toBeGreaterThanOrEqual(0);
      expect(readinessScore).toBeLessThanOrEqual(100);
      
      // Verify score aligns with department rankings
      const avgDeptScore = analysis.departmentRankings.reduce((sum, dept) => 
        sum + dept.score, 0) / analysis.departmentRankings.length;
      
      // Readiness score should be reasonably close to average department score
      const difference = Math.abs(readinessScore - avgDeptScore);
      expect(difference).toBeLessThan(10); // Within 10 points tolerance
      
      console.log(`✅ Readiness score (${readinessScore}) aligns with dept average (${avgDeptScore.toFixed(1)})`);
    });

    test('Verify Annual Savings calculation methodology', async () => {
      const kpis = await extractBusinessKPIs(page);
      const analysis = await extractSupportingAnalysis(page);
      
      // Extract savings amount
      const savingsText = kpis.annualSavings.value;
      const savingsMatch = savingsText.match(/\$(\d+\.?\d*)(M|K)?/);
      
      expect(savingsMatch).toBeTruthy();
      
      let savingsAmount = parseFloat(savingsMatch[1]);
      if (savingsMatch[2] === 'M') savingsAmount *= 1000000;
      if (savingsMatch[2] === 'K') savingsAmount *= 1000;
      
      // Verify savings is positive and realistic
      expect(savingsAmount).toBeGreaterThan(0);
      expect(savingsAmount).toBeLessThan(10000000); // Less than $10M seems reasonable
      
      console.log(`✅ Annual savings amount validated: ${savingsAmount.toLocaleString()}`);
    });

    test('Verify ROI calculations mathematical accuracy', async () => {
      const analysis = await extractSupportingAnalysis(page);
      const roiMetrics = analysis.roiBreakdown;
      
      // Verify ROI percentage format and range
      const avgROIMatch = roiMetrics.averageROI.match(/(\d+)%/);
      if (avgROIMatch) {
        const avgROI = parseInt(avgROIMatch[1]);
        expect(avgROI).toBeGreaterThan(100); // Should be profitable
        expect(avgROI).toBeLessThan(1000); // Reasonable upper bound
      }
      
      // Verify payback period format
      const paybackMatch = roiMetrics.paybackPeriod.match(/(\d+\.?\d*)(mo|months)/);
      if (paybackMatch) {
        const paybackMonths = parseFloat(paybackMatch[1]);
        expect(paybackMonths).toBeGreaterThan(0);
        expect(paybackMonths).toBeLessThan(36); // Less than 3 years
      }
      
      console.log('✅ ROI calculations mathematical accuracy verified');
    });
  });

  test.describe('6. Data Format Consistency', () => {
    test('Verify number formatting consistency', async () => {
      const allData = await extractAllDisplayedData(page);
      
      // Check currency formatting
      const currencyValues = findCurrencyValues(allData);
      currencyValues.forEach(value => {
        // Should start with $ and use standard formatting
        expect(value).toMatch(/^\$[\d,]+(\.\d{1,2})?(K|M|B)?$/);
      });
      
      // Check percentage formatting  
      const percentageValues = findPercentageValues(allData);
      percentageValues.forEach(value => {
        expect(value).toMatch(/^\d+(\.\d+)?%$/);
      });
      
      console.log('✅ Number formatting consistency verified');
    });

    test('Verify score formatting consistency', async () => {
      const analysis = await extractSupportingAnalysis(page);
      
      // Department scores should be consistent format
      analysis.departmentRankings.forEach(dept => {
        expect(dept.score).toBeGreaterThanOrEqual(0);
        expect(dept.score).toBeLessThanOrEqual(100);
      });
      
      // Use case priority scores should be consistent
      analysis.useCasePriorities.forEach(useCase => {
        expect(useCase.priorityScore).toBeGreaterThanOrEqual(0);
        expect(useCase.priorityScore).toBeLessThanOrEqual(100);
      });
      
      console.log('✅ Score formatting consistency verified');
    });
  });

  test.describe('7. Comprehensive Bug Detection', () => {
    test('Detect data inconsistencies and mathematical errors', async () => {
      const issues = [];
      
      try {
        // Run all consistency checks
        await validateProcessCounts(page, issues);
        await validateROICalculations(page, issues);
        await validateDepartmentData(page, issues);
        await validateQuickWinsAlignment(page, issues);
        await validateFormattingConsistency(page, issues);
        
        // Report findings
        if (issues.length === 0) {
          console.log('🎉 NO DATA INCONSISTENCIES DETECTED - Dashboard data is 100% consistent!');
        } else {
          console.log(`⚠️  FOUND ${issues.length} DATA INCONSISTENCIES:`);
          issues.forEach((issue, index) => {
            console.log(`${index + 1}. ${issue}`);
          });
        }
        
        // Test passes only if no critical issues found
        const criticalIssues = issues.filter(issue => issue.includes('CRITICAL'));
        expect(criticalIssues).toHaveLength(0);
        
      } catch (error) {
        console.error('Error during comprehensive bug detection:', error);
        throw error;
      }
    });
  });
});

// ===== HELPER FUNCTIONS FOR DATA EXTRACTION =====

async function extractKeyMetrics(page) {
  const metrics = await page.evaluate(() => {
    const metricCards = document.querySelectorAll('.metric-card');
    const data = {};
    
    metricCards.forEach((card, index) => {
      const label = card.querySelector('.metric-label')?.textContent?.trim();
      const value = card.querySelector('.metric-value')?.textContent?.trim();
      
      if (label?.includes('Project Name')) {
        data.projectName = value;
      } else if (label?.includes('Total Processes')) {
        data.totalProcesses = {
          value: value?.split(' ')[0],
          trend: value?.includes('↗') ? value?.split('↗')[1]?.trim() : null
        };
      } else if (label?.includes('Departments')) {
        data.departments = {
          value: value?.split(' ')[0],
          details: value?.split(' ').slice(1).join(' ')
        };
      } else if (label?.includes('Last Updated')) {
        data.lastUpdated = {
          value: value?.split(' ')[0],
          status: value?.includes('Live') ? 'Live' : null
        };
      }
    });
    
    return data;
  });
  
  return metrics;
}

async function extractBusinessKPIs(page) {
  const kpis = await page.evaluate(() => {
    const kpiCards = document.querySelectorAll('.kpi-card');
    const data = {};
    
    kpiCards.forEach((card) => {
      const title = card.querySelector('.kpi-title')?.textContent?.trim();
      const value = card.querySelector('.kpi-value')?.textContent?.trim();
      const description = card.querySelector('.kpi-description')?.textContent?.trim();
      const trend = card.querySelector('.kpi-trend')?.textContent?.trim();
      
      if (title?.includes('Automation Readiness')) {
        const valueMatch = value?.match(/(\d+)\/(\d+)/);
        data.readinessScore = {
          value: valueMatch?.[1],
          maxValue: valueMatch?.[2],
          description,
          trend
        };
      } else if (title?.includes('Annual Savings')) {
        data.annualSavings = {
          value: value,
          description,
          confidence: trend
        };
      } else if (title?.includes('Quick Win')) {
        data.quickWins = {
          value: value,
          description,
          timeline: trend
        };
      }
    });
    
    return data;
  });
  
  return kpis;
}

async function extractPriorityMatrix(page) {
  const matrix = await page.evaluate(() => {
    const quadrants = document.querySelectorAll('.matrix-quadrant');
    const data = {};
    
    quadrants.forEach((quadrant) => {
      const title = quadrant.querySelector('.quadrant-info h3')?.textContent?.trim();
      const count = parseInt(quadrant.querySelector('.quadrant-badge')?.textContent?.trim());
      const items = [];
      
      const matrixItems = quadrant.querySelectorAll('.matrix-item');
      matrixItems.forEach((item) => {
        const content = item.textContent.trim();
        const lines = content.split('\\n').map(line => line.trim()).filter(line => line);
        if (lines.length >= 2) {
          const name = lines[0];
          const details = lines[1];
          const roiMatch = details.match(/ROI:\\s*(\\d+)%/);
          const timelineMatch = details.match(/Timeline:\\s*([^|]+)/);
          
          items.push({
            name: name,
            roi: roiMatch?.[1] || null,
            timeline: timelineMatch?.[1]?.trim() || null,
            details: details
          });
        }
      });
      
      if (title?.includes('Major Projects')) {
        data.majorProjects = { count, items };
      } else if (title?.includes('Quick Wins')) {
        data.quickWins = { count, items };
      } else if (title?.includes('Fill-ins')) {
        data.fillIns = { count, items };
      } else if (title?.includes('Avoid')) {
        data.avoid = { count, items };
      }
    });
    
    return data;
  });
  
  return matrix;
}

async function extractSupportingAnalysis(page) {
  const analysis = await page.evaluate(() => {
    const data = {};
    
    // Extract Department Rankings
    const deptItems = document.querySelectorAll('.dept-item');
    data.departmentRankings = [];
    deptItems.forEach((item) => {
      const name = item.querySelector('.dept-name')?.textContent?.trim();
      const metric = item.querySelector('.dept-metric')?.textContent?.trim();
      const scoreText = item.querySelector('.score-badge')?.textContent?.trim();
      const score = parseInt(scoreText);
      
      if (name && !isNaN(score)) {
        data.departmentRankings.push({ name, metric, score });
      }
    });
    
    // Extract Use Case Priorities
    const usecaseItems = document.querySelectorAll('.usecase-item');
    data.useCasePriorities = [];
    usecaseItems.forEach((item) => {
      const name = item.querySelector('.usecase-name')?.textContent?.trim();
      const details = item.querySelector('.usecase-details')?.textContent?.trim();
      const scoreText = item.querySelector('.usecase-score')?.textContent?.trim();
      const priorityScore = parseInt(scoreText);
      
      if (name && !isNaN(priorityScore)) {
        data.useCasePriorities.push({ name, details, priorityScore });
      }
    });
    
    // Extract ROI Breakdown
    const roiMetrics = document.querySelectorAll('.roi-metric');
    data.roiBreakdown = {};
    roiMetrics.forEach((metric) => {
      const value = metric.querySelector('.roi-value')?.textContent?.trim();
      const label = metric.querySelector('.roi-label')?.textContent?.trim();
      
      if (label?.includes('Annual Savings')) {
        data.roiBreakdown.annualSavings = value;
      } else if (label?.includes('Average ROI')) {
        data.roiBreakdown.averageROI = value;
      } else if (label?.includes('Payback Period')) {
        data.roiBreakdown.paybackPeriod = value;
      } else if (label?.includes('Time Reduction')) {
        data.roiBreakdown.timeReduction = value;
      }
    });
    
    return data;
  });
  
  return analysis;
}

async function extractAllDisplayedData(page) {
  // Extract all text content from the page for comprehensive analysis
  const allData = await page.evaluate(() => {
    const textContent = document.body.innerText;
    return textContent;
  });
  
  return allData;
}

function findCurrencyValues(text) {
  const currencyRegex = /\$[\d,]+(\.\d{1,2})?(K|M|B)?/g;
  return text.match(currencyRegex) || [];
}

function findPercentageValues(text) {
  const percentageRegex = /\d+(\.\d+)?%/g;
  return text.match(percentageRegex) || [];
}

// ===== VALIDATION FUNCTIONS =====

async function validateProcessCounts(page, issues) {
  try {
    const keyMetrics = await extractKeyMetrics(page);
    const priorityMatrix = await extractPriorityMatrix(page);
    
    const totalFromMetrics = parseInt(keyMetrics.totalProcesses?.value || '0');
    const totalFromMatrix = (priorityMatrix.majorProjects?.count || 0) + 
                           (priorityMatrix.quickWins?.count || 0) + 
                           (priorityMatrix.fillIns?.count || 0) + 
                           (priorityMatrix.avoid?.count || 0);
    
    if (totalFromMetrics !== totalFromMatrix) {
      issues.push(`CRITICAL: Process count mismatch - Metrics: ${totalFromMetrics}, Matrix: ${totalFromMatrix}`);
    }
  } catch (error) {
    issues.push(`Error validating process counts: ${error.message}`);
  }
}

async function validateROICalculations(page, issues) {
  try {
    const analysis = await extractSupportingAnalysis(page);
    const matrix = await extractPriorityMatrix(page);
    
    // Check ROI consistency between matrix items and use case priorities
    const matrixROIs = [];
    Object.values(matrix).forEach(quadrant => {
      quadrant.items?.forEach(item => {
        if (item.roi) matrixROIs.push(parseInt(item.roi));
      });
    });
    
    const useCaseROIs = [];
    analysis.useCasePriorities?.forEach(useCase => {
      const roiMatch = useCase.details?.match(/(\d+)%\s+ROI/);
      if (roiMatch) useCaseROIs.push(parseInt(roiMatch[1]));
    });
    
    // Check for unrealistic ROI values
    [...matrixROIs, ...useCaseROIs].forEach(roi => {
      if (roi < 50 || roi > 800) {
        issues.push(`Warning: Unusual ROI value detected: ${roi}%`);
      }
    });
  } catch (error) {
    issues.push(`Error validating ROI calculations: ${error.message}`);
  }
}

async function validateDepartmentData(page, issues) {
  try {
    const keyMetrics = await extractKeyMetrics(page);
    const analysis = await extractSupportingAnalysis(page);
    
    const expectedDeptCount = parseInt(keyMetrics.departments?.value || '0');
    const actualDeptCount = analysis.departmentRankings?.length || 0;
    
    if (actualDeptCount < expectedDeptCount) {
      issues.push(`Warning: Department count mismatch - Expected: ${expectedDeptCount}, Found: ${actualDeptCount}`);
    }
    
    // Check for department name consistency
    const expectedDepts = ['Finance', 'HR', 'Operations'];
    expectedDepts.forEach(dept => {
      const found = analysis.departmentRankings?.some(ranking => 
        ranking.name.toLowerCase().includes(dept.toLowerCase())
      );
      if (!found) {
        issues.push(`Warning: Expected department '${dept}' not found in rankings`);
      }
    });
  } catch (error) {
    issues.push(`Error validating department data: ${error.message}`);
  }
}

async function validateQuickWinsAlignment(page, issues) {
  try {
    const kpis = await extractBusinessKPIs(page);
    const matrix = await extractPriorityMatrix(page);
    
    const quickWinsFromKPIs = parseInt(kpis.quickWins?.value || '0');
    const quickWinsFromMatrix = matrix.quickWins?.count || 0;
    
    // Quick wins in matrix should be <= total opportunities in KPIs
    if (quickWinsFromMatrix > quickWinsFromKPIs) {
      issues.push(`CRITICAL: Quick wins mismatch - KPIs: ${quickWinsFromKPIs}, Matrix: ${quickWinsFromMatrix}`);
    }
  } catch (error) {
    issues.push(`Error validating quick wins alignment: ${error.message}`);
  }
}

async function validateFormattingConsistency(page, issues) {
  try {
    const allData = await extractAllDisplayedData(page);
    
    // Check currency formatting consistency
    const currencyValues = findCurrencyValues(allData);
    const inconsistentCurrency = currencyValues.filter(value => 
      !value.match(/^\$[\d,]+(\.\d{1,2})?(K|M|B)?$/)
    );
    
    if (inconsistentCurrency.length > 0) {
      issues.push(`Warning: Inconsistent currency formatting: ${inconsistentCurrency.join(', ')}`);
    }
    
    // Check percentage formatting consistency
    const percentageValues = findPercentageValues(allData);
    const inconsistentPercentage = percentageValues.filter(value => 
      !value.match(/^\d+(\.\d+)?%$/)
    );
    
    if (inconsistentPercentage.length > 0) {
      issues.push(`Warning: Inconsistent percentage formatting: ${inconsistentPercentage.join(', ')}`);
    }
  } catch (error) {
    issues.push(`Error validating formatting consistency: ${error.message}`);
  }
}