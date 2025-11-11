# Phase 1: Upload & Validation Implementation

## Overview

Phase 1 focuses on creating a robust file upload system with comprehensive validation and success confirmation. Users will upload Meta, Google, and Shopify CSV files, receive AI-powered data correction suggestions, and view interactive previews of successfully uploaded data.

## Phase 1 Goals

- ✅ Upload 3 CSV files (Meta, Google, Shopify) with drag & drop interface
- ✅ Real-time CSV validation with error detection
- ✅ AI-powered data correction suggestions
- ✅ Bulk upload to existing Supabase tables
- ✅ Upload success validation with row count verification
- ✅ Interactive data preview tables showing actual database content

## Implementation Timeline: Week 1

### Day 1-2: Project Setup & Basic Upload Interface
### Day 3-4: CSV Validation & AI Correction
### Day 5-7: Database Integration & Success Validation

---

## Technical Implementation

### 1. Project Initialization

#### Setup Next.js Project
```bash
cd "/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/DataAnalysisV2"

# Initialize Next.js with TypeScript and Tailwind
npx create-next-app@latest . --typescript --tailwind --eslint --src-dir

# Install required dependencies
npm install @supabase/supabase-js @anthropic-ai/sdk papaparse
npm install @types/papaparse --save-dev
```

#### Environment Configuration
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_claude_api_key
```

### 2. File Upload Interface

#### Main Upload Page (`pages/upload.js`)
```jsx
import { useState } from 'react';
import UploadInterface from '../components/UploadInterface';
import ValidationSummary from '../components/ValidationSummary';

export default function UploadPage() {
  const [uploadState, setUploadState] = useState('initial'); // initial, uploading, validating, success, error
  const [uploadResults, setUploadResults] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            MOI Data Analytics - Upload & Validation
          </h1>
          <p className="text-gray-600 mt-2">
            Upload Meta, Google, and Shopify CSV files for processing
          </p>
        </header>

        {uploadState === 'success' ? (
          <ValidationSummary results={uploadResults} />
        ) : (
          <UploadInterface 
            onUploadComplete={setUploadResults}
            onStateChange={setUploadState}
          />
        )}
      </div>
    </div>
  );
}
```

#### Upload Interface Component (`components/UploadInterface.jsx`)
```jsx
import { useState, useCallback } from 'react';
import FileDropZone from './FileDropZone';
import UploadProgress from './UploadProgress';
import AICorrections from './AICorrections';

const REQUIRED_PLATFORMS = ['meta', 'google', 'shopify'];

export default function UploadInterface({ onUploadComplete, onStateChange }) {
  const [files, setFiles] = useState({});
  const [validationResults, setValidationResults] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [corrections, setCorrections] = useState({});

  const handleFileSelect = useCallback(async (platform, file) => {
    setFiles(prev => ({ ...prev, [platform]: file }));
    
    // Immediate basic validation
    const result = await validateCSV(platform, file);
    setValidationResults(prev => ({ ...prev, [platform]: result }));
    
    // Request AI corrections if needed
    if (result.needsCorrection) {
      const aiCorrections = await requestAICorrections(platform, result.errors);
      setCorrections(prev => ({ ...prev, [platform]: aiCorrections }));
    }
  }, []);

  const handleUpload = async () => {
    if (!canUpload()) return;
    
    setIsUploading(true);
    onStateChange('uploading');
    
    try {
      // Process each file with corrections
      const processedData = {};
      for (const platform of REQUIRED_PLATFORMS) {
        const file = files[platform];
        const platformCorrections = corrections[platform] || {};
        processedData[platform] = await processCSVWithCorrections(file, platformCorrections);
      }
      
      // Bulk upload to Supabase
      const uploadResults = await bulkUploadToSupabase(processedData);
      
      onUploadComplete(uploadResults);
      onStateChange('success');
    } catch (error) {
      console.error('Upload failed:', error);
      onStateChange('error');
    } finally {
      setIsUploading(false);
    }
  };

  const canUpload = () => {
    return REQUIRED_PLATFORMS.every(platform => 
      files[platform] && validationResults[platform]?.isValid
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {REQUIRED_PLATFORMS.map(platform => (
        <div key={platform} className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 capitalize">
            {platform} Data Upload
          </h3>
          
          <FileDropZone
            platform={platform}
            onFileSelect={(file) => handleFileSelect(platform, file)}
            validationResult={validationResults[platform]}
          />
          
          {corrections[platform] && (
            <AICorrections
              platform={platform}
              corrections={corrections[platform]}
              onApply={(appliedCorrections) => 
                setCorrections(prev => ({ ...prev, [platform]: appliedCorrections }))
              }
            />
          )}
        </div>
      ))}

      <div className="lg:col-span-3 mt-6">
        <UploadProgress
          files={files}
          validationResults={validationResults}
          isUploading={isUploading}
          canUpload={canUpload()}
          onUpload={handleUpload}
        />
      </div>
    </div>
  );
}
```

### 3. CSV Validation System

#### File Drop Zone Component (`components/FileDropZone.jsx`)
```jsx
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

export default function FileDropZone({ platform, onFileSelect, validationResult }) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'text/csv') {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false)
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
        ${validationResult?.isValid ? 'border-green-400 bg-green-50' : ''}
        ${validationResult?.hasErrors ? 'border-red-400 bg-red-50' : ''}
      `}
    >
      <input {...getInputProps()} />
      
      {validationResult?.isValid ? (
        <div className="text-green-600">
          <CheckCircleIcon className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">File validated successfully</p>
          <p className="text-sm">{validationResult.rowCount} rows detected</p>
        </div>
      ) : validationResult?.hasErrors ? (
        <div className="text-red-600">
          <ExclamationCircleIcon className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">Validation errors detected</p>
          <p className="text-sm">{validationResult.errors.length} issues found</p>
        </div>
      ) : (
        <div className="text-gray-600">
          <CloudUploadIcon className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">Drop your {platform} CSV file here</p>
          <p className="text-sm">or click to browse</p>
        </div>
      )}
    </div>
  );
}
```

#### CSV Validation Logic (`lib/validators.js`)
```javascript
import Papa from 'papaparse';

export const PLATFORM_SCHEMAS = {
  meta: {
    required: ['Day', 'Campaign name', 'Ad set name', 'Ad name', 'Amount spent (INR)', 'CTR (link click-through rate)', 'CPM (cost per 1,000 impressions)'],
    dateColumn: 'Day',
    expectedFormats: ['YYYY-MM-DD', 'DD-MM-YYYY', 'MM/DD/YYYY']
  },
  google: {
    required: ['Day', 'Campaign', 'Cost', 'CTR', 'Avg. CPM'],
    dateColumn: 'Day', 
    expectedFormats: ['YYYY-MM-DD', 'DD-MM-YYYY', 'MM/DD/YYYY']
  },
  shopify: {
    required: ['Day', 'UTM campaign', 'UTM term', 'UTM content', 'Online store visitors', 'Sessions that completed checkout'],
    dateColumn: 'Day',
    expectedFormats: ['YYYY-MM-DD', 'DD-MM-YYYY', 'MM/DD/YYYY']
  }
};

export async function validateCSV(platform, file) {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      preview: 100, // Parse first 100 rows for validation
      complete: (results) => {
        const validation = performValidation(platform, results.data, results.meta.fields);
        resolve(validation);
      },
      error: (error) => {
        resolve({
          isValid: false,
          hasErrors: true,
          errors: [{ type: 'parse_error', message: error.message }]
        });
      }
    });
  });
}

function performValidation(platform, data, headers) {
  const schema = PLATFORM_SCHEMAS[platform];
  const errors = [];
  const warnings = [];

  // Check required columns
  const missingColumns = schema.required.filter(col => 
    !headers.some(header => normalizeColumnName(header) === normalizeColumnName(col))
  );
  
  if (missingColumns.length > 0) {
    errors.push({
      type: 'missing_columns',
      message: `Missing required columns: ${missingColumns.join(', ')}`,
      columns: missingColumns
    });
  }

  // Validate date formats
  const dateColumn = findColumnByName(headers, schema.dateColumn);
  if (dateColumn) {
    const dateValidation = validateDateFormats(data, dateColumn);
    if (dateValidation.hasIssues) {
      warnings.push({
        type: 'date_format_inconsistency',
        message: `Inconsistent date formats detected in ${dateColumn}`,
        details: dateValidation
      });
    }
  }

  // Validate numeric columns
  const numericValidation = validateNumericColumns(platform, data, headers);
  warnings.push(...numericValidation);

  return {
    isValid: errors.length === 0,
    hasErrors: errors.length > 0,
    hasWarnings: warnings.length > 0,
    needsCorrection: warnings.length > 0,
    errors,
    warnings,
    rowCount: data.length,
    columnCount: headers.length,
    dateRange: detectDateRange(data, dateColumn)
  };
}

function normalizeColumnName(name) {
  return name.toLowerCase().trim().replace(/[^\w]/g, '_');
}

function findColumnByName(headers, targetName) {
  return headers.find(header => 
    normalizeColumnName(header) === normalizeColumnName(targetName)
  );
}

function validateDateFormats(data, dateColumn) {
  const formats = new Set();
  const invalidDates = [];
  
  data.slice(0, 50).forEach((row, index) => {
    const dateValue = row[dateColumn];
    if (dateValue) {
      const detectedFormat = detectDateFormat(dateValue);
      if (detectedFormat) {
        formats.add(detectedFormat);
      } else {
        invalidDates.push({ row: index, value: dateValue });
      }
    }
  });

  return {
    hasIssues: formats.size > 1 || invalidDates.length > 0,
    detectedFormats: Array.from(formats),
    invalidDates,
    recommendedFormat: 'YYYY-MM-DD'
  };
}

function detectDateFormat(dateString) {
  const patterns = [
    { regex: /^\d{4}-\d{2}-\d{2}$/, format: 'YYYY-MM-DD' },
    { regex: /^\d{2}-\d{2}-\d{4}$/, format: 'DD-MM-YYYY' },
    { regex: /^\d{2}\/\d{2}\/\d{4}$/, format: 'MM/DD/YYYY' },
    { regex: /^\d{1,2}\/\d{1,2}\/\d{4}$/, format: 'M/D/YYYY' }
  ];

  for (const pattern of patterns) {
    if (pattern.regex.test(dateString)) {
      return pattern.format;
    }
  }
  return null;
}

function validateNumericColumns(platform, data, headers) {
  const warnings = [];
  const numericColumns = getNumericColumns(platform, headers);
  
  numericColumns.forEach(column => {
    const nonNumericValues = data.slice(0, 50)
      .map((row, index) => ({ index, value: row[column] }))
      .filter(item => item.value && isNaN(parseFloat(item.value.toString().replace(/[,%]/g, ''))));
    
    if (nonNumericValues.length > 0) {
      warnings.push({
        type: 'non_numeric_values',
        message: `Non-numeric values detected in ${column}`,
        column,
        samples: nonNumericValues.slice(0, 5)
      });
    }
  });

  return warnings;
}

function getNumericColumns(platform, headers) {
  const numericPatterns = {
    meta: ['amount', 'spent', 'cost', 'ctr', 'cpm'],
    google: ['cost', 'ctr', 'cpm'],
    shopify: ['visitors', 'sessions', 'checkout', 'duration', 'pageviews']
  };

  return headers.filter(header => {
    const normalized = normalizeColumnName(header);
    return numericPatterns[platform].some(pattern => normalized.includes(pattern));
  });
}

function detectDateRange(data, dateColumn) {
  if (!dateColumn || data.length === 0) return null;
  
  const dates = data
    .map(row => row[dateColumn])
    .filter(Boolean)
    .map(dateStr => new Date(dateStr))
    .filter(date => !isNaN(date.getTime()))
    .sort();

  if (dates.length === 0) return null;

  return {
    start: dates[0].toISOString().split('T')[0],
    end: dates[dates.length - 1].toISOString().split('T')[0],
    totalDays: Math.ceil((dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24)) + 1
  };
}
```

