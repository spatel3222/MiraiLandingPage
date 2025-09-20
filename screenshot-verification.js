const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:8000/workshops/business-automation-dashboard.html');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(4000);
  
  // Select a project first
  await page.locator('#headerProjectSelector').selectOption('7029fc69-769d-44e6-bc25-c746e38deb65');
  await page.waitForTimeout(2000);
  
  // Open Manage Projects workspace
  await page.locator('.fab-main').click();
  await page.waitForTimeout(500);
  await page.locator('.fab-option:has-text("Manage Projects")').click();
  await page.waitForTimeout(2000);
  
  // Take screenshot of Projects workspace metrics
  await page.screenshot({ 
    path: 'verification-projects-metrics.png',
    fullPage: true 
  });
  
  // Take focused screenshot of just the metrics section
  const metricsSection = page.locator('.grid.grid-cols-3').first();
  await metricsSection.screenshot({ 
    path: 'verification-projects-metrics-focused.png'
  });
  
  // Close and open Processes workspace
  await page.locator('.workspace-back-btn').click();
  await page.waitForTimeout(500);
  
  await page.locator('.fab-main').click();
  await page.waitForTimeout(500);
  await page.locator('.fab-option:has-text("Manage Processes")').click();
  await page.waitForTimeout(2000);
  
  // Take screenshot of Processes workspace metrics
  await page.screenshot({ 
    path: 'verification-processes-metrics.png',
    fullPage: true 
  });
  
  // Take focused screenshot of processes metrics
  const processMetricsSection = page.locator('.grid.grid-cols-3').first();
  await processMetricsSection.screenshot({ 
    path: 'verification-processes-metrics-focused.png'
  });
  
  console.log('Screenshots taken successfully!');
  console.log('Files created:');
  console.log('- verification-projects-metrics.png');
  console.log('- verification-projects-metrics-focused.png');
  console.log('- verification-processes-metrics.png'); 
  console.log('- verification-processes-metrics-focused.png');
  
  await browser.close();
})();