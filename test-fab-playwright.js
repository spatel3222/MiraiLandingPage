const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('1. Navigating to page...');
    await page.goto('http://localhost:8000/personal-task-tracker-sync.html');
    
    // Handle authentication if needed
    try {
        const authVisible = await page.isVisible('#auth-overlay', { timeout: 2000 });
        if (authVisible) {
            console.log('2. Entering password...');
            await page.fill('#password-input', 'Welcome@123');
            
            // Submit the form
            await page.evaluate(() => {
                const form = document.getElementById('auth-form');
                form.dispatchEvent(new Event('submit'));
            });
            
            // Wait for auth overlay to disappear
            await page.waitForSelector('#auth-overlay', { state: 'hidden', timeout: 5000 });
            console.log('   Authentication successful');
        }
    } catch (e) {
        console.log('2. Auth issue:', e.message);
        
        // Force hide the auth overlay for testing
        await page.evaluate(() => {
            const overlay = document.getElementById('auth-overlay');
            if (overlay) {
                overlay.style.display = 'none';
                overlay.style.zIndex = '-1';
            }
        });
    }
    
    // Take initial screenshot
    console.log('3. Taking screenshot of initial state...');
    await page.screenshot({ path: 'fab-initial.png', fullPage: false });
    
    // Check if FAB is visible
    const fab = await page.$('#fab-main');
    if (!fab) {
        console.log('ERROR: FAB button not found!');
        await browser.close();
        return;
    }
    
    const fabVisible = await fab.isVisible();
    console.log('4. FAB visible:', fabVisible);
    
    // Click FAB to expand
    console.log('5. Clicking FAB to expand...');
    await page.click('#fab-main');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'fab-expanded.png', fullPage: false });
    
    // Check if action buttons are visible
    const addTaskBtn = await page.$('#fab-add-btn');
    const uploadBtn = await page.$('#fab-upload-btn');
    
    console.log('6. Add Task button visible:', await addTaskBtn.isVisible());
    console.log('7. Upload button visible:', await uploadBtn.isVisible());
    
    // Click Add Task button
    console.log('8. Clicking Add Task button...');
    await page.click('#fab-add-btn');
    await page.waitForTimeout(1000);
    
    // Check if task modal is visible
    const taskModal = await page.$('#task-modal');
    const taskModalVisible = await taskModal.isVisible();
    console.log('9. Task modal visible after click:', taskModalVisible);
    
    if (!taskModalVisible) {
        // Debug: Check modal classes and styles
        const modalClasses = await taskModal.getAttribute('class');
        const modalStyle = await taskModal.getAttribute('style');
        console.log('   Modal classes:', modalClasses);
        console.log('   Modal style:', modalStyle);
        
        // Try to make it visible manually for debugging
        await page.evaluate(() => {
            const modal = document.getElementById('task-modal');
            console.log('Modal element:', modal);
            console.log('Modal classList:', modal.classList.toString());
            console.log('Modal computed display:', window.getComputedStyle(modal).display);
            console.log('Modal computed z-index:', window.getComputedStyle(modal).zIndex);
            
            // Force show the modal
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
            return {
                wasHidden: modal.classList.contains('hidden'),
                display: window.getComputedStyle(modal).display
            };
        });
        
        await page.waitForTimeout(500);
        console.log('10. Forced modal to show, taking screenshot...');
    }
    
    await page.screenshot({ path: 'fab-task-modal.png', fullPage: false });
    
    await page.waitForTimeout(2000);
    await browser.close();
    console.log('Test complete. Check the screenshots.');
})();