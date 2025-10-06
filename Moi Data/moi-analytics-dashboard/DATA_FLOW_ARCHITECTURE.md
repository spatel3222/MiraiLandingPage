# MOI Analytics Dashboard - Data Flow Architecture

## 🚀 Quick Reference

| Issue | Quick Check | Fix Location |
|-------|-------------|--------------|
| Empty adset export | `dailyBreakdownData.adsetData.length` | ExportModal.tsx:306-315 |
| Zero users | Check `'Online store visitors'` in Shopify | outputDataProcessor.ts:82-110 |
| Multi-day not showing | Use `getCumulativeDataArrays()` vs `getDailyBreakdownData()` | Various |
| Field name variations | Check fallback mappings | ExportModal.tsx:324-325 |
| Date parsing fails | Verify format support | dateNormalizer.ts |

## Overview

The MOI Analytics Dashboard processes multi-platform advertising data (Meta, Google, Shopify) through a pipeline that transforms raw CSV inputs into dashboard metrics and exportable reports. Supports single-day and multi-day cumulative processing.

**Core Philosophy**: Raw CSV → localStorage → Integrated Processing → Dashboard Display + Export

## Data Flow Architecture

### Input Data Sources

| Platform | Key Fields | Date Field | Critical Field | Purpose |
|----------|------------|------------|----------------|---------|
| **Meta** | Campaign name, Ad set name, Amount spent (INR) | `Reporting ends` column | `Ad Set Level Users` | User calculations |
| **Google** | Campaign, Cost, CTR, Avg. CPM | Second row: "September 29, 2025 - September 29, 2025" | - | Cost and performance |
| **Shopify** | Day/Date, Utm campaign, Utm term | `Day` column | `Online store visitors` | User base calculation |

### Date Synchronization Requirements

**CRITICAL**: Each platform stores dates differently - proper synchronization required:

| Platform | Date Location | Format | Extraction Method |
|----------|---------------|--------|-------------------|
| **Google Ads** | Row 2 of CSV | "September 29, 2025 - September 29, 2025" | Extract from date range in second row |
| **Meta Ads** | "Reporting ends" column | Standard date format | Column value extraction |
| **Shopify Export** | "Day" column | YYYY-MM-DD or similar | Column value extraction |

**FIXED**: When Shopify file is absent, fallback path now properly detects date from Meta/Google files using `detectDateRangeFromFiles()` (fileLoader.ts:373-387)

### Processing Pipeline

| Stage | Function | Location | Key Operations |
|-------|----------|----------|----------------|
| **1. Load** | `storeDailyDataFromInputFiles()` | fileLoader.ts:315-449 | Parse CSV → localStorage |
| **2. Process** | `processAllInputFiles()` | integratedDataProcessor.ts:35-201 | Date detection, normalization, platform merging |
| **3. Transform** | `processOutputFiles()` | outputDataProcessor.ts:46-334 | Dashboard format, performance tiers |

### Performance Tier Logic
| Tier | Quality Users | Code Location |
|------|---------------|---------------|
| Excellent | ≥500 | outputDataProcessor.ts:237 |
| Good | 200-499 | outputDataProcessor.ts:238 |
| Average | 50-199 | outputDataProcessor.ts:239 |
| Poor | <50 | outputDataProcessor.ts:240 |

### Storage & Export

| Storage Key | Data Type | Purpose |
|-------------|-----------|---------|
| `moi-cumulative-data` | CumulativeDataStore | Multi-day storage |
| `moi-shopify-data` | Compressed records | Original Shopify data |
| `moi-meta-data` | Raw records | Original Meta data |
| `moi-dashboard-data` | DashboardData | Final dashboard format |

| Function | Purpose | Data Output |
|----------|---------|-------------|
| `getCumulativeDataArrays()` | Dashboard display | Aggregated metrics |
| `getDailyBreakdownData()` | Export generation | Daily separate rows |

## Field Mappings

### CSV → Internal Mappings

