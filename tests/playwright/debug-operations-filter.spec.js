const { test, expect } = require('@playwright/test');

test.describe('Debug Operations Filter Issue', () => {
    test('investigate why Operations filter returns zero processes', async ({ page }) => {
        console.log('🔍 Debugging Operations filter issue...');
        
        // Navigate to dashboard
        await page.goto('http://localhost:8000/workshops/business-automation-dashboard.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000);
        
        // Open Process Management workspace
        await page.evaluate(() => {
            if (typeof openProcessWorkspace === 'function') {
                openProcessWorkspace();
            }
        });
        
        await page.waitForTimeout(4000);
        
        // First, analyze the actual data
        const dataAnalysis = await page.evaluate(() => {
            if (!window.processes || window.processes.length === 0) {
                return { error: 'No processes found' };
            }
            
            // Analyze department data
            const departmentCounts = {};
            const sampleProcesses = [];
            
            window.processes.forEach(process => {
                const dept = process.department || 'No Department';
                departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
                
                // Collect samples for each department
                if (sampleProcesses.length < 10) {
                    sampleProcesses.push({
                        name: process.name,
                        department: process.department,
                        departmentType: typeof process.department
                    });
                }
            });
            
            // Get available department options from dropdown
            const departmentSelect = document.getElementById('departmentFilter');
            const departmentOptions = Array.from(departmentSelect.options).map(option => ({
                value: option.value,
                text: option.textContent
            }));
            
            return {
                totalProcesses: window.processes.length,
                departmentCounts: departmentCounts,
                sampleProcesses: sampleProcesses,
                departmentOptions: departmentOptions,
                uniqueDepartments: Object.keys(departmentCounts).sort()
            };
        });
        
        console.log('📊 Data Analysis:');
        console.log('   Total Processes:', dataAnalysis.totalProcesses);
        console.log('   Department Counts:', dataAnalysis.departmentCounts);
        console.log('   Unique Departments:', dataAnalysis.uniqueDepartments);
        console.log('');
        console.log('📋 Department Dropdown Options:');
        dataAnalysis.departmentOptions.forEach(opt => {
            console.log(`   "${opt.value}" -> "${opt.text}"`);
        });
        console.log('');
        console.log('📝 Sample Processes:');
        dataAnalysis.sampleProcesses.forEach(proc => {
            console.log(`   "${proc.name}" -> Department: "${proc.department}" (${proc.departmentType})`);
        });
        
        // Test filtering by Operations specifically
        console.log('🔍 Testing Operations filter...');
        await page.selectOption('#departmentFilter', 'Operations');
        await page.waitForTimeout(1000);
        
        const operationsTest = await page.evaluate(() => {
            const selectedValue = document.getElementById('departmentFilter')?.value;
            
            // Check what the filter function would do
            let matchingProcesses = [];
            if (window.processes) {
                matchingProcesses = window.processes.filter(process => {
                    const dept = process.department;
                    const matches = dept === selectedValue;
                    return matches;
                });
            }
            
            return {
                selectedValue: selectedValue,
                manualFilterCount: matchingProcesses.length,
                manualMatches: matchingProcesses.slice(0, 5).map(p => ({
                    name: p.name,
                    department: p.department
                })),
                filteredProcessesCount: window.filteredProcesses ? window.filteredProcesses.length : 'undefined',
                currentFilters: window.currentFilters,
                processItems: document.querySelectorAll('.process-item').length
            };
        });
        
        console.log('🎯 Operations Filter Test:');
        console.log('   Selected Value:', `"${operationsTest.selectedValue}"`);
        console.log('   Manual Filter Count:', operationsTest.manualFilterCount);
        console.log('   Current filteredProcesses:', operationsTest.filteredProcessesCount);
        console.log('   Process Items in DOM:', operationsTest.processItems);
        console.log('   Current Filters Object:', operationsTest.currentFilters);
        
        if (operationsTest.manualMatches.length > 0) {
            console.log('   Manual Matches (first 5):');
            operationsTest.manualMatches.forEach(match => {
                console.log(`     "${match.name}" -> "${match.department}"`);
            });
        }
        
        // Test exact string matching
        console.log('🔬 Testing exact string matching...');
        const stringTest = await page.evaluate(() => {
            const testDepartments = ['Operations', 'operations', 'OPERATIONS', 'Operation'];
            const results = {};
            
            testDepartments.forEach(testDept => {
                const matches = window.processes.filter(p => p.department === testDept);
                results[testDept] = matches.length;
            });
            
            // Also test case-insensitive
            const caseInsensitiveMatches = window.processes.filter(p => 
                p.department && p.department.toLowerCase() === 'operations'
            );
            results['case_insensitive_operations'] = caseInsensitiveMatches.length;
            
            return results;
        });
        
        console.log('🔤 String Matching Tests:');
        Object.entries(stringTest).forEach(([test, count]) => {
            console.log(`   "${test}": ${count} matches`);
        });
        
        // Try other departments to see if filtering works at all
        console.log('🧪 Testing other departments...');
        
        for (const dept of ['HR', 'Sales', 'Finance']) {
            await page.selectOption('#departmentFilter', dept);
            await page.waitForTimeout(500);
            
            const deptResult = await page.evaluate((department) => {
                const manualCount = window.processes ? 
                    window.processes.filter(p => p.department === department).length : 0;
                
                return {
                    department: department,
                    selectedValue: document.getElementById('departmentFilter')?.value,
                    manualCount: manualCount,
                    filteredCount: window.filteredProcesses ? window.filteredProcesses.length : 0,
                    processItems: document.querySelectorAll('.process-item').length
                };
            }, dept);
            
            console.log(`   ${dept}: Manual=${deptResult.manualCount}, Filtered=${deptResult.filteredCount}, DOM=${deptResult.processItems}`);
        }
    });
});