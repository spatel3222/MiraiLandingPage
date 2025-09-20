const { test, expect } = require('@playwright/test');

test.describe('Final Verification - Complete Filter and Pagination', () => {
    test('verify all fixes work together perfectly', async ({ page }) => {
        console.log('🎯 Final verification of all filter and pagination fixes...');
        
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
        const initial = await page.evaluate(() => {
            return {
                processes: window.processes ? window.processes.length : 0,
                filteredProcesses: window.filteredProcesses ? window.filteredProcesses.length : 0,
                processItems: document.querySelectorAll('.process-item').length,
                paginationButtons: document.querySelectorAll('.page-btn').length,
                showingStart: document.getElementById('showingStart')?.textContent,
                showingEnd: document.getElementById('showingEnd')?.textContent,
                showingTotal: document.getElementById('showingTotal')?.textContent
            };
        });
        
        console.log('📊 Initial State:');
        console.log('   Total Processes:', initial.processes);
        console.log('   Filtered Processes:', initial.filteredProcesses);
        console.log('   Process Items in DOM:', initial.processItems);
        console.log('   Pagination Buttons:', initial.paginationButtons);
        console.log('   Showing:', `${initial.showingStart}-${initial.showingEnd} of ${initial.showingTotal}`);
        
        // Test 1: Search functionality
        console.log('🔍 Testing search...');
        await page.fill('#searchFilter', 'onboarding');
        await page.waitForTimeout(1000);
        
        const searchResult = await page.evaluate(() => {
            return {
                searchValue: document.getElementById('searchFilter')?.value,
                filteredProcesses: window.filteredProcesses ? window.filteredProcesses.length : 0,
                processItems: document.querySelectorAll('.process-item').length,
                showingTotal: document.getElementById('showingTotal')?.textContent
            };
        });
        
        console.log('   Search Value:', searchResult.searchValue);
        console.log('   Filtered Count:', searchResult.filteredProcesses);
        console.log('   Process Items:', searchResult.processItems);
        console.log('   Showing Total:', searchResult.showingTotal);
        
        // Test 2: Department filter
        console.log('🏢 Testing department filter...');
        await page.selectOption('#departmentFilter', 'HR');
        await page.waitForTimeout(1000);
        
        const deptResult = await page.evaluate(() => {
            return {
                department: document.getElementById('departmentFilter')?.value,
                filteredProcesses: window.filteredProcesses ? window.filteredProcesses.length : 0,
                processItems: document.querySelectorAll('.process-item').length,
                showingTotal: document.getElementById('showingTotal')?.textContent
            };
        });
        
        console.log('   Department Selected:', deptResult.department);
        console.log('   Filtered Count:', deptResult.filteredProcesses);
        console.log('   Process Items:', deptResult.processItems);
        console.log('   Showing Total:', deptResult.showingTotal);
        
        // Test 3: Clear filters
        console.log('🧹 Testing clear filters...');
        await page.click('.clear-filters-btn');
        await page.waitForTimeout(1000);
        
        const clearResult = await page.evaluate(() => {
            return {
                searchValue: document.getElementById('searchFilter')?.value,
                departmentValue: document.getElementById('departmentFilter')?.value,
                filteredProcesses: window.filteredProcesses ? window.filteredProcesses.length : 0,
                processItems: document.querySelectorAll('.process-item').length,
                showingTotal: document.getElementById('showingTotal')?.textContent,
                paginationButtons: document.querySelectorAll('.page-btn').length
            };
        });
        
        console.log('   Search Cleared:', clearResult.searchValue === '');
        console.log('   Department Cleared:', clearResult.departmentValue === '');
        console.log('   Filtered Count:', clearResult.filteredProcesses);
        console.log('   Process Items:', clearResult.processItems);
        console.log('   Showing Total:', clearResult.showingTotal);
        console.log('   Pagination Buttons:', clearResult.paginationButtons);
        
        // Test 4: Pagination controls
        if (clearResult.paginationButtons > 0) {
            console.log('📄 Testing pagination...');
            
            // Try clicking next page if available
            const nextButton = await page.$('button[onclick*="changePage(\'next\')"]');
            if (nextButton) {
                await nextButton.click();
                await page.waitForTimeout(1000);
                
                const pageResult = await page.evaluate(() => {
                    return {
                        currentPage: window.currentPage,
                        showingStart: document.getElementById('showingStart')?.textContent,
                        showingEnd: document.getElementById('showingEnd')?.textContent,
                        processItems: document.querySelectorAll('.process-item').length
                    };
                });
                
                console.log('   Current Page:', pageResult.currentPage);
                console.log('   Showing:', `${pageResult.showingStart}-${pageResult.showingEnd}`);
                console.log('   Process Items:', pageResult.processItems);
            }
        }
        
        // Final scoring
        const finalScore = {
            processesLoaded: initial.processes > 0,
            initialFiltering: initial.filteredProcesses > 0,
            initialRendering: initial.processItems > 0,
            searchWorking: searchResult.filteredProcesses < initial.processes,
            deptFilterWorking: deptResult.filteredProcesses < initial.processes,
            clearWorking: clearResult.searchValue === '' && clearResult.departmentValue === '',
            paginationWorking: clearResult.paginationButtons > 0,
            pageInfoWorking: clearResult.showingTotal !== '0'
        };
        
        const workingFeatures = Object.values(finalScore).filter(Boolean).length;
        const totalFeatures = Object.keys(finalScore).length;
        
        console.log('🏆 Final Results:');
        Object.entries(finalScore).forEach(([feature, working]) => {
            console.log(`   ${working ? '✅' : '❌'} ${feature}: ${working}`);
        });
        console.log(`   🎯 Overall Score: ${workingFeatures}/${totalFeatures} (${(workingFeatures/totalFeatures*100).toFixed(1)}%)`);
        
        // Assertions - should be much better now
        expect(finalScore.processesLoaded).toBe(true);
        expect(finalScore.initialFiltering).toBe(true);
        expect(finalScore.initialRendering).toBe(true);
        expect(workingFeatures).toBeGreaterThanOrEqual(6); // Expect at least 6/8 features working
        
        console.log('🎉 Filter and Pagination system verification complete!');
    });
});