/**
 * MOI Analytics Meta Spend Debugging Console Script
 * 
 * Run this in the browser console when the MOI Analytics Dashboard is loaded
 * to debug why Meta Ad Spend is showing as 0 in exports.
 * 
 * Usage:
 * 1. Open MOI Analytics Dashboard
 * 2. Open browser console (F12)
 * 3. Copy and paste this entire script
 * 4. Press Enter to run
 */

console.log('🔍 MOI Analytics Meta Spend Debugging Tool - Console Version');
console.log('================================================================');

// Global debug object to store results
window.moiDebug = {
    localStorage: {},
    csvData: {},
    dataFlow: {},
    recommendations: []
};

/**
 * Utility functions
 */
function logSection(title) {
    console.log(`\n📋 ${title}`);
    console.log('='.repeat(title.length + 4));
}

function logStep(step, message, data = null) {
    console.log(`${step} ${message}`);
    if (data) {
        console.log('   📊 Data:', data);
    }
}

function logError(message, error = null) {
    console.error(`❌ ${message}`);
    if (error) {
        console.error('   Error details:', error);
    }
}

function logSuccess(message, data = null) {
    console.log(`✅ ${message}`);
    if (data) {
        console.log('   📊 Result:', data);
    }
}

function logWarning(message) {
    console.warn(`⚠️ ${message}`);
}

/**
 * STEP 1: Analyze LocalStorage
 */
function analyzeLocalStorage() {
    logSection('STEP 1: LocalStorage Analysis');
    
    const relevantKeys = [];
    const allKeys = [];
    
    // Get all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        allKeys.push(key);
        
        if (key && (key.includes('moi') || key.includes('meta') || key.includes('google') || 
                   key.includes('server') || key.includes('dashboard'))) {
            relevantKeys.push(key);
        }
    }
    
    logStep('🔍', `Found ${allKeys.length} total keys, ${relevantKeys.length} relevant keys`);
    
    window.moiDebug.localStorage.totalKeys = allKeys.length;
    window.moiDebug.localStorage.relevantKeys = relevantKeys;
    
    // Analyze each relevant key
    relevantKeys.forEach(key => {
        const value = localStorage.getItem(key);
        const size = value ? (value.length / 1024).toFixed(2) : 0;
        
        logStep('📁', `${key}: ${size}KB`);
        
        window.moiDebug.localStorage[key] = {
            size: parseFloat(size),
            hasContent: !!value && value.length > 0
        };
    });
    
    // Focus on critical data sources
    console.log('\n🎯 CRITICAL DATA SOURCES:');
    const criticalKeys = ['moi-server-topLevel', 'moi-server-adset', 'moi-dashboard-data'];
    
    criticalKeys.forEach(key => {
        const exists = localStorage.getItem(key);
        if (exists) {
            logSuccess(`${key} EXISTS - Size: ${(exists.length/1024).toFixed(2)}KB`);
            
            // If it's topLevel CSV, analyze Meta Spend columns
            if (key.includes('topLevel') && exists.includes(',')) {
                const lines = exists.split('\n');
                const headers = lines[0] ? lines[0].split(',') : [];
                const metaSpendColumns = headers.filter(h => 
                    h.toLowerCase().includes('meta') && h.toLowerCase().includes('spend')
                );
                
                if (metaSpendColumns.length > 0) {
                    logSuccess(`   Meta Spend columns found: ${metaSpendColumns.join(', ')}`);
                    
                    if (lines.length > 1) {
                        const dataRow = lines[1].split(',');
                        metaSpendColumns.forEach(col => {
                            const index = headers.indexOf(col);
                            if (index >= 0 && dataRow[index]) {
                                const value = dataRow[index];
                                const numericValue = parseFloat(value.replace(/[,₹$]/g, ''));
                                logStep('💰', `${col} = "${value}" → ${numericValue}`);
                                
                                // Store finding
                                if (!window.moiDebug.csvData.metaSpendValues) {
                                    window.moiDebug.csvData.metaSpendValues = [];
                                }
                                window.moiDebug.csvData.metaSpendValues.push({
                                    source: key,
                                    column: col,
                                    rawValue: value,
                                    numericValue: numericValue
                                });
                            }
                        });
                    }
                } else {
                    logWarning(`   No Meta Spend columns found in headers: ${headers.join(', ')}`);
                }
            }
        } else {
            logError(`${key} MISSING`);
        }
    });
}

