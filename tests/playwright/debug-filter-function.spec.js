const { test, expect } = require('@playwright/test');

test.describe('Debug Filter Function Execution', () => {
    test('debug why filterProcesses function is not updating variables', async ({ page }) => {
        console.log('🔧 Debugging filterProcesses function execution...');
        
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
        
        // Check initial state
        const initialState = await page.evaluate(() => {
            return {
                processes: window.processes ? window.processes.length : 0,
                filteredProcesses: window.filteredProcesses ? window.filteredProcesses.length : 'undefined',
                currentFilters: window.currentFilters,
                functionExists: typeof filterProcesses === 'function'
            };
        });
        
        console.log('📊 Initial State:');
        console.log('   Processes:', initialState.processes);
        console.log('   Filtered Processes:', initialState.filteredProcesses);
        console.log('   Current Filters:', initialState.currentFilters);
        console.log('   filterProcesses function exists:', initialState.functionExists);
        
        // Force initialize filteredProcesses if needed
        if (initialState.filteredProcesses === 'undefined') {
            await page.evaluate(() => {
                if (window.processes && window.processes.length > 0) {
                    window.filteredProcesses = [...window.processes];
                    window.currentPage = 1;
                    window.itemsPerPage = 50;
                    console.log('🔧 Force initialized filteredProcesses:', window.filteredProcesses.length);
                }
            });
        }
        
        // Manually call filterProcesses and track what happens
        console.log('🔧 Manually calling filterProcesses...');
        
        const functionTest = await page.evaluate(() => {
            console.log('🔧 Before filterProcesses call:');
            console.log('   processes:', window.processes ? window.processes.length : 'undefined');
            console.log('   filteredProcesses:', window.filteredProcesses ? window.filteredProcesses.length : 'undefined');
            
            // Set up department filter
            const departmentFilter = document.getElementById('departmentFilter');
            if (departmentFilter) {
                departmentFilter.value = 'Operations';
            }
            
            let error = null;
            let result = null;
            
            try {
                // Call the function manually with debugging
                if (typeof filterProcesses === 'function') {
                    console.log('🔧 Calling filterProcesses...');
                    filterProcesses();
                    console.log('🔧 filterProcesses call completed');
                } else {
                    error = 'filterProcesses function not found';
                }
                
                result = {
                    success: true,
                    processesAfter: window.processes ? window.processes.length : 'undefined',
                    filteredProcessesAfter: window.filteredProcesses ? window.filteredProcesses.length : 'undefined',
                    currentFiltersAfter: window.currentFilters,
                    departmentFilterValue: departmentFilter ? departmentFilter.value : null
                };
                
                console.log('🔧 After filterProcesses call:');
                console.log('   processes:', result.processesAfter);
                console.log('   filteredProcesses:', result.filteredProcessesAfter);
                console.log('   currentFilters:', result.currentFiltersAfter);
                
            } catch (err) {
                error = err.message;
                console.error('🔧 Error calling filterProcesses:', err);
            }
            
            return { result, error };
        });
        
        console.log('🔧 Function Test Results:');
        if (functionTest.error) {
            console.log('   Error:', functionTest.error);
        } else {
            console.log('   Processes After:', functionTest.result.processesAfter);
            console.log('   Filtered Processes After:', functionTest.result.filteredProcessesAfter);
            console.log('   Current Filters After:', functionTest.result.currentFiltersAfter);
            console.log('   Department Filter Value:', functionTest.result.departmentFilterValue);
        }
        
        // Test the DOM state after manual function call
        const domState = await page.evaluate(() => {
            return {
                processItems: document.querySelectorAll('.process-item').length,
                visibleItems: document.querySelectorAll('.process-item:not([style*=\"display: none\"])').length,
                departmentValue: document.getElementById('departmentFilter')?.value,
                showingTotal: document.getElementById('showingTotal')?.textContent
            };
        });
        
        console.log('🎯 DOM State After Manual Call:');
        console.log('   Process Items:', domState.processItems);
        console.log('   Visible Items:', domState.visibleItems);
        console.log('   Department Value:', domState.departmentValue);
        console.log('   Showing Total:', domState.showingTotal);
        
        // Try triggering the filter through UI event
        console.log('🖱️ Testing UI event trigger...');
        await page.selectOption('#departmentFilter', 'HR');
        await page.waitForTimeout(1000);
        
        const uiTest = await page.evaluate(() => {
            return {
                filteredProcesses: window.filteredProcesses ? window.filteredProcesses.length : 'undefined',
                currentFilters: window.currentFilters,
                processItems: document.querySelectorAll('.process-item').length,
                showingTotal: document.getElementById('showingTotal')?.textContent
            };
        });
        
        console.log('🖱️ UI Event Test Results:');
        console.log('   Filtered Processes:', uiTest.filteredProcesses);
        console.log('   Current Filters:', uiTest.currentFilters);
        console.log('   Process Items:', uiTest.processItems);
        console.log('   Showing Total:', uiTest.showingTotal);
    });
});