| Platform | CSV Field | Internal Field | Usage |
|----------|-----------|----------------|-------|
| **Meta** | `Campaign name` | `campaignName` | Campaign grouping |
| | `Ad Set Level Users` | `users` | **CRITICAL**: User calculations |
| | `Amount spent (INR)` | `spend` | Cost calculations |
| | `Ad set name` | `adSetName` | AdSet identification |
| **Shopify** | `Day`/`Date` | `date` | Date identification |
| | `Online store visitors` | `totalUsers` | **CRITICAL**: User base |
| | `UTM campaign`/`Utm campaign` | `utmCampaign` | Campaign grouping |
| | `UTM term`/`Utm term` | `utmTerm` | AdSet/term grouping |
| | `Sessions with cart additions` | `totalATC` | Cart addition tracking |
| | `Sessions that reached checkout` | `totalReachedCheckout` | Checkout tracking |
| | `Average session duration` | `sessionDuration` | Session quality |
| **Google** | `Campaign` | `campaignName` | Campaign grouping |
| | `Cost` | `spend` | Cost calculations |
| | `CTR` | `ctr` | Click-through rate |
| | `Avg. CPM` | `cpm` | Cost per mille |

## Critical Functions

| Function | File | Purpose | Key Logic |
|----------|------|---------|-----------|
| `loadExistingOutputFiles()` | fileLoader.ts:37-129 | Primary data loading | Cumulative data → fallback hierarchy |
| `processAllInputFiles()` | integratedDataProcessor.ts:35-201 | Multi-platform integration | Date detection → platform merging |
| `generateAdsetData()` | integratedDataProcessor.ts:355+ | Generate adset-level data | Uses `Ad Set Level Users` from Meta CSV |
| `processOutputFiles()` | outputDataProcessor.ts:46-334 | Dashboard transformation | User fallback → performance tiers |
| `downloadFile()` | ExportModal.tsx:87-417 | CSV export generation | Daily breakdown → Meta spend lookup |
| `storeDailyData()` | cumulativeDataManager.ts:51-76 | Multi-day storage | Date normalization → localStorage |

## Common Issues & Debugging

### 1. Empty Adset Export
**Root Cause**: `dailyBreakdownData.adsetData` empty but dashboard has campaign data
**Fix**: ExportModal.tsx:306-315 fallback logic
```typescript
if (adsetBreakdownData.length === 0 && 
    ((dashboardData?.campaigns && dashboardData.campaigns.length > 0) || 
     (dashboardData?.utmCampaigns && dashboardData.utmCampaigns.length > 0))) {
  adsetBreakdownData = dashboardData.campaigns?.length > 0 ? dashboardData.campaigns : (dashboardData.utmCampaigns || []);
}
```

### 2. Zero Users Issue
**Root Cause**: Missing/invalid Shopify `'Online store visitors'` field
**Fix**: outputDataProcessor.ts:82-110 fallback calculation
```typescript
if (totalUsers <= 0) {
  const shopifyDataRaw = localStorage.getItem('moi-shopify-data');
  if (shopifyDataRaw) {
    const shopifyData = JSON.parse(shopifyDataRaw);
    totalUsers = shopifyData.reduce((sum, row) => sum + (parseFloat(row['Online store visitors']) || 0), 0);
  }
}
```

### 3. Multi-Day Data Display
**Solution**: Use correct function for context
- **Dashboard**: `getCumulativeDataArrays()` (aggregated)
- **Export**: `getDailyBreakdownData()` (separate daily rows)

### 4. Field Name Variations
**Issue**: CSV fields may have different casing/spacing
**Solution**: ExportModal.tsx:324-325 implements multiple fallbacks:
```typescript
const campaignName = adsetRow.campaignName || adsetRow['UTM Campaign'] || adsetRow.name || adsetRow.utmCampaign || `Campaign ${index + 1}`;
const adSetName = adsetRow.adSetName || adsetRow['UTM Term'] || adsetRow.adSet || adsetRow.utmTerm || adsetRow.name || `AdSet ${index + 1}`;
```

## Recent Breaking Changes

