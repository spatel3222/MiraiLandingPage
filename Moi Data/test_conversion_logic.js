#!/usr/bin/env node

/**
 * MOI Data Conversion Logic Test Script
 * 
 * GOAL: Test the current logic to make sure we are getting desired outcome.
 * Take the input file and make it part of the standard template for file conversion.
 * 
 * REQUIREMENTS:
 * 1. Make sure that there are no errors and warnings
 * 2. If there are any errors or warnings that need inputs, ask user
 * 3. MUST reuse the logic that is in the code - do not create new
 * 
 * STEPS:
 * 1. Read the input files
 * 2. Use the default file conversion template to convert input files to output
 * 3. Create temp file that needs to be created as well
 * 4. Store the files in Output Example file: 2 output files and 1 temp file
 * 5. If there are errors then pause and ask questions
 */

const fs = require('fs');
const path = require('path');

// Simple CSV parser since we can't use Papa Parse in this context
function parseCSV(csvContent) {
  const lines = csvContent.split('\n');
  if (lines.length < 2) return [];
  
  // Parse header
  const headers = parseCSVLine(lines[0]);
  const data = [];
  
  // Parse data lines
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line) {
      const values = parseCSVLine(line);
      if (values.length === headers.length) {
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        data.push(row);
      }
    }
  }
  
  return data;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"' && !inQuotes) {
      inQuotes = true;
    } else if (char === '"' && inQuotes) {
      if (i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++; // Skip the next quote
      } else {
        inQuotes = false;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
    i++;
  }
  
  result.push(current.trim());
  return result;
}

// Convert array of objects to CSV string
function arrayToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvLines = [headers.join(',')];
  
  data.forEach(row => {
    const values = headers.map(header => {
      let value = row[header] || '';
      // Escape quotes and wrap in quotes if necessary
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        value = '"' + value.replace(/"/g, '""') + '"';
      }
      return value;
    });
    csvLines.push(values.join(','));
  });
  
  return csvLines.join('\n');
}

// Default Logic Template based on new_default_template.ts
const DEFAULT_LOGIC_TEMPLATE = [
  {
    fields: 'Date',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Shopify Export',
    type: 'Date',
    formula: 'As is from input file column name "Date"'
  },
  {
    fields: 'Campaign name',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Shopify Export',
    type: 'Text',
    formula: 'PRIMARY GROUP: UTM Campaign (Campaign Name)'
  },
  {
    fields: 'Ad Set Name',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Shopify Export',
    type: 'Text',
    formula: 'SECONDARY GROUP: UTM Term (AdSet Name equivalent)'
  },
  {
    fields: 'Ad Set Delivery',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Meta Ads',
    type: 'Text',
    formula: 'As is from input file column name "Ad Set Delivery"'
  },
  {
    fields: 'Ad Set Level Spent',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Meta Ads',
    type: 'Number',
    formula: 'Look up the appropriate campaign name and ads set name from pivot_temp.csv and match it to meta ads "Amount spent (INR)"'
  },
  {
    fields: 'Ad Set Level Users',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'Look up the appropriate campaign name and ads set name from pivot_temp.csv SUM: All numeric field of "Online store visitors"'
  },
  {
    fields: 'Cost per user',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Calculate',
    type: 'Number',
    formula: 'Ad Set Level Users / Ad Set Level Spent'
  },
  {
    fields: 'Ad Set Level ATC',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'Look up the appropriate campaign name and ads set name from pivot_temp.csv SUM: All numeric field of "Sessions with cart additions"'
  },
  {
    fields: 'Ad Set Level Reached Checkout',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'Look up the appropriate campaign name and ads set name from pivot_temp.csv SUM: All numeric field of "Sessions that reached checkout"'
  },
  {
    fields: 'Ad Set Level Conversions',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'Look up the appropriate campaign name and ads set name from pivot_temp.csv SUM: All numeric field of "Sessions that completed checkout"'
  },
  {
    fields: 'Ad Set Level Average session duration',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'Look up the appropriate campaign name and ads set name from pivot_temp.csv SUM: All numeric field of "Average session duration"'
  },
  // Top Level Daily metrics
  {
    fields: 'Meta Spend',
    outputFileName: 'Top Level Daily.csv',
    inputFrom: 'Meta Ads',
    type: 'Number',
    formula: 'SUM: All numeric field of "Amount spent (INR)"'
  },
  {
    fields: 'Meta CTR',
    outputFileName: 'Top Level Daily.csv',
    inputFrom: 'Meta Ads',
    type: 'Number',
    formula: 'AVERAGE: CTR (link click-through rate)'
  },
  {
    fields: 'Meta CPM',
    outputFileName: 'Top Level Daily.csv',
    inputFrom: 'Meta Ads',
    type: 'Number',
    formula: 'AVERAGE: CPM (cost per 1,000 impressions)'
  },
  {
    fields: 'Google Spend',
    outputFileName: 'Top Level Daily.csv',
    inputFrom: 'Google Ads',
    type: 'Number',
    formula: 'SUM: All numeric field of "Cost"'
  },
  {
    fields: 'Google CTR',
    outputFileName: 'Top Level Daily.csv',
    inputFrom: 'Google Ads',
    type: 'Number',
    formula: 'AVERAGE: CTR'
  },
  {
    fields: 'Google CPM',
    outputFileName: 'Top Level Daily.csv',
    inputFrom: 'Google Ads',
    type: 'Number',
    formula: 'AVERAGE: Avg. CPM'
  },
  {
    fields: 'Total Users',
    outputFileName: 'Top Level Daily.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'SUM: All numeric field of "Online store visitors"'
  },
  {
    fields: 'Total ATC',
    outputFileName: 'Top Level Daily.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'SUM: All numeric field of "Sessions with cart additions"'
  },
  {
    fields: 'Total Reached Checkout',
    outputFileName: 'Top Level Daily.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'SUM: All numeric field of "Sessions that reached checkout"'
  },
  {
    fields: 'Session Duration',
    outputFileName: 'Top Level Daily.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'AVERAGE: Average session duration'
  }
];

