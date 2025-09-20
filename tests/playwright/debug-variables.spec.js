const { test, expect } = require('@playwright/test');

test.describe('Debug Variables and Scoping', () => {
    test('debug variable values and timing', async ({ page }) => {
        console.log('🔬 Deep debugging variables and function calls...');
        
        // Navigate to dashboard
        await page.goto('http://localhost:8000/workshops/business-automation-dashboard.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000);
        
        // Check initial state
        const initialState = await page.evaluate(() => {
            return {
                processes: window.processes ? window.processes.length : 0,
                processesFirst3: window.processes ? window.processes.slice(0, 3).map(p => ({name: p.name, department: p.department})) : [],
                filteredProcesses: window.filteredProcesses ? window.filteredProcesses.length : 'undefined',
                currentPage: window.currentPage,
                itemsPerPage: window.itemsPerPage
            };
        });
        
        console.log('📊 Initial State (before workspace open):');
        console.log('   Processes:', initialState.processes);
        console.log('   Filtered Processes:', initialState.filteredProcesses);
        console.log('   Current Page:', initialState.currentPage);
        console.log('   Items Per Page:', initialState.itemsPerPage);
        console.log('   First 3 processes:', initialState.processesFirst3);
        
        // Open Process Management workspace
        await page.evaluate(() => {
            if (typeof openProcessWorkspace === 'function') {
                openProcessWorkspace();
            }
        });
        
        await page.waitForTimeout(2000);
        
        // Check state after opening workspace
        const afterWorkspace = await page.evaluate(() => {
            return {
                processes: window.processes ? window.processes.length : 0,
                filteredProcesses: window.filteredProcesses ? window.filteredProcesses.length : 'undefined',
                currentPage: window.currentPage,
                itemsPerPage: window.itemsPerPage,
                itemsPerPageType: typeof window.itemsPerPage
            };
        });
        
        console.log('📊 After Workspace Open:');
        console.log('   Processes:', afterWorkspace.processes);
        console.log('   Filtered Processes:', afterWorkspace.filteredProcesses);
        console.log('   Current Page:', afterWorkspace.currentPage);
        console.log('   Items Per Page:', afterWorkspace.itemsPerPage);
        console.log('   Items Per Page Type:', afterWorkspace.itemsPerPageType);
        
        // Manually call initializeFilters and check what happens
        const manualInit = await page.evaluate(() => {
            console.log('🔄 Manually calling initializeFilters...');
            
            const beforeInit = {
                processes: window.processes ? window.processes.length : 0,
                filteredProcesses: window.filteredProcesses ? window.filteredProcesses.length : 'undefined'
            };
            
            // Call initializeFilters manually
            if (typeof initializeFilters === 'function') {
                try {
                    initializeFilters();
                } catch (error) {
                    console.error('Error in initializeFilters:', error);
                    return { error: error.message, beforeInit };
                }
            }
            
            const afterInit = {
                processes: window.processes ? window.processes.length : 0,
                filteredProcesses: window.filteredProcesses ? window.filteredProcesses.length : 'undefined',
                currentPage: window.currentPage,
                itemsPerPage: window.itemsPerPage
            };
            
            return { beforeInit, afterInit, success: true };
        });
        
        console.log('🔄 Manual initializeFilters Result:');
        if (manualInit.error) {
            console.log('   Error:', manualInit.error);
        } else {
            console.log('   Before Init - Processes:', manualInit.beforeInit.processes);
            console.log('   Before Init - Filtered:', manualInit.beforeInit.filteredProcesses);
            console.log('   After Init - Processes:', manualInit.afterInit.processes);
            console.log('   After Init - Filtered:', manualInit.afterInit.filteredProcesses);
            console.log('   After Init - Current Page:', manualInit.afterInit.currentPage);
            console.log('   After Init - Items Per Page:', manualInit.afterInit.itemsPerPage);
        }
        
        // Check the DOM elements
        const domCheck = await page.evaluate(() => {
            const itemsPerPageSelect = document.getElementById('itemsPerPage');
            const itemsPerPageTopSelect = document.getElementById('itemsPerPageTop');
            
            return {
                itemsPerPageExists: !!itemsPerPageSelect,
                itemsPerPageValue: itemsPerPageSelect ? itemsPerPageSelect.value : null,
                itemsPerPageTopExists: !!itemsPerPageTopSelect,
                itemsPerPageTopValue: itemsPerPageTopSelect ? itemsPerPageTopSelect.value : null,
                processListExists: !!document.getElementById('processWorkspaceList'),
                processItems: document.querySelectorAll('.process-item').length
            };
        });
        
        console.log('🎯 DOM Elements:');
        console.log('   itemsPerPage select exists:', domCheck.itemsPerPageExists);
        console.log('   itemsPerPage value:', domCheck.itemsPerPageValue);
        console.log('   itemsPerPageTop select exists:', domCheck.itemsPerPageTopExists);
        console.log('   itemsPerPageTop value:', domCheck.itemsPerPageTopValue);
        console.log('   Process list exists:', domCheck.processListExists);
        console.log('   Process items count:', domCheck.processItems);
    });
});