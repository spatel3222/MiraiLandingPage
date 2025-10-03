import { chromium, FullConfig } from '@playwright/test';

/**
 * Global setup for MOI Analytics Dashboard testing
 * Prepares test environment and sample data
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up MOI Analytics Dashboard test environment...');
  
  // Launch browser for setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to the app
    await page.goto('http://localhost:5173');
    
    // Clear any existing localStorage data
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    // Set up test data in localStorage (simulating actual data structure)
    await page.evaluate(() => {
      // Sample Meta Ads data (actual format from exported files)
      const metaData = [
        {
          "Campaign name": "BOF | DPA",
          "Ad set name": "DPA - Broad", 
          "Amount spent (INR)": 2500,
          "CTR (link click-through rate)": 1.45,
          "CPM (cost per 1,000 impressions)": 59.10,
          "Impressions": 42300,
          "Link clicks": 614
        },
        {
          "Campaign name": "TOF | Interest",
          "Ad set name": "Luxury Shoppers",
          "Amount spent (INR)": 1800,
          "CTR (link click-through rate)": 1.23,
          "CPM (cost per 1,000 impressions)": 63.16,
          "Impressions": 28500,
          "Link clicks": 351
        }
      ];
      
      // Sample Google Ads data
      const googleData = [
        {
          "Campaign": "india-pmax-rings",
          "Cost": 1200,
          "CTR": "2.04%",
          "Avg. CPM": 244.90,
          "Impressions": 4900,
          "Clicks": 100
        }
      ];
      
      // Sample Shopify data with UTM parameters
      const shopifyData = [
        {
          "Landing Page": "https://example.com/?utm_source=meta&utm_medium=cpc&utm_campaign=BOF%20%7C%20DPA&utm_term=DPA%20-%20Broad",
          "Sessions": 523,
          "Online store visitors": 523,
          "Sessions with cart additions": 3,
          "Sessions that reached checkout": 1,
          "Sessions that completed checkout": 0,
          "Average session duration": 45,
          "Pageviews": 1892
        },
        {
          "Landing Page": "https://example.com/?utm_source=meta&utm_medium=cpc&utm_campaign=TOF%20%7C%20Interest&utm_term=Luxury%20Shoppers",
          "Sessions": 351,
          "Online store visitors": 351,
          "Sessions with cart additions": 2,
          "Sessions that reached checkout": 0,
          "Sessions that completed checkout": 0,
          "Average session duration": 38,
          "Pageviews": 1204
        },
        {
          "Landing Page": "https://example.com/?utm_source=google&utm_medium=cpc&utm_campaign=india-pmax-rings",
          "Sessions": 100,
          "Online store visitors": 100,
          "Sessions with cart additions": 1,
          "Sessions that reached checkout": 1,
          "Sessions that completed checkout": 1,
          "Average session duration": 125,
          "Pageviews": 750
        }
      ];
      
      // Store in the format the app expects - CRITICAL ISSUE IDENTIFIED!
      // The export system looks for 'moi-meta-data' and 'moi-google-data'
      // But the file loading system stores data in different keys
      localStorage.setItem('moi-meta-data', JSON.stringify(metaData));
      localStorage.setItem('moi-google-data', JSON.stringify(googleData));
      localStorage.setItem('moi-shopify-data', JSON.stringify(shopifyData));
      
      // Also store sample CSV data in the server-side keys
      const topLevelCSV = `Date,Meta Spend,Meta CTR,Meta CPM,Google Spend,Google CTR,Google CPM,Total Users,Total ATC,Total Reached Checkout,Total Abandoned Checkout,Session Duration,Users with Session above 1 min,Users with Above 5 page views and above 1 min,ATC with session duration above 1 min,Reached Checkout with session duration above 1 min
2025-09-29,4300,1.34,61.13,1200,2.04,244.90,974,6,2,0,52,234,89,4,1`;
      
      const adsetCSV = `Date,Campaign name,Ad Set Name,Ad Set Delivery,Ad Set Level Spent,Ad Set Level Users,Cost per user,Ad Set Level ATC,Ad Set Level Reached Checkout,Ad Set Level Conversions,Ad Set Level Average session duration,Ad Set Level Users with Session above 1 min,Ad Set Level Cost per 1 min user,Ad Set Level 1min user/ total users (%),Ad Set Level ATC with session duration above 1 min,Ad Set Level Reached Checkout with session duration above 1 min,Ad Set Level Users with Above 5 page views and above 1 min
2025-09-29,BOF | DPA,DPA - Broad,active,2500,523,4.78,3,1,0,45,124,20.16,23.71,2,0,45
2025-09-29,TOF | Interest,Luxury Shoppers,active,1800,351,5.13,2,0,0,38,89,20.22,25.36,1,0,32
2025-09-29,india-pmax-rings,Performance Max,active,1200,100,12.00,1,1,1,125,21,57.14,21.00,1,1,12`;
      
      localStorage.setItem('moi-server-topLevel', topLevelCSV);
      localStorage.setItem('moi-server-adset', adsetCSV);
      localStorage.setItem('moi-server-topLevel-timestamp', new Date().toISOString());
      localStorage.setItem('moi-server-adset-timestamp', new Date().toISOString());
      
      // Cache version and dashboard data
      localStorage.setItem('moi-cache-version', '1.0.0');
      localStorage.setItem('moi-dashboard-timestamp', new Date().toISOString());
      
      console.log('✅ Test data setup completed');
      console.log('📊 localStorage keys created:', Object.keys(localStorage));
    });
    
    console.log('✅ Global setup completed successfully');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;