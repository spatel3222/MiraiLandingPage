const { chromium } = require('playwright');

async function debugPhase3() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Listen to console logs
    page.on('console', msg => {
      if (msg.text().includes('🎯') || msg.text().includes('✅') || msg.text().includes('onDataRetrieved')) {
        console.log('🖥️ BROWSER:', msg.text());
      }
    });
    
    console.log('1. Navigating to local reports page...');
    await page.goto('http://localhost:3001/reports');
    await page.waitForTimeout(2000);
    
    console.log('2. Taking initial screenshot...');
    await page.screenshot({ path: 'initial_page.png', fullPage: true });
    
    console.log('3. Setting date range for Nov 9-10...');
    const startDateInput = await page.locator('input[type="date"]').first();
    const endDateInput = await page.locator('input[type="date"]').last();
    
    if (await startDateInput.isVisible()) {
      // Set to Nov 9-10, 2025 range
      const startDate = '2025-11-09';
      const endDate = '2025-11-10';
      
      console.log(`Setting date range: ${startDate} to ${endDate}`);
      await startDateInput.fill(startDate);
      await endDateInput.fill(endDate);
      await page.waitForTimeout(1000);
    }
    
    console.log('4. Clicking Retrieve Data button...');
    await page.click('button:has-text("Retrieve Data")');
    
    console.log('5. Waiting for data retrieval to complete...');
    // Wait for either success message or Phase 3 section to appear
    try {
      await page.waitForSelector('text="Data retrieval completed successfully!"', { timeout: 30000 });
      console.log('✅ Found success message!');
    } catch (e) {
      console.log('⚠️ Success message timeout, checking for Phase 3 section...');
      // Alternative: wait for Phase 3 section which indicates data was retrieved
      await page.waitForSelector('text="Phase 3: Julius V7 Analytics"', { timeout: 30000 });
      console.log('✅ Found Phase 3 section!');
    }
    await page.waitForTimeout(2000);
    
    console.log('6. Taking post-retrieval screenshot...');
    await page.screenshot({ path: 'post_retrieval.png', fullPage: true });
    
    console.log('7. Waiting for React state to update...');
    await page.waitForTimeout(5000); // Wait 5 seconds for React state update
    
    console.log('8. Taking post-state-update screenshot...');
    await page.screenshot({ path: 'post_state_update.png', fullPage: true });
    
    console.log('9. Checking for Phase 3 section...');
    const phase3Section = await page.locator('text="Phase 3: Julius V7 Analytics"');
    const isVisible = await phase3Section.isVisible();
    console.log('Phase 3 section visible:', isVisible);
    
    if (isVisible) {
      console.log('✅ Phase 3 section found!');
      
      console.log('8. Testing Julius V7 CTA button...');
      const ctaButton = await page.locator('button:has-text("Process Julius V7 Analytics")');
      const buttonVisible = await ctaButton.isVisible();
      console.log('Julius V7 CTA button visible:', buttonVisible);
      
      if (buttonVisible) {
        console.log('9. Clicking Julius V7 Process button...');
        await ctaButton.click();
        
        console.log('10. Waiting for Julius V7 processing...');
        
        // Listen for server logs
        page.on('console', msg => {
          if (msg.text().includes('🔍 Debug')) {
            console.log('🖥️ BROWSER:', msg.text());
          }
        });
        await page.waitForSelector('text="Julius V7 Analytics Processing Completed!"', { timeout: 180000 });
        await page.waitForTimeout(3000);
        
        console.log('11. Taking final screenshot after processing...');
        await page.screenshot({ path: 'julius_v7_completed.png', fullPage: true });
        
        console.log('12. Testing download buttons...');
        const downloadButtons = await page.locator('button:has-text("Download")');
        const downloadCount = await downloadButtons.count();
        console.log('Download buttons available:', downloadCount);
        
        // Test first download button
        if (downloadCount > 0) {
          console.log('13. Testing first download...');
          await downloadButtons.first().click();
          await page.waitForTimeout(2000);
        }
        
        console.log('✅ Full Julius V7 workflow completed successfully!');
        console.log('📁 Check ./outputs/ directory for generated CSV files');
      } else {
        console.log('❌ Julius V7 CTA button NOT visible');
      }
    } else {
      console.log('❌ Phase 3 section NOT found');
      
      // Check if download buttons exist
      const downloadButtons = await page.locator('button:has-text("Download")');
      const downloadCount = await downloadButtons.count();
      console.log('Download buttons found:', downloadCount);
      
      // Scroll down to see if section is below
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'scrolled_down.png', fullPage: true });
    }
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'error_screenshot.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

debugPhase3();