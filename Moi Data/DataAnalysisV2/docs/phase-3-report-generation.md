# Phase 3: Report Generation & Julius V7 Porting

## Overview

Phase 3 implements the complete Julius V7 analytics pipeline as a JavaScript-based system, enabling users to generate comprehensive marketing reports with attribution analysis, performance scoring, and business metrics. This phase ports the Jupyter notebook logic into a production-ready web application.

## Phase 3 Goals

- 📊 Complete Julius V7 analytics pipeline in JavaScript
- 📈 Generate 3 CSV reports (top-level, ad set, ad-level metrics)
- 🎯 Implement attribution logic (Meta: Day+Campaign+AdSet+Ad, Google: Day+Campaign)
- 🧮 Business metrics calculation with Empirical Bayes shrinkage
- 🏆 Performance scoring and recommendation engine
- 📱 Interactive report generation interface

## Implementation Timeline: Week 3

### Day 1-2: Data Harmonization & Attribution Logic
### Day 3-4: Julius V7 Business Metrics & Scoring
### Day 5-7: Report Generation Interface & CSV Export

---

## Technical Implementation

### 1. Julius V7 Analytics Engine

#### Core Analytics Engine (`lib/julius-v7-engine.js`)
```javascript
export class JuliusV7Engine {
  constructor() {
    this.globalRates = {};
    this.empiricalBayesPrior = 50; // Prior visitor count for shrinkage
  }

  async processAnalytics(dateRange, platforms = ['meta', 'google', 'shopify']) {
    console.log(`Processing Julius V7 analytics for ${dateRange.start} to ${dateRange.end}`);
    
    // Step 1: Extract data from Supabase
    const rawData = await this.extractData(dateRange, platforms);
    
    // Step 2: Harmonize data across platforms
    const harmonizedData = await this.harmonizeData(rawData);
    
    // Step 3: Apply attribution logic
    const attributedData = await this.applyAttribution(harmonizedData);
    
    // Step 4: Calculate business metrics
    const metricsData = await this.calculateBusinessMetrics(attributedData);
    
    // Step 5: Apply Empirical Bayes shrinkage
    const shrunkData = await this.applyEmpiricalBayesShrinkage(metricsData);
    
    // Step 6: Generate performance scores
    const scoredData = await this.generatePerformanceScores(shrunkData);
    
    // Step 7: Create aggregated views
    const aggregatedData = await this.createAggregatedViews(scoredData);
    
    return {
      unified: scoredData,
      aggregated: aggregatedData,
      summary: this.generateSummary(scoredData),
      validation: this.validateResults(rawData, scoredData)
    };
  }

  async extractData(dateRange, platforms) {
    const supabase = this.getSupabaseClient();
    const data = {};

    for (const platform of platforms) {
      const tableName = `${platform}_import_data`;
      
      const { data: platformData, error } = await supabase
        .from(tableName)
        .select('*')
        .gte('day', dateRange.start)
        .lte('day', dateRange.end)
        .order('day', { ascending: true });

      if (error) {
        throw new Error(`Failed to extract ${platform} data: ${error.message}`);
      }

      data[platform] = platformData || [];
    }

    return data;
  }

  async harmonizeData(rawData) {
    const harmonized = {};

    // Harmonize Meta data
    if (rawData.meta) {
      harmonized.meta = rawData.meta.map(row => ({
        day: this.standardizeDate(row.day),
        source: 'Meta',
        campaign: this.cleanText(row.campaign_name || row['Campaign name']),
        ad_set: this.cleanText(row.ad_set_name || row['Ad set name']),
        ad: this.cleanText(row.ad_name || row['Ad name']),
        spend: this.parseNumeric(row.amount_spent || row['Amount spent (INR)']),
        ctr: this.parsePercentage(row.ctr || row['CTR (link click-through rate)']),
        cpm: this.parseNumeric(row.cpm || row['CPM (cost per 1,000 impressions)']),
        ad_set_delivery: row.ad_set_delivery || row['Ad Set Delivery'] || null
      }));
    }

    // Harmonize Google data
    if (rawData.google) {
      harmonized.google = rawData.google.map(row => ({
        day: this.standardizeDate(row.day),
        source: 'Google',
        campaign: this.cleanText(row.campaign || row['Campaign']),
        ad_set: null, // Google data is campaign-level only
        ad: null,
        spend: this.parseNumeric(row.cost || row['Cost']),
        ctr: this.parsePercentage(row.ctr || row['CTR']),
        cpm: this.parseNumeric(row.cpm || row['Avg. CPM']),
        ad_set_delivery: null
      }));
    }

    // Harmonize Shopify data
    if (rawData.shopify) {
      harmonized.shopify = rawData.shopify.map(row => ({
        day: this.standardizeDate(row.day),
        utm_campaign: this.cleanText(row.utm_campaign || row['UTM campaign']),
        utm_term: this.cleanText(row.utm_term || row['UTM term']),
        utm_content: this.cleanText(row.utm_content || row['UTM content']),
        visitors: this.parseNumeric(row.online_store_visitors || row['Online store visitors']),
        sessions_completed_checkout: this.parseNumeric(row.sessions_completed_checkout || row['Sessions that completed checkout']),
        sessions_reached_checkout: this.parseNumeric(row.sessions_reached_checkout || row['Sessions that reached checkout']),
        sessions_cart_additions: this.parseNumeric(row.sessions_cart_additions || row['Sessions with cart additions']),
        pageviews: this.parseNumeric(row.pageviews || row['Pageviews']),
        avg_session_duration: this.parseNumeric(row.average_session_duration || row['Average session duration'])
      }));
    }

    return harmonized;
  }

  async applyAttribution(harmonizedData) {
    const { meta, google, shopify } = harmonizedData;
    const attributed = [];

    // Step 1: Aggregate Shopify data by attribution keys
    const shopifyMeta = this.aggregateShopifyForMeta(shopify);
    const shopifyGoogle = this.aggregateShopifyForGoogle(shopify);

    // Step 2: Attribute Shopify data to Meta (Day + Campaign + AdSet + Ad)
    if (meta) {
      for (const metaRow of meta) {
        const attributionKey = this.createMetaAttributionKey(metaRow);
        const shopifyAttribution = shopifyMeta.get(attributionKey) || this.getEmptyShopifyMetrics();
        
        attributed.push({
          ...metaRow,
          ...shopifyAttribution,
          attribution_level: 'ad'
        });
      }
    }

    // Step 3: Attribute Shopify data to Google (Day + Campaign only)
    if (google) {
      for (const googleRow of google) {
        const attributionKey = this.createGoogleAttributionKey(googleRow);
        const shopifyAttribution = shopifyGoogle.get(attributionKey) || this.getEmptyShopifyMetrics();
        
        attributed.push({
          ...googleRow,
          ...shopifyAttribution,
          attribution_level: 'campaign'
        });
      }
    }

    return attributed;
  }

  aggregateShopifyForMeta(shopifyData) {
    const aggregated = new Map();

    shopifyData.forEach(row => {
      // Meta attribution: utm_campaign → campaign, utm_term → ad_set, utm_content → ad
      const key = this.createMetaAttributionKey({
        day: row.day,
        campaign: row.utm_campaign,
        ad_set: row.utm_term,
        ad: row.utm_content
      });

      if (!aggregated.has(key)) {
        aggregated.set(key, this.getEmptyShopifyMetrics());
      }

      const existing = aggregated.get(key);
      aggregated.set(key, this.addShopifyMetrics(existing, row));
    });

    return aggregated;
  }

  aggregateShopifyForGoogle(shopifyData) {
    const aggregated = new Map();

    shopifyData.forEach(row => {
      // Google attribution: utm_campaign → campaign only
      const key = this.createGoogleAttributionKey({
        day: row.day,
        campaign: row.utm_campaign
      });

      if (!aggregated.has(key)) {
        aggregated.set(key, this.getEmptyShopifyMetrics());
      }

      const existing = aggregated.get(key);
      aggregated.set(key, this.addShopifyMetrics(existing, row));
    });

    return aggregated;
  }

  createMetaAttributionKey(row) {
    return `${row.day}|${this.normalizeForKey(row.campaign)}|${this.normalizeForKey(row.ad_set)}|${this.normalizeForKey(row.ad)}`;
  }

  createGoogleAttributionKey(row) {
    return `${row.day}|${this.normalizeForKey(row.campaign)}`;
  }

  normalizeForKey(value) {
    if (!value) return 'null';
    return value.toString().toLowerCase().trim().replace(/[^\w]/g, '_');
  }

  getEmptyShopifyMetrics() {
    return {
      visitors: 0,
      sessions_completed_checkout: 0,
      sessions_reached_checkout: 0,
      sessions_cart_additions: 0,
      pageviews: 0,
      avg_session_duration: 0
    };
  }

  addShopifyMetrics(existing, newData) {
    return {
      visitors: existing.visitors + newData.visitors,
      sessions_completed_checkout: existing.sessions_completed_checkout + newData.sessions_completed_checkout,
      sessions_reached_checkout: existing.sessions_reached_checkout + newData.sessions_reached_checkout,
      sessions_cart_additions: existing.sessions_cart_additions + newData.sessions_cart_additions,
      pageviews: existing.pageviews + newData.pageviews,
      avg_session_duration: this.weightedAverage(
        existing.avg_session_duration, existing.visitors,
        newData.avg_session_duration, newData.visitors
      )
    };
  }

  weightedAverage(val1, weight1, val2, weight2) {
    const totalWeight = weight1 + weight2;
    if (totalWeight === 0) return 0;
    return ((val1 * weight1) + (val2 * weight2)) / totalWeight;
  }

  async calculateBusinessMetrics(attributedData) {
    return attributedData.map(row => {
      const visitors = row.visitors || 0;
      const avgSessionDuration = row.avg_session_duration || 0;
      const pageviews = row.pageviews || 0;

      // Business logic: Good lead criteria
      const goodLeadRate = this.calculateGoodLeadRate(avgSessionDuration, pageviews, visitors);
      const goodLeads = visitors * goodLeadRate;

      // Session quality metrics (heuristic estimates based on averages)
      const rate1min = this.calculateRate1Min(avgSessionDuration);
      const users1min = visitors * rate1min;
      const atc1min = (row.sessions_cart_additions || 0) * rate1min;
      const reached1min = (row.sessions_reached_checkout || 0) * rate1min;

      // Cost-per metrics
      const spend = row.spend || 0;
      const cpc = visitors > 0 ? spend / visitors : 0;
      const costPerGoodLead = goodLeads > 0 ? spend / goodLeads : 0;
      const costPerCheckout = row.sessions_completed_checkout > 0 ? spend / row.sessions_completed_checkout : 0;

      // Conversion rates
      const checkoutRate = visitors > 0 ? row.sessions_completed_checkout / visitors : 0;
      const atcRate = visitors > 0 ? row.sessions_cart_additions / visitors : 0;

      return {
        ...row,
        // Derived metrics
        good_leads: goodLeads,
        good_lead_rate: goodLeadRate,
        users_1min: users1min,
        atc_1min: atc1min,
        reached_1min: reached1min,
        // Cost metrics
        cpc,
        cost_per_good_lead: costPerGoodLead,
        cost_per_checkout: costPerCheckout,
        // Conversion metrics
        checkout_rate: checkoutRate,
        atc_rate: atcRate
      };
    });
  }

  calculateGoodLeadRate(avgSessionDuration, pageviews, visitors) {
    // Good lead: Average session duration >= 60s AND Pageviews >= 5
    // Heuristic: estimate rate based on session duration and pageviews per visitor
    
    const sessionQualityScore = Math.min(avgSessionDuration / 300, 1); // Scale to 5 minutes
    const pageviewsPerUser = visitors > 0 ? pageviews / visitors : 0;
    const pageviewQualityScore = Math.min(pageviewsPerUser / 5, 1); // Scale to 5 pages
    
    return sessionQualityScore * pageviewQualityScore;
  }

  calculateRate1Min(avgSessionDuration) {
    // Estimate rate of users with session > 1 minute based on average
    // Heuristic: linear scale up to 5 minutes
    return Math.min(avgSessionDuration / 300, 1);
  }

  async applyEmpiricalBayesShrinkage(metricsData) {
    // Calculate global rates for shrinkage
    const globalRates = this.calculateGlobalRates(metricsData);
    
    return metricsData.map(row => {
      const visitors = row.visitors || 0;
      const prior = this.empiricalBayesPrior;

      // Shrink good lead rate
      const priorGoodLeads = globalRates.goodLeadRate * prior;
      const posteriorGoodLeads = priorGoodLeads + (row.good_leads || 0);
      const posteriorVisitors = prior + visitors;
      const shrunkGoodLeadRate = posteriorVisitors > 0 ? posteriorGoodLeads / posteriorVisitors : globalRates.goodLeadRate;

      // Shrink checkout rate
      const priorCheckouts = globalRates.checkoutRate * prior;
      const posteriorCheckouts = priorCheckouts + (row.sessions_completed_checkout || 0);
      const shrunkCheckoutRate = posteriorVisitors > 0 ? posteriorCheckouts / posteriorVisitors : globalRates.checkoutRate;

      // Recalculate cost-per metrics with shrunk rates
      const shrunkCostPerGoodLead = visitors > 0 && shrunkGoodLeadRate > 0 ? 
        (row.spend || 0) / (visitors * shrunkGoodLeadRate) : 0;
      
      const shrunkCostPerCheckout = visitors > 0 && shrunkCheckoutRate > 0 ? 
        (row.spend || 0) / (visitors * shrunkCheckoutRate) : 0;

      return {
        ...row,
        shrunk_good_lead_rate: shrunkGoodLeadRate,
        shrunk_checkout_rate: shrunkCheckoutRate,
        shrunk_cost_per_good_lead: shrunkCostPerGoodLead,
        shrunk_cost_per_checkout: shrunkCostPerCheckout
      };
    });
  }

  calculateGlobalRates(data) {
    const totals = data.reduce((acc, row) => {
      acc.visitors += row.visitors || 0;
      acc.goodLeads += row.good_leads || 0;
      acc.checkouts += row.sessions_completed_checkout || 0;
      return acc;
    }, { visitors: 0, goodLeads: 0, checkouts: 0 });

    return {
      goodLeadRate: totals.visitors > 0 ? totals.goodLeads / totals.visitors : 0,
      checkoutRate: totals.visitors > 0 ? totals.checkouts / totals.visitors : 0
    };
  }

  async generatePerformanceScores(shrunkData) {
    // Rank data for scoring
    const rankedData = this.rankPerformanceMetrics(shrunkData);
    
    return rankedData.map(row => {
      // Performance score components
      const efficiency = this.calculateEfficiencyScore(row, rankedData);
      const quality = row.shrunk_good_lead_rate || 0;
      const volume = this.calculateVolumeScore(row.visitors || 0);

      // Weighted ad score
      const adScore = (0.4 * efficiency) + (0.4 * quality) + (0.2 * volume);

      // Confidence and recommendation
      const confidence = this.calculateConfidence(row);
      const recommendation = this.generateRecommendation(adScore, confidence);

      return {
        ...row,
        efficiency_score: efficiency,
        quality_score: quality,
        volume_score: volume,
        ad_score: Math.max(0, Math.min(1, adScore)),
        confidence_level: confidence,
        recommendation
      };
    });
  }

  rankPerformanceMetrics(data) {
    // Sort by cost per checkout (ascending - lower is better)
    const sorted = [...data].sort((a, b) => 
      (a.shrunk_cost_per_checkout || Infinity) - (b.shrunk_cost_per_checkout || Infinity)
    );
    
    return sorted.map((row, index) => ({
      ...row,
      efficiency_rank: index + 1,
      efficiency_percentile: (sorted.length - index) / sorted.length
    }));
  }

  calculateEfficiencyScore(row, allData) {
    // Use percentile rank for efficiency (lower cost = higher efficiency)
    return row.efficiency_percentile || 0;
  }

  calculateVolumeScore(visitors) {
    // Volume score: scale visitors to score (capped at 500 visitors = 1.0)
    return Math.min(visitors / 500, 1.0);
  }

  calculateConfidence(row) {
    const visitors = row.visitors || 0;
    
    if (visitors >= 100) return 'high';
    if (visitors >= 30) return 'medium';
    return 'low';
  }

  generateRecommendation(adScore, confidence) {
    if (adScore >= 0.9 && confidence !== 'low') return 'Scale';
    if (adScore >= 0.8 && confidence !== 'low') return 'Test-to-Scale';
    if (adScore >= 0.7) return 'Optimize';
    return 'Pause/Fix';
  }

  async createAggregatedViews(scoredData) {
    // Ad-level aggregation (for final reports)
    const adAggregated = this.aggregateByLevel(scoredData, ['source', 'campaign', 'ad_set', 'ad']);
    
    return {
      adLevel: adAggregated,
      adSetLevel: this.aggregateByLevel(scoredData, ['source', 'campaign', 'ad_set']),
      campaignLevel: this.aggregateByLevel(scoredData, ['source', 'campaign']),
      daily: this.aggregateByLevel(scoredData, ['day'])
    };
  }

  aggregateByLevel(data, groupByFields) {
    const groups = new Map();

    data.forEach(row => {
      const key = groupByFields.map(field => row[field] || 'null').join('|');
      
      if (!groups.has(key)) {
        groups.set(key, {
          ...this.createEmptyAggregation(),
          ...Object.fromEntries(groupByFields.map(field => [field, row[field]]))
        });
      }

      const group = groups.get(key);
      this.addToAggregation(group, row);
    });

    // Recalculate rates and scores for aggregated data
    return Array.from(groups.values()).map(group => 
      this.recalculateAggregatedMetrics(group)
    );
  }

  createEmptyAggregation() {
    return {
      spend: 0,
      visitors: 0,
      good_leads: 0,
      sessions_completed_checkout: 0,
      sessions_reached_checkout: 0,
      sessions_cart_additions: 0,
      pageviews: 0,
      users_1min: 0,
      atc_1min: 0,
      reached_1min: 0,
      days_active: 0
    };
  }

  addToAggregation(aggregate, row) {
    aggregate.spend += row.spend || 0;
    aggregate.visitors += row.visitors || 0;
    aggregate.good_leads += row.good_leads || 0;
    aggregate.sessions_completed_checkout += row.sessions_completed_checkout || 0;
    aggregate.sessions_reached_checkout += row.sessions_reached_checkout || 0;
    aggregate.sessions_cart_additions += row.sessions_cart_additions || 0;
    aggregate.pageviews += row.pageviews || 0;
    aggregate.users_1min += row.users_1min || 0;
    aggregate.atc_1min += row.atc_1min || 0;
    aggregate.reached_1min += row.reached_1min || 0;
    aggregate.days_active += 1;
  }

  recalculateAggregatedMetrics(aggregate) {
    // Recalculate rates and metrics for aggregated data
    const visitors = aggregate.visitors || 0;
    const spend = aggregate.spend || 0;

    // Apply Empirical Bayes shrinkage again for aggregated data
    const globalGoodLeadRate = this.globalRates.goodLeadRate || 0;
    const globalCheckoutRate = this.globalRates.checkoutRate || 0;
    const prior = this.empiricalBayesPrior;

    const shrunkGoodLeadRate = visitors > 0 ? 
      (globalGoodLeadRate * prior + aggregate.good_leads) / (prior + visitors) : 
      globalGoodLeadRate;

    const shrunkCheckoutRate = visitors > 0 ? 
      (globalCheckoutRate * prior + aggregate.sessions_completed_checkout) / (prior + visitors) : 
      globalCheckoutRate;

    return {
      ...aggregate,
      // Recalculated rates
      good_lead_rate: visitors > 0 ? aggregate.good_leads / visitors : 0,
      checkout_rate: visitors > 0 ? aggregate.sessions_completed_checkout / visitors : 0,
      atc_rate: visitors > 0 ? aggregate.sessions_cart_additions / visitors : 0,
      // Cost metrics
      cpc: visitors > 0 ? spend / visitors : 0,
      cost_per_good_lead: aggregate.good_leads > 0 ? spend / aggregate.good_leads : 0,
      cost_per_checkout: aggregate.sessions_completed_checkout > 0 ? spend / aggregate.sessions_completed_checkout : 0,
      // Shrunk metrics
      shrunk_good_lead_rate: shrunkGoodLeadRate,
      shrunk_checkout_rate: shrunkCheckoutRate,
      shrunk_cost_per_good_lead: visitors > 0 && shrunkGoodLeadRate > 0 ? spend / (visitors * shrunkGoodLeadRate) : 0,
      shrunk_cost_per_checkout: visitors > 0 && shrunkCheckoutRate > 0 ? spend / (visitors * shrunkCheckoutRate) : 0
    };
  }

  // Utility methods
  standardizeDate(date) {
    if (!date) return null;
    try {
      return new Date(date).toISOString().split('T')[0];
    } catch {
      return null;
    }
  }

  cleanText(text) {
    if (!text) return '';
    return text.toString().trim();
  }

  parseNumeric(value) {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    
    const cleaned = value.toString().replace(/[₹$,€£%]/g, '').trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  parsePercentage(value) {
    const numeric = this.parseNumeric(value);
    // If the value contains %, it's already a percentage, otherwise convert
    const isPercentage = value && value.toString().includes('%');
    return isPercentage ? numeric / 100 : numeric;
  }

  getSupabaseClient() {
    // Import and return configured Supabase client
    const { createClient } = require('@supabase/supabase-js');
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }

  generateSummary(data) {
    const totalSpend = data.reduce((sum, row) => sum + (row.spend || 0), 0);
    const totalVisitors = data.reduce((sum, row) => sum + (row.visitors || 0), 0);
    const totalCheckouts = data.reduce((sum, row) => sum + (row.sessions_completed_checkout || 0), 0);
    
    return {
      totalSpend,
      totalVisitors,
      totalCheckouts,
      overallConversionRate: totalVisitors > 0 ? totalCheckouts / totalVisitors : 0,
      averageAdsScore: data.length > 0 ? 
        data.reduce((sum, row) => sum + (row.ad_score || 0), 0) / data.length : 0,
      recommendationBreakdown: this.calculateRecommendationBreakdown(data)
    };
  }

  calculateRecommendationBreakdown(data) {
    const breakdown = { 'Scale': 0, 'Test-to-Scale': 0, 'Optimize': 0, 'Pause/Fix': 0 };
    
    data.forEach(row => {
      const rec = row.recommendation || 'Pause/Fix';
      breakdown[rec] = (breakdown[rec] || 0) + 1;
    });

    return breakdown;
  }

  validateResults(rawData, processedData) {
    // Validation checks to ensure data integrity
    const metaSpend = rawData.meta ? rawData.meta.reduce((sum, row) => 
      sum + this.parseNumeric(row.amount_spent || row['Amount spent (INR)']), 0
    ) : 0;
    
    const googleSpend = rawData.google ? rawData.google.reduce((sum, row) => 
      sum + this.parseNumeric(row.cost || row['Cost']), 0
    ) : 0;

    const processedMetaSpend = processedData
      .filter(row => row.source === 'Meta')
      .reduce((sum, row) => sum + (row.spend || 0), 0);
    
    const processedGoogleSpend = processedData
      .filter(row => row.source === 'Google')
      .reduce((sum, row) => sum + (row.spend || 0), 0);

    return {
      spendReconciliation: {
        meta: {
          original: metaSpend,
          processed: processedMetaSpend,
          matches: Math.abs(metaSpend - processedMetaSpend) < 0.01
        },
        google: {
          original: googleSpend,
          processed: processedGoogleSpend,
          matches: Math.abs(googleSpend - processedGoogleSpend) < 0.01
        }
      },
      dataIntegrity: {
        rowsProcessed: processedData.length,
        rowsWithAttribution: processedData.filter(row => (row.visitors || 0) > 0).length,
        attributionCoverage: processedData.length > 0 ? 
          processedData.filter(row => (row.visitors || 0) > 0).length / processedData.length : 0
      }
    };
  }
}
```

