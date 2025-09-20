const { test, expect } = require('@playwright/test');

test.describe('Verify Filter and Pagination Features', () => {
    test('check if filter and pagination functions exist in code', async ({ page }) => {
        console.log('🔍 Verifying filter and pagination implementation...');
        
        // Navigate to dashboard
        await page.goto('http://localhost:8000/workshops/business-automation-dashboard.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
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
        
        await page.waitForTimeout(2000);
        
        // Check if the filtering and pagination elements exist
        const implementationCheck = await page.evaluate(() => {
            const elements = {
                // Filter elements
                searchInput: document.getElementById('processSearchInput'),
                departmentFilter: document.getElementById('departmentFilter'),
                impactSlider: document.getElementById('impactScoreFilter'),
                feasibilitySlider: document.getElementById('feasibilityScoreFilter'),
                automationSlider: document.getElementById('automationScoreFilter'),
                clearButton: document.querySelector('.clear-filters-btn'),
                filterCounter: document.querySelector('.filter-counter'),
                
                // Pagination elements
                itemsPerPage: document.getElementById('itemsPerPage'),
                paginationControls: document.querySelector('.pagination-controls'),
                pageInfo: document.querySelector('.page-info'),
                pageButtons: document.querySelectorAll('.page-btn'),
                
                // Check if functions exist
                functions: {
                    filterProcesses: typeof filterProcesses === 'function',
                    applyFilters: typeof applyFilters === 'function',
                    updatePagination: typeof updatePagination === 'function',
                    changePage: typeof changePage === 'function',
                    clearFilters: typeof clearFilters === 'function'
                }
            };
            
            return {
                // UI Elements
                hasSearchInput: !!elements.searchInput,
                hasDepartmentFilter: !!elements.departmentFilter,
                hasScoreSliders: !!(elements.impactSlider && elements.feasibilitySlider && elements.automationSlider),
                hasClearButton: !!elements.clearButton,
                hasFilterCounter: !!elements.filterCounter,
                hasItemsPerPage: !!elements.itemsPerPage,
                hasPaginationControls: !!elements.paginationControls,
                hasPageInfo: !!elements.pageInfo,
                pageButtonCount: elements.pageButtons.length,
                
                // Functions
                functions: elements.functions,
                functionsImplemented: Object.values(elements.functions).filter(f => f).length,
                totalFunctions: Object.keys(elements.functions).length,
                
                // Process workspace elements
                workspaceVisible: !!document.querySelector('.workspace-container'),
                processListVisible: !!document.getElementById('processWorkspaceList')
            };
        });
        
        console.log('📊 Implementation Check Results:');
        console.log('   🔍 Search Input:', implementationCheck.hasSearchInput ? '✅' : '❌');
        console.log('   🏢 Department Filter:', implementationCheck.hasDepartmentFilter ? '✅' : '❌');
        console.log('   📈 Score Sliders:', implementationCheck.hasScoreSliders ? '✅' : '❌');
        console.log('   🧹 Clear Button:', implementationCheck.hasClearButton ? '✅' : '❌');
        console.log('   📊 Filter Counter:', implementationCheck.hasFilterCounter ? '✅' : '❌');
        console.log('   📄 Items Per Page:', implementationCheck.hasItemsPerPage ? '✅' : '❌');
        console.log('   📋 Pagination Controls:', implementationCheck.hasPaginationControls ? '✅' : '❌');
        console.log('   ℹ️ Page Info:', implementationCheck.hasPageInfo ? '✅' : '❌');
        console.log('   🔢 Page Buttons:', `${implementationCheck.pageButtonCount} buttons`);
        console.log('   ⚙️ Functions:', `${implementationCheck.functionsImplemented}/${implementationCheck.totalFunctions} implemented`);
        console.log('   📱 Workspace Visible:', implementationCheck.workspaceVisible ? '✅' : '❌');
        console.log('   📝 Process List Visible:', implementationCheck.processListVisible ? '✅' : '❌');
        
        // Check individual functions
        Object.entries(implementationCheck.functions).forEach(([name, exists]) => {
            console.log(`   📎 ${name}:`, exists ? '✅' : '❌');
        });
        
        // Calculate overall implementation score
        const uiElementsScore = [
            implementationCheck.hasSearchInput,
            implementationCheck.hasDepartmentFilter,
            implementationCheck.hasScoreSliders,
            implementationCheck.hasClearButton,
            implementationCheck.hasFilterCounter,
            implementationCheck.hasItemsPerPage,
            implementationCheck.hasPaginationControls,
            implementationCheck.hasPageInfo
        ].filter(Boolean).length;
        
        const totalUIElements = 8;
        const overallScore = ((uiElementsScore / totalUIElements) + 
                            (implementationCheck.functionsImplemented / implementationCheck.totalFunctions)) / 2;
        
        console.log(`🎯 Overall Implementation Score: ${(overallScore * 100).toFixed(1)}%`);
        console.log(`   UI Elements: ${uiElementsScore}/${totalUIElements}`);
        console.log(`   Functions: ${implementationCheck.functionsImplemented}/${implementationCheck.totalFunctions}`);
        
        if (overallScore >= 0.8) {
            console.log('🎉 Filter and Pagination features are well implemented!');
        } else if (overallScore >= 0.5) {
            console.log('⚠️ Filter and Pagination features are partially implemented.');
        } else {
            console.log('❌ Filter and Pagination features need more work.');
        }
        
        // Expectations
        expect(implementationCheck.workspaceVisible || workspaceResult.success).toBe(true);
        expect(overallScore).toBeGreaterThan(0.3); // At least 30% implementation
    });
});