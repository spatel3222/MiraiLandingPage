/**
 * Template Validation Test Script
 * Validates Default_Logic_v2a.csv and provides detailed error/warning report
 */

const fs = require('fs');
const path = require('path');

// Validation rules from TypeScript definitions
const VALIDATION_RULES = {
  REQUIRED_FIELDS: ['fields', 'outputFileName', 'inputFrom'],
  VALID_OUTPUT_FILES: ['Ad Set Level.csv', 'Top Level Daily.csv'],
  VALID_INPUT_SOURCES: ['Shopify Export', 'Meta Ads', 'Google Ads', 'Manual', 'Calculate', 'Top Level Daily.csv', 'Ad Set Level.csv'],
  VALID_DATA_TYPES: ['Date', 'Text', 'Number']
};

const ESSENTIAL_FIELDS = {
  'Ad Set Level.csv': ['Date', 'Campaign name', 'Ad Set Name'],
  'Top Level Daily.csv': ['Total Users']
};

// Formula validation patterns
const FORMULA_PATTERNS = {
  DIRECT: /^As is from input file\s+column name\s+"([^"]+)"$/i,
  SUM: /^SUM:\s*All numeric field of\s+"?([^"]+)"?$/i,
  SUM_WITH_FILTER: /^SUM:\s*All numeric field of\s+"?([^"]+)"?.*(Limit|limit).*(sum|filter).*$/i,
  AVERAGE: /^AVERAGE:\s*(.+)$/i,
  LOOKUP: /^Look up.+from\s+pivot_temp\.csv.+$/i,
  LOOKUP_MATCH: /^Look up.+and match it to.+$/i,
  PRIMARY_GROUP: /^PRIMARY GROUP:\s*(.+)$/i,
  SECONDARY_GROUP: /^SECONDARY GROUP:\s*(.+)$/i,
  CALCULATION: /^[a-zA-Z\s]+[\+\-\*\/][a-zA-Z\s]+$/i,
  PERCENTAGE: /^Percentage of.+$/i,
  FILTER_OPERATION: /^.+[Ll]imit\s+the\s+sum\s+and\s+filter\s+out.+$/i,
  VALID_TEXT: /^[A-Za-z0-9\s\(\)\+\-\*\/\%\,\.\:\"\'\&\|\>\<\=\!\?]+$/
};

/**
 * Parse CSV file into template rows
 */
function parseTemplateCSV(filePath) {
  try {
    const csvContent = fs.readFileSync(filePath, 'utf-8');
    const lines = csvContent.trim().split('\n');
    
    if (lines.length < 2) {
      throw new Error('CSV file must have header and at least one data row');
    }
    
    // Parse header
    const header = lines[0].split(',').map(h => h.trim());
    console.log('📋 CSV Header:', header);
    
    // Map header to expected field names
    const fieldMapping = {
      'Fields': 'fields',
      'Output File Name': 'outputFileName', 
      'Input from?': 'inputFrom',
      'Type': 'type',
      'Formula': 'formula',
      'Notes': 'notes'
    };
    
    // Parse data rows
    const templateRows = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Simple CSV parsing (handles commas in quotes)
      const values = parseCSVLine(line);
      
      const row = {};
      header.forEach((h, index) => {
        const fieldName = fieldMapping[h] || h.toLowerCase();
        row[fieldName] = values[index] || '';
      });
      
      templateRows.push(row);
    }
    
    console.log(`📊 Parsed ${templateRows.length} template rows`);
    return templateRows;
    
  } catch (error) {
    console.error('❌ Error parsing CSV:', error.message);
    throw error;
  }
}

/**
 * Simple CSV line parser that handles quoted values
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
}

/**
 * Validate template structure and business logic
 */
