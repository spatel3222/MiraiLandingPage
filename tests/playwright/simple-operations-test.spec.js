const { test, expect } = require('@playwright/test');

test.describe('Simple Operations Filter Test', () => {
    test('test Operations filter with console logging', async ({ page }) => {
        console.log('🧪 Simple Operations filter test...');
        
        // Navigate to dashboard
        await page.goto('http://localhost:8000/workshops/business-automation-dashboard.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000);
        
        // Listen to console logs
        page.on('console', msg => {
            if (msg.text().includes('🔧')) {
                console.log('   Browser:', msg.text());
            }
        });
        
        // Open Process Management workspace
        await page.evaluate(() => {
            if (typeof openProcessWorkspace === 'function') {
                openProcessWorkspace();
            }
        });
        
        await page.waitForTimeout(3000);
        
        // Test Operations filter
        console.log('🔍 Selecting Operations...');
        await page.selectOption('#departmentFilter', 'Operations');
        await page.waitForTimeout(2000);
        
        const result = await page.evaluate(() => {
            return {
                departmentValue: document.getElementById('departmentFilter')?.value,
                processes: window.processes ? window.processes.length : 0,
                filteredProcesses: window.filteredProcesses ? window.filteredProcesses.length : 0,
                processItems: document.querySelectorAll('.process-item').length,
                currentFilters: window.currentFilters,
                showingTotal: document.getElementById('showingTotal')?.textContent
            };
        });
        
        console.log('📊 Results:');
        console.log('   Department:', result.departmentValue);
        console.log('   Total Processes:', result.processes);
        console.log('   Filtered Processes:', result.filteredProcesses);
        console.log('   DOM Process Items:', result.processItems);
        console.log('   Current Filters:', result.currentFilters);
        console.log('   Showing Total:', result.showingTotal);
        
        // Simple assertion
        const isWorking = result.filteredProcesses === 50 || result.processItems === 50;
        console.log('✅ Operations filter working:', isWorking);
        
        expect(result.processes).toBe(98);
        expect(isWorking).toBe(true);
    });
});