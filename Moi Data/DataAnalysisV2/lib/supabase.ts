import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Platform = 'meta' | 'google' | 'shopify'

export const TABLE_NAMES: Record<Platform, string> = {
  meta: 'meta_import_data',
  google: 'google_import_data', 
  shopify: 'shopify_import_data'
}

export async function uploadCSVToSupabase(platform: Platform, file: File) {
  try {
    const text = await file.text()
    const Papa = (await import('papaparse')).default
    
    const { data: rows, errors } = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim()
    })

    if (errors.length > 0) {
      return {
        success: false,
        message: `CSV parsing failed: ${errors[0].message}`,
        insertedCount: 0
      }
    }

    const tableName = TABLE_NAMES[platform]
    
    // Transform rows for database insertion
    const transformedRows = rows.map((row: any) => {
      const transformed: any = {}
      
      // Platform-specific transformations - Map to EXACT database column names
      if (platform === 'google') {
        transformed.Day = row.Day
        transformed.Campaign = row.Campaign
        transformed['Currency code'] = row['Currency code'] || 'INR'
        transformed.Cost = parseFloat(row.Cost) || 0
        transformed['Avg. CPM'] = parseFloat(row['Avg. CPM']) || 0
        transformed.CTR = parseFloat(row.CTR?.replace('%', '')) || 0
      } else if (platform === 'meta') {
        transformed['Campaign name'] = row['Campaign name']
        transformed['Ad set name'] = row['Ad set name']
        transformed['Ad name'] = row['Ad name']
        transformed.Day = row.Day
        transformed['Amount spent (INR)'] = parseFloat(row['Amount spent (INR)']) || 0
        transformed['CPM (cost per 1,000 impressions)'] = parseFloat(row['CPM (cost per 1,000 impressions)']) || 0
        transformed['CTR (link click-through rate)'] = parseFloat(row['CTR (link click-through rate)']?.replace('%', '')) || 0
      } else if (platform === 'shopify') {
        transformed.Day = row.Day
        transformed['UTM campaign'] = row['UTM campaign']
        transformed['UTM term'] = row['UTM term']
        transformed['UTM content'] = row['UTM content']
        transformed['Landing page URL'] = row['Landing page URL']
        transformed['Online store visitors'] = parseInt(row['Online store visitors']) || 0
        transformed['Sessions that completed checkout'] = parseInt(row['Sessions that completed checkout']) || 0
        transformed['Sessions that reached checkout'] = parseInt(row['Sessions that reached checkout']) || 0
        transformed['Sessions with cart additions'] = parseInt(row['Sessions with cart additions']) || 0
        transformed['Average session duration'] = parseFloat(row['Average session duration']) || 0
        transformed.Pageviews = parseInt(row.Pageviews) || 0
      }
      
      return transformed
    })

    // Insert data in batches
    const BATCH_SIZE = 500
    let insertedCount = 0
    
    for (let i = 0; i < transformedRows.length; i += BATCH_SIZE) {
      const batch = transformedRows.slice(i, i + BATCH_SIZE)
      
      const { data, error } = await supabase
        .from(tableName)
        .insert(batch)
        .select()

      if (error) {
        console.error(`Batch insert error:`, error)
        return {
          success: false,
          message: `Database insert failed: ${error.message}`,
          insertedCount
        }
      }
      
      insertedCount += batch.length
    }

    return {
      success: true,
      message: `Successfully uploaded ${insertedCount} rows`,
      insertedCount,
      data: transformedRows
    }
    
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      insertedCount: 0
    }
  }
}