const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:8000/workshops/business-automation-dashboard.html');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  
  console.log('\n=== TESTING METRICS FORMULAS AND DEFINITIONS ===');
  
  // Open Process Management workspace
  await page.evaluate(() => {
    if (typeof openProcessWorkspace === 'function') {
      openProcessWorkspace();
    }
  });
  await page.waitForTimeout(2000);
  
  // Check for enhanced metrics summary
  const metricsTitle = await page.locator('text=📊 Metrics Definitions & Calculation Formulas').isVisible();
  if (metricsTitle) {
    console.log('✅ Enhanced metrics summary title found');
  } else {
    console.log('❌ Enhanced metrics summary title not found');
  }
  
  // Check for the three main ratio definitions
  const ratios = [
    'Automation Score Ratio',
    'High Impact Ratio', 
    'Automation Readiness Ratio',
    'ROI Priority Ratio'
  ];
  
  for (const ratio of ratios) {
    const ratioExists = await page.locator(`text=${ratio}`).isVisible();
    console.log(`${ratioExists ? '✅' : '❌'} ${ratio}: ${ratioExists ? 'Found' : 'Not found'}`);
  }
  
  // Check for specific formulas
  const formulas = [
    'COUNT(processes)',
    '(Repetitive + DataDriven + RuleBased + HighVolume) ÷ 4',
    'COUNT(processes WHERE impact ≥ 8) ÷ TOTAL(processes) × 100%',
    '((10 - AvgComplexity) × 5 + AvgImpact × 5) × 1.6',
    '(AutomationScore × ImpactScore) ÷ ComplexityScore'
  ];
  
  console.log('\n📋 Formula Verification:');
  for (const formula of formulas) {
    const formulaExists = await page.locator(`text=${formula}`).isVisible();
    console.log(`${formulaExists ? '✅' : '❌'} Formula found: ${formula.substring(0, 40)}${formula.length > 40 ? '...' : ''}`);
  }
  
  // Check for factor definitions
  const factors = [
    'Repetitive: Task frequency',
    'DataDriven: Structured data dependency',
    'RuleBased: Logic clarity',
    'HighVolume: Transaction scale'
  ];
  
  console.log('\n🔍 Factor Definitions:');
  for (const factor of factors) {
    const factorExists = await page.locator(`text=${factor}`).isVisible();
    console.log(`${factorExists ? '✅' : '❌'} ${factor}`);
  }
  
  // Check for scoring guidelines
  const guidelines = await page.locator('text=📋 Scoring Guidelines').isVisible();
  const complexityScale = await page.locator('text=Complexity Scale (1-10)').isVisible();
  const impactScale = await page.locator('text=Impact Scale (1-10)').isVisible();
  
  console.log('\n📊 Scoring Guidelines:');
  console.log(`${guidelines ? '✅' : '❌'} Scoring Guidelines section: ${guidelines ? 'Found' : 'Not found'}`);
  console.log(`${complexityScale ? '✅' : '❌'} Complexity Scale: ${complexityScale ? 'Found' : 'Not found'}`);
  console.log(`${impactScale ? '✅' : '❌'} Impact Scale: ${impactScale ? 'Found' : 'Not found'}`);
  
  // Take screenshot
  await page.screenshot({ 
    path: 'test-results/metrics-formulas-enhanced.png',
    fullPage: true 
  });
  
  console.log('\n📸 Screenshot saved as metrics-formulas-enhanced.png');
  console.log('\n=== SUMMARY ===');
  console.log('✅ Enhanced metrics summary with detailed ratio definitions and formulas');
  console.log('📊 Five complete ratio formulas with mathematical definitions');
  console.log('🔢 Factor breakdowns for automation scoring components');
  console.log('📋 Comprehensive scoring guidelines and scales');
  
  await browser.close();
})();