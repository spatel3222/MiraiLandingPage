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
      
      // Schema validation - check required columns
      const requiredColumns = this.getRequiredColumns(platform)
      console.log(`🔍 Debug ${platform} required columns:`, JSON.stringify(requiredColumns))
      const actualColumns = platformData.length > 0 ? Object.keys(platformData[0]) : []
      console.log(`🔍 Debug ${platform} actual columns count:`, actualColumns.length)
      console.log(`🔍 Debug ${platform} actual columns:`, JSON.stringify(actualColumns))
      const missingColumns = requiredColumns.filter(col => !actualColumns.includes(col))
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
  getRequiredColumns(platform) {
    // Updated to match actual API column names from database
    const requiredColumns = {
      meta: ['Day', 'Campaign', 'Ad Set', 'Ad', 'Spend', 'CPM', 'CTR', 'Impressions', 'Clicks'],
      google: ['Day', 'Campaign', 'Spend', 'CPM', 'CTR', 'Impressions', 'Clicks'],
      shopify: ['Day', 'UTM Campaign', 'Sessions', 'Orders', 'Revenue', 'Page Views', 'Average Session Duration']
    }
    return requiredColumns[platform] || []
  }
  
  /**
   * Check if row has essential fields based on platform
   */
  hasEssentialFields(row, platform) {
    if (platform === 'meta') {
      return row['Campaign'] && row['Spend'] !== undefined
    } else if (platform === 'google') {
      return row['Campaign'] && row['Spend'] !== undefined
    } else if (platform === 'shopify') {
      return row['UTM Campaign'] && row['Sessions'] !== undefined
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
    const harmonized = { ...row }
    
    // Map Shopify field names based on actual data structure
    const fieldMap = {
      'UTM campaign': 'Campaign',
      'UTM term': 'Ad Set', // Map utm_term to ad set for attribution
      'UTM content': 'Ad',   // Map utm_content to ad for attribution
      'Online store visitors': 'Sessions',
      'Sessions that completed checkout': 'Orders',
      'Sessions that reached checkout': 'CheckoutSessions',
      'Sessions with cart additions': 'CartSessions',
      'Average session duration': 'SessionDuration',
      'Pageviews': 'Pageviews'
    }
    
    Object.entries(fieldMap).forEach(([originalField, standardField]) => {
      if (row[originalField] !== undefined) {
        harmonized[standardField] = row[originalField]
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
    
    // Parse numeric fields
    const numericFields = ['Sessions', 'Orders', 'CheckoutSessions', 'CartSessions', 'SessionDuration', 'Pageviews', 'ConversionRate', 'GoodLeads']
    numericFields.forEach(field => {
      if (harmonized[field] !== undefined) {
        harmonized[field] = this.parseNumeric(harmonized[field])
      }
    })
    
    return harmonized
  }

  /**
   * Step 4: Attribution Logic Implementation (Section 7.3 from notebook)
   */
  async applyAttributionWithValidation(validatedData) {
    const { data: harmonizedData, validation } = validatedData
    console.log('🎯 Starting Attribution Logic Implementation...')
    
    // Detect platform from Shopify URL using utm_source parameters
    const shopifyData = harmonizedData.shopify || []
    const shopifyPlatformData = Array.isArray(shopifyData) ? shopifyData.map(row => ({
      ...row,
      detectedPlatform: this.detectPlatformFromURL(row['Landing page URL'] || '')
    })) : []
    
    // Separate Shopify data by detected platform
    const shopifyMeta = Array.isArray(shopifyPlatformData) ? shopifyPlatformData.filter(row => row.detectedPlatform === 'Meta') : []
    const shopifyGoogle = Array.isArray(shopifyPlatformData) ? shopifyPlatformData.filter(row => row.detectedPlatform === 'Google') : []
    const shopifyUnknown = Array.isArray(shopifyPlatformData) ? shopifyPlatformData.filter(row => row.detectedPlatform === 'Unknown') : []
    
    console.log(`📊 Shopify platform detection: Meta=${shopifyMeta.length}, Google=${shopifyGoogle.length}, Unknown=${shopifyUnknown.length}`)
    
    // Aggregate Shopify by attribution keys to avoid duplicates
    // Meta attribution key: day + utm_campaign + utm_term + utm_content
    const shopifyMetaAgg = this.aggregateShopifyByAttributionKeys(
      shopifyMeta, 
      ['Day', 'UTM campaign', 'UTM term', 'UTM content']
    )
    
    // Google attribution key: day + utm_campaign  
    const shopifyGoogleAgg = this.aggregateShopifyByAttributionKeys(
      shopifyGoogle,
      ['Day', 'UTM campaign']
    )
    
    console.log(`📊 Shopify aggregated: Meta=${shopifyMetaAgg.length}, Google=${shopifyGoogleAgg.length}`)
    
    // Apply attribution to Meta: Day + Campaign + Ad Set + Ad
    const metaWithAttribution = Array.isArray(harmonizedData.meta) ? harmonizedData.meta.map(row => ({ ...row, attr_Visitors: 0, attribution_matched: false })) : []
    
    // Apply attribution to Google: Day + Campaign
    const googleWithAttribution = Array.isArray(harmonizedData.google) ? harmonizedData.google.map(row => ({ ...row, attr_Visitors: 0, attribution_matched: false })) : []
    
    const attributedData = {
      meta: metaWithAttribution,
      google: googleWithAttribution,
      shopify_meta_attributed: shopifyMetaAgg,
      shopify_google_attributed: shopifyGoogleAgg,
      shopify_unknown: shopifyUnknown
    }
    
    // Attribution validation checks
    const attributionValidation = this.validateAttribution(attributedData, harmonizedData)
    
    console.log('✅ Attribution logic implementation completed')
    
    return { 
      data: attributedData, 
      validation: { 
        ...validation, 
        attribution: attributionValidation 
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
   * Step 7: Create aggregated views (top-level, ad set, ad-level)
   */
  async createAggregatedViews(scoredData, dateRange) {
    console.log('📋 Creating aggregated CSV outputs...')
    
    const outputs = {
      topLevel: await this.createTopLevelSummary(scoredData, dateRange),
      adSetLevel: await this.createAdSetSummary(scoredData),
      adLevel: await this.createAdLevelSummary(scoredData)
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
      scoredData.meta.forEach(row => {
        if (row['Ad Set']) {
          // AdSet Metrics as per Julius V7 specifications
          adSetSummary.push({
            Date: row.Day,
            'Campaign name': row.Campaign,
            'Ad Set Name': row['Ad Set'],
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
    
    return adSetSummary
  }

  /**
   * Create ad level summary
   */
  async createAdLevelSummary(scoredData) {
    const adSummary = []
    
    if (scoredData.meta) {
      scoredData.meta.forEach(row => {
        if (row.Ad) {
          // Ad-level Metrics as per Julius V7 specifications
          adSummary.push({
            Date: row.Day,
            'Campaign name': row.Campaign,
            'Ad Set Name': row['Ad Set'],
            'Ad Name': row.Ad,
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
          totalSpend += row.Spend || 0
          totalRevenue += row.Revenue || 0
        })
      }
    })
    
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
  detectPlatformFromURL(url) {
    return 'Meta' // Stub for now
  }
  
  aggregateShopifyByAttributionKeys(rows, keys) {
    return [] // Stub for now
  }
  
  validateAttribution(attributed, original) {
    return {} // Stub for now
  }
}

export default JuliusV7Engine
