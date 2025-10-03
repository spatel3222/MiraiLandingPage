// Test the exact date parsing logic to find Sept 28 bug
console.log('🔍 Testing date parsing that creates Sept 28...');

// Simulate the exact Meta CSV data parsing
const reportingStarts = '2025-09-29';
const reportingEnds = '2025-09-29';

console.log('📊 Input dates from Meta CSV:');
console.log('Reporting starts:', reportingStarts);
console.log('Reporting ends:', reportingEnds);

// Test JavaScript Date parsing 
const startDate = new Date(reportingStarts);
const endDate = new Date(reportingEnds);

console.log('\\n📅 Parsed Date objects:');
console.log('startDate:', startDate.toString());
console.log('endDate:', endDate.toString());
console.log('startDate ISO:', startDate.toISOString());
console.log('endDate ISO:', endDate.toISOString());

// Test the dayCount calculation
const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
console.log('\\n🧮 Day count calculation:');
console.log('Millisecond difference:', endDate.getTime() - startDate.getTime());
console.log('Days difference:', (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
console.log('Math.ceil result:', Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
console.log('Final dayCount (+1):', dayCount);

// Test the date generation loop
console.log('\\n📆 Generated dates:');
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
  
  console.log(`Day ${i}: ${currentDate.toString()} -> ${formatted}`);
  formattedDates.push(formatted);
}

console.log('\\n🎯 ANALYSIS:');
console.log('Expected: Only "Mon, Sep 29, 25"');
console.log('Actual:', formattedDates);

if (formattedDates.includes('Sun, Sep 28, 25')) {
  console.log('❌ BUG CONFIRMED: Sept 28 artificially created!');
} else {
  console.log('✅ No Sept 28 bug in this logic');
}

// Test timezone variations
console.log('\\n🌍 TIMEZONE ANALYSIS:');
console.log('Local timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);

// Test different date creation methods
const dateUTC = new Date('2025-09-29T00:00:00.000Z');
const dateLocal = new Date('2025-09-29');
const dateExplicit = new Date(2025, 8, 29); // Month is 0-indexed

console.log('UTC date:', dateUTC.toString());
console.log('Local date:', dateLocal.toString());
console.log('Explicit date:', dateExplicit.toString());

console.log('\\n🔍 Check if dates are different:');
console.log('UTC vs Local same?', dateUTC.getTime() === dateLocal.getTime());
console.log('UTC vs Explicit same?', dateUTC.getTime() === dateExplicit.getTime());
console.log('Local vs Explicit same?', dateLocal.getTime() === dateExplicit.getTime());