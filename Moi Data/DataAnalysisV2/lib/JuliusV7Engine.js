/**
 * Julius V7 Analytics Engine - Based on Proven Notebook Logic
 * Comprehensive marketing attribution and analytics processing
 * Uses exact logic from Julius V7 notebook with elastic date ranges
 */

export class JuliusV7Engine {
  constructor() {
    this.platforms = ['meta', 'google', 'shopify']
    // UTM Campaign matching rules from notebook
    this.campaignMappingRules = {
      'brand_search-14337891333': 'Branch Search',
      't1-pmax-rings-22753626610': 'T1 PMax Ring',
      'bof_yt_all_products-22942055261': 'BOF YT ALL',
      't1-pmax-earrings-22766100463': 'T1 PMax Earrings',
      't1-pmax-bracelets-22976580870': 'T1 PMax Bracelets'
    }
    // Global rate priors for Empirical Bayes (n0 = 50)
    this.n0 = 50.0
  }

  /**
   * Main processing pipeline following exact Julius V7 notebook logic
   */
  async processAnalytics(rawData, dateRange, platforms = ['meta', 'google', 'shopify']) {
    console.log('🚀 Starting Julius V7 Analytics Processing (Notebook Logic)...')
    
    try {
      // Step 1: Pre-Processing Validation (7.1)
      const validatedData = await this.preProcessingValidation(rawData, platforms, dateRange)
      console.log('✅ Pre-processing validation completed')
      
      // Step 2: Data Quality Validation (7.2)
      const cleanedData = await this.dataQualityValidation(validatedData)
      console.log('✅ Data quality validation completed')
      
      // Step 3: Data Harmonization with UTM normalization
      const harmonizedData = await this.harmonizeDataWithUTMMapping(cleanedData)
      console.log('✅ Data harmonization with UTM mapping completed')
      
      // Step 4: Attribution Logic (7.3) - Meta: Day+Campaign+AdSet+Ad, Google: Day+Campaign
      const attributedData = await this.applyAttributionWithValidation(harmonizedData)
      console.log('✅ Attribution logic with validation completed')
      
      // Step 5: Business Logic Validation (7.4) - Good leads definition
      const businessMetricsData = await this.calculateBusinessMetrics(attributedData.data)
      console.log('✅ Business logic validation completed')
      
      // Step 6: Empirical Bayes Shrinkage with exact notebook formula
      const shrunkData = await this.applyNotebookEmpiricalBayes(businessMetricsData)
      console.log('✅ Empirical Bayes shrinkage (notebook logic) applied')
      
      // Step 7: Scoring with exact notebook formula (0.4*efficiency + 0.4*quality + 0.2*volume)
      const scoredData = await this.generatePerformanceScores(shrunkData)
      console.log('✅ Performance scores (notebook logic) generated')
      
      // Step 8: Output Validation and Final CSVs (7.5-7.7)
      const validatedOutputs = await this.createAggregatedViews(scoredData, dateRange)
      console.log('✅ Output validation and CSV creation completed')
      
      return {
        success: true,
        outputs: validatedOutputs,
        validation: validatedOutputs.validation || {},
        summary: this.generateProcessingSummary(scoredData, dateRange)
      }
      
    } catch (error) {
      console.error('❌ Julius V7 Processing Error:', error)
      throw new Error(`Analytics processing failed: ${error.message}`)
    }
  }

  /**
   * Step 1: Pre-Processing Validation (Section 7.1 from notebook)
   */
  async preProcessingValidation(rawData, platforms, dateRange) {
    console.log('📋 Starting Pre-Processing Validation...')
    console.log('🔍 Raw data structure:', Object.keys(rawData || {}))
    console.log('🔍 Platforms to process:', platforms)
    
    // Enhanced debugging
    if (rawData) {
      Object.keys(rawData).forEach(platform => {
        const platformData = rawData[platform]
        console.log(`🔍 ${platform} detailed info:`, {
          exists: !!platformData,
          type: typeof platformData,
          isArray: Array.isArray(platformData),
          length: Array.isArray(platformData) ? platformData.length : 'N/A',
          firstRowSample: Array.isArray(platformData) && platformData.length > 0 ? Object.keys(platformData[0]).slice(0, 5) : 'No data'
        })
      })
    } else {
      console.log('🔍 rawData is null/undefined')
    }
    const validation = {
      fileIntegrity: {},
      schemaValidation: {},
      dateCoverage: {},
      totalRows: 0
    }
    
    const extractedData = {}
    
    for (const platform of platforms) {
      // File integrity checks
      if (!rawData[platform] || !Array.isArray(rawData[platform])) {
        validation.fileIntegrity[platform] = { present: false, readable: false, size: 0 }
        extractedData[platform] = []
        continue
      }
      
      const platformData = rawData[platform]
      console.log(`🔍 Debug ${platform} data type:`, typeof platformData, 'isArray:', Array.isArray(platformData), 'length:', platformData?.length)
      
      // Debug: Log first few rows
      if (Array.isArray(platformData) && platformData.length > 0) {
        console.log(`🔍 Debug ${platform} first row keys:`, Object.keys(platformData[0]))
        console.log(`🔍 Debug ${platform} first row sample:`, JSON.stringify(platformData[0]).substring(0, 200))
      }
      
      validation.fileIntegrity[platform] = { 
        present: true, 
        readable: true, 
        size: Array.isArray(platformData) ? platformData.length : 0
      }
      
      // Schema validation - check required columns with alternatives
      const requiredColumnSpecs = this.getRequiredColumnSpecs(platform)
      const actualColumns = platformData.length > 0 ? Object.keys(platformData[0]) : []
      console.log(`🔍 Debug ${platform} actual columns:`, JSON.stringify(actualColumns))
      
      const missingColumns = []
      const foundColumns = []
      
      requiredColumnSpecs.forEach(colSpec => {
        if (Array.isArray(colSpec)) {
          // Check alternatives [preferred, alternative]
          const found = colSpec.find(altCol => actualColumns.includes(altCol))
          if (found) {
            foundColumns.push(found)
          } else {
            missingColumns.push(colSpec[0]) // Use preferred name for error
          }
        } else {
          // Single required column
          if (actualColumns.includes(colSpec)) {
            foundColumns.push(colSpec)
          } else {
            missingColumns.push(colSpec)
          }
        }
      })
      
      console.log(`🔍 Debug ${platform} found columns:`, JSON.stringify(foundColumns))
      console.log(`🔍 Debug ${platform} missing columns:`, JSON.stringify(missingColumns))
      
      validation.schemaValidation[platform] = {
        requiredPresent: missingColumns.length === 0,
        missingColumns: missingColumns,
        columnCount: actualColumns.length
      }
      
      // Date range coverage check
      const dateField = platform === 'meta' ? 'Day' : 'Day'
      const dates = Array.isArray(platformData) ? platformData.map(row => row[dateField]).filter(Boolean) : []
      const uniqueDates = [...new Set(dates)]
      
      validation.dateCoverage[platform] = {
        minDate: dates.length > 0 ? Math.min(...dates.map(d => new Date(d))) : null,
        maxDate: dates.length > 0 ? Math.max(...dates.map(d => new Date(d))) : null,
        uniqueDays: uniqueDates.length,
        gaps: this.findDateGaps(uniqueDates.sort())
      }
      
      // Basic cleaning - remove rows with missing essential fields
      const cleanedData = Array.isArray(platformData) ? platformData.filter(row => {
        return row && row.Day && this.hasEssentialFields(row, platform)
      }) : []
      
      extractedData[platform] = cleanedData
      validation.totalRows += cleanedData.length
      
      console.log(`✅ ${platform}: ${cleanedData.length}/${platformData.length} rows passed validation`)
      
      // STOP condition from notebook
      if (missingColumns.length > 0) {
        throw new Error(`STOP: Schema validation failed for ${platform}. Missing columns: ${missingColumns.join(', ')}`)
      }
    }
    
    return { data: extractedData, validation }
  }

  /**
   * Get required columns for each platform from notebook specification
   */
  getRequiredColumnSpecs(platform) {
    // Support both API format and Facebook export format
    const requiredColumns = {
      meta: [
        'Day', 
        ['Campaign', 'Campaign name'], 
        ['Ad Set', 'Ad Set Name', 'Ad set name'], 
        ['Ad', 'Ad Name', 'Ad name'], 
        ['Spend', 'Amount spent (INR)'], 
        ['CPM', 'CPM (cost per 1,000 impressions)'], 
        ['CTR', 'CTR (link click-through rate)']
      ],
      google: [
        'Day', 
        'Campaign', 
        ['Spend', 'Cost'], 
        ['CPM', 'Avg. CPM'], 
        'CTR'
      ],
      shopify: [
        'Day', 
        ['UTM Campaign', 'UTM campaign'], 
        ['Sessions', 'Online store visitors'], 
        ['Orders', 'Sessions that completed checkout'], 
        ['ATC', 'Sessions with cart additions'], 
        'Average session duration', 
        'Pageviews'
      ]
    }
    
    return requiredColumns[platform] || []
  }

  getRequiredColumns(platform) {
    // Flatten column alternatives for backward compatibility
    const platformCols = this.getRequiredColumnSpecs(platform)
    const flatColumns = platformCols.map(col => Array.isArray(col) ? col[0] : col)
    return flatColumns
  }
  
  /**
   * Check if row has essential fields based on platform
   */
  hasEssentialFields(row, platform) {
    if (platform === 'meta') {
      const campaign = row['Campaign'] || row['Campaign name']
      const spend = row['Spend'] || row['Amount spent (INR)']
      return campaign && spend !== undefined
    } else if (platform === 'google') {
      const campaign = row['Campaign']
      const spend = row['Spend'] || row['Cost']
      return campaign && spend !== undefined
    } else if (platform === 'shopify') {
      const campaign = row['UTM Campaign'] || row['UTM campaign']
      const sessions = row['Sessions'] || row['Online store visitors']
      return campaign && sessions !== undefined
    }
    return true
  }
  
  /**
   * Find gaps in date sequences
   */
  findDateGaps(sortedDates) {
    const gaps = []
    for (let i = 1; i < sortedDates.length; i++) {
      const current = new Date(sortedDates[i])
      const previous = new Date(sortedDates[i-1])
      const daysDiff = Math.round((current - previous) / (1000 * 60 * 60 * 24))
      if (daysDiff > 1) {
        gaps.push({ from: sortedDates[i-1], to: sortedDates[i], days: daysDiff - 1 })
      }
    }
    return gaps
  }

