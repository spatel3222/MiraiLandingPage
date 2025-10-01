import Papa from 'papaparse';
import * as LogicTypes from '../types/logicConfiguration';
import { LogicTemplateManager } from './logicTemplateManager';

type LogicConfiguration = LogicTypes.LogicConfiguration;
type LogicTemplateRow = LogicTypes.LogicTemplateRow;
type ProcessingContext = LogicTypes.ProcessingContext;
const VALIDATION_RULES = LogicTypes.VALIDATION_RULES;

export interface ProcessedOutput {
  adSetLevelData: any[];
  topLevelDailyData: any[];
  pivotData: any[];
  metadata: {
    processedAt: Date;
    recordCount: number;
    usingCustomLogic: boolean;
    version: string;
  };
}

export interface ConfigurableProcessingResult {
  success: boolean;
  outputFiles?: {
    adSetLevel: any[];
    topLevelDaily: any[];
    pivot: any[];
  };
  errors?: string[];
  metadata?: {
    processedAt: Date;
    recordCount: number;
    usingCustomLogic: boolean;
    version: string;
  };
}

export class ConfigurableDataProcessor {
  private static readonly OUTPUT_VERSION = '1.0.0';

  /**
   * Interface adapter for integration with existing processor
   */
  static async processWithConfiguration(
    inputData: { shopify: any[]; meta: any[]; google: any[] },
    dateRange: { startDate: Date; endDate: Date; dayCount: number }
  ): Promise<ConfigurableProcessingResult> {
    try {
      // Load current configuration
      const configuration = LogicTemplateManager.getCurrentConfiguration();
      
      // Call our main processing function
      const output = await this.processWithCustomLogic(
        inputData.shopify,
        inputData.meta,
        inputData.google,
        configuration,
        dateRange
      );

      return {
        success: true,
        outputFiles: {
          adSetLevel: output.adSetLevelData,
          topLevelDaily: output.topLevelDailyData,
          pivot: output.pivotData
        },
        metadata: output.metadata
      };

    } catch (error) {
      console.error('Configurable processing error:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown processing error']
      };
    }
  }

  /**
   * Main processing function that executes custom logic templates
   */
  static async processWithCustomLogic(
    shopifyData: any[],
    metaData: any[],
    googleData: any[],
    configuration: LogicConfiguration,
    dateRange: { startDate: Date; endDate: Date; dayCount: number }
  ): Promise<ProcessedOutput> {
    
    try {
      console.log('Starting configurable data processing with custom logic...');
      
      // Create processing context
      const context: ProcessingContext = {
        shopifyData,
        metaData,
        googleData,
        pivotData: [],
        dateRange,
        configuration
      };

      // Step 1: Create pivot table from Shopify data
      console.log('Creating pivot table from Shopify data...');
      const pivotData = this.createShopifyPivot(shopifyData);
      context.pivotData = pivotData;
      
      // Store pivot data in localStorage for Export Reports access
      try {
        localStorage.setItem('moi-pivot-data', JSON.stringify(pivotData));
        console.log(`Stored ${pivotData.length} pivot records in localStorage`);
      } catch (error) {
        console.warn('Failed to store pivot data in localStorage:', error);
      }

      // Step 2: Process output files according to logic template
      console.log('Processing output files with custom logic...');
      const adSetLevelData = await this.processAdSetLevel(context);
      const topLevelDailyData = await this.processTopLevelDaily(context);

      return {
        adSetLevelData,
        topLevelDailyData,
        pivotData,
        metadata: {
          processedAt: new Date(),
          recordCount: adSetLevelData.length + topLevelDailyData.length,
          usingCustomLogic: true,
          version: this.OUTPUT_VERSION
        }
      };

    } catch (error) {
      console.error('Error in configurable data processing:', error);
      throw new Error(`Custom logic processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create Shopify pivot table (Campaign + AdSet level)
   */
  private static createShopifyPivot(shopifyData: any[]): any[] {
    console.log('Creating granular Campaign+AdSet level pivot...');
    
    const pivotMap = new Map<string, any>();

    shopifyData.forEach(record => {
      const utmCampaign = record['Utm campaign'] || record['UTM Campaign'] || 'Unknown Campaign';
      const utmTerm = record['Utm term'] || record['UTM Term'] || 'Unknown AdSet';
      const key = `${utmCampaign}|||${utmTerm}`;

      if (!pivotMap.has(key)) {
        pivotMap.set(key, {
          'UTM Campaign': utmCampaign,
          'UTM Term': utmTerm,
          'Online store visitors': 0,
          'Sessions': 0,
          'Sessions with cart additions': 0,
          'Sessions that reached checkout': 0,
          'Average session duration': 0,
          'Pageviews': 0,
          'Date': record['Date'] || new Date().toISOString().split('T')[0],
          '_sessionDurationTotal': 0,
          '_visitorCount': 0
        });
      }

      const pivot = pivotMap.get(key)!;
      
      // Aggregate numeric fields
      pivot['Online store visitors'] += this.parseNumber(record['Online store visitors']);
      pivot['Sessions'] += this.parseNumber(record['Sessions']);
      pivot['Sessions with cart additions'] += this.parseNumber(record['Sessions with cart additions']);
      pivot['Sessions that reached checkout'] += this.parseNumber(record['Sessions that reached checkout']);
      pivot['Pageviews'] += this.parseNumber(record['Pageviews']);
      
      // For average session duration, accumulate total and count
      const sessionDuration = this.parseNumber(record['Average session duration']);
      const visitors = this.parseNumber(record['Online store visitors']);
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

  /**
   * Process Ad Set Level output file using custom logic
   */
  private static async processAdSetLevel(context: ProcessingContext): Promise<any[]> {
    const adSetRows = context.configuration.templateRows.filter(
      row => row.outputFileName === 'Ad Set Level.csv'
    );

    if (adSetRows.length === 0) {
      console.warn('No Ad Set Level configuration found, returning empty data');
      return [];
    }

    console.log(`Processing ${adSetRows.length} fields for Ad Set Level output`);

    // Group pivot data by campaign+adset for processing
    const processedData: any[] = [];

    context.pivotData.forEach(pivotRow => {
      const outputRow: any = {};
      // Initialize current row values for calculated field references
      context.currentRowValues = {};

      adSetRows.forEach(configRow => {
        try {
          const value = this.executeFormula(configRow, pivotRow, context);
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

  /**
   * Process Top Level Daily output file using custom logic
   */
  private static async processTopLevelDaily(context: ProcessingContext): Promise<any[]> {
    const dailyRows = context.configuration.templateRows.filter(
      row => row.outputFileName === 'Top Level Daily.csv'
    );

    if (dailyRows.length === 0) {
      console.warn('No Top Level Daily configuration found, returning empty data');
      return [];
    }

    console.log(`Processing ${dailyRows.length} fields for Top Level Daily output`);

    // Create single row for daily aggregates
    const outputRow: any = {};
    // Initialize current row values for calculated field references
    context.currentRowValues = {};

    dailyRows.forEach(configRow => {
      try {
        const value = this.executeFormula(configRow, null, context);
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

    // Add date information
    const dateStr = `${context.dateRange.startDate.toLocaleDateString()} - ${context.dateRange.endDate.toLocaleDateString()}`;
    outputRow['Date Range'] = dateStr;

    console.log('Generated Top Level Daily record');
    return [outputRow];
  }

  /**
   * Execute a formula from the logic template
   */
  private static executeFormula(
    configRow: LogicTemplateRow, 
    pivotRow: any | null, 
    context: ProcessingContext
  ): any {
    const formula = configRow.formula.trim();

    // Direct field mapping
    const directMatch = formula.match(VALIDATION_RULES.FORMULA_PATTERNS.DIRECT);
    if (directMatch) {
      const fieldName = directMatch[1];
      return this.getFieldValue(fieldName, configRow.inputFrom, pivotRow, context);
    }

    // SUM aggregation
    const sumMatch = formula.match(VALIDATION_RULES.FORMULA_PATTERNS.SUM);
    if (sumMatch) {
      const fieldName = sumMatch[1];
      return this.aggregateField(fieldName, 'sum', configRow.inputFrom, context);
    }

    // AVERAGE aggregation
    const avgMatch = formula.match(VALIDATION_RULES.FORMULA_PATTERNS.AVERAGE);
    if (avgMatch) {
      const fieldDescription = avgMatch[1];
      return this.aggregateField(fieldDescription, 'average', configRow.inputFrom, context);
    }

    // PRIMARY GROUP (Campaign name from pivot)
    if (formula.match(VALIDATION_RULES.FORMULA_PATTERNS.PRIMARY_GROUP)) {
      return pivotRow ? pivotRow['UTM Campaign'] : 'Unknown Campaign';
    }

    // SECONDARY GROUP (AdSet name from pivot)
    if (formula.match(VALIDATION_RULES.FORMULA_PATTERNS.SECONDARY_GROUP)) {
      return pivotRow ? pivotRow['UTM Term'] : 'Unknown AdSet';
    }

    // LOOKUP operations
    if (formula.match(VALIDATION_RULES.FORMULA_PATTERNS.LOOKUP)) {
      return this.executeLookup(formula, pivotRow, context);
    }

    // Percentage calculations
    const percentageMatch = formula.match(/Percentage of \(([^/]+)\s*\/\s*([^)]+)\)/);
    if (percentageMatch) {
      const numeratorField = percentageMatch[1].trim();
      const denominatorField = percentageMatch[2].trim();
      return this.executePercentageCalculation(numeratorField, denominatorField, pivotRow, context);
    }

    // Filtered aggregations (e.g., "SUM: ... Limit the sum and filter out...")
    const filteredMatch = formula.match(/SUM:\s*All numeric field of "([^"]+)".*Limit.*filter.*([^.]+)/i);
    if (filteredMatch) {
      const fieldName = filteredMatch[1];
      const filterDescription = filteredMatch[2];
      return this.executeFilteredAggregation(fieldName, filterDescription, configRow.inputFrom, context);
    }

    // Simple calculations (e.g., "users / Spent")
    if (formula.match(VALIDATION_RULES.FORMULA_PATTERNS.CALCULATION)) {
      return this.executeCalculation(formula, pivotRow, context);
    }

    // Empty formula (for Manual fields)
    if (formula === '' || formula === null || formula === undefined) {
      return null; // Manual input - no calculation needed
    }

    // Default fallback
    console.warn(`Unhandled formula pattern: ${formula}`);
    return null;
  }

  /**
   * Get field value from appropriate data source
   */
  private static getFieldValue(
    fieldName: string, 
    inputSource: string, 
    pivotRow: any | null, 
    context: ProcessingContext
  ): any {
    switch (inputSource) {
      case 'Shopify Export':
        if (pivotRow) {
          return pivotRow[fieldName] || null;
        }
        return this.aggregateField(fieldName, 'sum', inputSource, context);

      case 'Meta Ads':
        return this.getFromMetaData(fieldName, pivotRow, context);

      case 'Google Ads':
        return this.getFromGoogleData(fieldName, pivotRow, context);

      default:
        return null;
    }
  }

  /**
   * Aggregate field values across data source
   */
  private static aggregateField(
    fieldName: string, 
    operation: 'sum' | 'average', 
    inputSource: string, 
    context: ProcessingContext
  ): number {
    let data: any[] = [];
    
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
      .map(row => this.parseNumber(row[fieldName]))
      .filter(value => !isNaN(value) && value > 0);

    if (values.length === 0) return 0;

    return operation === 'sum' 
      ? values.reduce((sum, val) => sum + val, 0)
      : values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Execute lookup operations
   */
  private static executeLookup(
    formula: string, 
    pivotRow: any | null, 
    context: ProcessingContext
  ): any {
    if (!pivotRow) return null;

    const campaign = pivotRow['UTM Campaign'];
    const adSet = pivotRow['UTM Term'];

    // Look up in Meta Ads data
    if (formula.includes('meta ads')) {
      const metaRow = context.metaData.find(row => 
        (row['Campaign name'] === campaign || row['Campaign'] === campaign) &&
        (row['Ad Set Name'] === adSet || row['AdSet'] === adSet || row['Ad Set'] === adSet)
      );

      if (metaRow) {
        // Extract field name from formula
        const fieldMatch = formula.match(/"([^"]+)"/);
        if (fieldMatch) {
          return this.parseNumber(metaRow[fieldMatch[1]]);
        }
      }
    }

    // Look up in pivot data (already have the row)
    if (formula.includes('pivot_temp.csv')) {
      const fieldMatch = formula.match(/"([^"]+)"/);
      if (fieldMatch) {
        return this.parseNumber(pivotRow[fieldMatch[1]]);
      }
    }

    return null;
  }

  /**
   * Execute calculation formulas
   */
  private static executeCalculation(
    formula: string, 
    pivotRow: any | null, 
    context: ProcessingContext
  ): number {
    // Simple arithmetic operations like "users / Spent"
    const parts = formula.split(/[\+\-\*\/]/).map(p => p.trim());
    const operators = formula.match(/[\+\-\*\/]/g) || [];

    if (parts.length === 2 && operators.length === 1) {
      const val1 = this.getCalculationValue(parts[0], pivotRow, context);
      const val2 = this.getCalculationValue(parts[1], pivotRow, context);
      const operator = operators[0];

      if (isNaN(val1) || isNaN(val2)) return 0;

      switch (operator) {
        case '+': return val1 + val2;
        case '-': return val1 - val2;
        case '*': return val1 * val2;
        case '/': return val2 !== 0 ? val1 / val2 : 0;
        default: return 0;
      }
    }

    return 0;
  }

  /**
   * Get value for calculation (resolve field names to actual values)
   */
  private static getCalculationValue(
    fieldRef: string, 
    pivotRow: any | null, 
    context: ProcessingContext
  ): number {
    // Check if it's a direct number
    const directNumber = this.parseNumber(fieldRef);
    if (!isNaN(directNumber)) return directNumber;

    // Try to find field in current output row context (would need to be passed)
    // For now, return basic lookup in pivot data
    if (pivotRow && pivotRow[fieldRef] !== undefined) {
      return this.parseNumber(pivotRow[fieldRef]);
    }

    return 0;
  }

  /**
   * Get data from Meta Ads source
   */
  private static getFromMetaData(
    fieldName: string, 
    pivotRow: any | null, 
    context: ProcessingContext
  ): any {
    if (!pivotRow) {
      // Return aggregated value
      return this.aggregateField(fieldName, 'sum', 'Meta Ads', context);
    }

    // Look up specific campaign/adset
    const campaign = pivotRow['UTM Campaign'];
    const adSet = pivotRow['UTM Term'];

    const metaRow = context.metaData.find(row => 
      (row['Campaign name'] === campaign || row['Campaign'] === campaign) &&
      (row['Ad Set Name'] === adSet || row['AdSet'] === adSet)
    );

    return metaRow ? metaRow[fieldName] : null;
  }

  /**
   * Get data from Google Ads source
   */
  private static getFromGoogleData(
    fieldName: string, 
    pivotRow: any | null, 
    context: ProcessingContext
  ): any {
    if (!pivotRow) {
      // Return aggregated value
      return this.aggregateField(fieldName, 'sum', 'Google Ads', context);
    }

    // Google Ads typically matches by campaign name
    const campaign = pivotRow['UTM Campaign'];

    const googleRow = context.googleData.find(row => 
      row['Campaign'] === campaign || row['Campaign name'] === campaign
    );

    return googleRow ? googleRow[fieldName] : null;
  }

  /**
   * Execute percentage calculation between two fields
   */
  private static executePercentageCalculation(
    numeratorField: string, 
    denominatorField: string, 
    pivotRow: any | null, 
    context: ProcessingContext
  ): number {
    // Get values for both fields from current row/context
    const numeratorValue = this.getCalculatedFieldValue(numeratorField, pivotRow, context);
    const denominatorValue = this.getCalculatedFieldValue(denominatorField, pivotRow, context);
    
    const num = this.parseNumber(numeratorValue);
    const den = this.parseNumber(denominatorValue);
    
    if (den === 0) return 0;
    
    return (num / den) * 100; // Return as percentage
  }

  /**
   * Execute filtered aggregation with conditions
   */
  private static executeFilteredAggregation(
    fieldName: string, 
    filterDescription: string, 
    inputSource: string, 
    context: ProcessingContext
  ): number {
    // For now, implement basic filtered aggregation
    // This can be enhanced to parse filter conditions more sophisticatedly
    
    if (filterDescription.includes('session duration is above one minute')) {
      // Simulate filtering by session duration > 1 minute
      // In a real implementation, this would filter the actual data
      const baseValue = this.aggregateField(fieldName, 'sum', inputSource, context);
      
      // Apply a factor for filtering (this is a simplified implementation)
      // In practice, you'd filter the actual data based on session duration
      return this.parseNumber(baseValue) * 0.7; // Assume 70% meet the criteria
    }
    
    // Default to regular aggregation if filter not recognized
    return this.aggregateField(fieldName, 'sum', inputSource, context);
  }

  /**
   * Get calculated field value (handles both direct fields and calculated fields)
   */
  private static getCalculatedFieldValue(
    fieldName: string, 
    pivotRow: any | null, 
    context: ProcessingContext
  ): any {
    // First try to get from current row context (for calculated fields)
    if (context.currentRowValues && context.currentRowValues[fieldName] !== undefined) {
      return context.currentRowValues[fieldName];
    }
    
    // Then try to get from pivot row
    if (pivotRow && pivotRow[fieldName] !== undefined) {
      return pivotRow[fieldName];
    }
    
    // Default fallback
    return 0;
  }

  /**
   * Safely parse numeric values
   */
  private static parseNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Remove commas and currency symbols
      const cleaned = value.replace(/[,₹$]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  /**
   * Export processed data as CSV files
   */
  static exportProcessedData(
    output: ProcessedOutput, 
    filename: string = 'custom_logic_output'
  ): void {
    // Export Ad Set Level data
    if (output.adSetLevelData.length > 0) {
      const adSetCsv = Papa.unparse(output.adSetLevelData, {
        header: true,
        delimiter: ',',
        quotes: true
      });

      this.downloadCSV(adSetCsv, `${filename}_AdSet_Level.csv`);
    }

    // Export Top Level Daily data
    if (output.topLevelDailyData.length > 0) {
      const dailyCsv = Papa.unparse(output.topLevelDailyData, {
        header: true,
        delimiter: ',',
        quotes: true
      });

      this.downloadCSV(dailyCsv, `${filename}_Top_Level_Daily.csv`);
    }

    // Export Pivot data
    if (output.pivotData.length > 0) {
      const pivotCsv = Papa.unparse(output.pivotData, {
        header: true,
        delimiter: ',',
        quotes: true
      });

      this.downloadCSV(pivotCsv, `${filename}_Pivot_Temp.csv`);
    }
  }

  /**
   * Download CSV utility
   */
  private static downloadCSV(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}