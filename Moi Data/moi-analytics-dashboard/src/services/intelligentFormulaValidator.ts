import type * as LogicTypes from '../types/logicConfiguration';
type LogicTemplateRow = LogicTypes.LogicTemplateRow;
type ValidationError = LogicTypes.ValidationError;
type ValidationWarning = LogicTypes.ValidationWarning;

interface FormulaAnalysis {
  intent: string;
  operation: string;
  sourceFields: string[];
  isCalculated: boolean;
  hasConditionals: boolean;
  confidence: number;
  suggestedMapping?: string;
}

export class IntelligentFormulaValidator {
  
  /**
   * Analyze formula using LLM to understand intent and validate logic
   */
  static async analyzeFormula(formula: string, inputSource: string, fieldName: string): Promise<FormulaAnalysis> {
    const prompt = `
Analyze this data transformation formula and extract key information:

Formula: "${formula}"
Input Source: "${inputSource}"
Output Field: "${fieldName}"

Please analyze and provide:
1. Intent: What is this formula trying to accomplish?
2. Operation: Type of operation (direct mapping, aggregation, calculation, lookup, grouping, filtering)
3. Source Fields: What source fields/columns are referenced?
4. Is Calculated: Does this involve mathematical calculations between fields?
5. Has Conditionals: Does this include filtering or conditional logic?
6. Confidence: How confident are you this is a valid data transformation (0-100)?
7. Suggested Mapping: If this seems invalid, suggest a corrected version

Return as JSON with these exact keys: intent, operation, sourceFields, isCalculated, hasConditionals, confidence, suggestedMapping
`;

    try {
      // Using fetch to call local LLM endpoint or could integrate with OpenAI/Claude API
      const response = await this.callLLM(prompt);
      return JSON.parse(response);
    } catch (error) {
      // Fallback analysis if LLM call fails
      return this.fallbackAnalysis(formula, inputSource);
    }
  }

  /**
   * Enhanced validation using LLM analysis
   */
  static async validateFormulasIntelligently(templateRows: LogicTemplateRow[]): Promise<{
    errors: ValidationError[];
    warnings: ValidationWarning[];
    analyses: Map<number, FormulaAnalysis>;
  }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const analyses = new Map<number, FormulaAnalysis>();

    // Analyze all formulas in parallel
    const analysisPromises = templateRows.map(async (row, index) => {
      if (!row.formula || row.formula.trim() === '' || row.inputFrom === 'Manual') {
        return null;
      }

      try {
        const analysis = await this.analyzeFormula(row.formula, row.inputFrom, row.fields);
        analyses.set(index, analysis);

        // Generate errors/warnings based on LLM analysis
        const rowNum = index + 1;

        if (analysis.confidence < 50) {
          errors.push({
            row: rowNum,
            field: 'formula',
            message: `Low confidence in formula interpretation: ${analysis.intent}. ${analysis.suggestedMapping ? 'Suggested: ' + analysis.suggestedMapping : ''}`,
            severity: 'error',
            code: 'LOW_CONFIDENCE_FORMULA'
          });
        } else if (analysis.confidence < 75) {
          warnings.push({
            row: rowNum,
            field: 'formula',
            message: `Moderate confidence in formula: ${analysis.intent}. Please verify this matches your intended logic.`,
            suggestion: analysis.suggestedMapping || 'Consider clarifying the formula language'
          });
        }

        // Check for missing field references in calculated fields
        if (analysis.isCalculated && analysis.sourceFields.length > 0) {
          const definedFields = new Set(templateRows.map(r => r.fields.toLowerCase()));
          const missingFields = analysis.sourceFields.filter(field => 
            !definedFields.has(field.toLowerCase()) && 
            !this.isKnownSourceField(field, row.inputFrom)
          );

          if (missingFields.length > 0) {
            errors.push({
              row: rowNum,
              field: 'formula',
              message: `Formula references undefined fields: ${missingFields.join(', ')}. Make sure these fields are defined elsewhere in the template.`,
              severity: 'error',
              code: 'UNDEFINED_FIELD_REFERENCE'
            });
          }
        }

        return analysis;
      } catch (error) {
        warnings.push({
          row: index + 1,
          field: 'formula',
          message: `Could not analyze formula: ${row.formula}. Using basic validation.`,
          suggestion: 'Ensure formula uses clear, descriptive language'
        });
        return null;
      }
    });

    await Promise.all(analysisPromises);

