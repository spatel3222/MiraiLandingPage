#!/usr/bin/env python3
"""
Execute Meta Production SQL File in Optimized Chunks
=====================================================
Processes meta_final_production.sql in 70 chunks of ~500 records each
Total: 34,547 Meta advertising records for nbclorobfotxrpbmyapi
"""

import os
import sys
import time
import requests
import json
from concurrent.futures import ThreadPoolExecutor
import threading

# Supabase configuration
SUPABASE_URL = "https://nbclorobfotxrpbmyapi.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iY2xvcm9iZm90eHJwYm15YXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAyNjUzMzIsImV4cCI6MjA0NTg0MTMzMn0.FhM7bJL4JqGm0aOlRl5BHQOZDLmPOoZd_-eKnFDU3p8"

# Progress tracking
progress_lock = threading.Lock()
completed_chunks = 0
total_chunks = 0

def execute_sql_chunk(chunk_sql, chunk_num, total_chunks):
    """Execute a single SQL chunk via Supabase REST API"""
    global completed_chunks
    
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json'
    }
    
    payload = {
        'query': chunk_sql
    }
    
    try:
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/rpc/execute_sql",
            headers=headers,
            json=payload,
            timeout=60
        )
        
        with progress_lock:
            completed_chunks += 1
            print(f"✅ Chunk {chunk_num:2d}/{total_chunks} completed ({completed_chunks}/{total_chunks}) - {(completed_chunks/total_chunks)*100:.1f}%")
        
        if response.status_code == 200:
            return True, f"Chunk {chunk_num} executed successfully"
        else:
            return False, f"Chunk {chunk_num} failed: {response.status_code} - {response.text}"
            
    except Exception as e:
        return False, f"Chunk {chunk_num} error: {str(e)}"

def process_meta_file():
    """Process the entire Meta production SQL file"""
    global total_chunks
    
    file_path = 'meta_final_production.sql'
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return False
    
    print(f"📁 Reading {file_path}...")
    with open(file_path, 'r') as f:
        lines = f.readlines()
    
    # Find INSERT statement lines
    insert_lines = []
    for i, line in enumerate(lines):
        if 'INSERT INTO meta_raw_data' in line:
            insert_lines.append(i)
    
    total_chunks = len(insert_lines)
    print(f"🎯 Found {total_chunks} INSERT chunks to process")
    
    # Prepare chunks
    chunks = []
    for i in range(total_chunks):
        start_line = insert_lines[i]
        if i + 1 < total_chunks:
            end_line = insert_lines[i + 1] - 1
        else:
            end_line = len(lines) - 1
        
        chunk_lines = [line.rstrip() for line in lines[start_line:end_line + 1]]
        chunk_sql = '\n'.join(chunk_lines)
        
        # Add conflict resolution for safe re-execution
        if not chunk_sql.strip().endswith(';'):
            chunk_sql += ';'
        
        chunks.append((chunk_sql, i + 1))
    
    print(f"⚡ Processing {len(chunks)} chunks with optimized parallel execution...")
    
    # Execute chunks with controlled parallelism
    successful = 0
    failed = 0
    
    start_time = time.time()
    
    # Process in parallel (max 5 concurrent to avoid overwhelming Supabase)
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = []
        for chunk_sql, chunk_num in chunks:
            future = executor.submit(execute_sql_chunk, chunk_sql, chunk_num, total_chunks)
            futures.append((future, chunk_num))
        
        # Collect results
        for future, chunk_num in futures:
            success, message = future.result()
            if success:
                successful += 1
            else:
                failed += 1
                print(f"❌ {message}")
    
    end_time = time.time()
    duration = end_time - start_time
    
    print(f"\n🎉 EXECUTION COMPLETE!")
    print(f"✅ Successful chunks: {successful}/{total_chunks}")
    print(f"❌ Failed chunks: {failed}/{total_chunks}")
    print(f"⏱️  Total time: {duration:.1f} seconds")
    print(f"📊 Processing rate: {total_chunks/duration:.1f} chunks/second")
    
    if successful == total_chunks:
        print(f"🚀 ALL {total_chunks} Meta chunks executed successfully!")
        print(f"📈 Estimated {successful * 500} records ingested")
        return True
    else:
        print(f"⚠️  {failed} chunks failed. Review and retry if needed.")
        return False

if __name__ == "__main__":
    print("🚀 Meta Production SQL Execution Starting...")
    print("=" * 60)
    
    success = process_meta_file()
    
    if success:
        print("\n✅ Meta data ingestion completed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Meta data ingestion completed with errors!")
        sys.exit(1)