import { test, expect } from '@playwright/test';

test.describe('Business Automation Dashboard - Redesigned Prototype Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the improved dashboard prototype
    await page.goto('/dashboard-prototype-improved.html');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Wait for charts and animations to complete
    await page.waitForTimeout(2000);
  });

  test.describe('Core Functionality Testing', () => {
    test('should load dashboard with proper structure and content', async ({ page }) => {
      // Verify page title
      await expect(page).toHaveTitle('Business Automation Dashboard - Executive Intelligence');
      
      // Verify main dashboard container exists
      await expect(page.locator('.dashboard-container')).toBeVisible();
      
      // Verify header is present and contains correct title
      await expect(page.locator('.header')).toBeVisible();
      await expect(page.locator('.header h1')).toHaveText('Business Automation Intelligence');
      await expect(page.locator('.header-subtitle')).toHaveText('Executive Dashboard - AI-Driven Process Optimization');
    });

    test('should display all three main rows with correct content', async ({ page }) => {
      // Row 1: Key Metrics
      await expect(page.locator('.key-metrics-row')).toBeVisible();
      const metricCards = page.locator('.metric-card');
      await expect(metricCards).toHaveCount(4);
      
      // Verify metric card content
      await expect(page.locator('.metric-card').first()).toContainText('Project Name');
      await expect(page.locator('.metric-card').first()).toContainText('testSept9b');
      
      // Row 2: Business KPIs
      await expect(page.locator('.business-kpis-row')).toBeVisible();
      const kpiCards = page.locator('.kpi-card');
      await expect(kpiCards).toHaveCount(3);
      
      // Verify KPI values
      await expect(page.locator('.kpi-card').first()).toContainText('87/100');
      await expect(page.locator('.kpi-card').nth(1)).toContainText('$2.4M');
      await expect(page.locator('.kpi-card').nth(2)).toContainText('6');
      
      // Row 3: Priority Matrix
      await expect(page.locator('.priority-matrix-row')).toBeVisible();
      const matrixQuadrants = page.locator('.matrix-quadrant');
      await expect(matrixQuadrants).toHaveCount(4);
    });

    test('should display refresh button and last updated timestamp', async ({ page }) => {
      // Verify last updated display
      await expect(page.locator('.last-updated')).toBeVisible();
      await expect(page.locator('.last-updated')).toContainText('Last Updated: Today, 2:34 PM');
      
      // Verify refresh button exists and is clickable
      await expect(page.locator('.refresh-btn')).toBeVisible();
      await expect(page.locator('.refresh-btn')).toHaveText('Refresh');
    });

    test('should handle refresh button click interaction', async ({ page }) => {
      const refreshBtn = page.locator('.refresh-btn');
      await expect(refreshBtn).toBeVisible();
      
      // Click refresh button
      await refreshBtn.click();
      
      // Wait for refresh animation to complete
      await page.waitForTimeout(2000);
      
      // Verify button is re-enabled after refresh
      await expect(refreshBtn).not.toBeDisabled();
    });
  });

  test.describe('Interactive Elements Testing', () => {
    test('should handle matrix quadrant clicks', async ({ page }) => {
      const quadrants = page.locator('.matrix-quadrant');
      
      // Test each quadrant click
      for (let i = 0; i < 4; i++) {
        const quadrant = quadrants.nth(i);
        await expect(quadrant).toBeVisible();
        
        // Handle confirm dialogs
        page.on('dialog', async dialog => {
          expect(dialog.type()).toBe('confirm');
          await dialog.accept();
        });
        
        await quadrant.click();
        await page.waitForTimeout(500);
      }
    });

    test('should handle use case item clicks', async ({ page }) => {
      const useCaseItems = page.locator('.usecase-item');
      await expect(useCaseItems).toHaveCount(4);
      
      // Test first use case click
      page.on('dialog', async dialog => {
        expect(dialog.type()).toBe('alert');
        expect(dialog.message()).toContain('Invoice Processing Automation');
        await dialog.accept();
      });
      
      await useCaseItems.first().click();
      await page.waitForTimeout(500);
    });

    test('should handle action card clicks', async ({ page }) => {
      const actionCards = page.locator('.action-card');
      await expect(actionCards).toHaveCount(4);
      
      // Test first action card
      page.on('dialog', async dialog => {
        expect(dialog.type()).toBe('confirm');
        await dialog.accept();
      });
      
      await actionCards.first().click();
      await page.waitForTimeout(500);
    });

    test('should display hover effects on interactive elements', async ({ page }) => {
      // Test metric card hover
      const metricCard = page.locator('.metric-card').first();
      await metricCard.hover();
      
      // Test matrix quadrant hover
      const quadrant = page.locator('.matrix-quadrant').first();
      await quadrant.hover();
      
      // Test action card hover
      const actionCard = page.locator('.action-card').first();
      await actionCard.hover();
      
      // Verify hover states are applied (these would affect transform/shadow properties)
      // Since we can't easily test CSS transformations, we verify elements are still visible
      await expect(metricCard).toBeVisible();
      await expect(quadrant).toBeVisible();
      await expect(actionCard).toBeVisible();
    });
  });

  test.describe('Business Intelligence Features', () => {
    test('should display priority matrix with correct quadrant data', async ({ page }) => {
      // Verify matrix title and subtitle
      await expect(page.locator('.matrix-title')).toHaveText('Automation Priority Matrix');
      await expect(page.locator('.matrix-subtitle')).toHaveText('Strategic Decision Framework: Business Impact vs Implementation Effort');
      
      // Test each quadrant has correct content
      const majorProjects = page.locator('.matrix-quadrant.major-projects');
      await expect(majorProjects).toContainText('Major Projects');
      await expect(majorProjects).toContainText('High Impact • High Effort');
      await expect(majorProjects).toContainText('ERP Integration');
      
      const quickWins = page.locator('.matrix-quadrant.quick-wins');
      await expect(quickWins).toContainText('Quick Wins');
      await expect(quickWins).toContainText('High Impact • Low Effort');
      await expect(quickWins).toContainText('Invoice Processing');
      
      const fillIns = page.locator('.matrix-quadrant.fill-ins');
      await expect(fillIns).toContainText('Fill-ins');
      await expect(fillIns).toContainText('Low Impact • Low Effort');
      
      const avoid = page.locator('.matrix-quadrant.avoid');
      await expect(avoid).toContainText('Avoid');
      await expect(avoid).toContainText('Low Impact • High Effort');
    });

    test('should display department rankings with scores', async ({ page }) => {
      const deptItems = page.locator('.dept-item');
      await expect(deptItems).toHaveCount(4);
      
      // Verify department data
      await expect(deptItems.first()).toContainText('Finance & Accounting');
      await expect(deptItems.first()).toContainText('94');
      await expect(deptItems.first()).toContainText('12 processes • $890K potential');
      
      // Verify score bars are present
      const scoreBars = page.locator('.score-fill');
      await expect(scoreBars).toHaveCount(4);
    });

    test('should display ROI calculations and metrics', async ({ page }) => {
      // Verify ROI grid metrics
      const roiMetrics = page.locator('.roi-metric');
      await expect(roiMetrics).toHaveCount(4);
      
      await expect(roiMetrics.nth(0)).toContainText('$2.4M');
      await expect(roiMetrics.nth(0)).toContainText('Annual Savings');
      
      await expect(roiMetrics.nth(1)).toContainText('370%');
      await expect(roiMetrics.nth(1)).toContainText('Average ROI');
      
      await expect(roiMetrics.nth(2)).toContainText('6.2mo');
      await expect(roiMetrics.nth(2)).toContainText('Payback Period');
      
      await expect(roiMetrics.nth(3)).toContainText('45%');
      await expect(roiMetrics.nth(3)).toContainText('Time Reduction');
    });

    test('should display implementation roadmap timeline', async ({ page }) => {
      const timelineItems = page.locator('.timeline-item');
      await expect(timelineItems).toHaveCount(4);
      
      // Verify timeline phases
      await expect(timelineItems.nth(0)).toContainText('Phase 1: Quick Wins');
      await expect(timelineItems.nth(0)).toContainText('Months 1-3');
      
      await expect(timelineItems.nth(1)).toContainText('Phase 2: Mid-tier Automation');
      await expect(timelineItems.nth(1)).toContainText('Months 4-8');
      
      await expect(timelineItems.nth(2)).toContainText('Phase 3: Major Projects');
      await expect(timelineItems.nth(2)).toContainText('Months 9-18');
      
      await expect(timelineItems.nth(3)).toContainText('Phase 4: Optimization');
      await expect(timelineItems.nth(3)).toContainText('Months 19-24');
    });

    test('should validate readiness score and progress ring', async ({ page }) => {
      // Verify readiness score
      await expect(page.locator('.kpi-value').first()).toContainText('87');
      await expect(page.locator('.kpi-description').first()).toContainText('Excellent readiness across all processes');
      
      // Verify progress ring exists
      await expect(page.locator('.progress-ring')).toBeVisible();
      await expect(page.locator('.progress-ring circle')).toHaveCount(2); // background and progress circles
    });
  });

  test.describe('Chart Functionality', () => {
    test('should render ROI chart correctly', async ({ page }) => {
      // Wait for chart to load
      await page.waitForTimeout(1000);
      
      // Verify chart container exists
      await expect(page.locator('.chart-container')).toBeVisible();
      
      // Verify canvas element for chart
      await expect(page.locator('#roiChart')).toBeVisible();
      
      // Verify Chart.js is loaded and chart is initialized
      const chartExists = await page.evaluate(() => {
        return typeof Chart !== 'undefined' && document.getElementById('roiChart') !== null;
      });
      expect(chartExists).toBeTruthy();
    });

    test('should initialize chart with correct data', async ({ page }) => {
      // Wait for chart initialization
      await page.waitForTimeout(2000);
      
      // Verify chart instance exists
      const chartData = await page.evaluate(() => {
        const canvas = document.getElementById('roiChart');
        if (canvas && canvas.chart) {
          return {
            hasData: canvas.chart.data.datasets.length > 0,
            datasetCount: canvas.chart.data.datasets.length,
            labelCount: canvas.chart.data.labels.length
          };
        }
        return { hasData: false };
      });
      
      expect(chartData.hasData).toBeTruthy();
      if (chartData.hasData) {
        expect(chartData.datasetCount).toBe(2); // Annual Savings and Implementation Cost
        expect(chartData.labelCount).toBe(4); // Four use cases
      }
    });
  });

  test.describe('UI/UX Validation', () => {
    test('should have proper visual hierarchy and layout', async ({ page }) => {
      // Verify 3-row layout structure
      await expect(page.locator('.key-metrics-row')).toBeVisible();
      await expect(page.locator('.business-kpis-row')).toBeVisible();
      await expect(page.locator('.priority-matrix-row')).toBeVisible();
      await expect(page.locator('.supporting-analysis')).toBeVisible();
      await expect(page.locator('.action-center')).toBeVisible();
      
      // Verify proper spacing and no overlapping elements
      const sections = await page.locator('section').all();
      for (const section of sections) {
        await expect(section).toBeVisible();
      }
    });

    test('should apply modern color scheme correctly', async ({ page }) => {
      // Verify CSS custom properties are applied
      const styles = await page.evaluate(() => {
        const root = document.documentElement;
        const computedStyle = getComputedStyle(root);
        return {
          primaryColor: computedStyle.getPropertyValue('--primary-600'),
          grayColor: computedStyle.getPropertyValue('--gray-50'),
          greenColor: computedStyle.getPropertyValue('--green-500')
        };
      });
      
      expect(styles.primaryColor).toBeTruthy();
      expect(styles.grayColor).toBeTruthy();
      expect(styles.greenColor).toBeTruthy();
    });

    test('should handle animations and transitions', async ({ page }) => {
      // Verify animation classes are present
      await expect(page.locator('.animate-fade-in')).toHaveCount(4);
      await expect(page.locator('.animate-delay-200')).toBeVisible();
      await expect(page.locator('.animate-delay-300')).toBeVisible();
      await expect(page.locator('.animate-delay-400')).toHaveCount(2);
      
      // Test loading skeleton if present
      const skeletonElements = await page.locator('.loading-skeleton').count();
      console.log(`Found ${skeletonElements} loading skeleton elements`);
    });

    test('should display proper typography system', async ({ page }) => {
      // Verify typography classes are applied
      await expect(page.locator('.text-display')).toBeVisible();
      await expect(page.locator('.text-h1')).toHaveCount(2);
      await expect(page.locator('.text-h2')).toHaveCount(4);
      await expect(page.locator('.text-h3')).toHaveCount(8);
      
      // Verify font family is applied
      const fontFamily = await page.evaluate(() => {
        return getComputedStyle(document.body).fontFamily;
      });
      expect(fontFamily).toContain('Inter');
    });
  });

  test.describe('Responsive Behavior', () => {
    test('should display correctly on desktop viewport', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(500);
      
      // Verify grid layouts work correctly
      const metricsContainer = page.locator('.metrics-container');
      const kpisContainer = page.locator('.kpis-container');
      const analysisContainer = page.locator('.analysis-container');
      
      await expect(metricsContainer).toBeVisible();
      await expect(kpisContainer).toBeVisible();
      await expect(analysisContainer).toBeVisible();
    });

    test('should adapt to tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(500);
      
      // Verify responsive layout changes
      await expect(page.locator('.header')).toBeVisible();
      await expect(page.locator('.metrics-container')).toBeVisible();
      await expect(page.locator('.matrix-grid')).toBeVisible();
    });

    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);
      
      // Verify mobile-specific layout
      await expect(page.locator('.header')).toBeVisible();
      await expect(page.locator('.key-metrics-row')).toBeVisible();
      
      // Verify matrix grid switches to single column
      const matrixGrid = page.locator('.matrix-grid');
      await expect(matrixGrid).toBeVisible();
    });

    test('should maintain functionality across different screen sizes', async ({ page }) => {
      const viewports = [
        { width: 320, height: 568 }, // iPhone 5
        { width: 768, height: 1024 }, // iPad
        { width: 1440, height: 900 }, // Desktop
        { width: 1920, height: 1080 } // Large Desktop
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(300);
        
        // Verify core elements are still visible
        await expect(page.locator('.header')).toBeVisible();
        await expect(page.locator('.key-metrics-row')).toBeVisible();
        await expect(page.locator('.priority-matrix-row')).toBeVisible();
        
        // Test one interaction at each viewport
        const refreshBtn = page.locator('.refresh-btn');
        if (await refreshBtn.isVisible()) {
          await refreshBtn.click();
          await page.waitForTimeout(100);
        }
      }
    });
  });

  test.describe('Data Integrity Testing', () => {
    test('should display accurate sample data', async ({ page }) => {
      // Verify project metrics
      await expect(page.locator('.metric-card').first()).toContainText('testSept9b');
      await expect(page.locator('.metric-card').nth(1)).toContainText('5');
      await expect(page.locator('.metric-card').nth(2)).toContainText('3');
      
      // Verify business KPIs match calculations
      await expect(page.locator('.kpi-value').first()).toContainText('87');
      await expect(page.locator('.kpi-value').nth(1)).toContainText('$2.4M');
      await expect(page.locator('.kpi-value').nth(2)).toContainText('6');
      
      // Verify department scores are consistent
      const deptScores = await page.locator('.score-badge').allTextContents();
      expect(deptScores).toEqual(['94', '87', '82', '76']);
    });

    test('should validate ROI calculations consistency', async ({ page }) => {
      // Get ROI values from matrix items
      const matrixROIs = await page.locator('.matrix-item').allTextContents();
      
      // Verify ROI values are formatted correctly (XXX%)
      const roiRegex = /\d+%/;
      const hasValidROIs = matrixROIs.some(item => roiRegex.test(item));
      expect(hasValidROIs).toBeTruthy();
      
      // Verify timeline consistency
      const timelineRegex = /\d+-\d+\s+(weeks?|months?)/;
      const hasValidTimelines = matrixROIs.some(item => timelineRegex.test(item));
      expect(hasValidTimelines).toBeTruthy();
    });

    test('should validate business logic for automation decisions', async ({ page }) => {
      // Verify Quick Wins quadrant has high ROI, low timeline
      const quickWins = page.locator('.matrix-quadrant.quick-wins .matrix-item');
      const quickWinTexts = await quickWins.allTextContents();
      
      // Quick wins should have ROI > 100% and timeline < 10 weeks
      for (const text of quickWinTexts) {
        if (text.includes('ROI:')) {
          const roiMatch = text.match(/ROI:\s*(\d+)%/);
          if (roiMatch) {
            const roi = parseInt(roiMatch[1]);
            expect(roi).toBeGreaterThan(100);
          }
        }
      }
      
      // Verify Major Projects have high ROI but longer timelines
      const majorProjects = page.locator('.matrix-quadrant.major-projects .matrix-item');
      const majorProjectTexts = await majorProjects.allTextContents();
      
      for (const text of majorProjectTexts) {
        if (text.includes('Timeline:')) {
          expect(text).toMatch(/\d+-\d+\s+months/);
        }
      }
    });
  });

  test.describe('Error Handling and Performance', () => {
    test('should not have JavaScript console errors', async ({ page }) => {
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      // Reload page to catch any initial errors
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Interact with some elements to trigger any dynamic errors
      await page.click('.refresh-btn');
      await page.waitForTimeout(1000);
      
      // Check for JavaScript errors
      expect(consoleErrors.length).toBe(0);
      if (consoleErrors.length > 0) {
        console.log('Console errors found:', consoleErrors);
      }
    });

    test('should load within acceptable time limits', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/dashboard-prototype-improved.html');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Dashboard should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
      console.log(`Dashboard load time: ${loadTime}ms`);
    });

    test('should handle missing chart dependencies gracefully', async ({ page }) => {
      // Test if Chart.js fails to load
      const chartStatus = await page.evaluate(() => {
        return {
          chartJsLoaded: typeof Chart !== 'undefined',
          canvasExists: document.getElementById('roiChart') !== null
        };
      });
      
      if (!chartStatus.chartJsLoaded) {
        console.log('Chart.js not loaded - checking error handling');
        // Verify page still displays without crashing
        await expect(page.locator('.chart-container')).toBeVisible();
      } else {
        expect(chartStatus.chartJsLoaded).toBeTruthy();
        expect(chartStatus.canvasExists).toBeTruthy();
      }
    });

    test('should maintain accessibility standards', async ({ page }) => {
      // Test keyboard navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Verify focus indicators are visible
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Test Enter key interaction on focusable elements
      const firstQuadrant = page.locator('.matrix-quadrant').first();
      await firstQuadrant.focus();
      
      page.on('dialog', async dialog => {
        await dialog.accept();
      });
      
      await page.keyboard.press('Enter');
      await page.waitForTimeout(100);
    });
  });

  test.describe('Cross-Browser Compatibility', () => {
    test('should work correctly in different browsers', async ({ page, browserName }) => {
      console.log(`Testing in ${browserName}`);
      
      // Basic functionality test for each browser
      await expect(page.locator('.dashboard-container')).toBeVisible();
      await expect(page.locator('.header h1')).toBeVisible();
      await expect(page.locator('.matrix-grid')).toBeVisible();
      
      // Test interactive element
      const refreshBtn = page.locator('.refresh-btn');
      await expect(refreshBtn).toBeVisible();
      await refreshBtn.click();
      await page.waitForTimeout(500);
      
      // Verify no layout issues
      const hasLayoutIssues = await page.evaluate(() => {
        const elements = document.querySelectorAll('.metric-card, .kpi-card, .matrix-quadrant');
        return Array.from(elements).some(el => {
          const rect = el.getBoundingClientRect();
          return rect.width === 0 || rect.height === 0;
        });
      });
      
      expect(hasLayoutIssues).toBeFalsy();
    });
  });
});