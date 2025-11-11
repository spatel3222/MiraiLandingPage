# Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for MOI Data Analytics V2, covering unit testing, integration testing, end-to-end testing, and performance testing across all three implementation phases.

## Testing Framework

### Technology Stack
- **Unit Testing**: Jest with jsdom for React components
- **Integration Testing**: Supertest for API testing
- **E2E Testing**: Playwright for browser automation
- **Performance Testing**: Artillery for load testing
- **Database Testing**: Supabase test instances
- **Mocking**: MSW (Mock Service Worker) for API mocking

### Test Environment Setup
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/components/**/*.test.jsx',
    '<rootDir>/lib/**/*.test.js'
  ],
  collectCoverageFrom: [
    'components/**/*.{js,jsx}',
    'lib/**/*.{js,jsx}',
    'pages/**/*.{js,jsx}',
    '!pages/_*.{js,jsx}',
    '!**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1'
  }
};
```

## Phase 1 Testing: Upload & Validation

### Unit Tests

#### CSV Validation Tests
```javascript
// tests/lib/validators.test.js
import { validateCSV, PLATFORM_SCHEMAS } from '@/lib/validators';

describe('CSV Validation', () => {
  describe('Meta CSV Validation', () => {
    test('validates correct Meta CSV structure', async () => {
      const mockFile = createMockCSV('meta', {
        'Day': '2025-11-10',
        'Campaign name': 'Test Campaign',
        'Ad set name': 'Test Ad Set',
        'Ad name': 'Test Ad',
        'Amount spent (INR)': '100.50',
        'CTR (link click-through rate)': '2.5',
        'CPM (cost per 1,000 impressions)': '15.75'
      });

      const result = await validateCSV('meta', mockFile);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.rowCount).toBe(1);
    });

    test('detects missing required columns', async () => {
      const mockFile = createMockCSV('meta', {
        'Day': '2025-11-10',
        'Campaign name': 'Test Campaign'
        // Missing required columns
      });

      const result = await validateCSV('meta', mockFile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'missing_columns',
          columns: expect.arrayContaining(['Ad set name', 'Ad name'])
        })
      );
    });

    test('detects inconsistent date formats', async () => {
      const mockFile = createMockCSV('meta', [
        {
          'Day': '2025-11-10',
          'Campaign name': 'Test Campaign 1',
          'Ad set name': 'Test Ad Set',
          'Ad name': 'Test Ad',
          'Amount spent (INR)': '100'
        },
        {
          'Day': '10-11-2025', // Inconsistent format
          'Campaign name': 'Test Campaign 2',
          'Ad set name': 'Test Ad Set',
          'Ad name': 'Test Ad',
          'Amount spent (INR)': '200'
        }
      ]);

      const result = await validateCSV('meta', mockFile);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          type: 'date_format_inconsistency'
        })
      );
    });
  });

  describe('Google CSV Validation', () => {
    test('validates correct Google CSV structure', async () => {
      const mockFile = createMockCSV('google', {
        'Day': '2025-11-10',
        'Campaign': 'Google Test Campaign',
        'Cost': '150.75',
        'CTR': '3.2%',
        'Avg. CPM': '12.50'
      });

      const result = await validateCSV('google', mockFile);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('handles percentage CTR values', async () => {
      const mockFile = createMockCSV('google', {
        'Day': '2025-11-10',
        'Campaign': 'Google Test Campaign',
        'Cost': '150.75',
        'CTR': '3.2%',
        'Avg. CPM': '12.50'
      });

      const result = await validateCSV('google', mockFile);

      expect(result.isValid).toBe(true);
      expect(result.warnings).not.toContainEqual(
        expect.objectContaining({
          type: 'non_numeric_values',
          column: 'CTR'
        })
      );
    });
  });

  describe('Shopify CSV Validation', () => {
    test('validates correct Shopify CSV structure', async () => {
      const mockFile = createMockCSV('shopify', {
        'Day': '2025-11-10',
        'UTM campaign': 'test_campaign',
        'UTM term': 'test_term',
        'UTM content': 'test_content',
        'Online store visitors': '500',
        'Sessions that completed checkout': '25',
        'Sessions that reached checkout': '40',
        'Sessions with cart additions': '80',
        'Average session duration': '120.5',
        'Pageviews': '2500'
      });

      const result = await validateCSV('shopify', mockFile);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('handles URL-encoded UTM parameters', async () => {
      const mockFile = createMockCSV('shopify', {
        'Day': '2025-11-10',
        'UTM campaign': 'test%20campaign%20with%20spaces',
        'UTM term': 'test%20term',
        'UTM content': 'test%20content',
        'Online store visitors': '500'
      });

      const result = await validateCSV('shopify', mockFile);

      expect(result.isValid).toBe(true);
      // Should not generate encoding warnings for standard URL encoding
    });
  });
});

// Helper function to create mock CSV files
function createMockCSV(platform, data) {
  const rows = Array.isArray(data) ? data : [data];
  const headers = Object.keys(rows[0]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => headers.map(header => `"${row[header]}"`).join(','))
  ].join('\n');

  return new File([csvContent], `test_${platform}.csv`, { type: 'text/csv' });
}
```

#### AI Correction Tests
```javascript
// tests/lib/ai-fixer.test.js
import { AdvancedAIFixer } from '@/lib/ai-fixer-advanced';

describe('AI Data Correction', () => {
  let aiFixer;

  beforeEach(() => {
    aiFixer = new AdvancedAIFixer();
  });

  test('detects date format inconsistencies', async () => {
    const mockData = [
      { Day: '2025-11-10', Campaign: 'Test 1' },
      { Day: '10-11-2025', Campaign: 'Test 2' }, // Different format
    ];

    const mockErrors = [
      { type: 'date_format_inconsistency', column: 'Day' }
    ];

    const analysis = await aiFixer.performDeepAnalysis('meta', mockData, mockErrors);

    expect(analysis.data_patterns.date_formats).toContain('YYYY-MM-DD');
    expect(analysis.data_patterns.date_formats).toContain('DD-MM-YYYY');
    expect(analysis.correction_strategies).toContainEqual(
      expect.objectContaining({
        strategy_id: 'date_standardization',
        priority: 'high'
      })
    );
  });

  test('generates high-confidence corrections for common issues', async () => {
    const mockData = [
      { 'Amount spent (INR)': '₹1,234.56' },
      { 'Amount spent (INR)': '₹987.65' }
    ];

    const corrections = await aiFixer.generateSmartCorrections({
      correction_strategies: [{
        strategy_id: 'numeric_cleaning',
        priority: 'high',
        confidence: 0.95,
        affected_columns: ['Amount spent (INR)']
      }]
    });

    expect(corrections).toHaveLength(1);
    expect(corrections[0].confidence).toBeGreaterThanOrEqual(0.85);
    expect(corrections[0].id).toBe('numeric_cleaning');
  });

  test('calculates accurate data quality scores', async () => {
    const mockData = [
      { 
        Day: '2025-11-10', 
        Campaign: 'Complete Data', 
        Spend: '100',
        Visitors: '500'
      },
      { 
        Day: '2025-11-11', 
        Campaign: '', // Missing data
        Spend: '200',
        Visitors: null
      }
    ];

    const quality = await aiFixer.assessDataQuality(mockData, []);

    expect(quality.overall_score).toBeGreaterThan(0);
    expect(quality.overall_score).toBeLessThan(1); // Should be imperfect due to missing data
    expect(quality.metrics.completeness).toBeLessThan(1);
  });
});
```

### Integration Tests

#### Upload API Tests
```javascript
// tests/api/upload.integration.test.js
import request from 'supertest';
import { createTestServer } from '../utils/test-server';

describe('Upload API Integration', () => {
  let server;
  let supabaseTestClient;

  beforeAll(async () => {
    server = await createTestServer();
    supabaseTestClient = createTestSupabaseClient();
  });

  afterAll(async () => {
    await cleanupTestData();
    await server.close();
  });

  beforeEach(async () => {
    await clearTestTables();
  });

  test('complete upload flow for Meta data', async () => {
    const testData = createTestMetaData();
    
    // Step 1: Validate the data
    const validateResponse = await request(server)
      .post('/api/upload/validate')
      .send({
        platform: 'meta',
        data: testData
      });

    expect(validateResponse.status).toBe(200);
    expect(validateResponse.body.validation.isValid).toBe(true);

    // Step 2: Process the upload
    const uploadResponse = await request(server)
      .post('/api/upload/process')
      .send({
        platform: 'meta',
        csvData: testData,
        corrections: validateResponse.body.corrections
      });

    expect(uploadResponse.status).toBe(200);
    expect(uploadResponse.body.success).toBe(true);
    expect(uploadResponse.body.validation.isValid).toBe(true);

    // Step 3: Verify data in database
    const { data: insertedData } = await supabaseTestClient
      .from('meta_import_data')
      .select('*');

    expect(insertedData).toHaveLength(testData.length);
  });

  test('handles upload conflicts with upsert logic', async () => {
    const testData = createTestMetaData();
    
    // First upload
    await request(server)
      .post('/api/upload/process')
      .send({
        platform: 'meta',
        csvData: testData,
        corrections: {}
      });

    // Modified data for same campaign/date
    const modifiedData = testData.map(row => ({
      ...row,
      'Amount spent (INR)': (parseFloat(row['Amount spent (INR)']) * 2).toString()
    }));

    // Second upload (should upsert)
    const secondUploadResponse = await request(server)
      .post('/api/upload/process')
      .send({
        platform: 'meta',
        csvData: modifiedData,
        corrections: {}
      });

    expect(secondUploadResponse.status).toBe(200);

    // Verify only one set of records exists with updated values
    const { data: finalData, count } = await supabaseTestClient
      .from('meta_import_data')
      .select('*', { count: 'exact' });

    expect(count).toBe(testData.length);
    expect(parseFloat(finalData[0].amount_spent)).toBe(
      parseFloat(testData[0]['Amount spent (INR)']) * 2
    );
  });

  test('handles large dataset upload with batching', async () => {
    const largeDataset = createLargeTestDataset('google', 2500); // > batch size
    
    const uploadResponse = await request(server)
      .post('/api/upload/process')
      .send({
        platform: 'google',
        csvData: largeDataset,
        corrections: {}
      });

    expect(uploadResponse.status).toBe(200);
    expect(uploadResponse.body.uploadResult.batches).toHaveLength(3); // 1000, 1000, 500

    // Verify all data was uploaded
    const { count } = await supabaseTestClient
      .from('google_import_data')
      .select('*', { count: 'exact', head: true });

    expect(count).toBe(2500);
  });

  test('provides detailed error information for validation failures', async () => {
    const invalidData = [
      {
        'Day': 'invalid-date',
        'Campaign': '',  // Empty required field
        'Cost': 'not-a-number'
      }
    ];

    const validateResponse = await request(server)
      .post('/api/upload/validate')
      .send({
        platform: 'google',
        data: invalidData
      });

    expect(validateResponse.status).toBe(200);
    expect(validateResponse.body.validation.isValid).toBe(false);
    expect(validateResponse.body.validation.errors).toContainEqual(
      expect.objectContaining({
        type: 'missing_columns'
      })
    );
  });
});
```

#### Cross-Platform Validation Tests
```javascript
// tests/lib/cross-platform-validator.integration.test.js
import { CrossPlatformValidator } from '@/lib/cross-platform-validator';

describe('Cross-Platform Validation Integration', () => {
  let validator;

  beforeEach(() => {
    validator = new CrossPlatformValidator();
  });

  test('validates campaign mapping across platforms', async () => {
    const platformData = {
      meta: [
        { Day: '2025-11-10', 'Campaign name': 'test_campaign_1' },
        { Day: '2025-11-10', 'Campaign name': 'test_campaign_2' }
      ],
      google: [
        { Day: '2025-11-10', Campaign: 'test_campaign_1' }
      ],
      shopify: [
        { Day: '2025-11-10', 'UTM campaign': 'test_campaign_1' },
        { Day: '2025-11-10', 'UTM campaign': 'test_campaign_3' } // Not in Meta/Google
      ]
    };

    const validation = await validator.validateCrossPlatform(platformData);

    expect(validation.results.campaignMapping.isValid).toBe(false); // Due to orphaned campaign
    expect(validation.results.campaignMapping.coverage.meta).toBeGreaterThan(0);
    expect(validation.results.campaignMapping.unmappedCampaigns.meta).toContain('test_campaign_2');
  });

  test('detects date alignment issues', async () => {
    const platformData = {
      meta: [
        { Day: '2025-11-10' },
        { Day: '2025-11-11' }
      ],
      google: [
        { Day: '2025-11-12' }, // No overlap
        { Day: '2025-11-13' }
      ],
      shopify: [
        { Day: '2025-11-10' },
        { Day: '2025-11-11' }
      ]
    };

    const validation = await validator.validateCrossPlatform(platformData);

    expect(validation.results.dateAlignment.isValid).toBe(false);
    expect(validation.results.dateAlignment.overlapDays).toBe(0);
  });

  test('validates UTM parameter consistency', async () => {
    const shopifyData = [
      { 'UTM campaign': 'consistent-campaign-name-1' },
      { 'UTM campaign': 'consistent-campaign-name-2' },
      { 'UTM campaign': 'INCONSISTENT_FORMAT!' },
      { 'UTM campaign': 'another inconsistent format 123' }
    ];

    const validation = await validator.validateUTMConsistency({ shopify: shopifyData });

    expect(validation.consistency).toBeLessThan(0.8); // Should detect inconsistency
    expect(validation.patterns.campaign.patterns).toBeGreaterThan(2); // Multiple patterns
  });
});
```

## Phase 2 Testing: AI Intelligence

### AI Correction Accuracy Tests
```javascript
// tests/lib/ai-corrections.accuracy.test.js
describe('AI Correction Accuracy', () => {
  test('date format corrections achieve 95% accuracy', async () => {
    const testCases = [
      { input: '15-11-2025', expected: '2025-11-15' },
      { input: '11/15/2025', expected: '2025-11-15' },
      { input: '2025-11-15', expected: '2025-11-15' },
      { input: '15/Nov/2025', expected: '2025-11-15' }
    ];

    const aiFixer = new AdvancedAIFixer();
    let correctCount = 0;

    for (const testCase of testCases) {
      const corrections = await aiFixer.generateSmartCorrections({
        correction_strategies: [{
          strategy_id: 'date_standardization',
          affected_columns: ['Day'],
          confidence: 0.9
        }]
      });

      const correctionFunction = new Function('value', corrections[0].functionCode);
      const result = correctionFunction(testCase.input);

      if (result === testCase.expected) {
        correctCount++;
      }
    }

    const accuracy = correctCount / testCases.length;
    expect(accuracy).toBeGreaterThanOrEqual(0.95);
  });

  test('numeric cleaning preserves data integrity', async () => {
    const testCases = [
      { input: '₹1,234.56', expected: 1234.56 },
      { input: '$1,000.00', expected: 1000.00 },
      { input: '2,500', expected: 2500 },
      { input: '75.5%', expected: 75.5 }
    ];

    const aiFixer = new AdvancedAIFixer();
    let correctCount = 0;

    for (const testCase of testCases) {
      const normalized = aiFixer.parseNumeric(testCase.input);
      
      if (Math.abs(normalized - testCase.expected) < 0.01) {
        correctCount++;
      }
    }

    const accuracy = correctCount / testCases.length;
    expect(accuracy).toBe(1.0); // Should be 100% for these basic cases
  });
});
```

### Quality Assessment Validation
```javascript
// tests/lib/quality-assessment.test.js
describe('Data Quality Assessment', () => {
  test('quality scores correlate with manual assessment', async () => {
    const testDatasets = [
      {
        name: 'high_quality',
        data: createHighQualityTestData(),
        expectedScore: { min: 0.8, max: 1.0 }
      },
      {
        name: 'medium_quality', 
        data: createMediumQualityTestData(),
        expectedScore: { min: 0.5, max: 0.8 }
      },
      {
        name: 'low_quality',
        data: createLowQualityTestData(),
        expectedScore: { min: 0.0, max: 0.5 }
      }
    ];

    const aiFixer = new AdvancedAIFixer();

    for (const dataset of testDatasets) {
      const quality = await aiFixer.assessDataQuality(dataset.data, []);
      
      expect(quality.overall_score).toBeGreaterThanOrEqual(dataset.expectedScore.min);
      expect(quality.overall_score).toBeLessThanOrEqual(dataset.expectedScore.max);
    }
  });

  test('generates actionable recommendations', async () => {
    const incompleteData = [
      { Campaign: 'Test 1', Spend: 100, Visitors: null },
      { Campaign: 'Test 2', Spend: null, Visitors: 200 },
      { Campaign: '', Spend: 300, Visitors: 150 } // Empty campaign
    ];

    const aiFixer = new AdvancedAIFixer();
    const quality = await aiFixer.assessDataQuality(incompleteData, []);

    expect(quality.recommendations).toContainEqual(
      expect.objectContaining({
        type: 'completeness',
        priority: 'high'
      })
    );

    expect(quality.metrics.completeness).toBeLessThan(0.8);
  });
});

function createHighQualityTestData() {
  return Array.from({ length: 100 }, (_, i) => ({
    Day: `2025-11-${(i % 28 + 1).toString().padStart(2, '0')}`,
    Campaign: `Campaign ${i + 1}`,
    Spend: (Math.random() * 1000 + 100).toFixed(2),
    Visitors: Math.floor(Math.random() * 1000 + 50)
  }));
}

function createMediumQualityTestData() {
  return Array.from({ length: 100 }, (_, i) => ({
    Day: i % 10 === 0 ? null : `2025-11-${(i % 28 + 1).toString().padStart(2, '0')}`, // 10% missing
    Campaign: `Campaign ${i + 1}`,
    Spend: i % 20 === 0 ? null : (Math.random() * 1000 + 100).toFixed(2), // 5% missing
    Visitors: Math.floor(Math.random() * 1000 + 50)
  }));
}

function createLowQualityTestData() {
  return Array.from({ length: 100 }, (_, i) => ({
    Day: i % 3 === 0 ? null : `2025-11-${(i % 28 + 1).toString().padStart(2, '0')}`, // 33% missing
    Campaign: i % 4 === 0 ? '' : `Campaign ${i + 1}`, // 25% empty
    Spend: i % 5 === 0 ? 'invalid' : (Math.random() * 1000 + 100).toFixed(2), // 20% invalid
    Visitors: i % 6 === 0 ? null : Math.floor(Math.random() * 1000 + 50) // 17% missing
  }));
}
```

## Phase 3 Testing: Report Generation

### Julius V7 Engine Tests
```javascript
// tests/lib/julius-v7-engine.test.js
import { JuliusV7Engine } from '@/lib/julius-v7-engine';

describe('Julius V7 Analytics Engine', () => {
  let engine;
  let mockSupabaseData;

  beforeEach(() => {
    engine = new JuliusV7Engine();
    mockSupabaseData = createMockSupabaseData();
  });

  test('harmonizes data across platforms correctly', async () => {
    const rawData = {
      meta: mockSupabaseData.meta,
      google: mockSupabaseData.google,
      shopify: mockSupabaseData.shopify
    };

    const harmonized = await engine.harmonizeData(rawData);

    // Test Meta harmonization
    expect(harmonized.meta).toHaveLength(mockSupabaseData.meta.length);
    expect(harmonized.meta[0]).toHaveProperty('source', 'Meta');
    expect(harmonized.meta[0]).toHaveProperty('spend');
    expect(typeof harmonized.meta[0].spend).toBe('number');

    // Test Google harmonization
    expect(harmonized.google[0]).toHaveProperty('source', 'Google');
    expect(harmonized.google[0]).toHaveProperty('ad_set', null); // Google is campaign-level

    // Test Shopify harmonization
    expect(harmonized.shopify[0]).toHaveProperty('visitors');
    expect(typeof harmonized.shopify[0].visitors).toBe('number');
  });

  test('applies attribution logic correctly', async () => {
    const harmonizedData = {
      meta: [
        { 
          day: '2025-11-10', 
          campaign: 'test_campaign', 
          ad_set: 'test_adset', 
          ad: 'test_ad',
          spend: 100
        }
      ],
      google: [
        {
          day: '2025-11-10',
          campaign: 'google_campaign',
          spend: 200
        }
      ],
      shopify: [
        {
          day: '2025-11-10',
          utm_campaign: 'test_campaign',
          utm_term: 'test_adset', 
          utm_content: 'test_ad',
          visitors: 500,
          sessions_completed_checkout: 25
        },
        {
          day: '2025-11-10',
          utm_campaign: 'google_campaign',
          utm_term: null,
          utm_content: null,
          visitors: 300,
          sessions_completed_checkout: 15
        }
      ]
    };

    const attributed = await engine.applyAttribution(harmonizedData);

    // Meta attribution should match
    const metaRow = attributed.find(row => row.source === 'Meta');
    expect(metaRow.visitors).toBe(500);
    expect(metaRow.sessions_completed_checkout).toBe(25);

    // Google attribution should match
    const googleRow = attributed.find(row => row.source === 'Google');
    expect(googleRow.visitors).toBe(300);
    expect(googleRow.sessions_completed_checkout).toBe(15);
  });

  test('calculates business metrics accurately', async () => {
    const attributedData = [
      {
        day: '2025-11-10',
        source: 'Meta',
        spend: 1000,
        visitors: 1000,
        sessions_completed_checkout: 50,
        avg_session_duration: 180, // 3 minutes
        pageviews: 5000
      }
    ];

    const metricsData = await engine.calculateBusinessMetrics(attributedData);
    const row = metricsData[0];

    // Test basic cost metrics
    expect(row.cpc).toBe(1); // 1000 spend / 1000 visitors
    expect(row.cost_per_checkout).toBe(20); // 1000 spend / 50 checkouts

    // Test conversion rates
    expect(row.checkout_rate).toBe(0.05); // 50 checkouts / 1000 visitors

    // Test good lead calculation (should be > 0 given good session duration and pageviews)
    expect(row.good_leads).toBeGreaterThan(0);
    expect(row.good_lead_rate).toBeGreaterThan(0);
  });

  test('applies Empirical Bayes shrinkage properly', async () => {
    const metricsData = [
      // High volume, reliable stats
      { visitors: 1000, good_leads: 500, sessions_completed_checkout: 50, spend: 1000 },
      // Low volume, potentially unreliable stats  
      { visitors: 10, good_leads: 8, sessions_completed_checkout: 5, spend: 100 }
    ];

    const shrunkData = await engine.applyEmpiricalBayesShrinkage(metricsData);

    // High volume data should be less affected by shrinkage
    expect(shrunkData[0].shrunk_good_lead_rate).toBeCloseTo(0.5, 1); // Close to raw rate

    // Low volume data should be pulled toward global average
    expect(shrunkData[1].shrunk_good_lead_rate).toBeLessThan(0.8); // Should be shrunk down from 0.8 raw rate
  });

  test('generates performance scores within valid range', async () => {
    const testData = Array.from({ length: 100 }, (_, i) => ({
      day: '2025-11-10',
      source: 'Meta',
      campaign: `Campaign ${i}`,
      visitors: Math.floor(Math.random() * 1000) + 10,
      spend: Math.floor(Math.random() * 1000) + 100,
      sessions_completed_checkout: Math.floor(Math.random() * 20) + 1,
      shrunk_good_lead_rate: Math.random() * 0.5,
      shrunk_cost_per_checkout: Math.random() * 100 + 10
    }));

    const scoredData = await engine.generatePerformanceScores(testData);

    // All scores should be 0-1
    scoredData.forEach(row => {
      expect(row.ad_score).toBeGreaterThanOrEqual(0);
      expect(row.ad_score).toBeLessThanOrEqual(1);
      expect(row.efficiency_score).toBeGreaterThanOrEqual(0);
      expect(row.efficiency_score).toBeLessThanOrEqual(1);
      expect(row.quality_score).toBeGreaterThanOrEqual(0);
      expect(row.quality_score).toBeLessThanOrEqual(1);
      expect(row.volume_score).toBeGreaterThanOrEqual(0);
      expect(row.volume_score).toBeLessThanOrEqual(1);
    });

    // Recommendations should be valid
    const validRecommendations = ['Scale', 'Test-to-Scale', 'Optimize', 'Pause/Fix'];
    scoredData.forEach(row => {
      expect(validRecommendations).toContain(row.recommendation);
    });
  });
});
```

### CSV Export Tests
```javascript
// tests/lib/csv-exporter.test.js
import { CSVExporter } from '@/lib/csv-exporter';
import Papa from 'papaparse';

describe('CSV Export Functionality', () => {
  let exporter;
  let mockAnalyticsResults;

  beforeEach(() => {
    exporter = new CSVExporter();
    mockAnalyticsResults = createMockAnalyticsResults();
  });

  test('generates top-level report with correct columns', async () => {
    const dateRange = { start: '2025-11-10', end: '2025-11-10', type: 'daily' };
    const reports = await exporter.generateReports(mockAnalyticsResults, dateRange);

    expect(reports.topLevel).toBeDefined();
    expect(reports.topLevel.filename).toBe('toplevel_daily_2025-11-10.csv');

    // Verify CSV content
    const csvContent = await fs.readFile(reports.topLevel.filepath, 'utf8');
    const parsed = Papa.parse(csvContent, { header: true });

    const expectedColumns = [
      'Date', 'Meta Spend', 'Meta CTR', 'Meta CPM', 'Google Spend', 'Google CTR', 'Google CPM',
      'Shopify Total Users', 'Shopify Total ATC', 'Shopify Total Reached Checkout',
      'Shopify Total Abandoned Checkout', 'Shopify Session Duration',
      'Users with Session above 1 min', 'Users with Above 5 page views and above 1 min',
      'ATC with session duration above 1 min', 'Reached Checkout with session duration above 1 min'
    ];

    expect(parsed.meta.fields).toEqual(expectedColumns);
  });

  test('generates ad set report with Meta data only', async () => {
    const dateRange = { start: '2025-11-10', end: '2025-11-10', type: 'daily' };
    const reports = await exporter.generateReports(mockAnalyticsResults, dateRange);

    const csvContent = await fs.readFile(reports.adSet.filepath, 'utf8');
    const parsed = Papa.parse(csvContent, { header: true });

    // Should only contain Meta data (has ad sets)
    parsed.data.forEach(row => {
      expect(row['Ad Set Name']).toBeTruthy(); // Should have ad set names
    });

    const expectedColumns = [
      'Date', 'Campaign name', 'Ad Set Name', 'Ad Set Delivery', 'Spent',
      'Cost per user', 'Users', 'ATC', 'Reached Checkout', 'Conversions',
      'Average session duration', 'Cost per 1 min user', '1min user/ total users (%)',
      'Users with Session above 1 min', 'ATC with session duration above 1 min',
      'Reached Checkout with session duration above 1 min', 'Users with Above 5 page views and above 1 min'
    ];

    expect(parsed.meta.fields).toEqual(expectedColumns);
  });

  test('generates ad-level report with detailed metrics', async () => {
    const dateRange = { start: '2025-11-10', end: '2025-11-10', type: 'daily' };
    const reports = await exporter.generateReports(mockAnalyticsResults, dateRange);

    const csvContent = await fs.readFile(reports.adLevel.filepath, 'utf8');
    const parsed = Papa.parse(csvContent, { header: true });

    // Should include CTR column (ad-level specific)
    expect(parsed.meta.fields).toContain('CTR');
    expect(parsed.meta.fields).toContain('Ad Name');

    // Verify data types
    if (parsed.data.length > 0) {
      const firstRow = parsed.data[0];
      expect(firstRow['Date']).toMatch(/\d{4}-\d{2}-\d{2}/); // Date format
      expect(parseFloat(firstRow['CTR'])).toBeGreaterThanOrEqual(0); // Valid CTR
    }
  });

  test('handles large datasets efficiently', async () => {
    const largeAnalyticsResults = createLargeAnalyticsResults(5000); // 5000 rows
    const dateRange = { start: '2025-11-01', end: '2025-11-30', type: 'custom' };

    const startTime = Date.now();
    const reports = await exporter.generateReports(largeAnalyticsResults, dateRange);
    const endTime = Date.now();

    // Should complete within reasonable time (adjust threshold as needed)
    expect(endTime - startTime).toBeLessThan(10000); // 10 seconds

    // Verify all reports were generated
    expect(reports.topLevel).toBeDefined();
    expect(reports.adSet).toBeDefined();
    expect(reports.adLevel).toBeDefined();

    // Verify row counts are reasonable
    expect(reports.adLevel.rowCount).toBeGreaterThan(0);
  });
});
```

## End-to-End Testing

### Browser Automation Tests
```javascript
// tests/e2e/upload-flow.spec.js
import { test, expect } from '@playwright/test';

test.describe('Complete Upload Flow', () => {
  test('user can upload files and generate reports', async ({ page }) => {
    // Navigate to upload page
    await page.goto('/upload');

    // Upload Meta file
    const metaFile = await page.locator('[data-testid="meta-file-input"]');
    await metaFile.setInputFiles('./tests/fixtures/meta_test_data.csv');

    // Wait for validation
    await expect(page.locator('[data-testid="meta-validation-success"]')).toBeVisible();

    // Upload Google file
    const googleFile = await page.locator('[data-testid="google-file-input"]');
    await googleFile.setInputFiles('./tests/fixtures/google_test_data.csv');

    await expect(page.locator('[data-testid="google-validation-success"]')).toBeVisible();

    // Upload Shopify file
    const shopifyFile = await page.locator('[data-testid="shopify-file-input"]');
    await shopifyFile.setInputFiles('./tests/fixtures/shopify_test_data.csv');

    await expect(page.locator('[data-testid="shopify-validation-success"]')).toBeVisible();

    // Start upload
    await page.click('[data-testid="start-upload-button"]');

    // Wait for upload completion
    await expect(page.locator('[data-testid="upload-success-message"]')).toBeVisible({ timeout: 30000 });

    // Navigate to reports
    await page.click('[data-testid="generate-reports-button"]');

    // Select date range
    await page.click('[data-testid="weekly-report-option"]');

    // Generate reports
    await page.click('[data-testid="generate-reports-submit"]');

    // Wait for report generation
    await expect(page.locator('[data-testid="reports-ready"]')).toBeVisible({ timeout: 60000 });

    // Verify download links are present
    await expect(page.locator('[data-testid="download-toplevel"]')).toBeVisible();
    await expect(page.locator('[data-testid="download-adset"]')).toBeVisible();
    await expect(page.locator('[data-testid="download-adlevel"]')).toBeVisible();
  });

  test('user receives helpful error messages for invalid data', async ({ page }) => {
    await page.goto('/upload');

    // Upload invalid file
    const metaFile = await page.locator('[data-testid="meta-file-input"]');
    await metaFile.setInputFiles('./tests/fixtures/invalid_meta_data.csv');

    // Wait for error message
    await expect(page.locator('[data-testid="meta-validation-error"]')).toBeVisible();

    // Check that upload button is disabled
    await expect(page.locator('[data-testid="start-upload-button"]')).toBeDisabled();

    // Verify error details are shown
    await expect(page.locator('[data-testid="error-details"]')).toContainText('Missing required columns');
  });

  test('AI corrections can be applied', async ({ page }) => {
    await page.goto('/upload');

    // Upload file with correctable issues
    const metaFile = await page.locator('[data-testid="meta-file-input"]');
    await metaFile.setInputFiles('./tests/fixtures/meta_date_format_issues.csv');

    // Wait for AI corrections to appear
    await expect(page.locator('[data-testid="ai-corrections-panel"]')).toBeVisible();

    // Apply suggested correction
    await page.check('[data-testid="correction-date-standardization"]');
    await page.click('[data-testid="apply-corrections-button"]');

    // Wait for validation to update
    await expect(page.locator('[data-testid="meta-validation-success"]')).toBeVisible();

    // Verify upload button is now enabled
    await expect(page.locator('[data-testid="start-upload-button"]')).toBeEnabled();
  });
});
```

### Performance Testing
```javascript
// tests/performance/load-testing.js
import { test } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('upload handles concurrent users', async ({ browser }) => {
    const numUsers = 5;
    const contexts = [];
    const pages = [];

    // Create multiple browser contexts
    for (let i = 0; i < numUsers; i++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      contexts.push(context);
      pages.push(page);
    }

    // Start concurrent uploads
    const uploadPromises = pages.map(async (page, index) => {
      await page.goto('/upload');
      
      // Upload different test files to avoid conflicts
      await page.locator('[data-testid="meta-file-input"]')
        .setInputFiles(`./tests/fixtures/meta_test_data_${index}.csv`);
      
      await page.locator('[data-testid="google-file-input"]')
        .setInputFiles(`./tests/fixtures/google_test_data_${index}.csv`);
      
      await page.locator('[data-testid="shopify-file-input"]')
        .setInputFiles(`./tests/fixtures/shopify_test_data_${index}.csv`);

      await page.click('[data-testid="start-upload-button"]');
      
      // Measure upload time
      const startTime = Date.now();
      await page.locator('[data-testid="upload-success-message"]').waitFor({ timeout: 60000 });
      const endTime = Date.now();
      
      return { user: index, uploadTime: endTime - startTime };
    });

    // Wait for all uploads to complete
    const results = await Promise.all(uploadPromises);

    // Verify all uploads completed successfully
    expect(results).toHaveLength(numUsers);
    
    // Check that upload times are reasonable (adjust threshold as needed)
    results.forEach(result => {
      expect(result.uploadTime).toBeLessThan(30000); // 30 seconds max
    });

    // Cleanup
    await Promise.all(contexts.map(context => context.close()));
  });

  test('report generation scales with data size', async ({ page }) => {
    // This test would use progressively larger datasets
    const dataSizes = [100, 1000, 5000];
    const performanceResults = [];

    for (const size of dataSizes) {
      await page.goto('/reports');
      
      // Select custom date range that includes the test data
      await page.click('[data-testid="custom-report-option"]');
      await page.fill('[data-testid="start-date-input"]', '2025-11-01');
      await page.fill('[data-testid="end-date-input"]', '2025-11-30');
      
      // Start report generation
      const startTime = Date.now();
      await page.click('[data-testid="generate-reports-submit"]');
      await page.locator('[data-testid="reports-ready"]').waitFor({ timeout: 120000 });
      const endTime = Date.now();

      performanceResults.push({
        dataSize: size,
        processingTime: endTime - startTime
      });
    }

    // Verify performance scales reasonably
    // Processing time should not increase exponentially with data size
    const timeIncrease = performanceResults[2].processingTime / performanceResults[0].processingTime;
    const sizeIncrease = dataSizes[2] / dataSizes[0];
    
    expect(timeIncrease).toBeLessThan(sizeIncrease * 1.5); // Allow some overhead but not too much
  });
});
```

## Test Data Management

### Test Fixtures
```javascript
// tests/fixtures/index.js
export function createTestMetaData() {
  return [
    {
      'Day': '2025-11-10',
      'Campaign name': 'Test Campaign 1',
      'Ad set name': 'Test Ad Set 1',
      'Ad name': 'Test Ad 1',
      'Amount spent (INR)': '100.50',
      'CTR (link click-through rate)': '2.5',
      'CPM (cost per 1,000 impressions)': '15.75',
      'Ad Set Delivery': 'Active'
    },
    {
      'Day': '2025-11-10',
      'Campaign name': 'Test Campaign 1',
      'Ad set name': 'Test Ad Set 1', 
      'Ad name': 'Test Ad 2',
      'Amount spent (INR)': '150.25',
      'CTR (link click-through rate)': '3.2',
      'CPM (cost per 1,000 impressions)': '12.50',
      'Ad Set Delivery': 'Active'
    }
  ];
}