### 4. AI-Powered Data Correction

#### AI Corrections Component (`components/AICorrections.jsx`)
```jsx
import { useState } from 'react';

export default function AICorrections({ platform, corrections, onApply }) {
  const [selectedCorrections, setSelectedCorrections] = useState(
    corrections.suggestions.reduce((acc, suggestion) => ({
      ...acc,
      [suggestion.id]: true
    }), {})
  );

  const handleApplyCorrections = () => {
    const appliedCorrections = corrections.suggestions.filter(
      suggestion => selectedCorrections[suggestion.id]
    );
    onApply({
      ...corrections,
      applied: appliedCorrections
    });
  };

  return (
    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center mb-3">
        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2" />
        <h4 className="font-medium text-yellow-800">
          AI-Powered Corrections Available
        </h4>
      </div>

      <div className="space-y-3">
        {corrections.suggestions.map(suggestion => (
          <div key={suggestion.id} className="flex items-start space-x-3">
            <input
              type="checkbox"
              id={suggestion.id}
              checked={selectedCorrections[suggestion.id]}
              onChange={(e) => setSelectedCorrections(prev => ({
                ...prev,
                [suggestion.id]: e.target.checked
              }))}
              className="mt-1"
            />
            <label htmlFor={suggestion.id} className="flex-1 text-sm">
              <div className="font-medium text-gray-900">{suggestion.title}</div>
              <div className="text-gray-600">{suggestion.description}</div>
              {suggestion.example && (
                <div className="mt-1 text-xs bg-white p-2 rounded border">
                  <strong>Example:</strong> {suggestion.example.before} → {suggestion.example.after}
                </div>
              )}
            </label>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end space-x-3">
        <button
          onClick={() => setSelectedCorrections({})}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
        >
          Deselect All
        </button>
        <button
          onClick={handleApplyCorrections}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          Apply Selected Corrections
        </button>
      </div>
    </div>
  );
}
```

