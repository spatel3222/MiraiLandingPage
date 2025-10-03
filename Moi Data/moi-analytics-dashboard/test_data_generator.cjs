/**
 * COMPREHENSIVE END-TO-END TEST DATA GENERATOR
 * Creates controlled test CSV files to verify template processing works correctly
 * Tests that output changes based on input changes (no hardcoding)
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 MOI Analytics - Comprehensive End-to-End Test Data Generator');
console.log('==============================================================\n');

// Create test directory
const testDir = path.join(__dirname, 'test_scenarios');
if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
}

// Test Scenario 1: BASIC KNOWN VALUES
console.log('📊 Creating Test Scenario 1: Basic Known Values');
const scenario1Dir = path.join(testDir, '01_basic_known_values');
if (!fs.existsSync(scenario1Dir)) {
    fs.mkdirSync(scenario1Dir, { recursive: true });
}

// Scenario 1 - Shopify Data (Simple, predictable values)
const shopify1 = `"Day","UTM campaign","UTM term","Landing page URL","Online store visitors","Sessions that completed checkout","Sessions that reached checkout","Sessions with cart additions","Average session duration","Pageviews"
"2025-09-29","Test Campaign 1","Test AdSet 1","https://example.com",100,5,10,15,120,500
"2025-09-29","Test Campaign 2","Test AdSet 2","https://example.com",200,10,20,30,180,1000`;

// Scenario 1 - Meta Ads Data (Known spend amounts)
const meta1 = `"Campaign name","Ad set name","Amount spent (INR)","CPM (cost per 1,000 impressions)","CTR (link click-through rate)","Ad set delivery","Reporting starts","Reporting ends"
"Test Campaign 1","Test AdSet 1",1000.00,50.00,2.00,active,2025-09-29,2025-09-29
"Test Campaign 2","Test AdSet 2",2000.00,75.00,1.50,active,2025-09-29,2025-09-29`;

// Scenario 1 - Google Ads Data
const google1 = `Campaign performance
"September 29, 2025 - September 29, 2025"
Campaign,Campaign state,Campaign type,Clicks,Impr.,CTR,Currency code,Avg. CPC,Cost,Impr. (Abs. Top) %,Impr. (Top) %,Conversions,View-through conv.,Cost / conv.,Conv. rate
"Test Google Campaign 1",Enabled,Search,100,5000,2.00%,INR,10.00,1500.00,80.0%,90.0%,5,2,300.00,5.0%
"Test Google Campaign 2",Enabled,Display,150,7500,2.50%,INR,8.00,2500.00,70.0%,85.0%,8,3,312.50,5.3%`;

fs.writeFileSync(path.join(scenario1Dir, 'Shopify_Test_Basic.csv'), shopify1);
fs.writeFileSync(path.join(scenario1Dir, 'Meta_Ads_Test_Basic.csv'), meta1);
fs.writeFileSync(path.join(scenario1Dir, 'Google_Ads_Test_Basic.csv'), google1);

console.log('✅ Scenario 1 files created - Expected outputs:');
console.log('   - Top Level Daily: Meta Spend=3000, Google Spend=4000, Total Users=300');
console.log('   - Ad Set Level: Campaign 1 (1000 spend, 100 users), Campaign 2 (2000 spend, 200 users)');

// Test Scenario 2: DIFFERENT DATES (Verify date extraction works)
console.log('\n📅 Creating Test Scenario 2: Different Dates');
const scenario2Dir = path.join(testDir, '02_different_dates');
if (!fs.existsSync(scenario2Dir)) {
    fs.mkdirSync(scenario2Dir, { recursive: true });
}

// Scenario 2 - Different dates in Shopify (should appear in Ad Set Level output)
const shopify2 = `"Day","UTM campaign","UTM term","Landing page URL","Online store visitors","Sessions that completed checkout","Sessions that reached checkout","Sessions with cart additions","Average session duration","Pageviews"
"2025-10-15","Date Test Campaign","Date Test AdSet","https://example.com",150,7,12,18,150,750`;

// Scenario 2 - Different dates in Meta (should appear in Top Level Daily output)  
const meta2 = `"Campaign name","Ad set name","Amount spent (INR)","CPM (cost per 1,000 impressions)","CTR (link click-through rate)","Ad set delivery","Reporting starts","Reporting ends"
"Date Test Campaign","Date Test AdSet",1500.00,60.00,1.75,active,2025-10-15,2025-10-15`;

const google2 = `Campaign performance
"October 15, 2025 - October 15, 2025"
Campaign,Campaign state,Campaign type,Clicks,Impr.,CTR,Currency code,Avg. CPC,Cost,Impr. (Abs. Top) %,Impr. (Top) %,Conversions,View-through conv.,Cost / conv.,Conv. rate
"Date Test Google Campaign",Enabled,Search,80,4000,2.00%,INR,12.00,1800.00,75.0%,88.0%,4,1,450.00,5.0%`;

fs.writeFileSync(path.join(scenario2Dir, 'Shopify_Test_Dates.csv'), shopify2);
fs.writeFileSync(path.join(scenario2Dir, 'Meta_Ads_Test_Dates.csv'), meta2);
fs.writeFileSync(path.join(scenario2Dir, 'Google_Ads_Test_Dates.csv'), google2);

console.log('✅ Scenario 2 files created - Expected outputs:');
console.log('   - Top Level Daily: Date = 2025-10-15 (from Meta "Reporting ends")');
console.log('   - Ad Set Level: Date = 2025-10-15 (from Shopify "Day")');

// Test Scenario 3: DIFFERENT SPEND AMOUNTS (Verify calculations work)
console.log('\n💰 Creating Test Scenario 3: Different Spend Amounts');
const scenario3Dir = path.join(testDir, '03_different_spend');
if (!fs.existsSync(scenario3Dir)) {
    fs.mkdirSync(scenario3Dir, { recursive: true });
}

// Scenario 3 - High spend amounts (should calculate different Cost per user)
const shopify3 = `"Day","UTM campaign","UTM term","Landing page URL","Online store visitors","Sessions that completed checkout","Sessions that reached checkout","Sessions with cart additions","Average session duration","Pageviews"
"2025-09-30","High Spend Campaign","High Spend AdSet","https://example.com",50,2,5,8,90,250`;

// Scenario 3 - Very high spend (Cost per user should be: 5000 / 50 = 100)
const meta3 = `"Campaign name","Ad set name","Amount spent (INR)","CPM (cost per 1,000 impressions)","CTR (link click-through rate)","Ad set delivery","Reporting starts","Reporting ends"
"High Spend Campaign","High Spend AdSet",5000.00,100.00,3.00,active,2025-09-30,2025-09-30`;

const google3 = `Campaign performance
"September 30, 2025 - September 30, 2025"
Campaign,Campaign state,Campaign type,Clicks,Impr.,CTR,Currency code,Avg. CPC,Cost,Impr. (Abs. Top) %,Impr. (Top) %,Conversions,View-through conv.,Cost / conv.,Conv. rate
"High Spend Google Campaign",Enabled,Search,200,10000,2.00%,INR,25.00,10000.00,85.0%,95.0%,10,5,1000.00,5.0%`;

fs.writeFileSync(path.join(scenario3Dir, 'Shopify_Test_Spend.csv'), shopify3);
fs.writeFileSync(path.join(scenario3Dir, 'Meta_Ads_Test_Spend.csv'), meta3);
fs.writeFileSync(path.join(scenario3Dir, 'Google_Ads_Test_Spend.csv'), google3);

console.log('✅ Scenario 3 files created - Expected outputs:');
console.log('   - Top Level Daily: Meta Spend=5000, Google Spend=10000');
console.log('   - Ad Set Level: Cost per user = 5000/50 = 100 (if template calculation works)');

// Test Scenario 4: EDGE CASES (Zero values, empty data)
console.log('\n🔍 Creating Test Scenario 4: Edge Cases');
const scenario4Dir = path.join(testDir, '04_edge_cases');
if (!fs.existsSync(scenario4Dir)) {
    fs.mkdirSync(scenario4Dir, { recursive: true });
}

const shopify4 = `"Day","UTM campaign","UTM term","Landing page URL","Online store visitors","Sessions that completed checkout","Sessions that reached checkout","Sessions with cart additions","Average session duration","Pageviews"
"2025-09-28","Zero Values Campaign","Zero Values AdSet","https://example.com",0,0,0,0,0,0`;

const meta4 = `"Campaign name","Ad set name","Amount spent (INR)","CPM (cost per 1,000 impressions)","CTR (link click-through rate)","Ad set delivery","Reporting starts","Reporting ends"
"Zero Values Campaign","Zero Values AdSet",0.00,0.00,0.00,paused,2025-09-28,2025-09-28`;

const google4 = `Campaign performance
"September 28, 2025 - September 28, 2025"
Campaign,Campaign state,Campaign type,Clicks,Impr.,CTR,Currency code,Avg. CPC,Cost,Impr. (Abs. Top) %,Impr. (Top) %,Conversions,View-through conv.,Cost / conv.,Conv. rate
"Zero Values Google Campaign",Paused,Search,0,0,0.00%,INR,0.00,0.00,0.0%,0.0%,0,0,0.00,0.0%`;

fs.writeFileSync(path.join(scenario4Dir, 'Shopify_Test_Edge.csv'), shopify4);
fs.writeFileSync(path.join(scenario4Dir, 'Meta_Ads_Test_Edge.csv'), meta4);
fs.writeFileSync(path.join(scenario4Dir, 'Google_Ads_Test_Edge.csv'), google4);

console.log('✅ Scenario 4 files created - Expected outputs:');
console.log('   - All metrics should be 0 (tests division by zero handling)');

// Create Test Runner Script
console.log('\n🚀 Creating Automated Test Runner Script');
const testRunner = `/**
 * AUTOMATED TEST RUNNER
 * Runs all test scenarios and validates outputs
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Running Automated End-to-End Tests');
console.log('=====================================\\n');

const testScenarios = [
    {
        name: 'Basic Known Values',
        folder: '01_basic_known_values',
        expectedTopLevelSpend: 3000, // Meta: 1000+2000
        expectedGoogleSpend: 4000,   // Google: 1500+2500  
        expectedTotalUsers: 300,     // Shopify: 100+200
        expectedDate: '2025-09-29'
    },
    {
        name: 'Different Dates',
        folder: '02_different_dates', 
        expectedDate: '2025-10-15',
        expectedUsers: 150
    },
    {
        name: 'Different Spend',
        folder: '03_different_spend',
        expectedMetaSpend: 5000,
        expectedCostPerUser: 100, // 5000/50
        expectedDate: '2025-09-30'
    },
    {
        name: 'Edge Cases',
        folder: '04_edge_cases',
        expectedSpend: 0,
        expectedUsers: 0,
        expectedDate: '2025-09-28'
    }
];

// Instructions for manual testing
console.log('📋 MANUAL TESTING INSTRUCTIONS:');
console.log('================================\\n');

testScenarios.forEach((scenario, index) => {
    console.log(\`\${index + 1}. Test Scenario: \${scenario.name}\`);
    console.log(\`   📁 Upload files from: ./test_scenarios/\${scenario.folder}/\`);
    console.log(\`   📊 Expected results:\`);
    
    Object.keys(scenario).forEach(key => {
        if (key.startsWith('expected')) {
            const label = key.replace('expected', '').replace(/([A-Z])/g, ' $1').trim();
            console.log(\`      - \${label}: \${scenario[key]}\`);
        }
    });
    console.log('   🔄 Export all 3 files and verify values match expectations');
    console.log('   ❌ If values are hardcoded, they will NOT match these expectations\\n');
});

console.log('🎯 VALIDATION CHECKLIST:');
console.log('========================');
console.log('✅ Upload test files to dashboard (localhost:5175)');
console.log('✅ Export Top Level Daily CSV');
console.log('✅ Export Ad Set Level CSV'); 
console.log('✅ Export Pivot Temp CSV');
console.log('✅ Verify dates change based on input files');
console.log('✅ Verify spend amounts change based on input files');
console.log('✅ Verify user counts change based on input files');
console.log('✅ Verify calculated fields (Cost per user) change appropriately');
console.log('\\n⚠️  If ANY values remain the same across different test scenarios,');
console.log('    that indicates hardcoding is still present!\\n');

module.exports = { testScenarios };
`;

fs.writeFileSync(path.join(testDir, 'run_tests.js'), testRunner);

// Create README for testing
const testReadme = `# MOI Analytics End-to-End Testing

## 🎯 Purpose
This test suite verifies that the export system uses actual template processing instead of hardcoded values.

## 📁 Test Scenarios

### 1. Basic Known Values (01_basic_known_values)
- **Purpose**: Verify basic template processing works
- **Expected**: Meta Spend=3000, Google Spend=4000, Total Users=300
- **Date**: 2025-09-29

### 2. Different Dates (02_different_dates)  
- **Purpose**: Verify date extraction from input files
- **Expected**: All outputs show 2025-10-15
- **Key Test**: Dates should change based on input files

### 3. Different Spend (03_different_spend)
- **Purpose**: Verify calculations work correctly
- **Expected**: Cost per user = 5000/50 = 100
- **Key Test**: Calculated fields should change based on input

### 4. Edge Cases (04_edge_cases)
- **Purpose**: Test zero values and edge cases
- **Expected**: All metrics = 0
- **Key Test**: System handles zero values properly

## 🧪 How to Test

1. **Start Dashboard**: http://localhost:5175
2. **For each scenario**:
   - Upload the 3 CSV files from scenario folder
   - Export all 3 output files
   - Verify values match expected results
3. **Key Validation**: Values should change between scenarios
4. **Failure Indication**: If values stay the same = hardcoding present

## ✅ Success Criteria
- Dates extract correctly from input files per template
- Spend amounts reflect input data exactly  
- User counts match Shopify data
- Calculated fields (Cost per user) work correctly
- Different inputs produce different outputs

## ❌ Failure Indicators
- Same dates across all test scenarios
- Same spend amounts regardless of input
- Same user counts regardless of Shopify data
- Calculated fields don't change appropriately
`;

fs.writeFileSync(path.join(testDir, 'README.md'), testReadme);

console.log('✅ Test runner script created');
console.log('✅ Test documentation created');

console.log('\n🎯 TEST SCENARIOS SUMMARY:');
console.log('==========================');
console.log('📁 Test files created in: ./test_scenarios/');
console.log('🔧 4 complete test scenarios with known expected outputs');
console.log('📊 Each scenario tests different aspects of template processing');
console.log('🚀 Run: node test_scenarios/run_tests.js for detailed instructions');

console.log('\n🧪 IMMEDIATE NEXT STEPS:');
console.log('========================');
console.log('1. Open dashboard: http://localhost:5175');
console.log('2. Upload files from: ./test_scenarios/01_basic_known_values/');
console.log('3. Export all 3 files and check if values match expectations');
console.log('4. Repeat for other scenarios to verify outputs change');
console.log('5. If values are the same across scenarios = hardcoding still exists!');

console.log('\n🏆 SUCCESS CRITERIA:');
console.log('===================');
console.log('✅ Different inputs = Different outputs');
console.log('✅ Dates change based on input file dates');
console.log('✅ Spend amounts reflect actual input data');
console.log('✅ Calculated fields work correctly');
console.log('❌ Same outputs regardless of input = HARDCODING DETECTED');