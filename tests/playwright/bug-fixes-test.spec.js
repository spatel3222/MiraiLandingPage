import { test, expect } from '@playwright/test';

test.describe('Bug Fixes Verification', () => {
  const dashboardUrl = '/workshops/business-automation-dashboard.html';

  test('Verify Quick Wins Fix', async ({ page }) => {
    console.log('\n=== TESTING: Quick Wins Element Fix ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Switch to testSept9b (has data)
    const dropdown = page.locator('#headerProjectSelector, #projectSelector');
    if (await dropdown.count() > 0) {
      await dropdown.first().selectOption('7029fc69-769d-44e6-bc25-c746e38deb65'); // testSept9b
      await page.waitForTimeout(3000);
    }
    
    const quickWins = await page.locator('#quickWins').textContent();
    console.log(`Quick Wins value: "${quickWins}"`);
    
    // Should not be undefined or empty
    expect(quickWins).toBeTruthy();
    expect(quickWins).not.toBe('undefined');
    
    const quickWinsNumber = parseInt(quickWins);
    expect(quickWinsNumber).toBeGreaterThanOrEqual(0);
    
    console.log('✅ Quick Wins fix verified');
  });

  test('Verify Chat Update Button Visibility', async ({ page }) => {
    console.log('\n=== TESTING: Chat Update Button Visibility ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Open FAB and chat
    const fabMain = page.locator('#fabMainBtn, .fab-main');
    await fabMain.click();
    await page.waitForTimeout(500);
    
    const chatOption = page.locator('[onclick="openChatModal()"]');
    await chatOption.click();
    await page.waitForTimeout(500);
    
    // Check if update button is visible
    const updateButton = page.locator('#updateDashboardBtn');
    await expect(updateButton).toBeVisible();
    
    console.log('✅ Update Dashboard button is visible');
    
    // Test clicking it
    await updateButton.click();
    await page.waitForTimeout(1000);
    
    console.log('✅ Update Dashboard button click works');
  });
});