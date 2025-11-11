# Supabase Integration Strategy

## Overview

This document outlines the comprehensive Supabase integration strategy for MOI Data Analytics V2, including database schema, bulk upload methodology, connection management, and optimization techniques for handling large datasets efficiently.

## Database Architecture

### Existing Supabase Setup

**Database**: MOI Data Analysis  
**Tables**: meta_import_data, google_import_data, shopify_import_data  
**Access**: Direct integration with existing table structure  

### Table Schemas

#### meta_import_data
```sql
CREATE TABLE meta_import_data (
  id SERIAL PRIMARY KEY,
  day DATE NOT NULL,
  campaign_name VARCHAR(255),
  ad_set_name VARCHAR(255),
  ad_name VARCHAR(255),
  amount_spent DECIMAL(10,2),
  ctr DECIMAL(5,4),
  cpm DECIMAL(8,2),
  ad_set_delivery VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Composite unique constraint for upserts
  UNIQUE(day, campaign_name, ad_set_name, ad_name)
);

-- Indexes for performance
CREATE INDEX idx_meta_day ON meta_import_data(day);
CREATE INDEX idx_meta_campaign ON meta_import_data(campaign_name);
CREATE INDEX idx_meta_campaign_day ON meta_import_data(campaign_name, day);
```

#### google_import_data
```sql
CREATE TABLE google_import_data (
  id SERIAL PRIMARY KEY,
  day DATE NOT NULL,
  campaign VARCHAR(255),
  cost DECIMAL(10,2),
  ctr DECIMAL(5,4),
  cpm DECIMAL(8,2),
  currency_code VARCHAR(3),
  campaign_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Composite unique constraint for upserts
  UNIQUE(day, campaign)
);

-- Indexes for performance
CREATE INDEX idx_google_day ON google_import_data(day);
CREATE INDEX idx_google_campaign ON google_import_data(campaign);
CREATE INDEX idx_google_campaign_day ON google_import_data(campaign, day);
```

#### shopify_import_data
```sql
CREATE TABLE shopify_import_data (
  id SERIAL PRIMARY KEY,
  day DATE NOT NULL,
  utm_campaign VARCHAR(255),
  utm_term VARCHAR(255),
  utm_content VARCHAR(255),
  landing_page_url TEXT,
  online_store_visitors INTEGER,
  sessions_completed_checkout INTEGER,
  sessions_reached_checkout INTEGER,
  sessions_cart_additions INTEGER,
  average_session_duration DECIMAL(8,2),
  pageviews INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Composite unique constraint for upserts
  UNIQUE(day, utm_campaign, utm_term, utm_content)
);

-- Indexes for performance
CREATE INDEX idx_shopify_day ON shopify_import_data(day);
CREATE INDEX idx_shopify_utm_campaign ON shopify_import_data(utm_campaign);
CREATE INDEX idx_shopify_campaign_day ON shopify_import_data(utm_campaign, day);
CREATE INDEX idx_shopify_composite ON shopify_import_data(utm_campaign, utm_term, utm_content);
```

## Bulk Upload Strategy

### Methodology Overview

Following the `upload_real_shopify_data.py` approach, implement batch processing with transaction safety and conflict resolution.

