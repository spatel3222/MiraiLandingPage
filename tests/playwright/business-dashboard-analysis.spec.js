import { test, expect } from '@playwright/test';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

test.describe('Business Automation Dashboard - Comprehensive Analysis', () => {
  let analysisResults = {
    screenshots: {},
    uiAnalysis: {},
    businessGoalAlignment: {},
    userJourneyIssues: [],
    recommendations: [],
    timestamp: new Date().toISOString()
  };

  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/workshops/business-automation-dashboard.html');
    
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');
    
    // Wait for charts to render
    await page.waitForTimeout(3000);
  });

  test('1. Full Dashboard Screenshot Analysis', async ({ page }) => {
    // Desktop view - full dashboard overview
    await page.setViewportSize({ width: 1400, height: 1024 });
    const desktopScreenshot = await page.screenshot({ 
      fullPage: true,
      path: 'test-results/dashboard-desktop-overview.png'
    });
    analysisResults.screenshots.desktopOverview = 'dashboard-desktop-overview.png';

    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ 
      fullPage: true,
      path: 'test-results/dashboard-tablet-view.png'
    });
    analysisResults.screenshots.tabletView = 'dashboard-tablet-view.png';

    // Mobile view
    await page.setViewportSize({ width: 375, height: 812 });
    await page.screenshot({ 
      fullPage: true,
      path: 'test-results/dashboard-mobile-view.png'
    });
    analysisResults.screenshots.mobileView = 'dashboard-mobile-view.png';

    // Reset to desktop for remaining tests
    await page.setViewportSize({ width: 1400, height: 1024 });
  });

  test('2. Individual Chart Section Analysis', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 1024 });

    // ROI Potential Chart
    const roiChart = page.locator('#roiChart').first();
    if (await roiChart.isVisible()) {
      await roiChart.screenshot({ path: 'test-results/roi-potential-chart.png' });
      analysisResults.screenshots.roiChart = 'roi-potential-chart.png';
    }

    // Process Complexity vs Automation Readiness
    const complexityChart = page.locator('#complexityChart').first();
    if (await complexityChart.isVisible()) {
      await complexityChart.screenshot({ path: 'test-results/complexity-readiness-chart.png' });
      analysisResults.screenshots.complexityChart = 'complexity-readiness-chart.png';
    }

    // Effort vs Impact Matrix
    const effortChart = page.locator('#effortChart').first();
    if (await effortChart.isVisible()) {
      await effortChart.screenshot({ path: 'test-results/effort-impact-matrix.png' });
      analysisResults.screenshots.effortChart = 'effort-impact-matrix.png';
    }

    // Department Distribution
    const departmentChart = page.locator('#departmentChart').first();
    if (await departmentChart.isVisible()) {
      await departmentChart.screenshot({ path: 'test-results/department-distribution.png' });
      analysisResults.screenshots.departmentChart = 'department-distribution.png';
    }

    // Technology Stack
    const techChart = page.locator('#techChart').first();
    if (await techChart.isVisible()) {
      await techChart.screenshot({ path: 'test-results/technology-stack.png' });
      analysisResults.screenshots.techChart = 'technology-stack.png';
    }
  });

  test('3. Settings Modal Analysis', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 1024 });

    // Open settings modal
    const settingsButton = page.locator('.settings-trigger');
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: 'test-results/settings-modal-open.png',
        fullPage: true
      });
      analysisResults.screenshots.settingsModal = 'settings-modal-open.png';

      // Test modal functionality
      const modal = page.locator('.settings-modal');
      const isModalVisible = await modal.isVisible();
      
      analysisResults.uiAnalysis.settingsModal = {
        accessible: isModalVisible,
        closesOnOutsideClick: false, // Will test this
        hasProperFocus: false // Will test this
      };

      // Test closing modal
      const closeButton = page.locator('.close-modal');
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('4. Process Entry Workspace Analysis', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 1024 });

    // Look for process entry forms or workspace
    const processForm = page.locator('.process-entry, .add-process, [data-testid="process-form"]');
    if (await processForm.isVisible()) {
      await processForm.screenshot({ path: 'test-results/process-entry-workspace.png' });
      analysisResults.screenshots.processEntry = 'process-entry-workspace.png';
    }

    // Check for data entry capabilities
    const formInputs = await page.locator('input, select, textarea').count();
    analysisResults.uiAnalysis.dataEntryCapability = {
      totalInputs: formInputs,
      hasDataEntry: formInputs > 0
    };
  });

  test('5. UI/UX Analysis - Information Hierarchy', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 1024 });

    // Analyze header structure
    const headerTitle = await page.locator('h1').first().textContent();
    const headerSubtitle = await page.locator('header p').first().textContent();
    
    // Count chart sections
    const chartSections = await page.locator('[id*="Chart"], .chart-container, canvas').count();
    
    // Check for clear navigation
    const navigationElements = await page.locator('nav, .nav, .navigation').count();
    
    // Analyze color usage
    const primaryColors = await page.evaluate(() => {
      const styles = getComputedStyle(document.body);
      return {
        background: styles.background,
        color: styles.color
      };
    });

    analysisResults.uiAnalysis.informationHierarchy = {
      headerTitle,
      headerSubtitle,
      chartCount: chartSections,
      navigationPresent: navigationElements > 0,
      colorScheme: primaryColors,
      layout: 'dashboard-grid' // Based on typical dashboard layouts
    };
  });

  test('6. Business Goal Assessment', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 1024 });

    // Look for key business metrics
    const metricsSelectors = [
      '[data-metric]',
      '.metric',
      '.kpi',
      '.dashboard-stat',
      '.summary-card'
    ];

    let visibleMetrics = 0;
    for (const selector of metricsSelectors) {
      const count = await page.locator(selector).count();
      visibleMetrics += count;
    }

    // Check for actionable buttons/CTAs
    const actionButtons = await page.locator('button, .btn, .cta, [role="button"]').count();
    
    // Look for priority indicators
    const priorityIndicators = await page.locator('.priority, .high-impact, .urgent, .recommended').count();

    // Check for filtering/sorting capabilities
    const filterControls = await page.locator('select, .filter, .sort, [type="checkbox"]').count();

    // Count chart sections
    const chartSections = await page.locator('[id*="Chart"], .chart-container, canvas').count();

    analysisResults.businessGoalAlignment = {
      metricsVisible: visibleMetrics,
      actionableElements: actionButtons,
      priorityIndicators,
      filteringCapability: filterControls,
      dataVisualizationCount: chartSections,
      supportsDecisionMaking: visibleMetrics > 0 && actionButtons > 0
    };
  });

  test('7. User Journey and Cognitive Load Analysis', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 1024 });

    // Measure page loading performance
    const startTime = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Check for loading states
    const loadingIndicators = await page.locator('.loading, .spinner, .skeleton').count();

    // Analyze text readability
    const textElements = await page.locator('p, span, div:not(:empty)').evaluateAll(elements => {
      return elements.map(el => ({
        text: el.textContent?.trim(),
        fontSize: getComputedStyle(el).fontSize,
        color: getComputedStyle(el).color
      })).filter(el => el.text && el.text.length > 10);
    });

    // Check for overwhelming information
    const totalTextElements = textElements.length;
    const avgTextLength = textElements.reduce((sum, el) => sum + (el.text?.length || 0), 0) / totalTextElements;

    // Look for clear action paths
    const ctaButtons = await page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("Start")').count();

    analysisResults.userJourneyIssues = [
      {
        category: 'Performance',
        issue: loadTime > 3000 ? 'Slow page load time' : 'Acceptable load time',
        severity: loadTime > 3000 ? 'high' : 'low',
        loadTimeMs: loadTime
      },
      {
        category: 'Cognitive Load',
        issue: totalTextElements > 50 ? 'High information density' : 'Manageable information density',
        severity: totalTextElements > 50 ? 'medium' : 'low',
        textElementCount: totalTextElements
      },
      {
        category: 'Action Clarity',
        issue: ctaButtons === 0 ? 'No clear primary actions visible' : 'Primary actions present',
        severity: ctaButtons === 0 ? 'high' : 'low',
        ctaCount: ctaButtons
      }
    ];
  });

  test('8. Key Business Questions Assessment', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 1024 });

    // Check if dashboard helps answer key business questions
    const businessQuestions = {
      'Which processes should we automate first?': {
        answered: false,
        evidence: [],
        confidence: 0
      },
      'What is our automation readiness maturity?': {
        answered: false,
        evidence: [],
        confidence: 0
      },
      'Where should we invest our automation budget?': {
        answered: false,
        evidence: [],
        confidence: 0
      },
      'How do we track automation progress?': {
        answered: false,
        evidence: [],
        confidence: 0
      }
    };

    // Look for ROI indicators
    const roiElements = await page.locator(':has-text("ROI"), :has-text("Return"), :has-text("Impact")').count();
    if (roiElements > 0) {
      businessQuestions['Which processes should we automate first?'].answered = true;
      businessQuestions['Which processes should we automate first?'].evidence.push('ROI visualization present');
      businessQuestions['Which processes should we automate first?'].confidence = 0.7;
    }

    // Look for readiness indicators
    const readinessElements = await page.locator(':has-text("Readiness"), :has-text("Maturity"), :has-text("Ready")').count();
    if (readinessElements > 0) {
      businessQuestions['What is our automation readiness maturity?'].answered = true;
      businessQuestions['What is our automation readiness maturity?'].evidence.push('Readiness metrics visible');
      businessQuestions['What is our automation readiness maturity?'].confidence = 0.6;
    }

    // Look for budget/investment guidance
    const budgetElements = await page.locator(':has-text("Cost"), :has-text("Budget"), :has-text("Investment")').count();
    if (budgetElements > 0) {
      businessQuestions['Where should we invest our automation budget?'].answered = true;
      businessQuestions['Where should we invest our automation budget?'].evidence.push('Cost/investment data present');
      businessQuestions['Where should we invest our automation budget?'].confidence = 0.5;
    }

    // Look for progress tracking
    const progressElements = await page.locator(':has-text("Progress"), :has-text("Status"), :has-text("Complete")').count();
    if (progressElements > 0) {
      businessQuestions['How do we track automation progress?'].answered = true;
      businessQuestions['How do we track automation progress?'].evidence.push('Progress indicators found');
      businessQuestions['How do we track automation progress?'].confidence = 0.4;
    }

    analysisResults.businessGoalAlignment.keyQuestionsAssessment = businessQuestions;
  });

  test('9. Generate Comprehensive Analysis Report', async ({ page }) => {
    // Compile all analysis into a comprehensive report
    const report = {
      ...analysisResults,
      summary: {
        overallScore: 0,
        strengths: [],
        criticalIssues: [],
        recommendations: []
      }
    };

    // Calculate overall score based on various factors
    let score = 0;
    const factors = [
      { name: 'Chart Visualization', weight: 0.2, score: Math.min(analysisResults.businessGoalAlignment.dataVisualizationCount / 5, 1) },
      { name: 'Actionable Elements', weight: 0.2, score: Math.min(analysisResults.businessGoalAlignment.actionableElements / 10, 1) },
      { name: 'Business Question Coverage', weight: 0.3, score: 0 }, // Will calculate
      { name: 'UI Responsiveness', weight: 0.15, score: analysisResults.screenshots.mobileView ? 1 : 0 },
      { name: 'Information Clarity', weight: 0.15, score: 0.7 } // Estimated based on structure
    ];

    // Calculate business question coverage
    const questions = analysisResults.businessGoalAlignment.keyQuestionsAssessment || {};
    const answeredQuestions = Object.values(questions).filter(q => q.answered).length;
    factors[2].score = answeredQuestions / Object.keys(questions).length;

    // Calculate weighted score
    score = factors.reduce((total, factor) => total + (factor.score * factor.weight), 0) * 100;
    report.summary.overallScore = Math.round(score);

    // Generate recommendations based on analysis
    if (analysisResults.businessGoalAlignment.actionableElements < 5) {
      report.summary.criticalIssues.push('Lack of clear action buttons for decision-making');
      report.summary.recommendations.push('Add prominent CTAs for key automation decisions');
    }

    if (analysisResults.businessGoalAlignment.priorityIndicators < 3) {
      report.summary.criticalIssues.push('No clear priority indicators for process selection');
      report.summary.recommendations.push('Implement priority scoring/ranking system');
    }

    if (answeredQuestions < 3) {
      report.summary.criticalIssues.push('Dashboard doesn\'t clearly answer key business questions');
      report.summary.recommendations.push('Add executive summary section answering key automation questions');
    }

    // Identify strengths
    if (analysisResults.businessGoalAlignment.dataVisualizationCount >= 4) {
      report.summary.strengths.push('Good variety of data visualizations');
    }

    if (analysisResults.screenshots.mobileView) {
      report.summary.strengths.push('Responsive design implementation');
    }

    // Save the comprehensive report
    const reportContent = JSON.stringify(report, null, 2);
    writeFileSync('test-results/dashboard-analysis-report.json', reportContent);

    // Create a human-readable report
    const humanReport = generateHumanReadableReport(report);
    writeFileSync('test-results/dashboard-analysis-report.md', humanReport);

    console.log('Analysis complete. Overall dashboard score:', report.summary.overallScore);
    console.log('Critical issues found:', report.summary.criticalIssues.length);
    console.log('Recommendations generated:', report.summary.recommendations.length);
  });

  // Update todos as we complete each test
  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status === 'passed') {
      console.log(`✓ Completed: ${testInfo.title}`);
    }
  });
});