  /**
   * Step 2: Data Quality Validation (Section 7.2 from notebook)
   */
  async dataQualityValidation(validatedData) {
    console.log('📋 Starting Data Quality Validation...')
    const { data: extractedData, validation: preValidation } = validatedData
    const qualityReport = {
      numericBounds: {},
      dateTimeValidation: {},
      textDataValidation: {},
      outliers: {},
      cleanedRows: 0,
      totalRows: 0
    }
    
    const cleanedData = {}
    
    for (const [platform, data] of Object.entries(extractedData)) {
      if (!data || data.length === 0) {
        cleanedData[platform] = []
        continue
      }
      
      console.log(`🧹 Applying quality validation to ${data.length} rows in ${platform}...`)
      
      const platformCleaned = Array.isArray(data) ? data.map(row => {
        const cleanedRow = { ...row }
        
        // Numeric bounds validation
        if (platform === 'meta' || platform === 'google') {
          const spendField = 'Spend'
          cleanedRow[spendField] = this.validateNumericBounds(row[spendField], { min: 0, max: 1000000 })
          
          const ctrField = 'CTR'
          if (row[ctrField] !== undefined) {
            // CTR should be 0-100% for display, 0-1 for calculation
            const ctrValue = this.parseNumeric(row[ctrField])
            cleanedRow[ctrField] = this.validateNumericBounds(ctrValue, { min: 0, max: 100 })
          }
          
          const cpmField = 'CPM'
          if (row[cpmField] !== undefined) {
            cleanedRow[cpmField] = this.validateNumericBounds(row[cpmField], { min: 0, max: 10000 })
          }
        }
        
        if (platform === 'shopify') {
          cleanedRow['Online store visitors'] = this.validateNumericBounds(row['Online store visitors'], { min: 0, max: 1000000 })
          cleanedRow['Pageviews'] = this.validateNumericBounds(row['Pageviews'], { min: 0, max: 10000000 })
          cleanedRow['Average session duration'] = this.validateNumericBounds(row['Average session duration'], { min: 0, max: 86400 }) // 24 hours max
          
          // Logical validation: Visitors >= Checkouts
          const visitors = this.parseNumeric(cleanedRow['Online store visitors'])
          const checkouts = this.parseNumeric(row['Sessions that completed checkout'])
          if (checkouts > visitors) {
            console.warn(`⚠️ Impossible value: Checkouts (${checkouts}) > Visitors (${visitors}) on ${row.Day}`)
            cleanedRow['Sessions that completed checkout'] = Math.min(checkouts, visitors)
          }
        }
        
        // Date/time validation
        cleanedRow.Day = this.validateAndNormalizeDate(row.Day)
        
        // Text data validation and cleaning
        if (platform === 'meta') {
          cleanedRow['Campaign'] = this.validateAndCleanText(row['Campaign'])
          cleanedRow['Ad Set'] = this.validateAndCleanText(row['Ad Set'])
          cleanedRow['Ad'] = this.validateAndCleanText(row['Ad'])
        } else if (platform === 'google') {
          cleanedRow['Campaign'] = this.validateAndCleanText(row['Campaign'])
        } else if (platform === 'shopify') {
          cleanedRow['UTM campaign'] = this.validateAndCleanText(row['UTM campaign'])
          cleanedRow['UTM term'] = this.validateAndCleanText(row['UTM term'])
          cleanedRow['UTM content'] = this.validateAndCleanText(row['UTM content'])
        }
        
        return cleanedRow
      }).filter(row => row.Day) : [] // Remove rows with invalid dates
      
      cleanedData[platform] = platformCleaned
      qualityReport.cleanedRows += platformCleaned.length
      qualityReport.totalRows += data.length
      
      console.log(`✅ ${platform}: ${platformCleaned.length}/${data.length} rows passed quality validation`)
    }
    
    return { data: cleanedData, validation: { ...preValidation, quality: qualityReport } }
  }
  
  /**
   * Step 3: Harmonize data across platforms (normalize field names, formats)
   */
  async harmonizeDataWithUTMMapping(validatedData) {
    const { data: extractedData, validation } = validatedData
    const harmonizedData = {}
    
    for (const [platform, data] of Object.entries(extractedData)) {
      if (!data || data.length === 0) {
        harmonizedData[platform] = []
        continue
      }
      
      const harmonized = Array.isArray(data) ? data.map(row => {
        let harmonizedRow = { ...row }
        
        // Normalize date format
        harmonizedRow.Day = this.normalizeDate(row.Day)
        
        // Platform-specific field mapping
        if (platform === 'meta') {
          harmonizedRow = this.harmonizeMetaFields(harmonizedRow)
        } else if (platform === 'google') {
          harmonizedRow = this.harmonizeGoogleFields(harmonizedRow)
        } else if (platform === 'shopify') {
          harmonizedRow = this.harmonizeShopifyFields(harmonizedRow)
        }
        
        // Apply UTM campaign mapping from notebook
        if (platform === 'shopify' && harmonizedRow.Campaign) {
          harmonizedRow.CampaignMapped = this.mapUTMCampaign(harmonizedRow.Campaign)
        }
        
        // Normalize campaign names for cross-platform matching
        harmonizedRow.CampaignNormalized = this.normalizeCampaignName(harmonizedRow.Campaign || harmonizedRow.CampaignMapped || '')
        
        return harmonizedRow
      }) : []
      
      harmonizedData[platform] = harmonized
      console.log(`🔄 Harmonized ${harmonized.length} rows for ${platform}`)
    }
    
    return { data: harmonizedData, validation }
  }

  /**
   * Harmonize Meta-specific fields
   */
  harmonizeMetaFields(row) {
    const harmonized = { ...row }
    
    // Map Meta field names to standard names based on actual API data structure
    const fieldMap = {
      // API data already uses correct names (Campaign, Ad Set, Ad, Spend, CPM, CTR)
      // Only map alternative field names that might appear
      'Link clicks': 'Clicks',
      'Cost per link click (USD)': 'CPC',
      'Adset name': 'Ad Set'  // Alternative name for Ad Set
    }
    
    Object.entries(fieldMap).forEach(([originalField, standardField]) => {
      if (row[originalField] !== undefined) {
        harmonized[standardField] = row[originalField]
      }
    })
    
    // Calculate missing fields from available data
    if (harmonized.CTR && !harmonized.Clicks && !harmonized.Impressions) {
      // If we only have CTR, we need to estimate clicks and impressions
      // This is a limitation when Meta doesn't provide raw numbers
      harmonized.CTR = this.parseNumeric(harmonized.CTR) / 100 // Convert percentage to decimal
    }
    
    // Ensure numeric fields are numbers
    const numericFields = ['Spend', 'Impressions', 'Clicks', 'CPC', 'CPM', 'CTR']
    numericFields.forEach(field => {
      if (harmonized[field] !== undefined) {
        harmonized[field] = this.parseNumeric(harmonized[field])
      }
    })
    
    return harmonized
  }

  /**
   * Harmonize Google-specific fields  
   */
  harmonizeGoogleFields(row) {
    const harmonized = { ...row }
    
    // Map Google field names based on actual data structure
    const fieldMap = {
      'Cost': 'Spend',
      'Impr.': 'Impressions',
      'Avg. CPM': 'CPM'
    }
    
    Object.entries(fieldMap).forEach(([originalField, standardField]) => {
      if (row[originalField] !== undefined) {
        harmonized[standardField] = row[originalField]
      }
    })
    
    // Handle CTR percentage format
    if (harmonized.CTR && typeof harmonized.CTR === 'string' && harmonized.CTR.includes('%')) {
      harmonized.CTR = this.parseNumeric(harmonized.CTR.replace('%', '')) / 100
    }
    
    // Parse numeric fields
    const numericFields = ['Spend', 'Impressions', 'Clicks', 'CPM', 'CTR']
    numericFields.forEach(field => {
      if (harmonized[field] !== undefined) {
        harmonized[field] = this.parseNumeric(harmonized[field])
      }
    })
    
    return harmonized
  }

  /**
   * Harmonize Shopify-specific fields
   */
  harmonizeShopifyFields(row) {
    // Start with ALL original fields - don't filter anything out
    const harmonized = { ...row }
    
    // Add standardized field mappings for compatibility, but keep originals
    const fieldMap = {
      'UTM campaign': 'Campaign name',    // UTM campaign → Campaign name
      'UTM term': 'Ad set name',          // UTM term → Ad set name  
      'UTM content': 'Ad name',           // UTM content → Ad name
      'Online store visitors': 'Sessions',
      'Sessions that completed checkout': 'Orders',
      'Sessions that reached checkout': 'CheckoutSessions',
      'Sessions with cart additions': 'CartSessions',
      'Average session duration': 'SessionDuration',
      'Pageviews': 'Pageviews'
    }
    
    // Add mapped fields WITHOUT removing originals
    Object.entries(fieldMap).forEach(([originalField, standardField]) => {
      if (row[originalField] !== undefined) {
        harmonized[standardField] = row[originalField]
        // Keep the original field name too
        harmonized[originalField] = row[originalField]
      }
    })
    
    // Calculate derived metrics
    if (harmonized.Orders && harmonized.Sessions) {
      harmonized.ConversionRate = harmonized.Sessions > 0 ? (harmonized.Orders / harmonized.Sessions) : 0
    }
    
    // Calculate good leads based on session quality
    if (harmonized.SessionDuration && harmonized.Pageviews) {
      // Good leads: Sessions with duration ≥60s AND pageviews ≥5
      harmonized.GoodLeads = (harmonized.SessionDuration >= 60 && harmonized.Pageviews >= 5) ? 1 : 0
    }
    
    // Parse ALL numeric fields (both original and mapped)
    const numericFields = [
      'Sessions', 'Orders', 'CheckoutSessions', 'CartSessions', 'SessionDuration', 'Pageviews', 'ConversionRate', 'GoodLeads',
      'Online store visitors', 'Sessions that completed checkout', 'Sessions that reached checkout', 
      'Sessions with cart additions', 'Average session duration', 'Pageviews'
    ]
    numericFields.forEach(field => {
      if (harmonized[field] !== undefined) {
        harmonized[field] = this.parseNumeric(harmonized[field])
      }
    })
    
    return harmonized
  }

