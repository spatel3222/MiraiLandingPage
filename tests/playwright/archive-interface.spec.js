import { test, expect } from '@playwright/test';

test.describe('Archive Interface Design', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/personal-task-tracker-sync.html');
    
    // Wait for the app to load
    await page.waitForSelector('.archive-toggle');
    
    // Skip auth if present
    const authOverlay = page.locator('#auth-overlay');
    if (await authOverlay.isVisible()) {
      await page.fill('#password-input', 'test123');
      await page.click('button[type="submit"]');
      await page.waitForSelector('#app-content', { state: 'visible' });
    }
  });

  test('Archive button is visible and positioned correctly', async ({ page }) => {
    await expect(page.locator('#archive-toggle-btn')).toBeVisible();
    
    // Take screenshot of initial state
    await page.screenshot({ 
      path: 'test-results/archive-closed-desktop.png',
      fullPage: true 
    });
  });

  test('Archive panel opens and displays correctly on desktop', async ({ page }) => {
    // Click archive toggle button
    await page.click('#archive-toggle-btn');
    
    // Wait for panel to open
    await page.waitForSelector('.archive-panel.open');
    
    // Verify panel is visible
    await expect(page.locator('.archive-panel')).toHaveClass(/open/);
    
    // Take screenshot of opened state
    await page.screenshot({ 
      path: 'test-results/archive-open-desktop.png',
      fullPage: true 
    });
  });

  test('Archive panel works correctly on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    
    // Take screenshot of mobile closed state
    await page.screenshot({ 
      path: 'test-results/archive-closed-mobile.png',
      fullPage: true 
    });
    
    // Click archive toggle button
    await page.click('#archive-toggle-btn');
    
    // Wait for panel to open
    await page.waitForSelector('.archive-panel.open');
    
    // Take screenshot of mobile opened state
    await page.screenshot({ 
      path: 'test-results/archive-open-mobile.png',
      fullPage: true 
    });
  });

  test('Archive filter buttons work correctly', async ({ page }) => {
    // Open archive
    await page.click('#archive-toggle-btn');
    await page.waitForSelector('.archive-panel.open');
    
    // Test filter buttons
    await page.click('[data-filter="today"]');
    await expect(page.locator('[data-filter="today"]')).toHaveClass(/active/);
    
    await page.click('[data-filter="week"]');
    await expect(page.locator('[data-filter="week"]')).toHaveClass(/active/);
    
    // Take screenshot with filters
    await page.screenshot({ 
      path: 'test-results/archive-filters.png',
      fullPage: true 
    });
  });

  test('Archive search functionality', async ({ page }) => {
    // Open archive
    await page.click('#archive-toggle-btn');
    await page.waitForSelector('.archive-panel.open');
    
    // Test search input
    await page.fill('#archive-search', 'test search');
    await expect(page.locator('#archive-search')).toHaveValue('test search');
    
    // Take screenshot with search active
    await page.screenshot({ 
      path: 'test-results/archive-search.png',
      fullPage: true 
    });
  });

  test('Archive can be closed', async ({ page }) => {
    // Open archive
    await page.click('#archive-toggle-btn');
    await page.waitForSelector('.archive-panel.open');
    
    // Close archive using close button
    await page.click('#archive-close-btn');
    
    // Wait for panel to close
    await page.waitForSelector('.archive-panel:not(.open)');
    
    // Verify panel is closed
    await expect(page.locator('.archive-panel')).not.toHaveClass(/open/);
  });

  test('Archive backdrop closes panel when clicked', async ({ page }) => {
    // Open archive
    await page.click('#archive-toggle-btn');
    await page.waitForSelector('.archive-panel.open');
    
    // Click backdrop
    await page.click('#archive-backdrop');
    
    // Wait for panel to close
    await page.waitForSelector('.archive-panel:not(.open)');
    
    // Verify panel is closed
    await expect(page.locator('.archive-panel')).not.toHaveClass(/open/);
  });

});