#### AI Correction API (`api/ai/fix-data.js`)
```javascript
import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { platform, validationErrors, sampleData } = req.body;
    
    const corrections = await generateAICorrections(platform, validationErrors, sampleData);
    
    res.status(200).json({ corrections });
  } catch (error) {
    console.error('AI correction error:', error);
    res.status(500).json({ error: 'Failed to generate corrections' });
  }
}

async function generateAICorrections(platform, errors, sampleData) {
  const prompt = buildCorrectionPrompt(platform, errors, sampleData);
  
  const message = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 1000,
    temperature: 0,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  return parseAIResponse(message.content[0].text);
}

function buildCorrectionPrompt(platform, errors, sampleData) {
  return `
You are a data correction specialist for marketing analytics. Analyze the following ${platform} data issues and provide specific correction suggestions.

Platform: ${platform}
Validation Errors: ${JSON.stringify(errors, null, 2)}
Sample Data (first 5 rows): ${JSON.stringify(sampleData.slice(0, 5), null, 2)}

Provide corrections in this exact JSON format:
{
  "suggestions": [
    {
      "id": "unique_id",
      "type": "date_format|column_mapping|data_cleaning",
      "title": "Brief title",
      "description": "Detailed description",
      "confidence": 0.95,
      "example": {
        "before": "original_value", 
        "after": "corrected_value"
      },
      "apply_to_column": "column_name",
      "transformation": "javascript_transformation_function"
    }
  ]
}

Focus on:
1. Date format standardization to YYYY-MM-DD
2. Column name normalization 
3. Numeric value cleaning (remove currency symbols, percentages)
4. Text encoding fixes

Be practical and only suggest high-confidence corrections.
`;
}

function parseAIResponse(response) {
  try {
    const parsed = JSON.parse(response);
    return {
      suggestions: parsed.suggestions || [],
      timestamp: new Date().toISOString(),
      model: 'claude-3-sonnet'
    };
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return {
      suggestions: [],
      error: 'Failed to parse AI suggestions'
    };
  }
}
```

### 5. Database Upload & Success Validation

