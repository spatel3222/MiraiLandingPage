import Papa from 'papaparse';
import * as LogicTypes from '../types/logicConfiguration';

type LogicConfiguration = LogicTypes.LogicConfiguration;
type LogicTemplateRow = LogicTypes.LogicTemplateRow;
type ValidationResult = LogicTypes.ValidationResult;
const DEFAULT_LOGIC_TEMPLATE = LogicTypes.DEFAULT_LOGIC_TEMPLATE;

export class LogicTemplateManager {
  private static readonly STORAGE_KEY = 'moi-logic-template';
  private static readonly TEMPLATE_VERSION = '1.0.0';

  /**
   * Download the current logic template as a CSV file
   */
  static downloadTemplate(configuration?: LogicConfiguration): void {
    const template = configuration?.templateRows || DEFAULT_LOGIC_TEMPLATE;
    
    // Convert to CSV format matching the original structure
    const csvData = template.map(row => ({
      'Fields': row.fields,
      'Output File Name': row.outputFileName,
      'Input from?': row.inputFrom,
      'Type': row.type,
      'Formula': row.formula,
      'Notes': row.notes || ''
    }));

    const csv = Papa.unparse(csvData, {
      header: true,
      delimiter: ',',
      quotes: true
    });

    // Create and trigger download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `MOI_Logic_Template_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // TODO(human): Add importSpecificTemplate method here to load your CSV file directly

  /**
   * Parse uploaded CSV file into LogicTemplateRow array
   */
  static async parseUploadedTemplate(file: File): Promise<LogicTemplateRow[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => {
          // Normalize header names to match our interface
          const normalized = header.toLowerCase().trim();
          switch (normalized) {
            case 'fields': return 'fields';
            case 'output file name': return 'outputFileName';
            case 'input from?': 
            case 'input from': return 'inputFrom';
            case 'type': return 'type';
            case 'formula': return 'formula';
            case 'notes': return 'notes';
            default: return header;
          }
        },
        complete: (results) => {
          try {
            const templateRows: LogicTemplateRow[] = results.data
              .filter((row: any) => row.fields && row.outputFileName) // Filter out empty rows
              .map((row: any): LogicTemplateRow => ({
                fields: row.fields?.trim() || '',
                outputFileName: row.outputFileName?.trim() || '',
                inputFrom: row.inputFrom?.trim() || '',
                type: row.type?.trim() || '',
                formula: row.formula?.trim() || '',
                notes: row.notes?.trim() || ''
              }));

            resolve(templateRows);
          } catch (error) {
            reject(new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`));
          }
        },
        error: (error) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        }
      });
    });
  }

  /**
   * Save logic configuration to localStorage
   */
  static saveConfiguration(templateRows: LogicTemplateRow[]): LogicConfiguration {
    const configuration: LogicConfiguration = {
      templateRows,
      lastModified: new Date(),
      version: this.TEMPLATE_VERSION,
      isActive: true
    };

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configuration));
      return configuration;
    } catch (error) {
      throw new Error(`Failed to save configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load logic configuration from localStorage
   */
  static loadConfiguration(): LogicConfiguration | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const configuration = JSON.parse(stored) as LogicConfiguration;
      
      // Validate configuration structure
      if (!configuration.templateRows || !Array.isArray(configuration.templateRows)) {
        console.warn('Invalid configuration structure, using default');
        return null;
      }

      // Convert date strings back to Date objects
      configuration.lastModified = new Date(configuration.lastModified);
      
      return configuration;
    } catch (error) {
      console.error('Failed to load configuration:', error);
      return null;
    }
  }

  /**
   * Check if a custom logic template is currently active
   */
  static hasCustomTemplate(): boolean {
    const stored = this.loadConfiguration();
    return stored !== null && stored.isActive === true;
  }

  /**
   * Get the current active configuration or default template
   */
  static getCurrentConfiguration(): LogicConfiguration {
    const stored = this.loadConfiguration();
    
    if (stored && stored.isActive) {
      return stored;
    }

    // Return default configuration
    return {
      templateRows: DEFAULT_LOGIC_TEMPLATE,
      lastModified: new Date(),
      version: this.TEMPLATE_VERSION,
      isActive: false // Indicates it's the default, not user-configured
    };
  }

  /**
   * Reset to default configuration
   */
  static resetToDefault(): LogicConfiguration {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      
      const defaultConfig: LogicConfiguration = {
        templateRows: DEFAULT_LOGIC_TEMPLATE,
        lastModified: new Date(),
        version: this.TEMPLATE_VERSION,
        isActive: false
      };

      return defaultConfig;
    } catch (error) {
      throw new Error(`Failed to reset configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export configuration as downloadable JSON (for backup/sharing)
   */
  static exportConfigurationAsJson(configuration?: LogicConfiguration): void {
    const config = configuration || this.getCurrentConfiguration();
    
    const jsonString = JSON.stringify(config, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `MOI_Logic_Configuration_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Import configuration from JSON file
   */
  static async importConfigurationFromJson(file: File): Promise<LogicConfiguration> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const configuration = JSON.parse(content) as LogicConfiguration;
          
          // Validate structure
          if (!configuration.templateRows || !Array.isArray(configuration.templateRows)) {
            throw new Error('Invalid configuration file structure');
          }

          // Convert date string back to Date object
          configuration.lastModified = new Date(configuration.lastModified);
          
          resolve(configuration);
        } catch (error) {
          reject(new Error(`Failed to import configuration: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Create a copy of the template with sample data for documentation
   */
  static downloadDocumentationTemplate(): void {
    const documentationTemplate = [
      {
        'Fields': 'Example: Campaign Name',
        'Output File Name': 'Ad Set Level.csv',
        'Input from?': 'Shopify Export',
        'Type': 'Text',
        'Formula': 'PRIMARY GROUP: UTM Campaign (Campaign Name)',
        'Notes': 'Groups data by UTM Campaign field'
      },
      {
        'Fields': 'Example: Total Spend',
        'Output File Name': 'Top Level Daily.csv',
        'Input from?': 'Meta Ads',
        'Type': 'Number',
        'Formula': 'SUM: All numeric field of "Amount spent (INR)"',
        'Notes': 'Sums all spending values'
      },
      {
        'Fields': 'Example: Cost Per User',
        'Output File Name': 'Ad Set Level.csv',
        'Input from?': 'Calculate',
        'Type': 'Number',
        'Formula': 'Spent / Users',
        'Notes': 'Calculated field: division operation'
      },
      {
        'Fields': 'Example: Direct Field',
        'Output File Name': 'Ad Set Level.csv',
        'Input from?': 'Shopify Export',
        'Type': 'Date',
        'Formula': 'As is from input file column name "Date"',
        'Notes': 'Direct mapping from source field'
      }
    ];

    const csv = Papa.unparse(documentationTemplate, {
      header: true,
      delimiter: ',',
      quotes: true
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'MOI_Logic_Template_Documentation_Examples.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}