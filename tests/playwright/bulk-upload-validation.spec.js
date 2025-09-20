const { test, expect } = require('@playwright/test');

test.describe('Bulk Upload Validation', () => {
    test('validate bulk upload functionality through direct API calls', async ({ page }) => {
        console.log('🔍 Starting bulk upload validation...');
        
        // Navigate to dashboard
        await page.goto('http://localhost:8000/workshops/business-automation-dashboard.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000);
        
        // Test CSV parsing functionality
        console.log('📋 Testing CSV parsing functionality...');
        const csvData = `department,name,description,impact,feasibility,timeSpent
HR,Test Process 1,Test description for process 1,8,7,5
Finance,Test Process 2,Test description for process 2,9,8,3
Operations,Test Process 3,Test description for process 3,7,9,4`;
        
        const parsedData = await page.evaluate((csvContent) => {
            // Test if Papa Parse is available
            if (typeof Papa === 'undefined') {
                return { error: 'Papa Parse library not available' };
            }
            
            try {
                const result = Papa.parse(csvContent, {
                    header: true,
                    skipEmptyLines: true,
                    dynamicTyping: true
                });
                
                return {
                    success: true,
                    data: result.data,
                    rowCount: result.data.length,
                    columns: Object.keys(result.data[0] || {})
                };
            } catch (error) {
                return { error: error.message };
            }
        }, csvData);
        
        console.log('📊 CSV Parse Result:', parsedData);
        expect(parsedData.success).toBe(true);
        expect(parsedData.rowCount).toBe(3);
        expect(parsedData.columns).toContain('department');
        expect(parsedData.columns).toContain('name');
        
        // Test bulk upload functions exist
        console.log('🔧 Testing bulk upload function availability...');
        const functionChecks = await page.evaluate(() => {
            const functions = {
                downloadCSVTemplate: typeof downloadCSVTemplate === 'function',
                openBulkUploadModal: typeof openBulkUploadModal === 'function',
                closeBulkUploadModal: typeof closeBulkUploadModal === 'function',
                processBulkUpload: typeof processBulkUpload === 'function',
                importSingleProcess: typeof importSingleProcess === 'function'
            };
            
            return functions;
        });
        
        console.log('⚙️ Function availability:', functionChecks);
        expect(functionChecks.downloadCSVTemplate).toBe(true);
        expect(functionChecks.openBulkUploadModal).toBe(true);
        expect(functionChecks.processBulkUpload).toBe(true);
        expect(functionChecks.importSingleProcess).toBe(true);
        
        // Test CSV template generation
        console.log('📥 Testing CSV template generation...');
        const templateTest = await page.evaluate(() => {
            try {
                // This should trigger the download - we'll just check it doesn't throw
                downloadCSVTemplate();
                return { success: true };
            } catch (error) {
                return { error: error.message };
            }
        });
        
        console.log('📄 Template generation result:', templateTest);
        expect(templateTest.success).toBe(true);
        
        // Test data persistence simulation
        console.log('💾 Testing data persistence functionality...');
        const persistenceTest = await page.evaluate(async (testProcesses) => {
            // Ensure we have a current project
            if (!window.currentProjectId && window.projects && window.projects.length > 0) {
                window.currentProjectId = window.projects[0].id;
                localStorage.setItem('currentProjectId', window.currentProjectId);
            }
            
            if (!window.currentProjectId) {
                return { error: 'No current project available' };
            }
            
            const results = [];
            
            // Test bulk upload processing
            try {
                const bulkResults = await processBulkUpload(testProcesses);
                results.push({
                    process: 'Bulk Upload',
                    success: bulkResults.success > 0,
                    result: `${bulkResults.success} imported, ${bulkResults.failed} failed`,
                    details: bulkResults
                });
            } catch (error) {
                results.push({ 
                    process: 'Bulk Upload', 
                    success: false, 
                    error: error.message 
                });
            }
            
            return {
                currentProject: window.currentProjectId,
                results: results,
                totalProcessed: results.length,
                successCount: results.filter(r => r.success).length,
                bulkDetails: results[0] ? results[0].details : null
            };
        }, parsedData.data);
        
        console.log('💾 Persistence test results:', persistenceTest);
        
        // Log detailed error information
        if (persistenceTest.bulkDetails && persistenceTest.bulkDetails.errors) {
            console.log('❌ Import errors:', persistenceTest.bulkDetails.errors);
        }
        
        expect(persistenceTest.currentProject).toBeDefined();
        expect(persistenceTest.totalProcessed).toBe(1); // Only one bulk operation
        // For now, let's check if bulk upload ran (even if processes failed)
        const bulkRan = persistenceTest.results.some(r => r.process === 'Bulk Upload');
        expect(bulkRan).toBe(true);
        
        // Test Supabase connectivity
        console.log('🌐 Testing Supabase connectivity...');
        const supabaseTest = await page.evaluate(() => {
            if (window.workshopDB) {
                return {
                    available: true,
                    connected: window.workshopDB.isConnected(),
                    hasSubmitProcess: typeof window.workshopDB.submitProcess === 'function',
                    hasGetProcesses: typeof window.workshopDB.getProcessesByProject === 'function'
                };
            }
            return { available: false };
        });
        
        console.log('🗄️ Supabase status:', supabaseTest);
        expect(supabaseTest.available).toBe(true);
        
        // Final validation summary
        console.log('✅ Bulk Upload Validation Summary:');
        console.log(`   📊 CSV Parsing: ${parsedData.success ? '✅' : '❌'}`);
        console.log(`   ⚙️ Functions Available: ${Object.values(functionChecks).every(f => f) ? '✅' : '❌'}`);
        console.log(`   📥 Template Generation: ${templateTest.success ? '✅' : '❌'}`);
        console.log(`   💾 Data Persistence: ${persistenceTest.successCount > 0 ? '✅' : '❌'}`);
        console.log(`   🌐 Supabase Integration: ${supabaseTest.available ? '✅' : '❌'}`);
        
        const overallSuccess = parsedData.success && 
                              Object.values(functionChecks).every(f => f) && 
                              templateTest.success && 
                              persistenceTest.successCount > 0 && 
                              supabaseTest.available;
        
        console.log(`🎯 Overall Bulk Upload Status: ${overallSuccess ? '✅ READY' : '❌ NEEDS FIXES'}`);
        
        expect(overallSuccess).toBe(true);
    });
});