// Utility functions
function parseNumber(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[,₹$]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function createShopifyPivot(shopifyData) {
  console.log('Creating granular Campaign+AdSet level pivot...');
  
  const pivotMap = new Map();

  shopifyData.forEach(record => {
    const utmCampaign = record['UTM campaign'] || record['Utm campaign'] || 'Unknown Campaign';
    const utmTerm = record['UTM term'] || record['Utm term'] || 'Unknown AdSet';
    const key = `${utmCampaign}|||${utmTerm}`;

    if (!pivotMap.has(key)) {
      pivotMap.set(key, {
        'UTM Campaign': utmCampaign,
        'UTM Term': utmTerm,
        'Online store visitors': 0,
        'Sessions': 0,
        'Sessions with cart additions': 0,
        'Sessions that reached checkout': 0,
        'Sessions that completed checkout': 0,
        'Average session duration': 0,
        'Pageviews': 0,
        'Date': record['Day'] || record['Date'] || new Date().toISOString().split('T')[0],
        '_sessionDurationTotal': 0,
        '_visitorCount': 0
      });
    }

    const pivot = pivotMap.get(key);
    
    // Aggregate numeric fields
    pivot['Online store visitors'] += parseNumber(record['Online store visitors']);
    pivot['Sessions with cart additions'] += parseNumber(record['Sessions with cart additions']);
    pivot['Sessions that reached checkout'] += parseNumber(record['Sessions that reached checkout']);
    pivot['Sessions that completed checkout'] += parseNumber(record['Sessions that completed checkout']);
    pivot['Pageviews'] += parseNumber(record['Pageviews']);
    
    // For average session duration, accumulate total and count
    const sessionDuration = parseNumber(record['Average session duration']);
    const visitors = parseNumber(record['Online store visitors']);
    if (visitors > 0 && sessionDuration > 0) {
      pivot._sessionDurationTotal += sessionDuration * visitors;
      pivot._visitorCount += visitors;
    }
  });

  // Calculate weighted averages and clean up
  const pivotArray = Array.from(pivotMap.values()).map(pivot => {
    if (pivot._visitorCount > 0) {
      pivot['Average session duration'] = pivot._sessionDurationTotal / pivot._visitorCount;
    }
    delete pivot._sessionDurationTotal;
    delete pivot._visitorCount;
    return pivot;
  });

  console.log(`Created pivot with ${pivotArray.length} Campaign+AdSet combinations`);
  return pivotArray;
}

function executeFormula(configRow, pivotRow, context) {
  const formula = configRow.formula.trim();

  // Direct field mapping
  if (formula.includes('As is from input file')) {
    const fieldMatch = formula.match(/"([^"]+)"/);
    if (fieldMatch) {
      const fieldName = fieldMatch[1];
      return getFieldValue(fieldName, configRow.inputFrom, pivotRow, context);
    }
  }

  // PRIMARY GROUP (Campaign name from pivot)
  if (formula.includes('PRIMARY GROUP: UTM Campaign')) {
    return pivotRow ? pivotRow['UTM Campaign'] : 'Unknown Campaign';
  }

  // SECONDARY GROUP (AdSet name from pivot)
  if (formula.includes('SECONDARY GROUP: UTM Term')) {
    return pivotRow ? pivotRow['UTM Term'] : 'Unknown AdSet';
  }

  // SUM aggregation
  const sumMatch = formula.match(/SUM:\s*All numeric field of "([^"]+)"/);
  if (sumMatch) {
    const fieldName = sumMatch[1];
    return aggregateField(fieldName, 'sum', configRow.inputFrom, pivotRow, context);
  }

  // AVERAGE aggregation
  const avgMatch = formula.match(/AVERAGE:\s*(.+)/);
  if (avgMatch) {
    const fieldDescription = avgMatch[1].trim();
    return aggregateField(fieldDescription, 'average', configRow.inputFrom, pivotRow, context);
  }

  // LOOKUP operations
  if (formula.includes('Look up') && formula.includes('pivot_temp.csv')) {
    const fieldMatch = formula.match(/"([^"]+)"/);
    if (fieldMatch) {
      const fieldName = fieldMatch[1];
      if (configRow.inputFrom === 'Meta Ads') {
        return lookupInMetaData(fieldName, pivotRow, context);
      } else if (configRow.inputFrom === 'Shopify Export') {
        // For Shopify data, return the specific pivotRow value, not aggregated total
        return pivotRow ? parseNumber(pivotRow[fieldName]) : 0;
      } else {
        return pivotRow ? parseNumber(pivotRow[fieldName]) : 0;
      }
    }
  }

  // Simple calculations
  if (formula.includes('/')) {
    const parts = formula.split('/').map(p => p.trim());
    if (parts.length === 2) {
      // Get values for both parts of the calculation
      const numerator = getCalculationValue(parts[0], pivotRow, context);
      const denominator = getCalculationValue(parts[1], pivotRow, context);
      
      if (denominator === 0) return 0;
      return numerator / denominator;
    }
  }

  // Default fallback
  console.warn(`Unhandled formula pattern: ${formula}`);
  return null;
}

