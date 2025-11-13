const axios = require('axios');

async function checkColumns() {
  try {
    console.log('=== FETCHING DATA TO CHECK COLUMNS ===');
    const response = await axios.post('http://localhost:3001/api/retrieve-data', {
      startDate: '2025-11-09', 
      endDate: '2025-11-10', 
      reportType: 'custom' 
    });
    
    const result = response.data;
    
    if (result.success && result.data) {
      console.log('\n=== ACTUAL DATABASE COLUMNS ===');
      
      if (result.data.meta && result.data.meta.length > 0) {
        console.log('Meta columns:', Object.keys(result.data.meta[0]));
      }
      
      if (result.data.google && result.data.google.length > 0) {
        console.log('Google columns:', Object.keys(result.data.google[0]));
      }
      
      if (result.data.shopify && result.data.shopify.length > 0) {
        console.log('Shopify columns:', Object.keys(result.data.shopify[0]));
      }
    }
    
    console.log('\n=== JULIUS V7 EXPECTED COLUMNS ===');
    console.log('Meta expected: ["Day", "Campaign name", "Ad set name", "Ad name", "Amount spent (INR)", "CPM (cost per 1,000 impressions)", "CTR (link click-through rate)"]');
    console.log('Google expected: ["Day", "Campaign", "Cost", "Avg. CPM", "CTR"]');
    console.log('Shopify expected: ["Day", "UTM campaign", "UTM term", "UTM content", "Online store visitors", "Sessions that completed checkout", "Sessions that reached checkout", "Sessions with cart additions", "Average session duration", "Pageviews"]');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkColumns();