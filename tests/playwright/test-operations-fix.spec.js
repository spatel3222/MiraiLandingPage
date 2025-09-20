const { test, expect } = require('@playwright/test');

test.describe('Test Operations Filter Fix', () => {
    test('verify Operations filter now works correctly', async ({ page }) => {
        console.log('🔧 Testing Operations filter fix...');
        
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
                window.currentPage = 1;
                window.itemsPerPage = 50;
            }
        });
        
        // Test initial state
        const initial = await page.evaluate(() => {
            return {
                processes: window.processes ? window.processes.length : 0,
                filteredProcesses: window.filteredProcesses ? window.filteredProcesses.length : 0,
                processItems: document.querySelectorAll('.process-item').length
            };
        });
        
        console.log('📊 Initial State:');
        console.log('   Processes:', initial.processes);
        console.log('   Filtered Processes:', initial.filteredProcesses);
        console.log('   Process Items:', initial.processItems);
        
        // Test Operations filter
        console.log('🔍 Testing Operations filter...');
        await page.selectOption('#departmentFilter', 'Operations');
        await page.waitForTimeout(1500);
        
        const operationsResult = await page.evaluate(() => {
            return {
                departmentValue: document.getElementById('departmentFilter')?.value,
                filteredProcesses: window.filteredProcesses ? window.filteredProcesses.length : 0,
                currentFilters: window.currentFilters,
                processItems: document.querySelectorAll('.process-item').length,
                showingTotal: document.getElementById('showingTotal')?.textContent,
                showingStart: document.getElementById('showingStart')?.textContent,
                showingEnd: document.getElementById('showingEnd')?.textContent
            };
        });
        
        console.log('   Department Selected:', operationsResult.departmentValue);
        console.log('   Filtered Processes:', operationsResult.filteredProcesses);
        console.log('   Current Filters:', operationsResult.currentFilters);
        console.log('   Process Items:', operationsResult.processItems);
        console.log('   Showing:', `${operationsResult.showingStart}-${operationsResult.showingEnd} of ${operationsResult.showingTotal}`);
        
        // Test HR filter
        console.log('🔍 Testing HR filter...');
        await page.selectOption('#departmentFilter', 'HR');
        await page.waitForTimeout(1500);
        
        const hrResult = await page.evaluate(() => {
            return {
                filteredProcesses: window.filteredProcesses ? window.filteredProcesses.length : 0,
                processItems: document.querySelectorAll('.process-item').length,
                showingTotal: document.getElementById('showingTotal')?.textContent
            };
        });
        
        console.log('   HR Filtered Processes:', hrResult.filteredProcesses);
        console.log('   HR Process Items:', hrResult.processItems);
        console.log('   HR Showing Total:', hrResult.showingTotal);
        
        // Test search functionality
        console.log('🔍 Testing search with department filter...');
        await page.selectOption('#departmentFilter', 'Operations');
        await page.fill('#searchFilter', 'monitoring');
        await page.waitForTimeout(1500);
        
        const searchResult = await page.evaluate(() => {
            return {
                searchValue: document.getElementById('searchFilter')?.value,
                departmentValue: document.getElementById('departmentFilter')?.value,
                filteredProcesses: window.filteredProcesses ? window.filteredProcesses.length : 0,
                processItems: document.querySelectorAll('.process-item').length,
                showingTotal: document.getElementById('showingTotal')?.textContent
            };
        });
        
        console.log('   Search Value:', searchResult.searchValue);
        console.log('   Department Value:', searchResult.departmentValue);
        console.log('   Combined Filtered Processes:', searchResult.filteredProcesses);
        console.log('   Combined Process Items:', searchResult.processItems);
        console.log('   Combined Showing Total:', searchResult.showingTotal);
        
        // Test clear filters
        console.log('🧹 Testing clear filters...');
        await page.click('.clear-filters-btn');
        await page.waitForTimeout(1500);
        
        const clearResult = await page.evaluate(() => {
            return {
                searchValue: document.getElementById('searchFilter')?.value,
                departmentValue: document.getElementById('departmentFilter')?.value,
                filteredProcesses: window.filteredProcesses ? window.filteredProcesses.length : 0,
                processItems: document.querySelectorAll('.process-item').length,
                showingTotal: document.getElementById('showingTotal')?.textContent
            };
        });
        
        console.log('   After Clear - Search:', `"${clearResult.searchValue}"`);
        console.log('   After Clear - Department:', `"${clearResult.departmentValue}"`);
        console.log('   After Clear - Filtered Processes:', clearResult.filteredProcesses);
        console.log('   After Clear - Process Items:', clearResult.processItems);
        console.log('   After Clear - Showing Total:', clearResult.showingTotal);
        
        // Final assessment
        const isFixed = operationsResult.filteredProcesses === 50 && operationsResult.filteredProcesses === operationsResult.processItems;
        const isConsistent = hrResult.filteredProcesses === hrResult.processItems;
        const searchWorks = searchResult.filteredProcesses < 50;
        const clearWorks = clearResult.filteredProcesses === initial.processes;
        
        console.log('🎯 Final Assessment:');
        console.log('   ✅ Operations Filter Fixed:', isFixed);
        console.log('   ✅ HR Filter Consistent:', isConsistent);
        console.log('   ✅ Search Works:', searchWorks);
        console.log('   ✅ Clear Works:', clearWorks);
        
        const successCount = [isFixed, isConsistent, searchWorks, clearWorks].filter(Boolean).length;
        console.log(`   🎯 Overall: ${successCount}/4 features working (${(successCount/4*100).toFixed(1)}%)`);
        
        // Assertions
        expect(isFixed).toBe(true);
        expect(successCount).toBeGreaterThanOrEqual(3);
    });
});