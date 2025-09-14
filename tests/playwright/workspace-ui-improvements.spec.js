import { test, expect } from '@playwright/test';

test.describe('Workspace UI Improvements - Professional Design', () => {
  const dashboardUrl = '/workshops/business-automation-dashboard.html';

  test('Capture improved Project Overview workspace for UI evaluation', async ({ page }) => {
    console.log('\n=== TESTING: Professional Project Overview Workspace ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(4000);
    
    // Take before screenshot
    await page.screenshot({ 
      path: 'test-results/workspace-ui-before-improvements.png',
      fullPage: true 
    });
    
    // Open Project Overview workspace via FAB
    await page.locator('.fab-main').click();
    await page.waitForTimeout(500);
    
    // Click Manage Projects to open workspace
    await page.locator('.fab-option:has-text("Manage Projects")').click();
    await page.waitForTimeout(1500);
    
    // Verify workspace opened
    const workspace = page.locator('#contextualWorkspace');
    await expect(workspace).toBeVisible();
    await expect(workspace).toHaveClass(/active/);
    
    // Capture full workspace view
    await page.screenshot({ 
      path: 'test-results/workspace-ui-professional-full.png',
      fullPage: true 
    });
    
    // Verify improvements implemented
    console.log('\n=== VERIFYING UI IMPROVEMENTS ===');
    
    // 1. Verify "Full View" badge is removed
    const fullViewBadge = page.locator('.workspace-badge:has-text("Full View")');
    const badgeExists = await fullViewBadge.count();
    expect(badgeExists).toBe(0);
    console.log('✅ "Full View" badge removed successfully');
    
    // 2. Verify professional header structure
    const professionalHeader = page.locator('.workspace-header-professional');
    await expect(professionalHeader).toBeVisible();
    console.log('✅ Professional header class applied');
    
    // 3. Verify title group structure
    const titleGroup = page.locator('.workspace-title-group');
    await expect(titleGroup).toBeVisible();
    
    const title = page.locator('.workspace-title');
    const titleText = await title.textContent();
    expect(titleText).toBe('Project Overview');
    
    const description = page.locator('.workspace-description');
    const descriptionText = await description.textContent();
    expect(descriptionText).toBe('Manage and organize your automation projects');
    console.log('✅ Title and description properly structured');
    
    // 4. Verify "New Project" button is in header
    const newProjectBtn = page.locator('.new-project-btn');
    await expect(newProjectBtn).toBeVisible();
    
    const buttonText = await newProjectBtn.textContent();
    expect(buttonText).toContain('New Project');
    console.log('✅ "New Project" button moved to header');
    
    // 5. Verify professional close button
    const closeBtn = page.locator('.btn-system-close');
    await expect(closeBtn).toBeVisible();
    console.log('✅ Professional close button implemented');
    
    // 6. Verify professional back button
    const backBtn = page.locator('.workspace-back-btn');
    await expect(backBtn).toBeVisible();
    console.log('✅ Professional back button implemented');
    
    // Capture header detail
    const header = page.locator('.workspace-header-professional');
    await header.screenshot({ 
      path: 'test-results/workspace-ui-header-detail.png'
    });
    
    // Test button interactions
    console.log('\n=== TESTING BUTTON INTERACTIONS ===');
    
    // Test New Project button hover
    await newProjectBtn.hover();
    await page.waitForTimeout(300);
    await newProjectBtn.screenshot({ 
      path: 'test-results/workspace-ui-new-project-hover.png'
    });
    console.log('✅ New Project button hover state captured');
    
    // Test close button hover
    await closeBtn.hover();
    await page.waitForTimeout(300);
    await closeBtn.screenshot({ 
      path: 'test-results/workspace-ui-close-hover.png'
    });
    console.log('✅ Close button hover state captured');
    
    // Test back button hover
    await backBtn.hover();
    await page.waitForTimeout(300);
    await backBtn.screenshot({ 
      path: 'test-results/workspace-ui-back-hover.png'
    });
    console.log('✅ Back button hover state captured');
    
    // Capture statistics section
    const statsSection = page.locator('.grid.grid-cols-1.md\\:grid-cols-3');
    await statsSection.screenshot({ 
      path: 'test-results/workspace-ui-stats-section.png'
    });
    console.log('✅ Statistics section captured');
    
    // Test responsive behavior
    console.log('\n=== TESTING RESPONSIVE DESIGN ===');
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await page.screenshot({ 
      path: 'test-results/workspace-ui-tablet-view.png',
      fullPage: true 
    });
    console.log('✅ Tablet view captured');
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);
    await page.screenshot({ 
      path: 'test-results/workspace-ui-mobile-view.png',
      fullPage: true 
    });
    console.log('✅ Mobile view captured');
    
    // Reset to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);
    
    // Test New Project button functionality
    console.log('\n=== TESTING FUNCTIONALITY ===');
    
    await newProjectBtn.click();
    await page.waitForTimeout(1000);
    
    // Verify project modal opens
    const projectModal = page.locator('#projectModal');
    await expect(projectModal).toBeVisible();
    console.log('✅ New Project button functionality works');
    
    // Close modal
    await page.locator('#projectModal button[onclick="closeProjectModal()"]').first().click();
    await page.waitForTimeout(500);
    
    // Test back button functionality
    await backBtn.click();
    await page.waitForTimeout(500);
    
    // Verify workspace closes
    await expect(workspace).not.toHaveClass(/active/);
    console.log('✅ Back button functionality works');
    
    // Final screenshot
    await page.screenshot({ 
      path: 'test-results/workspace-ui-final-state.png',
      fullPage: true 
    });
    
    console.log('\n=== UI IMPROVEMENTS VERIFICATION COMPLETE ===');
    console.log('🎯 All professional design improvements implemented successfully');
  });

  test('Compare before and after design improvements', async ({ page }) => {
    console.log('\n=== DESIGN COMPARISON TEST ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Open workspace
    await page.locator('.fab-main').click();
    await page.waitForTimeout(500);
    await page.locator('.fab-option:has-text("Manage Projects")').click();
    await page.waitForTimeout(1500);
    
    // Analyze design elements
    const designAnalysis = await page.evaluate(() => {
      const header = document.querySelector('.workspace-header-professional');
      const titleGroup = document.querySelector('.workspace-title-group');
      const newProjectBtn = document.querySelector('.new-project-btn');
      const closeBtn = document.querySelector('.btn-system-close');
      const fullViewBadge = document.querySelector('.workspace-badge');
      
      return {
        hasWorkspaceHeader: !!header,
        hasTitleGroup: !!titleGroup,
        hasNewProjectBtn: !!newProjectBtn,
        hasCloseBtn: !!closeBtn,
        hasFullViewBadge: !!fullViewBadge,
        headerStyles: header ? {
          background: getComputedStyle(header).background,
          backdropFilter: getComputedStyle(header).backdropFilter,
          borderBottom: getComputedStyle(header).borderBottom,
          boxShadow: getComputedStyle(header).boxShadow
        } : null
      };
    });
    
    console.log('Design Analysis Results:', designAnalysis);
    
    // Validate improvements
    expect(designAnalysis.hasWorkspaceHeader).toBe(true);
    expect(designAnalysis.hasTitleGroup).toBe(true);
    expect(designAnalysis.hasNewProjectBtn).toBe(true);
    expect(designAnalysis.hasCloseBtn).toBe(true);
    expect(designAnalysis.hasFullViewBadge).toBe(false);
    
    console.log('✅ All design improvements verified through DOM analysis');
  });
});