/**
 * EXPORT VERIFICATION SCRIPT
 * Helps systematically verify that exports change based on input data
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 MOI Analytics Export Verification Helper');
console.log('==========================================\n');

const testScenarios = [
    {
        name: 'Basic Known Values',
        folder: '01_basic_known_values',
        description: 'Tests basic template processing with predictable values',
        expectedResults: {
            topLevelDaily: {
                date: '2025-09-29',
                metaSpend: 3000, // 1000 + 2000
                googleSpend: 4000, // 1500 + 2500  
                totalUsers: 300 // 100 + 200
            },
            adSetLevel: {
                date: '2025-09-29',
                campaign1: { name: 'Test Campaign 1', spend: 1000, users: 100 },
                campaign2: { name: 'Test Campaign 2', spend: 2000, users: 200 },
                costPerUser1: 10, // 1000/100
                costPerUser2: 10  // 2000/200
            }
        }
    },
    {
        name: 'Different Dates',
        folder: '02_different_dates',
        description: 'Verifies date extraction from input files works correctly',
        expectedResults: {
            topLevelDaily: {
                date: '2025-10-15', // From Meta "Reporting ends"
                metaSpend: 1500,
                googleSpend: 1800
            },
            adSetLevel: {
                date: '2025-10-15', // From Shopify "Day"
                users: 150
            }
        }
    },
    {
        name: 'Different Spend',
        folder: '03_different_spend',
        description: 'Tests that calculations change based on different spend amounts',
        expectedResults: {
            topLevelDaily: {
                date: '2025-09-30',
                metaSpend: 5000,
                googleSpend: 10000
            },
            adSetLevel: {
                date: '2025-09-30',
                spend: 5000,
                users: 50,
                costPerUser: 100 // 5000/50 = 100
            }
        }
    },
    {
        name: 'Edge Cases',
        folder: '04_edge_cases',
        description: 'Tests zero values and edge case handling',
        expectedResults: {
            topLevelDaily: {
                date: '2025-09-28',
                metaSpend: 0,
                googleSpend: 0,
                totalUsers: 0
            },
            adSetLevel: {
                date: '2025-09-28',
                spend: 0,
                users: 0,
                costPerUser: 0 // Should handle division by zero
            }
        }
    }
];

function printTestInstructions() {
    console.log('📋 SYSTEMATIC TESTING INSTRUCTIONS');
    console.log('==================================\n');
    
    console.log('🚀 1. SETUP');
    console.log('   - Open dashboard: http://localhost:5175');
    console.log('   - Clear any existing data (if needed)');
    console.log('   - Have this verification script open for reference\n');
    
    testScenarios.forEach((scenario, index) => {
        console.log(`🧪 ${index + 2}. TEST SCENARIO: ${scenario.name.toUpperCase()}`);
        console.log(`   📁 Files location: ./test_scenarios/${scenario.folder}/`);
        console.log(`   📝 Purpose: ${scenario.description}`);
        console.log('   \n   🔄 Steps:');
        console.log('   a) Upload all 3 CSV files from the scenario folder');
        console.log('   b) Wait for dashboard to process the data');
        console.log('   c) Export Top Level Daily CSV');
        console.log('   d) Export Ad Set Level CSV');
        console.log('   e) Export Pivot Temp CSV (optional)');
        console.log('\n   ✅ Expected Results:');
        
        if (scenario.expectedResults.topLevelDaily) {
            console.log('      📊 Top Level Daily:');
            Object.entries(scenario.expectedResults.topLevelDaily).forEach(([key, value]) => {
                console.log(`         - ${key}: ${value}`);
            });
        }
        
        if (scenario.expectedResults.adSetLevel) {
            console.log('      📈 Ad Set Level:');
            Object.entries(scenario.expectedResults.adSetLevel).forEach(([key, value]) => {
                if (typeof value === 'object') {
                    console.log(`         - ${key}: ${JSON.stringify(value)}`);
                } else {
                    console.log(`         - ${key}: ${value}`);
                }
            });
        }
        
        console.log('\n   ❗ CRITICAL VALIDATION:');
        console.log('      - Verify dates match expected dates');
        console.log('      - Verify spend amounts match input data');
        console.log('      - Verify user counts match input data');
        console.log('      - Check calculated fields (Cost per user)');
        console.log('      - Values should be DIFFERENT from previous scenario\n');
        console.log('   ---\n');
    });
    
    console.log('🎯 VALIDATION CHECKLIST');
    console.log('=======================');
    console.log('After running ALL scenarios, verify:');
    console.log('✅ Dates changed across scenarios (2025-09-29 → 2025-10-15 → 2025-09-30 → 2025-09-28)');
    console.log('✅ Spend amounts changed (3000 → 1500 → 5000 → 0)');
    console.log('✅ User counts changed (300 → 150 → 50 → 0)');
    console.log('✅ Calculated fields changed appropriately');
    console.log('✅ Edge cases handled properly (no crashes with zero values)');
    console.log('\n❌ FAILURE INDICATORS:');
    console.log('   - Same dates across all scenarios = Date extraction broken');
    console.log('   - Same spend amounts = Template processing not working');  
    console.log('   - Same user counts = Shopify data not being used');
    console.log('   - Same calculated values = Calculations hardcoded');
    console.log('   - Any crashes with zero values = Edge case handling broken');
}

function generateComparisonTable() {
    console.log('\n📊 EXPECTED RESULTS COMPARISON TABLE');
    console.log('====================================');
    console.log('| Scenario        | Date       | Meta Spend | Google Spend | Total Users | Cost/User |');
    console.log('|-----------------|------------|------------|--------------|-------------|-----------|');
    
    testScenarios.forEach(scenario => {
        const tld = scenario.expectedResults.topLevelDaily || {};
        const asl = scenario.expectedResults.adSetLevel || {};
        const name = scenario.name.padEnd(15);
        const date = (tld.date || asl.date || '').padEnd(10);
        const metaSpend = String(tld.metaSpend || asl.spend || 0).padEnd(10);
        const googleSpend = String(tld.googleSpend || 0).padEnd(12);
        const users = String(tld.totalUsers || asl.users || 0).padEnd(11);
        const costPerUser = String(asl.costPerUser || 0).padEnd(9);
        
        console.log(`| ${name} | ${date} | ${metaSpend} | ${googleSpend} | ${users} | ${costPerUser} |`);
    });
    
    console.log('\n💡 KEY INSIGHT: If ANY column shows the same values across ALL scenarios,');
    console.log('   that indicates hardcoding is still present in the system!');
}

// Run the helper
printTestInstructions();
generateComparisonTable();

console.log('\n🚀 READY TO START TESTING!');
console.log('==========================');
console.log('Use this script as your guide and verify each scenario systematically.');
console.log('Remember: Different inputs should produce different outputs!');

module.exports = { testScenarios };