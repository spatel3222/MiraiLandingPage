import { test, expect } from '@playwright/test';
import { mkdirSync } from 'fs';

// Create screenshots directory if it doesn't exist
const screenshotDir = './test-results/ui-issues-screenshots';

test.describe('Dashboard UI Issues Documentation', () => {
  let page;

  test.beforeAll(async ({ browser }) => {
    // Create screenshot directory
    try {
      mkdirSync(screenshotDir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }
  });

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    // Navigate to the dashboard prototype
    await page.goto('/dashboard-prototype-improved.html');
    
    // Wait for page to fully load including all resources
    await page.waitForLoadState('networkidle');
    
    // Wait for chart initialization and animations
    await page.waitForTimeout(3000);
  });

  test('1. Full Dashboard Overview - Document all UI issues', async () => {
    console.log('📸 Taking full dashboard screenshot for complete UI analysis...');
    
    // Take full page screenshot showing all sections
    await page.screenshot({
      path: `${screenshotDir}/01-full-dashboard-overview.png`,
      fullPage: true,
      animations: 'disabled'
    });

    // Also take a viewport screenshot for above-the-fold issues
    await page.screenshot({
      path: `${screenshotDir}/01b-dashboard-above-fold.png`,
      animations: 'disabled'
    });

    console.log('✅ Full dashboard screenshots captured');
  });

  test('2. Header Section - Missing Settings Button Analysis', async () => {
    console.log('📸 Analyzing header section for missing Settings button...');

    // Focus on header area
    const header = page.locator('.header');
    await expect(header).toBeVisible();

    // Take screenshot of header section
    await header.screenshot({
      path: `${screenshotDir}/02-header-missing-settings.png`
    });

    // Check for existing action buttons
    const headerActions = page.locator('.header-actions');
    await expect(headerActions).toBeVisible();

    // Document what's currently in the header actions
    const actionButtons = await headerActions.locator('button, a').count();
    console.log(`Current header action buttons: ${actionButtons}`);

    // Check specifically for settings button/icon - this should fail
    const settingsButton = page.locator('.header-actions button:has-text("Settings"), .header-actions [aria-label*="settings" i], .header-actions .settings-btn');
    const settingsExists = await settingsButton.count();
    
    console.log(`Settings button found: ${settingsExists > 0 ? 'YES' : 'NO'}`);
    
    // Take close-up of header actions area
    await headerActions.screenshot({
      path: `${screenshotDir}/02b-header-actions-closeup.png`
    });

    console.log('✅ Header analysis complete - Settings button missing as expected');
  });

  test('3. Department Text Overflow - Document Truncation Issue', async () => {
    console.log('📸 Documenting department text overflow in metrics section...');

    // Locate the departments metric card
    const departmentCard = page.locator('.metric-card').filter({
      hasText: 'Departments Involved'
    });
    
    await expect(departmentCard).toBeVisible();

    // Take screenshot of the specific metric card
    await departmentCard.screenshot({
      path: `${screenshotDir}/03-department-text-overflow.png`
    });

    // Get the department text element specifically
    const departmentText = departmentCard.locator('.metric-value span');
    await expect(departmentText).toBeVisible();
    
    // Capture text content and check if it's getting cut off
    const textContent = await departmentText.textContent();
    console.log(`Department text content: "${textContent}"`);
    
    // Get bounding box to analyze space constraints
    const textBox = await departmentText.boundingBox();
    const cardBox = await departmentCard.boundingBox();
    
    console.log(`Department text width: ${textBox?.width}px`);
    console.log(`Card container width: ${cardBox?.width}px`);
    
    // Take a zoomed in screenshot of just the text area
    await page.screenshot({
      path: `${screenshotDir}/03b-department-text-detail.png`,
      clip: {
        x: textBox.x - 20,
        y: textBox.y - 10,
        width: Math.min(textBox.width + 40, cardBox.width),
        height: textBox.height + 20
      }
    });

    // Check if text is likely overflowing by examining CSS properties
    const textStyles = await departmentText.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        overflow: styles.overflow,
        textOverflow: styles.textOverflow,
        whiteSpace: styles.whiteSpace,
        width: el.scrollWidth,
        containerWidth: el.clientWidth
      };
    });
    
    console.log('Text styling analysis:', textStyles);
    console.log(`Text overflow detected: ${textStyles.width > textStyles.containerWidth ? 'YES' : 'NO'}`);

    console.log('✅ Department text overflow analysis complete');
  });

  test('4. Bottom-Right Corner - Missing FAB Button Analysis', async () => {
    console.log('📸 Analyzing bottom-right corner for missing FAB button...');

    // Scroll to bottom of page to check for FAB
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Take screenshot of bottom-right area where FAB should be
    const viewportSize = page.viewportSize();
    const bottomRightClip = {
      x: viewportSize.width - 200,
      y: viewportSize.height - 200,
      width: 200,
      height: 200
    };

    await page.screenshot({
      path: `${screenshotDir}/04-missing-fab-bottom-right.png`,
      clip: bottomRightClip
    });

    // Check for any existing FAB buttons
    const fabSelectors = [
      '.fab', '.floating-action-button', '.fab-button',
      '[class*="fab"]', '[class*="floating"]',
      'button[style*="fixed"][style*="bottom"]',
      'button[style*="position: fixed"]'
    ];

    let fabFound = false;
    for (const selector of fabSelectors) {
      const fabCount = await page.locator(selector).count();
      if (fabCount > 0) {
        console.log(`FAB found with selector: ${selector}`);
        fabFound = true;
        break;
      }
    }

    console.log(`FAB button found: ${fabFound ? 'YES' : 'NO'}`);

    // Also take a full-height screenshot of the right edge
    await page.screenshot({
      path: `${screenshotDir}/04b-right-edge-full-height.png`,
      clip: {
        x: viewportSize.width - 100,
        y: 0,
        width: 100,
        height: viewportSize.height
      }
    });

    // Check the action center at bottom - this might be where FAB functionality is
    const actionCenter = page.locator('.action-center');
    if (await actionCenter.count() > 0) {
      await actionCenter.screenshot({
        path: `${screenshotDir}/04c-action-center-instead-of-fab.png`
      });
      console.log('📝 Note: Found action center at bottom - may be alternative to FAB');
    }

    console.log('✅ FAB button analysis complete - Missing as expected');
  });

  test('5. Mobile Viewport - Responsive Issues Analysis', async () => {
    console.log('📱 Testing mobile viewport for responsive issues...');

    // Test different mobile viewports
    const mobileViewports = [
      { width: 375, height: 667, name: 'iphone-se' },
      { width: 414, height: 896, name: 'iphone-11-pro' },
      { width: 360, height: 640, name: 'android-small' }
    ];

    for (const viewport of mobileViewports) {
      console.log(`Testing viewport: ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height
      });
      
      await page.waitForTimeout(1000); // Let responsive styles apply

      // Take full mobile screenshot
      await page.screenshot({
        path: `${screenshotDir}/05-mobile-${viewport.name}-full.png`,
        fullPage: true
      });

      // Focus on the department text overflow on mobile
      const departmentCard = page.locator('.metric-card').filter({
        hasText: 'Departments Involved'
      });
      
      if (await departmentCard.count() > 0) {
        await departmentCard.screenshot({
          path: `${screenshotDir}/05b-mobile-${viewport.name}-departments.png`
        });
      }

      // Check if header actions are responsive
      const headerActions = page.locator('.header-actions');
      if (await headerActions.count() > 0) {
        await headerActions.screenshot({
          path: `${screenshotDir}/05c-mobile-${viewport.name}-header.png`
        });
      }
    }

    // Reset viewport for remaining tests
    await page.setViewportSize({ width: 1920, height: 1080 });

    console.log('✅ Mobile responsive analysis complete');
  });

  test('6. UI Component Spacing and Layout Analysis', async () => {
    console.log('📐 Analyzing component spacing and layout issues...');

    // Take screenshots of each major section with measurement annotations
    const sections = [
      { selector: '.header', name: 'header' },
      { selector: '.key-metrics-row', name: 'metrics' },
      { selector: '.business-kpis-row', name: 'kpis' },
      { selector: '.priority-matrix-row', name: 'matrix' },
      { selector: '.supporting-analysis', name: 'analysis' },
      { selector: '.action-center', name: 'actions' }
    ];

    for (const section of sections) {
      const element = page.locator(section.selector);
      if (await element.count() > 0) {
        await element.screenshot({
          path: `${screenshotDir}/06-layout-${section.name}.png`
        });

        // Get spacing measurements
        const spacing = await element.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            padding: styles.padding,
            margin: styles.margin,
            height: el.offsetHeight,
            width: el.offsetWidth
          };
        });
        
        console.log(`${section.name} spacing:`, spacing);
      }
    }

    console.log('✅ Layout analysis complete');
  });

  test('7. Interactive Elements - Hover and Focus States', async () => {
    console.log('🎯 Testing interactive elements and their states...');

    // Test matrix quadrants
    const quickWinsQuadrant = page.locator('.matrix-quadrant.quick-wins');
    await quickWinsQuadrant.hover();
    await page.screenshot({
      path: `${screenshotDir}/07-interactive-quadrant-hover.png`
    });

    // Test action cards
    const firstActionCard = page.locator('.action-card').first();
    await firstActionCard.hover();
    await page.screenshot({
      path: `${screenshotDir}/07b-interactive-action-card-hover.png`
    });

    // Test department items
    const firstDeptItem = page.locator('.dept-item').first();
    await firstDeptItem.hover();
    await page.screenshot({
      path: `${screenshotDir}/07c-interactive-dept-item-hover.png`
    });

    console.log('✅ Interactive elements analysis complete');
  });

  test('8. Generate UI Issues Summary Report', async () => {
    console.log('📋 Generating comprehensive UI issues summary...');

    // This test will create a summary of all found issues
    const issues = [];

    // Check department text overflow
    const departmentCard = page.locator('.metric-card').filter({
      hasText: 'Departments Involved'
    });
    const departmentText = departmentCard.locator('.metric-value span');
    const textStyles = await departmentText.evaluate(el => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      textContent: el.textContent
    }));

    if (textStyles.scrollWidth > textStyles.clientWidth) {
      issues.push({
        category: 'Department Text Overflow',
        severity: 'Medium',
        description: `Department text "${textStyles.textContent}" exceeds container width`,
        location: 'Key Metrics Row - Third metric card',
        screenshot: '03-department-text-overflow.png'
      });
    }

    // Check for missing Settings button
    const settingsButton = page.locator('.header-actions .settings-btn, .header-actions [aria-label*="settings" i]');
    if (await settingsButton.count() === 0) {
      issues.push({
        category: 'Missing Settings Button',
        severity: 'High',
        description: 'Settings button/icon is missing from header actions area',
        location: 'Header - Actions section (top-right)',
        screenshot: '02-header-missing-settings.png'
      });
    }

    // Check for missing FAB
    const fabButton = page.locator('.fab, .floating-action-button, [class*="fab"]');
    if (await fabButton.count() === 0) {
      issues.push({
        category: 'Missing FAB Button',
        severity: 'High',
        description: 'Floating Action Button is missing from bottom-right corner',
        location: 'Bottom-right corner (fixed position)',
        screenshot: '04-missing-fab-bottom-right.png'
      });
    }

    // Create summary report
    const report = {
      timestamp: new Date().toISOString(),
      dashboard: 'Business Automation Intelligence Dashboard',
      file: 'dashboard-prototype-improved.html',
      totalIssues: issues.length,
      issues: issues,
      recommendations: {
        departmentTextFix: {
          options: [
            'Shorten text to "Customer Service, Finance, Ops"',
            'Increase container width by 50px',
            'Use ellipsis with tooltip: "Customer Service, Finance..."',
            'Wrap to multiple lines with line-height adjustment',
            'Use responsive font sizing (vw units)'
          ],
          recommended: 'Use ellipsis with tooltip for best UX'
        },
        settingsButtonFix: {
          position: 'Header top-right, after refresh button',
          specifications: {
            size: '40-44px clickable area',
            icon: 'Gear/cog SVG icon',
            style: 'Match existing header button style',
            hover: 'Same hover effect as refresh button'
          },
          implementation: 'Add to .header-actions container'
        },
        fabButtonFix: {
          position: 'Fixed bottom-right (bottom: 24px, right: 24px)',
          specifications: {
            size: '56px diameter (desktop), 40px (mobile)',
            color: 'Primary action color (var(--primary-600))',
            icon: 'Plus sign or menu icon',
            shadow: 'var(--shadow-lg) for elevation',
            zIndex: '1000 for proper layering'
          },
          functionality: 'Primary actions menu or "Add Process" action'
        }
      },
      screenshots: {
        fullDashboard: '01-full-dashboard-overview.png',
        headerIssue: '02-header-missing-settings.png',
        departmentOverflow: '03-department-text-overflow.png',
        missingFab: '04-missing-fab-bottom-right.png',
        mobileViews: ['05-mobile-iphone-se-full.png', '05-mobile-iphone-11-pro-full.png']
      }
    };

    // Log the report to console
    console.log('\n📊 UI ISSUES ANALYSIS REPORT');
    console.log('=================================');
    console.log(`Total Issues Found: ${report.totalIssues}`);
    console.log('\nISSUES DETAIL:');
    report.issues.forEach((issue, index) => {
      console.log(`\n${index + 1}. ${issue.category} (${issue.severity})`);
      console.log(`   Description: ${issue.description}`);
      console.log(`   Location: ${issue.location}`);
      console.log(`   Screenshot: ${issue.screenshot}`);
    });

    console.log('\n📝 IMPLEMENTATION RECOMMENDATIONS:');
    console.log('\n1. Department Text Overflow Fix:');
    console.log(`   Recommended: ${report.recommendations.departmentTextFix.recommended}`);
    
    console.log('\n2. Settings Button Implementation:');
    console.log(`   Position: ${report.recommendations.settingsButtonFix.position}`);
    console.log(`   Size: ${report.recommendations.settingsButtonFix.specifications.size}`);
    
    console.log('\n3. FAB Button Implementation:');
    console.log(`   Position: ${report.recommendations.fabButtonFix.position}`);
    console.log(`   Size: ${report.recommendations.fabButtonFix.specifications.size}`);

    console.log('\n📸 ALL SCREENSHOTS SAVED TO: test-results/ui-issues-screenshots/');
    console.log('✅ UI Issues Documentation Complete');
  });
});

// Helper function to wait for animations and settle
async function waitForPageSettle(page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  // Wait for any CSS transitions to complete
  await page.evaluate(() => {
    return new Promise(resolve => {
      const transitions = document.querySelectorAll('*');
      let transitionCount = 0;
      
      transitions.forEach(el => {
        const styles = window.getComputedStyle(el);
        if (styles.transition !== 'all 0s ease 0s') {
          transitionCount++;
        }
      });
      
      if (transitionCount === 0) {
        resolve();
      } else {
        setTimeout(resolve, 1000);
      }
    });
  });
}