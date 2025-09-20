const { test, expect } = require('@playwright/test');

test.describe('Debug Department Comparison', () => {
    test('debug why department comparison fails in filterProcesses', async ({ page }) => {
        console.log('🔬 Debugging department comparison logic...');
        
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
        
        // Force initialize if needed
        await page.evaluate(() => {
            if (!window.filteredProcesses && window.processes) {
                window.filteredProcesses = [...window.processes];
            }
        });
        
        // Test department comparison step by step
        const comparisonTest = await page.evaluate(() => {
            // Set department filter
            const departmentFilter = document.getElementById('departmentFilter');
            if (departmentFilter) {
                departmentFilter.value = 'Operations';
            }
            
            const selectedDepartment = departmentFilter?.value || '';
            console.log('🔬 selectedDepartment:', `"${selectedDepartment}"`);
            
            // Test comparison manually
            const operationsProcesses = window.processes.filter(p => p.department === 'Operations');
            console.log('🔬 Manual Operations filter:', operationsProcesses.length);
            
            // Test the exact logic from filterProcesses function
            const testResults = {
                selectedDepartmentValue: selectedDepartment,
                selectedDepartmentType: typeof selectedDepartment,
                selectedDepartmentLength: selectedDepartment.length,
                manualOperationsCount: operationsProcesses.length,
                comparisonTests: []
            };
            
            // Test first 10 processes
            window.processes.slice(0, 10).forEach((process, index) => {
                const matchesDepartment = !selectedDepartment || process.department === selectedDepartment;
                testResults.comparisonTests.push({
                    index: index,
                    name: process.name,
                    department: process.department,
                    departmentType: typeof process.department,
                    selectedDept: selectedDepartment,
                    emptySeletedDept: !selectedDepartment,
                    exactMatch: process.department === selectedDepartment,
                    finalMatch: matchesDepartment
                });
            });
            
            // Now test the actual filterProcesses function logic step by step
            let stepByStepResult;
            try {
                const searchTerm = (document.getElementById('searchFilter')?.value || document.getElementById('processSearchInput')?.value || '').toLowerCase();
                const minImpact = parseFloat(document.getElementById('impactScoreFilter')?.value || 0);
                const minFeasibility = parseFloat(document.getElementById('feasibilityScoreFilter')?.value || 0);
                const minAutomation = parseFloat(document.getElementById('automationScoreFilter')?.value || 0);
                
                console.log('🔬 Filter values:');
                console.log('   searchTerm:', `"${searchTerm}"`);
                console.log('   selectedDepartment:', `"${selectedDepartment}"`);
                console.log('   minImpact:', minImpact);
                console.log('   minFeasibility:', minFeasibility);
                console.log('   minAutomation:', minAutomation);
                
                // Manually run the filter logic
                const manualFiltered = window.processes.filter(process => {
                    const matchesSearch = !searchTerm || process.name?.toLowerCase().includes(searchTerm);
                    const matchesDepartment = !selectedDepartment || process.department === selectedDepartment;
                    const matchesImpact = (process.impact || 0) >= minImpact;
                    const matchesFeasibility = (process.feasibility || 0) >= minFeasibility;
                    
                    console.log(`Process "${process.name}": search=${matchesSearch}, dept=${matchesDepartment}, impact=${matchesImpact}, feasibility=${matchesFeasibility}`);
                    
                    return matchesSearch && matchesDepartment && matchesImpact && matchesFeasibility;
                });
                
                stepByStepResult = {
                    success: true,
                    manualFilteredCount: manualFiltered.length,
                    sampleMatches: manualFiltered.slice(0, 5).map(p => ({
                        name: p.name,
                        department: p.department
                    }))
                };
                
            } catch (error) {
                stepByStepResult = {
                    success: false,
                    error: error.message
                };
            }
            
            return {
                testResults: testResults,
                stepByStepResult: stepByStepResult
            };
        });
        
        console.log('🔬 Department Comparison Analysis:');
        console.log('   Selected Department:', `"${comparisonTest.testResults.selectedDepartmentValue}"`);
        console.log('   Type:', comparisonTest.testResults.selectedDepartmentType);
        console.log('   Length:', comparisonTest.testResults.selectedDepartmentLength);
        console.log('   Manual Operations Count:', comparisonTest.testResults.manualOperationsCount);
        
        console.log('');
        console.log('🔬 Comparison Tests (first 10 processes):');
        comparisonTest.testResults.comparisonTests.forEach(test => {
            console.log(`   ${test.index}: "${test.name}"`);
            console.log(`      Dept: "${test.department}" (${test.departmentType})`);
            console.log(`      Selected: "${test.selectedDept}"`);
            console.log(`      Empty Selected: ${test.emptySeletedDept}`);
            console.log(`      Exact Match: ${test.exactMatch}`);
            console.log(`      Final Match: ${test.finalMatch}`);
            console.log('');
        });
        
        console.log('🔬 Step-by-Step Filter Results:');
        if (comparisonTest.stepByStepResult.success) {
            console.log('   Manual Filtered Count:', comparisonTest.stepByStepResult.manualFilteredCount);
            console.log('   Sample Matches:');
            comparisonTest.stepByStepResult.sampleMatches.forEach(match => {
                console.log(`     "${match.name}" -> "${match.department}"`);
            });
        } else {
            console.log('   Error:', comparisonTest.stepByStepResult.error);
        }
    });
});