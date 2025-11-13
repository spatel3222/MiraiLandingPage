#!/bin/bash
# Quick Commands for MOI Data Upload
# ==================================

echo "🚀 MOI Analytics Dashboard - Quick Commands"
echo "=========================================="

# Navigate to correct directory
cd "/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/moi-analytics-dashboard/sql_batches"

echo "📁 Current directory: $(pwd)"
echo ""

# Show available commands
echo "Available Fast Commands:"
echo "========================"
echo ""

echo "1. 📊 Check current database status:"
echo "   python3 -c \"print('Run: SELECT COUNT(*) FROM meta_raw_data;')\""
echo ""

echo "2. 🔄 Process next Meta batch (50 records):"
echo "   python3 execute_meta_fast.py 40"
echo ""

echo "3. 📈 Process larger Meta batch (100 records):"
echo "   python3 execute_meta_fast.py 40 # then copy/paste the SQL output"
echo ""

echo "4. 🗂️ List all Shopify batch files:"
echo "   ls -la shopify_full_batches/ | head -10"
echo ""

echo "5. ⚡ Execute single Shopify batch:"
echo "   cat shopify_full_batches/shopify_chunk_0001.sql"
echo ""

echo "6. 🎯 Quick verification:"
echo "   echo 'SELECT table_name, COUNT(*) FROM information_schema.tables WHERE table_name LIKE \"%raw_data\";'"
echo ""

echo "Current Status:"
echo "==============="
echo "Meta: ~40/34,547 records uploaded (0.1%)"
echo "Shopify: 10/3,288,227 records uploaded (0.0003%)"
echo "Google: 2,309/2,309 records completed (100%)"
echo ""

echo "🎯 FASTEST APPROACH:"
echo "==================="
echo "1. Run: python3 execute_meta_fast.py 40"
echo "2. Copy the SQL output"
echo "3. Execute in Supabase SQL Editor"
echo "4. Repeat with next batch (90, 140, 190...)"