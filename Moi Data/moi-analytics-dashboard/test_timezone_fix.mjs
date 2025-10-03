// Test the timezone normalization fix
console.log('🔍 Testing Option 4: Timezone normalization fix...');

// Simulate the normalizeToLocalTime function
const normalizeToLocalTime = (date) => {
  const normalized = new Date(date);
  // Ensure we're working with local timezone, not UTC
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

// Test Meta date parsing (normalized)
console.log('\n📊 Meta date parsing (normalized):');
const metaDate = '2025-09-29';
const metaStartDate = normalizeToLocalTime(new Date(metaDate));
const metaEndDate = normalizeToLocalTime(new Date(metaDate));

console.log('Meta:', {
  original: metaDate,
  normalizedStart: metaStartDate.toISOString(),
  normalizedEnd: metaEndDate.toISOString(),
  localDate: metaStartDate.toISOString().split('T')[0]
});

// Test Google date parsing (normalized)
console.log('\n📊 Google date parsing (normalized):');
const googleDateStr = 'September 29, 2025';
const googleEndDate = normalizeToLocalTime(new Date(googleDateStr));

console.log('Google:', {
  original: googleDateStr,
  normalized: googleEndDate.toISOString(),
  localDate: googleEndDate.toISOString().split('T')[0]
});

// Test consolidation with normalized dates
console.log('\n🔄 Testing consolidation with normalized dates:');
const ranges = [
  { startDate: metaStartDate, endDate: metaEndDate, dayCount: 1 },
  { startDate: googleEndDate, endDate: googleEndDate, dayCount: 1 }
];

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

console.log('Consolidation results:', {
  earliestStart: earliestStart.toISOString().split('T')[0],
  latestEnd: latestEnd.toISOString().split('T')[0],
  timeDifference: latestEnd.getTime() - earliestStart.getTime(),
  areDatesEqual: earliestStart.getTime() === latestEnd.getTime()
});

// Test createDateRange with consolidated dates
function createDateRange(startDate, endDate) {
  const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const formattedDates = [];
  
  for (let i = 0; i < dayCount; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    const formatted = currentDate.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: '2-digit'
    });
    
    formattedDates.push(formatted);
  }
  
  return {
    startDate,
    endDate,
    dayCount,
    formattedDates
  };
}

const finalRange = createDateRange(earliestStart, latestEnd);

console.log('\n🎯 FINAL RESULT:', {
  start: finalRange.startDate.toISOString().split('T')[0],
  end: finalRange.endDate.toISOString().split('T')[0],
  dayCount: finalRange.dayCount,
  dates: finalRange.formattedDates
});

if (finalRange.formattedDates.length === 1 && finalRange.formattedDates[0].includes('Sep 29')) {
  console.log('✅ SUCCESS: Only Sept 29 created (correct)');
} else if (finalRange.formattedDates.some(d => d.includes('Sep 28'))) {
  console.log('❌ FAIL: Sept 28 still being created');
} else {
  console.log('⚠️ UNEXPECTED: Different result:', finalRange.formattedDates);
}

// Test timezone difference
console.log('\n🌍 Timezone analysis:');
console.log('Local timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);

const utcDate = new Date('2025-09-29T00:00:00.000Z');
const localDate = new Date('2025-09-29');
const normalizedDate = normalizeToLocalTime(new Date('September 29, 2025'));

console.log('UTC date:', utcDate.toISOString());
console.log('Local date:', localDate.toISOString());
console.log('Normalized date:', normalizedDate.toISOString());
console.log('All same day?', 
  utcDate.toISOString().split('T')[0] === 
  localDate.toISOString().split('T')[0] && 
  localDate.toISOString().split('T')[0] === 
  normalizedDate.toISOString().split('T')[0]
);