  /**
   * Step 3-4: Harmonization & Attribution (Exact notebook logic)
   */
  async applyAttributionWithValidation(validatedData) {
    const { data: harmonizedData, validation } = validatedData
    console.log('🔄 Starting Harmonization & Attribution (Notebook Logic)...')
    
    // STEP 1: Harmonization & UTM prep (from notebook cell e5c2a293)
    let meta = harmonizedData.meta || []
    let google = harmonizedData.google || []
    let shop = harmonizedData.shopify || []
    
    console.log(`📊 Input data: Meta=${meta.length}, Google=${google.length}, Shopify=${shop.length}`)
    
    // Ensure datetime and CTR normalization (from notebook)
    meta = meta.map(row => ({
      ...row,
      Day: row.Day || row.Date,
      ctr_decimal: (this.parseNumeric(row['CTR']) || this.parseNumeric(row['CTR (link click-through rate)'])) / 100 || 0, // CRITICAL FIX: Add Meta CTR mapping
      cpm: this.parseNumeric(row['CPM']) || this.parseNumeric(row['CPM (cost per 1,000 impressions)']) || 0, // CRITICAL FIX: Add Meta CPM mapping
      amount_spent_inr: this.parseNumeric(row['Spend']) || this.parseNumeric(row['Amount spent (INR)']) || this.parseNumeric(row['Amount spent']) || 0,
      campaign_name: row['Campaign name'] || row['Campaign'],
      ad_set_name: row['Ad set name'] || row['Ad Set Name'],
      ad_name: row['Ad name'] || row['Ad Name'],
      ad_set_delivery: row['Delivery'] || 'Active'
    }))
    
    google = google.map(row => ({
      ...row,
      Day: row.Day || row.Date,
      ctr_decimal: this.parseNumeric(String(row['CTR'] || '').replace('%', '')) / 100 || 0,
      cpm: this.parseNumeric(row['Avg. CPM']) || 0,
      Campaign: row['Campaign'] || row['Campaign name'],
      Cost: this.parseNumeric(row['Cost']) || this.parseNumeric(row['Spend']) || 0
    }))
    
    // Shopify harmonization with derived flags (from notebook)
    shop = shop.map(row => {
      const visitors = this.parseNumeric(row['Online store visitors']) || 0
      const pageviews = this.parseNumeric(row['Page views']) || this.parseNumeric(row['Pageviews']) || 0 // CRITICAL FIX: Handle both field names
      const atc = this.parseNumeric(row['Sessions with cart additions']) || 0
      const reached_checkout = this.parseNumeric(row['Sessions reached checkout']) || 0
      const completed_checkout = this.parseNumeric(row['Sessions that completed checkout']) || 0
      const avg_duration = this.parseNumeric(row['Average session duration']) || 0
      
      // Derive flags and proxy counts (EXACT notebook logic)
      const long_session_flag = avg_duration >= 60 ? 1 : 0
      const deep_views_flag = pageviews >= 5 ? 1 : 0
      const gl_flag = (long_session_flag === 1 && deep_views_flag === 1) ? 1 : 0
      
      // Proxy counts
      const users_1min = visitors * long_session_flag
      const users_5pv_1min = visitors * gl_flag
      const atc_1min = atc * long_session_flag
      const reached_1min = reached_checkout * long_session_flag
      
      // Flag templated UTMs (from notebook)
      const utm_campaign = String(row['UTM campaign'] || '')
      const utm_term = String(row['UTM term'] || '')
      const utm_content = String(row['UTM content'] || '')
      const is_templated = utm_campaign.includes('{{') || utm_term.includes('{{') || utm_content.includes('{{') ? 1 : 0
      
      return {
        ...row,
        Day: row.Day || row.Date,
        utm_campaign,
        utm_term,
        utm_content,
        visitors,
        pageviews,
        atc,
        reached_checkout,
        completed_checkout,
        avg_session_duration: avg_duration,
        long_session_flag,
        deep_views_flag,
        gl_flag,
        users_1min,
        users_5pv_1min,
        atc_1min,
        reached_1min,
        is_templated
      }
    })
    
    // STEP 2: Attribution (from notebook cells 9638f822 & b517ba44)
    // Filter out templated UTMs from attribution
    const shop_attr = shop.filter(row => row.is_templated === 0)
    console.log(`📊 Filtered Shopify for attribution: ${shop_attr.length} (removed ${shop.length - shop_attr.length} templated)`)
    
    // Aggregate Shopify BEFORE joining (CRITICAL - this was missing)
    const shop_meta_keys = ['Day', 'utm_campaign', 'utm_term', 'utm_content']
    const shop_metrics = ['visitors', 'pageviews', 'avg_session_duration', 'atc', 'reached_checkout', 'completed_checkout', 'users_1min', 'users_5pv_1min', 'atc_1min', 'reached_1min']
    
    const shop_meta_agg = this.groupByAndSum(shop_attr, shop_meta_keys, shop_metrics)
    
    const shop_google_keys = ['Day', 'utm_campaign']
    const shop_google_agg = this.groupByAndSum(shop_attr, shop_google_keys, shop_metrics)
    
    console.log(`📊 Shopify aggregated: Meta=${shop_meta_agg.length}, Google=${shop_google_agg.length}`)
    
    // STEP 3: Join aggregated Shopify to Meta/Google (from notebook)
    // Meta join
    const meta_eval = this.joinMetaShopify(meta, shop_meta_agg)
    
    // Google join (aggregate Google to campaign-day first to avoid duplicating Shopify metrics)
    const google_day_agg = this.groupByAndSum(google, ['Day', 'Campaign'], ['Cost', 'ctr_decimal', 'cpm'])
    const google_eval = this.joinGoogleShopify(google_day_agg, shop_google_agg)
    
    // Stack unified attribution
    const unified_attr = [...meta_eval, ...google_eval]
    
    console.log(`📊 Final attribution: Meta=${meta_eval.length}, Google=${google_eval.length}, Total=${unified_attr.length}`)
    
    return {
      data: {
        meta: meta_eval,
        google: google_eval, 
        unified_attr,
        shop_raw: shop,
        shop_attributed: shop_attr
      },
      validation: {
        ...validation,
        attribution: {
          meta_rows: meta_eval.length,
          google_rows: google_eval.length,
          total_attributed: unified_attr.length
        }
      }
    }
  }

  /**
   * Aggregate metrics for attribution groups
   */
  aggregateMetrics(rows, platform) {
    const metrics = {
      Spend: 0,
      Impressions: 0,
      Clicks: 0,
      Sessions: 0,
      Orders: 0,
      Revenue: 0
    }
    
    rows.forEach(row => {
      metrics.Spend += this.parseNumeric(row.Spend)
      metrics.Impressions += this.parseNumeric(row.Impressions)
      metrics.Clicks += this.parseNumeric(row.Clicks)
      
      if (platform === 'shopify') {
        metrics.Sessions += this.parseNumeric(row.Sessions)
        metrics.Orders += this.parseNumeric(row.Orders)
        metrics.Revenue += this.parseNumeric(row.Revenue)
      }
    })
    
    // Calculate derived metrics
    metrics.CTR = metrics.Impressions > 0 ? (metrics.Clicks / metrics.Impressions) : 0
    metrics.CPM = metrics.Impressions > 0 ? (metrics.Spend / metrics.Impressions * 1000) : 0
    metrics.CPC = metrics.Clicks > 0 ? (metrics.Spend / metrics.Clicks) : 0
    
    if (platform === 'shopify') {
      metrics.ConversionRate = metrics.Sessions > 0 ? (metrics.Orders / metrics.Sessions) : 0
      metrics.AOV = metrics.Orders > 0 ? (metrics.Revenue / metrics.Orders) : 0
    }
    
    return metrics
  }

