# MOI Analytics - Raw Data Upload to Supabase V7

## Objective
Validate input marketing data files (Meta, Google, Shopify) and upload them to Supabase for persistent storage. This prompt focuses ONLY on validating and uploading raw data - data processing and analytics will be handled separately.

## Data Inputs (Present on Disk)

### Meta Advertising Data
- **Files**: `Meta_Ads_day-month.csv` … `Meta_Ads_day-month.csv`
- **Data Date Range**: The range will vary so you will have to open up the file, check the range. It could be for a day or for the whole year or combination.  
- **Columns**: 
  - Reporting starts
  - Campaign name
  - Ad set name
  - Ad name
  - Amount spent (INR)
  - CTR (link click-through rate)
  - CPM (cost per 1,000 impressions)

### Google Advertising Data
- **Files**: `Google_day-month.csv` … `Google_day-month.csv`
- **Data Date Range**: The range will vary so you will have to open up the file, check the range. It could be for a day or for the whole year or combination.
- **Columns**:
  - Day
  - Campaign
  - Cost

### Shopify Analytics Data
- **Files**: `Shopify_day-month.csv` … `Shopify_day-month.csv`
- **Data Date Range**: The range will vary so you will have to open up the file, check the range. It could be for a day or for the whole year or combination.
- **Columns**:
  - Hour or Day
  - Online store visitors
  - Sessions that completed checkout
  - Pageviews
  - Average session duration
  - UTM campaign
  - UTM term
  - UTM content

## Processing Steps

### Step 1: Pre-Processing Validation

**1.1 File Discovery and Opening**

Action items:
- Identify and load all Meta, Google, and Shopify CSV files from disk
- Record file names and sizes for validation log
- Check that all files are readable and not corrupted
- Attempt to open each file and parse as CSV

**Validation checks:**
- ✓ All expected CSV files are present
- ✓ File sizes > 0 bytes
- ✓ Files are readable (not corrupted or locked)
- ✓ CSV parsing succeeds without errors

**STOP Condition**: If any file cannot be opened or read:
- Report which file(s) failed to open
- Display specific error message (permission denied, file not found, corrupted, etc.)
- List all files that were successfully opened
- STOP processing - do not proceed to Step 1.2

**1.2 Schema Validation**

For each file, verify that the columns in the CSV match the expected columns exactly.

**Meta Files** - Required columns (must match exactly):
- Reporting starts
- Campaign name
- Ad set name
- Ad name
- Amount spent (INR)
- CTR (link click-through rate)
- CPM (cost per 1,000 impressions)

**Google Files** - Required columns (must match exactly):
- Day
- Campaign
- Cost

**Shopify Files** - Required columns (must match exactly):
- Hour or Day
- Online store visitors
- Sessions that completed checkout
- Pageviews
- Average session duration
- UTM campaign
- UTM term
- UTM content

**Validation checks:**
- ✓ All required columns are present in each file
- ✓ Column names match exactly (case-sensitive)
- ✓ No required columns are missing
- ✓ Column order doesn't matter, but all must exist

**STOP Condition**: If any file has schema issues:
- Report file name with issues
- List expected columns
- List actual columns found in the file
- Highlight missing columns (expected but not found)
- Highlight extra/unexpected columns (found but not expected)
- STOP processing - do not proceed to Step 1.3

**Example error report:**
```
SCHEMA VALIDATION FAILED

File: Meta_Ads_01-10.csv
Expected columns:
  - Reporting starts
  - Campaign name
  - Ad set name
  - Ad name
  - Amount spent (INR)
  - CTR (link click-through rate)
  - CPM (cost per 1,000 impressions)

Actual columns found:
  - Date
  - Campaign name
  - Ad set name
  - Ad name
  - Amount spent (INR)
  - CTR (link click-through rate)

Missing columns:
  - Reporting starts
  - CPM (cost per 1,000 impressions)

Extra columns:
  - Date
```

**1.3 Date Range Detection**

For each file, extract and analyze the date information:

**For Meta files:**
- Parse the "Reporting starts" column
- Identify the earliest date in the file
- Identify the latest date in the file
- Calculate total number of days covered
- Note whether file contains: single day, multiple days, or full year

**For Google files:**
- Parse the "Day" column
- Identify the earliest date in the file
- Identify the latest date in the file
- Calculate total number of days covered
- Note whether file contains: single day, multiple days, or full year

**For Shopify files:**
- Parse the "Hour or Day" column
- Extract date portion (ignore time if hourly data)
- Identify the earliest date in the file
- Identify the latest date in the file
- Calculate total number of days covered
- Note whether file contains: single day, multiple days, or full year

