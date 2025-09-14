import { test, expect } from '@playwright/test';

test.describe('Focused UI Screenshots - Current State Documentation', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the business automation dashboard
        await page.goto('/workshops/business-automation-dashboard.html');
        
        // Wait for the page to fully load
        await page.waitForLoadState('networkidle');
        
        // Wait for any dynamic content to load
        await page.waitForTimeout(3000);
    });

    test('Capture Process Entry Modal (FAB > Add Process)', async ({ page }) => {
        console.log('📸 Capturing Process Entry Modal...');
        
        // Take screenshot of main dashboard first
        await page.screenshot({
            path: 'test-results/ui-documentation/process-entry-01-dashboard-before.png',
            fullPage: true
        });
        
        // Click the main FAB to open options
        await page.click('#fabMainBtn');
        await page.waitForTimeout(1000);
        
        // Screenshot FAB menu
        await page.screenshot({
            path: 'test-results/ui-documentation/process-entry-02-fab-menu.png',
            fullPage: true
        });
        
        // Click "Add Process" option
        const addProcessOption = page.locator('.fab-option').filter({ hasText: 'Add Process' });
        await addProcessOption.click();
        await page.waitForTimeout(2000);
        
        // Wait for modal to appear
        await page.waitForSelector('#processModal', { state: 'visible', timeout: 10000 });
        
        // Screenshot the modal
        await page.screenshot({
            path: 'test-results/ui-documentation/process-entry-03-modal-full-view.png',
            fullPage: true
        });
        
        // Screenshot just the modal content
        await page.locator('#processModal').screenshot({
            path: 'test-results/ui-documentation/process-entry-04-modal-focused.png'
        });
        
        console.log('✅ Process Entry Modal screenshots captured');
    });
    
    test('Capture Manage Projects Workspace (FAB > Manage Projects)', async ({ page }) => {
        console.log('📸 Capturing Manage Projects Workspace...');
        
        // Click FAB to open options
        await page.click('#fabMainBtn');
        await page.waitForTimeout(1000);
        
        // Click "Manage Projects" option
        const manageProjectsOption = page.locator('.fab-option').filter({ hasText: 'Manage Projects' });
        await manageProjectsOption.click();
        await page.waitForTimeout(3000);
        
        // Try different selectors for the workspace
        const workspaceSelectors = [
            '.workspace-overlay',
            '.workspace-container', 
            '.workspace',
            '[class*="workspace"]'
        ];
        
        let workspaceFound = false;
        for (const selector of workspaceSelectors) {
            try {
                await page.waitForSelector(selector, { state: 'visible', timeout: 5000 });
                workspaceFound = true;
                console.log(`Found workspace with selector: ${selector}`);
                break;
            } catch (e) {
                console.log(`Workspace selector ${selector} not found, trying next...`);
            }
        }
        
        // Take screenshot regardless of workspace selector
        await page.screenshot({
            path: 'test-results/ui-documentation/manage-projects-01-full-view.png',
            fullPage: true
        });
        
        if (workspaceFound) {
            // Try to capture focused workspace content
            for (const selector of workspaceSelectors) {
                try {
                    const element = page.locator(selector);
                    if (await element.count() > 0) {
                        await element.screenshot({
                            path: 'test-results/ui-documentation/manage-projects-02-workspace-focused.png'
                        });
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
        }
        
        console.log('✅ Manage Projects Workspace screenshots captured');
    });
    
    test('Capture Manage Processes Workspace (FAB > Manage Processes)', async ({ page }) => {
        console.log('📸 Capturing Manage Processes Workspace...');
        
        // Click FAB to open options
        await page.click('#fabMainBtn');
        await page.waitForTimeout(1000);
        
        // Click "Manage Processes" option  
        const manageProcessesOption = page.locator('.fab-option').filter({ hasText: 'Manage Processes' });
        await manageProcessesOption.click();
        await page.waitForTimeout(3000);
        
        // Take screenshot of whatever is shown
        await page.screenshot({
            path: 'test-results/ui-documentation/manage-processes-01-full-view.png',
            fullPage: true
        });
        
        // Try to capture workspace content if it exists
        const workspaceSelectors = [
            '.workspace-overlay',
            '.workspace-container', 
            '.workspace',
            '[class*="workspace"]'
        ];
        
        for (const selector of workspaceSelectors) {
            try {
                const element = page.locator(selector);
                if (await element.count() > 0 && await element.isVisible()) {
                    await element.screenshot({
                        path: 'test-results/ui-documentation/manage-processes-02-workspace-focused.png'
                    });
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        
        console.log('✅ Manage Processes Workspace screenshots captured');
    });
    
    test('Capture UI Layout Analysis', async ({ page }) => {
        console.log('📸 Capturing UI layout analysis...');
        
        // Dashboard header
        const header = page.locator('.dashboard-header, header, .container > div:first-child');
        if (await header.count() > 0) {
            await header.first().screenshot({
                path: 'test-results/ui-documentation/layout-01-header.png'
            });
        }
        
        // Main content area
        const mainContent = page.locator('.dashboard-content, .container > div:not(:first-child)', 'main');
        if (await mainContent.count() > 0) {
            await mainContent.first().screenshot({
                path: 'test-results/ui-documentation/layout-02-main-content.png'
            });
        }
        
        // FAB in different states
        await page.locator('#fabCluster, .fab-cluster').screenshot({
            path: 'test-results/ui-documentation/layout-03-fab-closed.png'
        });
        
        await page.click('#fabMainBtn');
        await page.waitForTimeout(1000);
        
        await page.locator('#fabCluster, .fab-cluster').screenshot({
            path: 'test-results/ui-documentation/layout-04-fab-open.png'
        });
        
        // Different viewport sizes for responsive analysis
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.screenshot({
            path: 'test-results/ui-documentation/responsive-01-desktop-large.png',
            fullPage: false
        });
        
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.screenshot({
            path: 'test-results/ui-documentation/responsive-02-tablet.png',
            fullPage: false
        });
        
        await page.setViewportSize({ width: 375, height: 812 });
        await page.screenshot({
            path: 'test-results/ui-documentation/responsive-03-mobile.png',
            fullPage: false
        });
        
        console.log('✅ UI layout analysis screenshots captured');
    });
});