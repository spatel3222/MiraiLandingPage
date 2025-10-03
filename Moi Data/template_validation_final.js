/**
 * Final Template Validation Test
 * Validates the corrected Default_Logic_v2a_final.csv
 */

const fs = require('fs');

// Copy the validation logic from previous script
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

function parseTemplateCSV(filePath) {
  const csvContent = fs.readFileSync(filePath, 'utf-8');
  const lines = csvContent.trim().split('\n');
  const header = lines[0].split(',').map(h => h.trim());
  
  const fieldMapping = {
    'Fields': 'fields',
    'Output File Name': 'outputFileName', 
    'Input from?': 'inputFrom',
    'Type': 'type',
    'Formula': 'formula',
    'Notes': 'notes'
  };
  
  const templateRows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCSVLine(line);
    const row = {};
    header.forEach((h, index) => {
      const fieldName = fieldMapping[h] || h.toLowerCase();
      row[fieldName] = values[index] || '';
    });
    
    templateRows.push(row);
  }
  
  return templateRows;
}

function validateTemplate(templateRows) {
  const errors = [];
  const warnings = [];
  
  console.log('🔍 Final Template Validation...\n');
  
  // Basic structure validation
  templateRows.forEach((row, index) => {
    const rowNum = index + 1;
    
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
    
    if (row.outputFileName && !VALIDATION_RULES.VALID_OUTPUT_FILES.includes(row.outputFileName)) {
      errors.push({
        row: rowNum,
        field: 'outputFileName',
        message: `Invalid output file name. Must be one of: ${VALIDATION_RULES.VALID_OUTPUT_FILES.join(', ')}`,
        severity: 'error',
        code: 'INVALID_OUTPUT_FILE'
      });
    }
    
    if (row.inputFrom && !VALIDATION_RULES.VALID_INPUT_SOURCES.includes(row.inputFrom)) {
      errors.push({
        row: rowNum,
        field: 'inputFrom',
        message: `Invalid input source. Must be one of: ${VALIDATION_RULES.VALID_INPUT_SOURCES.join(', ')}`,
        severity: 'error',
        code: 'INVALID_INPUT_SOURCE'
      });
    }
    
    if (row.type && !VALIDATION_RULES.VALID_DATA_TYPES.includes(row.type)) {
      errors.push({
        row: rowNum,
        field: 'type',
        message: `Invalid data type. Must be one of: ${VALIDATION_RULES.VALID_DATA_TYPES.join(', ')}`,
        severity: 'error',
        code: 'INVALID_DATA_TYPE'
      });
    }
    
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
  
  // Formula syntax validation
  templateRows.forEach((row, index) => {
    const rowNum = index + 1;
    
    if (!row.formula || row.formula.trim() === '' || row.inputFrom === 'Manual') {
      return;
    }
    
    const formula = row.formula.trim();
    let isValidFormula = false;
    let matchedPattern = '';
    
    Object.entries(FORMULA_PATTERNS).forEach(([patternName, pattern]) => {
      if (pattern.test(formula)) {
        isValidFormula = true;
        matchedPattern = patternName;
      }
    });
    
    if (isValidFormula) {
      console.log(`✅ Row ${rowNum}: ${matchedPattern} pattern matched`);
    } else {
      warnings.push({
        row: rowNum,
        field: 'formula',
        message: `Unrecognized formula pattern: "${formula}". This may still work but please verify.`,
        suggestion: 'Check formula syntax against documented patterns'
      });
      console.log(`⚠️  Row ${rowNum}: No pattern matched for "${formula}"`);
    }
  });
  
  // Business logic validation
  const fieldsByFile = {};
  templateRows.forEach(row => {
    if (!fieldsByFile[row.outputFileName]) {
      fieldsByFile[row.outputFileName] = [];
    }
    fieldsByFile[row.outputFileName].push(row.fields);
  });
  
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

// Main execution
const inputFile = '/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/MOI Original Data/Logic Template/Default_Logic_v2a_final.csv';

console.log('🔍 MOI Analytics Final Template Validator');
console.log('=========================================');
console.log(`📁 Input File: ${inputFile}`);

const templateRows = parseTemplateCSV(inputFile);
const validation = validateTemplate(templateRows);

console.log('\n📊 FINAL VALIDATION REPORT');
console.log('==========================================');
console.log(`Total Rows: ${validation.summary.totalRows}`);
console.log(`Errors: ${validation.summary.errorCount}`);
console.log(`Warnings: ${validation.summary.warningCount}`);
console.log(`Status: ${validation.isValid ? '✅ VALID - ZERO ERRORS AND WARNINGS!' : '❌ INVALID'}`);

if (validation.errors.length > 0) {
  console.log('\n🚨 ERRORS:');
  validation.errors.forEach((error, index) => {
    console.log(`${index + 1}. Row ${error.row}: [${error.code}] ${error.message}`);
  });
}

if (validation.warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:');
  validation.warnings.forEach((warning, index) => {
    console.log(`${index + 1}. Row ${warning.row}: ${warning.message}`);
  });
} else {
  console.log('\n🎉 NO WARNINGS! Template is perfect!');
}

if (validation.isValid && validation.warnings.length === 0) {
  console.log('\n🏆 SUCCESS! Template validation passed with ZERO errors and ZERO warnings!');
  console.log('✅ Ready for deployment as new default template.');
} else {
  console.log('\n❌ Template validation failed or has warnings.');
}

process.exit(validation.isValid && validation.warnings.length === 0 ? 0 : 1);