  /**
   * Step 4: Calculate business metrics (good leads, cost-per metrics)
   */
  async calculateBusinessMetrics(attributedData) {
    const businessMetricsData = {}
    
    for (const [platform, data] of Object.entries(attributedData)) {
      // Enhanced data validation with debugging
      if (!data) {
        console.log(`🔍 Debug: ${platform} data is null/undefined`)
        businessMetricsData[platform] = []
        continue
      }
      
      if (!Array.isArray(data)) {
        console.log(`🔍 Debug: ${platform} data is not array, type:`, typeof data)
        console.log(`🔍 Debug: ${platform} data content:`, JSON.stringify(data).substring(0, 200))
        businessMetricsData[platform] = []
        continue
      }
      
      if (data.length === 0) {
        console.log(`🔍 Debug: ${platform} data array is empty`)
        businessMetricsData[platform] = []
        continue
      }
      
      const enrichedData = data.map(row => {
        const businessMetrics = { ...row }
        
        // Calculate Julius V7 session analytics metrics
        if (platform === 'shopify') {
          // Good Leads: Duration ≥60s AND Pageviews ≥5 (Julius V7 definition)
          businessMetrics.GoodLeads = this.estimateGoodLeads(row)
          businessMetrics.GoodLeadRate = businessMetrics.Sessions > 0 
            ? (businessMetrics.GoodLeads / businessMetrics.Sessions) 
            : 0
          
          // Session analytics as per Julius V7 specifications
          businessMetrics.AddToCarts = row['Add to cart'] || row.AddToCarts || 0
          businessMetrics.ReachedCheckout = row['Reached checkout'] || row.ReachedCheckout || 0
          businessMetrics.AbandonedCheckout = businessMetrics.ReachedCheckout - (businessMetrics.Orders || 0)
          businessMetrics.AvgSessionDuration = row['Average session duration'] || 0 // NO synthetic data
          
          // 1-minute+ user metrics - ONLY use real data
          businessMetrics.UsersAbove1Min = row['Users with Session above 1 min'] || 0
          businessMetrics.OneMinUserPercentage = businessMetrics.Sessions > 0 
            ? (businessMetrics.UsersAbove1Min / businessMetrics.Sessions * 100) 
            : 0
          
          // Qualified engagement metrics - ONLY use real data
          businessMetrics.QualifiedUsers = row['Users with Above 5 page views and above 1 min'] || 0
          businessMetrics.QualifiedATCs = row['ATC with session duration above 1 min'] || 0
          businessMetrics.QualifiedCheckouts = row['Reached Checkout with session duration above 1 min'] || 0
          
          // Cost per engagement metrics
          businessMetrics.CostPer1MinUser = businessMetrics.UsersAbove1Min > 0 
            ? (businessMetrics.Spend / businessMetrics.UsersAbove1Min) 
            : 0
        }
        
        // Enhanced cost metrics for Julius V7
        businessMetrics.CostPerUser = businessMetrics.Sessions > 0 
          ? (businessMetrics.Spend / businessMetrics.Sessions) 
          : 0
        businessMetrics.CostPerOrder = businessMetrics.Orders > 0 
          ? (businessMetrics.Spend / businessMetrics.Orders) 
          : 0
        
        if (businessMetrics.GoodLeads > 0) {
          businessMetrics.CostPerGoodLead = businessMetrics.Spend / businessMetrics.GoodLeads
        }
        
        // For Meta/Google platforms - ONLY use real data, no synthetic estimates
        if (platform === 'meta' || platform === 'google') {
          // Use actual data from row if available, otherwise 0 (no synthetic data)
          businessMetrics.AddToCarts = row['ATC'] || 0
          businessMetrics.ReachedCheckout = row['Reached Checkout'] || 0
          businessMetrics.Conversions = row['Conversions'] || 0
          businessMetrics.AvgSessionDuration = row['Average Session Duration'] || 0
          businessMetrics.UsersAbove1Min = row['Users with Session above 1 min'] || 0
          businessMetrics.OneMinUserPercentage = businessMetrics.Sessions > 0 && businessMetrics.UsersAbove1Min > 0
            ? (businessMetrics.UsersAbove1Min / businessMetrics.Sessions * 100) 
            : 0
          businessMetrics.QualifiedUsers = row['Users with Above 5 page views and above 1 min'] || 0
          businessMetrics.QualifiedATCs = row['ATC with session duration above 1 min'] || 0
          businessMetrics.QualifiedCheckouts = row['Reached Checkout with session duration above 1 min'] || 0
          businessMetrics.CostPer1MinUser = businessMetrics.UsersAbove1Min > 0 
            ? (businessMetrics.Spend / businessMetrics.UsersAbove1Min) 
            : 0
        }
        
        // ROAS calculation
        if (businessMetrics.Revenue && businessMetrics.Spend > 0) {
          businessMetrics.ROAS = businessMetrics.Revenue / businessMetrics.Spend
        }
        
        return businessMetrics
      })
      
      businessMetricsData[platform] = enrichedData
      console.log(`💼 Calculated business metrics for ${enrichedData.length} groups in ${platform}`)
    }
    
    return businessMetricsData
  }

  /**
   * Calculate good leads using exact notebook logic: Sessions ≥60s AND Pageviews ≥5
   */
  estimateGoodLeads(row) {
    // Exact notebook definition: Good leads = Sessions with duration ≥60s AND pageviews ≥5
    if (row.SessionDuration !== undefined && row.Pageviews !== undefined) {
      // Direct calculation from individual session data
      const avgDuration = this.parseSessionDuration(row.SessionDuration)
      const avgPageviews = row.Pageviews
      
      if (avgDuration >= 60 && avgPageviews >= 5) {
        return row.Sessions || 0 // All sessions qualify as good leads
      }
      return 0
    }
    
    // NO SYNTHETIC DATA - Use only real data from Julius V7 columns
    // Use existing Julius V7 column: 'Users with Above 5 page views and above 1 min'
    return row['Users with Above 5 page views and above 1 min'] || 0
  }

  /**
   * Parse session duration from various formats (00:02:30, 150, etc.)
   */
  parseSessionDuration(duration) {
    if (typeof duration === 'number') {
      return duration // Already in seconds
    }
    
    if (typeof duration === 'string') {
      // Handle format like "00:02:30" (HH:MM:SS)
      if (duration.includes(':')) {
        const parts = duration.split(':')
        if (parts.length === 3) {
          const hours = parseInt(parts[0]) || 0
          const minutes = parseInt(parts[1]) || 0
          const seconds = parseInt(parts[2]) || 0
          return hours * 3600 + minutes * 60 + seconds
        }
      }
      
      // Try parsing as number string
      const numericValue = parseFloat(duration)
      if (!isNaN(numericValue)) {
        return numericValue
      }
    }
    
    return 0 // Default to 0 if unparseable
  }

  /**
   * Step 5: Apply Empirical Bayes shrinkage for statistical validation
   */
  async applyEmpiricalBayesShrinkage(businessMetricsData) {
    const shrunkData = {}
    
    for (const [platform, data] of Object.entries(businessMetricsData)) {
      if (!data || data.length === 0) {
        shrunkData[platform] = []
        continue
      }
      
      // Apply shrinkage to key metrics prone to small sample bias
      const shrinkageMetrics = ['CTR', 'ConversionRate', 'CPC', 'CostPerOrder']
      
      shrunkData[platform] = Array.isArray(data) ? data.map(row => {
        const shrunkRow = { ...row }
        
        shrinkageMetrics.forEach(metric => {
          if (row[metric] !== undefined && row[metric] !== null) {
            const shrunkValue = this.applyShrinkage(
              row[metric], 
              row.Impressions || row.Sessions || 1,
              platform,
              metric
            )
            
            shrunkRow[`${metric}_Shrunk`] = shrunkValue
            shrunkRow[`${metric}_ShrinkageApplied`] = Math.abs(shrunkValue - row[metric]) > 0.001
          }
        })
        
        return shrunkRow
      }) : []
      
      console.log(`📊 Applied Empirical Bayes shrinkage to ${data?.length || 0} groups in ${platform}`)
    }
    
    return shrunkData
  }

  /**
   * Apply shrinkage to individual metric
   */
  applyShrinkage(observedValue, sampleSize, platform, metric) {
    // Calculate population prior (global average for this metric)
    const priorMean = this.getPriorMean(platform, metric)
    const priorStrength = 100 // Adjust based on confidence in prior
    
    // Calculate shrinkage factor
    const shrinkageFactor = sampleSize / (sampleSize + priorStrength)
    
    // Apply shrinkage: shrunk_value = shrinkage_factor * observed + (1 - shrinkage_factor) * prior
    return shrinkageFactor * observedValue + (1 - shrinkageFactor) * priorMean
  }

  /**
   * Get prior mean values for shrinkage
   */
  getPriorMean(platform, metric) {
    const priors = {
      meta: {
        CTR: 0.012,
        ConversionRate: 0.05,
        CPC: 2.5,
        CostPerOrder: 50
      },
      google: {
        CTR: 0.02,
        ConversionRate: 0.03,
        CPC: 1.8,
        CostPerOrder: 60
      },
      shopify: {
        ConversionRate: 0.025,
        CostPerOrder: 45
      }
    }
    
    return priors[platform]?.[metric] || 0.01
  }

  /**
   * Apply Empirical Bayes shrinkage using exact notebook formula (n0 = 50)
   */
  async applyNotebookEmpiricalBayes(businessMetricsData) {
    const n0 = 50 // Pseudo-count from notebook
    const shrunkData = {}
    
    for (const [platform, data] of Object.entries(businessMetricsData)) {
      if (!data || data.length === 0) {
        shrunkData[platform] = []
        continue
      }
      
      // Calculate global priors for each metric from all data
      const globalPriors = this.calculateGlobalPriors(data)
      
      const shrunkRows = Array.isArray(data) ? data.map(row => {
        const shrunkRow = { ...row }
        
        // Apply Empirical Bayes to key metrics
        const metricsToShrink = ['CTR', 'ConversionRate']
        
        metricsToShrink.forEach(metric => {
          if (row[metric] !== undefined && row.Impressions) {
            // Empirical Bayes formula: (n * observed + n0 * prior) / (n + n0)
            const observed = row[metric]
            const sampleSize = row.Impressions || row.Sessions || 1
            const prior = globalPriors[metric] || this.getPriorMean(platform, metric)
            
            shrunkRow[`${metric}_Shrunk`] = (sampleSize * observed + n0 * prior) / (sampleSize + n0)
            shrunkRow[`${metric}_ShrinkageApplied`] = Math.abs(shrunkRow[`${metric}_Shrunk`] - observed) > 0.001
          }
        })
        
        return shrunkRow
      }) : []
      
      shrunkData[platform] = shrunkRows
      console.log(`🎯 Applied notebook Empirical Bayes (n0=${n0}) to ${shrunkRows.length} groups in ${platform}`)
    }
    
    return shrunkData
  }

  /**
   * Calculate global priors from data for Empirical Bayes
   */
  calculateGlobalPriors(data) {
    if (!data || data.length === 0) return {}
    
    const priors = {}
    const metrics = ['CTR', 'ConversionRate']
    
    metrics.forEach(metric => {
      const validValues = Array.isArray(data) ? data
        .filter(row => row[metric] !== undefined && !isNaN(row[metric]))
        .map(row => row[metric]) : []
      
      if (validValues.length > 0) {
        priors[metric] = validValues.reduce((sum, val) => sum + val, 0) / validValues.length
      }
    })
    
    return priors
  }

  /**
   * Step 6: Generate performance scores
   */
  async generatePerformanceScores(shrunkData) {
    const scoredData = {}
    
    for (const [platform, data] of Object.entries(shrunkData)) {
      if (!data || data.length === 0) {
        scoredData[platform] = []
        continue
      }
      
      const scoredRows = Array.isArray(data) ? data.map(row => {
        const scores = this.calculatePerformanceScores(row, platform)
        return {
          ...row,
          ...scores,
          Recommendation: this.generateRecommendation(scores.OverallScore)
        }
      }) : []
      
      scoredData[platform] = scoredRows
      console.log(`⭐ Generated performance scores for ${scoredRows.length} groups in ${platform}`)
    }
    
    return scoredData
  }