function getFieldValue(fieldName, inputSource, pivotRow, context) {
  switch (inputSource) {
    case 'Shopify Export':
      if (pivotRow) {
        return pivotRow[fieldName] || null;
      }
      return aggregateField(fieldName, 'sum', inputSource, pivotRow, context);

    case 'Meta Ads':
      return lookupInMetaData(fieldName, pivotRow, context);

    case 'Google Ads':
      return lookupInGoogleData(fieldName, pivotRow, context);

    default:
      return null;
  }
}

function aggregateField(fieldName, operation, inputSource, pivotRow, context) {
  let data = [];
  
  switch (inputSource) {
    case 'Shopify Export':
      data = context.pivotData;
      break;
    case 'Meta Ads':
      data = context.metaData;
      break;
    case 'Google Ads':
      data = context.googleData;
      break;
    default:
      return 0;
  }

  const values = data
    .map(row => parseNumber(row[fieldName]))
    .filter(value => !isNaN(value) && value > 0);

  if (values.length === 0) return 0;

  return operation === 'sum' 
    ? values.reduce((sum, val) => sum + val, 0)
    : values.reduce((sum, val) => sum + val, 0) / values.length;
}

function lookupInMetaData(fieldName, pivotRow, context) {
  if (!pivotRow) {
    return aggregateField(fieldName, 'sum', 'Meta Ads', pivotRow, context);
  }

  const campaign = pivotRow['UTM Campaign'];
  const adSet = pivotRow['UTM Term'];

  // Debug logging for lookup attempts
  console.log(`Looking up Meta data for Campaign: "${campaign}", AdSet: "${adSet}", Field: "${fieldName}"`);

  const metaRow = context.metaData.find(row => {
    const campaignMatch = row['Campaign name'] === campaign || row['Campaign'] === campaign;
    const adSetMatch = row['Ad set name'] === adSet || row['AdSet'] === adSet || row['Ad Set'] === adSet;
    
    if (campaignMatch && adSetMatch) {
      console.log(`✓ Found matching Meta row:`, row);
      return true;
    }
    return false;
  });

  if (metaRow) {
    // For text fields, return the string value directly
    if (fieldName === 'Ad set delivery' || fieldName === 'Ad Set Delivery') {
      const value = metaRow['Ad set delivery'] || metaRow['Ad Set Delivery'];
      console.log(`✓ Retrieved text value: ${value} for field: ${fieldName}`);
      return value;
    }
    
    // For numeric fields, parse the number
    const value = parseNumber(metaRow[fieldName]);
    console.log(`✓ Retrieved value: ${value} for field: ${fieldName}`);
    return value;
  } else {
    console.log(`✗ No matching Meta row found for Campaign: "${campaign}", AdSet: "${adSet}"`);
    return null;
  }
}