/**
 * STEP 2: Parse CSV Data in Detail
 */
function parseCSVData() {
    logSection('STEP 2: Detailed CSV Data Analysis');
    
    const csvKeys = ['moi-server-topLevel', 'moi-server-adset'];
    
    csvKeys.forEach(key => {
        const csvContent = localStorage.getItem(key);
        
        if (!csvContent) {
            logError(`No data found for ${key}`);
            return;
        }
        
        console.log(`\n📊 ANALYZING ${key.toUpperCase()}:`);
        
        const lines = csvContent.split('\n').filter(line => line.trim());
        logStep('📋', `Total lines: ${lines.length}`);
        
        if (lines.length > 0) {
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            logStep('📋', `Headers (${headers.length}):`, headers);
            
            // Look for Meta-related columns
            const metaColumns = headers.filter(h => h.toLowerCase().includes('meta'));
            const spendColumns = headers.filter(h => h.toLowerCase().includes('spend') || h.toLowerCase().includes('cost'));
            
            logStep('🔍', `Meta-related columns:`, metaColumns);
            logStep('🔍', `Spend/Cost columns:`, spendColumns);
            
            // Parse first few data rows
            for (let i = 1; i < Math.min(lines.length, 4); i++) {
                const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                console.log(`\n📋 Row ${i} analysis:`);
                
                // Show Meta-related values
                metaColumns.forEach(metaCol => {
                    const index = headers.indexOf(metaCol);
                    if (index >= 0 && values[index]) {
                        const value = values[index];
                        const numericValue = parseFloat(value.replace(/[,₹$]/g, ''));
                        logStep('📊', `${metaCol}: "${value}" → ${numericValue}`);
                    }
                });
                
                // Show spend-related values
                spendColumns.forEach(spendCol => {
                    const index = headers.indexOf(spendCol);
                    if (index >= 0 && values[index]) {
                        const value = values[index];
                        const numericValue = parseFloat(value.replace(/[,₹$]/g, ''));
                        logStep('💰', `${spendCol}: "${value}" → ${numericValue}`);
                    }
                });
            }
        }
    });
}

/**
 * STEP 3: Trace Data Flow
 */