  /**
   * Calculate efficiency, quality, and volume scores
   */
  calculatePerformanceScores(row, platform) {
    // Efficiency Score (40%): Cost efficiency metrics
    let efficiencyScore = 0
    if (platform === 'shopify' && row.CostPerOrder) {
      efficiencyScore = Math.max(0, Math.min(1, 1 - (row.CostPerOrder - 20) / 100))
    } else if (row.CPC) {
      efficiencyScore = Math.max(0, Math.min(1, 1 - (row.CPC - 0.5) / 5))
    }
    
    // Quality Score (40%): Engagement and conversion metrics
    let qualityScore = 0
    if (row.CTR_Shrunk !== undefined) {
      qualityScore += Math.min(1, row.CTR_Shrunk / 0.05) * 0.5
    }
    if (row.ConversionRate_Shrunk !== undefined) {
      qualityScore += Math.min(1, row.ConversionRate_Shrunk / 0.1) * 0.5
    }
    
    // Volume Score (20%): Scale and reach metrics  
    let volumeScore = 0
    if (row.Impressions) {
      volumeScore = Math.min(1, row.Impressions / 100000)
    }
    if (row.Sessions) {
      volumeScore = Math.max(volumeScore, Math.min(1, row.Sessions / 10000))
    }
    
    // Overall weighted score
    const overallScore = efficiencyScore * 0.4 + qualityScore * 0.4 + volumeScore * 0.2
    
    return {
      EfficiencyScore: Math.round(efficiencyScore * 100) / 100,
      QualityScore: Math.round(qualityScore * 100) / 100,
      VolumeScore: Math.round(volumeScore * 100) / 100,
      OverallScore: Math.round(overallScore * 100) / 100
    }
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendation(overallScore) {
    if (overallScore >= 0.90) return 'Scale'
    if (overallScore >= 0.80) return 'Test-to-Scale'
    if (overallScore >= 0.70) return 'Optimize'
    return 'Pause/Fix'
  }

  /**
   * Step 5: Generate Output Tables (exact notebook logic from cell c8bfdf9f)
   */
  async createAggregatedViews(attributedData, dateRange) {
    console.log('📋 Creating output tables from unified attribution...')
    
    const ua = attributedData.unified_attr || []
    const shopifyOriginal = attributedData.shop_attributed || [] // Original Shopify data before duplication
    
    if (!ua || ua.length === 0) {
      console.log('⚠️ No unified attribution data available')
      return {
        topLevel: [],
        adSetLevel: [],
        adLevel: []
      }
    }
    
    console.log(`📊 Processing ${ua.length} unified attribution rows`)
    console.log(`📊 Original Shopify rows: ${shopifyOriginal.length}`)
    
    const outputs = {
      topLevel: this.createTopMetricsTable(ua, shopifyOriginal), // Pass original Shopify data
      adSetLevel: this.createAdSetMetricsTable(ua),
      adLevel: this.createAdLevelMetricsTable(ua)
    }
    
    return outputs
  }

  /**
   * Create top-level daily summary
   */
  async createTopLevelSummary(scoredData, dateRange) {
    const summary = []
    const dates = this.getDateRange(dateRange.startDate, dateRange.endDate)
    
    dates.forEach(date => {
      // Top Metrics as per Julius V7 specifications
      const dayData = {
        Date: date,
        'Meta Spend': 0,
        'Meta CTR': 0,
        'Meta CPM': 0,
        'Google Spend': 0,
        'Google CTR': 0,
        'Google CPM': 0,
        'Shopify Total Users': 0,
        'Shopify Total ATC': 0,
        'Shopify Total Reached Checkout': 0,
        'Shopify Total Abandoned Checkout': 0,
        'Shopify Session Duration': 0,
        'Users with Session above 1 min': 0,
        'Users with Above 5 page views and above 1 min': 0,
        'ATC with session duration above 1 min': 0,
        'Reached Checkout with session duration above 1 min': 0
      }
      
      // Aggregate platform data for this date
      this.platforms.forEach(platform => {
        if (scoredData[platform]) {
          const platformDayData = scoredData[platform].filter(row => row.Day === date)
          const platformAgg = this.aggregatePlatformDay(platformDayData)
          
          if (platform === 'meta') {
            dayData['Meta Spend'] = platformAgg.Spend || 0
            dayData['Meta CTR'] = platformAgg.CTR || 0
            dayData['Meta CPM'] = platformAgg.CPM || 0
          } else if (platform === 'google') {
            dayData['Google Spend'] = platformAgg.Spend || 0
            dayData['Google CTR'] = platformAgg.CTR || 0
            dayData['Google CPM'] = platformAgg.CPM || 0
          } else if (platform === 'shopify') {
            // Extract session analytics from Shopify data
            dayData['Shopify Total Users'] = platformAgg.Sessions || 0
            dayData['Shopify Total ATC'] = platformAgg.AddToCarts || 0
            dayData['Shopify Total Reached Checkout'] = platformAgg.ReachedCheckout || 0
            dayData['Shopify Total Abandoned Checkout'] = platformAgg.AbandonedCheckout || 0
            dayData['Shopify Session Duration'] = platformAgg.AvgSessionDuration || 0
            // Calculate session-based metrics using Julius V7 good_lead_flag
            const goodLeadUsers = platformAgg.GoodLeadUsers || 0 // Duration ≥60s AND Pageviews ≥5
            dayData['Users with Session above 1 min'] = goodLeadUsers
            dayData['Users with Above 5 page views and above 1 min'] = goodLeadUsers
            dayData['ATC with session duration above 1 min'] = platformAgg.QualifiedATCs || 0
            dayData['Reached Checkout with session duration above 1 min'] = platformAgg.QualifiedCheckouts || 0
          }
        }
      })
      
      // Top Metrics complete - no additional calculations needed
      // Julius V7 specifications focused on session analytics
      
      summary.push(dayData)
    })
    
    return summary
  }

  /**
   * Create ad set level summary
   */
  async createAdSetSummary(scoredData) {
    const adSetSummary = []
    
    if (scoredData.meta) {
      console.log(`🔍 Processing ${scoredData.meta.length} meta rows for Ad Set summary`)
      scoredData.meta.forEach((row, index) => {
        const hasAdSet = row['Ad set name'] || row['Ad Set']
        if (index < 3) console.log(`🔍 Row ${index} - Ad set name: "${row['Ad set name']}", Ad Set: "${row['Ad Set']}", hasAdSet: ${!!hasAdSet}`)
        if (hasAdSet) {
          // AdSet Metrics as per Julius V7 specifications
          adSetSummary.push({
            Date: row.Day,
            'Campaign name': row['Campaign name'] || row.Campaign,
            'Ad Set Name': row['Ad set name'] || row['Ad Set'],
            'Ad Set Delivery': 'Active',
            'Spent': row.Spend,
            'Cost per user': row.CostPerUser || (row.Spend / (row.Sessions || 1)),
            'Users': row.Sessions || 0,
            'ATC': row.AddToCarts || 0,
            'Reached Checkout': row.ReachedCheckout || 0,
            'Conversions': row.Conversions || 0,
            'Average session duration': row.AvgSessionDuration || 0,
            'Cost per 1 min user': row.CostPer1MinUser || 0,
            '1min user/ total users (%)': row.OneMinUserPercentage || 0,
            'Users with Session above 1 min': row.UsersAbove1Min || 0,
            'ATC with session duration above 1 min': row.QualifiedATCs || 0,
            'Reached Checkout with session duration above 1 min': row.QualifiedCheckouts || 0,
            'Users with Above 5 page views and above 1 min': row.QualifiedUsers || 0
          })
        }
      })
    }
    
    // Add Google data to ad set level (campaign level)
    if (scoredData.google) {
      scoredData.google.forEach(row => {
        adSetSummary.push({
          Date: row.Day,
          'Campaign name': row['Campaign name'] || row.Campaign,
          'Ad Set Name': row.Campaign, // Use Campaign as Ad Set for Google
          'Ad Set Delivery': 'Active',
          'Spent': row.Spend || row.Cost,
          'Cost per user': row.CostPerUser || (row.Spend / (row.Sessions || 1)),
          'Users': row.Sessions || 0,
          'ATC': row.AddToCarts || 0,
          'ROAS': row.ROAS || 0,
          'Good Leads': row.GoodLeads || 0,
          'Cost Per Good Lead': row.CostPerGoodLead || 0,
          'Cost Per Lead': row.CostPerLead || 0,
          'CTR_Shrunk': row.CTR_Shrunk || row.CTR || 0,
          'CPM_Shrunk': row.CPM_Shrunk || row.CPM || 0,
          'Impressions': row.Impressions || 0,
          'Clicks': row.Clicks || 0,
          'Conversion Rate': row.ConversionRate || 0,
          'Efficiency Score': row.EfficiencyScore || 0,
          'Quality Score': row.QualityScore || 0,
          'Volume Score': row.VolumeScore || 0,
          'Overall Score': row.OverallScore || 0,
          'Platform': 'Google'
        })
      })
    }
    
    // Add Shopify data to ad set level (UTM term as ad set)
    if (scoredData.shopify) {
      scoredData.shopify.forEach(row => {
        adSetSummary.push({
          Date: row.Day,
          'Campaign name': row['UTM campaign'] || row.Campaign,
          'Ad Set Name': row['UTM term'] || row['Ad Set'] || 'Shopify Traffic',
          'Ad Set Delivery': 'Active',
          'Platform': 'Shopify',
          // Include ALL original Shopify fields
          ...row
        })
      })
    }
    
    // Add Shopify data to ad set level
    if (scoredData.shopify) {
      scoredData.shopify.forEach(row => {
        if (row['UTM campaign'] || row['UTM term']) { // Only include rows with campaign or ad set data
          adSetSummary.push({
            Date: row.Day,
            'Campaign name': row['Campaign name'] || row['UTM campaign'],
            'Ad Set Name': row['Ad set name'] || row['UTM term'] || 'Shopify Traffic',
            'Ad Set Delivery': 'Active',
            'Spent': 0, // Shopify doesn't have spend data
            'Cost per user': 0,
            'Users': row.Sessions || row['Online store visitors'] || 0,
            'ATC': row.CartSessions || row['Sessions with cart additions'] || 0,
            'ROAS': row.ROAS || 0,
            'Good Leads': row.GoodLeads || 0,
            'Cost Per Good Lead': 0,
            'Cost Per Lead': 0,
            'CTR_Shrunk': 0,
            'CPM_Shrunk': 0,
            'Impressions': 0,
            'Clicks': 0,
            'Conversion Rate': row.ConversionRate || 0,
            'Efficiency Score': row.EfficiencyScore || 0,
            'Quality Score': row.QualityScore || 0,
            'Volume Score': row.VolumeScore || 0,
            'Overall Score': row.OverallScore || 0,
            'Platform': 'Shopify',
            // Include Shopify-specific metrics
            'Online store visitors': row['Online store visitors'] || 0,
            'Sessions that completed checkout': row['Sessions that completed checkout'] || 0,
            'Sessions that reached checkout': row['Sessions that reached checkout'] || 0,
            'Sessions with cart additions': row['Sessions with cart additions'] || 0,
            'Average session duration': row['Average session duration'] || 0,
            'Pageviews': row.Pageviews || 0
          })
        }
      })
    }
    
    console.log(`✅ AdSet summary generated: ${adSetSummary.length} rows`)
    return adSetSummary
  }

  /**
   * Create ad level summary
   */
  async createAdLevelSummary(scoredData) {
    const adSummary = []
    
    if (scoredData.meta) {
      console.log(`🔍 Processing ${scoredData.meta.length} meta rows for Ad Level summary`)
      scoredData.meta.forEach((row, index) => {
        const hasAd = row['Ad name'] || row.Ad
        if (index < 3) console.log(`🔍 Row ${index} - Ad name: "${row['Ad name']}", Ad: "${row.Ad}", hasAd: ${!!hasAd}`)
        if (hasAd) {
          // Ad-level Metrics as per Julius V7 specifications
          adSummary.push({
            Date: row.Day,
            'Campaign name': row['Campaign name'] || row.Campaign,
            'Ad Set Name': row['Ad set name'] || row['Ad Set'],
            'Ad Name': row['Ad name'] || row.Ad,
            'Ad Set Delivery': 'Active',
            'Spent': row.Spend,
            'CTR': row.CTR_Shrunk || row.CTR || 0,
            'Cost per user': row.CostPerUser || (row.Spend / (row.Sessions || 1)),
            'Users': row.Sessions || 0,
            'ATC': row.AddToCarts || 0,
            'Reached Checkout': row.ReachedCheckout || 0,
            'Conversions': row.Conversions || 0,
            'Average session duration': row.AvgSessionDuration || 0,
            'Cost per 1 min user': row.CostPer1MinUser || 0,
            '1min user/ total users (%)': row.OneMinUserPercentage || 0,
            'Users with Session above 1 min': row.UsersAbove1Min || 0,
            'ATC with session duration above 1 min': row.QualifiedATCs || 0,
            'Reached Checkout with session duration above 1 min': row.QualifiedCheckouts || 0,
            'Users with Above 5 page views and above 1 min': row.QualifiedUsers || 0
          })
        }
      })
    }
    
    // Add Google data to ad level (treat campaigns as ads)
    if (scoredData.google) {
      scoredData.google.forEach(row => {
        adSummary.push({
          Date: row.Day,
          'Campaign name': row['Campaign name'] || row.Campaign,
          'Ad Set Name': row.Campaign, // Use Campaign as Ad Set for Google
          'Ad Name': row.Campaign, // Use Campaign as Ad for Google
          'Ad Set Delivery': 'Active',
          'Spent': row.Spend || row.Cost,
          'CTR': row.CTR_Shrunk || row.CTR || 0,
          'Cost per user': row.CostPerUser || (row.Spend / (row.Sessions || 1)),
          'Users': row.Sessions || 0,
          'ATC': row.AddToCarts || 0,
          'Reached Checkout': row.ReachedCheckout || 0,
          'Conversions': row.Conversions || 0,
          'Average session duration': row.AvgSessionDuration || 0,
          'Cost per 1 min user': row.CostPer1MinUser || 0,
          '1min user/ total users (%)': row.OneMinUserPercentage || 0,
          'Users with Session above 1 min': row.UsersAbove1Min || 0,
          'ATC with session duration above 1 min': row.QualifiedATCs || 0,
          'Reached Checkout with session duration above 1 min': row.QualifiedCheckouts || 0,
          'Users with Above 5 page views and above 1 min': row.QualifiedUsers || 0,
          'Platform': 'Google'
        })
      })
    }
    
    // Add Shopify data to ad level (UTM content as ad)
    if (scoredData.shopify) {
      scoredData.shopify.forEach(row => {
        adSummary.push({
          Date: row.Day,
          'Campaign name': row['UTM campaign'] || row.Campaign,
          'Ad Set Name': row['UTM term'] || row['Ad Set'] || 'Shopify Traffic',
          'Ad Name': row['UTM content'] || row.Ad || 'Shopify Ad',
          'Ad Set Delivery': 'Active',
          'Platform': 'Shopify',
          // Include ALL original Shopify fields
          ...row
        })
      })
    }
    
    // Add Shopify data to ad level
    if (scoredData.shopify) {
      scoredData.shopify.forEach(row => {
        if (row['UTM campaign'] || row['UTM term'] || row['UTM content']) { // Only include rows with campaign, ad set, or ad data
          adSummary.push({
            Date: row.Day,
            'Campaign name': row['Campaign name'] || row['UTM campaign'],
            'Ad Set Name': row['Ad set name'] || row['UTM term'] || 'Shopify Traffic',
            'Ad Name': row['Ad name'] || row['UTM content'] || 'Shopify Ad',
            'Ad Set Delivery': 'Active',
            'Spent': 0, // Shopify doesn't have spend data
            'CTR': 0,
            'Cost per user': 0,
            'Users': row.Sessions || row['Online store visitors'] || 0,
            'ATC': row.CartSessions || row['Sessions with cart additions'] || 0,
            'Reached Checkout': row.CheckoutSessions || row['Sessions that reached checkout'] || 0,
            'Conversions': row.Orders || row['Sessions that completed checkout'] || 0,
            'Average session duration': row.SessionDuration || row['Average session duration'] || 0,
            'Cost per 1 min user': 0,
            '1min user/ total users (%)': 0,
            'Users with Session above 1 min': 0,
            'ATC with session duration above 1 min': 0,
            'Reached Checkout with session duration above 1 min': 0,
            'Users with Above 5 page views and above 1 min': 0,
            'Platform': 'Shopify',
            // Include Shopify-specific metrics
            'Online store visitors': row['Online store visitors'] || 0,
            'Sessions that completed checkout': row['Sessions that completed checkout'] || 0,
            'Sessions that reached checkout': row['Sessions that reached checkout'] || 0,
            'Sessions with cart additions': row['Sessions with cart additions'] || 0,
            'Pageviews': row.Pageviews || 0
          })
        }
      })
    }
    
    console.log(`✅ Ad summary generated: ${adSummary.length} rows`)
    return adSummary
  }

  // Quality validation helper methods
  
  validateNumericBounds(value, bounds) {
    const num = this.parseNumeric(value)
    if (num < bounds.min) return bounds.min
    if (num > bounds.max) return bounds.max
    return num
  }
  
  validateAndNormalizeDate(dateStr) {
    if (!dateStr) return null
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return null
      
      // Check if date is not in future
      const today = new Date()
      if (date > today) {
        console.warn(`⚠️ Future date detected: ${dateStr}`)
        return null
      }
      
      return date.toISOString().split('T')[0]
    } catch {
      return null
    }
  }
  
