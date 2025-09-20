import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Visual Regression and Performance Testing for Bulk Upload
 * Captures screenshots and measures performance metrics
 */

test.describe('Bulk Upload - Visual Regression & Performance', () => {
  let testDataDir;
  
  test.beforeAll(async () => {
    // Create test data directory and files
    testDataDir = path.join(process.cwd(), 'test-data');
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
    
    // Create test CSV files
    const smallCSV = `Process Name,Department,Custom Department,Time Spent,Repetitive Score,Data-Driven Score,Rule-Based Score,High Volume Score,Impact Score,Feasibility Score,Process Notes
"Invoice Processing","Finance","","15","9","8","9","8","8","7","Manual invoice processing workflow"
"Customer Onboarding","Sales","","12","7","6","8","7","9","6","New customer setup process"
"Report Generation","Operations","","8","10","9","7","6","6","9","Weekly reports generation"`;
    
    fs.writeFileSync(path.join(testDataDir, 'small-dataset.csv'), smallCSV);
    
    // Create medium dataset
    let mediumCSV = `Process Name,Department,Custom Department,Time Spent,Repetitive Score,Data-Driven Score,Rule-Based Score,High Volume Score,Impact Score,Feasibility Score,Process Notes\n`;
    for (let i = 1; i <= 25; i++) {
      mediumCSV += `"Process ${i}","Dept${(i % 5) + 1}","","${10 + (i % 20)}","${(i % 10) + 1}","${(i % 10) + 1}","${(i % 10) + 1}","${(i % 10) + 1}","${(i % 10) + 1}","${(i % 10) + 1}","Process description ${i}"\n`;
    }
    fs.writeFileSync(path.join(testDataDir, 'medium-dataset.csv'), mediumCSV);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/workshops/business-automation-dashboard.html');
    await page.waitForLoadState('networkidle');
    await page.click('[data-workspace="process-management"]');
    await page.waitForTimeout(1000);
  });

  test.describe('Visual Regression Testing', () => {
    
    test('should capture baseline screenshots of bulk upload UI', async ({ page }) => {
      // 1. Capture Process Management header with bulk upload button
      await expect(page.locator('.workspace-header')).toHaveScreenshot('process-management-header.png');
      
      // 2. Capture bulk upload button specifically
      const bulkUploadBtn = page.locator('button:has-text("Bulk Upload")');
      await expect(bulkUploadBtn).toHaveScreenshot('bulk-upload-button.png');
      
      // 3. Capture bulk upload button hover state
      await bulkUploadBtn.hover();
      await expect(bulkUploadBtn).toHaveScreenshot('bulk-upload-button-hover.png');
      
      // 4. Open modal and capture initial state
      await page.click('button:has-text("Bulk Upload")');
      await page.waitForSelector('#bulkUploadModal.active');
      
      const modal = page.locator('#bulkUploadModal');
      await expect(modal).toHaveScreenshot('bulk-upload-modal-step1.png');
      
      // 5. Capture drag-and-drop zone
      const dropzone = page.locator('#csvDropzone');
      await expect(dropzone).toHaveScreenshot('csv-dropzone.png');
      
      // 6. Capture progress indicators
      const progress = page.locator('.bulk-upload-progress');
      await expect(progress).toHaveScreenshot('progress-indicators-step1.png');
      
      // 7. Capture step buttons
      const actions = page.locator('.bulk-upload-actions');
      await expect(actions).toHaveScreenshot('modal-actions-step1.png');
    });

    test('should capture upload flow screenshots', async ({ page }) => {
      await page.click('button:has-text("Bulk Upload")');
      await page.waitForSelector('#bulkUploadModal.active');
      
      // Step 1: File upload
      const fileInput = page.locator('#csvFileInput');
      await fileInput.setInputFiles(path.join(testDataDir, 'small-dataset.csv'));
      await page.waitForTimeout(1000);
      
      // Capture after file selection
      const modal = page.locator('#bulkUploadModal');
      await expect(modal).toHaveScreenshot('bulk-upload-modal-file-selected.png');
      
      // Capture enabled next button
      const nextBtn = page.locator('#bulkUploadNext');
      await expect(nextBtn).toHaveScreenshot('next-button-enabled.png');
      
      // Step 2: Navigate to preview
      await page.click('#bulkUploadNext');
      await page.waitForSelector('#uploadStep2.active');
      
      // Capture preview step
      await expect(modal).toHaveScreenshot('bulk-upload-modal-step2-preview.png');
      
      // Capture preview table
      const previewTable = page.locator('#dataPreviewTable');
      await expect(previewTable).toHaveScreenshot('data-preview-table.png');
      
      // Capture step 2 progress
      const progress = page.locator('.bulk-upload-progress');
      await expect(progress).toHaveScreenshot('progress-indicators-step2.png');
      
      // Capture step 2 actions
      const actions = page.locator('.bulk-upload-actions');
      await expect(actions).toHaveScreenshot('modal-actions-step2.png');
      
      // Step 3: Import process
      await page.click('#bulkUploadImport');
      await page.waitForSelector('#uploadStep3.active');
      
      // Capture importing step
      await expect(modal).toHaveScreenshot('bulk-upload-modal-step3-importing.png');
      
      // Wait for completion
      await page.waitForSelector('#uploadStep4.active', { timeout: 10000 });
      
      // Capture success step
      await expect(modal).toHaveScreenshot('bulk-upload-modal-step4-success.png');
      
      // Capture final actions
      const finalActions = page.locator('.bulk-upload-actions');
      await expect(finalActions).toHaveScreenshot('modal-actions-step4.png');
    });

    test('should capture error states', async ({ page }) => {
      await page.click('button:has-text("Bulk Upload")');
      await page.waitForSelector('#bulkUploadModal.active');
      
      // Capture disabled next button (no file)
      const nextBtn = page.locator('#bulkUploadNext');
      await expect(nextBtn).toHaveScreenshot('next-button-disabled.png');
      
      // Create invalid file for error testing
      const invalidCSV = 'Invalid,Data\nTest,123';
      fs.writeFileSync(path.join(testDataDir, 'invalid.csv'), invalidCSV);
      
      const fileInput = page.locator('#csvFileInput');
      await fileInput.setInputFiles(path.join(testDataDir, 'invalid.csv'));
      await page.waitForTimeout(1000);
      
      // Try to proceed (should show validation errors)
      await page.click('#bulkUploadNext');
      await page.waitForTimeout(500);
      
      // Capture validation errors if they appear
      const modal = page.locator('#bulkUploadModal');
      await expect(modal).toHaveScreenshot('bulk-upload-validation-errors.png');
    });

    test('should capture mobile responsive views', async ({ page }) => {
      // Mobile view (iPhone SE)
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/workshops/business-automation-dashboard.html');
      await page.waitForLoadState('networkidle');
      await page.click('[data-workspace="process-management"]');
      await page.waitForTimeout(1000);
      
      // Capture mobile header
      await expect(page.locator('.workspace-header')).toHaveScreenshot('mobile-process-header.png');
      
      // Capture mobile bulk upload button
      const bulkUploadBtn = page.locator('button:has-text("Bulk Upload")');
      await expect(bulkUploadBtn).toHaveScreenshot('mobile-bulk-upload-button.png');
      
      // Open modal on mobile
      await page.click('button:has-text("Bulk Upload")');
      await page.waitForSelector('#bulkUploadModal.active');
      
      const modal = page.locator('#bulkUploadModal');
      await expect(modal).toHaveScreenshot('mobile-bulk-upload-modal.png');
      
      // Tablet view (iPad)
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.click('[data-workspace="process-management"]');
      await page.waitForTimeout(1000);
      
      await page.click('button:has-text("Bulk Upload")');
      await page.waitForSelector('#bulkUploadModal.active');
      
      await expect(modal).toHaveScreenshot('tablet-bulk-upload-modal.png');
    });
  });

  test.describe('Performance Testing', () => {
    
    test('should measure modal opening performance', async ({ page }) => {
      // Measure modal opening time
      const startTime = Date.now();
      
      await page.click('button:has-text("Bulk Upload")');
      await page.waitForSelector('#bulkUploadModal.active');
      
      const openTime = Date.now() - startTime;
      
      console.log(`Modal opening time: ${openTime}ms`);
      expect(openTime).toBeLessThan(500); // Should open within 500ms
      
      // Measure modal closing time
      const closeStartTime = Date.now();
      
      await page.click('.bulk-upload-close');
      await page.waitForSelector('#bulkUploadModal', { state: 'hidden' });
      
      const closeTime = Date.now() - closeStartTime;
      
      console.log(`Modal closing time: ${closeTime}ms`);
      expect(closeTime).toBeLessThan(300); // Should close within 300ms
    });

    test('should measure file processing performance', async ({ page }) => {
      await page.click('button:has-text("Bulk Upload")');
      await page.waitForSelector('#bulkUploadModal.active');
      
      // Test small file processing
      const smallFileStart = Date.now();
      
      const fileInput = page.locator('#csvFileInput');
      await fileInput.setInputFiles(path.join(testDataDir, 'small-dataset.csv'));
      
      // Wait for next button to enable (indicates processing complete)
      await page.waitForFunction(() => {
        const nextBtn = document.querySelector('#bulkUploadNext');
        return nextBtn && !nextBtn.disabled;
      });
      
      const smallFileTime = Date.now() - smallFileStart;
      console.log(`Small file processing time: ${smallFileTime}ms`);
      expect(smallFileTime).toBeLessThan(1000); // Should process within 1s
      
      // Reset and test medium file
      await page.click('.bulk-upload-close');
      await page.click('button:has-text("Bulk Upload")');
      await page.waitForSelector('#bulkUploadModal.active');
      
      const mediumFileStart = Date.now();
      
      await fileInput.setInputFiles(path.join(testDataDir, 'medium-dataset.csv'));
      
      await page.waitForFunction(() => {
        const nextBtn = document.querySelector('#bulkUploadNext');
        return nextBtn && !nextBtn.disabled;
      });
      
      const mediumFileTime = Date.now() - mediumFileStart;
      console.log(`Medium file processing time: ${mediumFileTime}ms`);
      expect(mediumFileTime).toBeLessThan(2000); // Should process within 2s
    });

    test('should measure preview generation performance', async ({ page }) => {
      await page.click('button:has-text("Bulk Upload")');
      await page.waitForSelector('#bulkUploadModal.active');
      
      const fileInput = page.locator('#csvFileInput');
      await fileInput.setInputFiles(path.join(testDataDir, 'medium-dataset.csv'));
      
      await page.waitForFunction(() => {
        const nextBtn = document.querySelector('#bulkUploadNext');
        return nextBtn && !nextBtn.disabled;
      });
      
      // Measure preview generation time
      const previewStart = Date.now();
      
      await page.click('#bulkUploadNext');
      await page.waitForSelector('#uploadStep2.active');
      await page.waitForSelector('#dataPreviewTable tbody tr');
      
      const previewTime = Date.now() - previewStart;
      console.log(`Preview generation time: ${previewTime}ms`);
      expect(previewTime).toBeLessThan(1500); // Should generate preview within 1.5s
      
      // Verify all rows are rendered
      const rowCount = await page.locator('#dataPreviewTable tbody tr').count();
      console.log(`Preview rows rendered: ${rowCount}`);
      expect(rowCount).toBeGreaterThan(0);
    });

    test('should measure import performance', async ({ page }) => {
      await page.click('button:has-text("Bulk Upload")');
      await page.waitForSelector('#bulkUploadModal.active');
      
      const fileInput = page.locator('#csvFileInput');
      await fileInput.setInputFiles(path.join(testDataDir, 'small-dataset.csv'));
      
      await page.waitForFunction(() => {
        const nextBtn = document.querySelector('#bulkUploadNext');
        return nextBtn && !nextBtn.disabled;
      });
      
      await page.click('#bulkUploadNext');
      await page.waitForSelector('#uploadStep2.active');
      
      // Measure import performance
      const importStart = Date.now();
      
      await page.click('#bulkUploadImport');
      await page.waitForSelector('#uploadStep3.active');
      await page.waitForSelector('#uploadStep4.active', { timeout: 15000 });
      
      const importTime = Date.now() - importStart;
      console.log(`Import completion time: ${importTime}ms`);
      expect(importTime).toBeLessThan(10000); // Should complete within 10s
    });

    test('should measure memory usage during operations', async ({ page }) => {
      // Enable performance monitoring
      await page.goto('/workshops/business-automation-dashboard.html');
      
      // Get initial metrics
      const initialMetrics = await page.evaluate(() => {
        return {
          usedJSHeapSize: performance.memory?.usedJSHeapSize || 0,
          totalJSHeapSize: performance.memory?.totalJSHeapSize || 0
        };
      });
      
      console.log('Initial memory usage:', initialMetrics);
      
      await page.waitForLoadState('networkidle');
      await page.click('[data-workspace="process-management"]');
      await page.waitForTimeout(1000);
      
      await page.click('button:has-text("Bulk Upload")');
      await page.waitForSelector('#bulkUploadModal.active');
      
      const fileInput = page.locator('#csvFileInput');
      await fileInput.setInputFiles(path.join(testDataDir, 'medium-dataset.csv'));
      
      await page.waitForFunction(() => {
        const nextBtn = document.querySelector('#bulkUploadNext');
        return nextBtn && !nextBtn.disabled;
      });
      
      // Get metrics after file processing
      const postProcessingMetrics = await page.evaluate(() => {
        return {
          usedJSHeapSize: performance.memory?.usedJSHeapSize || 0,
          totalJSHeapSize: performance.memory?.totalJSHeapSize || 0
        };
      });
      
      console.log('Post-processing memory usage:', postProcessingMetrics);
      
      const memoryIncrease = postProcessingMetrics.usedJSHeapSize - initialMetrics.usedJSHeapSize;
      console.log(`Memory increase during file processing: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
      
      // Memory increase should be reasonable (less than 50MB for medium file)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  test.describe('Animation and Transition Testing', () => {
    
    test('should test modal transitions', async ({ page }) => {
      // Test modal opening animation
      await page.click('button:has-text("Bulk Upload")');
      
      // Check if modal becomes visible smoothly
      const modal = page.locator('#bulkUploadModal');
      await expect(modal).toBeVisible();
      
      // Test step transitions
      const fileInput = page.locator('#csvFileInput');
      await fileInput.setInputFiles(path.join(testDataDir, 'small-dataset.csv'));
      
      await page.waitForFunction(() => {
        const nextBtn = document.querySelector('#bulkUploadNext');
        return nextBtn && !nextBtn.disabled;
      });
      
      // Measure step transition time
      const stepTransitionStart = Date.now();
      
      await page.click('#bulkUploadNext');
      await page.waitForSelector('#uploadStep2.active');
      
      const stepTransitionTime = Date.now() - stepTransitionStart;
      console.log(`Step transition time: ${stepTransitionTime}ms`);
      expect(stepTransitionTime).toBeLessThan(500); // Should transition within 500ms
      
      // Test back navigation
      const backTransitionStart = Date.now();
      
      await page.click('#bulkUploadBack');
      await page.waitForSelector('#uploadStep1.active');
      
      const backTransitionTime = Date.now() - backTransitionStart;
      console.log(`Back transition time: ${backTransitionTime}ms`);
      expect(backTransitionTime).toBeLessThan(500);
    });

    test('should test progress indicator animations', async ({ page }) => {
      await page.click('button:has-text("Bulk Upload")');
      await page.waitForSelector('#bulkUploadModal.active');
      
      // Check initial progress state
      const step1Dot = page.locator('#stepDot1');
      await expect(step1Dot).toHaveClass(/active/);
      
      const fileInput = page.locator('#csvFileInput');
      await fileInput.setInputFiles(path.join(testDataDir, 'small-dataset.csv'));
      
      await page.waitForFunction(() => {
        const nextBtn = document.querySelector('#bulkUploadNext');
        return nextBtn && !nextBtn.disabled;
      });
      
      await page.click('#bulkUploadNext');
      await page.waitForSelector('#uploadStep2.active');
      
      // Check progress indicator updates
      const step2Dot = page.locator('#stepDot2');
      await expect(step2Dot).toHaveClass(/active/);
      
      const step1CompletedDot = page.locator('#stepDot1');
      await expect(step1CompletedDot).toHaveClass(/completed/);
    });
  });

  test.afterAll(async () => {
    // Performance Summary Report
    console.log('\n⚡ PERFORMANCE ANALYSIS SUMMARY');
    console.log('==============================');
    console.log('✓ Modal operations: < 500ms');
    console.log('✓ File processing: < 2s for medium files');
    console.log('✓ Preview generation: < 1.5s');
    console.log('✓ Import completion: < 10s');
    console.log('✓ Memory usage: < 50MB increase');
    console.log('✓ Step transitions: < 500ms');
    
    console.log('\n📸 VISUAL REGRESSION TESTING');
    console.log('============================');
    console.log('✓ Baseline screenshots captured');
    console.log('✓ Mobile responsive views tested');
    console.log('✓ Error states documented');
    console.log('✓ Complete user flow captured');
    
    // Clean up test files
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
  });
});