#!/usr/bin/env python3
"""
Process Google data and create SQL insert statements
"""

import pandas as pd
import numpy as np
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def clean_value_for_sql(value):
    """Clean and format values for SQL insertion"""
    if pd.isna(value) or value == '' or str(value).lower() == 'null':
        return 'NULL'
    
    if isinstance(value, str):
        # Escape single quotes for SQL
        value = value.replace("'", "''")
        return f"'{value}'"
    
    return str(value)

def main():
    google_file = "/Users/shivangpatel/Downloads/yearly files/Google_1st Oct 24 to 26th Oct 25.csv"
    
    # Read CSV, skipping header rows
    df = pd.read_csv(google_file, skiprows=2)
    logger.info(f"Google data shape: {df.shape}")
    logger.info(f"Columns: {df.columns.tolist()}")
    
    # Process first 1000 rows as a test
    test_df = df.head(1000)
    
    sql_values = []
    
    for index, row in test_df.iterrows():
        try:
            # Parse and clean data
            day_str = str(row['Day']).strip()
            day_date = pd.to_datetime(day_str).date().isoformat()
            
            campaign = clean_value_for_sql(row['Campaign'])
            cost = float(row['Cost']) if pd.notna(row['Cost']) else 0.0
            
            sql_values.append(f"('{day_date}', {campaign}, {cost})")
            
        except Exception as e:
            logger.warning(f"Error processing row {index}: {e}")
            continue
    
    # Create SQL statement
    if sql_values:
        values_str = ',\n    '.join(sql_values[:100])  # First 100 records
        sql = f"""
INSERT INTO google_raw_data (day, campaign, cost) 
VALUES 
    {values_str};
"""
        
        # Save to file
        with open('/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/moi-analytics-dashboard/google_insert_batch1.sql', 'w') as f:
            f.write(sql)
        
        logger.info(f"Generated SQL file with {len(sql_values[:100])} records")
        print(f"Total records processed: {len(sql_values)}")
        print(f"Sample SQL (first 3 values):")
        print('\n    '.join(sql_values[:3]))

if __name__ == "__main__":
    main()