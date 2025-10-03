import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function clearCacheAndRetest() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture console logs
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Meta') || text.includes('🔍') || text.includes('CRITICAL') || text.includes('USING END DATE')) {
      console.log(`🔍 CONSOLE: ${text}`);
    }
  });
  
  try {
    console.log('🚀 Clearing cache and retesting Meta fix...');
    
    // Navigate to the app
    await page.goto('http://localhost:5175/');
    await page.waitForLoadState('networkidle');
    
    console.log('🧹 Clearing all localStorage and session data...');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      // Clear any window data
      if (window.dashboardData) delete window.dashboardData;
      if (window.metaData) delete window.metaData;
      if (window.googleData) delete window.googleData;
      if (window.shopifyData) delete window.shopifyData;
    });
    
    // Force page reload
    await page.reload({ waitUntil: 'networkidle' });
    console.log('♻️ Page reloaded with fresh state');
    
    // Check for sample data files
    const dataDir = '/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/moi-analytics-dashboard/MOI_Sample_Output_Generation/01_Original_Input';
    
    if (fs.existsSync(dataDir)) {
      const files = fs.readdirSync(dataDir);
      
      const metaFiles = files.filter(f => f.toLowerCase().includes('meta') && f.endsWith('.csv'));
      const shopifyFiles = files.filter(f => f.toLowerCase().includes('shopify') && f.endsWith('.csv'));
      const googleFiles = files.filter(f => f.toLowerCase().includes('google') && f.endsWith('.csv'));
      
      console.log(`📁 Found files - Meta: ${metaFiles.length}, Shopify: ${shopifyFiles.length}, Google: ${googleFiles.length}`);
      
      if (metaFiles.length > 0) {
        console.log('📤 Uploading Meta file...');
        
        // Look for file input (might need to click upload button first)
        let fileInput = page.locator('input[type="file"]');
        
        // If no file input visible, try to click upload button
        if (await fileInput.count() === 0) {
          const uploadButton = page.locator('button').filter({ hasText: /upload|file|import/i });
          if (await uploadButton.count() > 0) {
            await uploadButton.first().click();
            await page.waitForTimeout(1000);
            fileInput = page.locator('input[type="file"]');
          }
        }
        
        if (await fileInput.count() > 0) {
          const metaFile = path.join(dataDir, metaFiles[0]);
          await fileInput.first().setInputFiles(metaFile);
          console.log(`✅ Uploaded Meta file: ${metaFiles[0]}`);
          
          // Wait for processing
          await page.waitForTimeout(3000);
          
          // Try to trigger export
          const exportButton = page.locator('button').filter({ hasText: /export|download|generate/i });
          if (await exportButton.count() > 0) {
            console.log('📊 Triggering export...');
            await exportButton.first().click();
            await page.waitForTimeout(2000);
            
            // Look for Top Level or similar
            const topLevelButton = page.locator('button').filter({ hasText: /top level|daily/i });
            if (await topLevelButton.count() > 0) {
              await topLevelButton.first().click();
              await page.waitForTimeout(1000);
            }
          }
        } else {
          console.log('❌ No file input found');
        }
      }
    }
    
    console.log('🔍 Keeping browser open for manual verification...');
    console.log('📋 Check the console logs above for "CRITICAL DEBUG" messages');
    console.log('📋 Look for dayCount: 1 and dailySpend: 57721');
    
    // Keep browser open longer for manual inspection
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

clearCacheAndRetest().catch(console.error);