  validateAndCleanText(text) {
    if (!text) return ''
    
    // Remove special characters that could break attribution
    const cleaned = String(text)
      .trim()
      .replace(/[\u00a0\u2000-\u200b\u2028-\u2029]/g, ' ') // Remove various space characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // Remove control characters
    
    return cleaned
  }
  
  mapUTMCampaign(utmCampaign) {
    if (!utmCampaign) return utmCampaign
    
    // Apply campaign mapping rules from notebook
    const normalized = String(utmCampaign).toLowerCase().trim()
    
    for (const [pattern, mapped] of Object.entries(this.campaignMappingRules)) {
      if (normalized.includes(pattern.toLowerCase())) {
        return mapped
      }
    }
    
    return utmCampaign
  }

  // Helper methods

  normalizeDate(dateStr) {
    if (!dateStr) return null
    try {
      return new Date(dateStr).toISOString().split('T')[0]
    } catch {
      return dateStr
    }
  }

  normalizeCampaignName(campaignName) {
    if (!campaignName) return ''
    return campaignName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .trim()
  }

  parseNumeric(value) {
    if (value === null || value === undefined || value === '') return 0
    if (typeof value === 'number') return value
    
    // Handle percentage strings
    if (typeof value === 'string' && value.includes('%')) {
      const numStr = value.replace(/[,%]/g, '')
      const parsed = parseFloat(numStr)
      return isNaN(parsed) ? 0 : parsed / 100 // Convert percentage to decimal
    }
    
    // Handle currency and comma-separated numbers
    const numStr = String(value).replace(/[,$₹]/g, '')
    const parsed = parseFloat(numStr)
    return isNaN(parsed) ? 0 : parsed
  }

