const { test, expect } = require('@playwright/test');

test('Check for 404 errors on business automation dashboard', async ({ page }) => {
  const failedRequests = [];
  
  // Listen to all network responses
  page.on('response', response => {
    if (response.status() === 404) {
      failedRequests.push({
        url: response.url(),
        status: response.status(),
        method: response.request().method()
      });
    }
  });

  // Navigate to the page
  await page.goto('http://localhost:8000/workshops/business-automation-dashboard.html', {
    waitUntil: 'networkidle'
  });

  // Wait a bit more to ensure all resources are loaded
  await page.waitForTimeout(2000);

  // Log all 404 errors
  if (failedRequests.length > 0) {
    console.log('\n❌ Found 404 errors:');
    failedRequests.forEach(request => {
      console.log(`  - ${request.method} ${request.url}`);
    });
  } else {
    console.log('\n✅ No 404 errors found');
  }

  // Also check for any console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.waitForTimeout(1000);

  if (consoleErrors.length > 0) {
    console.log('\n⚠️  Console errors:');
    consoleErrors.forEach(error => {
      console.log(`  - ${error}`);
    });
  }

  // Fail the test if there are 404 errors
  expect(failedRequests.length).toBe(0);
});