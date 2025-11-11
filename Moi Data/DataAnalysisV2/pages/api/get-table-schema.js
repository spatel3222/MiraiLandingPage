import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  const { table } = req.query
  
  if (!table) {
    return res.status(400).json({ error: 'Table name required' })
  }
  
  try {
    // Get table schema by querying with limit 0 to get column info
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1)
    
    if (error) {
      return res.status(500).json({ 
        error: `Table '${table}' not found or inaccessible: ${error.message}`,
        table 
      })
    }
    
    // Get column names from first row structure (even if no data)
    const { data: sampleData } = await supabase
      .from(table)
      .select('*')
      .limit(1)
      .single()
    
    // If we have sample data, get columns from it
    let columns = []
    if (sampleData) {
      columns = Object.keys(sampleData)
    } else {
      // If no data, try to insert empty object to discover required columns
      const { error: insertError } = await supabase
        .from(table)
        .insert({})
      
      if (insertError) {
        // Parse error message to extract column requirements
        const errorMsg = insertError.message
        
        // Look for column names in error messages
        const nullColumnMatches = errorMsg.match(/null value in column "([^"]+)"/g)
        const requiredColumns = nullColumnMatches 
          ? nullColumnMatches.map(match => match.match(/"([^"]+)"/)[1])
          : []
        
        // Look for "column does not exist" errors
        const invalidColumnMatches = errorMsg.match(/column "([^"]+)" of relation/g)
        const invalidColumns = invalidColumnMatches
          ? invalidColumnMatches.map(match => match.match(/"([^"]+)"/)[1])
          : []
        
        return res.status(200).json({
          table,
          columns: requiredColumns.length > 0 ? requiredColumns : ['unknown'],
          requiredColumns,
          invalidColumns,
          schemaSource: 'error_analysis',
          note: 'Schema discovered from validation errors'
        })
      }
    }
    
    return res.status(200).json({
      table,
      columns,
      schemaSource: 'direct_query',
      sampleDataExists: !!sampleData
    })
    
  } catch (error) {
    return res.status(500).json({ 
      error: error.message,
      table 
    })
  }
}