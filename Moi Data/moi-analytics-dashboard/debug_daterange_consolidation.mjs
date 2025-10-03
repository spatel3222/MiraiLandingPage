// Debug the dateRange consolidation that's creating Sept 28
console.log('🔍 Testing date range consolidation that creates Sept 28...');

// Simulate exactly what happens in detectDateRangeFromFiles
import Papa from 'papaparse';
import fs from 'fs';

// Test with real file data
const testMetaData = '2025-09-29'; // From Meta file
const testGoogleData = 'September 29, 2025 - September 29, 2025'; // From Google file
// No Shopify filename (Shopify data contains Sept 29 sessions)

console.log('📊 Input data sources:');
console.log('Meta data date:', testMetaData);
console.log('Google data range:', testGoogleData);

// Simulate createDateRange function
function createDateRange(startDate, endDate) {
  console.log('🔄 createDateRange called with:', {
    start: startDate.toISOString(),
    end: endDate.toISOString()
  });
  
  const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const formattedDates = [];
  
  console.log('🧮 Day calculation:', {
    startTime: startDate.getTime(),
    endTime: endDate.getTime(),
    difference: endDate.getTime() - startDate.getTime(),
    daysDiff: (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    mathCeil: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
    finalCount: dayCount
  });
  
  // Generate formatted dates for each day in range
  for (let i = 0; i < dayCount; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    const formatted = currentDate.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: '2-digit'
    });
    
    console.log(`📅 Day ${i}: ${currentDate.toISOString()} -> ${formatted}`);
    formattedDates.push(formatted);
  }
  
  return {
    startDate,
    endDate,
    dayCount,
    formattedDates
  };
}

// Test Meta date parsing
console.log('\n🔍 Testing Meta date parsing...');
const metaStartDate = new Date(testMetaData);
const metaEndDate = new Date(testMetaData);
const metaRange = createDateRange(metaStartDate, metaEndDate);

console.log('Meta range result:', {
  start: metaRange.startDate.toISOString().split('T')[0],
  end: metaRange.endDate.toISOString().split('T')[0],
  dayCount: metaRange.dayCount,
  dates: metaRange.formattedDates
});

// Test Google date parsing (extract end date only)
console.log('\n🔍 Testing Google date parsing...');
const googleDateMatch = testGoogleData.match(/(\w+\s+\d+,\s+\d{4})\s*-\s*(\w+\s+\d+,\s+\d{4})/);
if (googleDateMatch) {
  const endDateStr = googleDateMatch[2]; // "September 29, 2025"
  const googleEndDate = new Date(endDateStr);
  googleEndDate.setUTCHours(0, 0, 0, 0);
  
  console.log('Google end date extraction:', {
    fullRange: testGoogleData,
    extractedEndDate: endDateStr,
    parsedDate: googleEndDate.toISOString()
  });
  
  const googleRange = createDateRange(googleEndDate, googleEndDate);
  console.log('Google range result:', {
    start: googleRange.startDate.toISOString().split('T')[0],
    end: googleRange.endDate.toISOString().split('T')[0],
    dayCount: googleRange.dayCount,
    dates: googleRange.formattedDates
  });
}

// Test consolidation
console.log('\n🔍 Testing consolidateDateRanges...');
const ranges = [metaRange];
if (googleDateMatch) {
  const endDateStr = googleDateMatch[2];
  const googleEndDate = new Date(endDateStr);
  googleEndDate.setUTCHours(0, 0, 0, 0);
  const googleRange = createDateRange(googleEndDate, googleEndDate);
  ranges.push(googleRange);
}

console.log('Input ranges for consolidation:', ranges.map(r => ({
  start: r.startDate.toISOString().split('T')[0],
  end: r.endDate.toISOString().split('T')[0],
  dayCount: r.dayCount
})));

// Find earliest start and latest end
let earliestStart = ranges[0].startDate;
let latestEnd = ranges[0].endDate;

for (const range of ranges) {
  if (range.startDate < earliestStart) {
    earliestStart = range.startDate;
  }
  if (range.endDate > latestEnd) {
    latestEnd = range.endDate;
  }
}

console.log('🎯 Consolidation results:', {
  earliestStart: earliestStart.toISOString().split('T')[0],
  latestEnd: latestEnd.toISOString().split('T')[0],
  timeDifference: latestEnd.getTime() - earliestStart.getTime()
});

const finalRange = createDateRange(earliestStart, latestEnd);

console.log('\n🚨 FINAL CONSOLIDATED RANGE:', {
  start: finalRange.startDate.toISOString().split('T')[0],
  end: finalRange.endDate.toISOString().split('T')[0],
  dayCount: finalRange.dayCount,
  dates: finalRange.formattedDates
});

if (finalRange.formattedDates.some(d => d.includes('Sep 28'))) {
  console.log('❌ BUG FOUND: Sept 28 created in consolidation!');
} else {
  console.log('✅ No Sept 28 bug in consolidation');
}