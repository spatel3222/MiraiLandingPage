import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  try {
    // Try to get schema information by doing a simple select
    const { data, error } = await supabase
      .from('google_import_data')
      .select('*')
      .limit(0) // Get 0 rows but get column info from error
    
    if (error) {
      return res.status(200).json({ error: error.message, details: error })
    }
    
    return res.status(200).json({ 
      message: 'Table exists',
      data: data 
    })
    
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}