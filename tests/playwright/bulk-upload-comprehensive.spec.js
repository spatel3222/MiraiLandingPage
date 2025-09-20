import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Comprehensive Bulk Upload Testing Suite
 * Tests all aspects of the bulk upload functionality in the Business Automation Dashboard
 */

test.describe('Bulk Upload Functionality - Comprehensive Testing', () => {
  let testDataDir;
  
  test.beforeAll(async () => {
    // Create test data directory and files
    testDataDir = path.join(process.cwd(), 'test-data');
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
    
    // Create valid CSV test file
    const validCSV = `Process Name,Department,Custom Department,Time Spent,Repetitive Score,Data-Driven Score,Rule-Based Score,High Volume Score,Impact Score,Feasibility Score,Process Notes
"Invoice Processing","Finance","","15","9","8","9","8","8","7","Manual invoice processing with error checking"
"Customer Onboarding","Sales","","12","7","6","8","7","9","6","New customer setup process"
"Report Generation","Operations","","8","10","9","7","6","6","9","Weekly reports from multiple systems"
"Inventory Management","Operations","","20","8","7","8","9","7","8","Stock level monitoring and reordering"
"Expense Approval","Finance","","5","6","5","7","5","6","8","Employee expense review workflow"`;
    
    fs.writeFileSync(path.join(testDataDir, 'valid-processes.csv'), validCSV);
    
    // Create invalid CSV files for error testing
    const invalidFormatCSV = `Name,Dept,Time
"Process 1","Finance","15"
"Process 2","Sales","12"`;
    fs.writeFileSync(path.join(testDataDir, 'invalid-format.csv'), invalidFormatCSV);
    
    const invalidScoresCSV = `Process Name,Department,Custom Department,Time Spent,Repetitive Score,Data-Driven Score,Rule-Based Score,High Volume Score,Impact Score,Feasibility Score,Process Notes
"Test Process","Finance","","15","15","8","9","8","8","7","Invalid repetitive score over 10"`;
    fs.writeFileSync(path.join(testDataDir, 'invalid-scores.csv'), invalidScoresCSV);
    
    const emptyCSV = `Process Name,Department,Custom Department,Time Spent,Repetitive Score,Data-Driven Score,Rule-Based Score,High Volume Score,Impact Score,Feasibility Score,Process Notes`;
    fs.writeFileSync(path.join(testDataDir, 'empty.csv'), emptyCSV);
    
    // Create large CSV file for performance testing
    let largeCSV = `Process Name,Department,Custom Department,Time Spent,Repetitive Score,Data-Driven Score,Rule-Based Score,High Volume Score,Impact Score,Feasibility Score,Process Notes\n`;
    for (let i = 1; i <= 100; i++) {
      largeCSV += `"Process ${i}","Department ${i % 5 + 1}","","${10 + (i % 20)}","${(i % 10) + 1}","${(i % 10) + 1}","${(i % 10) + 1}","${(i % 10) + 1}","${(i % 10) + 1}","${(i % 10) + 1}","Test process ${i}"\n`;
    }
    fs.writeFileSync(path.join(testDataDir, 'large-dataset.csv'), largeCSV);
    
    // Create non-CSV file for format testing
    fs.writeFileSync(path.join(testDataDir, 'test-file.txt'), 'This is not a CSV file');
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/workshops/business-automation-dashboard.html');
    await page.waitForLoadState('networkidle');
    
    // Navigate to Process Management workspace
    await page.click('[data-workspace="process-management"]');
    await page.waitForTimeout(1000);
  });

  test.describe('1. Visual Design Testing', () => {
    
    test('should display bulk upload button with correct styling', async ({ page }) => {
      const bulkUploadBtn = page.locator('button:has-text("Bulk Upload")');
      
      await expect(bulkUploadBtn).toBeVisible();
      await expect(bulkUploadBtn).toHaveCSS('background-color', /rgb\(147, 51, 234\)/); // purple-600
      await expect(bulkUploadBtn).toContainText('Bulk Upload');
      
      // Test hover state
      await bulkUploadBtn.hover();
      await expect(bulkUploadBtn).toHaveCSS('background-color', /rgb\(126, 34, 206\)/); // purple-700
      
      // Check icon presence
      const icon = bulkUploadBtn.locator('svg');
      await expect(icon).toBeVisible();
    });

    test('should open modal with correct design and layout', async ({ page }) => {
      await page.click('button:has-text("Bulk Upload")');
      
      const modal = page.locator('#bulkUploadModal');
      await expect(modal).toBeVisible();
      await expect(modal).toHaveClass(/bulk-upload-modal/);
      await expect(modal).toHaveClass(/active/);
      
      // Check modal structure
      const container = modal.locator('.bulk-upload-container');
      await expect(container).toBeVisible();
      
      const header = modal.locator('.bulk-upload-header');
      await expect(header).toBeVisible();
      await expect(header).toContainText('Bulk Upload Processes');
      
      const closeBtn = modal.locator('.bulk-upload-close');
      await expect(closeBtn).toBeVisible();
      
      // Check step progression indicators
      const progressIndicators = modal.locator('.bulk-upload-progress');
      await expect(progressIndicators).toBeVisible();
    });

    test('should display drag-and-drop zone with proper styling', async ({ page }) => {
      await page.click('button:has-text("Bulk Upload")');
      await page.waitForSelector('#uploadStep1.active');
      
      const dropzone = page.locator('#csvDropzone');
      await expect(dropzone).toBeVisible();
      await expect(dropzone).toHaveClass(/upload-dropzone/);
      
      // Check dropzone content
      const icon = dropzone.locator('svg');
      await expect(icon).toBeVisible();
      
      const uploadText = dropzone.locator('text=drag and drop your CSV file here');
      await expect(uploadText).toBeVisible();
      
      const orText = dropzone.locator('text=or click to select');
      await expect(orText).toBeVisible();
    });

    test('should show proper progress indicators', async ({ page }) => {
      await page.click('button:has-text("Bulk Upload")');
      
      // Check step dots
      for (let i = 1; i <= 4; i++) {
        const stepDot = page.locator(`#stepDot${i}`);
        await expect(stepDot).toBeVisible();
      }
      
      // First step should be active
      const activeStep = page.locator('#stepDot1.active');
      await expect(activeStep).toBeVisible();
      
      // Progress bar should be visible
      const progressBar = page.locator('#uploadProgressBar');
      await expect(progressBar).toBeVisible();
    });

    test('should display buttons with correct states', async ({ page }) => {
      await page.click('button:has-text("Bulk Upload")');
      
      // Initial state - step 1
      const backBtn = page.locator('#bulkUploadBack');
      const nextBtn = page.locator('#bulkUploadNext');
      const importBtn = page.locator('#bulkUploadImport');
      const closeBtn = page.locator('#bulkUploadClose');
      
      await expect(backBtn).toBeHidden();
      await expect(nextBtn).toBeVisible();
      await expect(nextBtn).toBeDisabled();
      await expect(importBtn).toBeHidden();
      await expect(closeBtn).toBeHidden();
    });
  });

  test.describe('2. Functionality Testing', () => {
    
    test('should download CSV template successfully', async ({ page }) => {
      // Set up download promise before clicking
      const downloadPromise = page.waitForEvent('download');
      
      await page.click('button:has-text("Download Template")');
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toBe('process_template.csv');
      
      // Verify notification appears
      const notification = page.locator('.notification:has-text("CSV template downloaded successfully")');
      await expect(notification).toBeVisible({ timeout: 5000 });
    });

    test('should handle file upload via click selection', async ({ page }) => {
      await page.click('button:has-text("Bulk Upload")');
      
      const fileInput = page.locator('#csvFileInput');
      await fileInput.setInputFiles(path.join(testDataDir, 'valid-processes.csv'));
      
      // Wait for file processing
      await page.waitForTimeout(1000);
      
      // Next button should become enabled
      const nextBtn = page.locator('#bulkUploadNext');
      await expect(nextBtn).toBeEnabled();
      
      // Should show file name
      const fileInfo = page.locator('text=valid-processes.csv');
      await expect(fileInfo).toBeVisible();
    });

    test('should handle drag and drop file upload', async ({ page }) => {
      await page.click('button:has-text("Bulk Upload")');
      
      const dropzone = page.locator('#csvDropzone');
      
      // Simulate drag events
      await dropzone.dispatchEvent('dragenter', {
        dataTransfer: {
          files: [{ name: 'valid-processes.csv', type: 'text/csv' }]
        }
      });
      
      await expect(dropzone).toHaveClass(/dragover/);
      
      // Simulate file drop (note: actual file drop simulation is complex in Playwright)
      // For now, we'll use the file input method as a proxy
      const fileInput = page.locator('#csvFileInput');
      await fileInput.setInputFiles(path.join(testDataDir, 'valid-processes.csv'));
      
      await page.waitForTimeout(1000);
      const nextBtn = page.locator('#bulkUploadNext');
      await expect(nextBtn).toBeEnabled();
    });

    test('should parse CSV and display preview correctly', async ({ page }) => {
      await page.click('button:has-text("Bulk Upload")');
      
      const fileInput = page.locator('#csvFileInput');
      await fileInput.setInputFiles(path.join(testDataDir, 'valid-processes.csv'));
      
      await page.waitForTimeout(1000);
      await page.click('#bulkUploadNext');
      
      // Should be on step 2 (preview)
      await expect(page.locator('#uploadStep2.active')).toBeVisible();
      
      // Check preview table
      const previewTable = page.locator('#dataPreviewTable');
      await expect(previewTable).toBeVisible();
      
      // Check for data rows
      const dataRows = previewTable.locator('tbody tr');
      await expect(dataRows).toHaveCount(5); // 5 processes in test file
      
      // Check first row data
      const firstRow = dataRows.first();
      await expect(firstRow).toContainText('Invoice Processing');
      await expect(firstRow).toContainText('Finance');
      
      // Import button should be visible
      const importBtn = page.locator('#bulkUploadImport');
      await expect(importBtn).toBeVisible();
    });

    test('should complete import process', async ({ page }) => {
      await page.click('button:has-text("Bulk Upload")');
      
      const fileInput = page.locator('#csvFileInput');
      await fileInput.setInputFiles(path.join(testDataDir, 'valid-processes.csv'));
      
      await page.waitForTimeout(1000);
      await page.click('#bulkUploadNext');
      await page.waitForTimeout(500);
      await page.click('#bulkUploadImport');
      
      // Should be on step 3 (importing)
      await expect(page.locator('#uploadStep3.active')).toBeVisible();
      await expect(page.locator('text=Importing Processes')).toBeVisible();
      
      // Wait for import to complete
      await page.waitForSelector('#uploadStep4.active', { timeout: 10000 });
      
      // Should show success message
      await expect(page.locator('text=Import Complete')).toBeVisible();
      await expect(page.locator('text=5 processes')).toBeVisible();
      
      const closeBtn = page.locator('#bulkUploadClose');
      await expect(closeBtn).toBeVisible();
    });
  });

  test.describe('3. User Experience Testing', () => {
    
    test('should provide clear navigation flow', async ({ page }) => {
      await page.click('button:has-text("Bulk Upload")');
      
      // Step 1: File upload
      await expect(page.locator('#uploadStep1.active')).toBeVisible();
      await expect(page.locator('text=Upload CSV File')).toBeVisible();
      await expect(page.locator('text=Select a CSV file with your process data')).toBeVisible();
      
      const fileInput = page.locator('#csvFileInput');
      await fileInput.setInputFiles(path.join(testDataDir, 'valid-processes.csv'));
      await page.waitForTimeout(1000);
      
      // Navigate to step 2
      await page.click('#bulkUploadNext');
      await expect(page.locator('#uploadStep2.active')).toBeVisible();
      await expect(page.locator('text=Preview Data')).toBeVisible();
      
      // Test back navigation
      await page.click('#bulkUploadBack');
      await expect(page.locator('#uploadStep1.active')).toBeVisible();
      
      // Go forward again
      await page.click('#bulkUploadNext');
      await expect(page.locator('#uploadStep2.active')).toBeVisible();
    });

    test('should provide helpful instructions and labels', async ({ page }) => {
      await page.click('button:has-text("Bulk Upload")');
      
      // Check instruction text
      await expect(page.locator('text=Select a CSV file with your process data')).toBeVisible();
      await expect(page.locator('text=Supports .csv files up to 10MB')).toBeVisible();
      
      // Check instructions panel
      const instructions = page.locator('.bg-blue-50');
      await expect(instructions).toBeVisible();
      await expect(instructions).toContainText('CSV Format Requirements');
      
      // Check required fields list
      await expect(page.locator('text=Process Name')).toBeVisible();
      await expect(page.locator('text=Department')).toBeVisible();
      await expect(page.locator('text=All score fields (1-10)')).toBeVisible();
    });

    test('should provide responsive feedback during interactions', async ({ page }) => {
      await page.click('button:has-text("Bulk Upload")');
      
      const dropzone = page.locator('#csvDropzone');
      
      // Test hover state
      await dropzone.hover();
      // Note: CSS hover testing would require additional setup
      
      // Test file selection feedback
      const fileInput = page.locator('#csvFileInput');
      await fileInput.setInputFiles(path.join(testDataDir, 'valid-processes.csv'));
      
      await page.waitForTimeout(1000);
      
      // Should show file selected state
      await expect(page.locator('text=valid-processes.csv')).toBeVisible();
      await expect(page.locator('#bulkUploadNext')).toBeEnabled();
    });

    test('should handle modal close properly', async ({ page }) => {
      await page.click('button:has-text("Bulk Upload")');
      
      const modal = page.locator('#bulkUploadModal');
      await expect(modal).toBeVisible();
      
      // Test close button
      await page.click('.bulk-upload-close');
      await expect(modal).toBeHidden();
      
      // Test escape key (reopen modal first)
      await page.click('button:has-text("Bulk Upload")');
      await expect(modal).toBeVisible();
      
      await page.keyboard.press('Escape');
      await expect(modal).toBeHidden();
    });
  });

  test.describe('4. Edge Cases and Error Scenarios', () => {
    
    test('should reject non-CSV files', async ({ page }) => {
      await page.click('button:has-text("Bulk Upload")');
      
      const fileInput = page.locator('#csvFileInput');
      await fileInput.setInputFiles(path.join(testDataDir, 'test-file.txt'));
      
      // Should show error message
      await expect(page.locator('text=Please upload a valid CSV file')).toBeVisible();
      
      // Next button should remain disabled
      const nextBtn = page.locator('#bulkUploadNext');
      await expect(nextBtn).toBeDisabled();
    });

    test('should handle invalid CSV format', async ({ page }) => {
      await page.click('button:has-text("Bulk Upload")');
      
      const fileInput = page.locator('#csvFileInput');
      await fileInput.setInputFiles(path.join(testDataDir, 'invalid-format.csv'));
      
      await page.waitForTimeout(1000);
      
      // Should show validation errors
      await page.click('#bulkUploadNext');
      
      // Should display validation errors
      const errorContainer = page.locator('.validation-errors');
      await expect(errorContainer).toBeVisible();
      await expect(errorContainer).toContainText('Missing required columns');
    });

    test('should validate score ranges', async ({ page }) => {
      await page.click('button:has-text("Bulk Upload")');
      
      const fileInput = page.locator('#csvFileInput');
      await fileInput.setInputFiles(path.join(testDataDir, 'invalid-scores.csv'));
      
      await page.waitForTimeout(1000);
      await page.click('#bulkUploadNext');
      
      // Should show score validation errors
      const errorContainer = page.locator('.validation-errors');
      await expect(errorContainer).toBeVisible();
      await expect(errorContainer).toContainText('Score values must be between 1 and 10');
    });

    test('should handle empty CSV files', async ({ page }) => {
      await page.click('button:has-text("Bulk Upload")');
      
      const fileInput = page.locator('#csvFileInput');
      await fileInput.setInputFiles(path.join(testDataDir, 'empty.csv'));
      
      await page.waitForTimeout(1000);
      
      // Should show appropriate message
      await expect(page.locator('text=CSV file is empty')).toBeVisible();
      
      const nextBtn = page.locator('#bulkUploadNext');
      await expect(nextBtn).toBeDisabled();
    });

    test('should handle large file uploads', async ({ page }) => {
      await page.click('button:has-text("Bulk Upload")');
      
      const fileInput = page.locator('#csvFileInput');
      await fileInput.setInputFiles(path.join(testDataDir, 'large-dataset.csv'));
      
      await page.waitForTimeout(2000); // Allow more time for large file processing
      
      const nextBtn = page.locator('#bulkUploadNext');
      await expect(nextBtn).toBeEnabled();
      
      await page.click('#bulkUploadNext');
      
      // Should handle large dataset in preview
      const previewTable = page.locator('#dataPreviewTable');
      await expect(previewTable).toBeVisible();
      
      // Should show process count
      await expect(page.locator('text=100 processes')).toBeVisible();
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate network failure during import
      await page.route('**/api/**', route => route.abort());
      
      await page.click('button:has-text("Bulk Upload")');
      
      const fileInput = page.locator('#csvFileInput');
      await fileInput.setInputFiles(path.join(testDataDir, 'valid-processes.csv'));
      
      await page.waitForTimeout(1000);
      await page.click('#bulkUploadNext');
      await page.waitForTimeout(500);
      await page.click('#bulkUploadImport');
      
      // Should show error message
      await expect(page.locator('text=Import failed')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=network error')).toBeVisible();
    });
  });

  test.describe('5. Mobile Responsiveness Testing', () => {
    
    test('should be responsive on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.goto('/workshops/business-automation-dashboard.html');
      await page.waitForLoadState('networkidle');
      
      await page.click('[data-workspace="process-management"]');
      await page.waitForTimeout(1000);
      
      // Bulk upload button should be visible and accessible
      const bulkUploadBtn = page.locator('button:has-text("Bulk Upload")');
      await expect(bulkUploadBtn).toBeVisible();
      
      await page.click('button:has-text("Bulk Upload")');
      
      const modal = page.locator('#bulkUploadModal');
      await expect(modal).toBeVisible();
      
      // Modal should fit mobile screen
      const container = modal.locator('.bulk-upload-container');
      await expect(container).toBeVisible();
      
      // Check that content is accessible
      const dropzone = page.locator('#csvDropzone');
      await expect(dropzone).toBeVisible();
      
      // Test file upload on mobile
      const fileInput = page.locator('#csvFileInput');
      await fileInput.setInputFiles(path.join(testDataDir, 'valid-processes.csv'));
      
      await page.waitForTimeout(1000);
      
      const nextBtn = page.locator('#bulkUploadNext');
      await expect(nextBtn).toBeEnabled();
      await expect(nextBtn).toBeVisible();
    });

    test('should handle tablet view properly', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
      await page.goto('/workshops/business-automation-dashboard.html');
      await page.waitForLoadState('networkidle');
      
      await page.click('[data-workspace="process-management"]');
      await page.waitForTimeout(1000);
      
      await page.click('button:has-text("Bulk Upload")');
      
      // Modal should display properly on tablet
      const modal = page.locator('#bulkUploadModal');
      await expect(modal).toBeVisible();
      
      // Test complete flow on tablet
      const fileInput = page.locator('#csvFileInput');
      await fileInput.setInputFiles(path.join(testDataDir, 'valid-processes.csv'));
      
      await page.waitForTimeout(1000);
      await page.click('#bulkUploadNext');
      
      // Preview should be readable on tablet
      const previewTable = page.locator('#dataPreviewTable');
      await expect(previewTable).toBeVisible();
      
      // Table should be horizontally scrollable if needed
      const tableContainer = previewTable.locator('..');
      await expect(tableContainer).toBeVisible();
    });
  });

  test.describe('6. Integration Testing', () => {
    
    test('should work with current project selection', async ({ page }) => {
      // First select a project
      await page.click('.project-card:first-child');
      await page.waitForTimeout(1000);
      
      await page.click('[data-workspace="process-management"]');
      await page.waitForTimeout(1000);
      
      // Get current project context
      const projectInfo = page.locator('.project-info');
      await expect(projectInfo).toBeVisible();
      
      // Perform bulk upload
      await page.click('button:has-text("Bulk Upload")');
      
      const fileInput = page.locator('#csvFileInput');
      await fileInput.setInputFiles(path.join(testDataDir, 'valid-processes.csv'));
      
      await page.waitForTimeout(1000);
      await page.click('#bulkUploadNext');
      await page.waitForTimeout(500);
      await page.click('#bulkUploadImport');
      
      // Wait for completion
      await page.waitForSelector('#uploadStep4.active', { timeout: 10000 });
      await page.click('#bulkUploadClose');
      
      // Verify processes were added to current project
      await page.waitForTimeout(2000);
      
      const processList = page.locator('.process-item');
      await expect(processList).toHaveCountGreaterThan(0);
    });

    test('should update dashboard metrics after import', async ({ page }) => {
      // Get initial metrics
      await page.click('[data-workspace="project-overview"]');
      await page.waitForTimeout(1000);
      
      const initialMetrics = await page.locator('.metric-value').allTextContents();
      
      // Perform bulk upload
      await page.click('[data-workspace="process-management"]');
      await page.waitForTimeout(1000);
      
      await page.click('button:has-text("Bulk Upload")');
      
      const fileInput = page.locator('#csvFileInput');
      await fileInput.setInputFiles(path.join(testDataDir, 'valid-processes.csv'));
      
      await page.waitForTimeout(1000);
      await page.click('#bulkUploadNext');
      await page.waitForTimeout(500);
      await page.click('#bulkUploadImport');
      
      await page.waitForSelector('#uploadStep4.active', { timeout: 10000 });
      await page.click('#bulkUploadClose');
      
      // Check updated metrics
      await page.click('[data-workspace="project-overview"]');
      await page.waitForTimeout(2000);
      
      const updatedMetrics = await page.locator('.metric-value').allTextContents();
      
      // Metrics should have changed
      expect(updatedMetrics).not.toEqual(initialMetrics);
    });

    test('should maintain data persistence', async ({ page }) => {
      // Perform bulk upload
      await page.click('button:has-text("Bulk Upload")');
      
      const fileInput = page.locator('#csvFileInput');
      await fileInput.setInputFiles(path.join(testDataDir, 'valid-processes.csv'));
      
      await page.waitForTimeout(1000);
      await page.click('#bulkUploadNext');
      await page.waitForTimeout(500);
      await page.click('#bulkUploadImport');
      
      await page.waitForSelector('#uploadStep4.active', { timeout: 10000 });
      await page.click('#bulkUploadClose');
      
      // Record process names
      await page.waitForTimeout(2000);
      const processNames = await page.locator('.process-item .process-name').allTextContents();
      
      // Refresh page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      await page.click('[data-workspace="process-management"]');
      await page.waitForTimeout(2000);
      
      // Verify data persistence
      const persistedProcessNames = await page.locator('.process-item .process-name').allTextContents();
      
      // Should contain the uploaded processes
      for (const name of ['Invoice Processing', 'Customer Onboarding']) {
        expect(persistedProcessNames.some(p => p.includes(name))).toBeTruthy();
      }
    });
  });

  test.describe('7. Performance Testing', () => {
    
    test('should handle bulk upload performance', async ({ page }) => {
      const startTime = Date.now();
      
      await page.click('button:has-text("Bulk Upload")');
      
      const fileInput = page.locator('#csvFileInput');
      await fileInput.setInputFiles(path.join(testDataDir, 'large-dataset.csv'));
      
      // Measure file processing time
      const fileProcessTime = Date.now();
      await page.waitForTimeout(1000);
      
      await page.click('#bulkUploadNext');
      
      // Measure preview generation time
      const previewTime = Date.now();
      await page.waitForSelector('#dataPreviewTable', { timeout: 5000 });
      
      await page.click('#bulkUploadImport');
      
      // Measure import time
      const importStartTime = Date.now();
      await page.waitForSelector('#uploadStep4.active', { timeout: 15000 });
      const importEndTime = Date.now();
      
      // Performance assertions
      const totalTime = importEndTime - startTime;
      const fileProcessingTime = fileProcessTime - startTime;
      const previewGenerationTime = previewTime - fileProcessTime;
      const importTime = importEndTime - importStartTime;
      
      console.log({
        totalTime,
        fileProcessingTime,
        previewGenerationTime,
        importTime
      });
      
      // Reasonable performance expectations
      expect(fileProcessingTime).toBeLessThan(3000); // File processing < 3s
      expect(previewGenerationTime).toBeLessThan(2000); // Preview < 2s  
      expect(importTime).toBeLessThan(10000); // Import < 10s
      expect(totalTime).toBeLessThan(15000); // Total < 15s
    });
  });

  test.afterAll(async () => {
    // Clean up test files
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
  });
});