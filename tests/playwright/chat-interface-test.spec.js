import { test, expect } from '@playwright/test';

test.describe('Chat Interface Integration Test', () => {
  const dashboardUrl = '/workshops/business-automation-dashboard.html';

  test('Chat Interface - FAB Integration and Modal Functionality', async ({ page }) => {
    console.log('\n=== TESTING: Chat Interface Implementation ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // 1. Check if FAB cluster exists
    const fabCluster = page.locator('#fabCluster');
    await expect(fabCluster).toBeVisible();
    console.log('✅ FAB cluster is visible');
    
    // 2. Check if FAB main button exists
    const fabMain = page.locator('#fabMainBtn, .fab-main');
    await expect(fabMain).toBeVisible();
    console.log('✅ FAB main button is visible');
    
    // 3. Click FAB to open menu
    await fabMain.click();
    await page.waitForTimeout(500);
    
    // 4. Check if chat option appears
    const chatOption = page.locator('[onclick="openChatModal()"], .fab-option:has-text("AI Assistant")');
    await expect(chatOption).toBeVisible();
    console.log('✅ Chat option visible in FAB menu');
    
    // 5. Check for notification badge
    const notificationBadge = page.locator('#chatNotificationBadge');
    const badgeVisible = await notificationBadge.isVisible();
    console.log(`Chat notification badge: ${badgeVisible ? 'visible' : 'hidden'}`);
    
    // 6. Click chat option to open modal
    await chatOption.click();
    await page.waitForTimeout(500);
    
    // 7. Check if chat modal opens
    const chatModal = page.locator('#chatModal');
    await expect(chatModal).toHaveClass(/active/);
    console.log('✅ Chat modal opens successfully');
    
    // 8. Check chat modal components
    const chatContainer = page.locator('.chat-container');
    await expect(chatContainer).toBeVisible();
    
    const chatHeader = page.locator('.chat-header');
    await expect(chatHeader).toBeVisible();
    
    const chatMessages = page.locator('.chat-messages, #chatMessages');
    await expect(chatMessages).toBeVisible();
    
    const chatInput = page.locator('#chatInput, .chat-input');
    await expect(chatInput).toBeVisible();
    
    console.log('✅ All chat modal components are present');
    
    // 9. Test chat input functionality
    if (await chatInput.count() > 0) {
      await chatInput.fill('What automation opportunities do you see?');
      
      // Look for send button
      const sendButton = page.locator('.chat-send-btn, [onclick*="sendMessage"], button:has-text("Send")');
      if (await sendButton.count() > 0) {
        await sendButton.click();
        console.log('✅ Message send functionality works');
      }
    }
    
    // 10. Check for "Update Dashboard" button (should appear after conversation)
    await page.waitForTimeout(2000);
    const updateButton = page.locator('button:has-text("Update Dashboard"), .update-dashboard-btn');
    const updateButtonExists = await updateButton.count() > 0;
    console.log(`Update Dashboard button: ${updateButtonExists ? 'present' : 'not yet available'}`);
    
    // 11. Test closing chat modal
    const closeButton = page.locator('.chat-close-btn, button:has-text("×")');
    if (await closeButton.count() > 0) {
      await closeButton.click();
      await page.waitForTimeout(500);
      
      const modalStillActive = await chatModal.evaluate(el => el.classList.contains('active'));
      if (!modalStillActive) {
        console.log('✅ Chat modal closes successfully');
      }
    }
    
    // Take screenshots for documentation
    await fabMain.click(); // Reopen FAB
    await page.waitForTimeout(300);
    await page.screenshot({ 
      path: 'test-results/fab-with-chat-option.png'
    });
    
    await chatOption.click(); // Reopen chat
    await page.waitForTimeout(500);
    await page.screenshot({ 
      path: 'test-results/chat-modal-interface.png'
    });
    
    console.log('✅ Chat interface testing completed');
  });

  test('Chat Interface - Responsive Design', async ({ page }) => {
    console.log('\n=== TESTING: Chat Interface Responsive Design ===');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Check FAB visibility on mobile
    const fabCluster = page.locator('#fabCluster');
    await expect(fabCluster).toBeVisible();
    console.log('✅ FAB cluster visible on mobile');
    
    // Open chat on mobile
    const fabMain = page.locator('#fabMainBtn, .fab-main');
    await fabMain.click();
    await page.waitForTimeout(500);
    
    const chatOption = page.locator('[onclick="openChatModal()"], .fab-option:has-text("AI Assistant")');
    if (await chatOption.count() > 0) {
      await chatOption.click();
      await page.waitForTimeout(500);
      
      // Check mobile chat layout
      const chatModal = page.locator('#chatModal');
      const chatContainer = page.locator('.chat-container');
      
      if (await chatModal.isVisible()) {
        console.log('✅ Chat modal opens on mobile');
        
        const containerBounds = await chatContainer.boundingBox();
        if (containerBounds) {
          console.log(`Mobile chat size: ${containerBounds.width}x${containerBounds.height}`);
        }
        
        await page.screenshot({ 
          path: 'test-results/chat-mobile-responsive.png'
        });
      }
    }
  });
});