# MOI Data Analytics V2 - Project Architecture

## System Overview

MOI Data Analytics V2 is a Next.js web application that processes marketing data from Meta, Google, and Shopify through an AI-powered validation pipeline, stores it in Supabase, and generates comprehensive analytics reports using the Julius V7 methodology.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│  Page 1: Upload & Validation    │  Page 2: Report Generation    │
│  ┌─────────────────────────────┐ │ ┌─────────────────────────────┐ │
│  │ • File Upload Interface     │ │ │ • Date Range Selection     │ │
│  │ • AI Data Correction        │ │ │ • Julius V7 Processing     │ │
│  │ • Upload Success Validation │ │ │ • CSV Report Generation    │ │
│  │ • Interactive Data Preview  │ │ │ • Download Management      │ │
│  └─────────────────────────────┘ │ └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API Layer (Next.js)                      │
├─────────────────────────────────────────────────────────────────┤
│  /api/upload/          │  /api/ai/            │  /api/reports/   │
│  • validate.js         │  • fix-data.js       │  • generate.js   │
│  • process.js          │  • suggest.js        │  • download.js   │
│  • summary.js          │                      │                  │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Processing Layer                            │
├─────────────────────────────────────────────────────────────────┤
│  Data Validation    │  AI Intelligence     │  Analytics Engine   │
│  • CSV Parsing      │  • Claude AI         │  • Julius V7 Logic  │
│  • Schema Validation│  • Date Correction   │  • Attribution       │
│  • Type Conversion  │  • Column Mapping    │  • Business Metrics │
│  • Error Detection  │  • Quality Scoring   │  • Report Generation│
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Data Layer (Supabase)                       │
├─────────────────────────────────────────────────────────────────┤
│  MOI Data Analysis Database                                     │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ meta_import_data│ │google_import_data│ │shopify_import_data│   │
│  │ • Campaign data │ │ • Ad performance│ │ • UTM tracking   │   │
│  │ • Ad set metrics│ │ • Cost metrics  │ │ • Session data   │   │
│  │ • Daily totals  │ │ • Daily totals  │ │ • Conversion data│   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Next.js 14**: React framework with app router
- **React 18**: Component-based UI library
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type-safe JavaScript

### Backend/API
- **Next.js API Routes**: Server-side API endpoints
- **Node.js**: JavaScript runtime
- **PapaParse**: CSV parsing library
- **Supabase Client**: Database ORM and real-time features

### AI Integration
- **Claude AI (Anthropic)**: Data correction and intelligence
- **Current API Token**: Use existing authentication
- **Smart Corrections**: Date formats, column names, data quality

### Database
- **Supabase PostgreSQL**: Existing MOI Data Analysis database
- **Existing Tables**: meta_import_data, google_import_data, shopify_import_data
- **Bulk Upload Strategy**: Similar to upload_real_shopify_data.py methodology

## Data Flow Architecture

### Upload & Validation Flow
```
CSV Files Upload
    ↓
Frontend Validation (Structure, Size)
    ↓
API Processing (/api/upload/validate)
    ↓
AI Data Correction (Claude AI)
    ↓
Database Upload (Bulk Insert)
    ↓
Success Validation & Summary
    ↓
Interactive Data Preview
```

### Report Generation Flow
```
Date Range Selection
    ↓
Data Extraction (Supabase Query)
    ↓
Julius V7 Processing Pipeline
    ↓
Business Logic & Attribution
    ↓
CSV Report Generation
    ↓
File Download & Cleanup
```

## Component Architecture

### Core Components

#### 1. UploadInterface Component
```jsx
<UploadInterface>
  <FileDropZone platform="meta|google|shopify" />
  <ValidationStatus />
  <AICorrections />
  <UploadProgress />
</UploadInterface>
```

#### 2. ValidationSummary Component
```jsx
<ValidationSummary>
  <PlatformSummary platform="meta|google|shopify" />
  <DataQualityScore />
  <CrossPlatformValidation />
  <ActionButtons />
</ValidationSummary>
```

#### 3. DataPreviewTable Component
```jsx
<DataPreviewTable>
  <InteractiveTable data={supabaseData} />
  <ValidationIndicators />
  <SortingFiltering />
  <PaginationControls />
</DataPreviewTable>
```