| Change | Impact | Migration |
|--------|--------|-----------|
| `campaigns` → `utmCampaigns` | Primary campaign data source changed | ExportModal checks both fields (lines 308-314) |
| Multi-day cumulative support | New storage mechanism | Use `getCumulativeDataArrays()` vs `getDailyBreakdownData()` |
| Adset data fallback | Export system enhanced | New fallback logic in ExportModal.tsx:306-315 |

## 🔧 Complete Debugging Guide

### Core Debugging Commands

#### localStorage Health Check
```javascript
// Check all MOI data storage
['moi-shopify-data', 'moi-meta-data', 'moi-cumulative-data', 'moi-dashboard-data', 'moi-google-data'].forEach(key => {
  const data = localStorage.getItem(key);
  console.log(`${key}: ${data ? `EXISTS (${Math.round(data.length/1024)}KB)` : 'MISSING'}`);
});

// Detailed cumulative data inspection
const cumulativeData = JSON.parse(localStorage.getItem('moi-cumulative-data') || '{}');
console.log('Cumulative data dates:', Object.keys(cumulativeData));
console.log('Data structure:', cumulativeData);
```

#### Data Structure Verification
```javascript
// Verify data formats at each stage
const shopifyData = JSON.parse(localStorage.getItem('moi-shopify-data') || '[]');
const metaData = JSON.parse(localStorage.getItem('moi-meta-data') || '[]');
const dashboardData = JSON.parse(localStorage.getItem('moi-dashboard-data') || '{}');

console.log('=== SHOPIFY DATA ===');
console.log('Fields:', Object.keys(shopifyData[0] || {}));
console.log('Sample row:', shopifyData[0]);
console.log('Records count:', shopifyData.length);

console.log('=== META DATA ===');
console.log('Fields:', Object.keys(metaData[0] || {}));
console.log('Has Ad Set Level Users:', metaData[0]?.['Ad Set Level Users'] !== undefined);
console.log('Sample spend values:', metaData.slice(0,3).map(r => r['Amount spent (INR)']));

console.log('=== DASHBOARD DATA ===');
console.log('Structure:', Object.keys(dashboardData));
console.log('Campaigns count:', dashboardData.campaigns?.length || 0);
console.log('UTM Campaigns count:', dashboardData.utmCampaigns?.length || 0);
console.log('Total users:', dashboardData.totalUsers);
```

### 🚨 Critical Issue Debugging

#### Dashboard Shows Data But Export is Empty
```javascript
// Step 1: Check if data exists in dashboard format
const dashboardData = JSON.parse(localStorage.getItem('moi-dashboard-data') || '{}');
console.log('Dashboard campaigns:', dashboardData.campaigns?.length || 0);
console.log('Dashboard UTM campaigns:', dashboardData.utmCampaigns?.length || 0);

// Step 2: Check export data generation
const { getDailyBreakdownData } = await import('./src/services/configurableDataProcessor');
const dailyBreakdown = getDailyBreakdownData();
console.log('Daily breakdown data:', dailyBreakdown);
console.log('Adset data count:', dailyBreakdown.adsetData?.length || 0);

// Step 3: Verify fallback logic
if (dailyBreakdown.adsetData?.length === 0) {
  console.log('⚠️ Fallback needed - checking dashboard data for campaigns');
  console.log('Available for fallback:', dashboardData.campaigns || dashboardData.utmCampaigns);
}
```

#### Multi-Day Export Issues
```javascript
// Check cumulative data storage
const cumulativeData = JSON.parse(localStorage.getItem('moi-cumulative-data') || '{}');
console.log('Stored dates:', Object.keys(cumulativeData));

// Verify each date's data
Object.entries(cumulativeData).forEach(([date, data]) => {
  console.log(`${date}:`, {
    campaigns: data.campaigns?.length || 0,
    utmCampaigns: data.utmCampaigns?.length || 0,
    totalUsers: data.totalUsers,
    adsetData: data.adsetData?.length || 0
  });
});

// Check if getCumulativeDataArrays works
const { getCumulativeDataArrays } = await import('./src/services/configurableDataProcessor');
const cumulativeArrays = getCumulativeDataArrays();
console.log('Cumulative arrays:', cumulativeArrays);
```