#### Supabase Client Configuration (`lib/supabase.js`)
```javascript
import { createClient } from '@supabase/supabase-js';

class SupabaseService {
  constructor() {
    this.client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false // Server-side usage
        },
        db: {
          schema: 'public'
        }
      }
    );
    
    this.batchSize = 1000; // Optimal batch size for performance
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second base delay
  }

  async bulkUpload(platform, data, options = {}) {
    const tableName = `${platform}_import_data`;
    const {
      onProgress = () => {},
      onBatchComplete = () => {},
      validateBeforeUpload = true
    } = options;

    console.log(`Starting bulk upload for ${platform}: ${data.length} rows`);
    
    if (validateBeforeUpload) {
      await this.validateDataStructure(platform, data);
    }

    const results = {
      totalRows: data.length,
      uploadedRows: 0,
      failedRows: 0,
      batches: [],
      errors: [],
      startTime: new Date(),
      endTime: null
    };

    // Process in batches
    for (let i = 0; i < data.length; i += this.batchSize) {
      const batch = data.slice(i, i + this.batchSize);
      const batchNumber = Math.floor(i / this.batchSize) + 1;
      const totalBatches = Math.ceil(data.length / this.batchSize);

      try {
        console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} rows)`);
        
        const batchResult = await this.uploadBatch(platform, batch, batchNumber);
        
        results.batches.push(batchResult);
        results.uploadedRows += batchResult.successfulRows;
        results.failedRows += batchResult.failedRows;

        onProgress({
          batchNumber,
          totalBatches,
          processedRows: i + batch.length,
          totalRows: data.length,
          percentage: ((i + batch.length) / data.length) * 100
        });

        onBatchComplete(batchResult);

      } catch (error) {
        console.error(`Batch ${batchNumber} failed:`, error);
        
        const batchError = {
          batchNumber,
          error: error.message,
          failedRows: batch.length,
          timestamp: new Date()
        };
        
        results.errors.push(batchError);
        results.failedRows += batch.length;
      }

      // Brief pause between batches to prevent overwhelming the database
      if (i + this.batchSize < data.length) {
        await this.sleep(100);
      }
    }

    results.endTime = new Date();
    results.duration = results.endTime - results.startTime;
    
    console.log(`Bulk upload completed for ${platform}:`, {
      uploadedRows: results.uploadedRows,
      failedRows: results.failedRows,
      duration: `${results.duration}ms`
    });

    return results;
  }

  async uploadBatch(platform, batch, batchNumber) {
    const tableName = `${platform}_import_data`;
    const conflictColumns = this.getConflictColumns(platform);
    
    let attempt = 0;
    let lastError;

    while (attempt < this.maxRetries) {
      try {
        const { data: insertedData, error } = await this.client
          .from(tableName)
          .upsert(batch, {
            onConflict: conflictColumns,
            ignoreDuplicates: false,
            count: 'exact'
          });

        if (error) throw error;

        return {
          batchNumber,
          successfulRows: batch.length,
          failedRows: 0,
          insertedCount: insertedData?.length || batch.length,
          attempt: attempt + 1,
          timestamp: new Date()
        };

      } catch (error) {
        attempt++;
        lastError = error;
        
        console.warn(`Batch ${batchNumber} attempt ${attempt} failed:`, error.message);
        
        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`Retrying batch ${batchNumber} in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    // All retries failed
    throw new Error(`Batch ${batchNumber} failed after ${this.maxRetries} attempts: ${lastError.message}`);
  }

  getConflictColumns(platform) {
    const conflictMap = {
      meta: 'day,campaign_name,ad_set_name,ad_name',
      google: 'day,campaign',
      shopify: 'day,utm_campaign,utm_term,utm_content'
    };
    return conflictMap[platform];
  }

  async validateDataStructure(platform, data) {
    if (!data || data.length === 0) {
      throw new Error(`No data provided for ${platform} upload`);
    }

    const requiredFields = this.getRequiredFields(platform);
    const sampleRow = data[0];
    
    const missingFields = requiredFields.filter(field => !(field in sampleRow));
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields for ${platform}: ${missingFields.join(', ')}`);
    }

    console.log(`Data structure validation passed for ${platform}`);
  }

  getRequiredFields(platform) {
    const fieldMap = {
      meta: ['day', 'campaign_name', 'ad_set_name', 'ad_name', 'amount_spent'],
      google: ['day', 'campaign', 'cost'],
      shopify: ['day', 'utm_campaign', 'online_store_visitors']
    };
    return fieldMap[platform] || [];
  }

  async queryData(platform, dateRange, options = {}) {
    const tableName = `${platform}_import_data`;
    const {
      columns = '*',
      orderBy = 'day',
      ascending = true,
      limit = null
    } = options;

    let query = this.client
      .from(tableName)
      .select(columns, { count: 'exact' })
      .gte('day', dateRange.start)
      .lte('day', dateRange.end)
      .order(orderBy, { ascending });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to query ${platform} data: ${error.message}`);
    }

    return {
      data: data || [],
      count: count || 0,
      dateRange,
      platform
    };
  }

  async getTableStats(platform) {
    const tableName = `${platform}_import_data`;

    try {
      // Get total row count
      const { count } = await this.client
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      // Get date range
      const { data: dateRangeData } = await this.client
        .from(tableName)
        .select('day')
        .order('day', { ascending: true });

      let dateRange = null;
      if (dateRangeData && dateRangeData.length > 0) {
        dateRange = {
          earliest: dateRangeData[0].day,
          latest: dateRangeData[dateRangeData.length - 1].day
        };
      }

      // Get recent activity
      const { data: recentData } = await this.client
        .from(tableName)
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1);

      return {
        platform,
        tableName,
        totalRows: count || 0,
        dateRange,
        lastUpdated: recentData?.[0]?.created_at || null
      };

    } catch (error) {
      console.error(`Failed to get stats for ${platform}:`, error);
      return {
        platform,
        tableName,
        totalRows: 0,
        dateRange: null,
        lastUpdated: null,
        error: error.message
      };
    }
  }

  async checkConnection() {
    try {
      const { data, error } = await this.client
        .from('meta_import_data')
        .select('count(*)')
        .limit(1);

      if (error) throw error;

      return {
        connected: true,
        timestamp: new Date(),
        database: 'MOI Data Analysis'
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  async optimizeQueries() {
    // Enable query optimization hints
    const optimizations = [];

    try {
      // Analyze table statistics for query planning
      const platforms = ['meta', 'google', 'shopify'];
      
      for (const platform of platforms) {
        const stats = await this.getTableStats(platform);
        optimizations.push({
          platform,
          optimization: stats.totalRows > 10000 ? 'index_scan_preferred' : 'seq_scan_acceptable',
          recommendation: stats.totalRows > 50000 ? 
            'Consider partitioning by date range' : 
            'Current size is optimal'
        });
      }

      return optimizations;
    } catch (error) {
      console.error('Query optimization analysis failed:', error);
      return [];
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default SupabaseService;
```

### Data Upload Implementation

#### Upload Processing API (`api/upload/bulk-upload.js`)
```javascript
import SupabaseService from '../../lib/supabase';
import { DataNormalizer } from '../../lib/data-normalizer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { platform, data, corrections = {} } = req.body;

    if (!platform || !data) {
      return res.status(400).json({
        success: false,
        error: 'Platform and data are required'
      });
    }

    // Normalize data before upload
    const normalizer = new DataNormalizer();
    const normalizedData = await normalizer.normalize(platform, data, corrections);

    // Initialize Supabase service
    const supabaseService = new SupabaseService();

    // Check connection
    const connectionStatus = await supabaseService.checkConnection();
    if (!connectionStatus.connected) {
      throw new Error(`Database connection failed: ${connectionStatus.error}`);
    }

    // Progress tracking
    let progressData = null;
    const onProgress = (progress) => {
      progressData = progress;
      // In a real implementation, you might emit this via WebSocket
      console.log('Upload progress:', progress);
    };

    const onBatchComplete = (batchResult) => {
      console.log(`Batch ${batchResult.batchNumber} completed:`, batchResult);
    };

    // Perform bulk upload
    const uploadResult = await supabaseService.bulkUpload(platform, normalizedData, {
      onProgress,
      onBatchComplete,
      validateBeforeUpload: true
    });

    // Validate upload success
    const validation = await validateUploadResult(supabaseService, platform, uploadResult);

    res.status(200).json({
      success: true,
      uploadResult,
      validation,
      normalizedRowCount: normalizedData.length,
      progressData
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

async function validateUploadResult(supabaseService, platform, uploadResult) {
  try {
    // Get current table stats
    const stats = await supabaseService.getTableStats(platform);
    
    // Calculate success rate
    const successRate = uploadResult.totalRows > 0 ? 
      (uploadResult.uploadedRows / uploadResult.totalRows) : 0;

    // Check for data integrity
    const hasErrors = uploadResult.errors.length > 0;
    const isComplete = uploadResult.uploadedRows === uploadResult.totalRows;

    return {
      isValid: successRate >= 0.95 && !hasErrors,
      successRate,
      isComplete,
      tableStats: stats,
      uploadSummary: {
        totalRows: uploadResult.totalRows,
        uploadedRows: uploadResult.uploadedRows,
        failedRows: uploadResult.failedRows,
        batches: uploadResult.batches.length,
        errors: uploadResult.errors.length,
        duration: uploadResult.duration
      },
      recommendations: generateUploadRecommendations(uploadResult)
    };
  } catch (error) {
    return {
      isValid: false,
      error: error.message
    };
  }
}

function generateUploadRecommendations(uploadResult) {
  const recommendations = [];
  
  if (uploadResult.failedRows > 0) {
    recommendations.push({
      type: 'data_quality',
      message: `${uploadResult.failedRows} rows failed upload - review data quality`,
      priority: 'high'
    });
  }
  
  if (uploadResult.duration > 60000) { // > 1 minute
    recommendations.push({
      type: 'performance',
      message: 'Upload took longer than expected - consider data optimization',
      priority: 'medium'
    });
  }
  
  if (uploadResult.batches.some(batch => batch.attempt > 1)) {
    recommendations.push({
      type: 'reliability',
      message: 'Some batches required retries - monitor database performance',
      priority: 'low'
    });
  }

  return recommendations;
}
```

### Data Normalization

#### Data Normalizer (`lib/data-normalizer.js`)
```javascript
export class DataNormalizer {
  constructor() {
    this.platformMappings = {
      meta: this.getMetaMappings(),
      google: this.getGoogleMappings(),
      shopify: this.getShopifyMappings()
    };
  }

  async normalize(platform, rawData, corrections = {}) {
    console.log(`Normalizing ${rawData.length} rows for ${platform}`);
    
    const mapping = this.platformMappings[platform];
    if (!mapping) {
      throw new Error(`No normalization mapping found for platform: ${platform}`);
    }

    const normalizedData = rawData.map((row, index) => {
      try {
        return this.normalizeRow(row, mapping, corrections, index);
      } catch (error) {
        console.warn(`Row ${index} normalization failed:`, error.message);
        return null;
      }
    }).filter(Boolean);

    console.log(`Normalized ${normalizedData.length}/${rawData.length} rows for ${platform}`);
    
    return normalizedData;
  }

  normalizeRow(row, mapping, corrections, rowIndex) {
    const normalized = {};
    
    for (const [targetField, config] of Object.entries(mapping)) {
      try {
        const value = this.extractValue(row, config, corrections, rowIndex);
        normalized[targetField] = value;
      } catch (error) {
        if (config.required) {
          throw new Error(`Required field ${targetField} failed normalization: ${error.message}`);
        }
        normalized[targetField] = config.defaultValue || null;
      }
    }

    return normalized;
  }

  extractValue(row, config, corrections, rowIndex) {
    // Get raw value from source column(s)
    let value = null;
    
    if (Array.isArray(config.sourceColumns)) {
      // Try multiple source columns
      for (const sourceCol of config.sourceColumns) {
        if (row[sourceCol] !== undefined && row[sourceCol] !== null && row[sourceCol] !== '') {
          value = row[sourceCol];
          break;
        }
      }
    } else {
      value = row[config.sourceColumn];
    }

    // Apply corrections if available
    if (corrections.applied) {
      const correction = corrections.applied.find(c => 
        c.apply_to_column === config.sourceColumn || 
        (Array.isArray(config.sourceColumns) && config.sourceColumns.includes(c.apply_to_column))
      );
      
      if (correction && correction.transformation) {
        value = this.applyCorrection(value, correction.transformation);
      }
    }

    // Apply field-specific transformations
    if (config.transform) {
      value = config.transform(value);
    }

    // Validate result
    if (config.validate && !config.validate(value)) {
      throw new Error(`Validation failed for value: ${value}`);
    }

    return value;
  }

  applyCorrection(value, transformationCode) {
    try {
      // Safely execute transformation
      // In production, use a proper sandboxing solution
      const func = new Function('value', `return ${transformationCode}`);
      return func(value);
    } catch (error) {
      console.warn('Transformation failed:', error);
      return value;
    }
  }

  getMetaMappings() {
    return {
      day: {
        sourceColumns: ['Day', 'day', 'Date', 'date'],
        required: true,
        transform: this.standardizeDate,
        validate: (value) => value && !isNaN(new Date(value))
      },
      campaign_name: {
        sourceColumns: ['Campaign name', 'Campaign', 'campaign_name', 'campaign'],
        required: true,
        transform: this.cleanText,
        validate: (value) => value && value.length > 0
      },
      ad_set_name: {
        sourceColumns: ['Ad set name', 'Ad Set Name', 'ad_set_name', 'adset'],
        required: true,
        transform: this.cleanText,
        validate: (value) => value && value.length > 0
      },
      ad_name: {
        sourceColumns: ['Ad name', 'Ad Name', 'ad_name', 'ad'],
        required: true,
        transform: this.cleanText,
        validate: (value) => value && value.length > 0
      },
      amount_spent: {
        sourceColumns: ['Amount spent (INR)', 'Amount spent', 'amount_spent', 'spend', 'cost'],
        required: true,
        transform: this.parseNumeric,
        validate: (value) => typeof value === 'number' && value >= 0
      },
      ctr: {
        sourceColumns: ['CTR (link click-through rate)', 'CTR', 'ctr'],
        required: false,
        transform: this.parsePercentage,
        validate: (value) => value === null || (typeof value === 'number' && value >= 0)
      },
      cpm: {
        sourceColumns: ['CPM (cost per 1,000 impressions)', 'CPM', 'cpm'],
        required: false,
        transform: this.parseNumeric,
        validate: (value) => value === null || (typeof value === 'number' && value >= 0)
      },
      ad_set_delivery: {
        sourceColumns: ['Ad Set Delivery', 'ad_set_delivery', 'delivery'],
        required: false,
        transform: this.cleanText,
        defaultValue: null
      }
    };
  }

  getGoogleMappings() {
    return {
      day: {
        sourceColumns: ['Day', 'day', 'Date', 'date'],
        required: true,
        transform: this.standardizeDate,
        validate: (value) => value && !isNaN(new Date(value))
      },
      campaign: {
        sourceColumns: ['Campaign', 'campaign', 'Campaign name'],
        required: true,
        transform: this.cleanText,
        validate: (value) => value && value.length > 0
      },
      cost: {
        sourceColumns: ['Cost', 'cost', 'Spend', 'spend'],
        required: true,
        transform: this.parseNumeric,
        validate: (value) => typeof value === 'number' && value >= 0
      },
      ctr: {
        sourceColumns: ['CTR', 'ctr'],
        required: false,
        transform: this.parsePercentage,
        validate: (value) => value === null || (typeof value === 'number' && value >= 0)
      },
      cpm: {
        sourceColumns: ['Avg. CPM', 'CPM', 'cpm'],
        required: false,
        transform: this.parseNumeric,
        validate: (value) => value === null || (typeof value === 'number' && value >= 0)
      },
      currency_code: {
        sourceColumns: ['Currency code', 'currency_code', 'Currency'],
        required: false,
        transform: this.cleanText,
        defaultValue: 'INR'
      },
      campaign_status: {
        sourceColumns: ['Campaign status', 'campaign_status', 'Status'],
        required: false,
        transform: this.cleanText,
        defaultValue: null
      }
    };
  }

  getShopifyMappings() {
    return {
      day: {
        sourceColumns: ['Day', 'day', 'Date', 'date'],
        required: true,
        transform: this.standardizeDate,
        validate: (value) => value && !isNaN(new Date(value))
      },
      utm_campaign: {
        sourceColumns: ['UTM campaign', 'utm_campaign', 'Utm campaign'],
        required: true,
        transform: this.cleanAndDecodeUTM,
        validate: (value) => value && value.length > 0
      },
      utm_term: {
        sourceColumns: ['UTM term', 'utm_term', 'Utm term'],
        required: false,
        transform: this.cleanAndDecodeUTM,
        defaultValue: null
      },
      utm_content: {
        sourceColumns: ['UTM content', 'utm_content', 'Utm content'],
        required: false,
        transform: this.cleanAndDecodeUTM,
        defaultValue: null
      },
      landing_page_url: {
        sourceColumns: ['Landing page URL', 'landing_page_url', 'URL'],
        required: false,
        transform: this.cleanText,
        defaultValue: null
      },
      online_store_visitors: {
        sourceColumns: ['Online store visitors', 'online_store_visitors', 'Visitors'],
        required: true,
        transform: this.parseInteger,
        validate: (value) => typeof value === 'number' && value >= 0
      },
      sessions_completed_checkout: {
        sourceColumns: ['Sessions that completed checkout', 'sessions_completed_checkout', 'Completed checkout'],
        required: false,
        transform: this.parseInteger,
        validate: (value) => value === null || (typeof value === 'number' && value >= 0),
        defaultValue: 0
      },
      sessions_reached_checkout: {
        sourceColumns: ['Sessions that reached checkout', 'sessions_reached_checkout', 'Reached checkout'],
        required: false,
        transform: this.parseInteger,
        validate: (value) => value === null || (typeof value === 'number' && value >= 0),
        defaultValue: 0
      },
      sessions_cart_additions: {
        sourceColumns: ['Sessions with cart additions', 'sessions_cart_additions', 'Cart additions'],
        required: false,
        transform: this.parseInteger,
        validate: (value) => value === null || (typeof value === 'number' && value >= 0),
        defaultValue: 0
      },
      average_session_duration: {
        sourceColumns: ['Average session duration', 'average_session_duration', 'Session duration'],
        required: false,
        transform: this.parseNumeric,
        validate: (value) => value === null || (typeof value === 'number' && value >= 0),
        defaultValue: 0
      },
      pageviews: {
        sourceColumns: ['Pageviews', 'pageviews', 'Page views'],
        required: false,
        transform: this.parseInteger,
        validate: (value) => value === null || (typeof value === 'number' && value >= 0),
        defaultValue: 0
      }
    };
  }

  // Transform functions
  standardizeDate(dateValue) {
    if (!dateValue) return null;
    
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return null;
      
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch {
      return null;
    }
  }

  cleanText(textValue) {
    if (!textValue) return null;
    
    return textValue.toString()
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // Remove control characters
  }

  cleanAndDecodeUTM(utmValue) {
    if (!utmValue) return null;
    
    try {
      // URL decode if needed
      let decoded = utmValue;
      if (utmValue.includes('%')) {
        decoded = decodeURIComponent(utmValue);
      }
      
      return this.cleanText(decoded);
    } catch {
      return this.cleanText(utmValue);
    }
  }

  parseNumeric(numericValue) {
    if (numericValue === null || numericValue === undefined || numericValue === '') {
      return null;
    }
    
    if (typeof numericValue === 'number') {
      return numericValue;
    }
    
    // Remove currency symbols and commas
    const cleaned = numericValue.toString().replace(/[₹$,€£]/g, '').trim();
    const parsed = parseFloat(cleaned);
    
    return isNaN(parsed) ? null : parsed;
  }

  parsePercentage(percentValue) {
    if (percentValue === null || percentValue === undefined || percentValue === '') {
      return null;
    }
    
    const numeric = this.parseNumeric(percentValue);
    if (numeric === null) return null;
    
    // If the value contains %, it's already a percentage
    const isPercentage = percentValue.toString().includes('%');
    return isPercentage ? numeric / 100 : numeric;
  }

  parseInteger(intValue) {
    const numeric = this.parseNumeric(intValue);
    return numeric === null ? null : Math.round(numeric);
  }
}
```

## Performance Optimization

### Query Optimization
- **Indexed Queries**: Use composite indexes for common query patterns
- **Batch Size**: 1000 rows per batch for optimal throughput
- **Connection Pooling**: Reuse database connections
- **Parallel Processing**: Process multiple platforms simultaneously

### Memory Management
- **Streaming Processing**: Handle large datasets without loading everything into memory
- **Garbage Collection**: Explicit cleanup of large objects
- **Batch Boundaries**: Clear memory between batches

### Monitoring and Alerts
- **Upload Progress Tracking**: Real-time progress updates
- **Error Rate Monitoring**: Alert on high failure rates
- **Performance Metrics**: Track upload speed and database performance

## Error Handling

### Retry Strategy
- **Exponential Backoff**: Increasing delays between retries
- **Maximum Attempts**: 3 retries per batch
- **Partial Recovery**: Continue processing remaining batches on individual batch failure

### Data Validation
- **Pre-upload Validation**: Schema and data type checking
- **Post-upload Verification**: Row count and integrity checks
- **Rollback Capability**: Ability to undo failed uploads

### Error Reporting
- **Detailed Logs**: Comprehensive error logging with context
- **User Feedback**: Clear error messages and suggested actions
- **Recovery Options**: Guidance on fixing data issues

## Security Considerations

### Data Protection
- **Input Sanitization**: Clean all input data before processing
- **SQL Injection Prevention**: Use parameterized queries only
- **Access Control**: Appropriate RLS (Row Level Security) policies

### Connection Security
- **SSL/TLS**: Encrypted connections to Supabase
- **API Key Management**: Secure storage of credentials
- **Audit Logging**: Track all data access and modifications

## Testing Strategy

### Unit Tests
- **Data Normalization**: Test field mappings and transformations
- **Batch Processing**: Test batch upload logic
- **Error Handling**: Test retry and recovery mechanisms

### Integration Tests
- **End-to-end Upload**: Full upload workflow testing
- **Performance Tests**: Large dataset handling
- **Concurrent Access**: Multiple upload sessions

### Load Testing
- **Throughput Testing**: Maximum sustainable upload rate
- **Memory Usage**: Monitor memory consumption under load
- **Database Performance**: Impact on database performance

---

*Database Integration Version: 1.0*  
*Last Updated: November 11, 2025*  
*Compatible with: Supabase PostgreSQL 13+*