#### 4. ReportGenerator Component
```jsx
<ReportGenerator>
  <DateRangeSelector />
  <ProcessingProgress />
  <ReportConfiguration />
  <DownloadManager />
</ReportGenerator>
```

## API Architecture

### Upload Endpoints
```javascript
// /api/upload/validate.js
POST /api/upload/validate
- Multi-part file upload
- CSV structure validation
- AI-powered data correction
- Return validation results + corrections

// /api/upload/process.js  
POST /api/upload/process
- Bulk database upload
- Transaction safety
- Row count verification
- Upload success confirmation

// /api/upload/summary.js
GET /api/upload/summary
- Database query validation
- Data preview generation
- Quality scoring
- Cross-platform analysis
```

### AI Intelligence Endpoints
```javascript
// /api/ai/fix-data.js
POST /api/ai/fix-data
- Date format detection/correction
- Column name normalization
- Data quality suggestions
- User approval workflow

// /api/ai/suggest.js
POST /api/ai/suggest
- Smart correction recommendations
- Pattern recognition
- Contextual data fixes
- Quality improvement suggestions
```

### Report Generation Endpoints
```javascript
// /api/reports/generate.js
POST /api/reports/generate
- Date range data extraction
- Julius V7 analytics pipeline
- Performance calculations
- CSV file generation

// /api/reports/download.js
GET /api/reports/download/:reportId
- Secure file serving
- File cleanup management
- Download tracking
- Error handling
```

## Database Integration Strategy

### Existing Supabase Tables

#### meta_import_data
- Campaign performance data
- Ad set and ad level metrics
- Daily spend and engagement data
- CTR, CPM, and conversion metrics

#### google_import_data  
- Google Ads campaign data
- Cost and performance metrics
- Daily aggregations
- Campaign-level attribution

#### shopify_import_data
- UTM tracking data
- Session and conversion metrics
- Customer behavior data
- E-commerce performance

### Bulk Upload Strategy
```javascript
// Similar to upload_real_shopify_data.py approach
const bulkUpload = async (platform, data) => {
  const batchSize = 1000;
  const batches = chunkArray(data, batchSize);
  
  for (const batch of batches) {
    await supabase
      .from(`${platform}_import_data`)
      .upsert(batch, { 
        onConflict: 'day,campaign_name',
        ignoreDuplicates: false 
      });
  }
};
```

## Security & Performance

### Security Considerations
- **No Authentication**: Development phase requirement
- **Input Validation**: Sanitize all CSV inputs
- **SQL Injection Prevention**: Parameterized queries only
- **File Upload Limits**: Reasonable size constraints
- **Error Handling**: No sensitive data exposure

### Performance Optimization
- **Streaming Upload**: Handle large files efficiently
- **Batch Processing**: Process data in chunks
- **Database Indexing**: Optimize query performance
- **Caching Strategy**: Cache processed results
- **Memory Management**: Efficient data structures

## Error Handling Strategy

### Validation Layers
1. **Frontend Validation**: File type, size, basic structure
2. **API Validation**: Schema compliance, data types
3. **AI Validation**: Smart corrections and suggestions
4. **Database Validation**: Constraint compliance
5. **Post-Upload Validation**: Success verification

### Recovery Mechanisms
- **Transaction Rollback**: Database-level consistency
- **Partial Upload Recovery**: Resume interrupted uploads
- **Data Backup**: Automatic backup before processing
- **Error Logging**: Comprehensive error tracking
- **User Feedback**: Clear error messages and solutions

## Scalability Considerations

### Current Phase (Development)
- Single-user interface
- Local file processing
- Direct database connections
- Synchronous processing

### Future Enhancements
- **Multi-user Support**: User authentication and isolation
- **Queue System**: Asynchronous processing for large files
- **Caching Layer**: Redis for improved performance
- **Load Balancing**: Multiple server instances
- **CDN Integration**: Fast file serving

---
*Architecture Version: 1.0*  
*Last Updated: November 11, 2025*  
*Next Review: After Phase 1 Implementation*