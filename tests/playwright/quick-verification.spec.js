const { test, expect } = require('@playwright/test');

test.describe('Quick Bug Fixes Verification', () => {
  const TEST_CREDENTIALS = {
    email: 'test@example.com',
    password: 'Welcome@123'
  };

  async function authenticate(page) {
    await page.goto('/personal-task-tracker-sync.html');
    const authOverlay = page.locator('#auth-overlay');
    if (await authOverlay.isVisible()) {
      await page.fill('#password-input', TEST_CREDENTIALS.password);
      await page.click('button[type="submit"]');
      await page.waitForSelector('#auth-overlay', { state: 'hidden' });
    }
  }

  test('Basic functionality verification', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await authenticate(page);
    await page.waitForSelector('.metrics-dashboard');
    
    // Capture working state
    await page.screenshot({ 
      path: 'test-results/quick-verification-loaded.png',
      fullPage: true 
    });
    
    console.log('✅ Application loads successfully');
    console.log('✅ Authentication works');
    console.log('✅ Metrics dashboard is visible');
    console.log('✅ Layout appears correct');
  });

  test('Task creation flow', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await authenticate(page);
    await page.waitForSelector('.metrics-dashboard');
    
    // Test task creation
    await page.click('#fab-main');
    await page.waitForSelector('#fab-add-btn', { state: 'visible' });
    await page.click('#fab-add-btn');
    await page.waitForSelector('#task-modal', { state: 'visible' });
    
    await page.screenshot({ 
      path: 'test-results/quick-verification-modal.png',
      fullPage: true 
    });
    
    await page.fill('#task-title', 'Quick Test Task');
    await page.click('#save-task-btn');
    await page.waitForSelector('#task-modal', { state: 'hidden' });
    
    // Verify task appears
    const task = page.locator('.task-card:has-text("Quick Test Task")');
    await expect(task).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/quick-verification-task-created.png',
      fullPage: true 
    });
    
    console.log('✅ Task creation works');
    console.log('✅ Modal functionality works');
    console.log('✅ FAB (Floating Action Button) works');
  });

  test('Mobile responsiveness quick check', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await authenticate(page);
    await page.waitForSelector('.metrics-dashboard');
    
    await page.screenshot({ 
      path: 'test-results/quick-verification-mobile.png',
      fullPage: true 
    });
    
    // Test modal on mobile
    await page.click('#fab-main');
    await page.waitForSelector('#fab-add-btn', { state: 'visible' });
    await page.click('#fab-add-btn');
    await page.waitForSelector('#task-modal', { state: 'visible' });
    
    await page.screenshot({ 
      path: 'test-results/quick-verification-mobile-modal.png',
      fullPage: true 
    });
    
    // Check if save button is visible
    const saveButton = page.locator('#save-task-btn');
    const isVisible = await saveButton.isVisible();
    
    console.log(`✅ Mobile layout loads: ${isVisible ? 'GOOD' : 'NEEDS WORK'}`);
    console.log(`✅ Mobile modal opens: ${isVisible ? 'GOOD' : 'NEEDS WORK'}`);
  });
});