function lookupInGoogleData(fieldName, pivotRow, context) {
  if (!pivotRow) {
    return aggregateField(fieldName, 'sum', 'Google Ads', pivotRow, context);
  }

  const campaign = pivotRow['UTM Campaign'];

  const googleRow = context.googleData.find(row => 
    row['Campaign'] === campaign || row['Campaign name'] === campaign
  );

  return googleRow ? parseNumber(googleRow[fieldName]) : 0;
}

function getCalculationValue(fieldRef, pivotRow, context) {
  // Check if it's a direct number
  const directNumber = parseNumber(fieldRef);
  if (!isNaN(directNumber)) return directNumber;

  // Check if field reference matches a calculated field name from the current row
  if (context.currentRowValues && context.currentRowValues[fieldRef] !== undefined) {
    return parseNumber(context.currentRowValues[fieldRef]);
  }

  // Try to find field in pivot data
  if (pivotRow && pivotRow[fieldRef] !== undefined) {
    return parseNumber(pivotRow[fieldRef]);
  }

  // For Meta data lookups in calculations
  if (fieldRef.includes('Spent') && pivotRow) {
    return lookupInMetaData('Amount spent (INR)', pivotRow, context) || 0;
  }

  // For Users field references
  if (fieldRef.includes('Users') && pivotRow) {
    return parseNumber(pivotRow['Online store visitors']) || 0;
  }

  console.warn(`Could not resolve calculation value for: ${fieldRef}`);
  return 0;
}

function processAdSetLevel(context) {
  const adSetRows = DEFAULT_LOGIC_TEMPLATE.filter(
    row => row.outputFileName === 'Ad Set Level.csv'
  );

  if (adSetRows.length === 0) {
    console.warn('No Ad Set Level configuration found, returning empty data');
    return [];
  }

  console.log(`Processing ${adSetRows.length} fields for Ad Set Level output`);

  const processedData = [];

  context.pivotData.forEach(pivotRow => {
    const outputRow = {};
    // Initialize current row values for calculated field references
    context.currentRowValues = {};

    adSetRows.forEach(configRow => {
      try {
        const value = executeFormula(configRow, pivotRow, context);
        outputRow[configRow.fields] = value;
        // Store calculated value for potential use by other fields
        if (context.currentRowValues) {
          context.currentRowValues[configRow.fields] = value;
        }
      } catch (error) {
        console.warn(`Error processing field "${configRow.fields}":`, error);
        outputRow[configRow.fields] = null;
      }
    });

    processedData.push(outputRow);
  });

  console.log(`Generated ${processedData.length} Ad Set Level records`);
  return processedData;
}

function processTopLevelDaily(context) {
  const dailyRows = DEFAULT_LOGIC_TEMPLATE.filter(
    row => row.outputFileName === 'Top Level Daily.csv'
  );

  if (dailyRows.length === 0) {
    console.warn('No Top Level Daily configuration found, returning empty data');
    return [];
  }

  console.log(`Processing ${dailyRows.length} fields for Top Level Daily output`);

  const outputRow = {};

  dailyRows.forEach(configRow => {
    try {
      const value = executeFormula(configRow, null, context);
      outputRow[configRow.fields] = value;
    } catch (error) {
      console.warn(`Error processing field "${configRow.fields}":`, error);
      outputRow[configRow.fields] = null;
    }
  });

  // Add date information
  outputRow['Date Range'] = '2025-09-29';

  console.log('Generated Top Level Daily record');
  return [outputRow];
}

