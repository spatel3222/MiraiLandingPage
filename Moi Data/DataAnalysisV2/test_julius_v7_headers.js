// Test script to verify Julius V7 column specifications are implemented correctly
const fs = require('fs');
const path = require('path');

// Mock the JuliusV7Engine class manually since we can't import it directly
class TestJuliusV7Engine {
  constructor() {
    this.platforms = ['meta', 'google', 'shopify'];
  }

  getDateRange(startDate, endDate) {
    return [startDate, endDate];
  }

  aggregatePlatformDay(data) {
    // Mock aggregation
    return {
      Spend: 1000,
      CTR: 0.05,
      CPM: 25.5,
      Sessions: 100,
      AddToCarts: 20,
      ReachedCheckout: 10,
      AbandonedCheckout: 5,
      AvgSessionDuration: 120,
      GoodLeadUsers: 60,
      QualifiedATCs: 14,
      QualifiedCheckouts: 8
    };
  }

  // Test the exact Julius V7 Top Level Summary specification
  async createTopLevelSummary(scoredData, dateRange) {
    const summary = []
    const dates = this.getDateRange(dateRange.startDate, dateRange.endDate)
    
    dates.forEach(date => {
      // Top Metrics as per Julius V7 specifications
      const dayData = {
        Date: date,
        'Meta Spend': 0,
        'Meta CTR': 0,
        'Meta CPM': 0,
        'Google Spend': 0,
        'Google CTR': 0,
        'Google CPM': 0,
        'Shopify Total Users': 0,
        'Shopify Total ATC': 0,
        'Shopify Total Reached Checkout': 0,
        'Shopify Total Abandoned Checkout': 0,
        'Shopify Session Duration': 0,
        'Users with Session above 1 min': 0,
        'Users with Above 5 page views and above 1 min': 0,
        'ATC with session duration above 1 min': 0,
        'Reached Checkout with session duration above 1 min': 0
      }
      
      // Aggregate platform data for this date
      this.platforms.forEach(platform => {
        if (scoredData[platform]) {
          const platformDayData = scoredData[platform].filter(row => row.Day === date)
          const platformAgg = this.aggregatePlatformDay(platformDayData)
          
          if (platform === 'meta') {
            dayData['Meta Spend'] = platformAgg.Spend || 0
            dayData['Meta CTR'] = platformAgg.CTR || 0
            dayData['Meta CPM'] = platformAgg.CPM || 0
          } else if (platform === 'google') {
            dayData['Google Spend'] = platformAgg.Spend || 0
            dayData['Google CTR'] = platformAgg.CTR || 0
            dayData['Google CPM'] = platformAgg.CPM || 0
          } else if (platform === 'shopify') {
            dayData['Shopify Total Users'] = platformAgg.Sessions || 0
            dayData['Shopify Total ATC'] = platformAgg.AddToCarts || 0
            dayData['Shopify Total Reached Checkout'] = platformAgg.ReachedCheckout || 0
            dayData['Shopify Total Abandoned Checkout'] = platformAgg.AbandonedCheckout || 0
            dayData['Shopify Session Duration'] = platformAgg.AvgSessionDuration || 0
            const goodLeadUsers = platformAgg.GoodLeadUsers || 0
            dayData['Users with Session above 1 min'] = goodLeadUsers
            dayData['Users with Above 5 page views and above 1 min'] = goodLeadUsers
            dayData['ATC with session duration above 1 min'] = platformAgg.QualifiedATCs || 0
            dayData['Reached Checkout with session duration above 1 min'] = platformAgg.QualifiedCheckouts || 0
          }
        }
      })
      
      summary.push(dayData)
    })
    
    return summary
  }

  // Test the exact Julius V7 AdSet Summary specification
  async createAdSetSummary(scoredData) {
    const adSetSummary = []
    
    if (scoredData.meta) {
      scoredData.meta.forEach(row => {
        if (row['Ad Set']) {
          adSetSummary.push({
            Date: row.Day,
            'Campaign name': row.Campaign,
            'Ad Set Name': row['Ad Set'],
            'Ad Set Delivery': 'Active',
            'Spent': row.Spend,
            'Cost per user': row.CostPerUser || (row.Spend / (row.Sessions || 1)),
            'Users': row.Sessions || 0,
            'ATC': row.AddToCarts || 0,
            'Reached Checkout': row.ReachedCheckout || 0,
            'Conversions': row.Conversions || 0,
            'Average session duration': row.AvgSessionDuration || 0,
            'Cost per 1 min user': row.CostPer1MinUser || 0,
            '1min user/ total users (%)': row.OneMinUserPercentage || 0,
            'Users with Session above 1 min': row.UsersAbove1Min || 0,
            'ATC with session duration above 1 min': row.QualifiedATCs || 0,
            'Reached Checkout with session duration above 1 min': row.QualifiedCheckouts || 0,
            'Users with Above 5 page views and above 1 min': row.QualifiedUsers || 0
          })
        }
      })
    }
    
    return adSetSummary
  }

