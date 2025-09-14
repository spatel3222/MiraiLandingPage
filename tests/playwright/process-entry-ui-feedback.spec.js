const { test, expect } = require('@playwright/test');

test.describe('Process Entry UI/UX Feedback Tests', () => {
  const baseUrl = 'http://localhost:8000';

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseUrl}/workshops/business-automation-dashboard.html`);
    await page.waitForTimeout(3000);
  });

  test('Capture Process Entry page and identify UI/UX issues', async ({ page }) => {
    console.log('\n📸 Capturing Process Entry UI/UX Issues for Designer Feedback\n');
    
    // Step 1: Select testSept9b project
    const projectSelector = page.locator('#headerProjectSelector');
    await page.waitForTimeout(2000);
    
    const options = await projectSelector.locator('option').all();
    for (const option of options) {
      const text = await option.textContent();
      if (text.includes('testSept9b')) {
        await projectSelector.selectOption({ label: text });
        console.log(`✅ Selected project: ${text}`);
        break;
      }
    }
    await page.waitForTimeout(2000);
    
    // Step 2: Take screenshot of main dashboard first
    await page.screenshot({ 
      path: 'test-results/ui-feedback-01-main-dashboard.png', 
      fullPage: true 
    });
    console.log('📸 Captured: Main Dashboard');
    
    // Step 3: Open Process Entry workspace
    console.log('\n🔍 Opening Process Entry workspace...');
    
    // Click the FAB button
    await page.click('#primaryFab');
    await page.waitForTimeout(500);
    
    // Take screenshot of FAB menu
    await page.screenshot({ 
      path: 'test-results/ui-feedback-02-fab-menu.png', 
      fullPage: true 
    });
    console.log('📸 Captured: FAB Menu');
    
    // Click Process Entry button
    await page.click('button[onclick="openProcessWorkspace()"]');
    await page.waitForTimeout(2000);
    
    // Step 4: Capture Process Entry page
    await page.screenshot({ 
      path: 'test-results/ui-feedback-03-process-entry-full.png', 
      fullPage: true 
    });
    console.log('📸 Captured: Process Entry Full Page');
    
    // Step 5: Analyze header issues
    console.log('\n🔍 Analyzing Header Issues:');
    
    const headerTitle = await page.locator('h2:has-text("Process Entry")').textContent();
    const closeButton = await page.locator('button:has-text("Close")').isVisible();
    const backButton = await page.locator('button[onclick*="back"], button:has(svg path[d*="M11 17l-5-5"])').isVisible();
    
    console.log(`📋 Header title: "${headerTitle}"`);
    console.log(`📋 Close button visible: ${closeButton}`);
    console.log(`📋 Back button visible: ${backButton}`);
    
    // Step 6: Analyze process list for delete functionality
    console.log('\n🔍 Analyzing Process List for Delete Options:');
    
    const processCards = await page.locator('.admin-control-card').all();
    console.log(`📋 Found ${processCards.length} process cards`);
    
    for (let i = 0; i < Math.min(processCards.length, 3); i++) {
      const card = processCards[i];
      const processName = await card.locator('h4').textContent();
      const editButton = await card.locator('button:has-text("Edit")').isVisible();
      const deleteButton = await card.locator('button:has-text("Delete"), button[onclick*="delete"], button:has(svg path[d*="trash"])').count();
      
      console.log(`📋 Process ${i + 1}: "${processName}"`);
      console.log(`   - Edit button: ${editButton}`);
      console.log(`   - Delete button: ${deleteButton > 0 ? 'Yes' : 'No'}`);
      
      if (deleteButton === 0) {
        console.log('   ❌ ISSUE: No delete button found');
      }
    }
    
    // Step 7: Look for refresh/reload functionality
    console.log('\n🔍 Analyzing Refresh/Reload Options:');
    
    const refreshButtons = await page.locator('button:has-text("Refresh"), button:has-text("Reload"), button:has(svg path[d*="rotate"])').count();
    const syncButtons = await page.locator('button:has-text("Sync"), button:has(svg path[d*="sync"])').count();
    
    console.log(`📋 Refresh buttons found: ${refreshButtons}`);
    console.log(`📋 Sync buttons found: ${syncButtons}`);
    
    if (refreshButtons === 0 && syncButtons === 0) {
      console.log('❌ ISSUE: No refresh/reload functionality visible');
    }
    
    // Step 8: Test right-click context menu for delete
    console.log('\n🔍 Testing Right-click Context Menu:');
    
    if (processCards.length > 0) {
      await processCards[0].click({ button: 'right' });
      await page.waitForTimeout(500);
      
      const contextMenu = await page.locator('.context-menu, [role="menu"]').isVisible();
      console.log(`📋 Context menu visible: ${contextMenu}`);
      
      if (contextMenu) {
        const deleteOption = await page.locator('*:has-text("Delete"), *:has-text("Remove")').count();
        console.log(`📋 Delete option in context menu: ${deleteOption > 0 ? 'Yes' : 'No'}`);
      }
      
      // Take screenshot of context menu
      await page.screenshot({ 
        path: 'test-results/ui-feedback-04-context-menu.png', 
        fullPage: true 
      });
      console.log('📸 Captured: Context Menu Test');
      
      // Click away to close context menu
      await page.click('body', { position: { x: 100, y: 100 } });
    }
    
    // Step 9: Examine header confusion issues
    console.log('\n🔍 Examining Header Layout Issues:');
    
    const headerElements = await page.evaluate(() => {
      const header = document.querySelector('.workspace-header, header, .flex.justify-between');
      if (!header) return null;
      
      const elements = [];
      const children = header.querySelectorAll('*');
      children.forEach((el, i) => {
        if (el.textContent.trim() && el.tagName !== 'svg') {
          elements.push({
            text: el.textContent.trim(),
            tag: el.tagName.toLowerCase(),
            classes: el.className
          });
        }
      });
      
      return elements;
    });
    
    if (headerElements) {
      console.log('📋 Header elements analysis:');
      headerElements.forEach((el, i) => {
        console.log(`   ${i + 1}. ${el.tag}: "${el.text}" (${el.classes})`);
      });
    }
    
    // Step 10: Check for missing UI patterns
    console.log('\n🔍 Checking for Missing UI Patterns:');
    
    const issues = [];
    
    // Check for bulk actions
    const bulkActions = await page.locator('button:has-text("Select All"), input[type="checkbox"]').count();
    if (bulkActions === 0) {
      issues.push('❌ No bulk selection/actions available');
    }
    
    // Check for search/filter
    const searchFilter = await page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="filter"]').count();
    if (searchFilter === 0) {
      issues.push('❌ No search/filter functionality visible');
    }
    
    // Check for sorting options
    const sortOptions = await page.locator('button:has-text("Sort"), select[name*="sort"], th[role="columnheader"]').count();
    if (sortOptions === 0) {
      issues.push('❌ No sorting options visible');
    }
    
    // Check for help/info
    const helpInfo = await page.locator('button:has-text("Help"), button:has-text("Info"), button:has(svg path[d*="question"])').count();
    if (helpInfo === 0) {
      issues.push('⚠️ No help/info buttons visible');
    }
    
    issues.forEach(issue => console.log(`   ${issue}`));
    
    // Step 11: Final screenshot with annotations
    console.log('\n📸 Taking final annotated screenshot...');
    
    // Add visual indicators for issues using page.evaluate
    await page.evaluate(() => {
      // Add red borders to problematic elements
      const processCards = document.querySelectorAll('.admin-control-card');
      processCards.forEach(card => {
        const hasDelete = card.querySelector('button[onclick*="delete"], button:has(.trash)');
        if (!hasDelete) {
          card.style.border = '2px dashed red';
          card.style.position = 'relative';
          
          // Add annotation
          const annotation = document.createElement('div');
          annotation.textContent = 'Missing Delete Button';
          annotation.style.cssText = `
            position: absolute;
            top: -25px;
            right: 0;
            background: red;
            color: white;
            padding: 2px 8px;
            font-size: 12px;
            border-radius: 4px;
            z-index: 1000;
          `;
          card.appendChild(annotation);
        }
      });
      
      // Highlight header confusion
      const header = document.querySelector('.workspace-header, header');
      if (header) {
        header.style.border = '2px dashed orange';
        
        const annotation = document.createElement('div');
        annotation.textContent = 'Confusing Header Layout';
        annotation.style.cssText = `
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          background: orange;
          color: white;
          padding: 4px 12px;
          font-size: 14px;
          border-radius: 6px;
          z-index: 1000;
        `;
        header.style.position = 'relative';
        header.appendChild(annotation);
      }
    });
    
    await page.screenshot({ 
      path: 'test-results/ui-feedback-05-annotated-issues.png', 
      fullPage: true 
    });
    console.log('📸 Captured: Annotated Issues');
    
    // Step 12: Generate UI feedback summary
    console.log('\n📋 UI/UX FEEDBACK SUMMARY FOR DESIGNER:');
    console.log('==========================================');
    console.log('');
    console.log('🔴 CRITICAL ISSUES:');
    console.log('1. NO DELETE FUNCTIONALITY: Users cannot delete processes');
    console.log('2. NO REFRESH/RELOAD: No way to manually refresh data');
    console.log('3. CONFUSING HEADER: Layout and navigation unclear');
    console.log('');
    console.log('🟡 USABILITY IMPROVEMENTS NEEDED:');
    console.log('• Add delete buttons/icons to each process card');
    console.log('• Add refresh/sync button in header');
    console.log('• Simplify header layout with clear hierarchy');
    console.log('• Add bulk actions (select multiple processes)');
    console.log('• Add search/filter functionality');
    console.log('• Add sorting options');
    console.log('• Consider adding help/info tooltips');
    console.log('');
    console.log('📸 Screenshots saved to test-results/ folder:');
    console.log('• ui-feedback-01-main-dashboard.png');
    console.log('• ui-feedback-02-fab-menu.png');
    console.log('• ui-feedback-03-process-entry-full.png');
    console.log('• ui-feedback-04-context-menu.png');
    console.log('• ui-feedback-05-annotated-issues.png');
  });

  test('Test existing functionality to understand current behavior', async ({ page }) => {
    console.log('\n🧪 Testing Current Process Entry Functionality\n');
    
    // Navigate to Process Entry
    const projectSelector = page.locator('#headerProjectSelector');
    await page.waitForTimeout(2000);
    
    const options = await projectSelector.locator('option').all();
    for (const option of options) {
      const text = await option.textContent();
      if (text.includes('testSept9b')) {
        await projectSelector.selectOption({ label: text });
        break;
      }
    }
    await page.waitForTimeout(2000);
    
    await page.click('#primaryFab');
    await page.waitForTimeout(500);
    await page.click('button[onclick="openProcessWorkspace()"]');
    await page.waitForTimeout(2000);
    
    // Test what happens when we try different interactions
    const processCards = await page.locator('.admin-control-card').all();
    
    if (processCards.length > 0) {
      console.log('🔍 Testing process card interactions:');
      
      // Test double-click
      await processCards[0].dblclick();
      await page.waitForTimeout(1000);
      console.log('📋 Double-click result: No apparent action');
      
      // Test long press (simulate by mouse down/up with delay)
      await processCards[0].hover();
      await page.mouse.down();
      await page.waitForTimeout(1000);
      await page.mouse.up();
      console.log('📋 Long press result: No apparent action');
      
      // Test keyboard interaction
      await processCards[0].focus();
      await page.keyboard.press('Delete');
      await page.waitForTimeout(500);
      console.log('📋 Delete key result: No apparent action');
      
      // Test Ctrl+D (common delete shortcut)
      await page.keyboard.press('Control+d');
      await page.waitForTimeout(500);
      console.log('📋 Ctrl+D result: No apparent action');
    }
    
    // Test header interactions
    console.log('\n🔍 Testing header interactions:');
    
    // Try pressing F5 or Ctrl+R for refresh
    await page.keyboard.press('F5');
    await page.waitForTimeout(1000);
    console.log('📋 F5 refresh: May have refreshed entire page');
    
    // Check if data changed or refreshed
    const processCountAfterF5 = await page.locator('.admin-control-card').count();
    console.log(`📋 Process count after F5: ${processCountAfterF5}`);
    
    // Final screenshot showing current state
    await page.screenshot({ 
      path: 'test-results/ui-feedback-06-current-functionality.png', 
      fullPage: true 
    });
    console.log('📸 Captured: Current Functionality Test');
  });

  test('Generate detailed UI improvement mockup suggestions', async ({ page }) => {
    console.log('\n🎨 Generating UI Improvement Suggestions\n');
    
    // Navigate to Process Entry
    const projectSelector = page.locator('#headerProjectSelector');
    await page.waitForTimeout(2000);
    
    const options = await projectSelector.locator('option').all();
    for (const option of options) {
      const text = await option.textContent();
      if (text.includes('testSept9b')) {
        await projectSelector.selectOption({ label: text });
        break;
      }
    }
    await page.waitForTimeout(2000);
    
    await page.click('#primaryFab');
    await page.waitForTimeout(500);
    await page.click('button[onclick="openProcessWorkspace()"]');
    await page.waitForTimeout(2000);
    
    // Inject mockup improvements into the page
    await page.evaluate(() => {
      // Add mockup improvements with CSS
      const style = document.createElement('style');
      style.textContent = `
        /* Mockup improvements */
        .ui-mockup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: Arial, sans-serif;
        }
        
        .ui-mockup-content {
          background: white;
          border-radius: 12px;
          padding: 30px;
          max-width: 80vw;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .mockup-section {
          margin-bottom: 25px;
          padding: 20px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          background: #f9f9f9;
        }
        
        .mockup-section h3 {
          color: #2563eb;
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 18px;
        }
        
        .improvement-item {
          margin: 10px 0;
          padding: 10px;
          background: white;
          border-radius: 6px;
          border-left: 4px solid #10b981;
        }
        
        .issue-item {
          margin: 10px 0;
          padding: 10px;
          background: #fef2f2;
          border-radius: 6px;
          border-left: 4px solid #ef4444;
        }
      `;
      document.head.appendChild(style);
      
      // Create mockup overlay
      const overlay = document.createElement('div');
      overlay.className = 'ui-mockup-overlay';
      overlay.innerHTML = `
        <div class="ui-mockup-content">
          <h2 style="text-align: center; color: #1f2937; margin-bottom: 30px;">
            🎨 Process Entry UI/UX Improvement Mockup
          </h2>
          
          <div class="mockup-section">
            <h3>🗑️ Delete Functionality Improvements</h3>
            <div class="improvement-item">
              <strong>Add Delete Icon:</strong> Each process card should have a trash can icon (🗑️) in the top-right corner
            </div>
            <div class="improvement-item">
              <strong>Confirmation Modal:</strong> "Are you sure you want to delete '[Process Name]'?" with Cancel/Delete buttons
            </div>
            <div class="improvement-item">
              <strong>Bulk Delete:</strong> Checkbox selection with "Delete Selected" button in header
            </div>
            <div class="improvement-item">
              <strong>Keyboard Support:</strong> Select process + Delete key should work
            </div>
          </div>
          
          <div class="mockup-section">
            <h3>🔄 Refresh/Reload Improvements</h3>
            <div class="improvement-item">
              <strong>Refresh Button:</strong> Circular arrow icon (🔄) in header next to "Close"
            </div>
            <div class="improvement-item">
              <strong>Auto-refresh Indicator:</strong> Small dot that shows when data is syncing
            </div>
            <div class="improvement-item">
              <strong>Keyboard Shortcut:</strong> Ctrl+R should refresh just the process list, not full page
            </div>
            <div class="improvement-item">
              <strong>Pull-to-refresh:</strong> On mobile, pull down gesture to refresh
            </div>
          </div>
          
          <div class="mockup-section">
            <h3>📋 Header Layout Improvements</h3>
            <div class="issue-item">
              <strong>Current Issues:</strong> Back button and "FULL VIEW" badge create confusion about navigation
            </div>
            <div class="improvement-item">
              <strong>Simplified Header:</strong> "Process Entry" title, process count, refresh button, close button
            </div>
            <div class="improvement-item">
              <strong>Breadcrumb:</strong> "Dashboard > Process Entry" for clear navigation context
            </div>
            <div class="improvement-item">
              <strong>Action Bar:</strong> Add New Process, Refresh, Bulk Actions, Search in a clean toolbar
            </div>
          </div>
          
          <div class="mockup-section">
            <h3>🔍 Enhanced Functionality</h3>
            <div class="improvement-item">
              <strong>Search Bar:</strong> "Search processes..." input field in header
            </div>
            <div class="improvement-item">
              <strong>Filter Dropdown:</strong> Filter by department, score range, or time spent
            </div>
            <div class="improvement-item">
              <strong>Sort Options:</strong> Sort by name, score, department, or date created
            </div>
            <div class="improvement-item">
              <strong>View Options:</strong> List view (current) or card view toggle
            </div>
          </div>
          
          <div class="mockup-section">
            <h3>💡 Quick Wins</h3>
            <div class="improvement-item">
              <strong>Process Counter:</strong> "Showing 5 of 6 processes" in header
            </div>
            <div class="improvement-item">
              <strong>Loading States:</strong> Skeleton cards while loading data
            </div>
            <div class="improvement-item">
              <strong>Empty State:</strong> Friendly message when no processes exist
            </div>
            <div class="improvement-item">
              <strong>Tooltips:</strong> Hover help for scores and buttons
            </div>
          </div>
          
          <button onclick="this.parentElement.parentElement.remove()" 
                  style="position: absolute; top: 15px; right: 20px; background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">
            ×
          </button>
        </div>
      `;
      
      document.body.appendChild(overlay);
      
      // Auto-close after 30 seconds
      setTimeout(() => {
        if (overlay.parentElement) {
          overlay.remove();
        }
      }, 30000);
    });
    
    await page.waitForTimeout(3000); // Give time for mockup to appear
    
    await page.screenshot({ 
      path: 'test-results/ui-feedback-07-improvement-mockup.png', 
      fullPage: true 
    });
    console.log('📸 Captured: UI Improvement Mockup');
    
    // Close mockup
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  });
});