# Shopify Batch Execution Instructions

## Summary
- **Total Files Processed**: 20/20
- **Total Records**: 1000
- **Consolidated File**: `consolidated_shopify_batches_20251102_095248.sql`
- **Ref Parameter**: `nbclorobfotxrpbmyapi`

## Execution Methods

### Method 1: PostgreSQL Command Line
```bash
psql -d your_database -f consolidated_shopify_batches_20251102_095248.sql
```

### Method 2: Using psql with Connection String
```bash
psql "postgresql://username:password@localhost:5432/database" -f consolidated_shopify_batches_20251102_095248.sql
```

### Method 3: Copy & Paste to SQL Client
1. Open your preferred SQL client (pgAdmin, DBeaver, etc.)
2. Copy the contents of `consolidated_shopify_batches_20251102_095248.sql`
3. Execute the SQL

### Method 4: API Execution (if Supabase is accessible)
```bash
curl -X POST "https://your-supabase-url/rest/v1/rpc/sql" \
  -H "apikey: your-api-key" \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"query": "$(cat consolidated_shopify_batches_20251102_095248.sql)"}' 
```

## Verification Queries

After execution, verify the data:

```sql
-- Check total records
SELECT COUNT(*) FROM shopify_raw_data WHERE ref_parameter = 'nbclorobfotxrpbmyapi';

-- Check date range
SELECT MIN(day), MAX(day) FROM shopify_raw_data WHERE ref_parameter = 'nbclorobfotxrpbmyapi';

-- Check sample records
SELECT * FROM shopify_raw_data WHERE ref_parameter = 'nbclorobfotxrpbmyapi' LIMIT 5;
```

Expected results:
- Total records: 1000
- Date range: 2024-10-01 to 2024-10-01 (or similar range)
- All records should have ref_parameter = 'nbclorobfotxrpbmyapi'