function traceDataFlow() {
    logSection('STEP 3: Data Flow Analysis');
    
    // Simulate ExportModal logic exactly
    console.log('\n🔄 SIMULATING EXPORTMODAL LOGIC:');
    
    const serverTopLevelCsv = localStorage.getItem('moi-server-topLevel');
    
    if (!serverTopLevelCsv) {
        logError('CRITICAL: No moi-server-topLevel found!');
        return;
    }
    
    logSuccess('Found moi-server-topLevel data');
    
    try {
        // Parse exactly like ExportModal.tsx lines 101-132
        const lines = serverTopLevelCsv.split('\n');
        const headers = lines[0].split(',');
        
        logStep('📊', 'CSV headers:', headers);
        
        if (lines.length > 1) {
            const dataRow = lines[1].split(',');
            logStep('📊', 'First data row:', dataRow);
            
            // Extract Meta data exactly like ExportModal
            const metaSpendIndex = headers.findIndex(h => h.includes('Meta Spend'));
            const metaCTRIndex = headers.findIndex(h => h.includes('Meta CTR'));
            const metaCPMIndex = headers.findIndex(h => h.includes('Meta CPM'));
            
            console.log('\n🎯 META DATA EXTRACTION (ExportModal simulation):');
            logStep('🔍', `Meta Spend Index: ${metaSpendIndex}`);
            logStep('🔍', `Meta CTR Index: ${metaCTRIndex}`);
            logStep('🔍', `Meta CPM Index: ${metaCPMIndex}`);
            
            let metaSpend = 0, metaCTR = 0, metaCPM = 0;
            
            if (metaSpendIndex >= 0) {
                const rawValue = dataRow[metaSpendIndex];
                metaSpend = parseFloat(rawValue) || 0;
                
                if (metaSpend > 0) {
                    logSuccess(`Meta Spend extracted: "${rawValue}" → ${metaSpend}`);
                } else {
                    logError(`Meta Spend is 0: "${rawValue}" → ${metaSpend}`);
                }
            } else {
                logError('Meta Spend column not found in headers!');
            }
            
            if (metaCTRIndex >= 0) {
                metaCTR = parseFloat(dataRow[metaCTRIndex]) || 0;
                logStep('📊', `Meta CTR: ${dataRow[metaCTRIndex]} → ${metaCTR}`);
            }
            
            if (metaCPMIndex >= 0) {
                metaCPM = parseFloat(dataRow[metaCPMIndex]) || 0;
                logStep('📊', `Meta CPM: ${dataRow[metaCPMIndex]} → ${metaCPM}`);
            }
            
            // Store results
            window.moiDebug.dataFlow.exportExtraction = {
                metaSpend,
                metaCTR,
                metaCPM,
                foundMetaSpendColumn: metaSpendIndex >= 0,
                metaSpendColumnIndex: metaSpendIndex,
                headers: headers,
                rawMetaSpendValue: metaSpendIndex >= 0 ? dataRow[metaSpendIndex] : null
            };
            
            console.log('\n🎯 FINAL EXTRACTION RESULT:');
            logStep('💰', `Meta Spend = ${metaSpend}`, metaSpend > 0 ? 'SUCCESS' : 'PROBLEM');
            
        } else {
            logError('No data rows found in CSV!');
        }
        
    } catch (error) {
        logError('Error simulating ExportModal logic:', error);
    }
}

/**
 * STEP 4: Check Original Data Sources
 */
function checkOriginalDataSources() {
    logSection('STEP 4: Original Data Source Analysis');
    
    // Look for original Meta data
    const metaKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.toLowerCase().includes('meta') && !key.includes('server')) {
            metaKeys.push(key);
        }
    }
    
    logStep('🔍', `Found ${metaKeys.length} original Meta data keys:`, metaKeys);
    
    metaKeys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
            logStep('📁', `${key}: ${(data.length/1024).toFixed(2)}KB`);
            
            // Try to parse and look for spend data
            if (data.includes('spend') || data.includes('cost') || data.includes('amount')) {
                console.log('   💰 Contains spend/cost data');
                
                // If it's CSV, analyze it
                if (data.includes(',') && data.includes('\n')) {
                    const lines = data.split('\n').slice(0, 5); // First 5 lines
                    lines.forEach((line, i) => {
                        if (line.toLowerCase().includes('spend') || line.toLowerCase().includes('cost')) {
                            console.log(`   Line ${i}: ${line.substring(0, 200)}...`);
                        }
                    });
                }
            }
        }
    });
}

/**
 * STEP 5: Generate Specific Recommendations
 */
