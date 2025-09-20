const { test, expect } = require('@playwright/test');

test.describe('Debug Pagination and Search', () => {
    test('debug why pagination and search are not working', async ({ page }) => {
        console.log('🐛 Debugging pagination and search functionality...');
        
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
        
        await page.waitForTimeout(3000);
        
        // Debug pagination elements and function calls
        const debugInfo = await page.evaluate(() => {
            const paginationContainer = document.getElementById('paginationControls');
            const paginationButtons = document.getElementById('paginationButtons');
            
            // Test calling updatePagination manually
            let updatePaginationResult = { called: false, error: null };
            try {
                if (typeof updatePagination === 'function') {
                    updatePagination();
                    updatePaginationResult.called = true;
                }
            } catch (error) {
                updatePaginationResult.error = error.message;
            }
            
            // Test search input
            const searchInput = document.getElementById('searchFilter');
            
            // Check if process list is rendered
            const processList = document.getElementById('processWorkspaceList');
            const processItems = document.querySelectorAll('.process-item');
            
            return {
                // Pagination elements
                paginationContainerExists: !!paginationContainer,
                paginationContainerVisible: paginationContainer ? 
                    getComputedStyle(paginationContainer).display !== 'none' : false,
                paginationContainerHTML: paginationContainer ? 
                    paginationContainer.innerHTML.substring(0, 200) : null,
                paginationButtonsExists: !!paginationButtons,
                paginationButtonsHTML: paginationButtons ? 
                    paginationButtons.innerHTML : null,
                
                // Update pagination test
                updatePaginationResult: updatePaginationResult,
                
                // Search input
                searchInputExists: !!searchInput,
                searchInputId: searchInput ? searchInput.id : null,
                
                // Process data
                totalProcesses: window.processes ? window.processes.length : 0,
                filteredProcesses: window.filteredProcesses ? window.filteredProcesses.length : 0,
                currentPage: window.currentPage || 'undefined',
                itemsPerPage: window.itemsPerPage || 'undefined',
                
                // DOM elements
                processListExists: !!processList,
                processItemCount: processItems.length,
                
                // Variables availability
                variableCheck: {
                    processes: typeof processes !== 'undefined',
                    filteredProcesses: typeof filteredProcesses !== 'undefined',
                    currentPage: typeof currentPage !== 'undefined',
                    itemsPerPage: typeof itemsPerPage !== 'undefined'
                }
            };
        });
        
        console.log('🔍 Debug Results:');
        console.log('📊 Process Data:');
        console.log('   Total Processes:', debugInfo.totalProcesses);
        console.log('   Filtered Processes:', debugInfo.filteredProcesses);
        console.log('   Current Page:', debugInfo.currentPage);
        console.log('   Items Per Page:', debugInfo.itemsPerPage);
        console.log('');
        console.log('🎯 DOM Elements:');
        console.log('   Process List Exists:', debugInfo.processListExists ? '✅' : '❌');
        console.log('   Process Items Count:', debugInfo.processItemCount);
        console.log('   Search Input Exists:', debugInfo.searchInputExists ? '✅' : '❌');
        console.log('   Search Input ID:', debugInfo.searchInputId);
        console.log('');
        console.log('📄 Pagination:');
        console.log('   Container Exists:', debugInfo.paginationContainerExists ? '✅' : '❌');
        console.log('   Container Visible:', debugInfo.paginationContainerVisible ? '✅' : '❌');
        console.log('   Buttons Container Exists:', debugInfo.paginationButtonsExists ? '✅' : '❌');
        console.log('   Update Function Called:', debugInfo.updatePaginationResult.called ? '✅' : '❌');
        
        if (debugInfo.updatePaginationResult.error) {
            console.log('   Update Function Error:', debugInfo.updatePaginationResult.error);
        }
        
        if (debugInfo.paginationContainerHTML) {
            console.log('   Container HTML (first 200 chars):', debugInfo.paginationContainerHTML);
        }
        
        if (debugInfo.paginationButtonsHTML) {
            console.log('   Buttons HTML:', debugInfo.paginationButtonsHTML);
        }
        
        console.log('');
        console.log('📦 Variables:');
        Object.entries(debugInfo.variableCheck).forEach(([name, exists]) => {
            console.log(`   ${name}:`, exists ? '✅' : '❌');
        });
        
        // Test search manually
        if (debugInfo.searchInputExists) {
            console.log('');
            console.log('🔎 Testing Search...');
            
            // Fill search input
            await page.fill('#searchFilter', 'onboarding');
            await page.waitForTimeout(500);
            
            const afterSearch = await page.evaluate(() => {
                return {
                    searchValue: document.getElementById('searchFilter')?.value,
                    filteredProcesses: window.filteredProcesses ? window.filteredProcesses.length : 0,
                    visibleProcessItems: document.querySelectorAll('.process-item:not([style*="display: none"])').length
                };
            });
            
            console.log('   Search Value:', afterSearch.searchValue);
            console.log('   Filtered Count:', afterSearch.filteredProcesses);
            console.log('   Visible Items:', afterSearch.visibleProcessItems);
            
            // Clear search
            await page.fill('#searchFilter', '');
            await page.waitForTimeout(500);
        }
    });
});