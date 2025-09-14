import { test, expect } from '@playwright/test';

test.describe('FAB Functionality - Corrected Implementation', () => {
  const dashboardUrl = '/workshops/business-automation-dashboard.html';

  test('Validate FAB Add Process opens correct modal', async ({ page }) => {
    console.log('\n=== TESTING: FAB Add Process Functionality ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Select a project first
    await page.locator('#headerProjectSelector').selectOption('7029fc69-769d-44e6-bc25-c746e38deb65');
    await page.waitForTimeout(2000);
    
    // Take screenshot before opening FAB
    await page.screenshot({ 
      path: 'test-results/fab-corrected-before.png',
      fullPage: true 
    });
    
    // Click FAB to expand options
    const fab = page.locator('.fab-main');
    await fab.click();
    await page.waitForTimeout(500);
    
    // Take screenshot of expanded FAB
    await page.screenshot({ 
      path: 'test-results/fab-corrected-expanded.png',
      fullPage: true 
    });
    
    // Verify Add Process option exists
    const addProcessOption = page.locator('.fab-option:has-text("Add Process")');
    await expect(addProcessOption).toBeVisible();
    
    // Click Add Process
    await addProcessOption.click();
    await page.waitForTimeout(1000);
    
    // Verify process modal opened correctly
    const processModal = page.locator('#processModal');
    await expect(processModal).toBeVisible();
    await expect(processModal).not.toHaveClass(/hidden/);
    
    // Verify modal shows correct content
    const modalTitle = page.locator('#processModal h2');
    const titleText = await modalTitle.textContent();
    expect(titleText).toBe('Add Business Process');
    
    // Take screenshot of opened process modal
    await page.screenshot({ 
      path: 'test-results/fab-corrected-process-modal.png',
      fullPage: true 
    });
    
    console.log('✅ FAB Add Process opens correct modal');
    
    // Close modal
    await page.locator('#processModal button[onclick="closeProcessModal()"]').click();
    await page.waitForTimeout(500);
    
    // Verify modal closed
    await expect(processModal).toHaveClass(/hidden/);
  });

  test('Validate FAB Manage Projects opens workspace correctly', async ({ page }) => {
    console.log('\n=== TESTING: FAB Manage Projects Workspace ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Click FAB to expand
    await page.locator('.fab-main').click();
    await page.waitForTimeout(500);
    
    // Verify Manage Projects option exists (updated label)
    const manageProjectsOption = page.locator('.fab-option:has-text("Manage Projects")');
    await expect(manageProjectsOption).toBeVisible();
    console.log('✅ FAB shows "Manage Projects" option with correct label');
    
    // Click Manage Projects
    await manageProjectsOption.click();
    await page.waitForTimeout(1000);
    
    // Verify workspace opened instead of simple modal
    const workspace = page.locator('#contextualWorkspace');
    await expect(workspace).toBeVisible();
    await expect(workspace).toHaveClass(/active/);
    
    // Verify workspace title
    const workspaceTitle = page.locator('.workspace-title');
    const titleText = await workspaceTitle.textContent();
    expect(titleText).toBe('Project Overview');
    console.log('✅ Project workspace opened with correct title');
    
    // Take screenshot of the workspace
    await page.screenshot({ 
      path: 'test-results/fab-corrected-project-workspace.png',
      fullPage: true 
    });
    
    // Verify project list is visible
    const projectList = page.locator('#workspaceProjectList');
    await expect(projectList).toBeVisible();
    
    // Verify projects are displayed
    const projectCards = page.locator('#workspaceProjectList .admin-control-card');
    const cardCount = await projectCards.count();
    expect(cardCount).toBeGreaterThan(0);
    console.log(`✅ Workspace shows ${cardCount} project(s)`);
    
    // Verify workspace has process count for each project
    const firstProjectProcessCount = await page.locator('#workspaceProjectList .admin-control-card:first-child')
      .locator('text=/\\d+ processes/')
      .textContent();
    console.log(`✅ Project shows process count: ${firstProjectProcessCount}`);
    
    // Test workspace close functionality
    await page.locator('.workspace-back-btn').click();
    await page.waitForTimeout(500);
    
    // Verify workspace closed
    await expect(workspace).not.toHaveClass(/active/);
    console.log('✅ Workspace closes correctly');
  });

  test('Validate complete FAB workflow integration', async ({ page }) => {
    console.log('\n=== TESTING: Complete FAB Workflow Integration ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(4000);
    
    // 1. Test project management workflow
    await page.locator('.fab-main').click();
    await page.waitForTimeout(500);
    
    // Open project workspace
    await page.locator('.fab-option:has-text("Manage Projects")').click();
    await page.waitForTimeout(1000);
    
    // Verify workspace shows current project data correctly
    const workspace = page.locator('#contextualWorkspace');
    await expect(workspace).toBeVisible();
    
    // Take workspace screenshot
    await page.screenshot({ 
      path: 'test-results/fab-workflow-workspace.png',
      fullPage: true 
    });
    
    // Close workspace
    await page.locator('.workspace-back-btn').click();
    await page.waitForTimeout(500);
    
    // 2. Test add process workflow
    await page.locator('.fab-main').click();
    await page.waitForTimeout(500);
    
    await page.locator('.fab-option:has-text("Add Process")').click();
    await page.waitForTimeout(1000);
    
    // Verify process modal shows correct project context
    const processModal = page.locator('#processModal');
    await expect(processModal).toBeVisible();
    
    // Check project indicator in modal
    const projectIndicator = page.locator('#processModalProjectName');
    const projectName = await projectIndicator.textContent();
    console.log(`Process modal shows project context: ${projectName}`);
    
    // Take process modal screenshot
    await page.screenshot({ 
      path: 'test-results/fab-workflow-process-modal.png',
      fullPage: true 
    });
    
    // Close process modal
    await page.locator('#processModal button[onclick="closeProcessModal()"]').click();
    await page.waitForTimeout(500);
    
    console.log('✅ Complete FAB workflow integration working correctly');
    
    // Final dashboard screenshot
    await page.screenshot({ 
      path: 'test-results/fab-workflow-complete.png',
      fullPage: true 
    });
  });
});