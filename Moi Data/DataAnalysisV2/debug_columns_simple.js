const http = require('http');

const postData = JSON.stringify({
  startDate: '2025-11-09',
  endDate: '2025-11-10', 
  reportType: 'custom'
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/retrieve-data',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      
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
      console.error('Error parsing response:', error);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.write(postData);
req.end();