#### Upload Processing API (`api/upload/process.js`)
```javascript
import { createClient } from '@supabase/supabase-js';
import Papa from 'papaparse';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { platform, csvData, corrections } = req.body;
    
    // Parse CSV with corrections applied
    const processedData = await processCSVData(csvData, corrections);
    
    // Bulk upload to Supabase
    const uploadResult = await bulkUploadToSupabase(platform, processedData);
    
    // Validate upload success
    const validation = await validateUploadSuccess(platform, uploadResult);
    
    res.status(200).json({
      success: true,
      uploadResult,
      validation
    });
  } catch (error) {
    console.error('Upload processing error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

async function processCSVData(csvData, corrections) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Apply column name corrections
        const columnCorrection = corrections.applied?.find(
          c => c.type === 'column_mapping' && c.apply_to_column === header
        );
        return columnCorrection ? columnCorrection.transformation(header) : header;
      },
      transform: (value, column) => {
        // Apply data corrections
        const dataCorrections = corrections.applied?.filter(
          c => c.apply_to_column === column
        ) || [];
        
        let processedValue = value;
        for (const correction of dataCorrections) {
          if (correction.transformation) {
            processedValue = applyTransformation(correction.transformation, processedValue);
          }
        }
        return processedValue;
      },
      complete: (results) => resolve(results.data),
      error: (error) => reject(error)
    });
  });
}

function applyTransformation(transformationCode, value) {
  try {
    // Safely execute transformation function
    // This is a simplified version - in production, use a proper sandboxing solution
    const func = new Function('value', `return ${transformationCode}`);
    return func(value);
  } catch (error) {
    console.warn('Transformation failed:', error);
    return value;
  }
}

async function bulkUploadToSupabase(platform, data) {
  const tableName = `${platform}_import_data`;
  const batchSize = 1000;
  
  const results = {
    totalRows: data.length,
    uploadedRows: 0,
    errors: [],
    batches: []
  };

  // Process in batches similar to upload_real_shopify_data.py
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    
    try {
      const { data: insertedData, error } = await supabase
        .from(tableName)
        .upsert(batch, { 
          onConflict: platform === 'meta' ? 'day,campaign_name,ad_set_name,ad_name' : 
                      platform === 'google' ? 'day,campaign' :
                      'day,utm_campaign,utm_term,utm_content',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      results.uploadedRows += batch.length;
      results.batches.push({
        batchIndex: Math.floor(i / batchSize),
        rows: batch.length,
        success: true
      });
    } catch (error) {
      results.errors.push({
        batchIndex: Math.floor(i / batchSize),
        error: error.message,
        affectedRows: batch.length
      });
    }
  }

  return results;
}

async function validateUploadSuccess(platform, uploadResult) {
  const tableName = `${platform}_import_data`;
  
  // Count actual rows in database
  const { count, error } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });

  if (error) {
    return {
      isValid: false,
      error: error.message
    };
  }

  return {
    isValid: uploadResult.errors.length === 0,
    expectedRows: uploadResult.totalRows,
    actualRows: uploadResult.uploadedRows,
    databaseCount: count,
    uploadSuccess: uploadResult.uploadedRows === uploadResult.totalRows,
    errors: uploadResult.errors
  };
}
```

#### Upload Summary API (`api/upload/summary.js`)
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { platforms } = req.query; // comma-separated list
    const platformList = platforms ? platforms.split(',') : ['meta', 'google', 'shopify'];
    
    const summary = {};
    
    for (const platform of platformList) {
      summary[platform] = await getPlatformSummary(platform);
    }

    res.status(200).json({ summary });
  } catch (error) {
    console.error('Summary generation error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
}

async function getPlatformSummary(platform) {
  const tableName = `${platform}_import_data`;
  
  // Get total row count
  const { count } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });

  // Get date range
  const { data: dateRange } = await supabase
    .from(tableName)
    .select('day')
    .order('day', { ascending: true })
    .limit(1);

  const { data: maxDate } = await supabase
    .from(tableName)
    .select('day')
    .order('day', { ascending: false })
    .limit(1);

  // Get sample data for preview
  const { data: sampleData } = await supabase
    .from(tableName)
    .select('*')
    .order('day', { ascending: false })
    .limit(10);

  // Platform-specific metrics
  let platformMetrics = {};
  if (platform === 'meta') {
    const { data: campaigns } = await supabase
      .from(tableName)
      .select('campaign_name')
      .not('campaign_name', 'is', null);
    platformMetrics.uniqueCampaigns = [...new Set(campaigns?.map(c => c.campaign_name) || [])].length;
  } else if (platform === 'google') {
    const { data: campaigns } = await supabase
      .from(tableName)
      .select('campaign')
      .not('campaign', 'is', null);
    platformMetrics.uniqueCampaigns = [...new Set(campaigns?.map(c => c.campaign) || [])].length;
  } else if (platform === 'shopify') {
    const { data: utmCampaigns } = await supabase
      .from(tableName)
      .select('utm_campaign')
      .not('utm_campaign', 'is', null);
    platformMetrics.uniqueUTMCampaigns = [...new Set(utmCampaigns?.map(c => c.utm_campaign) || [])].length;
  }

  return {
    rowCount: count || 0,
    dateRange: {
      start: dateRange?.[0]?.day || null,
      end: maxDate?.[0]?.day || null
    },
    sampleData: sampleData || [],
    metrics: platformMetrics,
    lastUpdated: new Date().toISOString()
  };
}
```

### 6. Interactive Data Preview

#### Validation Summary Component (`components/ValidationSummary.jsx`)
```jsx
import { useState, useEffect } from 'react';
import DataPreviewTable from './DataPreviewTable';

