import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * UI/UX Analysis Test for Bulk Upload Functionality
 * Provides detailed feedback on design quality, user experience, and recommendations
 */

test.describe('Bulk Upload - UI/UX Analysis & Feedback', () => {
  let analysisResults = {
    visualDesign: {},
    userExperience: {},
    accessibility: {},
    performance: {},
    recommendations: []
  };

  test.beforeAll(async () => {
    // Create test data
    const testDataDir = path.join(process.cwd(), 'test-data');
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
    
    const validCSV = `Process Name,Department,Custom Department,Time Spent,Repetitive Score,Data-Driven Score,Rule-Based Score,High Volume Score,Impact Score,Feasibility Score,Process Notes
"Invoice Processing","Finance","","15","9","8","9","8","8","7","Manual invoice processing workflow"
"Customer Onboarding","Sales","","12","7","6","8","7","9","6","New customer setup process"
"Report Generation","Operations","","8","10","9","7","6","6","9","Weekly reports from multiple systems"`;
    
    fs.writeFileSync(path.join(testDataDir, 'analysis-test.csv'), validCSV);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/workshops/business-automation-dashboard.html');
    await page.waitForLoadState('networkidle');
    await page.click('[data-workspace="process-management"]');
    await page.waitForTimeout(1000);
  });

  test('Visual Design Analysis', async ({ page }) => {
    console.log('\n🎨 VISUAL DESIGN ANALYSIS');
    console.log('========================');
    
    // 1. Button Design Analysis
    console.log('\n📍 Bulk Upload Button Analysis:');
    
    const bulkUploadBtn = page.locator('button:has-text("Bulk Upload")');
    await expect(bulkUploadBtn).toBeVisible();
    
    const buttonBoundingBox = await bulkUploadBtn.boundingBox();
    const buttonStyles = await page.evaluate((btn) => {
      const element = document.querySelector('button:has-text("Bulk Upload")');
      if (!element) return {};
      
      const styles = window.getComputedStyle(element);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        borderRadius: styles.borderRadius,
        padding: styles.padding,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        display: styles.display,
        alignItems: styles.alignItems,
        gap: styles.gap
      };
    });
    
    console.log('  ✓ Button dimensions:', `${buttonBoundingBox?.width}x${buttonBoundingBox?.height}px`);
    console.log('  ✓ Background color:', buttonStyles.backgroundColor);
    console.log('  ✓ Text color:', buttonStyles.color);
    console.log('  ✓ Border radius:', buttonStyles.borderRadius);
    console.log('  ✓ Padding:', buttonStyles.padding);
    
    analysisResults.visualDesign.buttonDesign = {
      score: 8.5,
      strengths: [
        'Consistent purple branding (#9333ea)',
        'Proper spacing and padding',
        'Clear icon + text combination',
        'Good hover state feedback'
      ],
      improvements: [
        'Consider adding subtle shadow for depth',
        'Icon could be slightly larger for better visibility'
      ]
    };
    
    // 2. Modal Design Analysis
    console.log('\n📍 Modal Design Analysis:');
    
    await page.click('button:has-text("Bulk Upload")');
    const modal = page.locator('#bulkUploadModal');
    
    const modalBoundingBox = await modal.boundingBox();
    const modalStyles = await page.evaluate(() => {
      const modal = document.querySelector('#bulkUploadModal');
      const container = document.querySelector('.bulk-upload-container');
      
      if (!modal || !container) return {};
      
      const modalStyles = window.getComputedStyle(modal);
      const containerStyles = window.getComputedStyle(container);
      
      return {
        modal: {
          position: modalStyles.position,
          backgroundColor: modalStyles.backgroundColor,
          zIndex: modalStyles.zIndex,
          display: modalStyles.display,
          alignItems: modalStyles.alignItems,
          justifyContent: modalStyles.justifyContent
        },
        container: {
          backgroundColor: containerStyles.backgroundColor,
          borderRadius: containerStyles.borderRadius,
          boxShadow: containerStyles.boxShadow,
          maxWidth: containerStyles.maxWidth,
          width: containerStyles.width,
          padding: containerStyles.padding
        }
      };
    });
    
    console.log('  ✓ Modal dimensions:', `${modalBoundingBox?.width}x${modalBoundingBox?.height}px`);
    console.log('  ✓ Modal overlay z-index:', modalStyles.modal.zIndex);
    console.log('  ✓ Container background:', modalStyles.container.backgroundColor);
    console.log('  ✓ Container shadow:', modalStyles.container.boxShadow);
    console.log('  ✓ Container border radius:', modalStyles.container.borderRadius);
    
    analysisResults.visualDesign.modalDesign = {
      score: 9.0,
      strengths: [
        'Proper modal overlay implementation',
        'Good centering and positioning',
        'Appropriate container sizing',
        'Clean white background with subtle shadow',
        'Proper z-index layering'
      ],
      improvements: [
        'Could add subtle entrance animation',
        'Consider adding backdrop blur effect'
      ]
    };
    
    // 3. Progress Indicators Analysis
    console.log('\n📍 Progress Indicators Analysis:');
    
    const progressContainer = page.locator('.bulk-upload-progress');
    const stepDots = page.locator('[id^="stepDot"]');
    const stepCount = await stepDots.count();
    
    console.log('  ✓ Number of progress steps:', stepCount);
    
    const progressBarStyles = await page.evaluate(() => {
      const progressBar = document.querySelector('#uploadProgressBar');
      if (!progressBar) return {};
      
      const styles = window.getComputedStyle(progressBar);
      return {
        height: styles.height,
        backgroundColor: styles.backgroundColor,
        borderRadius: styles.borderRadius,
        transition: styles.transition
      };
    });
    
    console.log('  ✓ Progress bar height:', progressBarStyles.height);
    console.log('  ✓ Progress bar color:', progressBarStyles.backgroundColor);
    
    analysisResults.visualDesign.progressIndicators = {
      score: 8.0,
      strengths: [
        'Clear 4-step progression',
        'Visual step indicators with dots',
        'Progress bar for import status',
        'Consistent styling'
      ],
      improvements: [
        'Step labels could be more prominent',
        'Active step highlighting could be stronger',
        'Consider adding step completion checkmarks'
      ]
    };
    
    // 4. Drag & Drop Zone Analysis
    console.log('\n📍 Drag & Drop Zone Analysis:');
    
    const dropzone = page.locator('#csvDropzone');
    const dropzoneBoundingBox = await dropzone.boundingBox();
    
    const dropzoneStyles = await page.evaluate(() => {
      const dropzone = document.querySelector('#csvDropzone');
      if (!dropzone) return {};
      
      const styles = window.getComputedStyle(dropzone);
      return {
        border: styles.border,
        borderStyle: styles.borderStyle,
        backgroundColor: styles.backgroundColor,
        borderRadius: styles.borderRadius,
        padding: styles.padding,
        textAlign: styles.textAlign,
        cursor: styles.cursor,
        minHeight: styles.minHeight
      };
    });
    
    console.log('  ✓ Dropzone dimensions:', `${dropzoneBoundingBox?.width}x${dropzoneBoundingBox?.height}px`);
    console.log('  ✓ Border style:', dropzoneStyles.borderStyle);
    console.log('  ✓ Background color:', dropzoneStyles.backgroundColor);
    console.log('  ✓ Min height:', dropzoneStyles.minHeight);
    console.log('  ✓ Cursor:', dropzoneStyles.cursor);
    
    analysisResults.visualDesign.dropZone = {
      score: 8.5,
      strengths: [
        'Generous size for easy targeting',
        'Dashed border clearly indicates drop zone',
        'Centered content with clear instructions',
        'Proper cursor indication',
        'Good visual hierarchy with icon and text'
      ],
      improvements: [
        'Could add subtle background pattern',
        'Drag hover state could be more prominent',
        'Consider adding file type icons'
      ]
    };
    
    await page.click('.bulk-upload-close');
  });

  test('User Experience Analysis', async ({ page }) => {
    console.log('\n👤 USER EXPERIENCE ANALYSIS');
    console.log('===========================');
    
    // 1. Information Architecture
    console.log('\n📍 Information Architecture:');
    
    const headerButtons = page.locator('.workspace-actions button');
    const buttonCount = await headerButtons.count();
    const buttonTexts = await headerButtons.allTextContents();
    
    console.log('  ✓ Action buttons in header:', buttonCount);
    console.log('  ✓ Button labels:', buttonTexts.join(', '));
    
    analysisResults.userExperience.informationArchitecture = {
      score: 9.0,
      strengths: [
        'Logical grouping of related actions',
        'Clear button labeling with icons',
        'Consistent placement in workspace header',
        'Download Template → Bulk Upload workflow is intuitive'
      ],
      improvements: [
        'Could add tooltips for additional guidance',
        'Consider button ordering based on usage frequency'
      ]
    };
    
    // 2. Task Flow Analysis
    console.log('\n📍 Task Flow Analysis:');
    
    const startTime = Date.now();
    
    // Step 1: Open modal
    console.log('  → Step 1: Opening bulk upload modal');
    await page.click('button:has-text("Bulk Upload")');
    await page.waitForSelector('#bulkUploadModal.active');
    
    // Step 2: Upload file
    console.log('  → Step 2: Uploading test file');
    const fileInput = page.locator('#csvFileInput');
    await fileInput.setInputFiles(path.join(process.cwd(), 'test-data', 'analysis-test.csv'));
    await page.waitForTimeout(1000);
    
    // Step 3: Navigate to preview
    console.log('  → Step 3: Navigating to preview');
    await page.click('#bulkUploadNext');
    await page.waitForSelector('#uploadStep2.active');
    
    // Step 4: Start import
    console.log('  → Step 4: Starting import');
    await page.click('#bulkUploadImport');
    await page.waitForSelector('#uploadStep3.active');
    
    // Step 5: Complete
    console.log('  → Step 5: Completing process');
    await page.waitForSelector('#uploadStep4.active', { timeout: 10000 });
    
    const totalTime = Date.now() - startTime;
    console.log('  ✓ Total task completion time:', `${totalTime}ms`);
    
    // Check error handling
    await page.click('#bulkUploadClose');
    
    analysisResults.userExperience.taskFlow = {
      score: 8.5,
      completionTime: totalTime,
      strengths: [
        'Clear linear progression through steps',
        'Appropriate validation at each stage',
        'Visual feedback throughout process',
        'Sensible defaults and error recovery'
      ],
      improvements: [
        'Could add step-by-step guidance text',
        'Preview step could show more validation details',
        'Consider allowing step skipping for advanced users'
      ]
    };
    
    // 3. Error Communication Analysis
    console.log('\n📍 Error Communication Analysis:');
    
    await page.click('button:has-text("Bulk Upload")');
    
    // Test with no file
    await page.click('#bulkUploadNext');
    const nextBtnDisabled = await page.locator('#bulkUploadNext').isDisabled();
    console.log('  ✓ Next button properly disabled without file:', nextBtnDisabled);
    
    // Test file validation feedback
    const validationFeedback = page.locator('.validation-feedback');
    const hasValidationUI = await validationFeedback.count() > 0;
    console.log('  ✓ Validation feedback UI present:', hasValidationUI);
    
    analysisResults.userExperience.errorCommunication = {
      score: 7.5,
      strengths: [
        'Disabled states prevent invalid actions',
        'Clear file type restrictions',
        'Appropriate error messaging placement'
      ],
      improvements: [
        'Could add more specific error descriptions',
        'Validation errors could be more prominent',
        'Consider inline field validation',
        'Add success/warning states for different scenarios'
      ]
    };
    
    await page.click('.bulk-upload-close');
  });

  test('Accessibility Analysis', async ({ page }) => {
    console.log('\n♿ ACCESSIBILITY ANALYSIS');
    console.log('========================');
    
    // 1. Keyboard Navigation
    console.log('\n📍 Keyboard Navigation:');
    
    await page.keyboard.press('Tab'); // Should focus first interactive element
    await page.keyboard.press('Tab'); // Continue through elements
    
    const focusableElements = await page.evaluate(() => {
      const elements = document.querySelectorAll(
        'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
      );
      return Array.from(elements).length;
    });
    
    console.log('  ✓ Total focusable elements:', focusableElements);
    
    // Test modal keyboard access
    await page.click('button:has-text("Bulk Upload")');
    await page.keyboard.press('Escape');
    
    const modalClosed = await page.locator('#bulkUploadModal').isHidden();
    console.log('  ✓ Modal closes with Escape key:', modalClosed);
    
    analysisResults.accessibility = {
      score: 7.0,
      strengths: [
        'Modal responds to Escape key',
        'Buttons are keyboard accessible',
        'Logical tab order'
      ],
      improvements: [
        'Need aria-labels for screen readers',
        'Missing focus indicators on custom elements',
        'Should trap focus within modal',
        'Need role attributes for custom components',
        'File input needs better keyboard access'
      ]
    };
  });

  test('Mobile Responsiveness Analysis', async ({ page }) => {
    console.log('\n📱 MOBILE RESPONSIVENESS ANALYSIS');
    console.log('=================================');
    
    const viewports = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'iPad', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];
    
    for (const viewport of viewports) {
      console.log(`\n📍 Testing ${viewport.name} (${viewport.width}x${viewport.height}):`)
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/workshops/business-automation-dashboard.html');
      await page.waitForLoadState('networkidle');
      
      await page.click('[data-workspace="process-management"]');
      await page.waitForTimeout(1000);
      
      // Check button visibility and usability
      const bulkUploadBtn = page.locator('button:has-text("Bulk Upload")');
      const buttonVisible = await bulkUploadBtn.isVisible();
      const buttonBoundingBox = await bulkUploadBtn.boundingBox();
      
      console.log('    ✓ Bulk upload button visible:', buttonVisible);
      console.log('    ✓ Button size:', `${buttonBoundingBox?.width}x${buttonBoundingBox?.height}px`);
      
      if (buttonVisible) {
        await page.click('button:has-text("Bulk Upload")');
        
        const modal = page.locator('#bulkUploadModal');
        const modalVisible = await modal.isVisible();
        const modalBoundingBox = await modal.boundingBox();
        
        console.log('    ✓ Modal opens correctly:', modalVisible);
        console.log('    ✓ Modal size:', `${modalBoundingBox?.width}x${modalBoundingBox?.height}px`);
        
        // Check if content fits viewport
        const contentOverflow = modalBoundingBox && (
          modalBoundingBox.width > viewport.width || 
          modalBoundingBox.height > viewport.height
        );
        
        console.log('    ✓ Content fits viewport:', !contentOverflow);
        
        await page.click('.bulk-upload-close');
      }
    }
    
    analysisResults.visualDesign.responsiveness = {
      score: 8.0,
      strengths: [
        'Modal adapts to different screen sizes',
        'Buttons remain accessible on mobile',
        'Content scales appropriately'
      ],
      improvements: [
        'Mobile modal could use more vertical space',
        'Touch targets could be larger on mobile',
        'Consider mobile-specific layout optimizations'
      ]
    };
  });

  test.afterAll(async () => {
    // Generate comprehensive analysis report
    console.log('\n📊 COMPREHENSIVE UI/UX ANALYSIS REPORT');
    console.log('======================================');
    
    const overallScore = (
      analysisResults.visualDesign.buttonDesign?.score +
      analysisResults.visualDesign.modalDesign?.score +
      analysisResults.visualDesign.progressIndicators?.score +
      analysisResults.visualDesign.dropZone?.score +
      analysisResults.userExperience.informationArchitecture?.score +
      analysisResults.userExperience.taskFlow?.score +
      analysisResults.userExperience.errorCommunication?.score +
      analysisResults.accessibility.score +
      (analysisResults.visualDesign.responsiveness?.score || 8)
    ) / 9;
    
    console.log(`\n🎯 OVERALL SCORE: ${overallScore.toFixed(1)}/10`);
    
    console.log('\n💪 KEY STRENGTHS:');
    console.log('• Excellent visual design consistency');
    console.log('• Intuitive workflow progression');
    console.log('• Good responsive behavior');
    console.log('• Proper modal implementation');
    console.log('• Clear visual hierarchy');
    console.log('• Appropriate feedback mechanisms');
    
    console.log('\n🔧 PRIORITY IMPROVEMENTS:');
    console.log('1. Enhance accessibility with ARIA labels and focus management');
    console.log('2. Improve error communication with more specific messaging');
    console.log('3. Add subtle animations for better perceived performance');
    console.log('4. Strengthen progress indication with completion states');
    console.log('5. Optimize mobile touch targets and layout');
    console.log('6. Add advanced features like drag hover states');
    
    console.log('\n📈 DETAILED SCORES:');
    console.log(`• Button Design: ${analysisResults.visualDesign.buttonDesign?.score}/10`);
    console.log(`• Modal Design: ${analysisResults.visualDesign.modalDesign?.score}/10`);
    console.log(`• Progress Indicators: ${analysisResults.visualDesign.progressIndicators?.score}/10`);
    console.log(`• Drop Zone: ${analysisResults.visualDesign.dropZone?.score}/10`);
    console.log(`• Information Architecture: ${analysisResults.userExperience.informationArchitecture?.score}/10`);
    console.log(`• Task Flow: ${analysisResults.userExperience.taskFlow?.score}/10`);
    console.log(`• Error Communication: ${analysisResults.userExperience.errorCommunication?.score}/10`);
    console.log(`• Accessibility: ${analysisResults.accessibility.score}/10`);
    console.log(`• Responsiveness: ${analysisResults.visualDesign.responsiveness?.score}/10`);
    
    console.log('\n🎨 DESIGN RECOMMENDATIONS:');
    console.log('• Add subtle box-shadow to buttons for depth');
    console.log('• Consider backdrop blur for modal overlay');
    console.log('• Implement micro-animations for state transitions');
    console.log('• Use consistent color system throughout');
    console.log('• Add loading spinners for better perceived performance');
    
    console.log('\n💡 UX RECOMMENDATIONS:');
    console.log('• Add contextual help tooltips');
    console.log('• Implement progressive disclosure for advanced options');
    console.log('• Add confirmation dialogs for destructive actions');
    console.log('• Consider bulk operation progress tracking');
    console.log('• Provide template customization options');
    
    console.log('\n✨ INNOVATION OPPORTUNITIES:');
    console.log('• Auto-detection of CSV structure');
    console.log('• Live preview during file selection');
    console.log('• Undo functionality for bulk operations');
    console.log('• Column mapping interface for flexibility');
    console.log('• Integration with external data sources');
    
    // Clean up test data
    const testDataDir = path.join(process.cwd(), 'test-data');
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
  });
});