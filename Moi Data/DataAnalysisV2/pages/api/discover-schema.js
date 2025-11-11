import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  const { table } = req.query
  
  if (!table) {
    return res.status(400).json({ error: 'Table name required' })
  }
  
  try {
    // Try to insert an empty object to see what columns are expected
    const { data, error } = await supabase
      .from(table)
      .insert({})
      .select()
    
    if (error) {
      // Parse the error message to extract column information
      const errorMsg = error.message
      
      // Common Supabase error patterns for missing columns
      const columnMatches = errorMsg.match(/null value in column "([^"]+)"/g)
      const requiredColumns = columnMatches 
        ? columnMatches.map(match => match.match(/"([^"]+)"/)[1])
        : []
      
      return res.status(200).json({ 
        table,
        error: errorMsg,
        requiredColumns,
        discovery: 'partial'
      })
    }
    
    return res.status(200).json({ 
      table,
      message: 'Insert succeeded (unexpected)',
      data
    })
    
  } catch (error) {
    return res.status(500).json({ 
      error: error.message,
      table 
    })
  }
}