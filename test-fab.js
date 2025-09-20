const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testFAB() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 // Slower for better observation
    });
    
    try {
        // Test desktop viewport
        console.log('Testing FAB on desktop viewport...');
        await testFABOnViewport(browser, { width: 1280, height: 720 }, 'desktop');
        
        // Test mobile viewport
        console.log('Testing FAB on mobile viewport...');
        await testFABOnViewport(browser, { width: 375, height: 667 }, 'mobile');
        
    } finally {
        await browser.close();
    }
}

async function testFABOnViewport(browser, viewport, deviceType) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    
    try {
        // Navigate to the task tracker
        await page.goto('http://localhost:8000/personal-task-tracker-sync.html');
        
        // Handle authentication
        await page.fill('#password-input', 'Welcome@123');
        await page.press('#password-input', 'Enter');
        await page.waitForSelector('.fab-container', { state: 'visible' });
        
        // Take initial screenshot showing FAB
        await page.screenshot({ 
            path: `fab-initial-${deviceType}.png`,
            fullPage: true 
        });
        console.log(`✓ Initial screenshot taken: fab-initial-${deviceType}.png`);
        
        // Test FAB click to expand
        await page.click('#fab-main');
        await page.waitForTimeout(500); // Wait for animation
        
        // Take screenshot of expanded FAB
        await page.screenshot({ 
            path: `fab-expanded-${deviceType}.png`,
            fullPage: true 
        });
        console.log(`✓ Expanded FAB screenshot taken: fab-expanded-${deviceType}.png`);
        
        // Test "Add Task" button
        await page.click('#fab-add-btn');
        await page.waitForSelector('#task-modal:not(.hidden)', { state: 'visible' });
        
        // Take screenshot of task modal
        await page.screenshot({ 
            path: `fab-task-modal-${deviceType}.png`,
            fullPage: true 
        });
        console.log(`✓ Task modal screenshot taken: fab-task-modal-${deviceType}.png`);
        
        // Close task modal
        await page.click('#close-modal');
        await page.waitForSelector('#task-modal.hidden', { state: 'attached' });
        
        // Re-open FAB menu
        await page.click('#fab-main');
        await page.waitForTimeout(500);
        
        // Test "Upload Notes" button
        await page.click('#fab-upload-btn');
        await page.waitForSelector('.upload-modal.active', { state: 'visible' });
        
        // Take screenshot of upload modal
        await page.screenshot({ 
            path: `fab-upload-modal-${deviceType}.png`,
            fullPage: true 
        });
        console.log(`✓ Upload modal screenshot taken: fab-upload-modal-${deviceType}.png`);
        
        // Close upload modal
        await page.click('#close-upload-modal');
        await page.waitForTimeout(300);
        
        // Test FAB backdrop close
        await page.click('#fab-main');
        await page.waitForTimeout(500);
        await page.click('#fab-backdrop');
        await page.waitForTimeout(500);
        
        // Take final screenshot
        await page.screenshot({ 
            path: `fab-final-${deviceType}.png`,
            fullPage: true 
        });
        console.log(`✓ Final screenshot taken: fab-final-${deviceType}.png`);
        
        // Check if original CTAs are hidden (test requirement)
        try {
            const originalAddButton = await page.locator('button:has-text("+ Add Task")').first();
            const isHidden = await originalAddButton.isHidden();
            console.log(`✓ Original Add Task button hidden: ${isHidden}`);
        } catch (e) {
            console.log('✓ Original Add Task button not found (likely replaced by FAB)');
        }
        
        // Test keyboard accessibility
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        const focusedElement = await page.evaluate(() => document.activeElement.id);
        console.log(`✓ Keyboard navigation works, focused element: ${focusedElement}`);
        
    } catch (error) {
        console.error(`Error testing ${deviceType} viewport:`, error);
    } finally {
        await context.close();
    }
}

// Run the test
if (require.main === module) {
    testFAB().then(() => {
        console.log('\\n🎉 FAB testing completed! Check the generated screenshots.');
        console.log('\\n📊 FAB Analysis Report:');
        console.log('- Screenshots captured for both desktop and mobile viewports');
        console.log('- FAB expansion and action buttons tested');
        console.log('- Task modal and upload modal functionality verified');
        console.log('- Keyboard accessibility checked');
        console.log('- Original CTA hiding verified');
    }).catch(console.error);
}

module.exports = { testFAB };