#!/usr/bin/env python3
"""
Shopify Batch Consolidator
Consolidates all 20 Shopify batch files into a single executable SQL file
Creates table and inserts all 3,060 records efficiently
"""

import os
import time
from datetime import datetime

class ShopifyBatchConsolidator:
    def __init__(self, ref_param="nbclorobfotxrpbmyapi"):
        self.ref_param = ref_param
        self.base_dir = "/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/moi-analytics-dashboard/sql_batches"
        
    def create_table_sql(self):
        """Generate CREATE TABLE statement for Shopify data"""
        return """
-- Create Shopify Raw Data Table
CREATE TABLE IF NOT EXISTS shopify_raw_data (
    id SERIAL PRIMARY KEY,
    day DATE NOT NULL,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    landing_page_url TEXT,
    online_store_visitors INTEGER DEFAULT 0,
    sessions_completed_checkout INTEGER DEFAULT 0,
    sessions_reached_checkout INTEGER DEFAULT 0,
    sessions_with_cart_additions INTEGER DEFAULT 0,
    average_session_duration INTEGER DEFAULT 0,
    pageviews INTEGER DEFAULT 0,
    ref_parameter TEXT DEFAULT 'nbclorobfotxrpbmyapi',
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shopify_day ON shopify_raw_data(day);
CREATE INDEX IF NOT EXISTS idx_shopify_campaign ON shopify_raw_data(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_shopify_ref_param ON shopify_raw_data(ref_parameter);

-- Clear any existing data for this ref parameter (optional)
-- DELETE FROM shopify_raw_data WHERE ref_parameter = 'nbclorobfotxrpbmyapi';

"""

    def consolidate_all_batches(self):
        """Consolidate all Shopify batch files into one SQL file"""
        print("🚀 Starting Shopify Batch Consolidation...")
        print(f"📁 Processing 20 batch files")
        print(f"🔑 Using ref parameter: {self.ref_param}")
        print("-" * 70)
        
        start_time = time.time()
        
        # Output file
        output_file = f"{self.base_dir}/consolidated_shopify_batches_{datetime.now().strftime('%Y%m%d_%H%M%S')}.sql"
        
        total_records = 0
        processed_files = 0
        
        with open(output_file, 'w') as outfile:
            # Write header and table creation
            outfile.write("-- Consolidated Shopify Batch SQL File\\n")
            outfile.write(f"-- Generated: {datetime.now().isoformat()}\\n")
            outfile.write(f"-- Total Files: 20\\n")
            outfile.write(f"-- Expected Records: 3060\\n")
            outfile.write(f"-- Ref Parameter: {self.ref_param}\\n")
            outfile.write("-- " + "="*60 + "\\n\\n")
            
            outfile.write(self.create_table_sql())
            outfile.write("\\n")
            
            # Process each batch file
            for i in range(20):
                batch_file = f"{self.base_dir}/shopify_sample_batch_{i:04d}.sql"
                
                if os.path.exists(batch_file):
                    print(f"📄 Processing batch {i:02d}: {os.path.basename(batch_file)}")
                    
                    with open(batch_file, 'r') as infile:
                        content = infile.read()
                        
                        # Count records in this file
                        file_records = content.count("('2024-")
                        total_records += file_records
                        
                        # Write file header
                        outfile.write(f"-- Batch File {i:02d}: {os.path.basename(batch_file)}\\n")
                        outfile.write(f"-- Records: {file_records}\\n")
                        outfile.write("-- " + "-"*40 + "\\n")
                        
                        # Write the SQL content
                        outfile.write(content)
                        outfile.write("\\n\\n")
                        
                        processed_files += 1
                else:
                    print(f"⚠️  Warning: File not found - {batch_file}")
        
        execution_time = time.time() - start_time
        
        # Generate execution summary
        print("\\n" + "="*70)
        print("📋 SHOPIFY BATCH CONSOLIDATION REPORT")
        print("="*70)
        print(f"⏱️  Total Execution Time: {execution_time:.2f} seconds")
        print(f"📁 Files Processed: {processed_files}/20")
        print(f"📊 Total Records: {total_records}")
        print(f"📄 Output File: {os.path.basename(output_file)}")
        print(f"💾 File Size: {os.path.getsize(output_file) / 1024:.1f} KB")
        
        # Create execution instructions
        instructions_file = f"{self.base_dir}/shopify_execution_instructions.md"
        with open(instructions_file, 'w') as f:
            f.write(f"""# Shopify Batch Execution Instructions

## Summary
- **Total Files Processed**: {processed_files}/20
- **Total Records**: {total_records}
- **Consolidated File**: `{os.path.basename(output_file)}`
- **Ref Parameter**: `{self.ref_param}`

## Execution Methods

### Method 1: PostgreSQL Command Line
```bash
psql -d your_database -f {os.path.basename(output_file)}
```

### Method 2: Using psql with Connection String
```bash
psql "postgresql://username:password@localhost:5432/database" -f {os.path.basename(output_file)}
```

### Method 3: Copy & Paste to SQL Client
1. Open your preferred SQL client (pgAdmin, DBeaver, etc.)
2. Copy the contents of `{os.path.basename(output_file)}`
3. Execute the SQL

### Method 4: API Execution (if Supabase is accessible)
```bash
curl -X POST "https://your-supabase-url/rest/v1/rpc/sql" \\
  -H "apikey: your-api-key" \\
  -H "Authorization: Bearer your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{{"query": "$(cat {os.path.basename(output_file)})"}}' 
```

## Verification Queries

After execution, verify the data:

```sql
-- Check total records
SELECT COUNT(*) FROM shopify_raw_data WHERE ref_parameter = '{self.ref_param}';

-- Check date range
SELECT MIN(day), MAX(day) FROM shopify_raw_data WHERE ref_parameter = '{self.ref_param}';

-- Check sample records
SELECT * FROM shopify_raw_data WHERE ref_parameter = '{self.ref_param}' LIMIT 5;
```

Expected results:
- Total records: {total_records}
- Date range: 2024-10-01 to 2024-10-01 (or similar range)
- All records should have ref_parameter = '{self.ref_param}'
""")
        
        print(f"📋 Instructions saved: {os.path.basename(instructions_file)}")
        print("="*70)
        
        return output_file, total_records

def main():
    consolidator = ShopifyBatchConsolidator(ref_param="nbclorobfotxrpbmyapi")
    output_file, total_records = consolidator.consolidate_all_batches()
    
    print(f"\\n✅ Consolidation complete!")
    print(f"🎯 Next steps: Execute {os.path.basename(output_file)} in your database")
    print(f"📊 This will insert {total_records} Shopify session records")

if __name__ == "__main__":
    main()