### 2. Report Generation Interface

#### Reports Page (`pages/reports.js`)
```jsx
import { useState, useEffect } from 'react';
import { JuliusV7Engine } from '../lib/julius-v7-engine';
import DateRangeSelector from '../components/DateRangeSelector';
import ProcessingProgress from '../components/ProcessingProgress';
import ReportResults from '../components/ReportResults';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    type: 'weekly', // daily, weekly, custom
    start: null,
    end: null
  });
  
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerateReports = async () => {
    setProcessing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateRange })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResults(data.results);
      } else {
        setError(data.error || 'Report generation failed');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Julius V7 Analytics Reports
          </h1>
          <p className="text-gray-600 mt-2">
            Generate comprehensive marketing performance reports
          </p>
        </header>

        {!results ? (
          <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
            <DateRangeSelector
              value={dateRange}
              onChange={setDateRange}
              disabled={processing}
            />
            
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleGenerateReports}
                disabled={processing || !dateRange.start || !dateRange.end}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 font-medium"
              >
                {processing ? 'Generating Reports...' : 'Generate Reports'}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {processing && (
              <ProcessingProgress className="mt-6" />
            )}
          </div>
        ) : (
          <ReportResults
            results={results}
            dateRange={dateRange}
            onGenerateNew={() => {
              setResults(null);
              setError(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
```

