import { test, expect } from '@playwright/test';

test.describe('Improved UI Validation - Professional Design', () => {
  const dashboardUrl = '/workshops/business-automation-dashboard.html';

  test('Validate improved Process Entry modal design', async ({ page }) => {
    console.log('\n=== TESTING: Improved Process Entry Modal ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(4000);
    
    // Select a project first
    await page.locator('#headerProjectSelector').selectOption('7029fc69-769d-44e6-bc25-c746e38deb65');
    await page.waitForTimeout(2000);
    
    // Open FAB and click Add Process
    await page.locator('.fab-main').click();
    await page.waitForTimeout(500);
    await page.locator('.fab-option:has-text("Add Process")').click();
    await page.waitForTimeout(1500);
    
    // Verify modal opened
    const processModal = page.locator('#processModal');
    await expect(processModal).toBeVisible();
    console.log('✅ Process modal opened');
    
    // Verify professional header structure
    const modalHeader = page.locator('.process-modal-header');
    await expect(modalHeader).toBeVisible();
    console.log('✅ Professional modal header found');
    
    // Verify header elements
    const titleGroup = page.locator('.workspace-title-group');
    await expect(titleGroup).toBeVisible();
    
    const title = page.locator('.workspace-title');
    const titleText = await title.textContent();
    expect(titleText).toBe('Add Business Process');
    console.log('✅ Professional title structure verified');
    
    const description = page.locator('.workspace-description');
    const descriptionText = await description.textContent();
    expect(descriptionText).toBe('Define a new process for automation analysis');
    console.log('✅ Professional description verified');
    
    // Verify professional close button
    const closeBtn = page.locator('.btn-system-close');
    await expect(closeBtn).toBeVisible();
    console.log('✅ Professional close button found');
    
    // Capture improved modal
    await page.screenshot({ 
      path: 'test-results/improved-process-modal-full.png',
      fullPage: true 
    });
    
    // Capture just the modal
    await processModal.screenshot({ 
      path: 'test-results/improved-process-modal-only.png'
    });
    
    // Capture header detail
    await modalHeader.screenshot({ 
      path: 'test-results/improved-process-modal-header.png'
    });
    
    console.log('✅ Process Entry modal improvements validated');
    
    // Close modal
    await closeBtn.click();
    await page.waitForTimeout(500);
  });

  test('Validate improved Manage Projects workspace', async ({ page }) => {
    console.log('\n=== TESTING: Improved Manage Projects Workspace ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(4000);
    
    // Open Projects workspace
    await page.locator('.fab-main').click();
    await page.waitForTimeout(500);
    await page.locator('.fab-option:has-text("Manage Projects")').click();
    await page.waitForTimeout(1500);
    
    // Verify workspace opened
    const workspace = page.locator('#contextualWorkspace');
    await expect(workspace).toBeVisible();
    console.log('✅ Projects workspace opened');
    
    // Verify professional metrics layout (3 boxes in 1 row)
    const metricCards = page.locator('.professional-metric-card');
    const cardCount = await metricCards.count();
    expect(cardCount).toBe(3);
    console.log(`✅ Found ${cardCount} professional metric cards in row`);
    
    // Verify each metric card has proper structure
    for (let i = 0; i < cardCount; i++) {
      const card = metricCards.nth(i);
      await expect(card).toBeVisible();
      
      // Check for icon container
      const iconContainer = card.locator('.metric-icon-container');
      await expect(iconContainer).toBeVisible();
      
      // Check for metric content
      const metricContent = card.locator('.metric-content');
      await expect(metricContent).toBeVisible();
      
      // Check for label, value, and subtitle
      const label = card.locator('.metric-label');
      const value = card.locator('.metric-value');
      const subtitle = card.locator('.metric-subtitle');
      
      await expect(label).toBeVisible();
      await expect(value).toBeVisible();
      await expect(subtitle).toBeVisible();
      
      console.log(`✅ Metric card ${i + 1} structure verified`);
    }
    
    // Capture improved workspace
    await page.screenshot({ 
      path: 'test-results/improved-projects-workspace.png',
      fullPage: true 
    });
    
    // Capture metrics section detail
    const metricsSection = page.locator('.grid.grid-cols-1.md\\:grid-cols-3').first();
    await metricsSection.screenshot({ 
      path: 'test-results/improved-projects-metrics.png'
    });
    
    // Test hover effects
    const firstCard = metricCards.first();
    await firstCard.hover();
    await page.waitForTimeout(300);
    await firstCard.screenshot({ 
      path: 'test-results/improved-metric-card-hover.png'
    });
    
    console.log('✅ Projects workspace improvements validated');
    
    // Close workspace
    await page.locator('.workspace-back-btn').click();
    await page.waitForTimeout(500);
  });

  test('Validate improved Manage Processes workspace', async ({ page }) => {
    console.log('\n=== TESTING: Improved Manage Processes Workspace ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(4000);
    
    // Select project with processes
    await page.locator('#headerProjectSelector').selectOption('7029fc69-769d-44e6-bc25-c746e38deb65');
    await page.waitForTimeout(2000);
    
    // Open Processes workspace
    await page.locator('.fab-main').click();
    await page.waitForTimeout(500);
    await page.locator('.fab-option:has-text("Manage Processes")').click();
    await page.waitForTimeout(1500);
    
    // Verify workspace opened
    const workspace = page.locator('#contextualWorkspace');
    await expect(workspace).toBeVisible();
    console.log('✅ Processes workspace opened');
    
    // Verify professional metrics layout (3 boxes in 1 row instead of 4)
    const metricCards = page.locator('.professional-metric-card');
    const cardCount = await metricCards.count();
    expect(cardCount).toBe(3);
    console.log(`✅ Found ${cardCount} professional metric cards (changed from 4 to 3)`);
    
    // Verify specific metrics are displayed
    const metrics = [];
    for (let i = 0; i < cardCount; i++) {
      const card = metricCards.nth(i);
      const label = await card.locator('.metric-label').textContent();
      const value = await card.locator('.metric-value').textContent();
      metrics.push({ label, value });
    }
    
    console.log('Process workspace metrics:', metrics);
    
    // Verify expected metrics
    const expectedLabels = ['Total Processes', 'Avg Automation Score', 'High Impact'];
    for (const expectedLabel of expectedLabels) {
      const found = metrics.some(m => m.label === expectedLabel);
      expect(found).toBe(true);
      console.log(`✅ Found expected metric: ${expectedLabel}`);
    }
    
    // Verify Avg Automation Score includes /10 explanation
    const automationMetric = metrics.find(m => m.label === 'Avg Automation Score');
    expect(automationMetric.value).toContain('/10');
    console.log('✅ Automation score includes /10 explanation');
    
    // Capture improved workspace
    await page.screenshot({ 
      path: 'test-results/improved-processes-workspace.png',
      fullPage: true 
    });
    
    // Capture metrics section detail
    const metricsSection = page.locator('.grid.grid-cols-1.md\\:grid-cols-3').first();
    await metricsSection.screenshot({ 
      path: 'test-results/improved-processes-metrics.png'
    });
    
    console.log('✅ Processes workspace improvements validated');
    
    // Close workspace
    await page.locator('.workspace-back-btn').click();
    await page.waitForTimeout(500);
  });

  test('Validate design consistency across all interfaces', async ({ page }) => {
    console.log('\n=== TESTING: Design Consistency Validation ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(4000);
    
    // Test Process Modal consistency
    await page.locator('.fab-main').click();
    await page.waitForTimeout(500);
    await page.locator('.fab-option:has-text("Add Process")').click();
    await page.waitForTimeout(1000);
    
    // Check modal header consistency
    const modalHeaderBg = await page.evaluate(() => {
      const header = document.querySelector('.process-modal-header');
      return header ? getComputedStyle(header).background : null;
    });
    
    await page.locator('.btn-system-close').click();
    await page.waitForTimeout(500);
    
    // Test Projects workspace consistency
    await page.locator('.fab-main').click();
    await page.waitForTimeout(500);
    await page.locator('.fab-option:has-text("Manage Projects")').click();
    await page.waitForTimeout(1000);
    
    const workspaceHeaderBg = await page.evaluate(() => {
      const header = document.querySelector('.workspace-header-professional');
      return header ? getComputedStyle(header).background : null;
    });
    
    // Verify both use similar professional backdrop blur
    expect(modalHeaderBg).toContain('rgba(255, 255, 255, 0.95)');
    expect(workspaceHeaderBg).toContain('rgba(255, 255, 255, 0.95)');
    console.log('✅ Consistent header backgrounds verified');
    
    // Check metric card consistency
    const metricCardStyles = await page.evaluate(() => {
      const card = document.querySelector('.professional-metric-card');
      if (!card) return null;
      
      const style = getComputedStyle(card);
      return {
        borderRadius: style.borderRadius,
        padding: style.padding,
        boxShadow: style.boxShadow,
        background: style.background
      };
    });
    
    expect(metricCardStyles.borderRadius).toBe('12px');
    expect(metricCardStyles.padding).toBe('24px');
    console.log('✅ Consistent metric card styling verified');
    
    await page.locator('.workspace-back-btn').click();
    await page.waitForTimeout(500);
    
    // Test Processes workspace consistency
    await page.locator('.fab-main').click();
    await page.waitForTimeout(500);
    await page.locator('.fab-option:has-text("Manage Processes")').click();
    await page.waitForTimeout(1000);
    
    const processMetricCount = await page.locator('.professional-metric-card').count();
    expect(processMetricCount).toBe(3);
    console.log('✅ Consistent 3-metric layout verified across workspaces');
    
    await page.screenshot({ 
      path: 'test-results/design-consistency-final.png',
      fullPage: true 
    });
    
    console.log('✅ Design consistency validated across all interfaces');
  });
});