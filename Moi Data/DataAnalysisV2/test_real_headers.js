// Test to check what headers the real JuliusV7Engine returns with actual data
const { JuliusV7Engine } = require('./lib/JuliusV7Engine.js');

async function testRealHeaders() {
  console.log('🔍 Testing real Julius V7Engine headers...');
  
  const engine = new JuliusV7Engine();
  
  // Mock minimal raw data that matches what actually works in the system
  const mockRawData = {
    meta: [
      {
        Day: '2025-11-09',
        Campaign: 'Test Campaign',
        'Ad Set': 'Test AdSet',
        Ad: 'Test Ad',
        Spend: 1000,
        Impressions: 20000,
        Clicks: 100,
        CTR: 0.05,
        CPM: 25
      }
    ],
    google: [
      {
        Day: '2025-11-09',
        Campaign: 'Test Google Campaign',
        Spend: 500,
        Impressions: 10000,
        Clicks: 50,
        CTR: 0.05,
        CPM: 50
      }
    ],
    shopify: [
      {
        Day: '2025-11-09',
        'UTM Campaign': 'Test Campaign',
        Sessions: 100,
        Orders: 10,
        Revenue: 5000,
        'Page Views': 500,
        'Average Session Duration': 120
      }
    ]
  };
  
  const dateRange = {
    startDate: '2025-11-09',
    endDate: '2025-11-09'
  };
  
  try {
    const result = await engine.processAnalytics(mockRawData, dateRange, ['meta', 'google', 'shopify']);
    
    console.log('\n✅ ENGINE RESULT STRUCTURE:');
    console.log('Keys:', Object.keys(result));
    
    if (result.outputs) {
      console.log('\n📊 OUTPUTS STRUCTURE:');
      console.log('Output keys:', Object.keys(result.outputs));
      
      if (result.outputs.topLevel && result.outputs.topLevel.length > 0) {
        console.log('\n🎯 ACTUAL TOP LEVEL HEADERS:');
        console.log(Object.keys(result.outputs.topLevel[0]).join(','));
        console.log('Sample data:', JSON.stringify(result.outputs.topLevel[0], null, 2));
      }
      
      if (result.outputs.adSetLevel && result.outputs.adSetLevel.length > 0) {
        console.log('\n🎯 ACTUAL ADSET HEADERS:');
        console.log(Object.keys(result.outputs.adSetLevel[0]).join(','));
      }
      
      if (result.outputs.adLevel && result.outputs.adLevel.length > 0) {
        console.log('\n🎯 ACTUAL AD LEVEL HEADERS:');
        console.log(Object.keys(result.outputs.adLevel[0]).join(','));
      }
    }
  } catch (error) {
    console.error('❌ Error testing real headers:', error.message);
    console.error('Stack:', error.stack);
  }
}

testRealHeaders().catch(console.error);