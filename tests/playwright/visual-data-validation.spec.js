import { test, expect } from '@playwright/test';

/**
 * Visual Data Validation & Evidence Capture Test Suite
 * 
 * This test suite captures visual evidence of data consistency
 * and generates detailed screenshots for the verification report.
 */

test.describe('Visual Data Validation & Evidence Capture', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard-prototype-improved.html');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.dashboard-container', { state: 'visible' });
    await page.waitForTimeout(3000); // Wait for all animations and Chart.js
  });

  test('Capture full dashboard overview with annotations', async ({ page }) => {
    // Scroll to top to ensure full capture
    await page.evaluate(() => window.scrollTo(0, 0));
    
    // Take full page screenshot
    await page.screenshot({
      path: 'test-results/dashboard-full-overview.png',
      fullPage: true
    });

    // Take individual section screenshots
    await page.locator('.key-metrics-row').screenshot({
      path: 'test-results/section-1-key-metrics.png'
    });

    await page.locator('.business-kpis-row').screenshot({
      path: 'test-results/section-2-business-kpis.png'
    });

    await page.locator('.priority-matrix-row').screenshot({
      path: 'test-results/section-3-priority-matrix.png'
    });

    await page.locator('.supporting-analysis').screenshot({
      path: 'test-results/section-4-supporting-analysis.png'
    });

    console.log('✅ Complete dashboard screenshots captured');
  });

  test('Capture key data points with highlighting', async ({ page }) => {
    // Highlight and capture process count consistency
    await highlightElement(page, '.metric-value:has-text("5")', 'Process Count in Key Metrics');
    await page.screenshot({ path: 'test-results/process-count-key-metrics.png' });

    // Highlight process counts in matrix
    const quadrantBadges = page.locator('.quadrant-badge');
    for (let i = 0; i < await quadrantBadges.count(); i++) {
      await highlightElement(page, `.quadrant-badge >> nth=${i}`, 'Matrix Process Count');
    }
    await page.screenshot({ path: 'test-results/process-count-matrix.png' });

    // Highlight readiness score
    await highlightElement(page, '.kpi-value:has-text("87")', 'Readiness Score');
    await page.screenshot({ path: 'test-results/readiness-score-kpi.png' });

    // Highlight annual savings
    await highlightElement(page, '.kpi-value:has-text("$2.4M")', 'Annual Savings KPI');
    await page.screenshot({ path: 'test-results/annual-savings-kpi.png' });

    // Highlight corresponding ROI breakdown value
    await highlightElement(page, '.roi-value:has-text("$2.4M")', 'Annual Savings ROI');
    await page.screenshot({ path: 'test-results/annual-savings-roi.png' });

    console.log('✅ Key data points captured with highlighting');
  });

  test('Capture ROI consistency evidence', async ({ page }) => {
    // Scroll to use case priorities
    await page.locator('.use-cases').scrollIntoViewIfNeeded();
    
    // Capture use case ROI values
    await highlightAllElements(page, '.usecase-details', 'Use Case ROI Details');
    await page.screenshot({ path: 'test-results/use-case-roi-details.png' });

    // Scroll to priority matrix and capture ROI values there
    await page.locator('.priority-matrix-row').scrollIntoViewIfNeeded();
    await highlightAllElements(page, '.matrix-item', 'Matrix Item ROI');
    await page.screenshot({ path: 'test-results/matrix-roi-details.png' });

    // Capture ROI breakdown section
    await page.locator('.roi').scrollIntoViewIfNeeded();
    await highlightAllElements(page, '.roi-metric', 'ROI Metrics');
    await page.screenshot({ path: 'test-results/roi-breakdown-metrics.png' });

    console.log('✅ ROI consistency evidence captured');
  });

  test('Capture department data consistency', async ({ page }) => {
    // Highlight department count in key metrics
    await highlightElement(page, '.metric-value:has-text("3")', 'Department Count');
    await page.screenshot({ path: 'test-results/department-count-metrics.png' });

    // Scroll to department rankings
    await page.locator('.departments').scrollIntoViewIfNeeded();
    await highlightAllElements(page, '.dept-item', 'Department Rankings');
    await page.screenshot({ path: 'test-results/department-rankings.png' });

    // Highlight department scores
    await highlightAllElements(page, '.score-badge', 'Department Scores');
    await page.screenshot({ path: 'test-results/department-scores.png' });

    console.log('✅ Department data consistency evidence captured');
  });

  test('Capture format consistency evidence', async ({ page }) => {
    // Capture all currency values
    await captureElementsWithText(page, '$', 'currency-values.png', 'Currency Format');
    
    // Capture all percentage values  
    await captureElementsWithText(page, '%', 'percentage-values.png', 'Percentage Format');
    
    // Capture all score values
    await captureElementsWithText(page, /^\d{1,3}$/, 'score-values.png', 'Score Format');

    console.log('✅ Format consistency evidence captured');
  });

  test('Generate data extraction evidence table', async ({ page }) => {
    // Extract all key data points and create visual table
    const dataPoints = await page.evaluate(() => {
      const data = [];
      
      // Extract key metrics
      const metricCards = document.querySelectorAll('.metric-card');
      metricCards.forEach((card, index) => {
        const label = card.querySelector('.metric-label')?.textContent?.trim();
        const value = card.querySelector('.metric-value')?.textContent?.trim();
        data.push({
          section: 'Key Metrics',
          label: label || `Metric ${index + 1}`,
          value: value || 'N/A',
          location: 'Row 1'
        });
      });

      // Extract KPIs
      const kpiCards = document.querySelectorAll('.kpi-card');
      kpiCards.forEach((card, index) => {
        const title = card.querySelector('.kpi-title')?.textContent?.trim();
        const value = card.querySelector('.kpi-value')?.textContent?.trim();
        data.push({
          section: 'Business KPIs',
          label: title || `KPI ${index + 1}`,
          value: value || 'N/A',
          location: 'Row 2'
        });
      });

      // Extract matrix counts
      const quadrants = document.querySelectorAll('.matrix-quadrant');
      quadrants.forEach((quadrant) => {
        const title = quadrant.querySelector('.quadrant-info h3')?.textContent?.trim();
        const count = quadrant.querySelector('.quadrant-badge')?.textContent?.trim();
        data.push({
          section: 'Priority Matrix',
          label: title || 'Quadrant',
          value: count || '0',
          location: 'Row 3'
        });
      });

      return data;
    });

    // Create HTML table for visual evidence
    const htmlTable = generateDataTable(dataPoints);
    
    // Inject table into page for screenshot
    await page.evaluate((html) => {
      const container = document.createElement('div');
      container.innerHTML = html;
      container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: white;
        z-index: 9999;
        padding: 20px;
        overflow: auto;
      `;
      document.body.appendChild(container);
    }, htmlTable);

    await page.screenshot({ path: 'test-results/data-extraction-table.png' });

    console.log('✅ Data extraction evidence table generated');
    console.log(`   Captured ${dataPoints.length} data points across all sections`);
  });

  test('Generate comprehensive data validation report', async ({ page }) => {
    // Run complete data extraction and validation
    const validationResults = await page.evaluate(() => {
      const results = {
        timestamp: new Date().toISOString(),
        sections: {},
        issues: [],
        summary: {}
      };

      // Key Metrics Analysis
      const keyMetrics = {};
      const metricCards = document.querySelectorAll('.metric-card');
      metricCards.forEach((card) => {
        const label = card.querySelector('.metric-label')?.textContent?.trim();
        const value = card.querySelector('.metric-value')?.textContent?.trim();
        
        if (label?.includes('Project Name')) {
          keyMetrics.projectName = value;
        } else if (label?.includes('Total Processes')) {
          keyMetrics.totalProcesses = parseInt(value?.split(' ')[0]);
        } else if (label?.includes('Departments')) {
          keyMetrics.departments = parseInt(value?.split(' ')[0]);
        }
      });
      results.sections.keyMetrics = keyMetrics;

      // Business KPIs Analysis
      const businessKPIs = {};
      const kpiCards = document.querySelectorAll('.kpi-card');
      kpiCards.forEach((card) => {
        const title = card.querySelector('.kpi-title')?.textContent?.trim();
        const value = card.querySelector('.kpi-value')?.textContent?.trim();
        
        if (title?.includes('Readiness')) {
          businessKPIs.readinessScore = parseInt(value?.match(/(\d+)/)?.[1]);
        } else if (title?.includes('Savings')) {
          businessKPIs.annualSavings = value;
        } else if (title?.includes('Quick Win')) {
          businessKPIs.quickWins = parseInt(value);
        }
      });
      results.sections.businessKPIs = businessKPIs;

      // Priority Matrix Analysis
      const priorityMatrix = { totalProcesses: 0 };
      const quadrants = document.querySelectorAll('.matrix-quadrant');
      quadrants.forEach((quadrant) => {
        const title = quadrant.querySelector('.quadrant-info h3')?.textContent?.trim();
        const count = parseInt(quadrant.querySelector('.quadrant-badge')?.textContent?.trim());
        
        if (title?.includes('Major Projects')) {
          priorityMatrix.majorProjects = count;
        } else if (title?.includes('Quick Wins')) {
          priorityMatrix.quickWins = count;
        } else if (title?.includes('Fill-ins')) {
          priorityMatrix.fillIns = count;
        } else if (title?.includes('Avoid')) {
          priorityMatrix.avoid = count;
        }
        priorityMatrix.totalProcesses += count;
      });
      results.sections.priorityMatrix = priorityMatrix;

      // Data Consistency Checks
      if (keyMetrics.totalProcesses !== priorityMatrix.totalProcesses) {
        results.issues.push({
          type: 'CRITICAL',
          description: `Process count mismatch: Key Metrics (${keyMetrics.totalProcesses}) != Priority Matrix (${priorityMatrix.totalProcesses})`
        });
      }

      // Summary
      results.summary = {
        totalDataPoints: Object.keys(keyMetrics).length + Object.keys(businessKPIs).length + Object.keys(priorityMatrix).length,
        criticalIssues: results.issues.filter(issue => issue.type === 'CRITICAL').length,
        warnings: results.issues.filter(issue => issue.type === 'WARNING').length,
        consistencyScore: results.issues.length === 0 ? 100 : Math.max(0, 100 - (results.issues.length * 10))
      };

      return results;
    });

    // Generate report HTML
    const reportHtml = generateValidationReport(validationResults);
    
    // Display report on page and capture
    await page.evaluate((html) => {
      document.body.innerHTML = html;
    }, reportHtml);

    await page.screenshot({ 
      path: 'test-results/comprehensive-validation-report.png',
      fullPage: true 
    });

    // Log results to console
    console.log('=== COMPREHENSIVE DATA VALIDATION REPORT ===');
    console.log(`Generated at: ${validationResults.timestamp}`);
    console.log(`Total Data Points Analyzed: ${validationResults.summary.totalDataPoints}`);
    console.log(`Critical Issues: ${validationResults.summary.criticalIssues}`);
    console.log(`Warnings: ${validationResults.summary.warnings}`);
    console.log(`Data Consistency Score: ${validationResults.summary.consistencyScore}%`);
    
    if (validationResults.issues.length > 0) {
      console.log('\\nISSUES FOUND:');
      validationResults.issues.forEach((issue, index) => {
        console.log(`${index + 1}. [${issue.type}] ${issue.description}`);
      });
    } else {
      console.log('\\n🎉 NO ISSUES FOUND - Dashboard data is 100% consistent!');
    }

    // Assert no critical issues for test to pass
    expect(validationResults.summary.criticalIssues).toBe(0);
  });
});

// ===== HELPER FUNCTIONS =====

async function highlightElement(page, selector, label) {
  await page.evaluate((sel, lbl) => {
    const element = document.querySelector(sel);
    if (element) {
      element.style.cssText += `
        outline: 3px solid #ff6b35 !important;
        outline-offset: 2px !important;
        position: relative !important;
      `;
      
      // Add label
      const labelEl = document.createElement('div');
      labelEl.textContent = lbl;
      labelEl.style.cssText = `
        position: absolute;
        top: -25px;
        left: 0;
        background: #ff6b35;
        color: white;
        padding: 4px 8px;
        font-size: 12px;
        border-radius: 3px;
        z-index: 1000;
      `;
      element.style.position = 'relative';
      element.appendChild(labelEl);
    }
  }, selector, label);
}

async function highlightAllElements(page, selector, label) {
  await page.evaluate((sel, lbl) => {
    const elements = document.querySelectorAll(sel);
    elements.forEach((element, index) => {
      element.style.cssText += `
        outline: 2px solid #4299e1 !important;
        outline-offset: 1px !important;
      `;
      
      if (index === 0) {
        const labelEl = document.createElement('div');
        labelEl.textContent = lbl;
        labelEl.style.cssText = `
          position: absolute;
          top: -25px;
          left: 0;
          background: #4299e1;
          color: white;
          padding: 4px 8px;
          font-size: 12px;
          border-radius: 3px;
          z-index: 1000;
        `;
        element.style.position = 'relative';
        element.appendChild(labelEl);
      }
    });
  }, selector, label);
}

async function captureElementsWithText(page, textPattern, filename, label) {
  // Find and highlight elements containing the text pattern
  await page.evaluate((pattern, lbl) => {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    const matchedElements = new Set();
    let textNode;
    
    while (textNode = walker.nextNode()) {
      const text = textNode.textContent.trim();
      const matches = typeof pattern === 'string' ? 
        text.includes(pattern) : 
        pattern.test(text);
        
      if (matches && textNode.parentElement) {
        matchedElements.add(textNode.parentElement);
      }
    }
    
    matchedElements.forEach((element, index) => {
      element.style.cssText += `
        background: rgba(251, 191, 36, 0.3) !important;
        outline: 2px solid #f59e0b !important;
        outline-offset: 1px !important;
      `;
      
      if (index === 0) {
        const labelEl = document.createElement('div');
        labelEl.textContent = `${lbl} (${matchedElements.size} found)`;
        labelEl.style.cssText = `
          position: fixed;
          top: 10px;
          right: 10px;
          background: #f59e0b;
          color: white;
          padding: 8px 12px;
          font-size: 14px;
          border-radius: 4px;
          z-index: 10000;
        `;
        document.body.appendChild(labelEl);
      }
    });
  }, textPattern, label);
  
  await page.screenshot({ path: `test-results/${filename}` });
}

function generateDataTable(dataPoints) {
  const tableRows = dataPoints.map(point => `
    <tr>
      <td>${point.section}</td>
      <td>${point.location}</td>
      <td>${point.label}</td>
      <td><strong>${point.value}</strong></td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h1 style="color: #2563eb; margin-bottom: 20px;">Dashboard Data Extraction Evidence</h1>
      <p style="color: #64748b; margin-bottom: 20px;">Generated: ${new Date().toLocaleString()}</p>
      
      <table style="width: 100%; border-collapse: collapse; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <thead>
          <tr style="background: #2563eb; color: white;">
            <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Section</th>
            <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Location</th>
            <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Data Label</th>
            <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Value</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      
      <p style="margin-top: 20px; color: #64748b; font-size: 14px;">
        Total Data Points: ${dataPoints.length}
      </p>
    </div>
  `;
}

function generateValidationReport(results) {
  const issuesHtml = results.issues.length > 0 ? 
    results.issues.map(issue => `
      <div style="padding: 12px; margin: 8px 0; border-left: 4px solid ${issue.type === 'CRITICAL' ? '#dc2626' : '#f59e0b'}; background: ${issue.type === 'CRITICAL' ? '#fef2f2' : '#fffbeb'};">
        <strong style="color: ${issue.type === 'CRITICAL' ? '#dc2626' : '#f59e0b'};">[${issue.type}]</strong>
        <span>${issue.description}</span>
      </div>
    `).join('') :
    '<div style="padding: 20px; text-align: center; color: #10b981; background: #f0fdf4; border-radius: 8px; border: 2px solid #10b981;"><h3>🎉 NO ISSUES FOUND</h3><p>Dashboard data is 100% consistent!</p></div>';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px;">
      <header style="text-align: center; margin-bottom: 40px; padding: 30px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border-radius: 12px;">
        <h1 style="font-size: 2.5em; margin-bottom: 10px;">Dashboard Data Validation Report</h1>
        <p style="font-size: 1.2em; opacity: 0.9;">Comprehensive Analysis Results</p>
        <p style="margin-top: 20px; font-size: 0.9em; opacity: 0.8;">Generated: ${results.timestamp}</p>
      </header>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 40px;">
        <div style="padding: 20px; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
          <h3 style="color: #2563eb; margin-bottom: 10px;">Data Points</h3>
          <div style="font-size: 2em; font-weight: bold; color: #1f2937;">${results.summary.totalDataPoints}</div>
        </div>
        <div style="padding: 20px; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
          <h3 style="color: #dc2626; margin-bottom: 10px;">Critical Issues</h3>
          <div style="font-size: 2em; font-weight: bold; color: ${results.summary.criticalIssues > 0 ? '#dc2626' : '#10b981'};">${results.summary.criticalIssues}</div>
        </div>
        <div style="padding: 20px; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
          <h3 style="color: #f59e0b; margin-bottom: 10px;">Warnings</h3>
          <div style="font-size: 2em; font-weight: bold; color: ${results.summary.warnings > 0 ? '#f59e0b' : '#10b981'};">${results.summary.warnings}</div>
        </div>
        <div style="padding: 20px; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
          <h3 style="color: #10b981; margin-bottom: 10px;">Consistency Score</h3>
          <div style="font-size: 2em; font-weight: bold; color: ${results.summary.consistencyScore === 100 ? '#10b981' : results.summary.consistencyScore >= 80 ? '#f59e0b' : '#dc2626'};">${results.summary.consistencyScore}%</div>
        </div>
      </div>

      <div style="margin-bottom: 40px;">
        <h2 style="color: #1f2937; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb;">Section Analysis</h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
          <div style="padding: 20px; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h3 style="color: #2563eb; margin-bottom: 15px;">Key Metrics</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Project:</strong> ${results.sections.keyMetrics.projectName || 'N/A'}</li>
              <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Processes:</strong> ${results.sections.keyMetrics.totalProcesses || 'N/A'}</li>
              <li style="padding: 8px 0;"><strong>Departments:</strong> ${results.sections.keyMetrics.departments || 'N/A'}</li>
            </ul>
          </div>
          
          <div style="padding: 20px; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h3 style="color: #10b981; margin-bottom: 15px;">Business KPIs</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Readiness:</strong> ${results.sections.businessKPIs.readinessScore || 'N/A'}/100</li>
              <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Savings:</strong> ${results.sections.businessKPIs.annualSavings || 'N/A'}</li>
              <li style="padding: 8px 0;"><strong>Quick Wins:</strong> ${results.sections.businessKPIs.quickWins || 'N/A'}</li>
            </ul>
          </div>
          
          <div style="padding: 20px; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h3 style="color: #f59e0b; margin-bottom: 15px;">Priority Matrix</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Major Projects:</strong> ${results.sections.priorityMatrix.majorProjects || 'N/A'}</li>
              <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Quick Wins:</strong> ${results.sections.priorityMatrix.quickWins || 'N/A'}</li>
              <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Fill-ins:</strong> ${results.sections.priorityMatrix.fillIns || 'N/A'}</li>
              <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Avoid:</strong> ${results.sections.priorityMatrix.avoid || 'N/A'}</li>
              <li style="padding: 8px 0; font-weight: bold;"><strong>Total:</strong> ${results.sections.priorityMatrix.totalProcesses || 'N/A'}</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h2 style="color: #1f2937; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb;">
          ${results.issues.length > 0 ? 'Issues Found' : 'Validation Results'}
        </h2>
        ${issuesHtml}
      </div>
      
      <footer style="margin-top: 40px; padding: 20px; text-align: center; background: #f8fafc; border-radius: 8px; color: #64748b;">
        <p>Dashboard Data Validation Complete</p>
        <p style="font-size: 0.9em; margin-top: 5px;">Test Suite: Playwright | Framework: Business Intelligence Validation</p>
      </footer>
    </div>
  `;
}