#### Date Range and Processing Issues
```javascript
// Check date detection and normalization
const { detectDateRangeFromData } = await import('./src/utils/dateRangeDetector');
const shopifyData = JSON.parse(localStorage.getItem('moi-shopify-data') || '[]');

if (shopifyData.length > 0) {
  const dateRange = detectDateRangeFromData(shopifyData);
  console.log('Detected date range:', dateRange);
  
  // Check date formats in data
  console.log('Sample dates from Shopify:', shopifyData.slice(0,5).map(r => r.Day || r.Date));
}
```

### 🔍 Platform-Specific Validation

#### Meta CSV Format Validation
```javascript
const metaData = JSON.parse(localStorage.getItem('moi-meta-data') || '[]');
if (metaData.length > 0) {
  const requiredFields = ['Campaign name', 'Ad set name', 'Amount spent (INR)', 'Ad Set Level Users'];
  const availableFields = Object.keys(metaData[0]);
  
  console.log('=== META CSV VALIDATION ===');
  requiredFields.forEach(field => {
    const exists = availableFields.includes(field);
    console.log(`${exists ? '✅' : '❌'} ${field}: ${exists ? 'Found' : 'MISSING'}`);
    
    if (!exists) {
      console.log('Available similar fields:', availableFields.filter(f => 
        f.toLowerCase().includes(field.toLowerCase().split(' ')[0])
      ));
    }
  });
  
  // Check data quality
  const spendValues = metaData.map(r => parseFloat(r['Amount spent (INR)']) || 0);
  const userValues = metaData.map(r => parseFloat(r['Ad Set Level Users']) || 0);
  
  console.log('Spend stats:', {
    total: spendValues.reduce((a,b) => a+b, 0),
    max: Math.max(...spendValues),
    nonZero: spendValues.filter(v => v > 0).length
  });
  
  console.log('User stats:', {
    total: userValues.reduce((a,b) => a+b, 0),
    max: Math.max(...userValues),
    nonZero: userValues.filter(v => v > 0).length
  });
}
```

#### Shopify CSV Format Validation
```javascript
const shopifyData = JSON.parse(localStorage.getItem('moi-shopify-data') || '[]');
if (shopifyData.length > 0) {
  const requiredFields = ['Day', 'Date', 'Online store visitors', 'Utm campaign', 'Utm term'];
  const availableFields = Object.keys(shopifyData[0]);
  
  console.log('=== SHOPIFY CSV VALIDATION ===');
  requiredFields.forEach(field => {
    const variations = [field, field.toLowerCase(), field.replace(/\s+/g, ''), `UTM ${field.split(' ')[1]}`];
    const found = variations.find(v => availableFields.includes(v));
    
    console.log(`${found ? '✅' : '❌'} ${field}: ${found || 'MISSING'}`);
  });
  
  // Check critical user data
  const userField = availableFields.find(f => f.toLowerCase().includes('visitors')) || 'Online store visitors';
  const userValues = shopifyData.map(r => parseFloat(r[userField]) || 0);
  
  console.log('Visitor stats:', {
    field: userField,
    total: userValues.reduce((a,b) => a+b, 0),
    max: Math.max(...userValues),
    nonZero: userValues.filter(v => v > 0).length,
    dailyAvg: userValues.reduce((a,b) => a+b, 0) / userValues.length
  });
}
```

#### Google CSV Format Validation
```javascript
const googleData = JSON.parse(localStorage.getItem('moi-google-data') || '[]');
if (googleData.length > 0) {
  const requiredFields = ['Campaign', 'Cost', 'CTR', 'Avg. CPM'];
  const availableFields = Object.keys(googleData[0]);
  
  console.log('=== GOOGLE CSV VALIDATION ===');
  requiredFields.forEach(field => {
    const exists = availableFields.includes(field);
    console.log(`${exists ? '✅' : '❌'} ${field}: ${exists ? 'Found' : 'MISSING'}`);
  });
}
```

### 🏥 Data Pipeline Health Checks

