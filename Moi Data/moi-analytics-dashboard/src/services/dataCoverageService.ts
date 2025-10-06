import { supabase } from './supabaseClient';

export interface DataCoverageInfo {
  source: 'meta' | 'google' | 'shopify';
  dateRange: {
    startDate: string;
    endDate: string;
  };
  recordCount: number;
  uniqueCampaigns: number;
  lastImported: string;
  sampleData?: any[];
}

export interface CoverageAnalysis {
  totalRecords: number;
  dateSpan: {
    earliest: string;
    latest: string;
    totalDays: number;
  };
  sourceBreakdown: {
    meta: { records: number; campaigns: number };
    google: { records: number; campaigns: number };
    shopify: { records: number; campaigns: number };
  };
  dailyCoverage: Array<{
    date: string;
    sources: ('meta' | 'google' | 'shopify')[];
    recordCount: number;
  }>;
  gaps: Array<{
    date: string;
    missingSources: ('meta' | 'google' | 'shopify')[];
  }>;
}

export class DataCoverageService {
  /**
   * Get comprehensive data coverage analysis
   */
  static async getDataCoverageAnalysis(): Promise<CoverageAnalysis | null> {
    try {
      // Get all records from each source using correct column names
      const [metaData, googleData, shopifyData] = await Promise.all([
        supabase.from('meta_ads_data').select('*').order('reporting_ends', { ascending: true }),
        supabase.from('google_ads_data').select('*').order('date', { ascending: true }),
        supabase.from('shopify_data').select('*').order('day', { ascending: true })
      ]);

      if (metaData.error || googleData.error || shopifyData.error) {
        console.error('Error fetching data coverage:', {
          meta: metaData.error,
          google: googleData.error,
          shopify: shopifyData.error
        });
        return null;
      }

      const allRecords = [
        ...(metaData.data || []).map(r => ({ ...r, source: 'meta' as const, date: r.reporting_ends })),
        ...(googleData.data || []).map(r => ({ ...r, source: 'google' as const })),
        ...(shopifyData.data || []).map(r => ({ ...r, source: 'shopify' as const, date: r.day }))
      ];

      if (allRecords.length === 0) {
        return {
          totalRecords: 0,
          dateSpan: { earliest: '', latest: '', totalDays: 0 },
          sourceBreakdown: {
            meta: { records: 0, campaigns: 0 },
            google: { records: 0, campaigns: 0 },
            shopify: { records: 0, campaigns: 0 }
          },
          dailyCoverage: [],
          gaps: []
        };
      }

      // Calculate date span
      const dates = allRecords.map(r => new Date(r.date)).sort((a, b) => a.getTime() - b.getTime());
      const earliest = dates[0].toISOString().split('T')[0];
      const latest = dates[dates.length - 1].toISOString().split('T')[0];
      const totalDays = Math.ceil((dates[dates.length - 1].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Calculate source breakdown
      const sourceBreakdown = {
        meta: {
          records: (metaData.data || []).length,
          campaigns: new Set((metaData.data || []).map(r => r.campaign_name)).size
        },
        google: {
          records: (googleData.data || []).length,
          campaigns: new Set((googleData.data || []).map(r => r.campaign)).size
        },
        shopify: {
          records: (shopifyData.data || []).length,
          campaigns: new Set((shopifyData.data || []).map(r => r.utm_campaign)).size
        }
      };

      // Calculate daily coverage and gaps
      const dailyCoverageMap = new Map<string, {
        sources: Set<'meta' | 'google' | 'shopify'>;
        recordCount: number;
      }>();

      allRecords.forEach(record => {
        const date = record.date;
        if (!dailyCoverageMap.has(date)) {
          dailyCoverageMap.set(date, {
            sources: new Set(),
            recordCount: 0
          });
        }
        const dayData = dailyCoverageMap.get(date)!;
        dayData.sources.add(record.source);
        dayData.recordCount++;
      });

      // Convert to array and identify gaps
      const dailyCoverage = Array.from(dailyCoverageMap.entries())
        .map(([date, data]) => ({
          date,
          sources: Array.from(data.sources),
          recordCount: data.recordCount
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Identify gaps (dates with missing sources)
      const gaps: Array<{
        date: string;
        missingSources: ('meta' | 'google' | 'shopify')[];
      }> = [];

      const allSources: ('meta' | 'google' | 'shopify')[] = ['meta', 'google', 'shopify'];
      dailyCoverage.forEach(day => {
        const missingSources = allSources.filter(source => !day.sources.includes(source));
        if (missingSources.length > 0) {
          gaps.push({
            date: day.date,
            missingSources
          });
        }
      });

      return {
        totalRecords: allRecords.length,
        dateSpan: { earliest, latest, totalDays },
        sourceBreakdown,
        dailyCoverage,
        gaps
      };

    } catch (error) {
      console.error('Error analyzing data coverage:', error);
      return null;
    }
  }

  /**
   * Get data coverage for a specific date range
   */
  static async getDateRangeCoverage(startDate: string, endDate: string): Promise<DataCoverageInfo[]> {
    try {
      const [metaData, googleData, shopifyData] = await Promise.all([
        supabase
          .from('meta_ads_data')
          .select('*')
          .gte('reporting_ends', startDate)
          .lte('reporting_ends', endDate)
          .order('reporting_ends', { ascending: true }),
        supabase
          .from('google_ads_data')
          .select('*')
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: true }),
        supabase
          .from('shopify_data')
          .select('*')
          .gte('day', startDate)
          .lte('day', endDate)
          .order('day', { ascending: true })
      ]);

      const coverage: DataCoverageInfo[] = [];

      // Meta Ads coverage
      if (metaData.data && metaData.data.length > 0) {
        const dates = metaData.data.map(r => r.reporting_ends).sort();
        coverage.push({
          source: 'meta',
          dateRange: {
            startDate: dates[0],
            endDate: dates[dates.length - 1]
          },
          recordCount: metaData.data.length,
          uniqueCampaigns: new Set(metaData.data.map(r => r.campaign_name)).size,
          lastImported: metaData.data[0].created_at || new Date().toISOString(),
          sampleData: metaData.data.slice(0, 3)
        });
      }

      // Google Ads coverage
      if (googleData.data && googleData.data.length > 0) {
        const dates = googleData.data.map(r => r.date).sort();
        coverage.push({
          source: 'google',
          dateRange: {
            startDate: dates[0],
            endDate: dates[dates.length - 1]
          },
          recordCount: googleData.data.length,
          uniqueCampaigns: new Set(googleData.data.map(r => r.campaign)).size,
          lastImported: googleData.data[0].created_at || new Date().toISOString(),
          sampleData: googleData.data.slice(0, 3)
        });
      }

      // Shopify coverage
      if (shopifyData.data && shopifyData.data.length > 0) {
        const dates = shopifyData.data.map(r => r.day).sort();
        coverage.push({
          source: 'shopify',
          dateRange: {
            startDate: dates[0],
            endDate: dates[dates.length - 1]
          },
          recordCount: shopifyData.data.length,
          uniqueCampaigns: new Set(shopifyData.data.map(r => r.utm_campaign)).size,
          lastImported: shopifyData.data[0].created_at || new Date().toISOString(),
          sampleData: shopifyData.data.slice(0, 3)
        });
      }

      return coverage;

    } catch (error) {
      console.error('Error getting date range coverage:', error);
      return [];
    }
  }

  /**
   * Get available date ranges for each source
   */
  static async getAvailableDateRanges(): Promise<{ [key: string]: { startDate: string; endDate: string } }> {
    try {
      const [metaData, googleData, shopifyData] = await Promise.all([
        supabase.from('meta_ads_data').select('reporting_ends').order('reporting_ends', { ascending: true }),
        supabase.from('google_ads_data').select('date').order('date', { ascending: true }),
        supabase.from('shopify_data').select('day').order('day', { ascending: true })
      ]);

      const ranges: { [key: string]: { startDate: string; endDate: string } } = {};

      if (metaData.data && metaData.data.length > 0) {
        const dates = metaData.data.map(r => r.reporting_ends).sort();
        ranges.meta = {
          startDate: dates[0],
          endDate: dates[dates.length - 1]
        };
      }

      if (googleData.data && googleData.data.length > 0) {
        const dates = googleData.data.map(r => r.date).sort();
        ranges.google = {
          startDate: dates[0],
          endDate: dates[dates.length - 1]
        };
      }

      if (shopifyData.data && shopifyData.data.length > 0) {
        const dates = shopifyData.data.map(r => r.day).sort();
        ranges.shopify = {
          startDate: dates[0],
          endDate: dates[dates.length - 1]
        };
      }

      return ranges;

    } catch (error) {
      console.error('Error getting available date ranges:', error);
      return {};
    }
  }

  /**
   * Test data aggregation for a specific date range
   */
  static async testDateRangeAggregation(startDate: string, endDate: string) {
    try {
      console.log(`🔍 Testing aggregation for ${startDate} to ${endDate}`);
      
      const coverage = await this.getDateRangeCoverage(startDate, endDate);
      
      console.log('📊 Coverage Analysis:', {
        sources: coverage.map(c => c.source),
        totalRecords: coverage.reduce((sum, c) => sum + c.recordCount, 0),
        campaigns: coverage.reduce((sum, c) => sum + c.uniqueCampaigns, 0)
      });

      return coverage;

    } catch (error) {
      console.error('Error testing date range aggregation:', error);
      return [];
    }
  }
}