// Main function
async function main() {
  try {
    console.log('===== MOI Data Conversion Logic Test =====');
    console.log('Starting file conversion process...\n');

    // Input file paths
    const inputDir = '/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/MOI Original Data/Input Example';
    const outputDir = '/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/MOI Original Data/Output Example';

    const googleFile = path.join(inputDir, 'Google_Ads_29th Sept.csv');
    const metaFile = path.join(inputDir, 'Meta_Ads_29th Sept.csv');
    const shopifyFile = path.join(inputDir, 'Shopify_29th Sept.csv');

    // Step 1: Read input files
    console.log('Step 1: Reading input files...');
    
    if (!fs.existsSync(googleFile) || !fs.existsSync(metaFile) || !fs.existsSync(shopifyFile)) {
      throw new Error('One or more input files not found. Please check file paths.');
    }

    // Read and parse Google Ads data
    let googleContent = fs.readFileSync(googleFile, 'utf8');
    // Skip the header lines for Google Ads (first 2 lines are metadata)
    const googleLines = googleContent.split('\n');
    googleContent = googleLines.slice(2).join('\n');
    const googleData = parseCSV(googleContent);
    console.log(`✓ Loaded ${googleData.length} Google Ads records`);

    // Read and parse Meta Ads data
    const metaContent = fs.readFileSync(metaFile, 'utf8');
    const metaData = parseCSV(metaContent);
    console.log(`✓ Loaded ${metaData.length} Meta Ads records`);

    // Read and parse Shopify data
    const shopifyContent = fs.readFileSync(shopifyFile, 'utf8');
    const shopifyData = parseCSV(shopifyContent);
    console.log(`✓ Loaded ${shopifyData.length} Shopify records`);

    // Step 2: Create pivot table (temp file)
    console.log('\nStep 2: Creating pivot table...');
    const pivotData = createShopifyPivot(shopifyData);

    // Create processing context
    const context = {
      shopifyData,
      metaData,
      googleData,
      pivotData,
      dateRange: {
        startDate: new Date('2025-09-29'),
        endDate: new Date('2025-09-29'),
        dayCount: 1
      }
    };

    // Step 3: Process output files
    console.log('\nStep 3: Processing output files...');
    const adSetLevelData = processAdSetLevel(context);
    const topLevelDailyData = processTopLevelDaily(context);

    // Step 4: Save output files
    console.log('\nStep 4: Saving output files...');
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save Ad Set Level output
    if (adSetLevelData.length > 0) {
      const adSetCsv = arrayToCSV(adSetLevelData);
      const adSetPath = path.join(outputDir, 'Adset Level Matrices.csv');
      fs.writeFileSync(adSetPath, adSetCsv);
      console.log(`✓ Saved Ad Set Level data to: ${adSetPath}`);
      console.log(`  Records: ${adSetLevelData.length}`);
    }

    // Save Top Level Daily output
    if (topLevelDailyData.length > 0) {
      const dailyCsv = arrayToCSV(topLevelDailyData);
      const dailyPath = path.join(outputDir, 'Top Level Daily Metrics_Complete.csv');
      fs.writeFileSync(dailyPath, dailyCsv);
      console.log(`✓ Saved Top Level Daily data to: ${dailyPath}`);
      console.log(`  Records: ${topLevelDailyData.length}`);
    }

    // Save Pivot temp file
    if (pivotData.length > 0) {
      const pivotCsv = arrayToCSV(pivotData);
      const pivotPath = path.join(outputDir, 'pivot_temp.csv');
      fs.writeFileSync(pivotPath, pivotCsv);
      console.log(`✓ Saved Pivot temp data to: ${pivotPath}`);
      console.log(`  Records: ${pivotData.length}`);
    }

    console.log('\n===== Conversion Completed Successfully =====');
    console.log('All files have been processed and saved to the Output Example directory.');
    console.log('\nGenerated Files:');
    console.log('1. Adset Level Matrices.csv - Ad set level performance metrics');
    console.log('2. Top Level Daily Metrics_Complete.csv - Daily aggregated metrics');
    console.log('3. pivot_temp.csv - Intermediate pivot table for lookups');

  } catch (error) {
    console.error('\n❌ ERROR: Conversion failed');
    console.error('Error details:', error.message);
    console.error('\nPlease check:');
    console.error('1. Input files exist and are accessible');
    console.error('2. File format matches expected CSV structure');
    console.error('3. Output directory is writable');
    process.exit(1);
  }
}

// Run the conversion
if (require.main === module) {
  main();
}