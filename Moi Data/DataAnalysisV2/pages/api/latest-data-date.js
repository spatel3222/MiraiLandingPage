import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('Fetching latest data dates from all platforms...')

    const platforms = [
      { name: 'meta', table: 'meta_import_data', dateColumn: 'Day' },
      { name: 'google', table: 'google_import_data', dateColumn: 'Day' },
      { name: 'shopify', table: 'shopify_import_data', dateColumn: 'Day' }
    ]

    const platformDates = {}
    const errors = []

    // Get latest date from each platform
    for (const platform of platforms) {
      try {
        console.log(`Querying latest date from ${platform.table}...`)

        const { data, error } = await supabase
          .from(platform.table)
          .select(platform.dateColumn)
          .order(platform.dateColumn, { ascending: false })
          .limit(1)

        if (error) {
          console.error(`Error querying ${platform.table}:`, error)
          errors.push(`${platform.name}: ${error.message}`)
          continue
        }

        if (data && data.length > 0) {
          platformDates[platform.name] = data[0][platform.dateColumn]
          console.log(`${platform.name} latest date: ${platformDates[platform.name]}`)
        } else {
          console.log(`No data found in ${platform.table}`)
          errors.push(`${platform.name}: No data found`)
        }

      } catch (platformError) {
        console.error(`Error processing ${platform.name}:`, platformError)
        errors.push(`${platform.name}: ${platformError.message}`)
      }
    }

    // Check if we have data from any platforms
    const validPlatformDates = Object.entries(platformDates)
      .filter(([platform, date]) => date !== null && date !== undefined)
    
    if (validPlatformDates.length === 0) {
      return res.status(500).json({
        error: 'No data available from any platform',
        details: errors,
        platformDates
      })
    }

    // Get unique dates from platforms that have data
    const availableDates = validPlatformDates.map(([platform, date]) => date)
    const uniqueDates = [...new Set(availableDates)]
    
    if (uniqueDates.length > 1) {
      console.error('Date mismatch across platforms with data:', platformDates)
      return res.status(400).json({
        error: 'Data sync issue: Platforms with data have different latest dates',
        platformDates,
        availableDates,
        details: 'All platforms with data should have the same latest date. Please check data ingestion process.'
      })
    }

    const latestDate = uniqueDates[0]
    const availablePlatforms = validPlatformDates.map(([platform, date]) => platform)
    const missingPlatforms = platforms
      .map(p => p.name)
      .filter(name => !platformDates[name])

    // Log warning if some platforms are missing data
    if (missingPlatforms.length > 0) {
      console.warn(`Warning: ${missingPlatforms.join(', ')} platform(s) have no data for ${latestDate}`)
    }

    console.log(`All platforms synchronized with latest date: ${latestDate}`)

    res.status(200).json({
      success: true,
      latestDate,
      platformDates,
      availablePlatforms,
      missingPlatforms,
      message: missingPlatforms.length > 0 
        ? `${availablePlatforms.length} platforms have data for ${latestDate}. Missing: ${missingPlatforms.join(', ')}`
        : `All ${availablePlatforms.length} platforms have data for ${latestDate}`
    })

  } catch (error) {
    console.error('Latest date fetch error:', error)
    res.status(500).json({
      error: 'Failed to fetch latest data dates',
      details: error.message
    })
  }
}