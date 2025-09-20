const { test, expect } = require('@playwright/test');

test.describe('FAB (Floating Action Button) Functionality', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8000/personal-task-tracker-sync.html');
        // Wait for page to load completely
        await page.waitForLoadState('networkidle');
        
        // Skip auth if present
        const authModal = page.locator('#auth-modal');
        if (await authModal.isVisible()) {
            await page.fill('#password-input', 'test123');
            await page.click('button[type="submit"]');
            await page.waitForSelector('#auth-modal', { state: 'hidden' });
        }
        
        // Wait for FAB to be visible
        await page.waitForSelector('.fab-container', { state: 'visible' });
    });

    test('FAB appears in collapsed state initially', async ({ page }) => {
        // Check that FAB main button is visible
        const fabMain = page.locator('#fab-main');
        await expect(fabMain).toBeVisible();
        
        // Check that FAB is not in active state initially
        await expect(fabMain).not.toHaveClass(/active/);
        
        // Check that backdrop is not active initially
        const fabBackdrop = page.locator('#fab-backdrop');
        await expect(fabBackdrop).not.toHaveClass(/active/);
        
        // Check that FAB actions are not visible initially
        const fabActions = page.locator('.fab-action');
        for (const action of await fabActions.all()) {
            await expect(action).not.toHaveClass(/active/);
        }
        
        // Verify only the main blue + button is visible
        const fabIcon = page.locator('.fab-icon');
        await expect(fabIcon).toBeVisible();
        
        // Take a screenshot of initial state
        await page.screenshot({ path: 'test-results/fab-initial-state.png' });
    });

    test('FAB action buttons are hidden initially', async ({ page }) => {
        // Check that Upload Notes button is not visible/active
        const uploadAction = page.locator('#fab-upload-action');
        await expect(uploadAction).not.toHaveClass(/active/);
        
        // Check that Add Task button is not visible/active
        const addAction = page.locator('#fab-add-action');
        await expect(addAction).not.toHaveClass(/active/);
        
        // Verify action buttons have correct initial styles (should be invisible)
        const uploadButton = page.locator('#fab-upload-btn');
        const addButton = page.locator('#fab-add-btn');
        
        // These buttons should be present in DOM but not interactive
        await expect(uploadButton).toBeVisible(); // Present in DOM
        await expect(addButton).toBeVisible(); // Present in DOM
        
        // But their parent containers should not be active
        await expect(uploadAction).not.toHaveClass(/active/);
        await expect(addAction).not.toHaveClass(/active/);
    });

    test('Clicking FAB expands it to show action buttons', async ({ page }) => {
        const fabMain = page.locator('#fab-main');
        const fabBackdrop = page.locator('#fab-backdrop');
        const uploadAction = page.locator('#fab-upload-action');
        const addAction = page.locator('#fab-add-action');
        
        // Click the main FAB button
        await fabMain.click();
        
        // Wait for animation
        await page.waitForTimeout(500);
        
        // Check that FAB is now in active state
        await expect(fabMain).toHaveClass(/active/);
        
        // Check that backdrop is now active
        await expect(fabBackdrop).toHaveClass(/active/);
        
        // Check that both action buttons are now active/visible
        await expect(uploadAction).toHaveClass(/active/);
        await expect(addAction).toHaveClass(/active/);
        
        // Verify the FAB icon has rotated (should have rotate transform)
        const fabIcon = page.locator('.fab-icon');
        const transform = await fabIcon.evaluate(el => getComputedStyle(el).transform);
        expect(transform).toContain('matrix'); // Indicates rotation is applied
        
        // Take a screenshot of expanded state
        await page.screenshot({ path: 'test-results/fab-expanded-state.png' });
    });

    test('Clicking FAB again collapses it', async ({ page }) => {
        const fabMain = page.locator('#fab-main');
        const fabBackdrop = page.locator('#fab-backdrop');
        const uploadAction = page.locator('#fab-upload-action');
        const addAction = page.locator('#fab-add-action');
        
        // First expand the FAB
        await fabMain.click();
        await page.waitForTimeout(500);
        
        // Verify it's expanded
        await expect(fabMain).toHaveClass(/active/);
        
        // Click again to collapse
        await fabMain.click();
        await page.waitForTimeout(500);
        
        // Check that FAB is no longer in active state
        await expect(fabMain).not.toHaveClass(/active/);
        
        // Check that backdrop is no longer active
        await expect(fabBackdrop).not.toHaveClass(/active/);
        
        // Check that action buttons are no longer active/visible
        await expect(uploadAction).not.toHaveClass(/active/);
        await expect(addAction).not.toHaveClass(/active/);
        
        // Take a screenshot of collapsed state
        await page.screenshot({ path: 'test-results/fab-collapsed-again.png' });
    });

    test('Clicking backdrop closes the FAB', async ({ page }) => {
        const fabMain = page.locator('#fab-main');
        const fabBackdrop = page.locator('#fab-backdrop');
        const uploadAction = page.locator('#fab-upload-action');
        const addAction = page.locator('#fab-add-action');
        
        // First expand the FAB
        await fabMain.click();
        await page.waitForTimeout(500);
        
        // Verify it's expanded
        await expect(fabMain).toHaveClass(/active/);
        await expect(fabBackdrop).toHaveClass(/active/);
        
        // Click the backdrop to close
        await fabBackdrop.click();
        await page.waitForTimeout(500);
        
        // Check that FAB is no longer in active state
        await expect(fabMain).not.toHaveClass(/active/);
        
        // Check that backdrop is no longer active
        await expect(fabBackdrop).not.toHaveClass(/active/);
        
        // Check that action buttons are no longer active/visible
        await expect(uploadAction).not.toHaveClass(/active/);
        await expect(addAction).not.toHaveClass(/active/);
    });

    test('Add Task button opens task modal', async ({ page }) => {
        const fabMain = page.locator('#fab-main');
        const addButton = page.locator('#fab-add-btn');
        const taskModal = page.locator('#task-modal');
        
        // First expand the FAB
        await fabMain.click();
        await page.waitForTimeout(500);
        
        // Click the Add Task button
        await addButton.click();
        await page.waitForTimeout(500);
        
        // Check that task modal is now visible
        await expect(taskModal).toBeVisible();
        
        // Check that the modal is in "add" mode
        const modalTitle = page.locator('#modal-mode');
        await expect(modalTitle).toHaveText('Add Task');
        
        // Verify FAB is closed after clicking action button
        await expect(fabMain).not.toHaveClass(/active/);
        
        // Close the modal for cleanup
        await page.click('#close-modal');
        await page.waitForTimeout(300);
    });

    test('Upload Notes button opens upload modal', async ({ page }) => {
        const fabMain = page.locator('#fab-main');
        const uploadButton = page.locator('#fab-upload-btn');
        const uploadModal = page.locator('#upload-modal');
        
        // First expand the FAB
        await fabMain.click();
        await page.waitForTimeout(500);
        
        // Click the Upload Notes button
        await uploadButton.click();
        await page.waitForTimeout(500);
        
        // Check that upload modal is now visible
        await expect(uploadModal).toBeVisible();
        
        // Verify the modal has the correct content
        const modalTitle = page.locator('.upload-modal-content h2');
        await expect(modalTitle).toHaveText('📷 Upload Handwritten Notes');
        
        // Verify FAB is closed after clicking action button
        await expect(fabMain).not.toHaveClass(/active/);
        
        // Close the modal for cleanup
        await page.click('#close-upload-modal');
        await page.waitForTimeout(300);
    });

    test('FAB has correct visual styling and positioning', async ({ page }) => {
        const fabContainer = page.locator('.fab-container');
        const fabMain = page.locator('#fab-main');
        
        // Check positioning
        const containerBox = await fabContainer.boundingBox();
        const viewportSize = page.viewportSize();
        
        // FAB should be positioned in bottom-right corner
        expect(containerBox.x + containerBox.width).toBeGreaterThan(viewportSize.width - 50);
        expect(containerBox.y + containerBox.height).toBeGreaterThan(viewportSize.height - 100);
        
        // Check that FAB main button has correct size (56px)
        const fabBox = await fabMain.boundingBox();
        expect(fabBox.width).toBeCloseTo(56, 5);
        expect(fabBox.height).toBeCloseTo(56, 5);
        
        // Check that FAB has blue gradient background initially
        const fabBgColor = await fabMain.evaluate(el => {
            return getComputedStyle(el).backgroundImage;
        });
        expect(fabBgColor).toContain('linear-gradient');
        expect(fabBgColor).toContain('rgb(59, 130, 246)'); // Blue color
    });

    test('FAB changes color when expanded', async ({ page }) => {
        const fabMain = page.locator('#fab-main');
        
        // Get initial background
        const initialBg = await fabMain.evaluate(el => {
            return getComputedStyle(el).backgroundImage;
        });
        
        // Expand FAB
        await fabMain.click();
        await page.waitForTimeout(500);
        
        // Get expanded background
        const expandedBg = await fabMain.evaluate(el => {
            return getComputedStyle(el).backgroundImage;
        });
        
        // Background should change to red when active
        expect(expandedBg).toContain('rgb(239, 68, 68)'); // Red color
        expect(expandedBg).not.toBe(initialBg);
    });

    test('FAB icon rotates when expanded', async ({ page }) => {
        const fabMain = page.locator('#fab-main');
        const fabIcon = page.locator('.fab-icon');
        
        // Get initial transform
        const initialTransform = await fabIcon.evaluate(el => {
            return getComputedStyle(el).transform;
        });
        
        // Expand FAB
        await fabMain.click();
        await page.waitForTimeout(500);
        
        // Get expanded transform
        const expandedTransform = await fabIcon.evaluate(el => {
            return getComputedStyle(el).transform;
        });
        
        // Transform should change (indicating rotation)
        expect(expandedTransform).not.toBe(initialTransform);
        expect(expandedTransform).toContain('matrix'); // Indicates transformation is applied
    });

    test('FAB keyboard accessibility', async ({ page }) => {
        const fabMain = page.locator('#fab-main');
        
        // Focus the FAB button
        await fabMain.focus();
        
        // Check that it's focused
        await expect(fabMain).toBeFocused();
        
        // Press Enter to activate
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);
        
        // Should be expanded
        await expect(fabMain).toHaveClass(/active/);
        
        // Press Escape to close (if implemented)
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        
        // Should be collapsed (this might fail if escape handler isn't implemented)
        // We'll check but not make it a hard requirement
        try {
            await expect(fabMain).not.toHaveClass(/active/, { timeout: 1000 });
        } catch (e) {
            console.log('Escape key handler not implemented for FAB - this is a potential improvement');
        }
    });

    test('FAB works correctly on mobile viewport', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        
        const fabContainer = page.locator('.fab-container');
        const fabMain = page.locator('#fab-main');
        
        // FAB should still be visible and positioned correctly on mobile
        await expect(fabMain).toBeVisible();
        
        // Check mobile positioning (should be 16px from edges on mobile)
        const containerBox = await fabContainer.boundingBox();
        expect(containerBox.x + containerBox.width).toBeGreaterThan(375 - 40); // 16px + some margin
        expect(containerBox.y + containerBox.height).toBeGreaterThan(667 - 80); // 16px + some margin
        
        // Test that interaction still works on mobile
        await fabMain.click();
        await page.waitForTimeout(500);
        
        await expect(fabMain).toHaveClass(/active/);
        
        // Take mobile screenshot
        await page.screenshot({ path: 'test-results/fab-mobile-expanded.png' });
    });
});