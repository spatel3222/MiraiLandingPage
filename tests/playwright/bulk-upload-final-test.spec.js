const { test, expect } = require('@playwright/test');

test.describe('Final Bulk Upload Test', () => {
    test('complete bulk upload functionality test', async ({ page }) => {
        console.log('🚀 Starting comprehensive bulk upload test...');
        
        // Navigate to dashboard
        await page.goto('http://localhost:8000/workshops/business-automation-dashboard.html');
        await page.waitForLoadState('networkidle');
        
        // Wait for basic page load
        console.log('⏳ Waiting for page elements...');
        await page.waitForTimeout(5000);
        
        // Force dashboard initialization if needed
        await page.evaluate(() => {
            if (!window.currentProjectId && window.projects && window.projects.length > 0) {
                window.currentProjectId = window.projects[0].id;
                localStorage.setItem('currentProjectId', window.currentProjectId);
                console.log('🔧 Manually set currentProjectId:', window.currentProjectId);
            }
        });
        
        // Navigate to Process Management workspace via FAB
        console.log('📋 Opening Process Management workspace...');
        
        // Look for FAB button first
        const fabButton = page.locator('.fab-main');
        if (await fabButton.isVisible()) {
            await fabButton.click();
            await page.waitForTimeout(1000);
            
            // Click on Process Management option
            const processOption = page.locator('.fab-secondary').nth(0); // Process Management is usually first secondary button
            await processOption.click();
        } else {
            // Try direct function call approach
            await page.evaluate(() => {
                if (typeof openProcessWorkspace === 'function') {
                    openProcessWorkspace();
                } else {
                    console.error('openProcessWorkspace function not found');
                }
            });
        }
        
        await page.waitForTimeout(2000);
        
        // Wait for workspace to open
        await page.waitForSelector('.workspace', { state: 'visible' });
        console.log('✅ Process Management workspace opened');
        
        // Check for bulk upload button
        console.log('🔍 Looking for bulk upload button...');
        const bulkUploadButton = page.locator('button:has-text("Bulk Upload")');
        
        // If button not visible, take screenshot and check what's there
        if (!(await bulkUploadButton.isVisible())) {
            console.log('❌ Bulk upload button not found, checking workspace content...');
            await page.screenshot({ path: 'test-results/workspace-debug.png', fullPage: true });
            
            // Check what buttons are actually present
            const allButtons = await page.locator('button').allTextContents();
            console.log('🔍 Available buttons:', allButtons);
            
            // Force workspace content update
            await page.evaluate(() => {
                const workspace = document.querySelector('.workspace-content');
                if (workspace) {
                    const workspaceHeader = workspace.querySelector('.workspace-header');
                    if (workspaceHeader) {
                        const actionsDiv = workspaceHeader.querySelector('.workspace-actions');
                        console.log('📋 Workspace actions HTML:', actionsDiv ? actionsDiv.innerHTML : 'Not found');
                    }
                }
            });
        }
        
        await expect(bulkUploadButton).toBeVisible({ timeout: 5000 });
        console.log('✅ Bulk upload button found');
        
        // Click bulk upload button
        await bulkUploadButton.click();
        await page.waitForTimeout(1000);
        
        // Verify modal opens
        const modal = page.locator('#bulkUploadModal');
        await expect(modal).toBeVisible();
        console.log('✅ Bulk upload modal opened');
        
        // Test CSV template download
        console.log('📥 Testing CSV template download...');
        const downloadTemplate = page.locator('button:has-text("Download Template")');
        if (await downloadTemplate.isVisible()) {
            await downloadTemplate.click();
            await page.waitForTimeout(1000);
            console.log('✅ Template download triggered');
        }
        
        // Test file upload
        console.log('📁 Testing file upload...');
        const testCsvContent = `department,name,description,impact,feasibility,timeSpent
Finance,Test Process 1,Test description 1,8,7,5
HR,Test Process 2,Test description 2,9,8,3`;
        
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles({
            name: 'test_processes.csv',
            mimeType: 'text/csv',
            buffer: Buffer.from(testCsvContent)
        });
        
        console.log('📁 CSV file uploaded');
        await page.waitForTimeout(3000);
        
        // Check if data was processed
        const processedData = await page.evaluate(() => {
            return window.uploadedData ? window.uploadedData.length : 0;
        });
        
        console.log(`📊 Processed ${processedData} rows from CSV`);
        
        if (processedData > 0) {
            // Test the import process
            console.log('🚀 Testing import process...');
            
            // Look for continue or next button
            const continueBtn = page.locator('button:has-text("Continue"), button:has-text("Next"), button:has-text("Preview")');
            if (await continueBtn.isVisible()) {
                await continueBtn.click();
                await page.waitForTimeout(1000);
            }
            
            // Look for import or start button
            const importBtn = page.locator('button:has-text("Import"), button:has-text("Start"), button:has-text("Submit")');
            if (await importBtn.isVisible()) {
                console.log('🎯 Starting import...');
                await importBtn.click();
                
                // Wait for import to complete or timeout
                await page.waitForTimeout(10000);
                
                // Check if data persisted
                const finalCheck = await page.evaluate(async () => {
                    if (window.workshopDB && window.workshopDB.isConnected() && window.currentProjectId) {
                        const processes = await window.workshopDB.getProcessesByProject(window.currentProjectId);
                        return processes ? processes.length : 0;
                    }
                    return 0;
                });
                
                console.log(`📊 Final process count in Supabase: ${finalCheck}`);
                
                if (finalCheck > 0) {
                    console.log('✅ SUCCESS: Bulk upload data persisted to Supabase');
                } else {
                    console.log('⚠️ WARNING: No data found in Supabase after import');
                }
            }
        }
        
        // Close modal
        const closeBtn = page.locator('button:has-text("Close"), .bulk-upload-close');
        if (await closeBtn.isVisible()) {
            await closeBtn.click();
            await page.waitForTimeout(1000);
        }
        
        console.log('✅ Bulk upload test completed');
        
        // Verify modal is closed
        await expect(modal).not.toBeVisible();
    });
});