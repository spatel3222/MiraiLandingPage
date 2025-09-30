import * as LogicTypes from '../types/logicConfiguration';
import { IntelligentFormulaValidator } from './intelligentFormulaValidator';

type LogicTemplateRow = LogicTypes.LogicTemplateRow;
type ValidationResult = LogicTypes.ValidationResult;
type ValidationError = LogicTypes.ValidationError;
type ValidationWarning = LogicTypes.ValidationWarning;
const VALIDATION_RULES = LogicTypes.VALIDATION_RULES;

export class LogicTemplateValidator {
  private static readonly ESSENTIAL_FIELDS = {
    'Ad Set Level.csv': [
      'Date', 'Campaign name', 'Ad Set Name'
    ],
    'Top Level Daily.csv': [
      'Total Users'
    ]
  };

  private static readonly SHOPIFY_FIELDS = [
    'Date', 'Utm campaign', 'Utm term', 'Landing page url', 'Online store visitors',
    'Sessions', 'Sessions with cart additions', 'Sessions that reached checkout',
    'Average session duration', 'Pageviews'
  ];

  private static readonly META_FIELDS = [
    'Campaign name', 'Ad Set Name', 'Ad Set Delivery', 'Amount spent (INR)',
    'CTR (link click-through rate)', 'CPM (cost per 1,000 impressions)'
  ];

  private static readonly GOOGLE_FIELDS = [
    'Campaign', 'Cost', 'CTR', 'Avg. CPM'
  ];

  /**
   * Main validation function - Comprehensive validation logic with LLM intelligence
   */
  static async validateTemplate(templateRows: LogicTemplateRow[]): Promise<ValidationResult> {
    let allErrors: ValidationError[] = [];
    let allWarnings: ValidationWarning[] = [];

    // 1. Basic structure validation (required fields, valid values)
    const basicErrors = this.validateBasicStructure(templateRows);
    allErrors = allErrors.concat(basicErrors);

    // 2. Intelligent LLM-powered formula validation
    try {
      const intelligentValidation = await IntelligentFormulaValidator.validateFormulasIntelligently(templateRows);
      allErrors = allErrors.concat(intelligentValidation.errors);
      allWarnings = allWarnings.concat(intelligentValidation.warnings);
    } catch (error) {
      // Fallback to basic formula validation if LLM fails
      const formulaErrors = this.validateFormulaSyntax(templateRows);
      allErrors = allErrors.concat(formulaErrors);
    }

    // 3. Business logic validation (essential fields per output file)
    const businessErrors = this.validateBusinessLogic(templateRows);
    allErrors = allErrors.concat(businessErrors);

    // 4. Generate warnings for optimization suggestions
    const warnings = this.generateWarnings(templateRows);
    allWarnings = allWarnings.concat(warnings);

    // 5. Circular dependency detection
    const circularErrors = this.detectCircularDependencies(templateRows);
    allErrors = allErrors.concat(circularErrors);

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }

  /**
   * Validate basic template structure and required fields
   */
  private static validateBasicStructure(templateRows: LogicTemplateRow[]): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!templateRows || templateRows.length === 0) {
      errors.push({
        row: -1,
        field: 'template',
        message: 'Template is empty. Please add at least one field configuration.',
        severity: 'error',
        code: 'EMPTY_TEMPLATE'
      });
      return errors;
    }

    templateRows.forEach((row, index) => {
      const rowNum = index + 1;

      // Check required fields (excluding notes which is always optional)
      VALIDATION_RULES.REQUIRED_FIELDS.forEach(field => {
        if (field === 'notes') return; // Skip notes validation entirely
        
        const fieldValue = (row as any)[field];
        if (!fieldValue || fieldValue.trim() === '') {
          errors.push({
            row: rowNum,
            field,
            message: `${field} is required and cannot be empty.`,
            severity: 'error',
            code: 'REQUIRED_FIELD_MISSING'
          });
        }
      });

      // Special check for formula - only required if not Manual input
      if (row.inputFrom !== 'Manual' && (!row.formula || row.formula.trim() === '')) {
        errors.push({
          row: rowNum,
          field: 'formula',
          message: `Formula is required for input source "${row.inputFrom}".`,
          severity: 'error',
          code: 'FORMULA_REQUIRED'
        });
      }

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
    });

    return errors;
  }

  /**
   * Validate formula syntax and patterns
   */
  private static validateFormulaSyntax(templateRows: LogicTemplateRow[]): ValidationError[] {
    const errors: ValidationError[] = [];

    templateRows.forEach((row, index) => {
      const rowNum = index + 1;
      
      // Skip validation if formula is empty or for Manual input
      if (!row.formula || row.formula.trim() === '' || row.inputFrom === 'Manual') {
        return;
      }

      const formula = row.formula.trim();
      let isValidFormula = false;

      // Check against known formula patterns
      Object.values(VALIDATION_RULES.FORMULA_PATTERNS).forEach(pattern => {
        if (pattern.test(formula)) {
          isValidFormula = true;
        }
      });

      // Special case: simple arithmetic operations
      if (!isValidFormula && /^[a-zA-Z\s]+[\+\-\*\/][a-zA-Z\s]+$/.test(formula)) {
        isValidFormula = true;
      }

      // If still not valid, make it a warning instead of error for unknown patterns
      if (!isValidFormula) {
        errors.push({
          row: rowNum,
          field: 'formula',
          message: `Unrecognized formula pattern: "${formula}". This may still work but please verify.`,
          severity: 'warning',
          code: 'UNKNOWN_FORMULA_PATTERN'
        });
      }
    });

    return errors;
  }

  /**
   * Validate business logic requirements
   */
  private static validateBusinessLogic(templateRows: LogicTemplateRow[]): ValidationError[] {
    const errors: ValidationError[] = [];

    // Group fields by output file
    const fieldsByFile: { [key: string]: string[] } = {};
    templateRows.forEach(row => {
      if (!fieldsByFile[row.outputFileName]) {
        fieldsByFile[row.outputFileName] = [];
      }
      fieldsByFile[row.outputFileName].push(row.fields);
    });

    // Check essential fields for each output file
    Object.keys(this.ESSENTIAL_FIELDS).forEach(outputFile => {
      const requiredFields = this.ESSENTIAL_FIELDS[outputFile];
      const providedFields = fieldsByFile[outputFile] || [];

      requiredFields.forEach(requiredField => {
        if (!providedFields.includes(requiredField)) {
          errors.push({
            row: -1, // Use -1 to indicate this is a global/configuration-level error
            field: 'fields',
            message: `Essential field "${requiredField}" is missing for output file "${outputFile}".`,
            severity: 'error',
            code: 'MISSING_ESSENTIAL_FIELD'
          });
        }
      });
    });

    return errors;
  }

  // Note: Data source field validation and calculated field validation 
  // are now handled by the intelligent LLM-powered validator

  /**
   * Detect circular dependencies in calculated fields
   */
  private static detectCircularDependencies(templateRows: LogicTemplateRow[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const fieldMap = new Map<string, LogicTemplateRow>();
    
    // Build field map
    templateRows.forEach(row => {
      fieldMap.set(row.fields.toLowerCase(), row);
    });

    // Check for circular dependencies using DFS
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCircularDependency = (fieldName: string, path: string[] = []): boolean => {
      if (recursionStack.has(fieldName)) {
        // Found circular dependency
        const cycleStart = path.indexOf(fieldName);
        const cycle = path.slice(cycleStart).concat([fieldName]);
        
        errors.push({
          row: -1, // Use -1 for global configuration errors
          field: 'formula',
          message: `Circular dependency detected: ${cycle.join(' → ')}`,
          severity: 'error',
          code: 'CIRCULAR_DEPENDENCY'
        });
        return true;
      }

      if (visited.has(fieldName)) {
        return false;
      }

      visited.add(fieldName);
      recursionStack.add(fieldName);

      const field = fieldMap.get(fieldName);
      if (field && field.inputFrom === 'Calculate') {
        // Extract field references from formula
        const fieldReferences = field.formula.match(/[a-zA-Z\s]+/g);
        if (fieldReferences) {
          for (const fieldRef of fieldReferences) {
            const cleanField = fieldRef.trim().toLowerCase();
            if (cleanField && !['/', '+', '-', '*'].includes(cleanField)) {
              if (fieldMap.has(cleanField)) {
                if (hasCircularDependency(cleanField, [...path, fieldName])) {
                  return true;
                }
              }
            }
          }
        }
      }

      recursionStack.delete(fieldName);
      return false;
    };

    // Check each calculated field
    templateRows.forEach(row => {
      if (row.inputFrom === 'Calculate') {
        visited.clear();
        recursionStack.clear();
        hasCircularDependency(row.fields.toLowerCase());
      }
    });

    return errors;
  }

  /**
   * Generate warnings for optimization suggestions
   */
  private static generateWarnings(templateRows: LogicTemplateRow[]): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    // Check for duplicate field names within same output file
    const fieldCounts: { [key: string]: number } = {};
    templateRows.forEach((row, index) => {
      const key = `${row.outputFileName}:${row.fields}`;
      fieldCounts[key] = (fieldCounts[key] || 0) + 1;
      
      if (fieldCounts[key] > 1) {
        warnings.push({
          row: index + 1,
          field: 'fields',
          message: `Duplicate field name "${row.fields}" found in ${row.outputFileName}.`,
          suggestion: 'Consider using unique field names to avoid conflicts.'
        });
      }
    });

    // Notes field is completely optional and free-text - no validation needed

    return warnings;
  }

  /**
   * Quick validation for real-time feedback (lighter validation)
   */
  static quickValidate(templateRows: LogicTemplateRow[]): { hasErrors: boolean; errorCount: number; warningCount: number } {
    const basicErrors = this.validateBasicStructure(templateRows);
    const warnings = this.generateWarnings(templateRows);

    // Skip complex LLM validation for quick feedback
    const quickFormulaErrors = templateRows.filter(row => 
      row.inputFrom !== 'Manual' && (!row.formula || row.formula.trim() === '')
    ).length;

    return {
      hasErrors: basicErrors.length > 0 || quickFormulaErrors > 0,
      errorCount: basicErrors.length + quickFormulaErrors,
      warningCount: warnings.length
    };
  }

  /**
   * Get available fields for a specific data source (helper for UI)
   */
  static getAvailableFields(dataSource: string): string[] {
    switch (dataSource) {
      case 'Shopify Export':
        return this.SHOPIFY_FIELDS;
      case 'Meta Ads':
        return this.META_FIELDS;
      case 'Google Ads':
        return this.GOOGLE_FIELDS;
      default:
        return [];
    }
  }

  /**
   * Get formula examples for guidance (helper for UI)
   */
  static getFormulaExamples(): { [key: string]: string[] } {
    return {
      'Direct Mapping': [
        'As is from input file column name "Date"',
        'As is from input file column name "Campaign name"'
      ],
      'Aggregation': [
        'SUM: All numeric field of "Online store visitors"',
        'AVERAGE: CTR (link click-through rate)'
      ],
      'Grouping': [
        'PRIMARY GROUP: UTM Campaign (Campaign Name)',
        'SECONDARY GROUP: UTM Term (AdSet Name equivalent)'
      ],
      'Calculation': [
        'Users / Spent',
        'ATC / Users * 100'
      ],
      'Lookup': [
        'Look up the appropriate campaign name and ads set name from pivot_temp.csv and match it to meta ads "Amount spent (INR)"'
      ]
    };
  }
}