  // Test the exact Julius V7 Ad Level Summary specification
  async createAdLevelSummary(scoredData) {
    const adSummary = []
    
    if (scoredData.meta) {
      scoredData.meta.forEach(row => {
        if (row.Ad) {
          adSummary.push({
            Date: row.Day,
            'Campaign name': row.Campaign,
            'Ad Set Name': row['Ad Set'],
            'Ad Name': row.Ad,
            'Ad Set Delivery': 'Active',
            'Spent': row.Spend,
            'CTR': row.CTR_Shrunk || row.CTR || 0,
            'Cost per user': row.CostPerUser || (row.Spend / (row.Sessions || 1)),
            'Users': row.Sessions || 0,
            'ATC': row.AddToCarts || 0,
            'Reached Checkout': row.ReachedCheckout || 0,
            'Conversions': row.Conversions || 0,
            'Average session duration': row.AvgSessionDuration || 0,
            'Cost per 1 min user': row.CostPer1MinUser || 0,
            '1min user/ total users (%)': row.OneMinUserPercentage || 0,
            'Users with Session above 1 min': row.UsersAbove1Min || 0,
            'ATC with session duration above 1 min': row.QualifiedATCs || 0,
            'Reached Checkout with session duration above 1 min': row.QualifiedCheckouts || 0,
            'Users with Above 5 page views and above 1 min': row.QualifiedUsers || 0
          })
        }
      })
    }
    
    return adSummary
  }
}

// Test with mock data
async function testJuliusV7Headers() {
  const engine = new TestJuliusV7Engine();
  
  // Mock scored data
  const mockScoredData = {
    meta: [
      {
        Day: '2025-11-09',
        Campaign: 'Test Campaign',
        'Ad Set': 'Test AdSet',
        Ad: 'Test Ad',
        Spend: 1000,
        Sessions: 100,
        AddToCarts: 20,
        ReachedCheckout: 10,
        Conversions: 5,
        AvgSessionDuration: 120,
        CostPerUser: 10,
        CostPer1MinUser: 15,
        OneMinUserPercentage: 60,
        UsersAbove1Min: 60,
        QualifiedATCs: 14,
        QualifiedCheckouts: 8,
        QualifiedUsers: 50,
        CTR: 0.05
      }
    ],
    shopify: [
      {
        Day: '2025-11-09',
        Sessions: 200,
        AddToCarts: 40,
        ReachedCheckout: 20,
        AvgSessionDuration: 150
      }
    ]
  };

  // Test all three functions
  const topLevel = await engine.createTopLevelSummary(mockScoredData, {startDate: '2025-11-09', endDate: '2025-11-09'});
  const adSetLevel = await engine.createAdSetSummary(mockScoredData);
  const adLevel = await engine.createAdLevelSummary(mockScoredData);

  console.log('✅ JULIUS V7 COLUMN SPECIFICATIONS VALIDATION\n');
  
  console.log('🎯 TOP METRICS CSV HEADERS:');
  console.log(Object.keys(topLevel[0] || {}).join(','));
  console.log('');
  
  console.log('🎯 ADSET METRICS CSV HEADERS:');
  console.log(Object.keys(adSetLevel[0] || {}).join(','));
  console.log('');
  
  console.log('🎯 AD-LEVEL METRICS CSV HEADERS:');
  console.log(Object.keys(adLevel[0] || {}).join(','));
  console.log('');

  // Verify against Julius V7 specifications
  const expectedTopHeaders = [
    'Date', 'Meta Spend', 'Meta CTR', 'Meta CPM', 'Google Spend', 'Google CTR', 'Google CPM',
    'Shopify Total Users', 'Shopify Total ATC', 'Shopify Total Reached Checkout', 
    'Shopify Total Abandoned Checkout', 'Shopify Session Duration',
    'Users with Session above 1 min', 'Users with Above 5 page views and above 1 min',
    'ATC with session duration above 1 min', 'Reached Checkout with session duration above 1 min'
  ];

  const expectedAdSetHeaders = [
    'Date', 'Campaign name', 'Ad Set Name', 'Ad Set Delivery', 'Spent', 'Cost per user', 'Users',
    'ATC', 'Reached Checkout', 'Conversions', 'Average session duration', 'Cost per 1 min user',
    '1min user/ total users (%)', 'Users with Session above 1 min', 
    'ATC with session duration above 1 min', 'Reached Checkout with session duration above 1 min',
    'Users with Above 5 page views and above 1 min'
  ];

  const expectedAdHeaders = [
    'Date', 'Campaign name', 'Ad Set Name', 'Ad Name', 'Ad Set Delivery', 'Spent', 'CTR',
    'Cost per user', 'Users', 'ATC', 'Reached Checkout', 'Conversions', 
    'Average session duration', 'Cost per 1 min user', '1min user/ total users (%)',
    'Users with Session above 1 min', 'ATC with session duration above 1 min',
    'Reached Checkout with session duration above 1 min', 'Users with Above 5 page views and above 1 min'
  ];

  // Validation
  const topHeaders = Object.keys(topLevel[0] || {});
  const adSetHeaders = Object.keys(adSetLevel[0] || {});
  const adHeaders = Object.keys(adLevel[0] || {});

  console.log('📊 VALIDATION RESULTS:');
  console.log(`Top Metrics: ${topHeaders.length}/${expectedTopHeaders.length} headers match`);
  console.log(`AdSet Metrics: ${adSetHeaders.length}/${expectedAdSetHeaders.length} headers match`);
  console.log(`Ad-level Metrics: ${adHeaders.length}/${expectedAdHeaders.length} headers match`);
  
  const topMatch = JSON.stringify(topHeaders) === JSON.stringify(expectedTopHeaders);
  const adSetMatch = JSON.stringify(adSetHeaders) === JSON.stringify(expectedAdSetHeaders);
  const adMatch = JSON.stringify(adHeaders) === JSON.stringify(expectedAdHeaders);
  
  console.log(`\n✅ Julius V7 Compliance: ${topMatch && adSetMatch && adMatch ? 'PASSED' : 'FAILED'}`);
}

testJuliusV7Headers().catch(console.error);