#### Pipeline Stage Validation
```javascript
// Stage 1: Raw data loaded
console.log('=== STAGE 1: RAW DATA ===');
const hasShopify = localStorage.getItem('moi-shopify-data') !== null;
const hasMeta = localStorage.getItem('moi-meta-data') !== null;
const hasGoogle = localStorage.getItem('moi-google-data') !== null;

console.log(`Shopify: ${hasShopify ? '✅' : '❌'}`);
console.log(`Meta: ${hasMeta ? '✅' : '❌'}`);
console.log(`Google: ${hasGoogle ? '✅' : '❌'}`);

// Stage 2: Processing completed
console.log('=== STAGE 2: PROCESSED DATA ===');
const dashboardData = JSON.parse(localStorage.getItem('moi-dashboard-data') || '{}');
const hasCampaigns = (dashboardData.campaigns?.length || 0) > 0;
const hasUtmCampaigns = (dashboardData.utmCampaigns?.length || 0) > 0;
const hasUsers = (dashboardData.totalUsers || 0) > 0;

console.log(`Campaigns: ${hasCampaigns ? '✅' : '❌'} (${dashboardData.campaigns?.length || 0})`);
console.log(`UTM Campaigns: ${hasUtmCampaigns ? '✅' : '❌'} (${dashboardData.utmCampaigns?.length || 0})`);
console.log(`Total Users: ${hasUsers ? '✅' : '❌'} (${dashboardData.totalUsers || 0})`);

// Stage 3: Export readiness
console.log('=== STAGE 3: EXPORT READINESS ===');
const { getDailyBreakdownData } = await import('./src/services/configurableDataProcessor');
try {
  const dailyBreakdown = getDailyBreakdownData();
  const hasAdsetData = (dailyBreakdown.adsetData?.length || 0) > 0;
  console.log(`Adset Export Data: ${hasAdsetData ? '✅' : '❌'} (${dailyBreakdown.adsetData?.length || 0} rows)`);
} catch (e) {
  console.log(`Export Generation: ❌ ERROR - ${e.message}`);
}
```

### 🚀 Performance Validation

#### localStorage Size Check
```javascript
// Check if approaching localStorage limits
let totalSize = 0;
const keys = ['moi-shopify-data', 'moi-meta-data', 'moi-cumulative-data', 'moi-dashboard-data'];

keys.forEach(key => {
  const data = localStorage.getItem(key);
  if (data) {
    const sizeKB = Math.round(data.length / 1024);
    totalSize += sizeKB;
    console.log(`${key}: ${sizeKB}KB`);
  }
});

console.log(`Total localStorage usage: ${totalSize}KB / ~5120KB limit`);
if (totalSize > 4000) {
  console.warn('⚠️ Approaching localStorage limit - compression may be needed');
}
```

### 🎯 Troubleshooting Decision Tree

```
Data Issues Troubleshooting Flow:

1. Dashboard Empty?
   ├─ YES → Check localStorage (run localStorage health check)
   │   ├─ No data → Files not loaded properly (check file formats)
   │   └─ Data exists → Check processing (run pipeline validation)
   └─ NO → Dashboard working, check export issues

2. Export Empty but Dashboard Shows Data?
   ├─ Run "Dashboard Shows Data But Export is Empty" debug
   ├─ Check if getDailyBreakdownData() returns data
   ├─ Verify adsetData array length
   └─ If needed, check fallback logic in ExportModal.tsx:306-315

3. Multi-day Export Not Working?
   ├─ Check cumulative data storage (getCumulativeDataArrays)
   ├─ Verify each date has complete data
   ├─ Check date range detection
   └─ Validate storeDailyData() function

4. Wrong Numbers in Dashboard?
   ├─ Validate CSV field mappings (run platform validation)
   ├─ Check user calculation fallbacks
   ├─ Verify spend aggregation logic
   └─ Check performance tier calculations

5. CSV Upload Fails?
   ├─ Check file format (run CSV validation)
   ├─ Verify required fields exist
   ├─ Check for field name variations
   └─ Validate data types and formats
```

### 🏷️ Common Error Messages & Solutions

