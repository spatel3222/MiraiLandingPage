import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function testDashboard() {
  console.log('🚀 Starting MOI Analytics Dashboard Test...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  
  try {
    // Navigate to the dashboard
    console.log('📱 Navigating to dashboard...');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'screenshots/01-dashboard-initial.png',
      fullPage: true 
    });
    console.log('📸 Initial dashboard screenshot taken');
    
    // Check if welcome screen is visible
    const welcomeText = await page.textContent('h2');
    console.log('👋 Welcome text:', welcomeText);
    
    // Test upload modal
    console.log('⚙️ Testing upload modal...');
    await page.click('button[title="Upload Data"]');
    await page.waitForSelector('text=Upload Data Files');
    
    await page.screenshot({ 
      path: 'screenshots/02-upload-modal.png',
      fullPage: true 
    });
    console.log('📸 Upload modal screenshot taken');
    
    // Close modal and test with sample data upload
    await page.keyboard.press('Escape');
    
    // Simulate uploading sample data by creating test data in localStorage
    console.log('📊 Loading sample data...');
    
    const sampleData = {
      keyMetrics: {
        uniqueCampaigns: 68,
        avgAdsetsPerCampaign: 1,
        avgTrafficPerCampaign: 1015,
        totalUniqueUsers: 66956,
        totalSessions: 69009,
        avgSessionTime: 64,
        avgPageviewsPerSession: 1.86,
        totalATC: 296,
        totalCheckoutSessions: 119,
        overallConversionRate: 0.17,
        totalRevenue: 297500
      },
      campaigns: [
        {
          utmCampaign: "BOF | DPA",
          totalCustomers: 13132,
          totalSessions: 13713,
          sessionsPerCustomer: 1.04,
          avgSessionDuration: 34.64,
          checkoutSessions: 18,
          checkoutRate: 0.13,
          cartAdditions: 63,
          cartRate: 0.46,
          pageviews: 24956,
          qualityScore: 25,
          performanceTier: "poor"
        },
        {
          utmCampaign: "india-pmax-rings-22753626610",
          totalCustomers: 1991,
          totalSessions: 2035,
          sessionsPerCustomer: 1.02,
          avgSessionDuration: 73.51,
          checkoutSessions: 23,
          checkoutRate: 1.13,
          cartAdditions: 35,
          cartRate: 1.72,
          pageviews: 5146,
          qualityScore: 85,
          performanceTier: "excellent"
        },
        {
          utmCampaign: "Direct Traffic / Organic",
          totalCustomers: 3443,
          totalSessions: 3975,
          sessionsPerCustomer: 1.15,
          avgSessionDuration: 173.54,
          checkoutSessions: 29,
          checkoutRate: 0.73,
          cartAdditions: 51,
          cartRate: 1.28,
          pageviews: 16787,
          qualityScore: 78,
          performanceTier: "good"
        }
      ],
      lastUpdated: new Date().toISOString()
    };
    
    await page.evaluate((data) => {
      localStorage.setItem('moi-dashboard-data', JSON.stringify(data));
      localStorage.setItem('moi-dashboard-timestamp', data.lastUpdated);
    }, sampleData);
    
    // Reload to see dashboard with data
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'screenshots/03-dashboard-with-data.png',
      fullPage: true 
    });
    console.log('📸 Dashboard with data screenshot taken');
    
    // Test Key Metrics Panel
    console.log('📊 Testing Key Metrics Panel...');
    const uniqueCampaigns = await page.textContent('text=Unique Campaigns');
    console.log('✅ Found Key Metrics Panel');
    
    // Test Campaign Performance Tiers
    console.log('🎯 Testing Campaign Performance Tiers...');
    await page.click('button:has-text("Formula")');
    await page.waitForSelector('text=Quality Score Formula');
    
    await page.screenshot({ 
      path: 'screenshots/04-performance-tiers-info.png',
      fullPage: true 
    });
    console.log('📸 Performance tiers info screenshot taken');
    
    // Test table filtering
    console.log('🔍 Testing table filtering...');
    await page.click('button:has-text("Filters")');
    await page.waitForSelector('input[placeholder="Search campaigns..."]');
    
    await page.fill('input[placeholder="Search campaigns..."]', 'rings');
    await page.screenshot({ 
      path: 'screenshots/05-table-filtering.png',
      fullPage: true 
    });
    console.log('📸 Table filtering screenshot taken');
    
    // Test chatbot
    console.log('🤖 Testing chatbot...');
    await page.click('button[title="Ask questions about your data"]');
    await page.waitForSelector('text=MOI Analytics Assistant');
    
    await page.screenshot({ 
      path: 'screenshots/06-chatbot-opened.png',
      fullPage: true 
    });
    console.log('📸 Chatbot screenshot taken');
    
    // Send a test message to chatbot
    await page.fill('input[placeholder="Ask about your campaigns..."]', 'Show top performing campaigns');
    await page.click('button:has(svg)');
    await page.waitForTimeout(2000); // Wait for response
    
    await page.screenshot({ 
      path: 'screenshots/07-chatbot-response.png',
      fullPage: true 
    });
    console.log('📸 Chatbot response screenshot taken');
    
    // Test export functionality
    console.log('📤 Testing export functionality...');
    await page.click('button:has-text("Export CSV")');
    console.log('✅ Export CSV button clicked');
    
    // Get console logs
    const logs = [];
    page.on('console', msg => logs.push(`${msg.type()}: ${msg.text()}`));
    
    console.log('📋 Console logs:', logs);
    
    console.log('✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'screenshots/error.png' });
  } finally {
    await browser.close();
  }
}

// Create screenshots directory
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

testDashboard().then(() => {
  console.log('🎉 Test completed!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});