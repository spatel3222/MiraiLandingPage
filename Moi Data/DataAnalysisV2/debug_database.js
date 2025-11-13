const { supabase } = require('./lib/supabase.ts')

async function checkDatabaseData() {
  console.log('🔍 Debugging Database Data Status...\n')
  
  const tables = [
    { name: 'meta_import_data', platform: 'Meta' },
    { name: 'google_import_data', platform: 'Google' }, 
    { name: 'shopify_import_data', platform: 'Shopify' }
  ]
  
  for (const table of tables) {
    try {
      console.log(`📊 Checking ${table.platform} (${table.name})...`)
      
      // Check total row count
      const { count, error: countError } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: true })
      
      if (countError) {
        console.log(`❌ Error counting rows: ${countError.message}\n`)
        continue
      }
      
      console.log(`   Total rows: ${count}`)
      
      if (count > 0) {
        // Check date range
        const { data: dateRange, error: dateError } = await supabase
          .from(table.name)
          .select('Day')
          .order('Day', { ascending: true })
          .limit(1)
        
        const { data: latestDate, error: latestError } = await supabase
          .from(table.name)
          .select('Day')
          .order('Day', { ascending: false })
          .limit(1)
          
        if (!dateError && !latestError && dateRange[0] && latestDate[0]) {
          console.log(`   Date range: ${dateRange[0].Day} to ${latestDate[0].Day}`)
        }
        
        // Check sample columns
        const { data: sample, error: sampleError } = await supabase
          .from(table.name)
          .select('*')
          .limit(1)
          
        if (!sampleError && sample[0]) {
          console.log(`   Sample columns: ${Object.keys(sample[0]).join(', ')}`)
        }
        
        // Check specific dates
        const testDates = ['2025-11-09', '2025-11-10', '2025-11-11']
        for (const testDate of testDates) {
          const { count: dateCount, error: dateCountError } = await supabase
            .from(table.name)
            .select('*', { count: 'exact', head: true })
            .eq('Day', testDate)
            
          if (!dateCountError) {
            console.log(`   Rows for ${testDate}: ${dateCount}`)
          }
        }
      }
      
    } catch (error) {
      console.log(`❌ Error checking ${table.platform}: ${error.message}`)
    }
    
    console.log('') // Empty line between tables
  }
  
  console.log('🎯 Database check complete!')
}

checkDatabaseData().catch(console.error)