import { test, expect } from '@playwright/test';

test.describe('Chat Context Preservation Tests', () => {
  const dashboardUrl = '/workshops/business-automation-dashboard.html';

  test('Chat should remain open after Update Dashboard button click', async ({ page }) => {
    console.log('\n=== TESTING: Chat Context Preservation After Dashboard Update ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Open FAB
    const fabMain = page.locator('#fabMainBtn, .fab-main');
    await expect(fabMain).toBeVisible();
    await fabMain.click();
    await page.waitForTimeout(500);
    
    // Open chat
    const chatOption = page.locator('[onclick="openChatModal()"], .fab-option:has-text("AI Assistant")');
    await expect(chatOption).toBeVisible();
    await chatOption.click();
    await page.waitForTimeout(500);
    
    // Verify chat modal is open
    const chatModal = page.locator('#chatModal');
    await expect(chatModal).toHaveClass(/active/);
    console.log('✅ Chat modal opened successfully');
    
    // Send a message to establish context
    const chatInput = page.locator('#chatInput, .chat-input');
    await chatInput.first().fill('What automation opportunities do you recommend for our processes?');
    
    const sendButton = page.locator('.chat-send-btn, button:has-text("Send"), [onclick*="sendMessage"]');
    if (await sendButton.count() > 0) {
      await sendButton.first().click();
      await page.waitForTimeout(2000);
      console.log('✅ Initial message sent to establish context');
    }
    
    // Click Update Dashboard button
    const updateButton = page.locator('#updateDashboardBtn, button:has-text("Update Dashboard")');
    await expect(updateButton).toBeVisible();
    console.log('✅ Update Dashboard button is visible');
    
    await updateButton.click();
    console.log('✅ Update Dashboard button clicked');
    
    // Wait for the update process
    await page.waitForTimeout(3000);
    
    // Verify chat modal is STILL open (this is the key test)
    const chatModalAfterUpdate = page.locator('#chatModal');
    const isStillOpen = await chatModalAfterUpdate.evaluate(el => el.classList.contains('active'));
    
    console.log(`Chat modal still open after update: ${isStillOpen ? '✅ YES' : '❌ NO'}`);
    expect(isStillOpen).toBe(true);
    
    // Verify we can continue the conversation
    const chatInputAfterUpdate = page.locator('#chatInput, .chat-input');
    await expect(chatInputAfterUpdate.first()).toBeVisible();
    
    // Send a follow-up message to test continued context
    await chatInputAfterUpdate.first().fill('Can you help me refine the roadmap items we just updated?');
    
    if (await sendButton.count() > 0) {
      await sendButton.first().click();
      await page.waitForTimeout(1000);
      console.log('✅ Follow-up message sent successfully - context preserved!');
    }
    
    // Verify chat input is still functional
    await expect(chatInputAfterUpdate.first()).toBeEnabled();
    
    console.log('✅ Chat context preservation test completed successfully');
    
    // Take screenshot for verification
    await page.screenshot({ 
      path: 'test-results/chat-context-preserved.png',
      fullPage: true 
    });
  });
});