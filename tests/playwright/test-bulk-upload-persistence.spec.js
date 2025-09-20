const { test, expect } = require('@playwright/test');

test.describe('Bulk Upload Supabase Persistence Test', () => {
    test('verify bulk upload saves data to Supabase correctly', async ({ page }) => {
        console.log('🚀 Testing bulk upload Supabase persistence...');
        
        // Navigate to dashboard
        await page.goto('http://localhost:8000/workshops/business-automation-dashboard.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // Wait for dashboard initialization
        console.log('⏳ Waiting for dashboard initialization...');
        await page.waitForFunction(() => {
            return window.currentProjectId && window.projects && window.projects.length > 0;
        }, { timeout: 10000 });
        
        const currentProject = await page.evaluate(() => window.currentProjectId);
        console.log('📋 Current project:', currentProject);
        
        // Verify we're in Supabase mode
        const storageMode = await page.evaluate(() => getPreferredStorageMode());
        console.log('💾 Storage mode:', storageMode);
        
        if (storageMode !== 'supabase') {
            console.log('⚠️ Switching to Supabase mode...');
            await page.locator('input[name="storageMode"][value="supabase"]').check();
            await page.waitForTimeout(1000);
        }
        
        // Get initial process count
        const initialProcessCount = await page.evaluate(async () => {
            if (window.workshopDB && window.workshopDB.isConnected()) {
                const supabaseProcesses = await window.workshopDB.getProcessesByProject(window.currentProjectId);
                return supabaseProcesses ? supabaseProcesses.length : 0;
            }
            return 0;
        });
        console.log(`📊 Initial Supabase process count: ${initialProcessCount}`);
        
        // Navigate to Process Management workspace
        await page.locator('#workspace-nav-processes').click();
        await page.waitForTimeout(1000);
        
        // Look for bulk upload button
        const bulkUploadButton = page.locator('button:has-text("Bulk Upload")');
        await expect(bulkUploadButton).toBeVisible({ timeout: 5000 });
        
        // Click bulk upload button
        await bulkUploadButton.click();
        await page.waitForTimeout(1000);
        
        // Verify modal opens
        const modal = page.locator('.modal-overlay');
        await expect(modal).toBeVisible();
        console.log('✅ Bulk upload modal opened');
        
        // Create test CSV content
        const testCsvContent = `department,name,description,impact,feasibility,timeSpent
HR,Test Bulk Process 1,Test description for process 1,8,7,5
Finance,Test Bulk Process 2,Test description for process 2,9,8,3
Operations,Test Bulk Process 3,Test description for process 3,7,9,4`;
        
        // Create a test CSV file
        const csvBlob = new Blob([testCsvContent], { type: 'text/csv' });
        const csvFile = new File([csvBlob], 'test_processes.csv', { type: 'text/csv' });
        
        // Upload the file
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles({
            name: 'test_processes.csv',
            mimeType: 'text/csv',
            buffer: Buffer.from(testCsvContent)
        });
        
        console.log('📁 CSV file uploaded');
        await page.waitForTimeout(2000);
        
        // Check if file was processed
        const processedRows = await page.evaluate(() => {
            return window.uploadedData ? window.uploadedData.length : 0;
        });
        console.log(`📋 Processed ${processedRows} rows from CSV`);
        
        if (processedRows > 0) {
            // Proceed to import step
            const continueButton = page.locator('button:has-text("Continue to Import")');
            if (await continueButton.isVisible()) {
                await continueButton.click();
                await page.waitForTimeout(1000);
            }
            
            // Start import
            const importButton = page.locator('button:has-text("Start Import")');
            if (await importButton.isVisible()) {
                console.log('🚀 Starting import process...');
                await importButton.click();
                
                // Wait for import to complete
                await page.waitForFunction(() => {
                    const importStatus = document.querySelector('.import-status');
                    return importStatus && importStatus.textContent.includes('completed');
                }, { timeout: 30000 });
                
                console.log('✅ Import completed');
                
                // Wait a moment for data to save
                await page.waitForTimeout(3000);
                
                // Close modal
                const closeButton = page.locator('button:has-text("Close")');
                if (await closeButton.isVisible()) {
                    await closeButton.click();
                    await page.waitForTimeout(1000);
                }
                
                // Check final process count in Supabase
                const finalProcessCount = await page.evaluate(async () => {
                    if (window.workshopDB && window.workshopDB.isConnected()) {
                        const supabaseProcesses = await window.workshopDB.getProcessesByProject(window.currentProjectId);
                        return supabaseProcesses ? supabaseProcesses.length : 0;
                    }
                    return 0;
                });
                
                console.log(`📊 Final Supabase process count: ${finalProcessCount}`);
                console.log(`➕ Processes added: ${finalProcessCount - initialProcessCount}`);
                
                // Verify processes were actually saved to Supabase
                const savedProcesses = await page.evaluate(async () => {
                    if (window.workshopDB && window.workshopDB.isConnected()) {
                        const allProcesses = await window.workshopDB.getProcessesByProject(window.currentProjectId);
                        return allProcesses.filter(p => p.name && p.name.includes('Test Bulk Process'));
                    }
                    return [];
                });
                
                console.log(`🔍 Found ${savedProcesses.length} test processes in Supabase`);
                
                if (savedProcesses.length > 0) {
                    console.log('✅ SUCCESS: Bulk upload processes saved to Supabase');
                    console.log('📋 Saved processes:', savedProcesses.map(p => p.name));
                } else {
                    console.log('❌ FAILURE: No test processes found in Supabase');
                }
                
                // Refresh the dashboard to see if processes appear
                await page.reload();
                await page.waitForLoadState('networkidle');
                await page.waitForTimeout(3000);
                
                // Navigate back to processes workspace
                await page.locator('#workspace-nav-processes').click();
                await page.waitForTimeout(2000);
                
                // Check if processes appear in UI
                const processTable = page.locator('#process-list');
                const visibleProcesses = await processTable.locator('tr').count();
                console.log(`👁️ Visible processes in UI: ${visibleProcesses}`);
                
                expect(finalProcessCount).toBeGreaterThan(initialProcessCount);
                expect(savedProcesses.length).toBeGreaterThan(0);
                
            } else {
                console.log('❌ Import button not found');
            }
        } else {
            console.log('❌ No rows processed from CSV');
        }
    });
});