  getDateRange(startDate, endDate) {
    const dates = []
    const current = new Date(startDate)
    const end = new Date(endDate)
    
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0])
      current.setDate(current.getDate() + 1)
    }
    
    return dates
  }

  aggregatePlatformDay(dayData) {
    if (!dayData || dayData.length === 0) {
      return { Spend: 0, Impressions: 0, Clicks: 0, CTR: 0, CPM: 0, Sessions: 0, Revenue: 0, Orders: 0, ConversionRate: 0 }
    }
    
    return dayData.reduce((acc, row) => ({
      Spend: acc.Spend + (row.Spend || 0),
      Impressions: acc.Impressions + (row.Impressions || 0),
      Clicks: acc.Clicks + (row.Clicks || 0),
      CTR: acc.CTR + (row.CTR || 0) / dayData.length,
      CPM: acc.CPM + (row.CPM || 0) / dayData.length,
      Sessions: acc.Sessions + (row.Sessions || 0),
      Revenue: acc.Revenue + (row.Revenue || 0),
      Orders: acc.Orders + (row.Orders || 0),
      ConversionRate: acc.ConversionRate + (row.ConversionRate || 0) / dayData.length
    }), { Spend: 0, Impressions: 0, Clicks: 0, CTR: 0, CPM: 0, Sessions: 0, Revenue: 0, Orders: 0, ConversionRate: 0 })
  }

  generateProcessingSummary(scoredData, dateRange) {
    let totalRows = 0
    let totalSpend = 0
    let totalRevenue = 0
    
    Object.values(scoredData).forEach(platformData => {
      if (platformData) {
        totalRows += platformData.length
        platformData.forEach(row => {
          // Fix field mapping to match actual data structure
          totalSpend += (row.Spent || row['Meta Spend'] || row['Google Spend'] || row.Spend || 0)
          totalRevenue += (row.Revenue || row['Total Revenue'] || row.Orders || 0)
        })
      }
    })
    
    console.log(`📊 Summary calculation - Rows: ${totalRows}, Spend: $${totalSpend}, Revenue: $${totalRevenue}`)
    
    return {
      totalRows,
      totalSpend: Math.round(totalSpend * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      roas: totalSpend > 0 ? Math.round((totalRevenue / totalSpend) * 100) / 100 : 0,
      dateRange,
      platforms: Object.keys(scoredData).filter(platform => scoredData[platform]?.length > 0)
    }
  }

  // Stub methods for step-by-step implementation
  // Helper: Group by keys and sum metrics (from notebook aggregation logic)
  groupByAndSum(rows, groupKeys, sumKeys) {
    if (!rows || rows.length === 0) return []
    
    const grouped = {}
    
    rows.forEach(row => {
      // Create group key
      const keyValues = groupKeys.map(key => String(row[key] || '').trim())
      const groupKey = keyValues.join('|||')
      
      if (!grouped[groupKey]) {
        // Initialize group with key fields
        grouped[groupKey] = {}
        groupKeys.forEach((key, i) => {
          grouped[groupKey][key] = keyValues[i]
        })
        
        // Initialize sum fields to 0 (REAL data only, no synthetic values)
        sumKeys.forEach(key => {
          grouped[groupKey][key] = 0
        })
      }
      
      // Sum metrics (only real data, no synthetic addition)
      sumKeys.forEach(key => {
        const value = this.parseNumeric(row[key])
        if (value !== null && !isNaN(value)) {
          grouped[groupKey][key] += value
        }
      })
    })
    
    return Object.values(grouped)
  }
  
  // Join Meta and Shopify (from notebook meta_eval logic)
  joinMetaShopify(meta, shop_agg) {
    const result = []
    let matchCount = 0
    let totalMeta = meta.length
    
    console.log(`🔍 DEBUG: Joining ${totalMeta} Meta rows with ${shop_agg.length} Shopify aggregated rows`)
    
    meta.forEach((metaRow, index) => {
      // Find matching Shopify data
      const shopMatch = shop_agg.find(shopRow => 
        shopRow.Day === metaRow.Day &&
        shopRow.utm_campaign === metaRow.campaign_name &&
        shopRow.utm_term === metaRow.ad_set_name &&
        shopRow.utm_content === metaRow.ad_name
      )
      
      // DEBUG: Log first 3 matches/mismatches
      if (index < 3) {
        console.log(`🔍 Meta Row ${index}: Day="${metaRow.Day}", Campaign="${metaRow.campaign_name}", AdSet="${metaRow.ad_set_name}", Ad="${metaRow.ad_name}"`)
        if (shopMatch) {
          console.log(`✅ MATCH found: visitors=${shopMatch.visitors}, pageviews=${shopMatch.pageviews}`)
          matchCount++
        } else {
          console.log(`❌ NO MATCH - checking first 2 Shopify rows:`)
          shop_agg.slice(0, 2).forEach((shop, i) => {
            console.log(`  Shop ${i}: Day="${shop.Day}", utm_campaign="${shop.utm_campaign}", utm_term="${shop.utm_term}", utm_content="${shop.utm_content}"`)
          })
        }
      } else if (shopMatch) {
        matchCount++
      }
      
      // Combine Meta + Shopify data (ONLY real data, no synthetic values)
      const combined = {
        Day: metaRow.Day,
        source: 'Meta',
        utm_campaign: metaRow.campaign_name || '',
        utm_term: metaRow.ad_set_name || '',
        utm_content: metaRow.ad_name || '',
        amount_spent_inr: metaRow.amount_spent_inr || 0,
        ctr_decimal: metaRow.ctr_decimal || 0,
        cpm: metaRow.cpm || 0,
        ad_set_delivery: metaRow.ad_set_delivery || '',
        
        // Shopify metrics (0 if no match - this represents NO DATA, not synthetic data)
        visitors: shopMatch?.visitors || 0,
        pageviews: shopMatch?.pageviews || 0,
        avg_session_duration: shopMatch?.avg_session_duration || 0,
        atc: shopMatch?.atc || 0,
        reached_checkout: shopMatch?.reached_checkout || 0,
        completed_checkout: shopMatch?.completed_checkout || 0,
        users_1min: shopMatch?.users_1min || 0,
        users_5pv_1min: shopMatch?.users_5pv_1min || 0,
        atc_1min: shopMatch?.atc_1min || 0,
        reached_1min: shopMatch?.reached_1min || 0
      }
      
      result.push(combined)
    })
    
    console.log(`📊 Meta-Shopify Join Results: ${matchCount}/${totalMeta} Meta rows matched with Shopify data (${Math.round(matchCount/totalMeta*100)}%)`)
    
    return result
  }
  
  // Join Google and Shopify (from notebook google_eval logic)
  joinGoogleShopify(google_agg, shop_agg) {
    const result = []
    
    google_agg.forEach(googleRow => {
      // Find matching Shopify data (Google only matches on Day + Campaign)
      const shopMatch = shop_agg.find(shopRow => 
        shopRow.Day === googleRow.Day &&
        shopRow.utm_campaign === googleRow.Campaign
      )
      
      // Combine Google + Shopify data (ONLY real data, no synthetic values)
      const combined = {
        Day: googleRow.Day,
        source: 'Google',
        utm_campaign: googleRow.Campaign || '',
        utm_term: '', // Google has no ad set granularity in our data
        utm_content: '', // Google has no ad granularity in our data
        amount_spent_inr: googleRow.Cost || 0,
        ctr_decimal: googleRow.ctr_decimal || 0,
        cpm: googleRow.cpm || 0,
        ad_set_delivery: '',
        
        // Shopify metrics (0 if no match - represents NO DATA, not synthetic)
        visitors: shopMatch?.visitors || 0,
        pageviews: shopMatch?.pageviews || 0,
        avg_session_duration: shopMatch?.avg_session_duration || 0,
        atc: shopMatch?.atc || 0,
        reached_checkout: shopMatch?.reached_checkout || 0,
        completed_checkout: shopMatch?.completed_checkout || 0,
        users_1min: shopMatch?.users_1min || 0,
        users_5pv_1min: shopMatch?.users_5pv_1min || 0,
        atc_1min: shopMatch?.atc_1min || 0,
        reached_1min: shopMatch?.reached_1min || 0
      }
      
      result.push(combined)
    })
    
    return result
  }
  
  detectPlatformFromURL(url) {
    if (!url) return 'Unknown'
    const urlStr = String(url).toLowerCase()
    if (urlStr.includes('facebook') || urlStr.includes('instagram') || urlStr.includes('meta')) return 'Meta'
    if (urlStr.includes('google') || urlStr.includes('gclid')) return 'Google'
    return 'Unknown'
  }
  
  aggregateShopifyByAttributionKeys(rows, keys) {
    if (!rows || rows.length === 0) return []
    
    console.log(`🔍 Aggregating ${rows.length} Shopify rows by keys: ${keys.join(', ')}`)
    
    // Group by attribution keys
    const grouped = {}
    
    rows.forEach(row => {
      // Create key from the specified attribution fields
      const keyValues = keys.map(key => {
        // Normalize key names to match data
        const value = row[key] || row[key.replace(/ /g, '_')] || row[key.toLowerCase()] || ''
        return String(value).trim()
      })
      const groupKey = keyValues.join('|||')
      
      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          // Preserve key fields
          Day: row.Day,
          'UTM campaign': row['UTM campaign'] || row.utm_campaign || '',
          'UTM term': row['UTM term'] || row.utm_term || '',
          'UTM content': row['UTM content'] || row.utm_content || '',
          
          // Aggregate metrics
          'Online store visitors': 0,
          'Page views': 0,
          'Sessions with cart additions': 0,
          'Sessions reached checkout': 0,
          'Sessions completed checkout': 0,
          'Average session duration': [],
          
          // Derived metrics for calculations
          visitors_with_long_sessions: 0,
          visitors_with_deep_views: 0,
          visitors_qualified: 0,
          atc_with_long_sessions: 0,
          checkout_with_long_sessions: 0,
          
          count: 0
        }
      }
      
      const group = grouped[groupKey]
      
      // Sum quantitative metrics
      group['Online store visitors'] += this.parseNumeric(row['Online store visitors']) || 0
      group['Page views'] += this.parseNumeric(row['Page views']) || 0
      group['Sessions with cart additions'] += this.parseNumeric(row['Sessions with cart additions']) || 0
      group['Sessions reached checkout'] += this.parseNumeric(row['Sessions reached checkout']) || 0
      group['Sessions completed checkout'] += this.parseNumeric(row['Sessions completed checkout']) || 0
      
      // Collect session durations for averaging
      const duration = this.parseNumeric(row['Average session duration']) || 0
      if (duration > 0) {
        group['Average session duration'].push(duration)
      }
      
      // Calculate derived metrics based on Python logic
      const visitors = this.parseNumeric(row['Online store visitors']) || 0
      const pageviews = this.parseNumeric(row['Page views']) || this.parseNumeric(row['Pageviews']) || 0 // CRITICAL FIX: Handle both field names
      const atc = this.parseNumeric(row['Sessions with cart additions']) || 0
      const checkout = this.parseNumeric(row['Sessions reached checkout']) || 0
      
      // Long session flag: duration >= 60
      const longSessionFlag = duration >= 60 ? 1 : 0
      // Deep views flag: pageviews >= 5  
      const deepViewsFlag = pageviews >= 5 ? 1 : 0
      // Good lead flag: both conditions
      const goodLeadFlag = longSessionFlag && deepViewsFlag ? 1 : 0
      
      // Proxy counts (multiply visitors by flags)
      group.visitors_with_long_sessions += visitors * longSessionFlag
      group.visitors_with_deep_views += visitors * deepViewsFlag
      group.visitors_qualified += visitors * goodLeadFlag
      group.atc_with_long_sessions += atc * longSessionFlag
      group.checkout_with_long_sessions += checkout * longSessionFlag
      
      group.count++
    })
    
    // Convert to array and calculate averages
    const result = Object.values(grouped).map(group => {
      // Average session duration
      const durations = group['Average session duration']
      group['Average session duration'] = durations.length > 0 
        ? durations.reduce((a, b) => a + b, 0) / durations.length 
        : 0
      
      // Add final derived metrics that match Python output
      group['Users with Session above 1 min'] = group.visitors_with_long_sessions
      group['Users with Above 5 page views and above 1 min'] = group.visitors_qualified
      group['ATC with session duration above 1 min'] = group.atc_with_long_sessions
      group['Reached Checkout with session duration above 1 min'] = group.checkout_with_long_sessions
      
      return group
    })
    
    console.log(`📊 Aggregated ${Object.keys(grouped).length} unique attribution groups`)
    return result
  }
  
  validateAttribution(attributed, original) {
    return {
      meta_attributed: attributed.meta?.length || 0,
      google_attributed: attributed.google?.length || 0,
      total_unified: attributed.unified_attr?.length || 0
    }
  }
  
  // Create Top Metrics Table (from notebook cell c8bfdf9f)
  createTopMetricsTable(ua, shopifyOriginal = null) {
    // Daily per-source splits with proper averaging for CTR/CPM
    const meta_rows = ua.filter(row => row.source === 'Meta' && row.amount_spent_inr > 0)
    const meta_day = this.groupByAndSum(meta_rows, ['Day'], ['amount_spent_inr']).map(row => {
      const dayRows = meta_rows.filter(r => r.Day === row.Day && (r.ctr_decimal > 0 || r.cpm > 0))
      const totalSpend = row.amount_spent_inr || 0
      
      // Use spend-weighted averages for CTR/CPM as per notebook logic
      let weightedCTR = 0
      let weightedCPM = 0
      let totalSpendForCTR = 0
      let totalSpendForCPM = 0
      
      dayRows.forEach(r => {
        const spend = r.amount_spent_inr || 0
        if (r.ctr_decimal > 0) {
          weightedCTR += (r.ctr_decimal * spend)
          totalSpendForCTR += spend
        }
        if (r.cpm > 0) {
          weightedCPM += (r.cpm * spend)
          totalSpendForCPM += spend
        }
      })
      
      const avgCTR = totalSpendForCTR > 0 ? weightedCTR / totalSpendForCTR : 0
      const avgCPM = totalSpendForCPM > 0 ? weightedCPM / totalSpendForCPM : 0
      
      return {
        Day: row.Day,
        'Meta Spend': totalSpend,
        'Meta CTR': avgCTR, // Only real calculated values, no synthetic data
        'Meta CPM': avgCPM // Only real calculated values, no synthetic data
      }
    })
    
    const google_rows = ua.filter(row => row.source === 'Google' && row.amount_spent_inr > 0)
    const google_day = this.groupByAndSum(google_rows, ['Day'], ['amount_spent_inr']).map(row => {
      const dayRows = google_rows.filter(r => r.Day === row.Day)
      const totalSpend = row.amount_spent_inr || 0
      const avgCTR = dayRows.length > 0 ? dayRows.reduce((sum, r) => sum + (r.ctr_decimal || 0), 0) / dayRows.length : 0
      const avgCPM = dayRows.length > 0 ? dayRows.reduce((sum, r) => sum + (r.cpm || 0), 0) / dayRows.length : 0
      
      return {
        Day: row.Day,
        'Google Spend': totalSpend,
        'Google CTR': avgCTR,
        'Google CPM': avgCPM
      }
    })
    
    // CRITICAL FIX: Use notebook's exact logic - aggregate Shopify from ORIGINAL data before attribution
    // This prevents the 7,388 → 128 users duplication issue
    let shop_cols
    
    if (shopifyOriginal && shopifyOriginal.length > 0) {
      // Use original Shopify data before it gets multiplied across Meta/Google rows
      console.log(`📊 Using original Shopify data: ${shopifyOriginal.length} rows`)
      shop_cols = this.groupByAndSum(
        shopifyOriginal.filter(row => row.visitors > 0), // Only attributed rows
        ['Day'], // Group by Day to get daily totals
        ['visitors', 'pageviews', 'avg_session_duration'] 
      ).map(row => ({
        Day: row.Day,
        'Shopify Total Users': row.visitors || 0, // Should be 128, not 7,388
        'Shopify Total Pageviews': row.pageviews || 0, // Should be 225, not 0  
        'Shopify Session Duration': row.avg_session_duration || 0
      }))
      console.log(`📊 Shopify daily totals: ${shop_cols.length} days, ${shop_cols.reduce((sum, row) => sum + row['Shopify Total Users'], 0)} total users`)
    } else {
      // Fallback to unified attribution (old logic)
      console.log('⚠️ No original Shopify data, using unified attribution fallback')
      const shopify_attributed_users = ua.filter(row => row.visitors > 0)
      shop_cols = this.groupByAndSum(
        shopify_attributed_users,
        ['Day'],
        ['visitors', 'pageviews', 'avg_session_duration'] 
      ).map(row => ({
        Day: row.Day,
        'Shopify Total Users': row.visitors || 0,
        'Shopify Total Pageviews': row.pageviews || 0,  
        'Shopify Session Duration': row.avg_session_duration || 0
      }))
    }
    
    // Merge daily tables (left join pattern from notebook)
    const top_metrics = shop_cols.map(shopRow => {
      const metaMatch = meta_day.find(m => m.Day === shopRow.Day)
      const googleMatch = google_day.find(g => g.Day === shopRow.Day)
      
      return {
        Day: shopRow.Day,
        'Shopify Total Users': shopRow['Shopify Total Users'],
        'Shopify Total Pageviews': shopRow['Shopify Total Pageviews'],
        'Shopify Session Duration': shopRow['Shopify Session Duration'],
        'Meta Spend': metaMatch?.['Meta Spend'] || 0,
        'Meta CTR': metaMatch?.['Meta CTR'] || 0,
        'Meta CPM': metaMatch?.['Meta CPM'] || 0,
        'Google Spend': googleMatch?.['Google Spend'] || 0,
        'Google CTR': googleMatch?.['Google CTR'] || 0,
        'Google CPM': googleMatch?.['Google CPM'] || 0
      }
    })
    
    return top_metrics.sort((a, b) => new Date(a.Date) - new Date(b.Date))
  }
  
  // Create AdSet Metrics Table (Meta only, from notebook)
  createAdSetMetricsTable(ua) {
    const meta_only = ua.filter(row => row.source === 'Meta')
    
    const adset = this.groupByAndSum(
      meta_only,
      ['Day', 'utm_campaign', 'utm_term', 'ad_set_delivery'],
      ['amount_spent_inr', 'visitors', 'atc', 'reached_checkout', 'completed_checkout', 'avg_session_duration', 'users_1min', 'users_5pv_1min']
    )
    
    return adset.map(row => {
      const users = row.visitors || 0
      const users_1min = row.users_1min || 0
      const spent = row.amount_spent_inr || 0
      
      return {
        Date: row.Day,
        'Campaign name': row.utm_campaign || '',
        'Ad Set Name': row.utm_term || '',
        'Ad Set Delivery': row.ad_set_delivery || '',
        'Spent': spent,
        'Cost per user': users > 0 ? (spent / users) : 0,
        'Users': users,
        'ATC': row.atc || 0,
        'Reached Checkout': row.reached_checkout || 0,
        'Conversions': row.completed_checkout || 0,
        'Average session duration': row.avg_session_duration || 0,
        'Cost per 1 min user': users_1min > 0 ? (spent / users_1min) : 0,
        '1min user/ total users (%)': users > 0 ? ((users_1min / users) * 100) : 0,
        'Users with Session above 1 min': users_1min,
        'ATC with session duration above 1 min': row.atc_1min || 0,
        'Reached Checkout with session duration above 1 min': row.reached_1min || 0,
        'Users with Above 5 page views and above 1 min': row.users_5pv_1min || 0
      }
    }).sort((a, b) => new Date(a.Date) - new Date(b.Date))
  }
  
  // Create Ad Level Metrics Table (Meta only, from notebook)
  createAdLevelMetricsTable(ua) {
    const meta_only = ua.filter(row => row.source === 'Meta')
    
    const ad_level = this.groupByAndSum(
      meta_only,
      ['Day', 'utm_campaign', 'utm_term', 'utm_content', 'ad_set_delivery'],
      ['amount_spent_inr', 'ctr_decimal', 'visitors', 'atc', 'reached_checkout', 'completed_checkout', 'avg_session_duration', 'users_1min', 'users_5pv_1min']
    )
    
    return ad_level.map(row => {
      const users = row.visitors || 0
      const users_1min = row.users_1min || 0
      const spent = row.amount_spent_inr || 0
      
      return {
        Date: row.Day,
        'Campaign name': row.utm_campaign || '',
        'Ad Set Name': row.utm_term || '',
        'Ad Name': row.utm_content || '',
        'Ad Set Delivery': row.ad_set_delivery || '',
        'Spent': spent,
        'CTR': row.ctr_decimal || 0,
        'Cost per user': users > 0 ? (spent / users) : 0,
        'Users': users,
        'ATC': row.atc || 0,
        'Reached Checkout': row.reached_checkout || 0,
        'Conversions': row.completed_checkout || 0,
        'Average session duration': row.avg_session_duration || 0,
        'Cost per 1 min user': users_1min > 0 ? (spent / users_1min) : 0,
        '1min user/ total users (%)': users > 0 ? ((users_1min / users) * 100) : 0,
        'Users with Session above 1 min': users_1min,
        'ATC with session duration above 1 min': row.atc_1min || 0,
        'Reached Checkout with session duration above 1 min': row.reached_1min || 0,
        'Users with Above 5 page views and above 1 min': row.users_5pv_1min || 0
      }
    }).sort((a, b) => new Date(a.Date) - new Date(b.Date))
  }
}

export default JuliusV7Engine
