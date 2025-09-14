import { test, expect } from '@playwright/test';

test.describe('Dashboard Design Snapshot', () => {
  const dashboardUrl = '/workshops/business-automation-dashboard.html';

  test('Capture current dashboard design for UI agent reference', async ({ page }) => {
    console.log('\n=== CAPTURING: Current Dashboard Design ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(4000); // Allow for full loading
    
    // Switch to testSept9b project to show actual data
    const dropdown = page.locator('#headerProjectSelector, #projectSelector');
    if (await dropdown.count() > 0) {
      await dropdown.first().selectOption('7029fc69-769d-44e6-bc25-c746e38deb65'); // testSept9b
      await page.waitForTimeout(3000);
    }
    
    // Take full dashboard screenshot
    await page.screenshot({ 
      path: 'test-results/current-dashboard-design.png',
      fullPage: true 
    });
    
    // Take screenshots of specific sections for UI reference
    
    // 1. Header and navigation
    const header = page.locator('header, .header, .top-nav, .dashboard-header');
    if (await header.count() > 0) {
      await header.first().screenshot({ path: 'test-results/header-design.png' });
    }
    
    // 2. FAB button current state
    const fab = page.locator('.fab, .floating-action-button, .fab-main');
    if (await fab.count() > 0) {
      await fab.first().screenshot({ path: 'test-results/fab-current-design.png' });
    }
    
    // 3. Main metrics section
    const metrics = page.locator('.kpi-cards, .metrics-section, .main-metrics');
    if (await metrics.count() > 0) {
      await metrics.first().screenshot({ path: 'test-results/metrics-section-design.png' });
    }
    
    // 4. Roadmap/recommendations section
    const roadmap = page.locator('#implementationRoadmap, .roadmap-section, .recommendations');
    if (await roadmap.count() > 0) {
      await roadmap.first().screenshot({ path: 'test-results/roadmap-section-design.png' });
    }
    
    // 5. Click FAB to see current menu
    if (await fab.count() > 0) {
      await fab.first().click();
      await page.waitForTimeout(1000);
      
      // Screenshot FAB menu
      const fabMenu = page.locator('.fab-menu, .fab-options, .fab-cluster');
      if (await fabMenu.count() > 0) {
        await fabMenu.first().screenshot({ path: 'test-results/fab-menu-current.png' });
      }
    }
    
    // Get color scheme and design elements
    const designInfo = await page.evaluate(() => {
      const computedStyle = getComputedStyle(document.body);
      const headerElement = document.querySelector('header, .header, .dashboard-header, .top-nav');
      const fabElement = document.querySelector('.fab, .floating-action-button');
      const cardElement = document.querySelector('.kpi-card, .card, .metric-card');
      
      return {
        bodyBg: computedStyle.backgroundColor,
        fontFamily: computedStyle.fontFamily,
        headerBg: headerElement ? getComputedStyle(headerElement).backgroundColor : null,
        fabColors: fabElement ? {
          bg: getComputedStyle(fabElement).backgroundColor,
          color: getComputedStyle(fabElement).color
        } : null,
        cardStyle: cardElement ? {
          bg: getComputedStyle(cardElement).backgroundColor,
          border: getComputedStyle(cardElement).border,
          borderRadius: getComputedStyle(cardElement).borderRadius,
          boxShadow: getComputedStyle(cardElement).boxShadow
        } : null
      };
    });
    
    console.log('Current design elements:', JSON.stringify(designInfo, null, 2));
    
    console.log('✅ Dashboard design snapshot captured for UI agent reference');
  });
});