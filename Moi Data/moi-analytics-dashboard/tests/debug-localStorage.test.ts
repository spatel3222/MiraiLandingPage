import { test, expect } from '@playwright/test';

test('Debug localStorage issues with file uploads', async ({ page }) => {
  console.log('🚀 Starting localStorage debugging test...');
  
  // Navigate to the main dashboard
  await page.goto('http://localhost:5175/');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Step 1: Check initial localStorage state
  console.log('\n📊 STEP 1: Initial localStorage state');
  const initialKeys = await page.evaluate(() => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        keys.push({
          key,
          size: value ? value.length : 0,
          hasData: !!value && value.length > 0
        });
      }
    }
    return keys;
  });
  
  console.log('Initial localStorage keys:', initialKeys);
  
  // Step 2: Open upload modal and check if it exists
  console.log('\n📊 STEP 2: Testing upload modal');
  
  const generateReportButton = page.getByRole('button', { name: 'Generate Reports' });
  await expect(generateReportButton).toBeVisible();
  await generateReportButton.click();
  
  // Wait for upload modal
  await page.waitForSelector('.upload-modal', { timeout: 5000 }).catch(() => {
    console.log('⚠️ Upload modal selector not found, trying alternative selectors...');
  });
  
  // Check what upload interface is available
  const uploadElements = await page.locator('input[type="file"]').count();
  console.log(`Found ${uploadElements} file input elements`);
  
  if (uploadElements === 0) {
    console.log('❌ No file inputs found - checking page content...');
    const pageContent = await page.content();
    console.log('Page title:', await page.title());
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'debug-upload-modal.png', fullPage: true });
    console.log('📸 Screenshot saved as debug-upload-modal.png');
    
    return;
  }
  
  // Step 3: Simulate file uploads (create test files)
  console.log('\n📊 STEP 3: Creating test files and uploading');
  
  // Create test CSV content
  const shopifyCSV = `Day,UTM campaign,UTM term,Online store visitors,Sessions with cart additions,Sessions that reached checkout,Sessions that completed checkout,Average session duration,Pageviews
2025-09-29,Test Campaign 1,Test Term 1,100,15,10,5,120,500
2025-09-29,Test Campaign 2,Test Term 2,200,30,20,10,180,1000`;

  const metaCSV = `Campaign name,Ad set name,Amount spent (INR),CTR (link click-through rate),CPM (cost per 1,000 impressions)
Test Meta Campaign,Test Meta AdSet,2500,1.45,59.10
Test Meta Campaign 2,Test Meta AdSet 2,1800,1.23,63.16`;

  const googleCSV = `Campaign,Cost,CTR,Avg. CPM
Test Google Campaign,1200,2.04%,244.90`;

  // Look for file inputs and upload test files
  const fileInputs = page.locator('input[type="file"]');
  const fileInputCount = await fileInputs.count();
  
  // Map each file input to the correct CSV content
  const fileInputMappings = [
    { csvContent: shopifyCSV, fileName: 'test-shopify.csv', label: 'Shopify Export' },
    { csvContent: metaCSV, fileName: 'test-meta.csv', label: 'Meta Ads' },
    { csvContent: googleCSV, fileName: 'test-google.csv', label: 'Google Ads' }
  ];

  for (let i = 0; i < Math.min(fileInputCount, fileInputMappings.length); i++) {
    const input = fileInputs.nth(i);
    const mapping = fileInputMappings[i];
    
    console.log(`Processing file input ${i}: ${mapping.label}`);
    
    // Use Playwright's setInputFiles method which properly triggers React events
    await input.setInputFiles({
      name: mapping.fileName,
      mimeType: 'text/csv',
      buffer: Buffer.from(mapping.csvContent)
    });
    
    console.log(`✅ Set ${mapping.fileName} to ${mapping.label} input`);
    
    // Wait a moment for React to process the file change
    await page.waitForTimeout(500);
  }
  
  // Step 4: Submit upload form
  console.log('\n📊 STEP 4: Submitting upload form');
  
  // Wait a bit longer for the UI to be ready after file uploads
  await page.waitForTimeout(2000);
  
  // Take a screenshot to see current state
  await page.screenshot({ path: 'debug-before-submit.png', fullPage: true });
  
  // Try to find and click the Generate Reports button in the modal
  try {
    // First, try the most specific selector for the Generate Reports button
    const generateButton = page.locator('button', { hasText: 'Generate Reports' }).last();
    await generateButton.waitFor({ timeout: 5000 });
    console.log('✅ Found Generate Reports button');
    await generateButton.click();
    console.log('✅ Clicked Generate Reports button');
  } catch (e) {
    console.log('❌ Could not find Generate Reports button, trying alternatives...');
    
    // List all buttons to debug
    const allButtons = await page.locator('button').all();
    console.log(`Found ${allButtons.length} buttons on page`);
    
    for (let i = 0; i < allButtons.length; i++) {
      const buttonText = await allButtons[i].textContent();
      console.log(`Button ${i}: "${buttonText}"`);
    }
    
    await page.screenshot({ path: 'debug-no-submit.png', fullPage: true });
    return;
  }
  
  // Wait for processing
  await page.waitForTimeout(3000);
  
  // Step 5: Check localStorage after upload
  console.log('\n📊 STEP 5: Checking localStorage after upload');
  
  const afterUploadKeys = await page.evaluate(() => {
    const keys = [];
    const moiKeys = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        const keyInfo = {
          key,
          size: value ? value.length : 0,
          hasData: !!value && value.length > 0,
          preview: value ? value.substring(0, 100) : 'null'
        };
        
        keys.push(keyInfo);
        
        if (key.startsWith('moi-')) {
          moiKeys.push(keyInfo);
        }
      }
    }
    
    return { allKeys: keys, moiKeys };
  });
  
  console.log('All localStorage keys after upload:', afterUploadKeys.allKeys);
  console.log('MOI-specific keys:', afterUploadKeys.moiKeys);
  
  // Step 6: Test the inspector page
  console.log('\n📊 STEP 6: Testing data inspector');
  
  await page.goto('http://localhost:5175/data_inspector.html');
  await page.waitForLoadState('networkidle');
  
  // Wait for inspector to analyze data
  await page.waitForTimeout(2000);
  
  // Check what the inspector found
  const inspectorResults = await page.evaluate(() => {
    // Look for status cards
    const statusCards = document.querySelectorAll('.status-card');
    const results = [];
    
    statusCards.forEach(card => {
      const label = card.querySelector('strong')?.textContent || 'Unknown';
      const status = card.textContent?.includes('FOUND') ? 'FOUND' : 
                   card.textContent?.includes('MISSING') ? 'MISSING' : 'UNKNOWN';
      results.push({ label, status });
    });
    
    return results;
  });
  
  console.log('Inspector status results:', inspectorResults);
  
  // Step 7: Debug any mismatches
  console.log('\n📊 STEP 7: Final debugging analysis');
  
  const analysis = await page.evaluate(() => {
    const expectedKeys = [
      'moi-shopify-data',
      'moi-meta-data', 
      'moi-google-data',
      'moi-dashboard-data'
    ];
    
    const analysis = [];
    
    expectedKeys.forEach(expectedKey => {
      const value = localStorage.getItem(expectedKey);
      analysis.push({
        key: expectedKey,
        exists: !!value,
        size: value ? value.length : 0,
        isValidJSON: value ? (() => {
          try {
            JSON.parse(value);
            return true;
          } catch (e) {
            return false;
          }
        })() : false
      });
    });
    
    return analysis;
  });
  
  console.log('Final localStorage analysis:', analysis);
  
  // Take final screenshot
  await page.screenshot({ path: 'debug-final-state.png', fullPage: true });
  console.log('📸 Final screenshot saved as debug-final-state.png');
  
  // Summary
  console.log('\n📋 DEBUGGING SUMMARY:');
  console.log('- Initial keys found:', initialKeys.length);
  console.log('- Keys after upload:', afterUploadKeys.allKeys.length);
  console.log('- MOI keys found:', afterUploadKeys.moiKeys.length);
  console.log('- Expected keys analysis:', analysis);
  
  const missingKeys = analysis.filter(item => !item.exists);
  if (missingKeys.length > 0) {
    console.log('❌ Missing keys:', missingKeys.map(item => item.key));
  } else {
    console.log('✅ All expected keys found!');
  }
});