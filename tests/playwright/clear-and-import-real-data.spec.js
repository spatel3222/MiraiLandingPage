const { test, expect } = require('@playwright/test');
const fs = require('fs');

test.describe('Clear Test Data and Import Real CSV', () => {
    test('clear test processes and import real 89-process CSV', async ({ page }) => {
        console.log('🧹 Clearing test data and importing real processes...');
        
        // Navigate to dashboard
        await page.goto('http://localhost:8000/workshops/business-automation-dashboard.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000);
        
        // Wait for projects to load
        await page.waitForFunction(() => {
            return window.projects && window.projects.length > 0;
        }, { timeout: 10000 });
        
        // Find the Thar project and clear its processes
        const clearResult = await page.evaluate(async () => {
            // Find Thar project
            const tharProject = window.projects.find(p => p.name === 'Thar');
            if (!tharProject) {
                return { error: 'Thar project not found' };
            }
            
            console.log('🎯 Found Thar project:', tharProject.id);
            
            // Set as current project
            window.currentProjectId = tharProject.id;
            
            // Clear all processes for this project
            const preferredStorageMode = getPreferredStorageMode();
            
            if (preferredStorageMode === 'supabase' && window.workshopDB && window.workshopDB.isConnected()) {
                try {
                    // Get all processes for this project
                    const processes = await window.workshopDB.getProcessesByProject(tharProject.id);
                    console.log(`🗑️ Found ${processes.length} processes to delete in Thar project`);
                    
                    // Delete each process
                    let deletedCount = 0;
                    for (const process of processes) {
                        try {
                            await window.workshopDB.deleteProcess(process.id);
                            deletedCount++;
                        } catch (error) {
                            console.error('Failed to delete process:', process.id, error);
                        }
                    }
                    
                    // Clear local processes array
                    window.processes = [];
                    
                    return { 
                        success: true, 
                        deletedCount: deletedCount,
                        totalFound: processes.length 
                    };
                } catch (error) {
                    return { error: error.message };
                }
            } else {
                // Clear from localStorage
                const storageKey = `processes_${tharProject.id}`;
                const existingProcesses = JSON.parse(localStorage.getItem(storageKey) || '[]');
                localStorage.removeItem(storageKey);
                window.processes = [];
                
                return { 
                    success: true, 
                    deletedCount: existingProcesses.length,
                    totalFound: existingProcesses.length,
                    storage: 'localStorage'
                };
            }
        });
        
        console.log('🧹 Clear result:', clearResult);
        
        if (clearResult.error) {
            throw new Error(`Failed to clear processes: ${clearResult.error}`);
        }
        
        console.log(`✅ Cleared ${clearResult.deletedCount} test processes from Thar project`);
        
        // Now import the real CSV data
        const csvContent = fs.readFileSync('/Users/shivangpatel/Documents/GitHub/crtx.in/icd_all_processes_complete.csv', 'utf8');
        
        const importResult = await page.evaluate(async (csvData) => {
            try {
                // Parse the CSV
                const parseResult = Papa.parse(csvData, {
                    header: true,
                    skipEmptyLines: true,
                    dynamicTyping: false
                });
                
                if (parseResult.errors && parseResult.errors.length > 0) {
                    return { error: 'CSV parsing failed', parseErrors: parseResult.errors };
                }
                
                const data = parseResult.data;
                console.log(`📊 Parsed ${data.length} processes from CSV`);
                
                // Import using the bulk upload function
                const bulkResult = await processBulkUpload(data);
                
                return {
                    success: true,
                    totalRows: data.length,
                    imported: bulkResult.success,
                    failed: bulkResult.failed,
                    errors: bulkResult.errors
                };
            } catch (error) {
                return { error: error.message };
            }
        }, csvContent);
        
        console.log('📥 Import result:', importResult);
        
        if (importResult.error) {
            throw new Error(`Failed to import CSV: ${importResult.error}`);
        }
        
        console.log(`✅ Successfully imported ${importResult.imported}/${importResult.totalRows} processes`);
        
        if (importResult.failed > 0) {
            console.log(`⚠️ ${importResult.failed} processes failed to import`);
            if (importResult.errors && importResult.errors.length > 0) {
                console.log('❌ Import errors:', importResult.errors.slice(0, 5));
            }
        }
        
        // Refresh the page to see the new data
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        // Verify the new processes are loaded
        const verifyResult = await page.evaluate(() => {
            return {
                currentProject: window.currentProjectId,
                processCount: window.processes ? window.processes.length : 0,
                firstFewProcesses: window.processes ? window.processes.slice(0, 3).map(p => p.name) : [],
                departments: window.processes ? [...new Set(window.processes.map(p => p.department))] : []
            };
        });
        
        console.log('🔍 Verification result:', verifyResult);
        
        // Assertions
        expect(clearResult.success).toBe(true);
        expect(importResult.success).toBe(true);
        expect(importResult.imported).toBeGreaterThan(0);
        
        console.log('🎉 Successfully cleared test data and imported real processes!');
    });
});