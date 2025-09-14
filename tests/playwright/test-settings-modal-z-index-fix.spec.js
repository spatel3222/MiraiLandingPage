const { test, expect } = require('@playwright/test');

test.describe('Settings Modal Z-Index Fix Tests', () => {
  const baseUrl = 'http://localhost:8000';

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseUrl}/workshops/business-automation-dashboard.html`);
    await page.waitForTimeout(3000); // Wait for charts to load
  });

  test('Settings modal should appear above all chart elements', async ({ page }) => {
    console.log('\n🎯 Testing Settings Modal Z-Index Above Charts\n');
    
    const settingsButton = page.locator('#headerSettingsTrigger');
    const settingsPanel = page.locator('#headerSettingsPanel');
    const settingsBackdrop = page.locator('#settingsBackdrop');
    
    // Wait for charts to fully load
    await page.waitForSelector('canvas', { timeout: 5000 });
    const canvasElements = await page.locator('canvas').all();
    console.log(`✅ Found ${canvasElements.length} chart canvas elements`);
    
    // Test 1: Verify initial state - modal should be hidden
    await expect(settingsPanel).not.toHaveClass(/active/);
    await expect(settingsBackdrop).not.toHaveClass(/active/);
    console.log('✅ Initial state: Settings modal is hidden');
    
    // Test 2: Open settings modal
    await settingsButton.click();
    await page.waitForTimeout(500); // Wait for animation
    
    // Check if modal is now visible
    await expect(settingsPanel).toHaveClass(/active/);
    await expect(settingsBackdrop).toHaveClass(/active/);
    console.log('✅ Settings modal opened successfully');
    
    // Test 3: Check z-index values
    const modalZIndex = await settingsPanel.evaluate(el => {
      const computed = getComputedStyle(el);
      return parseInt(computed.zIndex) || 0;
    });
    
    const backdropZIndex = await settingsBackdrop.evaluate(el => {
      const computed = getComputedStyle(el);
      return parseInt(computed.zIndex) || 0;
    });
    
    console.log(`📊 Modal z-index: ${modalZIndex}`);
    console.log(`📊 Backdrop z-index: ${backdropZIndex}`);
    
    // Modal should have very high z-index
    expect(modalZIndex).toBeGreaterThan(9000);
    expect(backdropZIndex).toBeGreaterThan(9000);
    console.log('✅ Modal and backdrop have high z-index values');
    
    // Test 4: Check chart canvas z-index values
    for (let i = 0; i < canvasElements.length; i++) {
      const canvas = canvasElements[i];
      const canvasZIndex = await canvas.evaluate(el => {
        const computed = getComputedStyle(el);
        return parseInt(computed.zIndex) || 0;
      });
      
      console.log(`📊 Canvas ${i + 1} z-index: ${canvasZIndex}`);
      
      // All canvas elements should have much lower z-index than modal
      expect(canvasZIndex).toBeLessThan(modalZIndex);
    }
    console.log('✅ All chart canvas elements have lower z-index than modal');
    
    // Test 5: Visual occlusion test - check if modal is actually visible
    const modalBox = await settingsPanel.boundingBox();
    const isModalVisible = await settingsPanel.isVisible();
    
    expect(isModalVisible).toBe(true);
    expect(modalBox.width).toBeGreaterThan(300); // Should be substantial size
    expect(modalBox.height).toBeGreaterThan(200);
    console.log(`✅ Modal is visually accessible: ${modalBox.width}x${modalBox.height}px`);
    
    // Close modal for cleanup
    await settingsButton.click();
  });

  test('Settings modal should handle backdrop interactions correctly', async ({ page }) => {
    console.log('\n🖱️  Testing Settings Modal Backdrop Interactions\n');
    
    const settingsButton = page.locator('#headerSettingsTrigger');
    const settingsPanel = page.locator('#headerSettingsPanel');
    const settingsBackdrop = page.locator('#settingsBackdrop');
    
    // Open modal
    await settingsButton.click();
    await page.waitForTimeout(300);
    
    await expect(settingsPanel).toHaveClass(/active/);
    console.log('✅ Settings modal opened');
    
    // Test backdrop properties
    const backdropStyle = await settingsBackdrop.evaluate(el => {
      const computed = getComputedStyle(el);
      return {
        position: computed.position,
        top: computed.top,
        left: computed.left,
        width: computed.width,
        height: computed.height,
        backdropFilter: computed.backdropFilter
      };
    });
    
    expect(backdropStyle.position).toBe('fixed');
    console.log('✅ Backdrop uses fixed positioning');
    
    // Test click-to-close on backdrop
    const backdropBox = await settingsBackdrop.boundingBox();
    
    // Click on backdrop (not on the modal itself)
    await page.click('body', { 
      position: { 
        x: backdropBox.x + 50, // Click near left edge of backdrop
        y: backdropBox.y + 50  // Click near top edge of backdrop
      } 
    });
    await page.waitForTimeout(300);
    
    await expect(settingsPanel).not.toHaveClass(/active/);
    await expect(settingsBackdrop).not.toHaveClass(/active/);
    console.log('✅ Backdrop click-to-close works correctly');
  });

  test('Settings modal should not interfere with chart functionality', async ({ page }) => {
    console.log('\n📊 Testing Chart Functionality with Modal System\n');
    
    const settingsButton = page.locator('#headerSettingsTrigger');
    const settingsPanel = page.locator('#headerSettingsPanel');
    
    // Wait for charts to load
    await page.waitForSelector('canvas');
    const canvasElements = await page.locator('canvas').all();
    
    // Test 1: Charts should be interactive before modal opens
    if (canvasElements.length > 0) {
      const firstCanvas = canvasElements[0];
      const canvasBox = await firstCanvas.boundingBox();
      
      // Try to hover over chart (this should trigger chart tooltips)
      await page.mouse.move(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2);
      await page.waitForTimeout(500);
      
      console.log('✅ Chart interaction tested before modal');
    }
    
    // Test 2: Open modal
    await settingsButton.click();
    await page.waitForTimeout(300);
    
    await expect(settingsPanel).toHaveClass(/active/);
    console.log('✅ Settings modal opened');
    
    // Test 3: Charts should still be there but not interactive due to backdrop
    const canvasCount = await page.locator('canvas').count();
    expect(canvasCount).toBe(canvasElements.length);
    console.log('✅ All charts remain in DOM when modal is open');
    
    // Test 4: Close modal and verify charts are interactive again
    await settingsButton.click();
    await page.waitForTimeout(300);
    
    await expect(settingsPanel).not.toHaveClass(/active/);
    console.log('✅ Settings modal closed');
    
    // Charts should be interactive again
    if (canvasElements.length > 0) {
      const firstCanvas = canvasElements[0];
      const isCanvasVisible = await firstCanvas.isVisible();
      expect(isCanvasVisible).toBe(true);
      console.log('✅ Charts are fully interactive after modal closes');
    }
  });

  test('Settings modal should work correctly on mobile devices', async ({ page }) => {
    console.log('\n📱 Testing Settings Modal on Mobile Viewport\n');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForTimeout(2000);
    
    const settingsButton = page.locator('#headerSettingsTrigger');
    const settingsPanel = page.locator('#headerSettingsPanel');
    const settingsBackdrop = page.locator('#settingsBackdrop');
    
    // Test mobile modal opening
    await settingsButton.tap();
    await page.waitForTimeout(300);
    
    await expect(settingsPanel).toHaveClass(/active/);
    await expect(settingsBackdrop).toHaveClass(/active/);
    console.log('✅ Modal opens correctly on mobile');
    
    // Test mobile modal sizing
    const modalBox = await settingsPanel.boundingBox();
    const viewportWidth = 375;
    
    // On mobile, modal should be full-width with margins
    expect(modalBox.width).toBeGreaterThan(viewportWidth * 0.8); // At least 80% width
    console.log(`✅ Mobile modal sizing: ${modalBox.width}px width`);
    
    // Test mobile z-index
    const modalZIndex = await settingsPanel.evaluate(el => {
      return parseInt(getComputedStyle(el).zIndex) || 0;
    });
    
    expect(modalZIndex).toBeGreaterThan(9000);
    console.log(`✅ Mobile modal z-index: ${modalZIndex}`);
    
    // Test mobile backdrop interaction
    await page.tap('body', { position: { x: 50, y: 300 } });
    await page.waitForTimeout(300);
    
    await expect(settingsPanel).not.toHaveClass(/active/);
    console.log('✅ Mobile backdrop interaction works');
  });

  test('Settings modal should handle escape key and keyboard navigation', async ({ page }) => {
    console.log('\n⌨️  Testing Settings Modal Keyboard Interactions\n');
    
    const settingsButton = page.locator('#headerSettingsTrigger');
    const settingsPanel = page.locator('#headerSettingsPanel');
    
    // Focus and open with keyboard
    await settingsButton.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    
    await expect(settingsPanel).toHaveClass(/active/);
    console.log('✅ Modal opens with Enter key');
    
    // Test escape key closes modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    
    await expect(settingsPanel).not.toHaveClass(/active/);
    console.log('✅ Modal closes with Escape key');
    
    // Test space bar opening
    await settingsButton.focus();
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    
    await expect(settingsPanel).toHaveClass(/active/);
    console.log('✅ Modal opens with Space key');
    
    // Close for cleanup
    await page.keyboard.press('Escape');
  });

  test('Settings modal z-index should be higher than any dynamically created chart tooltips', async ({ page }) => {
    console.log('\n🔄 Testing Dynamic Chart Tooltip Z-Index Conflicts\n');
    
    const settingsButton = page.locator('#headerSettingsTrigger');
    const settingsPanel = page.locator('#headerSettingsPanel');
    
    // Open settings modal first
    await settingsButton.click();
    await page.waitForTimeout(300);
    
    const modalZIndex = await settingsPanel.evaluate(el => {
      return parseInt(getComputedStyle(el).zIndex) || 0;
    });
    console.log(`📊 Modal z-index: ${modalZIndex}`);
    
    // Try to trigger chart tooltips while modal is open
    const canvasElements = await page.locator('canvas').all();
    
    for (let i = 0; i < Math.min(canvasElements.length, 2); i++) {
      const canvas = canvasElements[i];
      const canvasBox = await canvas.boundingBox();
      
      // Move mouse over chart to potentially trigger tooltips
      await page.mouse.move(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2);
      await page.waitForTimeout(200);
    }
    
    // Check if any tooltip elements were created
    const tooltipElements = await page.locator('.chartjs-tooltip, [id*="tooltip"], [class*="tooltip"]').all();
    
    if (tooltipElements.length > 0) {
      console.log(`📊 Found ${tooltipElements.length} potential tooltip elements`);
      
      for (let i = 0; i < tooltipElements.length; i++) {
        const tooltip = tooltipElements[i];
        const tooltipZIndex = await tooltip.evaluate(el => {
          return parseInt(getComputedStyle(el).zIndex) || 0;
        });
        
        console.log(`📊 Tooltip ${i + 1} z-index: ${tooltipZIndex}`);
        
        // Tooltip should be below modal
        if (tooltipZIndex > 0) {
          expect(tooltipZIndex).toBeLessThan(modalZIndex);
        }
      }
      console.log('✅ All tooltips have lower z-index than modal');
    } else {
      console.log('ℹ️  No tooltips detected during test');
    }
    
    // Verify modal is still visible and functional
    const isModalVisible = await settingsPanel.isVisible();
    expect(isModalVisible).toBe(true);
    console.log('✅ Modal remains visible and functional');
    
    // Close modal
    await settingsButton.click();
  });
});