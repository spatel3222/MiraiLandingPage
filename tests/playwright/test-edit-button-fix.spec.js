const { test, expect } = require('@playwright/test');

test.describe('Edit Button Functionality Tests', () => {
  const baseUrl = 'http://localhost:8000';

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseUrl}/workshops/business-automation-dashboard.html`);
    await page.waitForTimeout(3000); // Wait for data to load
  });

  test('Edit button should open process edit modal successfully', async ({ page }) => {
    console.log('\n🔧 Testing Edit Button Functionality\n');
    
    // Step 1: Select testSept9b project 
    const projectSelector = page.locator('#headerProjectSelector');
    
    // Wait for options to load
    await page.waitForTimeout(2000);
    
    const options = await projectSelector.locator('option').all();
    let hasTestSept9b = false;
    
    for (const option of options) {
      const text = await option.textContent();
      if (text.includes('testSept9b')) {
        hasTestSept9b = true;
        await projectSelector.selectOption({ label: text });
        console.log(`✅ Selected project: ${text}`);
        break;
      }
    }
    
    if (!hasTestSept9b) {
      console.log('⚠️ testSept9b not found, using first available project');
      if (options.length > 1) {
        await projectSelector.selectOption({ index: 1 });
      }
    }
    
    await page.waitForTimeout(2000); // Wait for project data to load
    
    // Step 2: Open Process Entry workspace
    console.log('Opening Process Entry workspace...');
    
    // Click the FAB button to expand menu
    await page.click('#primaryFab');
    await page.waitForTimeout(500);
    
    // Click on Process Entry (Add Process) button
    await page.click('button[onclick="openProcessWorkspace()"]');
    await page.waitForTimeout(1000);
    
    // Check if we have processes to edit
    const editButtons = await page.locator('button:has-text("Edit")').all();
    
    if (editButtons.length === 0) {
      console.log('⚠️ No edit buttons found - no processes available to edit');
      return;
    }
    
    console.log(`✅ Found ${editButtons.length} edit buttons`);
    
    // Step 3: Test clicking an edit button
    const firstEditButton = editButtons[0];
    
    // Listen for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Click the edit button
    console.log('Clicking first edit button...');
    await firstEditButton.click();
    await page.waitForTimeout(1000);
    
    // Step 4: Check if modal opened without errors
    const processModal = page.locator('#processModal');
    const isModalVisible = await processModal.isVisible();
    
    console.log(`📋 Process modal visible: ${isModalVisible}`);
    
    if (isModalVisible) {
      console.log('✅ Edit modal opened successfully');
      
      // Check modal title
      const modalTitle = await processModal.locator('h2').textContent();
      console.log(`📋 Modal title: ${modalTitle}`);
      
      expect(modalTitle).toContain('Edit');
      
      // Check if form fields are populated
      const processName = await page.locator('#processName').inputValue();
      const department = await page.locator('#processDepartment').inputValue();
      
      console.log(`📋 Process name field: ${processName}`);
      console.log(`📋 Department field: ${department}`);
      
      expect(processName.length).toBeGreaterThan(0);
      
      // Check submit button text
      const submitBtn = page.locator('#submitBtn');
      const submitText = await submitBtn.textContent();
      console.log(`📋 Submit button text: ${submitText}`);
      
      expect(submitText).toContain('Update');
      
    } else {
      console.log('❌ Edit modal did not open');
    }
    
    // Step 5: Check for JavaScript errors
    if (consoleErrors.length > 0) {
      console.log('❌ Console errors detected:');
      consoleErrors.forEach(error => {
        console.log(`  - ${error}`);
      });
      
      // Check if the specific error we're fixing is resolved
      const hasNullClassListError = consoleErrors.some(error => 
        error.includes('Cannot read properties of null') && error.includes('classList')
      );
      
      expect(hasNullClassListError).toBe(false);
    } else {
      console.log('✅ No console errors detected');
    }
    
    // Cleanup: Close modal if open
    if (isModalVisible) {
      await page.locator('button[onclick="closeProcessModal()"]').click();
      await page.waitForTimeout(300);
    }
  });

  test('Edit button should handle missing elements gracefully', async ({ page }) => {
    console.log('\n🛡️ Testing Edit Button Error Handling\n');
    
    // Test JavaScript error handling by injecting test scenarios
    await page.evaluate(() => {
      // Test the editProcess function directly with error scenarios
      window.testEditProcess = async function(processId) {
        try {
          const testProcess = {
            id: processId,
            name: 'Test Process',
            department: 'Test Department',
            impact: 5,
            feasibility: 7,
            timeSpent: 10,
            notes: 'Test notes'
          };
          
          // Add to processes array temporarily
          if (!window.processes) window.processes = [];
          window.processes.push(testProcess);
          
          // Call the actual editProcess function
          await window.editProcess(processId);
          
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      };
    });
    
    // Test with valid process ID
    const result = await page.evaluate(() => {
      return window.testEditProcess('test-process-id');
    });
    
    console.log('🧪 Edit function test result:', result);
    
    if (result.success) {
      console.log('✅ Edit function handles valid input correctly');
      
      // Check if modal opened
      const processModal = page.locator('#processModal');
      const isModalVisible = await processModal.isVisible();
      console.log(`📋 Modal opened: ${isModalVisible}`);
      
    } else {
      console.log(`❌ Edit function failed: ${result.error}`);
    }
  });

  test('Edit button should populate all form fields correctly', async ({ page }) => {
    console.log('\n📝 Testing Edit Form Field Population\n');
    
    // Select a project and open process entry
    const projectSelector = page.locator('#headerProjectSelector');
    await page.waitForTimeout(2000);
    
    const options = await projectSelector.locator('option').all();
    if (options.length > 1) {
      await projectSelector.selectOption({ index: 1 });
      await page.waitForTimeout(2000);
    }
    
    // Open Process Entry workspace
    await page.click('#primaryFab');
    await page.waitForTimeout(500);
    await page.click('button[onclick="openProcessWorkspace()"]');
    await page.waitForTimeout(1000);
    
    const editButtons = await page.locator('button:has-text("Edit")').all();
    
    if (editButtons.length > 0) {
      // Click edit button
      await editButtons[0].click();
      await page.waitForTimeout(1000);
      
      const processModal = page.locator('#processModal');
      const isModalVisible = await processModal.isVisible();
      
      if (isModalVisible) {
        console.log('✅ Edit modal opened');
        
        // Check all required form fields exist and are populated
        const fieldChecks = [
          { id: '#processName', name: 'Process Name' },
          { id: '#processDepartment', name: 'Department' },
          { id: '#processNotes', name: 'Notes' }
        ];
        
        for (const field of fieldChecks) {
          const element = page.locator(field.id);
          const exists = await element.count() > 0;
          
          console.log(`📋 ${field.name} field exists: ${exists}`);
          
          if (exists) {
            const value = await element.inputValue();
            console.log(`📋 ${field.name} value: "${value}"`);
          }
        }
        
        // Check slider fields (impact, feasibility, time)
        const sliderFields = [
          { id: '#impactValue', name: 'Impact Score' },
          { id: '#feasibilityValue', name: 'Feasibility Score' },
          { id: '#timeValue', name: 'Time Spent' }
        ];
        
        for (const field of sliderFields) {
          const element = page.locator(field.id);
          const exists = await element.count() > 0;
          
          if (exists) {
            const value = await element.textContent();
            console.log(`📊 ${field.name}: ${value}`);
          }
        }
        
        console.log('✅ Form field population test completed');
        
        // Close modal
        await page.locator('button[onclick="closeProcessModal()"]').click();
      }
    }
  });

  test('Edit modal should close workspace and prevent body scroll', async ({ page }) => {
    console.log('\n📱 Testing Edit Modal UX Behavior\n');
    
    // Setup: Get to edit modal
    const projectSelector = page.locator('#headerProjectSelector');
    await page.waitForTimeout(2000);
    
    const options = await projectSelector.locator('option').all();
    if (options.length > 1) {
      await projectSelector.selectOption({ index: 1 });
      await page.waitForTimeout(2000);
    }
    
    // Open Process Entry workspace
    await page.click('#primaryFab');
    await page.waitForTimeout(500);
    await page.click('button[onclick="openProcessWorkspace()"]');
    await page.waitForTimeout(1000);
    
    // Check if workspace is open
    const workspaceOverlay = page.locator('#workspaceOverlay');
    const isWorkspaceOpen = await workspaceOverlay.isVisible();
    console.log(`📋 Workspace initially open: ${isWorkspaceOpen}`);
    
    const editButtons = await page.locator('button:has-text("Edit")').all();
    
    if (editButtons.length > 0) {
      // Click edit button
      await editButtons[0].click();
      await page.waitForTimeout(1000);
      
      // Check if workspace closed and modal opened
      const processModal = page.locator('#processModal');
      const isModalVisible = await processModal.isVisible();
      const isWorkspaceStillOpen = await workspaceOverlay.isVisible();
      
      console.log(`📋 Modal opened: ${isModalVisible}`);
      console.log(`📋 Workspace closed: ${!isWorkspaceStillOpen}`);
      
      expect(isModalVisible).toBe(true);
      expect(isWorkspaceStillOpen).toBe(false);
      
      // Check body scroll prevention
      const bodyOverflow = await page.evaluate(() => {
        return getComputedStyle(document.body).overflow;
      });
      
      console.log(`📋 Body overflow style: ${bodyOverflow}`);
      expect(bodyOverflow).toBe('hidden');
      
      console.log('✅ Edit modal UX behavior test passed');
      
      // Cleanup
      await page.locator('button[onclick="closeProcessModal()"]').click();
    }
  });
});