| Error Message | Location | Root Cause | Solution |
|---------------|----------|------------|----------|
| `Cannot read property 'length' of undefined` | ExportModal | adsetData is undefined | Check `getDailyBreakdownData()` return value |
| `localStorage quota exceeded` | fileLoader.ts | Files too large | Use compression or reduce data size |
| `Date parsing failed` | dateRangeDetector | Invalid date format | Check CSV date format, update parser |
| `Ad Set Level Users not found` | outputDataProcessor | Meta CSV missing field | Verify Meta CSV has required column |
| `Online store visitors is 0` | Various | Shopify data issue | Check Shopify CSV for visitor data |
| `Cannot access moi-cumulative-data` | configurableDataProcessor | Storage not initialized | Run data processing first |
| `Export shows NaN values` | ExportModal | Data type conversion failed | Check numeric field formats in CSV |

### 📊 Data Structure Examples at Key Stages

#### Stage 1: Raw Shopify Data (localStorage)
```javascript
// Sample structure after CSV loading
{
  "Day": "2024-09-29",
  "Online store visitors": "245", 
  "Utm campaign": "Meta_Campaign_1",
  "Utm term": "Interest_Targeting_1",
  "Sessions with cart additions": "12",
  "Sessions that reached checkout": "8"
}
```

#### Stage 2: Dashboard Data (processed)
```javascript
// Sample structure in moi-dashboard-data
{
  "totalUsers": 1250,
  "campaigns": [
    {
      "name": "Meta_Campaign_1",
      "spend": 2500,
      "users": 450,
      "qualityUsers": 380,
      "performanceTier": "Good"
    }
  ],
  "utmCampaigns": [...], // Similar structure
  "totalSpend": 5000,
  "averageSessionDuration": 180
}
```

#### Stage 3: Export Data (daily breakdown)
```javascript
// Sample structure from getDailyBreakdownData()
{
  "adsetData": [
    {
      "date": "2024-09-29",
      "campaignName": "Meta_Campaign_1", 
      "adSetName": "Interest_Targeting_1",
      "users": 125,
      "spend": 625,
      "qualityUsers": 105
    }
  ]
}
```

### 🔧 Quick Fix Commands

#### Reset All Data
```javascript
// Clear all MOI data and restart
['moi-shopify-data', 'moi-meta-data', 'moi-cumulative-data', 'moi-dashboard-data', 'moi-google-data']
  .forEach(key => localStorage.removeItem(key));
console.log('All MOI data cleared - reload files');
```

#### Force Reprocess Data
```javascript
// Trigger complete reprocessing
const { processAllInputFiles } = await import('./src/utils/integratedDataProcessor');
const { processOutputFiles } = await import('./src/utils/outputDataProcessor');

// Clear processed data
localStorage.removeItem('moi-dashboard-data');
localStorage.removeItem('moi-cumulative-data');

// Reprocess
await processAllInputFiles();
await processOutputFiles();
console.log('Data reprocessed - check dashboard');
```

## Data Compression & Export

### Compression Strategy
- **Problem**: Large Shopify files exceed localStorage limits
- **Solution**: Field-selective compression (integratedDataProcessor.ts:66-89)
- **Keeps only**: Day/Date, UTM fields, visitors, cart additions, checkout, session duration, pageviews
- **Fallback**: If compression fails, saves first 1000 records (lines 84-86)
- **Critical Note**: Uses case-insensitive field mapping for compatibility

### Export File Format
**Naming**: `MOI_{Type}_{DateRange}.csv`
**Examples**: `MOI_Top_Level_Metrics_Sep29-Oct2_2025.csv`

### Meta Spend Lookup
```typescript
// Campaign+AdSet matching for accurate spend data (ExportModal.tsx:329+)
const matchingMetaRows = metaData.filter(row => 
  row['Campaign name'] === campaignName && row['Ad set name'] === adSetName
);
const totalSpend = matchingMetaRows.reduce((sum, row) => 
  sum + (parseFloat(row['Amount spent (INR)']) || 0), 0
);
```

---

*This documentation provides a concise reference for the MOI Analytics Dashboard data flow architecture, debugging, and implementation details.*