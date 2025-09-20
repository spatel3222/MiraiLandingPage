const { test, expect } = require('@playwright/test');

test.describe('Force Fix Filters', () => {
    test('force fix the filter initialization', async ({ page }) => {
        console.log('🔧 Force fixing filter initialization...');
        
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
        
        // Force fix the variables by directly setting them
        const fixResult = await page.evaluate(() => {
            console.log('🔧 Attempting to force fix variables...');
            
            // Check current state
            const before = {
                processes: window.processes ? window.processes.length : 0,
                filteredProcesses: window.filteredProcesses ? window.filteredProcesses.length : 'undefined',
                currentPage: window.currentPage,
                itemsPerPage: window.itemsPerPage
            };
            
            console.log('Before fix:', before);
            
            // Force fix the variables
            if (window.processes && window.processes.length > 0) {
                // Force set filteredProcesses
                window.filteredProcesses = [...window.processes];
                
                // Force set currentPage
                window.currentPage = 1;
                
                // Force fix itemsPerPage (get from select element)
                const itemsPerPageSelect = document.getElementById('itemsPerPage');
                if (itemsPerPageSelect && itemsPerPageSelect.value) {
                    const selectedValue = itemsPerPageSelect.value;
                    window.itemsPerPage = selectedValue === 'all' ? window.filteredProcesses.length : parseInt(selectedValue);
                } else {
                    window.itemsPerPage = 50;
                }
                
                console.log('🔧 Variables force-fixed, now calling render...');
                
                // Force call the render function
                if (typeof renderPaginatedProcessList === 'function') {
                    renderPaginatedProcessList();
                }
                
                // Force update pagination controls
                if (typeof updatePaginationControls === 'function') {
                    updatePaginationControls();
                }
            }
            
            const after = {
                processes: window.processes ? window.processes.length : 0,
                filteredProcesses: window.filteredProcesses ? window.filteredProcesses.length : 'undefined',
                currentPage: window.currentPage,
                itemsPerPage: window.itemsPerPage,
                itemsPerPageType: typeof window.itemsPerPage
            };
            
            console.log('After fix:', after);
            
            return { before, after, success: true };
        });
        
        console.log('🔧 Force Fix Results:');
        console.log('   Before - Processes:', fixResult.before.processes);
        console.log('   Before - Filtered:', fixResult.before.filteredProcesses);
        console.log('   Before - Current Page:', fixResult.before.currentPage);
        console.log('   Before - Items Per Page:', fixResult.before.itemsPerPage);
        
        console.log('   After - Processes:', fixResult.after.processes);
        console.log('   After - Filtered:', fixResult.after.filteredProcesses);
        console.log('   After - Current Page:', fixResult.after.currentPage);
        console.log('   After - Items Per Page:', fixResult.after.itemsPerPage);
        console.log('   After - Items Per Page Type:', fixResult.after.itemsPerPageType);
        
        await page.waitForTimeout(2000);
        
        // Test search functionality now
        await page.fill('#searchFilter', 'hr');
        await page.waitForTimeout(1000);
        
        const searchResult = await page.evaluate(() => {
            return {
                searchValue: document.getElementById('searchFilter')?.value,
                filteredProcesses: window.filteredProcesses ? window.filteredProcesses.length : 'undefined',
                visibleItems: document.querySelectorAll('.process-item:not([style*=\"display: none\"])').length,
                totalProcessItems: document.querySelectorAll('.process-item').length
            };
        });
        
        console.log('🔍 Search Test:');
        console.log('   Search Value:', searchResult.searchValue);
        console.log('   Filtered Processes:', searchResult.filteredProcesses);
        console.log('   Visible Items:', searchResult.visibleItems);
        console.log('   Total Process Items:', searchResult.totalProcessItems);
        
        // Check pagination buttons
        const paginationCheck = await page.evaluate(() => {
            const paginationButtons = document.getElementById('paginationButtons');
            return {
                paginationButtonsExists: !!paginationButtons,
                paginationButtonsHTML: paginationButtons ? paginationButtons.innerHTML.substring(0, 200) : null,
                pageInfo: document.querySelector('.page-info')?.textContent
            };
        });
        
        console.log('📄 Pagination Check:');
        console.log('   Pagination Buttons Exist:', paginationCheck.paginationButtonsExists);
        console.log('   Page Info:', paginationCheck.pageInfo);
        if (paginationCheck.paginationButtonsHTML) {
            console.log('   Pagination HTML (first 200 chars):', paginationCheck.paginationButtonsHTML);
        }
        
        // Clear search
        await page.fill('#searchFilter', '');
        await page.waitForTimeout(500);
        
        console.log('✅ Force fix complete!');
    });
});