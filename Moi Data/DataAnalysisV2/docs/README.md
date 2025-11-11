# MOI Data Analytics V2 - Next.js Implementation

## Project Overview

MOI Data Analytics V2 is a comprehensive web-based analytics platform that allows users to upload CSV files from Meta, Google, and Shopify, validate and process the data through AI-powered correction, and generate detailed marketing analytics reports.

## Key Features

- **Smart File Upload**: Upload and validate Meta, Google, and Shopify CSV files
- **AI-Powered Data Correction**: Automatic detection and correction of date formats, column names, and data inconsistencies
- **Comprehensive Validation**: Upload success confirmation with interactive data preview tables
- **Report Generation**: Julius V7 analytics pipeline for generating top-level, ad set, and ad-level performance reports
- **Supabase Integration**: Direct integration with existing MOI Data Analysis database
- **Error Management**: Robust error handling with user feedback and recovery options

## Project Structure

```
DataAnalysisV2/
├── docs/                           # Project documentation
│   ├── README.md                   # This file
│   ├── project-architecture.md     # System architecture
│   ├── phase-1-upload-validation.md # Phase 1 implementation
│   ├── phase-2-ai-intelligence.md  # Phase 2 AI corrections
│   ├── phase-3-report-generation.md # Phase 3 report generation
│   ├── supabase-integration.md     # Database integration
│   ├── backup-recovery.md          # Backup & recovery
│   └── testing-strategy.md         # Testing approach
├── pages/                          # Next.js pages
│   ├── index.js                   # Landing page
│   ├── upload.js                  # Page 1: Upload & validation
│   ├── reports.js                 # Page 2: Report generation
│   └── api/                       # API endpoints
├── components/                     # React components
├── lib/                           # Utility libraries
└── styles/                        # CSS styling
```

## Technology Stack

- **Frontend**: Next.js 14 with React 18
- **Styling**: Tailwind CSS
- **Database**: Supabase (existing MOI Data Analysis)
- **AI**: Claude AI for data correction
- **File Processing**: PapaParse for CSV handling
- **Deployment**: Vercel (future)

## Quick Start

1. **Initialize Project**:
   ```bash
   cd "/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/DataAnalysisV2"
   npx create-next-app@latest . --typescript --tailwind --eslint
   npm install @supabase/supabase-js @anthropic-ai/sdk papaparse
   ```

2. **Environment Setup**:
   ```bash
   cp .env.example .env.local
   # Add Supabase and Claude API credentials
   ```

3. **Development**:
   ```bash
   npm run dev
   ```

## Implementation Phases

### Phase 1: Upload & Validation (Week 1)
- File upload interface with drag & drop
- CSV parsing and validation
- Upload success confirmation
- Interactive data preview tables

### Phase 2: AI Intelligence (Week 2) 
- Date format detection and correction
- Column name normalization
- Data quality assessment
- AI-powered correction suggestions

### Phase 3: Report Generation (Week 3)
- Julius V7 analytics pipeline porting
- Report generation interface
- CSV output generation
- Performance optimization

## Data Flow

```
CSV Files (Meta/Google/Shopify) 
    ↓
AI-Powered Validation & Correction
    ↓
Supabase Database Upload
    ↓ 
Success Validation & Preview
    ↓
Julius V7 Analytics Processing
    ↓
Three Output CSV Reports
```

## Key Documentation Files

- **[Project Architecture](project-architecture.md)** - Technical design and system overview
- **[Phase 1 Plan](phase-1-upload-validation.md)** - Upload and validation implementation
- **[Phase 2 Plan](phase-2-ai-intelligence.md)** - AI-powered data correction
- **[Phase 3 Plan](phase-3-report-generation.md)** - Report generation and analytics
- **[Supabase Integration](supabase-integration.md)** - Database integration strategy
- **[Backup & Recovery](backup-recovery.md)** - Data protection best practices
- **[Testing Strategy](testing-strategy.md)** - Comprehensive testing approach

## Success Criteria

- ✅ Upload 3 CSV files with AI-powered validation
- ✅ 95%+ data quality score post-correction  
- ✅ Interactive preview of uploaded database content
- ✅ Generate 3 CSV reports matching Julius V7 specifications
- ✅ Handle large files (10K+ rows) efficiently
- ✅ Robust error handling and recovery

## Getting Started

1. Read [Project Architecture](project-architecture.md) for system overview
2. Follow [Phase 1 Plan](phase-1-upload-validation.md) for initial implementation
3. Implement phases sequentially with testing at each stage
4. Refer to specific documentation files for detailed implementation guidance

---
*Last Updated: November 11, 2025*  
*Project Lead: Shivang Patel*