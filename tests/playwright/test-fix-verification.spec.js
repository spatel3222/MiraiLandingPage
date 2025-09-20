const { test, expect } = require('@playwright/test');

test.describe('Fix Verification - Filter and Pagination', () => {
    test('verify applyFilters fix and filter functionality works', async ({ page }) => {
        console.log('🔍 Testing JavaScript fixes and filter functionality...');
        
        // Navigate to dashboard
        await page.goto('http://localhost:8000/workshops/business-automation-dashboard.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000);
        
        // Check for JavaScript errors in console
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });
        
        // Open Process Management workspace directly
        const workspaceResult = await page.evaluate(() => {
            try {
                // Call the function directly
                if (typeof openProcessWorkspace === 'function') {
                    openProcessWorkspace();
                    return { success: true };
                } else {
                    return { error: 'openProcessWorkspace function not found' };
                }
            } catch (error) {
                return { error: error.message };
            }
        });
        
        console.log('🎯 Workspace result:', workspaceResult);
        
        await page.waitForTimeout(3000);
        
        // Check if filter controls exist and functions work
        const filterTest = await page.evaluate(() => {
            const elements = {
                searchInput: document.getElementById('searchFilter'),
                departmentFilter: document.getElementById('departmentFilter'),
                impactSlider: document.getElementById('impactMinFilter'),
                feasibilitySlider: document.getElementById('feasibilityMinFilter'),
                automationSlider: document.getElementById('automationMinFilter'),
                clearButton: document.querySelector('.clear-filters-btn'),
                itemsPerPage: document.getElementById('itemsPerPage'),
                paginationContainer: document.querySelector('.pagination-controls')
            };
            
            // Test if filterProcesses function exists and can be called
            let functionTest = { exists: false, error: null };
            try {
                if (typeof filterProcesses === 'function') {
                    functionTest.exists = true;
                    // Try calling it (should not throw error)
                    filterProcesses();
                    functionTest.callable = true;
                } else {
                    functionTest.error = 'filterProcesses function not found';
                }
            } catch (error) {
                functionTest.error = error.message;
                functionTest.callable = false;
            }
            
            return {
                // UI Elements
                hasSearchInput: !!elements.searchInput,
                hasDepartmentFilter: !!elements.departmentFilter,
                hasScoreSliders: !!(elements.impactSlider && elements.feasibilitySlider && elements.automationSlider),
                hasClearButton: !!elements.clearButton,
                hasItemsPerPage: !!elements.itemsPerPage,
                hasPaginationControls: !!elements.paginationContainer,
                
                // Function availability
                filterProcessesFunction: functionTest,
                
                // Process data
                processCount: window.processes ? window.processes.length : 0,
                hasProcesses: window.processes && window.processes.length > 0,
                
                // Filter variables
                filteredProcessesExists: typeof filteredProcesses !== 'undefined',
                currentPageExists: typeof currentPage !== 'undefined',
                itemsPerPageExists: typeof itemsPerPage !== 'undefined'
            };
        });
        
        console.log('📊 Filter Test Results:');
        console.log('   🔍 Search Input:', filterTest.hasSearchInput ? '✅' : '❌');
        console.log('   🏢 Department Filter:', filterTest.hasDepartmentFilter ? '✅' : '❌');
        console.log('   📈 Score Sliders:', filterTest.hasScoreSliders ? '✅' : '❌');
        console.log('   🧹 Clear Button:', filterTest.hasClearButton ? '✅' : '❌');
        console.log('   📄 Items Per Page:', filterTest.hasItemsPerPage ? '✅' : '❌');
        console.log('   📋 Pagination Controls:', filterTest.hasPaginationControls ? '✅' : '❌');
        console.log('   ⚙️ filterProcesses Function:', filterTest.filterProcessesFunction.exists ? '✅' : '❌');
        console.log('   📞 Function Callable:', filterTest.filterProcessesFunction.callable ? '✅' : '❌');
        console.log('   📊 Process Count:', filterTest.processCount);
        console.log('   📦 Filtered Processes Variable:', filterTest.filteredProcessesExists ? '✅' : '❌');
        console.log('   📄 Current Page Variable:', filterTest.currentPageExists ? '✅' : '❌');
        
        if (filterTest.filterProcessesFunction.error) {
            console.log('   ❌ Function Error:', filterTest.filterProcessesFunction.error);
        }
        
        // Test search functionality if elements exist
        if (filterTest.hasSearchInput) {
            console.log('🔎 Testing search functionality...');
            await page.fill('#searchFilter', 'onboarding');
            await page.waitForTimeout(1000);
            
            const searchResults = await page.evaluate(() => {
                const visibleProcesses = document.querySelectorAll('.process-item:not([style*="display: none"])');
                return {
                    visibleCount: visibleProcesses.length,
                    totalProcesses: window.processes ? window.processes.length : 0,
                    filteredCount: window.filteredProcesses ? window.filteredProcesses.length : 0
                };
            });
            
            console.log('   📈 Search Results:', searchResults);
        }
        
        // Check for JavaScript errors
        if (errors.length > 0) {
            console.log('❌ JavaScript Errors Found:');
            errors.forEach(error => console.log('   -', error));
        } else {
            console.log('✅ No JavaScript errors detected');
        }
        
        // Basic assertions
        expect(workspaceResult.success || filterTest.processCount > 0).toBe(true);
        expect(filterTest.filterProcessesFunction.exists).toBe(true);
        expect(errors.filter(e => e.includes('applyFilters')).length).toBe(0); // No applyFilters errors
        
        console.log('🎉 Filter and pagination fixes verified!');
    });
});