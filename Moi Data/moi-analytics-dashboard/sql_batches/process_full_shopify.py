#!/usr/bin/env python3
"""
Process Complete Shopify Dataset - 3.2M Records
==============================================
Ingests the full yearly Shopify CSV file into Supabase
Source: /Users/shivangpatel/Downloads/yearly files/Shopify_1st Oct 24 to 26th Oct 25.csv
Target: 3,288,228 individual session records
"""

import pandas as pd
import os
import sys
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def process_shopify_full_dataset():
    """Process the complete Shopify CSV file in optimized chunks"""
    
    source_file = "/Users/shivangpatel/Downloads/yearly files/Shopify_1st Oct 24 to 26th Oct 25.csv"
    
    if not os.path.exists(source_file):
        logger.error(f"Source file not found: {source_file}")
        return False
    
    logger.info(f"📁 Processing Shopify file: {source_file}")
    file_size = os.path.getsize(source_file) / (1024 * 1024)  # MB
    logger.info(f"📊 File size: {file_size:.1f} MB")
    
    # Read file info
    try:
        # Get total line count first
        with open(source_file, 'r') as f:
            total_lines = sum(1 for line in f)
        
        logger.info(f"📈 Total lines: {total_lines:,}")
        logger.info(f"📈 Expected records: {total_lines - 1:,} (excluding header)")
        
        # Read first few lines to understand structure
        sample_df = pd.read_csv(source_file, nrows=5)
        logger.info(f"📋 Columns: {list(sample_df.columns)}")
        logger.info(f"📋 Sample shape: {sample_df.shape}")
        
        # Process in chunks for memory efficiency
        chunk_size = 10000  # 10K records per chunk
        total_chunks = (total_lines - 1) // chunk_size + 1
        
        logger.info(f"🔄 Processing {total_chunks:,} chunks of {chunk_size:,} records each")
        
        # Create SQL batch files
        output_dir = "/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/moi-analytics-dashboard/sql_batches/shopify_full_batches"
        os.makedirs(output_dir, exist_ok=True)
        
        batch_files = []
        processed_records = 0
        
        # Process in chunks
        chunk_reader = pd.read_csv(source_file, chunksize=chunk_size)
        
        for chunk_num, chunk_df in enumerate(chunk_reader):
            logger.info(f"📦 Processing chunk {chunk_num + 1}/{total_chunks} ({len(chunk_df)} records)")
            
            # Generate SQL for this chunk
            sql_values = []
            
            for _, row in chunk_df.iterrows():
                try:
                    # Extract and clean values
                    day = pd.to_datetime(row.get('Day', '')).date().isoformat() if pd.notna(row.get('Day')) else '2024-10-01'
                    utm_campaign = str(row.get('UTM campaign', '')).replace("'", "''")[:255]
                    utm_term = str(row.get('UTM term', '')).replace("'", "''")[:255]
                    utm_content = str(row.get('UTM content', '')).replace("'", "''")[:255]
                    landing_page = str(row.get('Landing page', '')).replace("'", "''")[:500] if pd.notna(row.get('Landing page')) else ''
                    
                    visitors = int(row.get('Online store visitors', 0)) if pd.notna(row.get('Online store visitors')) else 0
                    checkouts = int(row.get('Sessions completed checkout', 0)) if pd.notna(row.get('Sessions completed checkout')) else 0
                    reached_checkout = int(row.get('Sessions reached checkout', 0)) if pd.notna(row.get('Sessions reached checkout')) else 0
                    cart_additions = int(row.get('Sessions with cart additions', 0)) if pd.notna(row.get('Sessions with cart additions')) else 0
                    session_duration = int(row.get('Average session duration', 0)) if pd.notna(row.get('Average session duration')) else 0
                    pageviews = int(row.get('Pageviews', 0)) if pd.notna(row.get('Pageviews')) else 0
                    
                    sql_values.append(f"('{day}', '{utm_campaign}', '{utm_term}', '{utm_content}', '{landing_page}', {visitors}, {checkouts}, {reached_checkout}, {cart_additions}, {session_duration}, {pageviews}, 'nbclorobfotxrpbmyapi')")
                    processed_records += 1
                    
                except Exception as e:
                    logger.warning(f"Skipping record due to error: {e}")
                    continue
            
            # Create SQL file for this chunk
            if sql_values:
                chunk_sql = f"""-- Shopify Full Dataset Chunk {chunk_num + 1}
-- Records: {len(sql_values)}
-- Processed: {processed_records:,}

INSERT INTO shopify_raw_data (
    day, utm_campaign, utm_term, utm_content, landing_page_url,
    online_store_visitors, sessions_completed_checkout, sessions_reached_checkout,
    sessions_with_cart_additions, average_session_duration, pageviews, ref_parameter
) VALUES 
{','.join(sql_values)}
ON CONFLICT (day, utm_campaign, utm_term, utm_content) 
DO UPDATE SET processed_at = CURRENT_TIMESTAMP;
"""
                
                chunk_file = f"{output_dir}/shopify_chunk_{chunk_num + 1:04d}.sql"
                with open(chunk_file, 'w') as f:
                    f.write(chunk_sql)
                
                batch_files.append(chunk_file)
                logger.info(f"✅ Created {chunk_file} with {len(sql_values)} records")
            
            # Progress update
            progress_pct = (chunk_num + 1) / total_chunks * 100
            logger.info(f"📈 Progress: {progress_pct:.1f}% ({processed_records:,} records processed)")
        
        # Create execution summary
        summary = {
            "total_source_lines": total_lines,
            "processed_records": processed_records,
            "batch_files_created": len(batch_files),
            "output_directory": output_dir,
            "batch_files": batch_files,
            "processing_timestamp": datetime.now().isoformat()
        }
        
        logger.info(f"🎉 SHOPIFY PROCESSING COMPLETE!")
        logger.info(f"📊 Total records processed: {processed_records:,}")
        logger.info(f"📁 Batch files created: {len(batch_files)}")
        logger.info(f"📂 Output directory: {output_dir}")
        
        return summary
        
    except Exception as e:
        logger.error(f"❌ Error processing Shopify file: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting Full Shopify Dataset Processing...")
    print("=" * 60)
    
    result = process_shopify_full_dataset()
    
    if result:
        print(f"\n✅ Shopify processing completed successfully!")
        print(f"📊 Records: {result['processed_records']:,}")
        print(f"📁 Batches: {result['batch_files_created']}")
        sys.exit(0)
    else:
        print(f"\n❌ Shopify processing failed!")
        sys.exit(1)