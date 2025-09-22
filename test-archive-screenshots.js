const { chromium } = require('playwright');
const path = require('path');

async function takeArchiveScreenshots() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    
    // Desktop screenshots
    const desktopPage = await context.newPage();
    await desktopPage.setViewportSize({ width: 1440, height: 900 });
    
    // Navigate to the task tracker
    const filePath = `file://${path.join(__dirname, 'personal-task-tracker-sync.html')}`;
    await desktopPage.goto(filePath);
    
    // Wait for the page to load
    await desktopPage.waitForSelector('.archive-toggle', { timeout: 5000 });
    
    console.log('Taking desktop screenshots...');
    
    // Screenshot 1: Archive closed state (desktop)
    await desktopPage.screenshot({ 
        path: 'archive-desktop-closed.png',
        fullPage: true 
    });
    console.log('✓ Desktop closed state screenshot saved');
    
    // Click archive toggle to open
    await desktopPage.click('#archive-toggle-btn');
    await desktopPage.waitForSelector('.archive-panel.open', { timeout: 2000 });
    
    // Screenshot 2: Archive opened state (desktop)
    await desktopPage.screenshot({ 
        path: 'archive-desktop-open.png',
        fullPage: true 
    });
    console.log('✓ Desktop open state screenshot saved');
    
    // Mobile screenshots
    const mobilePage = await context.newPage();
    await mobilePage.setViewportSize({ width: 375, height: 812 }); // iPhone X size
    await mobilePage.goto(filePath);
    
    // Wait for the page to load
    await mobilePage.waitForSelector('.archive-toggle', { timeout: 5000 });
    
    console.log('Taking mobile screenshots...');
    
    // Screenshot 3: Archive closed state (mobile)
    await mobilePage.screenshot({ 
        path: 'archive-mobile-closed.png',
        fullPage: true 
    });
    console.log('✓ Mobile closed state screenshot saved');
    
    // Click archive toggle to open
    await mobilePage.click('#archive-toggle-btn');
    await mobilePage.waitForSelector('.archive-panel.open', { timeout: 2000 });
    
    // Screenshot 4: Archive opened state (mobile)
    await mobilePage.screenshot({ 
        path: 'archive-mobile-open.png',
        fullPage: true 
    });
    console.log('✓ Mobile open state screenshot saved');
    
    await browser.close();
    console.log('All screenshots completed!');
}

// Run the function
takeArchiveScreenshots().catch(console.error);