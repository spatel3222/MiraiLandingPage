const fs = require('fs');
const path = require('path');

// Simple test to verify date range detection logic
function testShopifyDateDetection(filename) {
  console.log(`\n=== Testing Shopify Date Detection ===`);
  console.log(`Filename: ${filename}`);
  
  // Pattern: YYYY-MM-DD to YYYY-MM-DD
  const dateRangeMatch = filename.match(/(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/);
  if (dateRangeMatch) {
    const startDate = new Date(dateRangeMatch[1]);
    const endDate = new Date(dateRangeMatch[2]);
    const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    console.log(`✅ Detected date range:`);
    console.log(`   Start: ${startDate.toDateString()} (${dateRangeMatch[1]})`);
    console.log(`   End: ${endDate.toDateString()} (${dateRangeMatch[2]})`);
    console.log(`   Days: ${dayCount}`);
    
    return { startDate, endDate, dayCount };
  } else {
    console.log(`❌ No date range detected`);
    return null;
  }
}

function testMetaDateDetection() {
  console.log(`\n=== Testing Meta CSV Date Detection ===`);
  const metaFilePath = '/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/MOI Original Data/Input Example/Meta report-Sep-10-2025-to-Sep-23-2025.csv';
  
  if (fs.existsSync(metaFilePath)) {
    const csvContent = fs.readFileSync(metaFilePath, 'utf-8');
    const lines = csvContent.split('\n');
    
    console.log(`✅ Meta file found. Structure:`);
    console.log(`   Header: ${lines[0]}`);
    console.log(`   First data row: ${lines[1]}`);
    
    if (lines.length >= 2) {
      // Simple approach: since we know the dates are at the end, look for the date pattern
      const dataRow = lines[1];
      console.log(`   Looking for dates in: ${dataRow}`);
      
      // Match YYYY-MM-DD pattern at the end of the line
      const dateMatches = dataRow.match(/(\d{4}-\d{2}-\d{2})/g);
      console.log(`   Date matches found: ${dateMatches ? dateMatches.join(', ') : 'none'}`);
      
      if (dateMatches && dateMatches.length >= 2) {
        // Take the last two dates (reporting starts and ends)
        const startDateStr = dateMatches[dateMatches.length - 2];
        const endDateStr = dateMatches[dateMatches.length - 1];
        
        console.log(`   Reporting starts: ${startDateStr}`);
        console.log(`   Reporting ends: ${endDateStr}`);
        
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        console.log(`✅ Detected Meta date range:`);
        console.log(`   Start: ${startDate.toDateString()}`);
        console.log(`   End: ${endDate.toDateString()}`);
        console.log(`   Days: ${dayCount}`);
        
        return { startDate, endDate, dayCount };
      }
    }
  } else {
    console.log(`❌ Meta file not found: ${metaFilePath}`);
  }
  return null;
}

function testGoogleDateDetection() {
  console.log(`\n=== Testing Google CSV Date Detection ===`);
  const googleFilePath = '/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/MOI Original Data/Input Example/GA4 Export  2025-09-10 to 2025-09-23.csv';
  
  if (fs.existsSync(googleFilePath)) {
    const csvContent = fs.readFileSync(googleFilePath, 'utf-8');
    const lines = csvContent.split('\n');
    
    console.log(`✅ Google file found. First few lines:`);
    lines.slice(0, 5).forEach((line, i) => {
      console.log(`   Line ${i + 1}: ${line.substring(0, 100)}...`);
    });
    
    // Look for date range pattern in first few lines
    for (const line of lines.slice(0, 5)) {
      // Pattern: "Month DD, YYYY - Month DD, YYYY"
      const dateRangeMatch = line.match(/(\w+\s+\d+,\s+\d{4})\s*-\s*(\w+\s+\d+,\s+\d{4})/);
      if (dateRangeMatch) {
        const startDate = new Date(dateRangeMatch[1]);
        const endDate = new Date(dateRangeMatch[2]);
        const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        console.log(`✅ Detected Google date range:`);
        console.log(`   Start: ${startDate.toDateString()} (${dateRangeMatch[1]})`);
        console.log(`   End: ${endDate.toDateString()} (${dateRangeMatch[2]})`);
        console.log(`   Days: ${dayCount}`);
        
        return { startDate, endDate, dayCount };
      }
    }
    console.log(`❌ No date range pattern found in Google CSV`);
  } else {
    console.log(`❌ Google file not found: ${googleFilePath}`);
  }
  return null;
}

function consolidateResults(results) {
  console.log(`\n=== Consolidating Date Ranges ===`);
  const validRanges = results.filter(r => r !== null);
  
  if (validRanges.length === 0) {
    console.log(`❌ No valid date ranges detected`);
    return null;
  }
  
  console.log(`✅ Found ${validRanges.length} valid date ranges`);
  
  // Debug each range
  validRanges.forEach((range, i) => {
    console.log(`   Range ${i + 1}: ${range.startDate.toDateString()} to ${range.endDate.toDateString()} (${range.dayCount} days)`);
  });
  
  // Find earliest start and latest end
  let earliestStart = validRanges[0].startDate;
  let latestEnd = validRanges[0].endDate;
  
  for (const range of validRanges) {
    if (range.startDate < earliestStart) {
      earliestStart = range.startDate;
    }
    if (range.endDate > latestEnd) {
      latestEnd = range.endDate;
    }
  }
  
  console.log(`   Earliest start: ${earliestStart.toDateString()}`);
  console.log(`   Latest end: ${latestEnd.toDateString()}`);
  
  const consolidatedDays = Math.ceil((latestEnd.getTime() - earliestStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  console.log(`📅 Consolidated Date Range:`);
  console.log(`   Start: ${earliestStart.toDateString()}`);
  console.log(`   End: ${latestEnd.toDateString()}`);
  console.log(`   Total Days: ${consolidatedDays}`);
  
  return { startDate: earliestStart, endDate: latestEnd, dayCount: consolidatedDays };
}

// Run tests
console.log(`🧪 Dynamic Date Range Detection Test\n`);

const shopifyResult = testShopifyDateDetection("Shopify Export  2025-09-10 to 2025-09-23.csv");
const metaResult = testMetaDateDetection();
const googleResult = testGoogleDateDetection();

const consolidated = consolidateResults([shopifyResult, metaResult, googleResult]);

console.log(`\n✅ Test completed!`);
if (consolidated) {
  console.log(`🎯 Expected result: Sep 10-23, 2025 (14 days)`);
  console.log(`🎯 System should generate data for ${consolidated.dayCount} days instead of hardcoded 30 days`);
}