export function createTestGoogleData() {
  return [
    {
      'Day': '2025-11-10',
      'Campaign': 'Google Test Campaign 1',
      'Cost': '200.75',
      'CTR': '2.8%',
      'Avg. CPM': '18.25',
      'Currency code': 'INR',
      'Campaign status': 'Enabled'
    }
  ];
}

export function createTestShopifyData() {
  return [
    {
      'Day': '2025-11-10',
      'UTM campaign': 'test campaign 1',
      'UTM term': 'test ad set 1',
      'UTM content': 'test ad 1',
      'Landing page URL': 'https://example.com/landing',
      'Online store visitors': '500',
      'Sessions that completed checkout': '25',
      'Sessions that reached checkout': '40',
      'Sessions with cart additions': '80',
      'Average session duration': '120.5',
      'Pageviews': '2500'
    }
  ];
}

export function createLargeTestDataset(platform, size) {
  const baseData = {
    meta: createTestMetaData()[0],
    google: createTestGoogleData()[0],
    shopify: createTestShopifyData()[0]
  }[platform];

  return Array.from({ length: size }, (_, i) => ({
    ...baseData,
    'Day': `2025-11-${(i % 28 + 1).toString().padStart(2, '0')}`,
    [Object.keys(baseData)[1]]: `${Object.values(baseData)[1]} ${i + 1}` // Modify name field
  }));
}
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL_TEST }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY_TEST }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY_TEST }}
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL_TEST }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY_TEST }}

  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Start application
        run: |
          npm run build
          npm run start &
          sleep 10
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL_TEST }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY_TEST }}
      
      - name: Run E2E tests
        run: npx playwright test
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Test Coverage Goals

### Coverage Targets
- **Unit Tests**: 80% line coverage minimum
- **Integration Tests**: Cover all API endpoints and database operations
- **E2E Tests**: Cover all critical user workflows
- **Performance Tests**: Validate all performance requirements

### Quality Gates
- All tests must pass before merge
- Performance tests must meet defined SLAs
- Security tests must pass vulnerability scans
- Manual testing sign-off for major features

---

*Testing Strategy Version: 1.0*  
*Last Updated: November 11, 2025*  
*Test Framework: Jest + Playwright + Artillery*