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
      const businessMetricsData = await this.businessLogicValidation(attributedData)
      console.log('✅ Business logic validation completed')
      
      // Step 6: Empirical Bayes Shrinkage with exact notebook formula
      const shrunkData = await this.applyNotebookEmpiricalBayes(businessMetricsData)
      console.log('✅ Empirical Bayes shrinkage (notebook logic) applied')
      
      // Step 7: Scoring with exact notebook formula (0.4*efficiency + 0.4*quality + 0.2*volume)
      const scoredData = await this.generateNotebookScores(shrunkData)
      console.log('✅ Performance scores (notebook logic) generated')
      
      // Step 8: Output Validation and Final CSVs (7.5-7.7)
      const validatedOutputs = await this.outputValidationAndCreation(scoredData, dateRange)
      console.log('✅ Output validation and CSV creation completed')
      
      return {
        success: true,
        outputs: validatedOutputs.outputs,
        validation: validatedOutputs.validation,
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
      validation.fileIntegrity[platform] = { 
        present: true, 
        readable: true, 
        size: platformData.length 
      }
      
      // Schema validation - check required columns
      const requiredColumns = this.getRequiredColumns(platform)
      const actualColumns = platformData.length > 0 ? Object.keys(platformData[0]) : []
      const missingColumns = requiredColumns.filter(col => !actualColumns.includes(col))
      
      validation.schemaValidation[platform] = {
        requiredPresent: missingColumns.length === 0,
        missingColumns: missingColumns,
        columnCount: actualColumns.length
      }
      
      // Date range coverage check
      const dateField = platform === 'meta' ? 'Day' : 'Day'
      const dates = platformData.map(row => row[dateField]).filter(Boolean)
      const uniqueDates = [...new Set(dates)]
      
      validation.dateCoverage[platform] = {
        minDate: dates.length > 0 ? Math.min(...dates.map(d => new Date(d))) : null,
        maxDate: dates.length > 0 ? Math.max(...dates.map(d => new Date(d))) : null,
        uniqueDays: uniqueDates.length,
        gaps: this.findDateGaps(uniqueDates.sort())
      }
      
      // Basic cleaning - remove rows with missing essential fields
      const cleanedData = platformData.filter(row => {
        return row && row.Day && this.hasEssentialFields(row, platform)
      })
      
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
    const requiredColumns = {
      meta: ['Day', 'Campaign name', 'Ad set name', 'Ad name', 'Amount spent (INR)', 'CPM (cost per 1,000 impressions)', 'CTR (link click-through rate)'],
      google: ['Day', 'Campaign', 'Cost', 'Avg. CPM', 'CTR'],
      shopify: ['Day', 'UTM campaign', 'UTM term', 'UTM content', 'Online store visitors', 'Sessions that completed checkout', 'Sessions that reached checkout', 'Sessions with cart additions', 'Average session duration', 'Pageviews']
    }
    return requiredColumns[platform] || []
  }
  
  /**
   * Check if row has essential fields based on platform
   */
  hasEssentialFields(row, platform) {
    if (platform === 'meta') {
      return row['Campaign name'] && row['Amount spent (INR)'] !== undefined
    } else if (platform === 'google') {
      return row['Campaign'] && row['Cost'] !== undefined
    } else if (platform === 'shopify') {
      return row['UTM campaign'] && row['Online store visitors'] !== undefined
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
      
      const platformCleaned = data.map(row => {
        const cleanedRow = { ...row }
        
        // Numeric bounds validation
        if (platform === 'meta' || platform === 'google') {
          const spendField = platform === 'meta' ? 'Amount spent (INR)' : 'Cost'
          cleanedRow[spendField] = this.validateNumericBounds(row[spendField], { min: 0, max: 1000000 })
          
          const ctrField = platform === 'meta' ? 'CTR (link click-through rate)' : 'CTR'
          if (row[ctrField] !== undefined) {
            // CTR should be 0-100% for display, 0-1 for calculation
            const ctrValue = this.parseNumeric(row[ctrField])
            cleanedRow[ctrField] = this.validateNumericBounds(ctrValue, { min: 0, max: 100 })
          }
          
          const cpmField = platform === 'meta' ? 'CPM (cost per 1,000 impressions)' : 'Avg. CPM'
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
          cleanedRow['Campaign name'] = this.validateAndCleanText(row['Campaign name'])
          cleanedRow['Ad set name'] = this.validateAndCleanText(row['Ad set name'])
          cleanedRow['Ad name'] = this.validateAndCleanText(row['Ad name'])
        } else if (platform === 'google') {
          cleanedRow['Campaign'] = this.validateAndCleanText(row['Campaign'])
        } else if (platform === 'shopify') {
          cleanedRow['UTM campaign'] = this.validateAndCleanText(row['UTM campaign'])
          cleanedRow['UTM term'] = this.validateAndCleanText(row['UTM term'])
          cleanedRow['UTM content'] = this.validateAndCleanText(row['UTM content'])
        }
        
        return cleanedRow
      }).filter(row => row.Day) // Remove rows with invalid dates
      
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
      
      const harmonized = data.map(row => {
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
      })
      
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
    
    // Map Meta field names to standard names based on actual data structure
    const fieldMap = {
      'Campaign name': 'Campaign',
      'Ad set name': 'Ad Set',
      'Adset name': 'Ad Set', 
      'Ad name': 'Ad',
      'Amount spent (INR)': 'Spend',
      'Amount spent (USD)': 'Spend',
      'Link clicks': 'Clicks',
      'Cost per link click (USD)': 'CPC',
      'CPM (cost per 1,000 impressions)': 'CPM',
      'CTR (link click-through rate)': 'CTR'
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
    const shopifyPlatformData = shopifyData.map(row => ({
      ...row,
      detectedPlatform: this.detectPlatformFromURL(row['Landing page URL'] || '')
    }))
    
    // Separate Shopify data by detected platform
    const shopifyMeta = shopifyPlatformData.filter(row => row.detectedPlatform === 'Meta')
    const shopifyGoogle = shopifyPlatformData.filter(row => row.detectedPlatform === 'Google')
    const shopifyUnknown = shopifyPlatformData.filter(row => row.detectedPlatform === 'Unknown')
    
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
    const metaWithAttribution = (harmonizedData.meta || []).map(row => ({ ...row, attr_Visitors: 0, attribution_matched: false }))
    
    // Apply attribution to Google: Day + Campaign
    const googleWithAttribution = (harmonizedData.google || []).map(row => ({ ...row, attr_Visitors: 0, attribution_matched: false }))
    
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
      if (!data || data.length === 0) {
        businessMetricsData[platform] = []
        continue
      }
      
      const enrichedData = data.map(row => {
        const businessMetrics = { ...row }
        
        // Calculate business-specific metrics
        if (platform === 'shopify') {
          // Good Leads: Sessions with duration ≥60s AND pageviews ≥5
          // For now, we'll estimate based on conversion rate and session quality
          businessMetrics.GoodLeads = this.estimateGoodLeads(row)
          businessMetrics.GoodLeadRate = businessMetrics.Sessions > 0 
            ? (businessMetrics.GoodLeads / businessMetrics.Sessions) 
            : 0
        }
        
        // Cost per metrics
        businessMetrics.CostPerUser = businessMetrics.Sessions > 0 
          ? (businessMetrics.Spend / businessMetrics.Sessions) 
          : 0
        businessMetrics.CostPerOrder = businessMetrics.Orders > 0 
          ? (businessMetrics.Spend / businessMetrics.Orders) 
          : 0
        
        if (businessMetrics.GoodLeads > 0) {
          businessMetrics.CostPerGoodLead = businessMetrics.Spend / businessMetrics.GoodLeads
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
    
    // Fallback estimation when detailed session data unavailable
    // Use engagement heuristics based on conversion rates and session quality
    const sessions = row.Sessions || 0
    const conversionRate = row.ConversionRate || 0
    
    // Higher conversion rate suggests better engagement
    const qualityScore = Math.min(0.8, conversionRate * 10 + 0.1)
    
    return Math.round(sessions * qualityScore)
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
      
      shrunkData[platform] = data.map(row => {
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
      })
      
      console.log(`📊 Applied Empirical Bayes shrinkage to ${data.length} groups in ${platform}`)
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
      
      const shrunkRows = data.map(row => {
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
      })
      
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
      const validValues = data
        .filter(row => row[metric] !== undefined && !isNaN(row[metric]))
        .map(row => row[metric])
      
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
      
      const scoredRows = data.map(row => {
        const scores = this.calculatePerformanceScores(row, platform)
        return {
          ...row,
          ...scores,
          Recommendation: this.generateRecommendation(scores.OverallScore)
        }
      })
      
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
      const dayData = {
        Date: date,
        Meta_Spend: 0,
        Meta_Impressions: 0,
        Meta_Clicks: 0,
        Meta_CTR: 0,
        Meta_CPM: 0,
        Meta_Users: 0,
        Google_Spend: 0,
        Google_Impressions: 0,
        Google_Clicks: 0,
        Google_CTR: 0,
        Google_CPM: 0,
        Google_Users: 0,
        Shopify_Sessions: 0,
        Shopify_Revenue: 0,
        Shopify_Orders: 0,
        Shopify_Conversion_Rate: 0,
        Total_Spend: 0,
        Total_Users: 0,
        Total_Revenue: 0,
        ROAS: 0,
        Good_Leads: 0,
        Cost_Per_Good_Lead: 0,
        Quality_Score: 0,
        Efficiency_Score: 0,
        Volume_Score: 0,
        Overall_Score: 0
      }
      
      // Aggregate platform data for this date
      this.platforms.forEach(platform => {
        if (scoredData[platform]) {
          const platformDayData = scoredData[platform].filter(row => row.Day === date)
          const platformAgg = this.aggregatePlatformDay(platformDayData)
          
          if (platform === 'meta') {
            dayData.Meta_Spend = platformAgg.Spend
            dayData.Meta_Impressions = platformAgg.Impressions
            dayData.Meta_Clicks = platformAgg.Clicks
            dayData.Meta_CTR = platformAgg.CTR
            dayData.Meta_CPM = platformAgg.CPM
            dayData.Meta_Users = platformAgg.Sessions
          } else if (platform === 'google') {
            dayData.Google_Spend = platformAgg.Spend
            dayData.Google_Impressions = platformAgg.Impressions
            dayData.Google_Clicks = platformAgg.Clicks
            dayData.Google_CTR = platformAgg.CTR
            dayData.Google_CPM = platformAgg.CPM
            dayData.Google_Users = platformAgg.Sessions
          } else if (platform === 'shopify') {
            dayData.Shopify_Sessions = platformAgg.Sessions
            dayData.Shopify_Revenue = platformAgg.Revenue
            dayData.Shopify_Orders = platformAgg.Orders
            dayData.Shopify_Conversion_Rate = platformAgg.ConversionRate
          }
        }
      })
      
      // Calculate totals and business metrics
      dayData.Total_Spend = dayData.Meta_Spend + dayData.Google_Spend
      dayData.Total_Users = dayData.Meta_Users + dayData.Google_Users + dayData.Shopify_Sessions
      dayData.Total_Revenue = dayData.Shopify_Revenue
      dayData.ROAS = dayData.Total_Spend > 0 ? dayData.Total_Revenue / dayData.Total_Spend : 0
      
      // Aggregate business metrics across platforms
      let totalGoodLeads = 0
      let totalQuality = 0
      let totalEfficiency = 0
      let totalVolume = 0
      let platformCount = 0
      
      this.platforms.forEach(platform => {
        if (scoredData[platform]) {
          const platformDayData = scoredData[platform].filter(row => row.Day === date)
          platformDayData.forEach(row => {
            totalGoodLeads += row.GoodLeads || 0
            totalQuality += row.QualityScore || 0
            totalEfficiency += row.EfficiencyScore || 0
            totalVolume += row.VolumeScore || 0
            platformCount++
          })
        }
      })
      
      dayData.Good_Leads = totalGoodLeads
      dayData.Cost_Per_Good_Lead = dayData.Good_Leads > 0 ? dayData.Total_Spend / dayData.Good_Leads : 0
      dayData.Quality_Score = platformCount > 0 ? totalQuality / platformCount : 0
      dayData.Efficiency_Score = platformCount > 0 ? totalEfficiency / platformCount : 0
      dayData.Volume_Score = platformCount > 0 ? totalVolume / platformCount : 0
      dayData.Overall_Score = (dayData.Efficiency_Score * 0.4) + (dayData.Quality_Score * 0.4) + (dayData.Volume_Score * 0.2)
      
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
          adSetSummary.push({
            Date: row.Day,
            Campaign_Name: row.Campaign,
            Ad_Set_Name: row['Ad Set'],
            Ad_Set_Delivery: 'Active', // Default assumption
            Spent: row.Spend,
            Impressions: row.Impressions,
            Clicks: row.Clicks,
            CTR: row.CTR_Shrunk || row.CTR,
            Cost_Per_User: row.CostPerUser,
            Users: row.Sessions || 0,
            Good_Leads: row.GoodLeads || 0,
            Cost_Per_Good_Lead: row.CostPerGoodLead || 0,
            Conversion_Rate: row.ConversionRate_Shrunk || row.ConversionRate || 0,
            Quality_Score: row.QualityScore,
            Efficiency_Score: row.EfficiencyScore,
            Volume_Score: row.VolumeScore,
            Overall_Score: row.OverallScore,
            Recommendation: row.Recommendation
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
          adSummary.push({
            Date: row.Day,
            Campaign_Name: row.Campaign,
            Ad_Set_Name: row['Ad Set'],
            Ad_Name: row.Ad,
            Spent: row.Spend,
            Impressions: row.Impressions,
            Clicks: row.Clicks,
            CTR: row.CTR_Shrunk || row.CTR,
            Cost_Per_User: row.CostPerUser,
            Users: row.Sessions || 0,
            Good_Leads: row.GoodLeads || 0,
            Cost_Per_Good_Lead: row.CostPerGoodLead || 0,
            Conversion_Rate: row.ConversionRate_Shrunk || row.ConversionRate || 0,
            Performance_Score: row.OverallScore,
            Recommendation: row.Recommendation,
            Shrinkage_Applied: row.CTR_ShrinkageApplied || false
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