#### Date Range Selector Component (`components/DateRangeSelector.jsx`)
```jsx
import { useState, useEffect } from 'react';

export default function DateRangeSelector({ value, onChange, disabled }) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    if (localValue.type === 'daily') {
      const today = new Date().toISOString().split('T')[0];
      setLocalValue(prev => ({ ...prev, start: today, end: today }));
    } else if (localValue.type === 'weekly') {
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay() - 6));
      const weekEnd = new Date(today.setDate(today.getDate() + 6));
      
      setLocalValue(prev => ({
        ...prev,
        start: weekStart.toISOString().split('T')[0],
        end: weekEnd.toISOString().split('T')[0]
      }));
    }
  }, [localValue.type]);

  useEffect(() => {
    onChange(localValue);
  }, [localValue, onChange]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Report Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['daily', 'weekly', 'custom'].map(type => (
            <button
              key={type}
              onClick={() => setLocalValue(prev => ({ ...prev, type }))}
              disabled={disabled}
              className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize ${
                localValue.type === type
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              } disabled:opacity-50`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {localValue.type === 'custom' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={localValue.start || ''}
              onChange={(e) => setLocalValue(prev => ({ ...prev, start: e.target.value }))}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={localValue.end || ''}
              onChange={(e) => setLocalValue(prev => ({ ...prev, end: e.target.value }))}
              disabled={disabled}
              min={localValue.start}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
        </div>
      )}

      {localValue.start && localValue.end && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Selected Range:</strong> {localValue.start} to {localValue.end}
            {' '}({Math.ceil((new Date(localValue.end) - new Date(localValue.start)) / (1000 * 60 * 60 * 24)) + 1} days)
          </p>
        </div>
      )}
    </div>
  );
}
```

### 3. CSV Report Generation

#### Report Generation API (`api/reports/generate.js`)
```javascript
import { JuliusV7Engine } from '../../lib/julius-v7-engine';
import { CSVExporter } from '../../lib/csv-exporter';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { dateRange } = req.body;
    
    // Validate date range
    if (!dateRange.start || !dateRange.end) {
      return res.status(400).json({ 
        success: false, 
        error: 'Start and end dates are required' 
      });
    }

    // Initialize Julius V7 engine
    const engine = new JuliusV7Engine();
    
    // Process analytics
    const analyticsResults = await engine.processAnalytics(dateRange);
    
    // Generate CSV files
    const csvExporter = new CSVExporter();
    const csvFiles = await csvExporter.generateReports(analyticsResults, dateRange);
    
    res.status(200).json({
      success: true,
      results: {
        analytics: analyticsResults,
        csvFiles,
        summary: analyticsResults.summary,
        validation: analyticsResults.validation
      }
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
```

#### CSV Exporter Utility (`lib/csv-exporter.js`)
```javascript
import Papa from 'papaparse';
import fs from 'fs/promises';
import path from 'path';

export class CSVExporter {
  constructor() {
    this.outputDir = path.join(process.cwd(), 'temp', 'reports');
  }

  async generateReports(analyticsResults, dateRange) {
    await this.ensureOutputDirectory();
    
    const dateStr = this.formatDateRange(dateRange);
    const reports = {};

    // Generate Top-level Metrics Report
    reports.topLevel = await this.generateTopLevelReport(analyticsResults, dateStr);
    
    // Generate Ad Set Metrics Report
    reports.adSet = await this.generateAdSetReport(analyticsResults, dateStr);
    
    // Generate Ad-level Metrics Report
    reports.adLevel = await this.generateAdLevelReport(analyticsResults, dateStr);

    return reports;
  }

  async generateTopLevelReport(analyticsResults, dateStr) {
    const { unified, aggregated } = analyticsResults;
    
    // Aggregate by day and platform
    const dailyData = this.aggregateDaily(unified);
    
    // Transform to top-level format
    const topLevelData = dailyData.map(row => ({
      'Date': row.day,
      'Meta Spend': row.meta_spend || 0,
      'Meta CTR': row.meta_ctr || 0,
      'Meta CPM': row.meta_cpm || 0,
      'Google Spend': row.google_spend || 0,
      'Google CTR': row.google_ctr || 0,
      'Google CPM': row.google_cpm || 0,
      'Shopify Total Users': row.total_visitors || 0,
      'Shopify Total ATC': row.total_atc || 0,
      'Shopify Total Reached Checkout': row.total_reached_checkout || 0,
      'Shopify Total Abandoned Checkout': row.total_abandoned_checkout || 0,
      'Shopify Session Duration': row.avg_session_duration || 0,
      'Users with Session above 1 min': row.users_1min || 0,
      'Users with Above 5 page views and above 1 min': row.good_leads || 0,
      'ATC with session duration above 1 min': row.atc_1min || 0,
      'Reached Checkout with session duration above 1 min': row.reached_1min || 0
    }));

    const csv = Papa.unparse(topLevelData);
    const filename = `toplevel_${dateStr}.csv`;
    const filepath = path.join(this.outputDir, filename);
    
    await fs.writeFile(filepath, csv, 'utf8');
    
    return {
      filename,
      filepath,
      url: `/api/reports/download/${filename}`,
      rowCount: topLevelData.length
    };
  }

  async generateAdSetReport(analyticsResults, dateStr) {
    const { aggregated } = analyticsResults;
    
    // Filter Meta data and aggregate by ad set
    const adSetData = aggregated.adSetLevel
      .filter(row => row.source === 'Meta' && row.ad_set)
      .map(row => ({
        'Date': row.day || 'Aggregated',
        'Campaign name': row.campaign || '',
        'Ad Set Name': row.ad_set || '',
        'Ad Set Delivery': row.ad_set_delivery || '',
        'Spent': row.spend || 0,
        'Cost per user': row.cpc || 0,
        'Users': row.visitors || 0,
        'ATC': row.sessions_cart_additions || 0,
        'Reached Checkout': row.sessions_reached_checkout || 0,
        'Conversions': row.sessions_completed_checkout || 0,
        'Average session duration': row.avg_session_duration || 0,
        'Cost per 1 min user': row.users_1min > 0 ? (row.spend || 0) / row.users_1min : 0,
        '1min user/ total users (%)': row.visitors > 0 ? (row.users_1min / row.visitors * 100) : 0,
        'Users with Session above 1 min': row.users_1min || 0,
        'ATC with session duration above 1 min': row.atc_1min || 0,
        'Reached Checkout with session duration above 1 min': row.reached_1min || 0,
        'Users with Above 5 page views and above 1 min': row.good_leads || 0
      }));

    const csv = Papa.unparse(adSetData);
    const filename = `adset_${dateStr}.csv`;
    const filepath = path.join(this.outputDir, filename);
    
    await fs.writeFile(filepath, csv, 'utf8');
    
    return {
      filename,
      filepath,
      url: `/api/reports/download/${filename}`,
      rowCount: adSetData.length
    };
  }

  async generateAdLevelReport(analyticsResults, dateStr) {
    const { aggregated } = analyticsResults;
    
    // Filter Meta data at ad level
    const adLevelData = aggregated.adLevel
      .filter(row => row.source === 'Meta' && row.ad)
      .map(row => ({
        'Date': row.day || 'Aggregated',
        'Campaign name': row.campaign || '',
        'Ad Set Name': row.ad_set || '',
        'Ad Name': row.ad || '',
        'Ad Set Delivery': row.ad_set_delivery || '',
        'Spent': row.spend || 0,
        'CTR': row.ctr || 0,
        'Cost per user': row.cpc || 0,
        'Users': row.visitors || 0,
        'ATC': row.sessions_cart_additions || 0,
        'Reached Checkout': row.sessions_reached_checkout || 0,
        'Conversions': row.sessions_completed_checkout || 0,
        'Average session duration': row.avg_session_duration || 0,
        'Cost per 1 min user': row.users_1min > 0 ? (row.spend || 0) / row.users_1min : 0,
        '1min user/ total users (%)': row.visitors > 0 ? (row.users_1min / row.visitors * 100) : 0,
        'Users with Session above 1 min': row.users_1min || 0,
        'ATC with session duration above 1 min': row.atc_1min || 0,
        'Reached Checkout with session duration above 1 min': row.reached_1min || 0,
        'Users with Above 5 page views and above 1 min': row.good_leads || 0
      }));

    const csv = Papa.unparse(adLevelData);
    const filename = `adlevel_${dateStr}.csv`;
    const filepath = path.join(this.outputDir, filename);
    
    await fs.writeFile(filepath, csv, 'utf8');
    
    return {
      filename,
      filepath,
      url: `/api/reports/download/${filename}`,
      rowCount: adLevelData.length
    };
  }

  aggregateDaily(unifiedData) {
    const dailyMap = new Map();

    unifiedData.forEach(row => {
      const day = row.day;
      
      if (!dailyMap.has(day)) {
        dailyMap.set(day, {
          day,
          meta_spend: 0,
          meta_ctr: 0,
          meta_cpm: 0,
          google_spend: 0,
          google_ctr: 0,
          google_cpm: 0,
          total_visitors: 0,
          total_atc: 0,
          total_reached_checkout: 0,
          total_completed_checkout: 0,
          users_1min: 0,
          good_leads: 0,
          atc_1min: 0,
          reached_1min: 0,
          meta_records: 0,
          google_records: 0,
          session_duration_sum: 0,
          session_duration_count: 0
        });
      }

      const dayData = dailyMap.get(day);
      
      if (row.source === 'Meta') {
        dayData.meta_spend += row.spend || 0;
        dayData.meta_ctr += row.ctr || 0;
        dayData.meta_cpm += row.cpm || 0;
        dayData.meta_records += 1;
      } else if (row.source === 'Google') {
        dayData.google_spend += row.spend || 0;
        dayData.google_ctr += row.ctr || 0;
        dayData.google_cpm += row.cpm || 0;
        dayData.google_records += 1;
      }
      
      // Shopify metrics
      dayData.total_visitors += row.visitors || 0;
      dayData.total_atc += row.sessions_cart_additions || 0;
      dayData.total_reached_checkout += row.sessions_reached_checkout || 0;
      dayData.total_completed_checkout += row.sessions_completed_checkout || 0;
      dayData.users_1min += row.users_1min || 0;
      dayData.good_leads += row.good_leads || 0;
      dayData.atc_1min += row.atc_1min || 0;
      dayData.reached_1min += row.reached_1min || 0;
      
      if (row.avg_session_duration) {
        dayData.session_duration_sum += row.avg_session_duration;
        dayData.session_duration_count += 1;
      }
    });

    return Array.from(dailyMap.values()).map(dayData => ({
      ...dayData,
      // Calculate averages
      meta_ctr: dayData.meta_records > 0 ? dayData.meta_ctr / dayData.meta_records : 0,
      meta_cpm: dayData.meta_records > 0 ? dayData.meta_cpm / dayData.meta_records : 0,
      google_ctr: dayData.google_records > 0 ? dayData.google_ctr / dayData.google_records : 0,
      google_cpm: dayData.google_records > 0 ? dayData.google_cpm / dayData.google_records : 0,
      avg_session_duration: dayData.session_duration_count > 0 ? 
        dayData.session_duration_sum / dayData.session_duration_count : 0,
      total_abandoned_checkout: Math.max(0, dayData.total_reached_checkout - dayData.total_completed_checkout)
    }));
  }

  formatDateRange(dateRange) {
    if (dateRange.type === 'daily') {
      return `daily_${dateRange.start}`;
    } else if (dateRange.type === 'weekly') {
      return `weekly_${dateRange.start}_to_${dateRange.end}`;
    } else {
      return `custom_${dateRange.start}_to_${dateRange.end}`;
    }
  }

  async ensureOutputDirectory() {
    try {
      await fs.access(this.outputDir);
    } catch {
      await fs.mkdir(this.outputDir, { recursive: true });
    }
  }
}
```

### 4. Report Results Interface

#### Report Results Component (`components/ReportResults.jsx`)
```jsx
import { useState } from 'react';

export default function ReportResults({ results, dateRange, onGenerateNew }) {
  const [activeTab, setActiveTab] = useState('summary');

  const { analytics, csvFiles, summary, validation } = results;

  return (
    <div className="space-y-6">
      {/* Header with key stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Report Results ({dateRange.start} to {dateRange.end})
          </h2>
          <button
            onClick={onGenerateNew}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Generate New Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">
              ₹{summary.totalSpend.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Spend</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {summary.totalVisitors.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Visitors</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">
              {(summary.overallConversionRate * 100).toFixed(2)}%
            </div>
            <div className="text-sm text-gray-600">Conversion Rate</div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(summary.averageAdsScore * 100)}
            </div>
            <div className="text-sm text-gray-600">Avg. Ad Score</div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'summary', label: 'Summary' },
              { id: 'downloads', label: 'Download Reports' },
              { id: 'validation', label: 'Validation' },
              { id: 'recommendations', label: 'Recommendations' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'summary' && (
            <SummaryTab analytics={analytics} summary={summary} />
          )}
          
          {activeTab === 'downloads' && (
            <DownloadsTab csvFiles={csvFiles} />
          )}
          
          {activeTab === 'validation' && (
            <ValidationTab validation={validation} />
          )}
          
          {activeTab === 'recommendations' && (
            <RecommendationsTab analytics={analytics} summary={summary} />
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryTab({ analytics, summary }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Performance Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(summary.recommendationBreakdown).map(([rec, count]) => (
            <div key={rec} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600">{rec}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Top Performing Ads</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-3 py-2 text-left">Campaign</th>
                <th className="border border-gray-200 px-3 py-2 text-left">Ad Set</th>
                <th className="border border-gray-200 px-3 py-2 text-left">Spend</th>
                <th className="border border-gray-200 px-3 py-2 text-left">Visitors</th>
                <th className="border border-gray-200 px-3 py-2 text-left">Ad Score</th>
                <th className="border border-gray-200 px-3 py-2 text-left">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {analytics.unified
                .filter(row => row.ad_score >= 0.8)
                .slice(0, 10)
                .map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-200 px-3 py-2">{row.campaign}</td>
                    <td className="border border-gray-200 px-3 py-2">{row.ad_set || 'N/A'}</td>
                    <td className="border border-gray-200 px-3 py-2">₹{(row.spend || 0).toFixed(2)}</td>
                    <td className="border border-gray-200 px-3 py-2">{row.visitors || 0}</td>
                    <td className="border border-gray-200 px-3 py-2">{((row.ad_score || 0) * 100).toFixed(0)}</td>
                    <td className="border border-gray-200 px-3 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        row.recommendation === 'Scale' ? 'bg-green-100 text-green-800' :
                        row.recommendation === 'Test-to-Scale' ? 'bg-blue-100 text-blue-800' :
                        row.recommendation === 'Optimize' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {row.recommendation}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DownloadsTab({ csvFiles }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Download CSV Reports</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(csvFiles).map(([reportType, fileInfo]) => (
          <div key={reportType} className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 capitalize">
              {reportType.replace(/([A-Z])/g, ' $1').trim()} Report
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              {fileInfo.rowCount} rows of data
            </p>
            <a
              href={fileInfo.url}
              download={fileInfo.filename}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              <DownloadIcon className="w-4 h-4 mr-2" />
              Download CSV
            </a>
          </div>
        ))}
      </div>
      
      <div className="p-4 bg-yellow-50 rounded-lg">
        <h4 className="font-medium text-yellow-800 mb-1">File Information</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• <strong>Top Level:</strong> Daily aggregated metrics across platforms</li>
          <li>• <strong>Ad Set:</strong> Meta ad set performance with session quality metrics</li>
          <li>• <strong>Ad Level:</strong> Individual ad creative performance and recommendations</li>
        </ul>
      </div>
    </div>
  );
}

function ValidationTab({ validation }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Spend Reconciliation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(validation.spendReconciliation).map(([platform, data]) => (
            <div key={platform} className="border rounded-lg p-4">
              <h4 className="font-medium mb-2 capitalize">{platform} Spend</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Original:</span>
                  <span>₹{data.original.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processed:</span>
                  <span>₹{data.processed.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={data.matches ? 'text-green-600' : 'text-red-600'}>
                    {data.matches ? '✓ Match' : '✗ Mismatch'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Data Integrity</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium">Rows Processed</div>
              <div className="text-2xl font-bold text-blue-600">
                {validation.dataIntegrity.rowsProcessed}
              </div>
            </div>
            <div>
              <div className="font-medium">With Attribution</div>
              <div className="text-2xl font-bold text-green-600">
                {validation.dataIntegrity.rowsWithAttribution}
              </div>
            </div>
            <div>
              <div className="font-medium">Attribution Coverage</div>
              <div className="text-2xl font-bold text-purple-600">
                {(validation.dataIntegrity.attributionCoverage * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecommendationsTab({ analytics, summary }) {
  const highPerformers = analytics.unified.filter(row => row.ad_score >= 0.8);
  const underperformers = analytics.unified.filter(row => row.ad_score < 0.4);
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-green-700">
          Scale Opportunities ({highPerformers.length} ads)
        </h3>
        {highPerformers.length > 0 ? (
          <div className="space-y-2">
            {highPerformers.slice(0, 5).map((row, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded">
                <div>
                  <div className="font-medium">{row.campaign} | {row.ad_set}</div>
                  <div className="text-sm text-gray-600">Score: {(row.ad_score * 100).toFixed(0)}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">₹{(row.spend || 0).toFixed(0)}</div>
                  <div className="text-sm text-gray-600">{row.visitors} visitors</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No high-performing ads identified.</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-red-700">
          Budget Reallocation Candidates ({underperformers.length} ads)
        </h3>
        {underperformers.length > 0 ? (
          <div className="space-y-2">
            {underperformers.slice(0, 5).map((row, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded">
                <div>
                  <div className="font-medium">{row.campaign} | {row.ad_set}</div>
                  <div className="text-sm text-gray-600">Score: {(row.ad_score * 100).toFixed(0)}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-red-600">₹{(row.spend || 0).toFixed(0)}</div>
                  <div className="text-sm text-gray-600">{row.visitors} visitors</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No underperforming ads identified.</p>
        )}
      </div>
    </div>
  );
}
```

---

## Phase 3 Testing Strategy

### Julius V7 Engine Testing
- Test data harmonization across platforms
- Validate attribution logic accuracy
- Verify business metrics calculations
- Test Empirical Bayes shrinkage implementation

### CSV Export Testing
- Validate CSV format matches specifications
- Test large dataset export performance
- Verify data integrity in exports
- Test download functionality

### Integration Testing
- End-to-end report generation
- Date range functionality
- Error handling and recovery
- Performance with production data volumes

## Phase 3 Success Criteria

- 📊 Julius V7 pipeline processes data correctly
- 📈 Generate 3 CSV reports with exact specifications
- 🎯 Attribution logic matches notebook results
- 🧮 Business metrics calculations are accurate
- 🏆 Performance scoring produces meaningful rankings
- 📱 User interface enables easy report generation
- 🔄 Handle 10,000+ rows efficiently
- ✅ CSV exports match expected formats exactly

---
*Phase 3 Timeline: Week 3 (7 days)*  
*Next: [Supabase Integration Strategy](supabase-integration.md)*