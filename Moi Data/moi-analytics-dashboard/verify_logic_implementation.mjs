import { chromium } from 'playwright';
import fs from 'fs';

async function verifyLogicImplementation() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const consoleMessages = [];
  
  // Capture ALL console logs for analysis
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(text);
    if (text.includes('Meta') || text.includes('🔍') || text.includes('CRITICAL') || text.includes('dayCount')) {
      console.log(`🔍 CONSOLE: ${text}`);
    }
  });
  
  try {
    console.log('🚀 Verifying complete logic implementation...');
    
    // Create test Meta CSV with problematic data
    const testMetaCSV = `Campaign,Ad set name,Amount spent (INR),CPM (cost per 1,000 impressions),CTR (link click-through rate),Ad set delivery,Reporting starts,Reporting ends
Test Campaign,Test Ad Set,57721,192.1,1.36,Active,2025-09-28,2025-09-29`;
    
    // Write test file
    const testFilePath = '/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/moi-analytics-dashboard/test_meta.csv';
    fs.writeFileSync(testFilePath, testMetaCSV);
    console.log('📄 Created test Meta CSV with 57721 spend, start: 2025-09-28, end: 2025-09-29');
    
    // Navigate to app
    await page.goto('http://localhost:5175/');
    await page.waitForLoadState('networkidle');
    
    console.log('📱 App loaded, looking for file upload...');
    
    // Look for upload button
    const uploadButton = page.locator('button').filter({ hasText: /upload|generate|import/i });
    if (await uploadButton.count() > 0) {
      console.log('🔘 Found upload button, clicking...');
      await uploadButton.first().click();
      await page.waitForTimeout(1000);
    }
    
    // Look for file input
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.count() > 0) {
      console.log('📤 Found file input, uploading test Meta CSV...');
      await fileInput.first().setInputFiles(testFilePath);
      await page.waitForTimeout(2000);
      
      // Process the file
      const processButton = page.locator('button').filter({ hasText: /process|upload|continue/i });
      if (await processButton.count() > 0) {
        await processButton.first().click();
        await page.waitForTimeout(3000);
      }
      
      console.log('⏳ Waiting for processing to complete...');
      await page.waitForTimeout(5000);
      
      // Try to trigger export
      const exportButton = page.locator('button').filter({ hasText: /export|download/i });
      if (await exportButton.count() > 0) {
        console.log('📊 Triggering export...');
        await exportButton.first().click();
        await page.waitForTimeout(1000);
        
        // Look for Top Level export
        const topLevelButton = page.locator('button').filter({ hasText: /top level|daily/i });
        if (await topLevelButton.count() > 0) {
          await topLevelButton.first().click();
          await page.waitForTimeout(2000);
        }
      }
    } else {
      console.log('❌ No file input found, checking current state...');
    }
    
    // Analyze console logs for verification
    console.log('\\n🔍 LOGIC VERIFICATION ANALYSIS:');
    
    const hasMetaProcessing = consoleMessages.some(msg => 
      msg.includes('Meta calculations after parsing fix') || 
      msg.includes('Meta date parsing')
    );
    
    const hasEndDateOnly = consoleMessages.some(msg => 
      msg.includes('USING END DATE ONLY')
    );
    
    const hasDayCount1 = consoleMessages.some(msg => 
      msg.includes('dayCount: 1') || 
      msg.includes('shouldBe1Day: true')
    );
    
    const hasFullSpend = consoleMessages.some(msg => 
      msg.includes('57721') && msg.includes('dailySpend: 57721')
    );
    
    const hasCriticalDebug = consoleMessages.some(msg => 
      msg.includes('CRITICAL DEBUG - Meta spend distribution')
    );
    
    console.log('\\n📊 VERIFICATION RESULTS:');
    console.log(`✅ Meta processing detected: ${hasMetaProcessing}`);
    console.log(`✅ "USING END DATE ONLY" found: ${hasEndDateOnly}`);
    console.log(`✅ dayCount: 1 confirmed: ${hasDayCount1}`);
    console.log(`✅ Full spend (57721) confirmed: ${hasFullSpend}`);
    console.log(`✅ Critical debug messages: ${hasCriticalDebug}`);
    
    if (hasMetaProcessing && hasEndDateOnly && hasDayCount1 && hasFullSpend) {
      console.log('\\n🎉 SUCCESS: Logic implementation verified!');
      console.log('✅ metaProcessor.ts is correctly using end date only');
      console.log('✅ dayCount is set to 1 (not 2)');
      console.log('✅ Full spend amount preserved (not divided)');
    } else {
      console.log('\\n❌ ISSUE: Logic implementation problems detected');
      console.log('🔍 Missing verification markers - check console logs above');
    }
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
    
    // Keep browser open for manual verification
    console.log('\\n🔍 Browser staying open for 30 seconds for manual verification...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    await browser.close();
  }
}

verifyLogicImplementation().catch(console.error);