    return { errors, warnings, analyses };
  }

  /**
   * LLM API call (could be OpenAI, Claude, or local model)
   */
  private static async callLLM(prompt: string): Promise<string> {
    // For now, simulate LLM response - in production, integrate with actual LLM
    // This could be OpenAI API, Claude API, or local model
    
    // Simulated intelligent analysis based on common patterns
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockResponse = this.generateMockLLMResponse(prompt);
        resolve(JSON.stringify(mockResponse));
      }, 100);
    });
  }

  /**
   * Generate mock LLM response for development/testing
   */
  private static generateMockLLMResponse(prompt: string): FormulaAnalysis {
    const formula = this.extractFormulaFromPrompt(prompt);
    
    // Intelligent pattern matching
    if (formula.includes('users / Spent') || formula.includes('Users with Session above 1 min / Spent')) {
      return {
        intent: 'Calculate cost per user by dividing spend by user count',
        operation: 'calculation',
        sourceFields: ['users', 'Spent', 'Users with Session above 1 min'],
        isCalculated: true,
        hasConditionals: false,
        confidence: 95
      };
    }

    if (formula.includes('Percentage of')) {
      return {
        intent: 'Calculate percentage ratio between two metrics',
        operation: 'calculation',
        sourceFields: this.extractFieldsFromPercentage(formula),
        isCalculated: true,
        hasConditionals: false,
        confidence: 90
      };
    }

    if (formula.toLowerCase().includes('limit') && formula.toLowerCase().includes('filter')) {
      return {
        intent: 'Aggregate data with filtering conditions applied',
        operation: 'filtered_aggregation',
        sourceFields: this.extractFieldsFromFormula(formula),
        isCalculated: false,
        hasConditionals: true,
        confidence: 85
      };
    }

    if (formula.includes('SUM:') || formula.includes('AVERAGE:')) {
      return {
        intent: 'Aggregate numeric data using mathematical operation',
        operation: 'aggregation',
        sourceFields: this.extractFieldsFromFormula(formula),
        isCalculated: false,
        hasConditionals: false,
        confidence: 95
      };
    }

    // Default analysis for unrecognized patterns
    return {
      intent: 'Custom data transformation logic',
      operation: 'unknown',
      sourceFields: this.extractFieldsFromFormula(formula),
      isCalculated: formula.includes('/') || formula.includes('*') || formula.includes('+') || formula.includes('-'),
      hasConditionals: formula.toLowerCase().includes('limit') || formula.toLowerCase().includes('filter') || formula.toLowerCase().includes('where'),
      confidence: 60,
      suggestedMapping: 'Consider using more standard formula patterns for better recognition'
    };
  }

  /**
   * Extract formula from LLM prompt
   */
  private static extractFormulaFromPrompt(prompt: string): string {
    const match = prompt.match(/Formula: "([^"]+)"/);
    return match ? match[1] : '';
  }

  /**
   * Extract field names from percentage formulas
   */
  private static extractFieldsFromPercentage(formula: string): string[] {
    const match = formula.match(/Percentage of\s*\(([^)]+)\)/);
    if (match) {
      return match[1].split('/').map(f => f.trim());
    }
    return [];
  }

  /**
   * Extract field names from formulas using intelligent parsing
   */
  private static extractFieldsFromFormula(formula: string): string[] {
    const fields: string[] = [];
    
    // Extract quoted fields
    const quotedMatches = formula.match(/"([^"]+)"/g);
    if (quotedMatches) {
      fields.push(...quotedMatches.map(m => m.replace(/"/g, '')));
    }

    // Extract field names from calculations
    const calcMatches = formula.match(/\b[A-Z][a-zA-Z\s]+\b/g);
    if (calcMatches) {
      const filteredCalc = calcMatches.filter(m => 
        !['SUM', 'AVERAGE', 'PRIMARY', 'SECONDARY', 'GROUP', 'Look', 'All', 'Limit', 'Percentage'].includes(m.trim())
      );
      fields.push(...filteredCalc);
    }

    return [...new Set(fields)]; // Remove duplicates
  }

  /**
   * Check if field is a known source field
   */
  private static isKnownSourceField(field: string, inputSource: string): boolean {
    const knownFields = {
      'Shopify Export': ['Date', 'Utm campaign', 'Utm term', 'Landing page url', 'Online store visitors', 'Sessions', 'Sessions with cart additions', 'Sessions that reached checkout', 'Average session duration', 'Pageviews'],
      'Meta Ads': ['Campaign name', 'Ad Set Name', 'Ad Set Delivery', 'Amount spent (INR)', 'CTR (link click-through rate)', 'CPM (cost per 1,000 impressions)'],
      'Google Ads': ['Campaign', 'Cost', 'CTR', 'Avg. CPM']
    };

    const sourceFields = knownFields[inputSource as keyof typeof knownFields] || [];
    return sourceFields.some(sf => sf.toLowerCase().includes(field.toLowerCase()) || field.toLowerCase().includes(sf.toLowerCase()));
  }

  /**
   * Fallback analysis when LLM is unavailable
   */
  private static fallbackAnalysis(formula: string, inputSource: string): FormulaAnalysis {
    return {
      intent: 'Formula analysis unavailable - using basic validation',
      operation: 'unknown',
      sourceFields: [],
      isCalculated: false,
      hasConditionals: false,
      confidence: 50,
      suggestedMapping: 'LLM analysis unavailable - manual review recommended'
    };
  }
}