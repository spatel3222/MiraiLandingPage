const { chromium } = require('playwright');

async function debugMetaDateFix() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Meta') || text.includes('🔍') || text.includes('dateRange')) {
      console.log(`🔍 CONSOLE: ${text}`);
    }
  });
  
  try {
    console.log('🚀 Starting Meta Date Fix Debug...');
    
    // Navigate to the app
    await page.goto('http://localhost:5175/');
    await page.waitForLoadState('networkidle');
    
    console.log('📱 App loaded, checking for CSV upload interface...');
    
    // Check if we need to refresh to get latest code
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Look for file upload elements
    const fileInputs = await page.locator('input[type="file"]').count();
    console.log(`📎 Found ${fileInputs} file input elements`);
    
    if (fileInputs > 0) {
      console.log('✅ File upload interface detected');
      
      // Check localStorage for any cached data
      const localStorage = await page.evaluate(() => {
        const keys = Object.keys(localStorage);
        const data = {};
        keys.forEach(key => {
          try {
            data[key] = JSON.parse(localStorage[key]);
          } catch {
            data[key] = localStorage[key];
          }
        });
        return data;
      });
      
      console.log('💾 Current localStorage:', Object.keys(localStorage));
      
      // Clear localStorage to ensure fresh start
      await page.evaluate(() => localStorage.clear());
      console.log('🧹 Cleared localStorage');
      
      // Check if there are any CSV files in the sample data directory
      const fs = require('fs');
      const path = require('path');
      const dataDir = '/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/moi-analytics-dashboard/MOI_Sample_Output_Generation/01_Original_Input';
      
      if (fs.existsSync(dataDir)) {
        const files = fs.readdirSync(dataDir);
        const metaFiles = files.filter(f => f.toLowerCase().includes('meta'));
        console.log(`📁 Found Meta files: ${metaFiles}`);
        
        if (metaFiles.length > 0) {
          const metaFile = path.join(dataDir, metaFiles[0]);
          console.log(`📄 Will test with: ${metaFile}`);
          
          // Upload the Meta file
          const metaInput = page.locator('input[type="file"]').first();
          await metaInput.setInputFiles(metaFile);
          
          // Wait for processing
          await page.waitForTimeout(2000);
          
          // Try to trigger export to see the console logs
          const exportButton = page.locator('button').filter({ hasText: /export|download/i });
          if (await exportButton.count() > 0) {
            await exportButton.first().click();
            await page.waitForTimeout(1000);
          }
        }
      }
      
      // Check current state
      const currentData = await page.evaluate(() => {
        return {
          localStorage: Object.keys(localStorage),
          hasMetaData: !!window.metaData,
          hasProcessedData: !!window.processedData
        };
      });
      
      console.log('📊 Current app state:', currentData);
      
    } else {
      console.log('❌ No file upload interface found');
    }
    
    // Keep browser open for manual inspection
    console.log('🔍 Browser will stay open for manual inspection...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  } finally {
    await browser.close();
  }
}

debugMetaDateFix().catch(console.error);