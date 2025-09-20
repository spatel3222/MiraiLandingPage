const { test, expect } = require('@playwright/test');
const fs = require('fs');

test.describe('Simple Cleanup and Import', () => {
    test('delete test processes and import CSV using UI approach', async ({ page }) => {
        console.log('🧹 Cleaning up test processes and importing real data...');
        
        // Navigate to dashboard
        await page.goto('http://localhost:8000/workshops/business-automation-dashboard.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000);
        
        // Clear test processes from current project using existing dashboard functions
        const clearResult = await page.evaluate(() => {
            // Get current processes
            const currentProcesses = window.processes || [];
            const testProcesses = currentProcesses.filter(p => p.name && p.name.includes('Test Process'));
            
            console.log(`🗑️ Found ${testProcesses.length} test processes to delete`);
            
            // Delete test processes one by one
            let deletedCount = 0;
            const deletePromises = testProcesses.map(async (process) => {
                try {
                    if (window.workshopDB && window.workshopDB.isConnected()) {
                        await window.workshopDB.deleteProcess(process.id);
                        deletedCount++;
                        console.log('✅ Deleted test process:', process.name);
                    }
                } catch (error) {
                    console.error('❌ Failed to delete process:', process.name, error);
                }
            });
            
            return Promise.all(deletePromises).then(() => ({
                success: true,
                deletedCount: deletedCount,
                totalTestProcesses: testProcesses.length
            }));
        });
        
        console.log('🧹 Clear result:', await clearResult);
        
        // Wait a bit for deletions to complete
        await page.waitForTimeout(2000);
        
        // Refresh to reload current state
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        // Now use the bulk upload feature
        console.log('📥 Starting bulk upload...');
        
        // Click the bulk upload button
        await page.click('button:has-text("Bulk Upload")');
        await page.waitForTimeout(1000);
        
        // Wait for the modal to appear
        await page.waitForSelector('#bulkUploadModal', { state: 'visible' });
        
        // Upload the CSV file
        const fileInput = await page.locator('#csvFileInput');
        await fileInput.setInputFiles('/Users/shivangpatel/Documents/GitHub/crtx.in/icd_all_processes_complete.csv');
        
        // Wait for file processing
        await page.waitForTimeout(2000);
        
        // Click import button
        await page.click('#importProcessesBtn');
        
        // Wait for import to complete
        await page.waitForTimeout(5000);
        
        // Check if import was successful
        const importStatus = await page.evaluate(() => {
            // Check if modal is still open or if there are success messages
            const modal = document.getElementById('bulkUploadModal');
            const isModalOpen = modal && modal.style.display !== 'none';
            
            return {
                modalOpen: isModalOpen,
                processCount: window.processes ? window.processes.length : 0,
                firstFewProcesses: window.processes ? window.processes.slice(0, 3).map(p => p.name) : []
            };
        });
        
        console.log('📊 Import status:', importStatus);
        
        // Close modal if still open
        if (importStatus.modalOpen) {
            await page.click('.modal-close, button:has-text("Close")');
        }
        
        // Final verification after page refresh
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        const finalCheck = await page.evaluate(() => {
            return {
                processCount: window.processes ? window.processes.length : 0,
                sampleProcesses: window.processes ? window.processes.slice(0, 5).map(p => ({
                    name: p.name,
                    department: p.department
                })) : [],
                departments: window.processes ? [...new Set(window.processes.map(p => p.department))] : []
            };
        });
        
        console.log('🔍 Final verification:', finalCheck);
        
        // Assertions
        expect(finalCheck.processCount).toBeGreaterThan(50); // Should have imported most of the 89 processes
        expect(finalCheck.departments.length).toBeGreaterThanOrEqual(4); // Should have multiple departments
        
        console.log('🎉 Successfully cleaned and imported real processes!');
    });
});