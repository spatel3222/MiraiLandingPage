import { chromium } from 'playwright';

async function debugDateParsing() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🚀 Debugging date parsing that creates Sept 28...');
    
    // Navigate to the app
    await page.goto('http://localhost:5175/debug_meta_fix.html');
    await page.waitForLoadState('networkidle');
    
    // Wait and then check if the correct processing happened
    await page.waitForTimeout(3000);
    
    // Run custom test to see where Sept 28 comes from
    const result = await page.evaluate(async () => {
      try {
        // Test the date range creation directly
        const { createDateRange } = await import('/src/utils/dateRangeDetector.ts');
        
        // Test with same start and end date (Sept 29)
        const startDate = new Date('2025-09-29');
        const endDate = new Date('2025-09-29');
        
        console.log('🔍 Testing createDateRange with same dates:');
        console.log('Start:', startDate.toISOString());
        console.log('End:', endDate.toISOString());
        
        const dateRange = createDateRange(startDate, endDate);
        
        console.log('🔍 DateRange result:', {
          dayCount: dateRange.dayCount,
          formattedDates: dateRange.formattedDates,
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString()
        });
        
        return {
          dayCount: dateRange.dayCount,
          formattedDates: dateRange.formattedDates,
          startIso: dateRange.startDate.toISOString(),
          endIso: dateRange.endDate.toISOString()
        };
        
      } catch (error) {
        console.error('Error in date test:', error);
        return { error: error.message };
      }
    });
    
    console.log('📊 Date Range Test Results:');
    console.log('Day Count:', result.dayCount);
    console.log('Formatted Dates:', result.formattedDates);
    console.log('Start ISO:', result.startIso);
    console.log('End ISO:', result.endIso);
    
    if (result.formattedDates && result.formattedDates.length > 1) {
      console.log('❌ PROBLEM: Multiple dates created from same input date!');
      console.log('Expected: Only Sept 29');
      console.log('Actual:', result.formattedDates);
    } else if (result.formattedDates && result.formattedDates.length === 1) {
      console.log('✅ GOOD: Only one date created');
      console.log('Date:', result.formattedDates[0]);
      
      if (result.formattedDates[0].includes('Sep 28')) {
        console.log('❌ BUT: Wrong date! Should be Sept 29, got Sept 28');
      } else if (result.formattedDates[0].includes('Sep 29')) {
        console.log('✅ CORRECT: Sept 29 as expected');
      }
    }
    
    // Keep browser open for inspection
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

debugDateParsing().catch(console.error);