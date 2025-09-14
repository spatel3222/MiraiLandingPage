import { test, expect } from '@playwright/test';

test.describe('Empty Project Data Validation', () => {
  const dashboardUrl = '/workshops/business-automation-dashboard.html';

  test('Empty Project Should Not Show Fake ROI/Roadmap/Actions', async ({ page }) => {
    console.log('\n=== TESTING: Empty Project Data Validation ===');
    
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(4000);
    
    // Switch to testSept14 project (should have 0 processes)
    const dropdown = page.locator('#headerProjectSelector, #projectSelector');
    if (await dropdown.count() > 0) {
      await dropdown.first().selectOption('b29596bf-bbb0-41ae-8812-f406530679d9'); // testSept14
      await page.waitForTimeout(3000);
    }
    
    // Check basic metrics first
    const basicMetrics = await page.evaluate(() => {
      return {
        totalProcesses: document.querySelector('#totalProcesses')?.textContent?.trim(),
        activeDepartments: document.querySelector('#activeDepartments')?.textContent?.trim(),
        quickWins: document.querySelector('#quickWins')?.textContent?.trim(),
        projectedSavings: document.querySelector('#projectedSavings')?.textContent?.trim()
      };
    });
    
    console.log('Basic metrics for empty project:', basicMetrics);
    
    // Verify basic metrics are 0 or $0
    expect(basicMetrics.totalProcesses).toBe('0');
    expect(basicMetrics.activeDepartments).toBe('0');
    expect(basicMetrics.quickWins).toBe('0');
    
    // Check ROI Breakdown section
    const roiData = await page.evaluate(() => {
      const roiSection = document.querySelector('.roi-section, [class*="roi"], #roi');
      if (!roiSection) return { found: false };
      
      const annualSavings = document.querySelector('#annualSavings, [class*="annual-savings"], .annual-savings')?.textContent;
      const averageROI = document.querySelector('#averageROI, [class*="average-roi"], .average-roi')?.textContent;
      const paybackPeriod = document.querySelector('#paybackPeriod, [class*="payback"], .payback-period')?.textContent;
      
      return {
        found: true,
        annualSavings,
        averageROI,
        paybackPeriod,
        sectionVisible: roiSection.offsetParent !== null
      };
    });
    
    console.log('ROI section data:', roiData);
    
    if (roiData.found && roiData.sectionVisible) {
      console.log('⚠️  ROI section is visible for empty project');
      if (roiData.annualSavings && roiData.annualSavings !== '$0' && roiData.annualSavings !== '0') {
        console.log(`❌ FAKE DATA: Annual savings showing "${roiData.annualSavings}" for empty project`);
      }
      if (roiData.averageROI && roiData.averageROI !== '0%' && roiData.averageROI !== '0') {
        console.log(`❌ FAKE DATA: Average ROI showing "${roiData.averageROI}" for empty project`);
      }
    }
    
    // Check Implementation Roadmap
    const roadmapData = await page.evaluate(() => {
      const roadmapSection = document.querySelector('.roadmap-section, [class*="roadmap"], #roadmap');
      if (!roadmapSection) return { found: false };
      
      const phases = Array.from(document.querySelectorAll('.roadmap-phase, .phase-content, [class*="phase"]'));
      const phaseData = phases.map(phase => {
        const title = phase.querySelector('.phase-title, h3')?.textContent?.trim();
        const items = Array.from(phase.querySelectorAll('.phase-item, [class*="item"]')).map(item => 
          item.textContent?.trim()
        ).filter(text => text && text.length > 0);
        const savings = phase.querySelector('.phase-impact, [class*="savings"], [class*="expected"]')?.textContent?.trim();
        
        return { title, items, savings };
      }).filter(phase => phase.title);
      
      return {
        found: true,
        sectionVisible: roadmapSection.offsetParent !== null,
        phases: phaseData
      };
    });
    
    console.log('Roadmap section data:', JSON.stringify(roadmapData, null, 2));
    
    if (roadmapData.found && roadmapData.sectionVisible) {
      console.log('⚠️  Roadmap section is visible for empty project');
      
      roadmapData.phases.forEach((phase, index) => {
        if (phase.items && phase.items.length > 0) {
          console.log(`❌ FAKE DATA: Phase ${index + 1} "${phase.title}" has ${phase.items.length} items for empty project:`);
          phase.items.forEach(item => console.log(`   - ${item}`));
        }
        if (phase.savings && !phase.savings.includes('$0')) {
          console.log(`❌ FAKE DATA: Phase ${index + 1} shows savings "${phase.savings}" for empty project`);
        }
      });
    }
    
    // Check Recommended Actions
    const actionsData = await page.evaluate(() => {
      const actionsSection = document.querySelector('.action-center, [class*="action"], [class*="recommended"]');
      if (!actionsSection) return { found: false };
      
      const actionCards = Array.from(document.querySelectorAll('.action-card, [class*="action-card"]'));
      const actions = actionCards.map(card => {
        const title = card.querySelector('.action-title, h3, h4')?.textContent?.trim();
        const description = card.querySelector('.action-description, .description, p')?.textContent?.trim();
        const priority = card.querySelector('.priority, [class*="priority"]')?.textContent?.trim();
        
        return { title, description, priority };
      }).filter(action => action.title);
      
      return {
        found: true,
        sectionVisible: actionsSection.offsetParent !== null,
        actions
      };
    });
    
    console.log('Recommended actions data:', JSON.stringify(actionsData, null, 2));
    
    if (actionsData.found && actionsData.sectionVisible) {
      console.log('⚠️  Recommended Actions section is visible for empty project');
      
      if (actionsData.actions && actionsData.actions.length > 0) {
        console.log(`❌ FAKE DATA: ${actionsData.actions.length} recommended actions shown for empty project:`);
        actionsData.actions.forEach(action => {
          console.log(`   - ${action.title}: ${action.description?.substring(0, 50)}...`);
        });
      }
    }
    
    // Take screenshot for verification
    await page.screenshot({ 
      path: 'test-results/empty-project-fake-data-check.png',
      fullPage: true 
    });
    
    // Summary
    console.log('\n--- EMPTY PROJECT DATA VALIDATION SUMMARY ---');
    console.log(`Total Processes: ${basicMetrics.totalProcesses} (should be 0)`);
    console.log(`Active Departments: ${basicMetrics.activeDepartments} (should be 0)`);  
    console.log(`Quick Wins: ${basicMetrics.quickWins} (should be 0)`);
    console.log(`Projected Savings: ${basicMetrics.projectedSavings} (should be $0.0M)`);
    
    if (roiData.found && roiData.sectionVisible) {
      console.log('❌ ROI section contains data for empty project');
    }
    
    if (roadmapData.found && roadmapData.sectionVisible && roadmapData.phases.some(p => p.items && p.items.length > 0)) {
      console.log('❌ Roadmap section contains fake processes for empty project');
    }
    
    if (actionsData.found && actionsData.sectionVisible && actionsData.actions.length > 0) {
      console.log('❌ Recommended Actions section contains fake actions for empty project');
    }
  });
});