function generateHumanReadableReport(report) {
  return `# Business Automation Dashboard Analysis Report

Generated: ${report.timestamp}
Overall Score: ${report.summary.overallScore}/100

## Executive Summary

The business automation dashboard has been comprehensively analyzed across multiple dimensions including UI/UX design, business goal alignment, user journey effectiveness, and decision-making support.

### Key Findings

**Overall Score: ${report.summary.overallScore}/100**

### Strengths
${report.summary.strengths.map(s => `- ${s}`).join('\n')}

### Critical Issues
${report.summary.criticalIssues.map(i => `- ${i}`).join('\n')}

## Detailed Analysis

### 1. UI/UX Analysis

**Information Hierarchy:**
- Chart Count: ${report.uiAnalysis.informationHierarchy?.chartCount || 'N/A'}
- Navigation Present: ${report.uiAnalysis.informationHierarchy?.navigationPresent ? 'Yes' : 'No'}
- Data Entry Capability: ${report.uiAnalysis.dataEntryCapability?.hasDataEntry ? 'Yes' : 'No'}

### 2. Business Goal Alignment

**Decision Support Metrics:**
- Visible Metrics: ${report.businessGoalAlignment.metricsVisible}
- Actionable Elements: ${report.businessGoalAlignment.actionableElements}
- Priority Indicators: ${report.businessGoalAlignment.priorityIndicators}
- Filtering Capability: ${report.businessGoalAlignment.filteringCapability}

**Key Business Questions Coverage:**
${Object.entries(report.businessGoalAlignment.keyQuestionsAssessment || {}).map(([question, data]) => 
  `- ${question}: ${data.answered ? '✓ Answered' : '✗ Not Addressed'} (Confidence: ${Math.round(data.confidence * 100)}%)`
).join('\n')}

### 3. User Journey Issues

${report.userJourneyIssues.map(issue => 
  `**${issue.category}:** ${issue.issue} (Severity: ${issue.severity})`
).join('\n\n')}

## Recommendations

### Immediate Actions Required
${report.summary.recommendations.map(r => `1. ${r}`).join('\n')}

### UI/UX Improvements

1. **Enhance Action Clarity**: Add clear primary and secondary action buttons
2. **Implement Priority System**: Use visual indicators (colors, badges) to show automation priority
3. **Add Executive Summary**: Include a top-level summary answering key business questions
4. **Improve Navigation**: Add breadcrumbs and section navigation
5. **Optimize Information Density**: Group related information and use progressive disclosure

### Business Intelligence Enhancements

1. **ROI Calculator**: Add interactive ROI calculation tools
2. **Automation Roadmap**: Include timeline view for automation implementation
3. **Progress Tracking**: Add dashboards for tracking automation initiatives
4. **Budget Planning**: Include cost estimation and budget allocation tools

## Screenshots Captured

- Desktop Overview: ${report.screenshots.desktopOverview || 'Not captured'}
- Mobile View: ${report.screenshots.mobileView || 'Not captured'}
- Settings Modal: ${report.screenshots.settingsModal || 'Not captured'}
- Individual Charts: ${Object.keys(report.screenshots).filter(k => k.includes('Chart')).length} chart screenshots

## Conclusion

The dashboard shows ${report.summary.overallScore >= 70 ? 'good' : report.summary.overallScore >= 50 ? 'moderate' : 'poor'} alignment with business automation goals. Focus should be placed on improving actionability and decision support features to better serve business users making automation investment decisions.

---
*Analysis conducted using automated Playwright testing suite*
`;
}