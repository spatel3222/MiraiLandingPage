// Types and interfaces for configurable logic system
export interface LogicTemplateRow {
  fields: string;                    // Output field name
  outputFileName: string;            // Target output file (Ad Set Level.csv, Top Level Daily.csv)
  inputFrom: string;                // Data source (Shopify Export, Meta Ads, Google Ads, Manual, Calculate)
  type: string;                     // Data type (Date, Text, Number)
  formula: string;                  // Transformation logic/formula
  notes?: string;                   // Optional notes/comments
}

export interface LogicConfiguration {
  templateRows: LogicTemplateRow[];
  lastModified: Date;
  version: string;
  isActive: boolean;
}

export interface FormulaOperation {
  type: 'direct' | 'sum' | 'average' | 'lookup' | 'calculate' | 'filter';
  sourceField?: string;
  targetField?: string;
  operation?: string;               // For calculations like "users / Spent"
  conditions?: FilterCondition[];   // For filtered operations
  aggregationType?: 'sum' | 'average' | 'count' | 'max' | 'min';
}

export interface FilterCondition {
  field: string;
  operator: '>' | '<' | '>=' | '<=' | '=' | '!=' | 'contains';
  value: string | number;
  logic?: 'AND' | 'OR';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code: string;
}

export interface ValidationWarning {
  row: number;
  field: string;
  message: string;
  suggestion?: string;
}

export interface DataSourceField {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  source: 'shopify' | 'meta' | 'google' | 'calculated';
  description?: string;
}

export interface ProcessingContext {
  shopifyData: any[];
  metaData: any[];
  googleData: any[];
  pivotData: any[];
  dateRange: {
    startDate: Date;
    endDate: Date;
    dayCount: number;
  };
  configuration: LogicConfiguration;
  currentRowValues?: { [fieldName: string]: any }; // For tracking calculated field values
}

// Default template structure matching the user's comprehensive logic file
export const DEFAULT_LOGIC_TEMPLATE: LogicTemplateRow[] = [
  // Ad Set Level.csv fields
  {
    fields: 'Date',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Shopify Export',
    type: 'Date',
    formula: 'As is from input file  column name "Date"'
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
    formula: 'As is from input file  column name "Ad Set Delivery"'
  },
  {
    fields: 'Ad Set Level Spent',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Meta Ads',
    type: 'Number',
    formula: 'Look up the appropriate campaign name and ads set name from pivot_temp.csv and match it to meta ads  "Amount spent (INR)"'
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
    fields: 'Ad Set Level  ATC',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'Look up the appropriate campaign name and ads set name from pivot_temp.csv SUM: All numeric field of "Sessions with cart additions"'
  },
  {
    fields: 'Ad Set Level  Reached Checkout',
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
    fields: 'Ad Set Level  Average session duration',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'Look up the appropriate campaign name and ads set name from pivot_temp.csv SUM: All numeric field of "Average session duration"'
  },
  {
    fields: 'Ad Set Level  Users with Session above 1 min',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'Look up the appropriate campaign name and ads set name from pivot_temp.csv SUM: All numeric field of "Online store visitors" Limit the sum and filter out the users whose session duration is above one minute.',
    notes: 'Count users with session duration > 1 minute'
  },
  {
    fields: 'Ad Set Level Cost per 1 min user',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Calculate',
    type: 'Number',
    formula: 'Ad Set Level  Users with Session above 1 min / Ad Set Level Spent'
  },
  {
    fields: 'Ad Set Level 1min user/ total users (%)',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Calculate',
    type: 'Number',
    formula: 'Percentage of (Ad Set Level  Users with Session above 1 min / Ad Set Level Users)'
  },
  {
    fields: 'Ad Set Level  ATC with session duration above 1 min',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'Look up the appropriate campaign name and ads set name from pivot_temp.csv SUM: All numeric field of "Sessions with cart additions", Limit the sum and filter out the users whose session duration is above one minute.'
  },
  {
    fields: 'Ad Set Level Reached Checkout with session duration above 1 min',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'Look up the appropriate campaign name and ads set name from pivot_temp.csv SUM: All numeric field of "Sessions that reached checkout", Limit the sum and filter out the users whose session duration is above one minute.'
  },
  {
    fields: 'Ad Set Level Users with Above 5 page views and above 1 min',
    outputFileName: 'Ad Set Level.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'Look up the appropriate campaign name and ads set name from pivot_temp.csv SUM: All numeric field of "Pageviews", Limit the sum and filter out the users whose session duration is above one minute and have page views above 5'
  },
  // Top Level Daily.csv fields
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
    fields: 'Total  ATC',
    outputFileName: 'Top Level Daily.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'SUM: All numeric field of "Sessions with cart additions"'
  },
  {
    fields: 'Total  Reached Checkout',
    outputFileName: 'Top Level Daily.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'SUM: All numeric field of "Sessions that reached checkout"'
  },
  {
    fields: 'Total Abandoned Checkout',
    outputFileName: 'Top Level Daily.csv',
    inputFrom: 'Manual',
    type: 'Number',
    formula: ''
  },
  {
    fields: 'Session Duration',
    outputFileName: 'Top Level Daily.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'AVERAGE: Average session duration'
  },
  {
    fields: 'Users with Session above 1 min',
    outputFileName: 'Top Level Daily.csv',
    inputFrom: 'Shopify Export',
    type: 'Number',
    formula: 'SUM: All numeric field of "Online store visitors" Limit the sum and filter out the users whose session duration is above one minute.'
  }
];