**Validation checks:**
- ✓ Date columns can be parsed successfully
- ✓ Date format is consistent within each file
- ✓ Earliest and latest dates are identified
- ✓ No dates are in the future (beyond today's date)
- ✓ Date range makes logical sense (start <= end)

**STOP Condition**: If date range cannot be determined:
- Report file name with date issues
- Indicate which rows have unparseable dates
- Show examples of problematic date values
- List date format expected vs. found
- Count total rows with missing/invalid dates
- STOP processing - do not proceed to Step 1.4

**Example date range report:**
```
DATE RANGE DETECTION

File: Meta_Ads_01-10.csv
  - Earliest date: 2025-01-01
  - Latest date: 2025-10-31
  - Days covered: 304 days
  - Type: Multiple months

File: Google_01-10.csv
  - Earliest date: 2025-01-01
  - Latest date: 2025-10-31
  - Days covered: 304 days
  - Type: Multiple months

File: Shopify_01-10.csv
  - Earliest date: 2025-01-01
  - Latest date: 2025-10-31
  - Days covered: 304 days
  - Type: Multiple months (hourly data)
```

**1.4 Date Range Coverage Check**

Compare date ranges across all three data sources to identify coverage and gaps:

**Cross-platform comparison:**
- Identify the overall earliest date across all sources
- Identify the overall latest date across all sources
- Compare Meta, Google, and Shopify date ranges
- Flag any non-overlapping periods
- Identify gaps within each source's date range

**Validation checks:**
- ✓ All three sources have overlapping date ranges
- ✓ No unexpected gaps in daily data within each file
- ✓ Date coverage is consistent across platforms
- ✓ Any gaps or mismatches are documented

**Coverage analysis example:**
```
DATE RANGE COVERAGE ANALYSIS

Overall coverage: 2025-01-01 to 2025-10-31 (304 days)

Meta coverage:    2025-01-01 to 2025-10-31 (304 days) ✓
Google coverage:  2025-01-01 to 2025-10-31 (304 days) ✓
Shopify coverage: 2025-01-01 to 2025-10-31 (304 days) ✓

Overlapping period: 2025-01-01 to 2025-10-31 (304 days)

Gaps detected: None ✓

Non-overlapping periods: None ✓
```

**Warning conditions** (do not stop, but flag):
- Significant gaps in date coverage (>7 days missing)
- Non-overlapping date ranges between sources
- One source has much shorter date range than others

**1.5 File Integrity Summary**

Generate a comprehensive summary of all validation checks:

```
════════════════════════════════════════════════
PRE-PROCESSING VALIDATION SUMMARY
════════════════════════════════════════════════

File Discovery:
✓ All required CSV files found
✓ All files readable and not corrupted
  - Meta files: X files found
  - Google files: Y files found
  - Shopify files: Z files found

Schema Validation:
✓ All required columns present in all files
✓ Column names match expected schema
✓ No schema mismatches detected

Date Range Detection:
✓ Date ranges successfully extracted from all files
✓ Date formats consistent
✓ No invalid or future dates
  - Meta date range: [earliest] to [latest] (X days)
  - Google date range: [earliest] to [latest] (Y days)
  - Shopify date range: [earliest] to [latest] (Z days)

Date Coverage:
✓ Date ranges overlap appropriately
✓ No significant gaps in daily data
✓ Coverage consistent across platforms

Status: ✓ VALIDATION PASSED
Ready to proceed to Supabase Upload (Step 2)
════════════════════════════════════════════════
```

**Output**: Validation checkpoint report confirming all checks passed before proceeding to Step 2

---

### Step 2: Supabase Raw Data Upload

**Overview**: Upload validated raw input files (Meta, Google, Shopify) to Supabase after Step 1 validation passes. Automatically detects if this is first-time setup and creates tables if needed. Each source gets its own table with duplicate detection and user confirmation before writing.

**2.1 Supabase Connection Establishment**
- Attempt to establish connection to Supabase
- Test connection with a simple query (e.g., check if we can query information_schema)

**Validation checks:**
- ✓ Supabase URL is properly formatted
- ✓ API key is provided and not empty
- ✓ Connection can be established
- ✓ Authentication succeeds
- ✓ Basic queries work

**STOP Condition**: If connection fails:
- Report specific connection error:
  - **Connection timeout**: Check network connectivity, firewall settings
  - **Authentication failure**: Verify API key is correct and has proper permissions
  - **Invalid URL**: Confirm Supabase project URL format
  - **Network error**: Check internet connection
- Display full error message from Supabase client
- Provide troubleshooting steps
- STOP processing until connection is resolved

**Example connection error:**
```
CONNECTION FAILED

Error Type: Authentication Error
Error Message: Invalid API key or insufficient permissions

Troubleshooting:
1. Verify your API key is correct
2. Check that the key has the following permissions:
   - SELECT (to check for existing tables)
   - INSERT (to upload data)
   - CREATE TABLE (for first-time setup)
   - DELETE (for overwrite operations)
3. Try using your service_role key instead of anon key

Please fix the connection issue and retry.
```

**2.2 First-Time Setup Detection**

Action items:
- Query Supabase to check if required tables exist
- Determine if this is a first-time setup or existing database

**Detection query:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('meta_raw_data', 'google_raw_data', 'shopify_raw_data');
```

**Report findings:**
```
════════════════════════════════════════════════
SUPABASE DATABASE STATUS CHECK
════════════════════════════════════════════════

Checking for existing tables...

✓ meta_raw_data: [EXISTS / NOT FOUND]
✓ google_raw_data: [EXISTS / NOT FOUND]
✓ shopify_raw_data: [EXISTS / NOT FOUND]

Database Status: [FIRST-TIME SETUP / EXISTING DATABASE]

[If FIRST-TIME SETUP:]
This is a new database. Tables will be created automatically.

[If EXISTING DATABASE:]
Tables found. Existing data summary:
- meta_raw_data: X records (date range: [start] to [end])
- google_raw_data: Y records (date range: [start] to [end])
- shopify_raw_data: Z records (date range: [start] to [end])

════════════════════════════════════════════════
```

**Validation checks:**
- ✓ Successfully queries information_schema
- ✓ Can identify which tables exist/don't exist
- ✓ Can query record counts for existing tables
- ✓ Can determine date ranges for existing data

**2.3 Table Creation (First-Time Setup Only)**

**When to execute**: Only if any of the three tables don't exist in Supabase

Action items:
- Create missing tables with proper schema
- Add indexes for performance
- Add UNIQUE constraints to prevent duplicates
- Verify tables were created successfully

**Create meta_raw_data table:**
```sql
CREATE TABLE IF NOT EXISTS meta_raw_data (
    id BIGSERIAL PRIMARY KEY,
    reporting_starts DATE NOT NULL,
    campaign_name TEXT NOT NULL,
    ad_set_name TEXT NOT NULL,
    ad_name TEXT NOT NULL,
    amount_spent_inr NUMERIC(12, 2),
    ctr_link_click_through_rate NUMERIC(8, 4),
    cpm_cost_per_1000_impressions NUMERIC(10, 2),
    upload_date TIMESTAMPTZ DEFAULT NOW(),
    date_range_start DATE,
    date_range_end DATE,
    source_file_name TEXT,
    UNIQUE(reporting_starts, campaign_name, ad_set_name, ad_name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_meta_reporting_starts ON meta_raw_data(reporting_starts);
CREATE INDEX IF NOT EXISTS idx_meta_campaign ON meta_raw_data(campaign_name);
CREATE INDEX IF NOT EXISTS idx_meta_date_range ON meta_raw_data(date_range_start, date_range_end);
CREATE INDEX IF NOT EXISTS idx_meta_upload_date ON meta_raw_data(upload_date);
```

**Column explanations for meta_raw_data:**
- `id`: Auto-incrementing primary key
- `reporting_starts`: The date from the original CSV
- `campaign_name`, `ad_set_name`, `ad_name`: Campaign hierarchy from Meta
- `amount_spent_inr`, `ctr_link_click_through_rate`, `cpm_cost_per_1000_impressions`: Performance metrics
- `upload_date`: Timestamp when this record was uploaded (auto-set)
- `date_range_start`, `date_range_end`: Date range covered by the source file (for tracking)
- `source_file_name`: Name of the CSV file this data came from (for traceability)
- **UNIQUE constraint**: Prevents duplicate records based on date + campaign + ad set + ad name

**Create google_raw_data table:**
```sql
CREATE TABLE IF NOT EXISTS google_raw_data (
    id BIGSERIAL PRIMARY KEY,
    day DATE NOT NULL,
    campaign TEXT NOT NULL,
    cost NUMERIC(12, 2),
    upload_date TIMESTAMPTZ DEFAULT NOW(),
    date_range_start DATE,
    date_range_end DATE,
    source_file_name TEXT,
    UNIQUE(day, campaign)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_google_day ON google_raw_data(day);
CREATE INDEX IF NOT EXISTS idx_google_campaign ON google_raw_data(campaign);
CREATE INDEX IF NOT EXISTS idx_google_date_range ON google_raw_data(date_range_start, date_range_end);
CREATE INDEX IF NOT EXISTS idx_google_upload_date ON google_raw_data(upload_date);
```

**Column explanations for google_raw_data:**
- `id`: Auto-incrementing primary key
- `day`: The date from the original CSV
- `campaign`: Campaign name from Google
- `cost`: Advertising cost
- `upload_date`: Timestamp when this record was uploaded (auto-set)
- `date_range_start`, `date_range_end`: Date range covered by the source file
- `source_file_name`: Name of the CSV file this data came from
- **UNIQUE constraint**: Prevents duplicate records based on day + campaign

**Create shopify_raw_data table:**
```sql
CREATE TABLE IF NOT EXISTS shopify_raw_data (
    id BIGSERIAL PRIMARY KEY,
    hour_or_day TIMESTAMPTZ,
    day DATE NOT NULL,
    online_store_visitors INTEGER,
    sessions_completed_checkout INTEGER,
    pageviews INTEGER,
    average_session_duration NUMERIC(10, 2),
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    upload_date TIMESTAMPTZ DEFAULT NOW(),
    date_range_start DATE,
    date_range_end DATE,
    source_file_name TEXT,
    UNIQUE(day, utm_campaign, utm_term, utm_content)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shopify_day ON shopify_raw_data(day);
CREATE INDEX IF NOT EXISTS idx_shopify_utm_campaign ON shopify_raw_data(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_shopify_date_range ON shopify_raw_data(date_range_start, date_range_end);
CREATE INDEX IF NOT EXISTS idx_shopify_upload_date ON shopify_raw_data(upload_date);
```

**Column explanations for shopify_raw_data:**
- `id`: Auto-incrementing primary key
- `hour_or_day`: Original timestamp/date from CSV (keeps hourly granularity if present)
- `day`: Date extracted from hour_or_day (for easier querying and duplicate detection)
- `online_store_visitors`, `sessions_completed_checkout`, `pageviews`: Traffic metrics
- `average_session_duration`: Session engagement metric
- `utm_campaign`, `utm_term`, `utm_content`: UTM tracking parameters (can be NULL)
- `upload_date`: Timestamp when this record was uploaded (auto-set)
- `date_range_start`, `date_range_end`: Date range covered by the source file
- `source_file_name`: Name of the CSV file this data came from
- **UNIQUE constraint**: Prevents duplicate records based on day + UTM parameters

**Validation checks:**
- ✓ CREATE TABLE statements execute successfully
- ✓ All required columns created with correct data types
- ✓ UNIQUE constraints applied correctly
- ✓ All indexes created successfully (4 indexes per table)
- ✓ Default values work (upload_date auto-sets to NOW())
- ✓ Tables verified to exist after creation
- ✓ Can insert and query test records

**Table Creation Report:**
```
════════════════════════════════════════════════
TABLE CREATION REPORT
════════════════════════════════════════════════

meta_raw_data:
✓ Table created successfully
✓ Columns: 12 (id, reporting_starts, campaign_name, ad_set_name, ad_name, 
             amount_spent_inr, ctr_link_click_through_rate, 
             cpm_cost_per_1000_impressions, upload_date, date_range_start, 
             date_range_end, source_file_name)
✓ Indexes created: 4 indexes
✓ UNIQUE constraint: (reporting_starts, campaign_name, ad_set_name, ad_name)

google_raw_data:
✓ Table created successfully
✓ Columns: 7 (id, day, campaign, cost, upload_date, date_range_start, 
             date_range_end, source_file_name)
✓ Indexes created: 4 indexes
✓ UNIQUE constraint: (day, campaign)

shopify_raw_data:
✓ Table created successfully
✓ Columns: 13 (id, hour_or_day, day, online_store_visitors, 
              sessions_completed_checkout, pageviews, 
              average_session_duration, utm_campaign, utm_term, utm_content,
              upload_date, date_range_start, date_range_end, source_file_name)
✓ Indexes created: 4 indexes
✓ UNIQUE constraint: (day, utm_campaign, utm_term, utm_content)

Status: ✓ FIRST-TIME SETUP COMPLETE

Ready to upload data...
════════════════════════════════════════════════
```

**ERROR Handling During Table Creation:**

**Permission errors:**
- Error: "permission denied to create table"
- Solution: Use a service_role key instead of anon key, or grant CREATE TABLE permission
- STOP processing

**SQL syntax errors:**
- Error: SQL syntax issues
- Solution: This shouldn't happen with hardcoded SQL, but log exact error
- STOP processing

**Constraint errors:**
- Error: Cannot create UNIQUE constraint
- Solution: Check if table already exists with conflicting data
- STOP processing

**2.4 Existing Database Detection**

**When to execute**: Only if all three tables already exist in Supabase

Action items:
- Query each table to get current state
- Count existing records
- Determine date ranges of existing data
- Report existing data summary

**Queries for existing data:**
```sql
-- Count records
SELECT COUNT(*) FROM meta_raw_data;
SELECT COUNT(*) FROM google_raw_data;
SELECT COUNT(*) FROM shopify_raw_data;

-- Get date ranges
SELECT 
    MIN(date_range_start) as earliest_date,
    MAX(date_range_end) as latest_date
FROM meta_raw_data;
```

**Existing Database Report:**
```
════════════════════════════════════════════════
EXISTING DATABASE DETECTED
════════════════════════════════════════════════

All required tables found in Supabase:
✓ meta_raw_data
✓ google_raw_data
✓ shopify_raw_data

Existing Data Summary:

meta_raw_data:
- Total records: 15,234
- Date range: 2025-01-01 to 2025-09-30
- Days covered: 273 days
- Last upload: 2025-10-15 14:30:00 UTC

google_raw_data:
- Total records: 8,456
- Date range: 2025-01-01 to 2025-09-30
- Days covered: 273 days
- Last upload: 2025-10-15 14:30:00 UTC

shopify_raw_data:
- Total records: 45,678
- Date range: 2025-01-01 to 2025-09-30
- Days covered: 273 days (hourly granularity)
- Last upload: 2025-10-15 14:30:00 UTC

Mode: APPEND with duplicate detection
Proceeding to file upload...
════════════════════════════════════════════════
```

**Validation checks:**
- ✓ All tables exist and are accessible
- ✓ Tables have expected schema
- ✓ Can query record counts
- ✓ Can determine date ranges
- ✓ Upload history is tracked

**2.5 Schema Validation (Existing Tables Only)**

**When to execute**: Only if tables already exist (skip for first-time setup)

Action items:
- Verify existing table schemas match expected structure
- Check column names and data types
- Identify any schema mismatches

**Schema validation query:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'meta_raw_data' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

**Expected schema for meta_raw_data:**
- id (bigint, not null)
- reporting_starts (date, not null)
- campaign_name (text, not null)
- ad_set_name (text, not null)
- ad_name (text, not null)
- amount_spent_inr (numeric)
- ctr_link_click_through_rate (numeric)
- cpm_cost_per_1000_impressions (numeric)
- upload_date (timestamp with time zone)
- date_range_start (date)
- date_range_end (date)
- source_file_name (text)

**Expected schema for google_raw_data:**
- id (bigint, not null)
- day (date, not null)
- campaign (text, not null)
- cost (numeric)
- upload_date (timestamp with time zone)
- date_range_start (date)
- date_range_end (date)
- source_file_name (text)

**Expected schema for shopify_raw_data:**
- id (bigint, not null)
- hour_or_day (timestamp with time zone)
- day (date, not null)
- online_store_visitors (integer)
- sessions_completed_checkout (integer)
- pageviews (integer)
- average_session_duration (numeric)
- utm_campaign (text)
- utm_term (text)
- utm_content (text)
- upload_date (timestamp with time zone)
- date_range_start (date)
- date_range_end (date)
- source_file_name (text)

**Validation checks:**
- ✓ All expected columns are present
- ✓ Column data types match expectations
- ✓ NOT NULL constraints are correct
- ✓ No critical columns are missing

**FLAG Condition**: If schema mismatches detected:
- Report table name with issues
- List expected columns vs. actual columns
- Highlight data type mismatches
- Show missing columns
- Show unexpected extra columns

**Options when schema mismatch found:**
1. **ALTER TABLE** - Add missing columns automatically (if non-critical)
2. **CANCEL** - Stop and fix schema manually
3. **CONTINUE** - Proceed if differences are non-critical (extra columns OK)

**Example schema mismatch report:**
```
⚠️  SCHEMA MISMATCH DETECTED

Table: meta_raw_data

Expected columns not found:
- source_file_name (text)

Extra columns found (not expected):
- uploaded_by (text)

Data type mismatches:
- amount_spent_inr: expected NUMERIC(12,2), found NUMERIC(10,2)

Action required:
1. ALTER TABLE to add missing columns
2. CANCEL and fix manually
3. CONTINUE (if acceptable)

Your choice (1/2/3):
```

**2.6 File-by-File Upload Processing**

**Overview**: Process each validated file individually for accurate duplicate detection and error isolation.

**For each Meta file:**

1. **Load and prepare data:**
   - Load CSV into DataFrame
   - Rename columns to match Supabase schema:
     - "Reporting starts" → reporting_starts
     - "Campaign name" → campaign_name
     - "Ad set name" → ad_set_name
     - "Ad name" → ad_name
     - "Amount spent (INR)" → amount_spent_inr
     - "CTR (link click-through rate)" → ctr_link_click_through_rate
     - "CPM (cost per 1,000 impressions)" → cpm_cost_per_1000_impressions

2. **Add metadata columns:**
   - source_file_name = current filename
   - date_range_start = MIN(reporting_starts) from this file
   - date_range_end = MAX(reporting_starts) from this file
   - upload_date = current timestamp (will be auto-set by database)

3. **Data type conversions:**
   - Convert reporting_starts to date format
   - Convert amount_spent_inr to numeric (handle any formatting issues)
   - Convert CTR and CPM to numeric
   - Handle any NULL or empty values appropriately

4. **Proceed to duplicate detection** (Section 2.7)

**For each Google file:**

1. **Load and prepare data:**
   - Load CSV into DataFrame
   - Rename columns to match Supabase schema:
     - "Day" → day
     - "Campaign" → campaign
     - "Cost" → cost

2. **Add metadata columns:**
   - source_file_name = current filename
   - date_range_start = MIN(day) from this file
   - date_range_end = MAX(day) from this file
   - upload_date = current timestamp (will be auto-set by database)

3. **Data type conversions:**
   - Convert day to date format
   - Convert cost to numeric
   - Handle any NULL or empty values

4. **Proceed to duplicate detection** (Section 2.7)

**For each Shopify file:**

1. **Load and prepare data:**
   - Load CSV into DataFrame
   - Rename columns to match Supabase schema:
     - "Hour or Day" → hour_or_day
     - "Online store visitors" → online_store_visitors
     - "Sessions that completed checkout" → sessions_completed_checkout
     - "Pageviews" → pageviews
     - "Average session duration" → average_session_duration
     - "UTM campaign" → utm_campaign
     - "UTM term" → utm_term
     - "UTM content" → utm_content

2. **Derive day column:**
   - If hour_or_day contains time information (hourly data), extract just the date
   - If hour_or_day is already just a date, use as-is
   - Store both hour_or_day (original) and day (date only) columns

3. **Add metadata columns:**
   - source_file_name = current filename
   - date_range_start = MIN(day) from this file
   - date_range_end = MAX(day) from this file
   - upload_date = current timestamp (will be auto-set by database)

4. **Data type conversions:**
   - Convert hour_or_day to timestamp
   - Convert day to date
   - Convert numeric columns to integers/numeric
   - Handle NULL UTM parameters (keep as NULL, don't convert to empty string)

5. **Proceed to duplicate detection** (Section 2.7)

**Validation checks for all files:**
- ✓ Column renaming successful
- ✓ Data types converted correctly
- ✓ No data lost during transformation
- ✓ Metadata columns populated
- ✓ Date range extraction accurate

**2.7 Duplicate Detection**

**When to skip**: If this is a first-time setup (tables just created and empty), skip duplicate detection and proceed directly to upload (Section 2.9) with auto-upload mode.

**When to execute**: Only for existing databases with data already present.

**For Meta Raw Data:**

**Duplicate detection key:** (reporting_starts + campaign_name + ad_set_name + ad_name)

Action items:
1. Extract all unique combinations of (reporting_starts, campaign_name, ad_set_name, ad_name) from the new file
2. Query Supabase to find which combinations already exist
3. Count how many records are duplicates
4. Identify sample duplicate records

**Detection query:**
```sql
SELECT reporting_starts, campaign_name, ad_set_name, ad_name
FROM meta_raw_data
WHERE (reporting_starts, campaign_name, ad_set_name, ad_name) IN (
    ('2025-01-01', 'Summer Sale', 'Ad Set 1', 'Ad Creative A'),
    ('2025-01-02', 'Summer Sale', 'Ad Set 1', 'Ad Creative A'),
    -- ... all combinations from new file
);
```

**For Google Raw Data:**

**Duplicate detection key:** (day + campaign)

Action items:
1. Extract all unique combinations of (day, campaign) from the new file
2. Query Supabase to find which combinations already exist
3. Count how many records are duplicates
4. Identify sample duplicate records

**Detection query:**
```sql
SELECT day, campaign
FROM google_raw_data
WHERE (day, campaign) IN (
    ('2025-01-01', 'Summer Sale'),
    ('2025-01-02', 'Summer Sale'),
    -- ... all combinations from new file
);
```

**For Shopify Raw Data:**

**Duplicate detection key:** (day + utm_campaign + utm_term + utm_content)

**Special handling for NULLs:** Since UTM parameters can be NULL, we need to handle NULL = NULL comparisons properly using COALESCE.

Action items:
1. Extract all unique combinations of (day, utm_campaign, utm_term, utm_content) from the new file
2. Query Supabase to find which combinations already exist
3. Handle NULL UTM parameters appropriately (NULL values should match NULL values)
4. Count how many records are duplicates
5. Identify sample duplicate records

**Detection query (with NULL handling):**
```sql
SELECT day, utm_campaign, utm_term, utm_content
FROM shopify_raw_data
WHERE (day, COALESCE(utm_campaign, ''), COALESCE(utm_term, ''), COALESCE(utm_content, '')) IN (
    ('2025-01-01', '', '', ''),  -- represents NULLs
    ('2025-01-02', 'summer_sale', 'facebook', 'video_ad'),
    -- ... all combinations from new file with NULL handling
);
```

**Duplicate Analysis Report (per file):**
```
════════════════════════════════════════════════
DUPLICATE DETECTION REPORT
════════════════════════════════════════════════

Source: [META / GOOGLE / SHOPIFY]
File: [filename]
Date Range: [start_date] to [end_date]

Database Status: [FIRST-TIME SETUP / EXISTING DATA]

Records in current file: X
Existing records in Supabase (total): Y
Duplicate records found: Z (W% of file)

[If Z > 0 (duplicates found):]

Duplicate Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Date range overlap:
- Existing data in Supabase: [earliest] to [latest]
- New file data: [start] to [end]
- Overlapping period: [overlap_start] to [overlap_end]

Overlapping campaigns:
- Campaign 1: X duplicate records
- Campaign 2: Y duplicate records
- Campaign 3: Z duplicate records
[show top 5]

Sample duplicate keys (first 5):
1. 2025-01-01 | Summer Sale | Ad Set 1 | Creative A
2. 2025-01-01 | Summer Sale | Ad Set 1 | Creative B
3. 2025-01-02 | Summer Sale | Ad Set 1 | Creative A
4. 2025-01-02 | Winter Promo | Ad Set 2 | Creative X
5. 2025-01-03 | Summer Sale | Ad Set 1 | Creative A

Statistics:
- Unique days with duplicates: X days
- Unique campaigns with duplicates: Y campaigns
- Duplicate percentage: Z%

[If Z = 0 (no duplicates) and existing database:]

✓ No duplicates found!
All X records in this file are new.
No overlap with existing data in Supabase.

[If first-time setup:]

✓ First-time upload - no existing data to check against
Proceeding with initial data load...

════════════════════════════════════════════════
```

**Validation checks:**
- ✓ Duplicate detection query executes successfully
- ✓ Duplicate count is accurate
- ✓ Sample duplicates are representative
- ✓ NULL handling works correctly (for Shopify UTMs)
- ✓ Date range overlaps are identified correctly
- ✓ Performance is acceptable (queries complete in reasonable time)

**2.8 User Confirmation Prompt**

Based on duplicate detection results, prompt user appropriately:

**Scenario 1: First-Time Setup (empty tables)**

No user prompt needed - proceed automatically.

```
✓ FIRST-TIME SETUP DETECTED

Source: [META / GOOGLE / SHOPIFY]
File: [filename]
Records to upload: X
Date range: [start] to [end]

This is the initial data load - no existing data to check.
Proceeding with upload automatically...
```

**Scenario 2: Existing Database with NO Duplicates**

No user prompt needed - proceed automatically with append.

```
✓ NO DUPLICATES DETECTED

Source: [META / GOOGLE / SHOPIFY]
File: [filename]
Records to upload: X
Date range: [start] to [end]

All records are new - no overlap with existing data.
Proceeding with APPEND automatically...
```

**Scenario 3: Existing Database with Duplicates Found**

Prompt user for decision - MUST get user input before proceeding.

```
⚠️  DUPLICATES DETECTED ⚠️

Source: [META / GOOGLE / SHOPIFY]
File: [filename]

Summary:
- Total records in file: X
- New records (no duplicates): Y
- Duplicate records: Z (W% of file)

Date range overlap:
- Existing data: [existing_start] to [existing_end]
- New file data: [file_start] to [file_end]
- Overlapping period: [overlap_start] to [overlap_end] (N days)

What would you like to do?

OPTIONS:
────────────────────────────────────────────────
1. SKIP
   - Do not upload this file
   - Keep existing data only
   - Use this if: File is already uploaded

2. APPEND
   - Upload all records including duplicates
   - Creates duplicate entries in Supabase
   - Use this if: You want to keep both old and new versions
   - ⚠️  Warning: This will create duplicates in your database

3. OVERWRITE
   - Delete existing duplicate records first
   - Then upload new records
   - Use this if: New data is more accurate/complete
   - ⚠️  Warning: This permanently deletes Z existing records

4. CANCEL
   - Stop entire upload process
   - No changes made to database
   - Use this if: You need to review data manually

────────────────────────────────────────────────
Your choice (1/2/3/4): 
```

**User input validation:**
- Only accept: 1, 2, 3, or 4
- Re-prompt if invalid input
- Confirm destructive actions (OVERWRITE)

**Confirmation for OVERWRITE option:**
```
⚠️  OVERWRITE CONFIRMATION ⚠️

You are about to DELETE Z existing records and replace them with new data.
This action cannot be undone.

Existing records to be deleted:
- Date range: [start] to [end]
- Campaigns affected: [list top 5]
- Total records to delete: Z

New records to be inserted:
- Date range: [start] to [end]
- Total records to insert: Z

Are you absolutely sure? (yes/no):
```

**2.9 Data Upload Execution**

Execute the user's choice (or auto-upload for first-time/no duplicates):

**Mode 1: Auto-Upload (First-Time Setup or No Duplicates)**

Action items:
1. Begin Supabase transaction
2. Insert all records from file
3. Commit transaction
4. Log inserted record count
5. Verify upload with count query

**SQL approach:**
```sql
BEGIN;

INSERT INTO meta_raw_data 
  (reporting_starts, campaign_name, ad_set_name, ad_name, 
   amount_spent_inr, ctr_link_click_through_rate, cpm_cost_per_1000_impressions,
   date_range_start, date_range_end, source_file_name)
VALUES
  (...),  -- all records from file
  (...);

COMMIT;
```

**Success message:**
```
✓ Upload Complete

Mode: AUTO-UPLOAD
Records uploaded: X
Upload time: Y seconds
Status: SUCCESS
```

**Mode 2: SKIP**

Action items:
1. Log skip decision with reason
2. Update skip counter
3. Move to next file
4. No database modifications

**Log message:**
```
⊘ File Skipped

File: [filename]
Reason: User chose to skip (duplicates detected)
Records not uploaded: X
Status: SKIPPED
```

**Mode 3: APPEND**

Action items:
1. Begin Supabase transaction
2. Insert all records from file (including duplicates)
3. Commit transaction
4. Log appended record count
5. Display warning about duplicates

**SQL approach:**
```sql
BEGIN;

INSERT INTO meta_raw_data 
  (reporting_starts, campaign_name, ad_set_name, ad_name, 
   amount_spent_inr, ctr_link_click_through_rate, cpm_cost_per_1000_impressions,
   date_range_start, date_range_end, source_file_name)
VALUES
  (...),  -- all records including duplicates
  (...);

COMMIT;
```

**Success message with warning:**
```
✓ Upload Complete (with duplicates)

Mode: APPEND
Records uploaded: X
Duplicate records created: Y
Upload time: Z seconds

⚠️  Warning: Duplicate data exists in table meta_raw_data
This may affect downstream analytics and reporting.
Consider using OVERWRITE mode in future uploads to avoid duplicates.

Status: SUCCESS
```

**Mode 4: OVERWRITE**

Action items:
1. Begin Supabase transaction
2. Delete existing records that match duplicate keys from new file
3. Insert all new records
4. Commit transaction
5. Log deleted and inserted counts
6. Verify final state

**SQL approach:**
```sql
BEGIN;

-- Delete existing duplicates
DELETE FROM meta_raw_data 
WHERE (reporting_starts, campaign_name, ad_set_name, ad_name) IN (
    ('2025-01-01', 'Summer Sale', 'Ad Set 1', 'Creative A'),
    ('2025-01-02', 'Summer Sale', 'Ad Set 1', 'Creative B'),
    -- ... all duplicate keys from new file
);

-- Insert new records
INSERT INTO meta_raw_data 
  (reporting_starts, campaign_name, ad_set_name, ad_name, 
   amount_spent_inr, ctr_link_click_through_rate, cpm_cost_per_1000_impressions,
   date_range_start, date_range_end, source_file_name)
VALUES
  (...),  -- all records from new file
  (...);

COMMIT;
```

**Success message:**
```
✓ Upload Complete (overwrite mode)

Mode: OVERWRITE
Existing records deleted: X
New records inserted: Y
Upload time: Z seconds

Changes:
- Deleted date range: [start] to [end]
- Inserted date range: [start] to [end]
- Net change: +/- N records

Status: SUCCESS
```

**Mode 5: CANCEL**

Action items:
1. Stop all upload operations immediately
2. No database modifications
3. Log cancellation with file name
4. Provide summary of files processed before cancellation

**Message:**
```
✗ Upload Cancelled

File: [filename]
Reason: User selected CANCEL
Files processed before cancellation: X
Files remaining: Y

No data was written to Supabase.
You can review the data manually and re-run the upload process.

Status: CANCELLED
```

**ERROR Handling During Upload**

All uploads are wrapped in try-catch blocks to handle errors gracefully:

**Connection errors:**
- **Symptoms**: Network timeout, connection lost, socket error
- **Action**: 
  1. Log the specific error
  2. Attempt retry (maximum 3 attempts with 5-second delay)
  3. If all retries fail: STOP and report
- **Example error:**
  ```
  ✗ Connection Error
  
  Error: Connection lost during upload
  Attempt: 1 of 3
  Retrying in 5 seconds...
  
  [If all retries fail]
  ✗ Upload Failed After 3 Retries
  
  The connection to Supabase was lost during upload.
  - No data was written (transaction rolled back)
  - Check your network connection
  - Verify Supabase is accessible
  - Re-run the upload after fixing connection
  ```

**Constraint violation errors:**
- **Symptoms**: UNIQUE constraint violation, primary key conflict, foreign key violation
- **Action**:
  1. Log which constraint was violated
  2. Identify the specific rows causing the violation
  3. Provide option to skip violating rows and continue
- **Example error:**
  ```
  ✗ Constraint Violation Error
  
  Error: UNIQUE constraint violation on meta_raw_data
  Constraint: unique_meta_raw_data_key
  Violating key: (reporting_starts, campaign_name, ad_set_name, ad_name)
  
  Sample violating records:
  1. 2025-01-01 | Summer Sale | Ad Set 1 | Creative A
  2. 2025-01-02 | Summer Sale | Ad Set 1 | Creative B
  
  Total violating records: X
  
  This shouldn't happen if duplicate detection worked correctly.
  
  Options:
  1. Skip violating rows and upload the rest
  2. STOP and investigate
  
  Your choice (1/2):
  ```

**Data type errors:**
- **Symptoms**: Type mismatch, format error, cannot convert value
- **Action**:
  1. Log which column and row has the issue
  2. Show the problematic value
  3. Show expected vs. actual data type
  4. STOP for user correction
- **Example error:**
  ```
  ✗ Data Type Error
  
  Error: Cannot convert value to NUMERIC
  Column: amount_spent_inr
  Row: 42
  Value: "N/A"
  Expected type: NUMERIC(12,2)
  
  The CSV contains non-numeric values in a numeric column.
  
  Action required:
  1. Fix the CSV file (replace "N/A" with NULL or 0)
  2. Re-run the upload
  
  Status: STOPPED
  ```

**Permission errors:**
- **Symptoms**: Permission denied, insufficient privileges, access forbidden
- **Action**:
  1. Identify which permission is missing
  2. Explain what access is needed
  3. Suggest using service_role key
  4. STOP until permissions granted
- **Example error:**
  ```
  ✗ Permission Error
  
  Error: Permission denied on table meta_raw_data
  Operation: INSERT
  
  Your API key does not have permission to insert data.
  
  Required permissions:
  - INSERT on table meta_raw_data
  
  Solutions:
  1. Use your service_role key instead of anon key
  2. Grant INSERT permission to the current key
  3. Contact your Supabase admin
  
  Status: STOPPED
  ```

**Transaction errors:**
- **Symptoms**: Cannot commit, rollback failed, deadlock detected
- **Action**:
  1. Log the database state
  2. Report potential data inconsistency
  3. STOP for manual verification
- **Example error:**
  ```
  ✗ Transaction Error
  
  Error: Transaction rollback failed
  State: UNKNOWN
  
  ⚠️  Critical Warning ⚠️
  The database may be in an inconsistent state.
  
  Action required:
  1. Check Supabase for partial uploads
  2. Verify data integrity manually
  3. May need to delete partial data
  4. Re-run upload after verification
  
  Status: STOPPED - MANUAL REVIEW REQUIRED
  ```

**Error detail logging:**

For each error encountered, capture:
- Timestamp (exact time of error)
- Source table (meta_raw_data, google_raw_data, or shopify_raw_data)
- File name being processed
- Error type (connection, constraint, data type, permission, transaction)
- Full error message from Supabase
- Affected row numbers (if applicable)
- Sample problematic data (first 3 rows with issues)
- Transaction state (committed, rolled back, unknown)

**Validation checks:**
- ✓ All errors are caught (no unhandled exceptions)
- ✓ Transactions roll back on error (no partial uploads)
- ✓ Error messages are descriptive and actionable
- ✓ User is given clear next steps
- ✓ Error details are logged for debugging

**2.10 Upload Verification**

After each successful file upload, verify the upload was completed correctly:

**Record Count Reconciliation:**

Action items:
1. Count records in the source CSV file
2. Count records uploaded (should match file count for APPEND, may differ for OVERWRITE)
3. Query Supabase to verify record count
4. Compare and confirm match

**Verification queries:**
```sql
-- Count records from this specific file upload
SELECT COUNT(*) 
FROM meta_raw_data 
WHERE source_file_name = '[current_file_name]';

-- Count total records in table after upload
SELECT COUNT(*) FROM meta_raw_data;
```

**Expected results:**
- For AUTO-UPLOAD or APPEND: Records in Supabase = Records in file
- For OVERWRITE: Records in Supabase = Records in file (duplicates replaced)
- For SKIP: Records in Supabase = unchanged

**Match status:**
- ✓ PASS: Counts match expected values
- ✗ FAIL: Counts don't match - potential data loss or duplication

**Data Integrity Spot Checks:**

Action items:
1. Select 10 random records from uploaded data
2. Compare with source CSV file values
3. Verify exact match for key fields
4. Check numeric precision preserved
5. Validate date formats correct

**Spot check query:**
```sql
-- Get random sample of uploaded records
SELECT *
FROM meta_raw_data 
WHERE source_file_name = '[current_file_name]'
ORDER BY RANDOM()
LIMIT 10;
```

**Validation checks for spot check:**
- ✓ Campaign names match exactly (case-sensitive)
- ✓ Dates are identical (no timezone issues)
- ✓ Numeric values match (check for rounding errors)
- ✓ No truncation of text fields
- ✓ NULL values handled correctly

**Date Range Verification:**

Action items:
1. Query min/max dates from uploaded batch
2. Compare with source file date range (from Step 1.3)
3. Verify metadata columns (date_range_start, date_range_end) are correct

**Verification query:**
```sql
SELECT 
    MIN(reporting_starts) as min_date,
    MAX(reporting_starts) as max_date,
    MIN(date_range_start) as stored_range_start,
    MAX(date_range_end) as stored_range_end,
    COUNT(*) as record_count
FROM meta_raw_data 
WHERE source_file_name = '[current_file_name]';
```

**Expected results:**
- min_date should equal the earliest date from Step 1.3
- max_date should equal the latest date from Step 1.3
- stored_range_start and stored_range_end should match file date range
- record_count should match file record count

**Validation checks:**
- ✓ Date range preserved accurately
- ✓ No dates outside expected range
- ✓ Metadata columns populated correctly
- ✓ No timezone conversion issues

**Verification Report (per file):**
```
───────────────────────────────────────────────
UPLOAD VERIFICATION
───────────────────────────────────────────────

Source: [META / GOOGLE / SHOPIFY]
File: [filename]
Upload Mode: [FIRST-TIME / APPEND / OVERWRITE / SKIP]

Pre-Upload State:
- Records in Supabase before: X
- Records in this file: Y

Upload Results:
- Action taken: [AUTO-UPLOAD / APPEND / OVERWRITE / SKIP]
- Records uploaded: Z
- Records deleted (if overwrite): W
- Records in Supabase after: V

Record Count Reconciliation:
✓ Source file records: Y
✓ Uploaded records: Z
✓ Verification query: Z
✓ Status: PASS [all counts match]

Data Integrity Spot Check (10 random records):
✓ Campaign names match
✓ Dates preserved correctly
✓ Numeric values accurate
✓ No truncation detected
✓ NULL values handled correctly
✓ Status: PASS [10/10 records verified]

Date Range Verification:
✓ Expected range: [file_start] to [file_end]
✓ Actual range in Supabase: [db_start] to [db_end]
✓ Metadata columns: [meta_start] to [meta_end]
✓ Status: PASS [ranges match]

Overall Verification: ✓ SUCCESS

Errors: None

Upload Time: X.X seconds
───────────────────────────────────────────────
```

**If verification fails:**
```
───────────────────────────────────────────────
⚠️  VERIFICATION FAILED
───────────────────────────────────────────────

Source: [META / GOOGLE / SHOPIFY]
File: [filename]

Issues Detected:

Record Count Mismatch:
✗ Source file records: 1000
✗ Records uploaded: 950
✗ Verification query: 950
✗ Missing records: 50

Recommended actions:
1. Check error log for failed inserts
2. Review source file for data quality issues
3. Re-upload file if needed
4. Investigate why 50 records failed

Status: FAILED - REVIEW REQUIRED
───────────────────────────────────────────────
```

**2.11 Comprehensive Upload Summary**

After all files are processed, generate a comprehensive summary report:

```
═══════════════════════════════════════════════
SUPABASE RAW DATA UPLOAD SUMMARY
═══════════════════════════════════════════════

Upload Session: [timestamp]
Processing Time: X minutes Y seconds

DATABASE STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mode: [FIRST-TIME SETUP / EXISTING DATABASE]
Tables Created: [0 / 1 / 2 / 3]

[If tables were created:]
New Tables:
✓ meta_raw_data (created with 12 columns, 4 indexes)
✓ google_raw_data (created with 7 columns, 4 indexes)
✓ shopify_raw_data (created with 13 columns, 4 indexes)


META RAW DATA (meta_raw_data table)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Setup: [CREATED NEW TABLE / EXISTING TABLE USED]
Files Processed: X files

Upload Results:
- First-time uploads: A records (from B files)
- Appended (no duplicates): C records (from D files)
- Appended (with duplicates): E records (from F files)
- Overwritten: G records (from H files)
- Skipped: I records (from J files)
- Failed: K records

Date Coverage:
- Earliest date: [date]
- Latest date: [date]
- Total days covered: X days
- Gaps: [None / List any gaps]

Table State:
- Records before upload: X
- Records after upload: Y
- Net change: [+/-]Z records

User Actions:
- AUTO-UPLOAD (first-time/no dupes): X files
- SKIP decisions: Y files
- APPEND decisions: Z files
- OVERWRITE decisions: W files

Verification:
✓ All uploads verified successfully
✓ No data integrity issues
✓ Record counts reconciled

Errors: [None / See detailed error log]


GOOGLE RAW DATA (google_raw_data table)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Setup: [CREATED NEW TABLE / EXISTING TABLE USED]
Files Processed: X files

Upload Results:
- First-time uploads: A records (from B files)
- Appended (no duplicates): C records (from D files)
- Appended (with duplicates): E records (from F files)
- Overwritten: G records (from H files)
- Skipped: I records (from J files)
- Failed: K records

Date Coverage:
- Earliest date: [date]
- Latest date: [date]
- Total days covered: X days
- Gaps: [None / List any gaps]

Table State:
- Records before upload: X
- Records after upload: Y
- Net change: [+/-]Z records

User Actions:
- AUTO-UPLOAD (first-time/no dupes): X files
- SKIP decisions: Y files
- APPEND decisions: Z files
- OVERWRITE decisions: W files

Verification:
✓ All uploads verified successfully
✓ No data integrity issues
✓ Record counts reconciled

Errors: [None / See detailed error log]


SHOPIFY RAW DATA (shopify_raw_data table)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Setup: [CREATED NEW TABLE / EXISTING TABLE USED]
Files Processed: X files

Upload Results:
- First-time uploads: A records (from B files)
- Appended (no duplicates): C records (from D files)
- Appended (with duplicates): E records (from F files)
- Overwritten: G records (from H files)
- Skipped: I records (from J files)
- Failed: K records

Date Coverage:
- Earliest date: [date]
- Latest date: [date]
- Total days covered: X days
- Gaps: [None / List any gaps]

Table State:
- Records before upload: X
- Records after upload: Y
- Net change: [+/-]Z records

User Actions:
- AUTO-UPLOAD (first-time/no dupes): X files
- SKIP decisions: Y files
- APPEND decisions: Z files
- OVERWRITE decisions: W files

Verification:
✓ All uploads verified successfully
✓ No data integrity issues
✓ Record counts reconciled

Errors: [None / See detailed error log]


OVERALL SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Files Processed: X
Total Records Uploaded: Y
Total Records Skipped: Z
Total Records Failed: W

Overall Status: [✓ SUCCESS / ⚠ PARTIAL / ✗ FAILED]

Quality Metrics:
✓ Upload success rate: X%
✓ Data integrity: 100% verified
✓ Average upload time: X seconds per file
✓ All date ranges tracked
✓ All source files logged

═══════════════════════════════════════════════
```

**Status Definitions:**

**✓ SUCCESS**: 
- All files processed successfully (100% upload rate)
- No failed uploads
- All verifications passed
- Ready to proceed with data processing

**⚠ PARTIAL**:
- Some files uploaded successfully
- Some files skipped by user choice
- Some files failed (<10% failure rate)
- Review recommended before proceeding

**✗ FAILED**:
- Upload failed completely
- Critical errors encountered
- >10% of records failed to upload
- Cannot proceed with data processing

**2.12 Error Log Generation**

If any errors occurred during the upload process, generate a detailed error log file:

**File name**: `supabase_upload_errors_<timestamp>.csv`

**Columns:**
- timestamp: Exact time the error occurred
- source_table: Which table (meta_raw_data, google_raw_data, shopify_raw_data)
- source_file_name: Which CSV file was being processed
- error_type: Type of error (connection, constraint, data_type, permission, transaction, other)
- error_message: Full error message from Supabase or system
- row_number: Row number in source CSV (if applicable)
- record_data: JSON representation of the problematic record
- recovery_action_taken: What action was taken (retry, skip, stop)

**Example error log content:**
```csv
timestamp,source_table,source_file_name,error_type,error_message,row_number,record_data,recovery_action_taken
2025-10-31T10:30:15Z,meta_raw_data,Meta_Ads_01-10.csv,connection,Connection timeout after 30 seconds,N/A,N/A,Retry (attempt 1 of 3)
2025-10-31T10:30:25Z,meta_raw_data,Meta_Ads_01-10.csv,connection,Connection timeout after 30 seconds,N/A,N/A,Retry (attempt 2 of 3)
2025-10-31T10:30:35Z,meta_raw_data,Meta_Ads_01-10.csv,connection,Connection timeout after 30 seconds,N/A,N/A,Stop after 3 failed retries
2025-10-31T10:45:00Z,google_raw_data,Google_01-10.csv,data_type,Cannot convert 'N/A' to NUMERIC,42,"{""day"":""2025-01-15"",""campaign"":""Summer Sale"",""cost"":""N/A""}",Stop for user correction
```

**Error Summary Table:**
```
ERROR SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Error Type           | Count | Affected Tables
---------------------|-------|----------------------------------
Connection Error     |   3   | meta_raw_data
Constraint Violation |   0   | -
Data Type Mismatch   |   1   | google_raw_data
Permission Error     |   0   | -
Transaction Error    |   0   | -
Other                |   0   | -
---------------------|-------|----------------------------------
TOTAL ERRORS         |   4   | meta_raw_data, google_raw_data
```

Download link: [Download Error Log](computer:///mnt/user-data/outputs/supabase_upload_errors_<timestamp>.csv)

**2.13 Next Steps Recommendation**

Based on upload results, provide clear guidance on what to do next:

**Scenario 1: First-Time Setup Complete**
```
✓ FIRST-TIME SETUP COMPLETED SUCCESSFULLY!

All tables created and initial data loaded:
- meta_raw_data: X records loaded
- google_raw_data: Y records loaded
- shopify_raw_data: Z records loaded

Your raw marketing data is now safely stored in Supabase.

NEXT STEPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ✓ Raw data upload complete
2. → Proceed to data processing and validation
3. → Run analytics and attribution logic
4. → Upload processed results to separate Supabase tables

Future uploads will automatically check for duplicates.

Ready to proceed? (yes/no):
```

**Scenario 2: 100% Success (Existing Database)**
```
✓ ALL DATA UPLOADED SUCCESSFULLY!

Upload completed without errors:
- All files processed: 100%
- All records uploaded: X records
- No failed uploads
- All verifications passed

Your raw marketing data is now safely stored in Supabase.

NEXT STEPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ✓ Raw data upload complete
2. → Proceed to data processing and validation
3. → Run analytics and attribution logic
4. → Upload processed results to separate Supabase tables

Ready to proceed? (yes/no):
```

**Scenario 3: Partial Success**
```
⚠  UPLOAD COMPLETED WITH SOME ISSUES

Summary:
- Successfully uploaded: X% (Y records)
- Skipped files: Z files (user choice)
- Failed records: W records

Details:
- Auto-uploaded: A records
- User skipped: B records
- Failed uploads: C records

RECOMMENDATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Review error log: supabase_upload_errors_<timestamp>.csv
2. Fix issues in failed files
3. Decide if partial data is sufficient for analysis
4. Options:
   a) Proceed with available data (may have gaps)
   b) Fix and re-upload failed files first
   c) Review skipped files and re-upload if needed

What would you like to do?
1. Proceed with current data
2. Fix and re-upload failed files
3. Stop and review manually

Your choice (1/2/3):
```

**Scenario 4: Failed Upload**
```
✗ UPLOAD FAILED

Critical issues prevented successful upload:
- [List primary failure reasons]
- Total records affected: X
- Files not uploaded: Y

ERROR DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Show top 3 critical errors]

REQUIRED ACTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Review error log: supabase_upload_errors_<timestamp>.csv
2. Fix the following issues:
   - [Specific issue 1]
   - [Specific issue 2]
   - [Specific issue 3]
3. Re-run Step 2 (Supabase upload) after corrections

⚠️  Important: Do not proceed to data processing until upload succeeds.

Press any key to exit...
```

## Output Files

This prompt generates the following output files:

### Mandatory Outputs
1. **Upload Summary Report** (console output)
   - Complete summary of entire upload session
   - Printed to screen and can be copied

2. **Upload Metadata JSON**: `upload_metadata_<timestamp>.json`
   - Machine-readable upload summary
   - Contains all metrics and decisions
   - Useful for automation and tracking

### Conditional Outputs (only if errors occurred)
3. **Error Log CSV**: `supabase_upload_errors_<timestamp>.csv`
   - Detailed error information for debugging
   - One row per error with full context

4. **Data Quality Spot Check Report**: `upload_spot_check_<timestamp>.csv`
   - Random sample verification results
   - Comparison of source vs. uploaded data

### Output File Examples

**upload_metadata_<timestamp>.json:**
```json
{
  "upload_session_id": "20251031_103045",
  "upload_timestamp": "2025-10-31T10:30:45Z",
  "total_processing_time_seconds": 245,
  "database_mode": "first_time_setup",
  "tables_created": ["meta_raw_data", "google_raw_data", "shopify_raw_data"],
  
  "meta_raw_data": {
    "table_created": true,
    "files_processed": 3,
    "total_records_in_files": 1500,
    "first_time_uploads": 1500,
    "appended_no_dupes": 0,
    "appended_with_dupes": 0,
    "overwritten": 0,
    "skipped": 0,
    "failed": 0,
    "date_range": {
      "start": "2025-01-01",
      "end": "2025-10-31"
    },
    "user_decisions": ["AUTO-UPLOAD", "AUTO-UPLOAD", "AUTO-UPLOAD"],
    "verification_status": "PASSED"
  },
  
  "google_raw_data": {
    "table_created": true,
    "files_processed": 2,
    "total_records_in_files": 850,
    "first_time_uploads": 850,
    "appended_no_dupes": 0,
    "appended_with_dupes": 0,
    "overwritten": 0,
    "skipped": 0,
    "failed": 0,
    "date_range": {
      "start": "2025-01-01",
      "end": "2025-10-31"
    },
    "user_decisions": ["AUTO-UPLOAD", "AUTO-UPLOAD"],
    "verification_status": "PASSED"
  },
  
  "shopify_raw_data": {
    "table_created": true,
    "files_processed": 1,
    "total_records_in_files": 7300,
    "first_time_uploads": 7300,
    "appended_no_dupes": 0,
    "appended_with_dupes": 0,
    "overwritten": 0,
    "skipped": 0,
    "failed": 0,
    "date_range": {
      "start": "2025-01-01",
      "end": "2025-10-31"
    },
    "user_decisions": ["AUTO-UPLOAD"],
    "verification_status": "PASSED"
  },
  
  "overall_status": "SUCCESS",
  "total_files_processed": 6,
  "total_records_uploaded": 9650,
  "upload_success_rate": 100,
  "errors": []
}
```

## Reporting Style

- Show clear, formatted reports at each major step
- Use visual separators (lines, boxes) to organize information
- Provide short confirmations after each file upload
- Include download links for all generated files
- Keep commentary concise and actionable
- Use color coding in terminal output when possible (✓ ✗ ⚠️)