export default function ValidationSummary({ results }) {
  const [summaryData, setSummaryData] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState('meta');

  useEffect(() => {
    fetchSummaryData();
  }, []);

  const fetchSummaryData = async () => {
    try {
      const response = await fetch('/api/upload/summary?platforms=meta,google,shopify');
      const data = await response.json();
      setSummaryData(data.summary);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  if (!summaryData) {
    return <div className="text-center py-8">Loading validation summary...</div>;
  }

  const calculateQualityScore = () => {
    const platforms = Object.keys(summaryData);
    const scores = platforms.map(platform => {
      const data = summaryData[platform];
      let score = 100;
      
      // Deduct points for missing data
      if (data.rowCount === 0) score -= 50;
      if (!data.dateRange.start || !data.dateRange.end) score -= 20;
      
      return score;
    });
    
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const qualityScore = calculateQualityScore();

  return (
    <div className="space-y-6">
      {/* Overall Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Upload Validation Summary
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">
              {Object.values(summaryData).reduce((sum, platform) => sum + platform.rowCount, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Rows Uploaded</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{qualityScore}%</div>
            <div className="text-sm text-gray-600">Data Quality Score</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">
              {Math.max(...Object.values(summaryData).map(p => 
                p.dateRange.start && p.dateRange.end ? 
                Math.ceil((new Date(p.dateRange.end) - new Date(p.dateRange.start)) / (1000 * 60 * 60 * 24)) + 1 : 0
              ))}
            </div>
            <div className="text-sm text-gray-600">Days of Data</div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600">
              {Object.keys(summaryData).length}
            </div>
            <div className="text-sm text-gray-600">Platforms</div>
          </div>
        </div>

        {/* Platform Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(summaryData).map(([platform, data]) => (
            <div key={platform} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold capitalize">{platform}</h3>
                <span className="flex items-center text-green-600">
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  Success
                </span>
              </div>
              
              <div className="space-y-1 text-sm text-gray-600">
                <div>Rows: {data.rowCount.toLocaleString()}</div>
                <div>Date Range: {data.dateRange.start} to {data.dateRange.end}</div>
                {data.metrics.uniqueCampaigns && (
                  <div>Campaigns: {data.metrics.uniqueCampaigns}</div>
                )}
                {data.metrics.uniqueUTMCampaigns && (
                  <div>UTM Campaigns: {data.metrics.uniqueUTMCampaigns}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Data Preview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Data Preview</h3>
          
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="border rounded px-3 py-1"
          >
            {Object.keys(summaryData).map(platform => (
              <option key={platform} value={platform} className="capitalize">
                {platform} Data
              </option>
            ))}
          </select>
        </div>

        <DataPreviewTable
          platform={selectedPlatform}
          data={summaryData[selectedPlatform]?.sampleData || []}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => window.location.href = '/reports'}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Generate Reports
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
        >
          Upload New Data
        </button>
      </div>
    </div>
  );
}
```

---

## Phase 1 Testing Strategy

### Unit Testing
- CSV validation functions
- AI correction parsing
- Data transformation utilities
- Supabase upload functions

### Integration Testing
- File upload flow end-to-end
- AI correction application
- Database upload verification
- Summary data generation

### User Acceptance Testing
- Upload various CSV formats
- Test error scenarios
- Validate data preview accuracy
- Confirm success indicators

## Phase 1 Success Criteria

- ✅ Upload 3 CSV files with drag & drop
- ✅ Real-time validation with error detection
- ✅ AI-powered correction suggestions
- ✅ Successful bulk upload to Supabase
- ✅ Upload verification with row count matching
- ✅ Interactive preview of uploaded database content
- ✅ 95%+ data quality score for clean files
- ✅ Handle files up to 10,000 rows efficiently
- ✅ Clear error messages and recovery options

---
*Phase 1 Timeline: Week 1 (7 days)*  
*Next Phase: [AI Intelligence Enhancement](phase-2-ai-intelligence.md)*