export const VALIDATION_RULES = {
  REQUIRED_FIELDS: ['fields', 'outputFileName', 'inputFrom'],
  VALID_OUTPUT_FILES: ['Ad Set Level.csv', 'Top Level Daily.csv'],
  VALID_INPUT_SOURCES: ['Shopify Export', 'Meta Ads', 'Google Ads', 'Manual', 'Calculate', 'Top Level Daily.csv', 'Ad Set Level.csv'],
  VALID_DATA_TYPES: ['Date', 'Text', 'Number'],
  FORMULA_PATTERNS: {
    // Direct field mapping
    DIRECT: /^As is from input file\s+column name\s+"([^"]+)"$/i,
    
    // SUM operations (basic and with conditions)
    SUM: /^SUM:\s*All numeric field of\s+"([^"]+)"$/i,
    SUM_WITH_FILTER: /^SUM:\s*All numeric field of\s+"([^"]+)".*(Limit|limit).*(sum|filter).*$/i,
    SUM_WITH_CONDITIONS: /^SUM:\s*All numeric field of\s+"([^"]+)".*(where|when|if).*$/i,
    
    // AVERAGE operations  
    AVERAGE: /^AVERAGE:\s*(.+)$/i,
    WEIGHTED_AVERAGE: /^WEIGHTED AVERAGE:\s*.+$/i,
    
    // LOOKUP operations (comprehensive patterns)
    LOOKUP: /^Look up.+from\s+pivot_temp\.csv.+$/i,
    LOOKUP_MATCH: /^Look up.+and match it to.+$/i,
    LOOKUP_WITH_AGGREGATION: /^Look up.+(SUM|AVERAGE|MAX|MIN).+from\s+pivot_temp\.csv.+$/i,
    
    // GROUP operations
    PRIMARY_GROUP: /^PRIMARY GROUP:\s*(.+)$/i,
    SECONDARY_GROUP: /^SECONDARY GROUP:\s*(.+)$/i,
    GROUP_BY: /^GROUP BY:\s*.+$/i,
    
    // CALCULATION operations (mathematical formulas)
    CALCULATION: /^[a-zA-Z\s]+[\+\-\*\/][a-zA-Z\s]+$/i,
    SIMPLE_CALCULATION: /^[A-Za-z\s]+\s*\/\s*[A-Za-z\s]+$/i,
    COMPLEX_CALCULATION: /^[A-Za-z\s\(\)]+[\+\-\*\/][A-Za-z\s\(\)]+.*$/i,
    
    // PERCENTAGE operations (various formats)
    PERCENTAGE: /^Percentage of.+$/i,
    PERCENTAGE_CALCULATION: /^Percentage of\s*\(.+\/.+\)$/i,
    PERCENTAGE_RATIO: /^.+%.*$/i,
    
    // CONDITIONAL operations
    IF_THEN: /^IF\s+.+\s+THEN\s+.+$/i,
    CONDITIONAL: /^.+(if|when|where).+$/i,
    
    // AGGREGATION with filters and conditions
    FILTERED_SUM: /^.*(SUM|Sum|sum).*(limit|filter|where|when|if).+$/i,
    FILTERED_AVERAGE: /^.*(AVERAGE|Average|average).*(limit|filter|where|when|if).+$/i,
    FILTERED_COUNT: /^.*(COUNT|Count|count).*(limit|filter|where|when|if).+$/i,
    
    // TIME-based operations
    DATE_RANGE: /^.*(date|Date|DATE).*(range|between|from|to).+$/i,
    PERIOD_AGGREGATE: /^.*(daily|weekly|monthly|yearly).+$/i,
    
    // RATE and RATIO operations  
    RATE_OPERATION: /^[A-Z]+:\s*.+\(.*rate.*\)$/i,
    CTR_OPERATION: /^.*(CTR|ctr|click.through.rate).+$/i,
    CONVERSION_RATE: /^.*(conversion|Conversion).*(rate|Rate).+$/i,
    
    // COMPARISON operations
    GREATER_THAN: /^.*(>|greater than|above).+$/i,
    LESS_THAN: /^.*(<|less than|below).+$/i,
    EQUAL_TO: /^.*(=|equal to|equals).+$/i,
    
    // RANKING and SORTING
    TOP_N: /^.*(top|TOP)\s*\d+.+$/i,
    BOTTOM_N: /^.*(bottom|BOTTOM)\s*\d+.+$/i,
    RANK_BY: /^.*(rank|RANK|ranking).+$/i,
    
    // STATISTICAL operations
    MAX_VALUE: /^.*(MAX|max|maximum).+$/i,
    MIN_VALUE: /^.*(MIN|min|minimum).+$/i,
    MEDIAN: /^.*(MEDIAN|median).+$/i,
    STANDARD_DEVIATION: /^.*(STDEV|stdev|standard deviation).+$/i,
    
    // CONCATENATION and STRING operations
    CONCAT: /^.*(CONCAT|concat|concatenate).+$/i,
    STRING_FORMAT: /^.*(format|FORMAT).+$/i,
    
    // NULL handling
    NULL_CHECK: /^.*(null|NULL|empty|EMPTY).+$/i,
    DEFAULT_VALUE: /^.*(default|DEFAULT|fallback).+$/i,
    
    // Complex formulas with multiple operations
    MULTI_OPERATION: /^[A-Za-z0-9\s\(\)\+\-\*\/\%\,\.\:\"\'\&\|\>\<\=\!]+$/,
    
    // Filter operations with complex conditions
    FILTER_OPERATION: /^.+[Ll]imit\s+the\s+sum\s+and\s+filter\s+out.+$/i,
    ADVANCED_FILTER: /^.*(filter|Filter|FILTER).*(and|or|AND|OR).+$/i,
    
    // Any valid text formula (most permissive fallback)
    VALID_TEXT: /^[A-Za-z0-9\s\(\)\+\-\*\/\%\,\.\:\"\'\&\|\>\<\=\!\?]+$/
  }
};