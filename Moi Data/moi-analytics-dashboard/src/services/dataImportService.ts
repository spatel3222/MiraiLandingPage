import { supabase } from './supabaseClient';
import { FileValidationService, type ValidationResult } from './fileValidationService';
import type { Database } from './supabaseClient';
import type { DuplicateData, DuplicateGroup } from '../components/DuplicateComparisonModal';

type ImportSessionStatus = 'in_progress' | 'completed' | 'failed';
type SourceType = 'meta' | 'google' | 'shopify';

export interface ImportProgress {
  sessionId: string;
  status: ImportSessionStatus;
  progress: number; // 0-100
  currentStep: string;
  processedRows: number;
  totalRows: number;
  errors: ImportError[];
  warnings: ImportWarning[];
}

export interface ImportError {
  type: 'validation' | 'database' | 'duplicate' | 'processing';
  message: string;
  details?: any;
  row?: number;
}

export interface ImportWarning {
  type: 'data_quality' | 'duplicate_detected' | 'missing_optional';
  message: string;
  details?: any;
  row?: number;
}

export interface ImportResult {
  success: boolean;
  sessionId: string;
  importedRows: number;
  duplicatesDetected: number;
  errors: ImportError[];
  warnings: ImportWarning[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

export interface DuplicateDetectionResult {
  hasDuplicates: boolean;
  duplicateGroups: DuplicateGroup[];
  action: 'skip' | 'replace' | 'manual_review';
}

export interface DuplicateResolution {
  duplicateKey: string;
  action: 'keep_existing' | 'replace_with_new' | 'skip';
}

export interface ImportOptions {
  duplicateResolutions?: Record<string, 'keep_existing' | 'replace_with_new' | 'skip'>;
  skipDuplicateCheck?: boolean;
}

export class DataImportService {
  private static readonly BATCH_SIZE = 100;
  
  // Get default project ID - will be created if it doesn't exist
  private static async getDefaultProjectId(): Promise<string> {
    try {
      // Try to get existing default project
      const { data: existingProjects, error } = await supabase
        .from('projects')
        .select('id')
        .eq('name', 'MOI Analytics Dashboard')
        .limit(1);

      if (!error && existingProjects && existingProjects.length > 0) {
        return existingProjects[0].id;
      }

      // Create default project if it doesn't exist
      const { data: newProject, error: createError } = await supabase
        .from('projects')
        .insert({ name: 'MOI Analytics Dashboard' })
        .select('id')
        .single();

      if (createError || !newProject) {
        console.warn('Failed to create default project, using fallback ID');
        return '00000000-0000-0000-0000-000000000000';
      }

      return newProject.id;
    } catch (error) {
      console.warn('Failed to get/create default project:', error);
      return '00000000-0000-0000-0000-000000000000';
    }
  }

  static async importFile(
    file: File, 
    onProgress?: (progress: ImportProgress) => void,
    options?: ImportOptions
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      sessionId: '',
      importedRows: 0,
      duplicatesDetected: 0,
      errors: [],
      warnings: []
    };

    let sessionId: string = '';

    try {
      // Step 1: Validate file
      const validation = await FileValidationService.validateFile(file);
      
      if (!validation.isValid) {
        result.errors = validation.errors.map(e => ({
          type: 'validation' as const,
          message: e.message,
          details: e.details
        }));
        return result;
      }

      // Step 2: Get project ID and create import session
      const projectId = await this.getDefaultProjectId();
      const session = await this.createImportSession(projectId);
      if (!session.success) {
        result.errors.push({
          type: 'database',
          message: session.error || 'Failed to create import session'
        });
        return result;
      }

      sessionId = session.sessionId!;
      result.sessionId = sessionId;

      // Update progress
      onProgress?.({
        sessionId,
        status: 'in_progress',
        progress: 10,
        currentStep: 'Validating file',
        processedRows: 0,
        totalRows: validation.rowCount,
        errors: [],
        warnings: []
      });

      // Step 3: Parse CSV data
      const csvData = await this.parseFileContent(file);
      
      onProgress?.({
        sessionId,
        status: 'in_progress',
        progress: 20,
        currentStep: 'Checking for duplicates',
        processedRows: 0,
        totalRows: csvData.length,
        errors: [],
        warnings: []
      });

      // Step 4: Check for duplicates (if not skipped)
      let filteredData = csvData;
      
      if (!options?.skipDuplicateCheck) {
        const duplicateGroups = await this.checkForDuplicates(csvData, validation.source, validation.dateRange, projectId);
        
        if (duplicateGroups.length > 0) {
          result.duplicatesDetected = duplicateGroups.length;
          
          if (options?.duplicateResolutions) {
            // Resolve duplicates based on user choices
            await this.resolveDuplicates(duplicateGroups, options.duplicateResolutions);
            filteredData = this.filterDuplicatesWithResolutions(csvData, duplicateGroups, options.duplicateResolutions, validation.source);
          } else {
            // No resolutions provided - return error to show modal
            result.errors.push({
              type: 'duplicate',
              message: 'Duplicates detected - resolution required',
              details: { duplicateGroups }
            });
            return result;
          }
        }
      }

      // Step 5: Proceed with filtered data
      
      onProgress?.({
        sessionId,
        status: 'in_progress',
        progress: 40,
        currentStep: 'Importing data',
        processedRows: 0,
        totalRows: filteredData.length,
        errors: [],
        warnings: result.warnings
      });

      // Step 6: Import data in batches
      const importedCount = await this.importDataBatches(
        filteredData, 
        validation.source, 
        sessionId,
        projectId,
        (processed) => {
          onProgress?.({
            sessionId,
            status: 'in_progress',
            progress: 40 + (processed / filteredData.length) * 50,
            currentStep: 'Importing data',
            processedRows: processed,
            totalRows: filteredData.length,
            errors: result.errors,
            warnings: result.warnings
          });
        }
      );

      result.importedRows = importedCount;

      // Step 7: Record metadata
      await this.recordImportMetadata(file, validation, sessionId, projectId);

      // Step 8: Complete session
      await this.completeImportSession(sessionId, 'completed');

      onProgress?.({
        sessionId,
        status: 'completed',
        progress: 100,
        currentStep: 'Import completed',
        processedRows: importedCount,
        totalRows: filteredData.length,
        errors: result.errors,
        warnings: result.warnings
      });

      result.success = true;
      result.dateRange = validation.dateRange;

      return result;

    } catch (error) {
      // Mark session as failed if it was created
      if (sessionId) {
        await this.completeImportSession(sessionId, 'failed');
      }

      result.errors.push({
        type: 'processing',
        message: error instanceof Error ? error.message : 'Unknown import error'
      });

      onProgress?.({
        sessionId,
        status: 'failed',
        progress: 0,
        currentStep: 'Import failed',
        processedRows: 0,
        totalRows: 0,
        errors: result.errors,
        warnings: result.warnings
      });

      return result;
    }
  }

  private static async createImportSession(projectId: string): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('import_sessions')
        .insert({
          project_id: projectId,
          status: 'in_progress',
          files_imported: {},
          validation_errors: {}
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, sessionId: data.id };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create import session' 
      };
    }
  }

  private static async parseFileContent(file: File): Promise<any[]> {
    const Papa = await import('papaparse');
    
    return new Promise((resolve, reject) => {
      // First, read the file as text to detect Google Ads format
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvContent = e.target?.result as string;
        const lines = csvContent.split('\n');
        
        // Check if this is a Google Ads CSV (metadata in first 2 rows)
        const isGoogleAds = this.isGoogleAdsFormat(lines);
        
        if (isGoogleAds) {
          // Parse Google Ads format with metadata handling
          this.parseGoogleAdsCSVContent(csvContent, resolve, reject);
        } else {
          // Parse standard CSV format
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim(),
            transform: (value) => value.trim(),
            relaxColumnCount: true,
            complete: (results) => {
              const criticalErrors = results.errors.filter(error => 
                error.type !== 'FieldMismatch' && error.type !== 'TooManyFields'
              );
              if (criticalErrors.length > 0) {
                reject(new Error(`CSV parsing error: ${criticalErrors[0].message}`));
              } else {
                resolve(results.data);
              }
            },
            error: (error) => {
              reject(new Error(`CSV parsing failed: ${error.message}`));
            }
          });
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private static isGoogleAdsFormat(lines: string[]): boolean {
    if (lines.length < 3) return false;
    
    const row1 = lines[0]?.toLowerCase().trim();
    const row2 = lines[1]?.toLowerCase().trim();
    
    // First, check if this is actually a Shopify file (headers in first row)
    if (row1?.includes('utm campaign') || row1?.includes('online store visitors') || row1?.includes('day')) {
      return false;
    }
    
    // Check for Google Ads metadata patterns
    const hasMetadataPattern = 
      (row1?.includes('performance') || row1?.includes('campaign')) &&
      (row2?.includes('2024') || row2?.includes('2025') || 
       row2?.includes('january') || row2?.includes('february') || row2?.includes('march') ||
       row2?.includes('april') || row2?.includes('may') || row2?.includes('june') ||
       row2?.includes('july') || row2?.includes('august') || row2?.includes('september') ||
       row2?.includes('october') || row2?.includes('november') || row2?.includes('december'));
    
    const row3 = lines[2]?.toLowerCase().trim();
    const hasGoogleHeaders = row3?.includes('campaign') && row3?.includes('cost');
    
    return hasMetadataPattern && hasGoogleHeaders;
  }

  private static async parseGoogleAdsCSVContent(csvContent: string, resolve: Function, reject: Function): Promise<void> {
    const Papa = await import('papaparse');
    const lines = csvContent.split('\n');
    
    // Extract date information from second row if available
    let dateStamp = '';
    if (lines[1]) {
      const secondRow = lines[1];
      const dateMatch = secondRow.match(/(\w+ \d{1,2}, \d{4})/);
      if (dateMatch) {
        // Convert "September 29, 2025" to "2025-09-29"
        const date = new Date(dateMatch[1]);
        if (!isNaN(date.getTime())) {
          dateStamp = date.toISOString().split('T')[0];
        }
      }
    }
    
    // Find the header row (usually line 3, index 2)
    let headerRowIndex = 2;
    let dataStartIndex = 3;
    
    // Sometimes headers might be on a different row, scan for it
    for (let i = 2; i < Math.min(lines.length, 6); i++) {
      const line = lines[i].toLowerCase();
      if (line.includes('campaign') && line.includes('cost')) {
        headerRowIndex = i;
        dataStartIndex = i + 1;
        break;
      }
    }
    
    // Reconstruct CSV with just headers and data
    const headerRow = lines[headerRowIndex];
    const dataRows = lines.slice(dataStartIndex).filter(line => line.trim());
    
    const cleanCSV = [headerRow, ...dataRows].join('\n');
    
    // Parse the cleaned CSV
    Papa.parse(cleanCSV, {
      header: true,
      skipEmptyLines: true,
      delimiter: ',',
      quoteChar: '"',
      transformHeader: (header) => header.trim(),
      transform: (value) => value ? value.trim() : value,
      dynamicTyping: false,
      relaxColumnCount: true,
      skipFirstNLines: 0,
      complete: (results) => {
        if (results.errors.length > 0) {
          // Filter out field count errors since we expect them in Google Ads format
          const criticalErrors = results.errors.filter(error => 
            error.type === 'Delimiter' || error.type === 'MissingQuotes'
          );
          if (criticalErrors.length > 0) {
            reject(new Error(`Google Ads CSV parsing error: ${criticalErrors[0].message}`));
            return;
          }
        }
        
        // Filter out empty rows and add extracted date
        const data = (results.data as any[])
          .filter(row => row && Object.keys(row).length > 0)
          .map((row: any) => {
            // Ensure each row has a Date field using extracted date from row 2
            if (dateStamp) {
              row.Date = dateStamp;
            }
            // Also ensure Campaign field exists
            if (!row.Campaign && row.campaign) {
              row.Campaign = row.campaign;
            }
            return row;
          });
          
        resolve(data);
      },
      error: (error) => {
        reject(new Error(`Google Ads CSV parsing failed: ${error.message}`));
      }
    });
  }

  static async checkForDuplicates(
    newData: any[], 
    source: SourceType, 
    dateRange?: { startDate: string; endDate: string },
    projectId?: string
  ): Promise<DuplicateGroup[]> {
    try {
      if (!dateRange) {
        return [];
      }

      // Query existing data for the same date range and source
      const { data: existingData, error } = await supabase
        .from('campaign_data')
        .select('*')
        .eq('project_id', projectId || '00000000-0000-0000-0000-000000000000')
        .eq('source_type', source)
        .gte('date_reported', dateRange.startDate)
        .lte('date_reported', dateRange.endDate);

      if (error) {
        console.warn('Failed to check for duplicates:', error.message);
        return [];
      }

      if (!existingData || existingData.length === 0) {
        return [];
      }

      // Group duplicates by campaign + date combination
      const duplicateGroups: DuplicateGroup[] = [];
      const processedKeys = new Set<string>();

      newData.forEach(newRow => {
        const newDate = this.parseRowDate(newRow);
        const newCampaign = this.parseRowCampaign(newRow, source);
        
        if (!newDate || !newCampaign) return;

        const duplicateKey = `${newCampaign}_${newDate}_${source}`;
        if (processedKeys.has(duplicateKey)) return;

        const matchingExisting = existingData.filter(existing => 
          existing.campaign_name === newCampaign && 
          existing.date_reported === newDate
        );

        if (matchingExisting.length > 0) {
          // Convert to modal format
          const existingRecord = matchingExisting[0]; // Take first match
          const newMappedData = this.mapRowToCampaignData(newRow, source, '', projectId || '');
          
          duplicateGroups.push({
            key: duplicateKey,
            campaign_name: newCampaign,
            date_reported: newDate,
            source_type: source,
            existing: {
              id: existingRecord.id,
              source_type: existingRecord.source_type,
              date_reported: existingRecord.date_reported,
              campaign_name: existingRecord.campaign_name,
              ad_set_name: existingRecord.ad_set_name,
              impressions: existingRecord.impressions,
              amount_spent: existingRecord.amount_spent,
              link_clicks: existingRecord.link_clicks,
              cost: existingRecord.cost,
              clicks: existingRecord.clicks,
              conversions: existingRecord.conversions,
              sessions: existingRecord.sessions,
              purchases: existingRecord.purchases,
              total_sales: existingRecord.total_sales,
              imported_at: existingRecord.created_at,
              import_session_id: existingRecord.import_session_id
            },
            new: {
              id: 'temp-' + Math.random().toString(36).substr(2, 9),
              source_type: source,
              date_reported: newDate,
              campaign_name: newCampaign,
              ad_set_name: newMappedData.ad_set_name,
              impressions: newMappedData.impressions,
              amount_spent: newMappedData.amount_spent,
              link_clicks: newMappedData.link_clicks,
              cost: newMappedData.cost,
              clicks: newMappedData.clicks,
              conversions: newMappedData.conversions,
              sessions: newMappedData.sessions,
              purchases: newMappedData.purchases,
              total_sales: newMappedData.total_sales,
              imported_at: new Date().toISOString(),
              import_session_id: null
            }
          });
          processedKeys.add(duplicateKey);
        }
      });

      return duplicateGroups;

    } catch (error) {
      console.warn('Duplicate check failed:', error);
      return [];
    }
  }

  private static filterDuplicates(data: any[], duplicateCheck: DuplicateDetectionResult): any[] {
    if (!duplicateCheck.hasDuplicates) {
      return data;
    }

    // Create a set of duplicate keys to filter out
    const duplicateKeys = new Set<string>();
    duplicateCheck.duplicateGroups.forEach(group => {
      group.newData.forEach(row => {
        const date = this.parseRowDate(row);
        const campaign = this.parseRowCampaign(row, 'meta'); // We'll detect source properly in real implementation
        if (date && campaign) {
          duplicateKeys.add(`${campaign}_${date}`);
        }
      });
    });

    // Filter out duplicates
    return data.filter(row => {
      const date = this.parseRowDate(row);
      const campaign = this.parseRowCampaign(row, 'meta');
      if (!date || !campaign) return true; // Keep rows we can't parse for now
      
      return !duplicateKeys.has(`${campaign}_${date}`);
    });
  }

  private static async importDataBatches(
    data: any[], 
    source: SourceType, 
    sessionId: string,
    projectId: string,
    onProgress?: (processed: number) => void
  ): Promise<number> {
    let importedCount = 0;
    
    for (let i = 0; i < data.length; i += this.BATCH_SIZE) {
      const batch = data.slice(i, i + this.BATCH_SIZE);
      const mappedBatch = batch.map(row => this.mapRowToCampaignData(row, source, sessionId, projectId));
      
      const { error } = await supabase
        .from('campaign_data')
        .insert(mappedBatch);

      if (error) {
        console.error('Batch import error:', error);
        // Continue with other batches even if one fails
      } else {
        importedCount += batch.length;
      }

      onProgress?.(importedCount);
    }

    return importedCount;
  }

  private static mapRowToCampaignData(row: any, source: SourceType, sessionId: string, projectId: string): any {
    const baseData = {
      project_id: projectId,
      source_type: source,
      date_reported: this.parseRowDate(row),
      campaign_name: this.parseRowCampaign(row, source),
      import_session_id: sessionId
    };

    switch (source) {
      case 'meta':
        return {
          ...baseData,
          ad_set_name: row['Ad Set Name'] || null,
          impressions: null, // Ignore impressions as requested
          amount_spent: this.parseNumber(row['Amount spent (INR)']),
          link_clicks: null // Ignore link clicks as requested
        };
      
      case 'google':
        return {
          ...baseData,
          cost: this.parseNumber(row['Cost']),
          clicks: this.parseNumber(row['Clicks']),
          impressions: null, // Ignore impressions as requested
          conversions: this.parseNumber(row['Conversions'])
        };
      
      case 'shopify':
        return {
          ...baseData,
          utm_campaign: row['UTM campaign'] || row['UTM Campaign'] || null,
          utm_term: row['UTM term'] || row['UTM Term'] || null,
          sessions: null, // Ignore sessions for Shopify as requested
          online_store_visitors: this.parseNumber(row['Online store visitors'] || row['Online Store Visitors']),
          cart_additions: this.parseNumber(row['Cart Additions']),
          checkouts: this.parseNumber(row['Checkouts']),
          purchases: this.parseNumber(row['Orders']),
          total_sales: this.parseNumber(row['Total Sales'])
        };
      
      default:
        return baseData;
    }
  }

  private static parseRowDate(row: any): string | null {
    const dateValue = row['Date'] || row['date'] || row['Date reported'] || row['Day'] || row['day'] || row['Reporting ends'] || row['reporting ends'];
    if (!dateValue) return null;
    
    try {
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
    } catch {
      return null;
    }
  }

  private static parseRowCampaign(row: any, source: SourceType): string | null {
    switch (source) {
      case 'meta':
        return row['Campaign Name'] || row['Campaign name'] || null;
      case 'google':
        return row['Campaign'] || row['Campaign name'] || null;
      case 'shopify':
        return row['UTM campaign'] || row['UTM Campaign'] || row['utm_campaign'] || null;
      default:
        return null;
    }
  }

  private static parseNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    
    const numValue = parseFloat(value.toString().replace(/[,$]/g, ''));
    return isNaN(numValue) ? null : numValue;
  }

  private static async recordImportMetadata(
    file: File, 
    validation: ValidationResult, 
    sessionId: string,
    projectId: string
  ): Promise<void> {
    try {
      const fileHash = await this.generateFileHash(file);
      
      await supabase
        .from('raw_data_meta')
        .insert({
          project_id: projectId,
          source_type: validation.source,
          date_reported: validation.dateRange?.startDate || new Date().toISOString().split('T')[0],
          file_name: file.name,
          file_hash: fileHash,
          row_count: validation.rowCount,
          import_session_id: sessionId
        });
    } catch (error) {
      console.warn('Failed to record import metadata:', error);
    }
  }

  private static async generateFileHash(file: File): Promise<string> {
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return Date.now().toString(); // Fallback to timestamp
    }
  }

  private static async completeImportSession(sessionId: string, status: ImportSessionStatus): Promise<void> {
    try {
      await supabase
        .from('import_sessions')
        .update({
          status,
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId);
    } catch (error) {
      console.warn('Failed to update import session:', error);
    }
  }

  static async getImportHistory(limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('import_sessions')
        .select(`
          *,
          raw_data_meta (
            source_type,
            file_name,
            row_count
          )
        `)
        // Note: For import history, we'll get all projects for now since we don't have current project context
        // .eq('project_id', projectId) - Add this filter when called with project context
        .order('started_at', { ascending: false })
        .limit(limit);

      return error ? [] : data;
    } catch {
      return [];
    }
  }
}