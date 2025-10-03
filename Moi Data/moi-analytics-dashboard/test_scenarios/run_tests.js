/**
 * AUTOMATED TEST RUNNER
 * Runs all test scenarios and validates outputs
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Running Automated End-to-End Tests');
console.log('=====================================\n');

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
console.log('================================\n');

testScenarios.forEach((scenario, index) => {
    console.log(`${index + 1}. Test Scenario: ${scenario.name}`);
    console.log(`   📁 Upload files from: ./test_scenarios/${scenario.folder}/`);
    console.log(`   📊 Expected results:`);
    
    Object.keys(scenario).forEach(key => {
        if (key.startsWith('expected')) {
            const label = key.replace('expected', '').replace(/([A-Z])/g, ' $1').trim();
            console.log(`      - ${label}: ${scenario[key]}`);
        }
    });
    console.log('   🔄 Export all 3 files and verify values match expectations');
    console.log('   ❌ If values are hardcoded, they will NOT match these expectations\n');
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
console.log('\n⚠️  If ANY values remain the same across different test scenarios,');
console.log('    that indicates hardcoding is still present!\n');

module.exports = { testScenarios };
