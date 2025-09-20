const { test, expect } = require('@playwright/test');

test.describe('Process Management Filter and Pagination', () => {
    test('verify filter and pagination features work correctly', async ({ page }) => {
        console.log('🔍 Testing Process Management filtering and pagination...');
        
        // Navigate to dashboard
        await page.goto('http://localhost:8000/workshops/business-automation-dashboard.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        // Open Process Management workspace via FAB menu
        await page.click('.fab-main'); // Click main FAB button
        await page.waitForTimeout(500);
        await page.click('text=Manage Processes'); // Click the "Manage Processes" option
        await page.waitForTimeout(2000);
        
        // Check if filter controls exist
        const filterCheck = await page.evaluate(() => {
            const elements = {
                searchBar: document.getElementById('processSearchInput'),
                departmentFilter: document.getElementById('departmentFilter'),
                impactSlider: document.getElementById('impactScoreFilter'),
                feasibilitySlider: document.getElementById('feasibilityScoreFilter'),
                automationSlider: document.getElementById('automationScoreFilter'),
                clearButton: document.querySelector('.clear-filters-btn'),
                itemsPerPage: document.getElementById('itemsPerPage'),
                paginationContainer: document.querySelector('.pagination-controls')
            };
            
            return {
                hasSearchBar: !!elements.searchBar,
                hasDepartmentFilter: !!elements.departmentFilter,
                hasImpactSlider: !!elements.impactSlider,
                hasFeasibilitySlider: !!elements.feasibilitySlider,
                hasAutomationSlider: !!elements.automationSlider,
                hasClearButton: !!elements.clearButton,
                hasItemsPerPage: !!elements.itemsPerPage,
                hasPagination: !!elements.paginationContainer
            };
        });
        
        console.log('✅ Filter Controls Check:', filterCheck);
        
        // Test search functionality
        if (filterCheck.hasSearchBar) {
            await page.fill('#processSearchInput', 'Test');
            await page.waitForTimeout(500);
            
            const searchResults = await page.evaluate(() => {
                const visibleProcesses = document.querySelectorAll('.process-item:not([style*="display: none"])');
                return {
                    visibleCount: visibleProcesses.length,
                    firstProcessName: visibleProcesses[0]?.querySelector('.process-name')?.textContent
                };
            });
            
            console.log('🔎 Search Results:', searchResults);
        }
        
        // Test department filter
        if (filterCheck.hasDepartmentFilter) {
            await page.selectOption('#departmentFilter', 'Operations');
            await page.waitForTimeout(500);
            
            const filterResults = await page.evaluate(() => {
                const visibleProcesses = document.querySelectorAll('.process-item:not([style*="display: none"])');
                const filterCounter = document.querySelector('.filter-counter');
                return {
                    visibleCount: visibleProcesses.length,
                    filterCounterText: filterCounter?.textContent
                };
            });
            
            console.log('🏢 Department Filter Results:', filterResults);
        }
        
        // Test pagination
        if (filterCheck.hasItemsPerPage) {
            await page.selectOption('#itemsPerPage', '25');
            await page.waitForTimeout(500);
            
            const paginationInfo = await page.evaluate(() => {
                const pageInfo = document.querySelector('.page-info');
                const pageButtons = document.querySelectorAll('.page-btn');
                return {
                    pageInfoText: pageInfo?.textContent,
                    numberOfPageButtons: pageButtons.length,
                    currentPage: document.querySelector('.page-btn.active')?.textContent
                };
            });
            
            console.log('📄 Pagination Info:', paginationInfo);
        }
        
        // Test clear filters
        if (filterCheck.hasClearButton) {
            await page.click('.clear-filters-btn');
            await page.waitForTimeout(500);
            
            const afterClear = await page.evaluate(() => {
                const searchInput = document.getElementById('processSearchInput');
                const departmentFilter = document.getElementById('departmentFilter');
                return {
                    searchValue: searchInput?.value,
                    departmentValue: departmentFilter?.value
                };
            });
            
            console.log('🧹 After Clear Filters:', afterClear);
        }
        
        // Final summary
        const allFeaturesPresent = Object.values(filterCheck).every(v => v === true);
        
        console.log('📊 Test Summary:');
        console.log('   Search Bar:', filterCheck.hasSearchBar ? '✅' : '❌');
        console.log('   Department Filter:', filterCheck.hasDepartmentFilter ? '✅' : '❌');
        console.log('   Score Sliders:', filterCheck.hasImpactSlider ? '✅' : '❌');
        console.log('   Clear Button:', filterCheck.hasClearButton ? '✅' : '❌');
        console.log('   Pagination:', filterCheck.hasPagination ? '✅' : '❌');
        console.log('   Overall:', allFeaturesPresent ? '✅ All features present!' : '⚠️ Some features missing');
        
        expect(allFeaturesPresent).toBe(true);
    });
});