function validateTemplate(templateRows) {
  const errors = [];
  const warnings = [];
  
  console.log('\n🔍 Starting Template Validation...\n');
  
  // 1. Basic structure validation
  console.log('1️⃣ Basic Structure Validation');
  templateRows.forEach((row, index) => {
    const rowNum = index + 1;
    
    // Check required fields
    VALIDATION_RULES.REQUIRED_FIELDS.forEach(field => {
      if (!row[field] || row[field].trim() === '') {
        errors.push({
          row: rowNum,
          field,
          message: `${field} is required and cannot be empty`,
          severity: 'error',
          code: 'REQUIRED_FIELD_MISSING'
        });
      }
    });
    
    // Validate output file names
    if (row.outputFileName && !VALIDATION_RULES.VALID_OUTPUT_FILES.includes(row.outputFileName)) {
      errors.push({
        row: rowNum,
        field: 'outputFileName',
        message: `Invalid output file name. Must be one of: ${VALIDATION_RULES.VALID_OUTPUT_FILES.join(', ')}`,
        severity: 'error',
        code: 'INVALID_OUTPUT_FILE'
      });
    }
    
    // Validate input sources
    if (row.inputFrom && !VALIDATION_RULES.VALID_INPUT_SOURCES.includes(row.inputFrom)) {
      errors.push({
        row: rowNum,
        field: 'inputFrom',
        message: `Invalid input source. Must be one of: ${VALIDATION_RULES.VALID_INPUT_SOURCES.join(', ')}`,
        severity: 'error',
        code: 'INVALID_INPUT_SOURCE'
      });
    }
    
    // Validate data types
    if (row.type && !VALIDATION_RULES.VALID_DATA_TYPES.includes(row.type)) {
      errors.push({
        row: rowNum,
        field: 'type',
        message: `Invalid data type. Must be one of: ${VALIDATION_RULES.VALID_DATA_TYPES.join(', ')}`,
        severity: 'error',
        code: 'INVALID_DATA_TYPE'
      });
    }
    
    // Formula validation
    if (row.inputFrom !== 'Manual' && (!row.formula || row.formula.trim() === '')) {
      errors.push({
        row: rowNum,
        field: 'formula',
        message: `Formula is required for input source "${row.inputFrom}"`,
        severity: 'error',
        code: 'FORMULA_REQUIRED'
      });
    }
  });
  
  // 2. Formula syntax validation
  console.log('2️⃣ Formula Syntax Validation');
  templateRows.forEach((row, index) => {
    const rowNum = index + 1;
    
    if (!row.formula || row.formula.trim() === '' || row.inputFrom === 'Manual') {
      return;
    }
    
    const formula = row.formula.trim();
    let isValidFormula = false;
    
    // Check against known formula patterns
    Object.entries(FORMULA_PATTERNS).forEach(([patternName, pattern]) => {
      if (pattern.test(formula)) {
        isValidFormula = true;
        console.log(`   ✅ Row ${rowNum}: ${patternName} pattern matched`);
      }
    });
    
    if (!isValidFormula) {
      warnings.push({
        row: rowNum,
        field: 'formula',
        message: `Unrecognized formula pattern: "${formula}". This may still work but please verify.`,
        suggestion: 'Check formula syntax against documented patterns'
      });
    }
  });
  
  // 3. Business logic validation
  console.log('3️⃣ Business Logic Validation');
  const fieldsByFile = {};
  templateRows.forEach(row => {
    if (!fieldsByFile[row.outputFileName]) {
      fieldsByFile[row.outputFileName] = [];
    }
    fieldsByFile[row.outputFileName].push(row.fields);
  });
  
  // Check essential fields
  Object.keys(ESSENTIAL_FIELDS).forEach(outputFile => {
    const requiredFields = ESSENTIAL_FIELDS[outputFile];
    const providedFields = fieldsByFile[outputFile] || [];
    
    requiredFields.forEach(requiredField => {
      if (!providedFields.includes(requiredField)) {
        errors.push({
          row: -1,
          field: 'fields',
          message: `Essential field "${requiredField}" is missing for output file "${outputFile}"`,
          severity: 'error',
          code: 'MISSING_ESSENTIAL_FIELD'
        });
      }
    });
  });
  
  // 4. Check for duplicates
  console.log('4️⃣ Duplicate Field Check');
  const fieldCounts = {};
  templateRows.forEach((row, index) => {
    const key = `${row.outputFileName}:${row.fields}`;
    fieldCounts[key] = (fieldCounts[key] || 0) + 1;
    
    if (fieldCounts[key] > 1) {
      warnings.push({
        row: index + 1,
        field: 'fields',
        message: `Duplicate field name "${row.fields}" found in ${row.outputFileName}`,
        suggestion: 'Consider using unique field names to avoid conflicts'
      });
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: {
      totalRows: templateRows.length,
      errorCount: errors.length,
      warningCount: warnings.length
    }
  };
}

/**
 * Generate detailed validation report
 */
function generateReport(validation) {
  console.log('\n📊 VALIDATION REPORT');
  console.log('==========================================');
  console.log(`Total Rows: ${validation.summary.totalRows}`);
  console.log(`Errors: ${validation.summary.errorCount}`);
  console.log(`Warnings: ${validation.summary.warningCount}`);
  console.log(`Status: ${validation.isValid ? '✅ VALID' : '❌ INVALID'}`);
  
  if (validation.errors.length > 0) {
    console.log('\n🚨 ERRORS:');
    validation.errors.forEach((error, index) => {
      console.log(`${index + 1}. Row ${error.row}: [${error.code}] ${error.message}`);
      console.log(`   Field: ${error.field}`);
      console.log('');
    });
  }
  
  if (validation.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    validation.warnings.forEach((warning, index) => {
      console.log(`${index + 1}. Row ${warning.row}: ${warning.message}`);
      if (warning.suggestion) {
        console.log(`   Suggestion: ${warning.suggestion}`);
      }
      console.log('');
    });
  }
  
  if (validation.isValid) {
    console.log('\n🎉 Template validation passed! Ready for deployment.');
  } else {
    console.log('\n❌ Template validation failed. Please fix errors before proceeding.');
  }
}

/**
 * Main execution
 */
function main() {
  const inputFile = '/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/MOI Original Data/Logic Template/Default_Logic_v2a.csv';
  
  try {
    console.log('🔍 MOI Analytics Template Validator');
    console.log('===================================');
    console.log(`📁 Input File: ${inputFile}`);
    
    // Parse template
    const templateRows = parseTemplateCSV(inputFile);
    
    // Validate template
    const validation = validateTemplate(templateRows);
    
    // Generate report
    generateReport(validation);
    
    // Save detailed report
    const reportPath = '/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/validation_report.json';
    fs.writeFileSync(reportPath, JSON.stringify({
      inputFile,
      timestamp: new Date().toISOString(),
      validation,
      templateRows
    }, null, 2));
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    // Exit with appropriate code
    process.exit(validation.isValid ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

main();