function generateRecommendations() {
    logSection('STEP 5: Fix Recommendations');
    
    const issues = [];
    const fixes = [];
    
    // Analyze findings
    const hasServerTopLevel = !!localStorage.getItem('moi-server-topLevel');
    const extraction = window.moiDebug.dataFlow.exportExtraction;
    
    if (!hasServerTopLevel) {
        issues.push('❌ CRITICAL: moi-server-topLevel missing');
        fixes.push('Ensure data processing creates moi-server-topLevel in localStorage');
    } else if (!extraction?.foundMetaSpendColumn) {
        issues.push('❌ CRITICAL: Meta Spend column not found in CSV headers');
        fixes.push('Update data processor to include "Meta Spend" column');
    } else if (extraction.metaSpend === 0) {
        issues.push('❌ HIGH: Meta Spend value is 0');
        fixes.push('Check original Meta data aggregation logic');
    }
    
    console.log('\n🎯 IDENTIFIED ISSUES:');
    issues.forEach((issue, i) => console.log(`${i + 1}. ${issue}`));
    
    console.log('\n💡 RECOMMENDED FIXES:');
    fixes.forEach((fix, i) => console.log(`${i + 1}. ${fix}`));
    
    // Specific debugging steps
    console.log('\n🔧 IMMEDIATE DEBUGGING STEPS:');
    console.log('1. Run window.moiDebug to see all collected data');
    console.log('2. Check if original Meta CSV files have spend values > 0');
    console.log('3. Verify configurableDataProcessor.ts aggregation logic');
    console.log('4. Add console.log in ExportModal.tsx around line 119');
    console.log('5. Test with real Meta Ads data containing spend values');
    
    window.moiDebug.recommendations = { issues, fixes };
}

/**
 * STEP 6: Run Tests
 */
function runTests() {
    logSection('STEP 6: Validation Tests');
    
    const tests = [
        {
            name: 'LocalStorage moi-server-topLevel exists',
            test: () => !!localStorage.getItem('moi-server-topLevel'),
            critical: true
        },
        {
            name: 'Meta Spend column exists in headers',
            test: () => {
                const csv = localStorage.getItem('moi-server-topLevel');
                if (!csv) return false;
                return csv.split('\n')[0].includes('Meta Spend');
            },
            critical: true
        },
        {
            name: 'Meta Spend value is numeric and > 0',
            test: () => {
                const extraction = window.moiDebug.dataFlow.exportExtraction;
                return extraction && extraction.metaSpend > 0;
            },
            critical: true
        },
        {
            name: 'Original Meta data exists',
            test: () => {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.toLowerCase().includes('meta') && !key.includes('server')) {
                        return true;
                    }
                }
                return false;
            },
            critical: false
        },
        {
            name: 'Dashboard data exists',
            test: () => !!localStorage.getItem('moi-dashboard-data'),
            critical: false
        }
    ];
    
    let passed = 0;
    let critical_passed = 0;
    let critical_total = 0;
    
    tests.forEach(test => {
        const result = test.test();
        const status = result ? '✅ PASS' : '❌ FAIL';
        const priority = test.critical ? '[CRITICAL]' : '[OPTIONAL]';
        
        console.log(`${status} ${priority} ${test.name}`);
        
        if (result) passed++;
        if (test.critical) {
            critical_total++;
            if (result) critical_passed++;
        }
    });
    
    console.log(`\n🎯 TEST RESULTS:`);
    console.log(`   Overall: ${passed}/${tests.length} tests passed`);
    console.log(`   Critical: ${critical_passed}/${critical_total} critical tests passed`);
    
    if (critical_passed === critical_total) {
        logSuccess('All critical tests passed! Meta spend should work.');
    } else {
        logError(`${critical_total - critical_passed} critical tests failed. Meta spend will be 0.`);
    }
}

/**
 * Main execution function
 */
function runFullDebug() {
    console.log('🚀 Starting comprehensive Meta Spend debugging...\n');
    
    try {
        analyzeLocalStorage();
        parseCSVData();
        traceDataFlow();
        checkOriginalDataSources();
        generateRecommendations();
        runTests();
        
        console.log('\n🎯 DEBUGGING COMPLETE!');
        console.log('📊 All results stored in window.moiDebug');
        console.log('💡 Check recommendations for specific fixes');
        
        // Show summary
        const extraction = window.moiDebug.dataFlow.exportExtraction;
        if (extraction) {
            console.log(`\n📋 SUMMARY: Meta Spend = ${extraction.metaSpend}`);
            if (extraction.metaSpend === 0) {
                console.log('❌ This explains why exports show 0 for Meta spend!');
            } else {
                console.log('✅ Meta spend value found - issue may be elsewhere');
            }
        }
        
    } catch (error) {
        logError('Debugging failed:', error);
    }
}

// Auto-run the full debug
runFullDebug();