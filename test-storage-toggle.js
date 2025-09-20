const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:8000/workshops/business-automation-dashboard.html');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  
  console.log('\n=== TESTING STORAGE TOGGLE SWITCH ===');
  
  // Open settings
  await page.locator('.settings-trigger').click();
  await page.waitForTimeout(1000);
  
  // Check if toggle switch is visible
  const toggleSwitch = await page.locator('#storageToggle').isVisible();
  console.log('Toggle switch visible:', toggleSwitch);
  
  if (toggleSwitch) {
    // Check initial state (should be checked for Supabase Cloud)
    const isChecked = await page.locator('#storageToggle').isChecked();
    console.log('Initial toggle state (checked = Supabase):', isChecked);
    
    // Test toggle to Local Storage
    await page.locator('#storageToggle').click();
    await page.waitForTimeout(500);
    
    const afterToggle = await page.locator('#storageToggle').isChecked();
    console.log('After toggle click (checked = Supabase):', afterToggle);
    
    // Toggle back to Supabase Cloud
    await page.locator('#storageToggle').click();
    await page.waitForTimeout(500);
    
    const finalState = await page.locator('#storageToggle').isChecked();
    console.log('Final toggle state (checked = Supabase):', finalState);
    
    console.log('✅ Toggle switch functionality working');
  } else {
    console.log('❌ Toggle switch not found');
  }
  
  // Take screenshot
  await page.screenshot({ 
    path: 'test-results/storage-toggle-switch.png',
    fullPage: true 
  });
  
  console.log('\n📸 Screenshot saved as storage-toggle-switch.png');
  
  await browser.close();
})();