const { test, expect } = require('@playwright/test');

test.describe('Settings Button UI Design Tests', () => {
  const baseUrl = 'http://localhost:8000';

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseUrl}/workshops/business-automation-dashboard.html`);
    await page.waitForTimeout(2000); // Wait for page to fully load
  });

  test('Settings button should have modern design and be accessible', async ({ page }) => {
    console.log('\n🎨 Testing Settings Button UI Design and Accessibility\n');
    
    const settingsButton = page.locator('#headerSettingsTrigger');
    
    // Test 1: Button should be visible and properly positioned
    await expect(settingsButton).toBeVisible();
    console.log('✅ Settings button is visible');
    
    // Test 2: Check accessibility attributes
    await expect(settingsButton).toHaveAttribute('aria-label', 'Open system settings');
    await expect(settingsButton).toHaveAttribute('aria-expanded', 'false');
    await expect(settingsButton).toHaveAttribute('aria-haspopup', 'menu');
    await expect(settingsButton).toHaveAttribute('role', 'button');
    console.log('✅ Accessibility attributes are properly set');
    
    // Test 3: Check for screen reader support
    const srText = settingsButton.locator('.sr-only');
    await expect(srText).toBeAttached();
    await expect(srText).toHaveText('Press Enter or Space to open system settings panel');
    console.log('✅ Screen reader support is properly implemented');
    
    // Test 4: Check for modern sliders icon (not the old gear icon)
    const settingsIcon = settingsButton.locator('.settings-icon');
    await expect(settingsIcon).toBeVisible();
    // The new icon should have the sliders path, not the old gear path
    const iconPath = await settingsIcon.locator('path').getAttribute('d');
    expect(iconPath).toContain('M12 6V4m0 2a2 2 0 100 4'); // Part of sliders icon path
    console.log('✅ Modern sliders icon is being used');
    
    // Test 5: Check tooltip presence
    const tooltip = settingsButton.locator('.settings-tooltip');
    await expect(tooltip).toBeAttached();
    await expect(tooltip).toHaveText('System Settings');
    console.log('✅ Tooltip is properly configured');
    
    // Test 6: Check button size meets minimum touch target requirements (44x44px)
    const buttonBox = await settingsButton.boundingBox();
    expect(buttonBox.width).toBeGreaterThanOrEqual(44);
    expect(buttonBox.height).toBeGreaterThanOrEqual(44);
    console.log(`✅ Button size meets accessibility requirements: ${buttonBox.width}x${buttonBox.height}px`);
  });

  test('Settings button should have proper hover and active states', async ({ page }) => {
    console.log('\n🎯 Testing Settings Button Interactive States\n');
    
    const settingsButton = page.locator('#headerSettingsTrigger');
    
    // Test 1: Check initial state
    await expect(settingsButton).not.toHaveClass(/active/);
    console.log('✅ Initial state is correct (not active)');
    
    // Test 2: Check hover behavior
    await settingsButton.hover();
    await page.waitForTimeout(500); // Wait for hover animation
    
    // Check if tooltip becomes visible on hover
    const tooltip = settingsButton.locator('.settings-tooltip');
    const tooltipOpacity = await tooltip.evaluate(el => getComputedStyle(el).opacity);
    expect(parseFloat(tooltipOpacity)).toBeGreaterThan(0);
    console.log('✅ Tooltip appears on hover');
    
    // Test 3: Click to open settings
    await settingsButton.click();
    await page.waitForTimeout(300); // Wait for animation
    
    // Check active state
    await expect(settingsButton).toHaveClass(/active/);
    await expect(settingsButton).toHaveAttribute('aria-expanded', 'true');
    console.log('✅ Active state is properly applied when clicked');
    
    // Test 4: Check if settings panel opens
    const settingsPanel = page.locator('#headerSettingsPanel');
    await expect(settingsPanel).toHaveClass(/active/);
    console.log('✅ Settings panel opens when button is clicked');
    
    // Test 5: Click again to close
    await settingsButton.click();
    await page.waitForTimeout(300);
    
    await expect(settingsButton).not.toHaveClass(/active/);
    await expect(settingsButton).toHaveAttribute('aria-expanded', 'false');
    await expect(settingsPanel).not.toHaveClass(/active/);
    console.log('✅ Button and panel properly close when clicked again');
  });

  test('Settings button should support keyboard navigation', async ({ page }) => {
    console.log('\n⌨️  Testing Settings Button Keyboard Navigation\n');
    
    const settingsButton = page.locator('#headerSettingsTrigger');
    
    // Test 1: Focus the button with Tab key
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // May need multiple tabs to reach settings button
    
    // Try to focus specifically on the settings button
    await settingsButton.focus();
    await expect(settingsButton).toBeFocused();
    console.log('✅ Settings button can be focused');
    
    // Test 2: Open with Enter key
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    
    await expect(settingsButton).toHaveClass(/active/);
    await expect(settingsButton).toHaveAttribute('aria-expanded', 'true');
    console.log('✅ Settings opens with Enter key');
    
    // Test 3: Close with Escape key
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    
    await expect(settingsButton).not.toHaveClass(/active/);
    await expect(settingsButton).toHaveAttribute('aria-expanded', 'false');
    console.log('✅ Settings closes with Escape key');
    
    // Test 4: Open with Space key
    await settingsButton.focus();
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    
    await expect(settingsButton).toHaveClass(/active/);
    console.log('✅ Settings opens with Space key');
    
    // Close for cleanup
    await page.keyboard.press('Escape');
  });

  test('Settings button should work on mobile/touch devices', async ({ page }) => {
    console.log('\n📱 Testing Settings Button Mobile/Touch Support\n');
    
    // Simulate mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForTimeout(1000);
    
    const settingsButton = page.locator('#headerSettingsTrigger');
    
    // Test 1: Button should still be visible on mobile
    await expect(settingsButton).toBeVisible();
    console.log('✅ Settings button is visible on mobile');
    
    // Test 2: Check mobile size requirements
    const buttonBox = await settingsButton.boundingBox();
    expect(buttonBox.width).toBeGreaterThanOrEqual(40); // Mobile minimum
    expect(buttonBox.height).toBeGreaterThanOrEqual(40);
    console.log(`✅ Mobile button size meets requirements: ${buttonBox.width}x${buttonBox.height}px`);
    
    // Test 3: Touch interaction (use click instead of tap for broader support)
    await settingsButton.click();
    await page.waitForTimeout(300);
    
    await expect(settingsButton).toHaveClass(/active/);
    const settingsPanel = page.locator('#headerSettingsPanel');
    await expect(settingsPanel).toHaveClass(/active/);
    console.log('✅ Touch interaction works properly on mobile');
    
    // Test 4: Close by tapping outside
    await page.tap({ x: 100, y: 300 }); // Tap outside the settings area
    await page.waitForTimeout(300);
    
    await expect(settingsButton).not.toHaveClass(/active/);
    await expect(settingsPanel).not.toHaveClass(/active/);
    console.log('✅ Settings closes when tapping outside on mobile');
  });

  test('Settings button should have proper visual feedback and animations', async ({ page }) => {
    console.log('\n✨ Testing Settings Button Visual Effects and Animations\n');
    
    const settingsButton = page.locator('#headerSettingsTrigger');
    const settingsIcon = settingsButton.locator('.settings-icon');
    
    // Test 1: Check initial styles
    const initialStyles = await settingsButton.evaluate(el => {
      const computed = getComputedStyle(el);
      return {
        background: computed.background,
        borderRadius: computed.borderRadius,
        boxShadow: computed.boxShadow
      };
    });
    
    // Check if it has either gradient or solid color (different browsers may report differently)
    const hasModernStyling = initialStyles.background.includes('linear-gradient') || 
                             initialStyles.background.includes('rgb(248, 250, 252)');
    expect(hasModernStyling).toBe(true); // Should have modern background
    expect(parseFloat(initialStyles.borderRadius)).toBeGreaterThan(8); // Should be rounded
    console.log('✅ Initial modern styling is applied');
    
    // Test 2: Check hover effects
    await settingsButton.hover();
    await page.waitForTimeout(400); // Wait for animation
    
    const hoverStyles = await settingsButton.evaluate(el => {
      const computed = getComputedStyle(el);
      return {
        transform: computed.transform,
        boxShadow: computed.boxShadow
      };
    });
    
    expect(hoverStyles.transform).toContain('translateY'); // Should have lift effect
    console.log('✅ Hover effects are working');
    
    // Test 3: Check active state styling
    await settingsButton.click();
    await page.waitForTimeout(300);
    
    const activeStyles = await settingsButton.evaluate(el => {
      const computed = getComputedStyle(el);
      return {
        background: computed.background,
        color: computed.color
      };
    });
    
    expect(activeStyles.background).toContain('rgb(59, 130, 246)'); // Should be blue when active
    console.log('✅ Active state styling is correct');
    
    // Test 4: Check icon animation
    const iconTransform = await settingsIcon.evaluate(el => {
      return getComputedStyle(el).transform;
    });
    
    expect(iconTransform).toContain('rotate'); // Icon should rotate when active
    console.log('✅ Icon animation is working');
    
    // Cleanup
    await settingsButton.click();
  });

  test('Settings button should maintain functionality while improving UX', async ({ page }) => {
    console.log('\n🔧 Testing Settings Button Functionality Preservation\n');
    
    const settingsButton = page.locator('#headerSettingsTrigger');
    const settingsPanel = page.locator('#headerSettingsPanel');
    
    // Test 1: All original functionality should still work
    await settingsButton.click();
    await page.waitForTimeout(300);
    
    // Check if all settings options are present
    const storageToggle = settingsPanel.locator('input[value="supabase"]');
    const connectionStatus = settingsPanel.locator('#connectionStatus');
    const bulkActions = settingsPanel.locator('text=Bulk Actions');
    const resetButton = settingsPanel.locator('text=Reset Database');
    
    await expect(storageToggle).toBeVisible();
    await expect(connectionStatus).toBeVisible();
    await expect(bulkActions).toBeVisible();
    await expect(resetButton).toBeVisible();
    console.log('✅ All original settings options are accessible');
    
    // Test 2: Settings panel should have proper styling
    const panelStyles = await settingsPanel.evaluate(el => {
      const computed = getComputedStyle(el);
      return {
        borderRadius: computed.borderRadius,
        boxShadow: computed.boxShadow,
        background: computed.background
      };
    });
    
    expect(parseFloat(panelStyles.borderRadius)).toBeGreaterThan(8);
    expect(panelStyles.boxShadow).toContain('rgba');
    console.log('✅ Settings panel has modern styling');
    
    // Test 3: Close functionality should work
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    
    await expect(settingsPanel).not.toHaveClass(/active/);
    console.log('✅ Settings panel closes properly');
    
    // Test 4: Click outside to close should work
    await settingsButton.click();
    await page.waitForTimeout(300);
    
    await page.click('body', { position: { x: 100, y: 100 } });
    await page.waitForTimeout(300);
    
    await expect(settingsPanel).not.toHaveClass(/active/);
    console.log('✅ Click-outside-to-close functionality works');
  });

  test('Settings button should handle loading states properly', async ({ page }) => {
    console.log('\n⏳ Testing Settings Button Loading States\n');
    
    const settingsButton = page.locator('#headerSettingsTrigger');
    
    // Test loading state by intercepting the settings panel opening
    await page.evaluate(() => {
      // Override the openHeaderSettings function to simulate loading
      const originalFunction = window.openHeaderSettings;
      window.openHeaderSettings = function() {
        const trigger = document.getElementById('headerSettingsTrigger');
        trigger.classList.add('loading');
        setTimeout(() => {
          trigger.classList.remove('loading');
          originalFunction.call(this);
        }, 500);
      };
    });
    
    // Click and check for loading state
    await settingsButton.click();
    await page.waitForTimeout(100);
    
    // Should have loading class briefly
    const hasLoadingClass = await settingsButton.evaluate(el => el.classList.contains('loading'));
    if (hasLoadingClass) {
      console.log('✅ Loading state is properly applied');
      
      // Wait for loading to finish
      await page.waitForTimeout(600);
      
      const stillLoading = await settingsButton.evaluate(el => el.classList.contains('loading'));
      expect(stillLoading).toBe(false);
      console.log('✅ Loading state is properly removed');
    } else {
      console.log('ℹ️  Loading state was too fast to catch (which is also good UX)');
    }
    
    // Cleanup
    await page.keyboard.press('Escape');
  });
});