import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Calendar, TrendingUp, TrendingDown, DollarSign, Users, Clock, ShoppingCart } from 'lucide-react';

interface DailyCorrelationData {
  date: string;
  metaSpend: number;
  googleSpend: number;
  totalSpend: number;
  totalUsers: number;
  avgSessionDuration: number;
  qualityUsers: number; // Users with session > 1 min
  cartAdditions: number;
  checkouts: number;
  qualityScore: number; // Calculated quality metric
  costPerQualityUser: number;
  conversionRate: number;
}

interface DailySpendQualityCorrelationProps {
  selectedDateRange: { startDate: string; endDate: string } | null;
}

export const DailySpendQualityCorrelation: React.FC<DailySpendQualityCorrelationProps> = ({
  selectedDateRange
}) => {
  const [correlationData, setCorrelationData] = useState<DailyCorrelationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyCorrelationData = async () => {
    if (!selectedDateRange) return;

    setLoading(true);
    setError(null);

    try {
      // Calculate date range to avoid large queries
      const startDate = new Date(selectedDateRange.startDate);
      const endDate = new Date(selectedDateRange.endDate);
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Limit to maximum 7 days to prevent resource issues
      if (daysDiff > 7) {
        throw new Error('Date range too large. Please select a maximum of 7 days for detailed analysis.');
      }

      // Sequential fetching with delays to prevent overwhelming the browser
      let metaData: any[] = [];
      let googleData: any[] = [];
      let shopifyData: any[] = [];

      try {
        // Fetch Meta Ads data first
        const { data: meta, error: metaError } = await supabase
          .from('meta_ads_data')
          .select('date_reported, amount_spent')
          .gte('date_reported', selectedDateRange.startDate)
          .lte('date_reported', selectedDateRange.endDate)
          .limit(100); // Reduced limit

        if (metaError) throw metaError;
        metaData = meta || [];
      } catch (err) {
        console.warn('Meta data fetch failed, continuing with empty data:', err);
        metaData = [];
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        // Fetch Google Ads data second
        const { data: google, error: googleError } = await supabase
          .from('google_ads_data')
          .select('date_reported, cost')
          .gte('date_reported', selectedDateRange.startDate)
          .lte('date_reported', selectedDateRange.endDate)
          .limit(100);

        if (googleError) throw googleError;
        googleData = google || [];
      } catch (err) {
        console.warn('Google data fetch failed, continuing with empty data:', err);
        googleData = [];
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        // Fetch Shopify data last with minimal fields
        const { data: shopify, error: shopifyError } = await supabase
          .from('shopify_data')
          .select('date_reported, online_store_visitors, sessions, sessions_with_cart_additions, sessions_that_reached_checkout, average_session_duration')
          .gte('date_reported', selectedDateRange.startDate)
          .lte('date_reported', selectedDateRange.endDate)
          .limit(100);

        if (shopifyError) throw shopifyError;
        shopifyData = shopify || [];
      } catch (err) {
        console.warn('Shopify data fetch failed, continuing with empty data:', err);
        shopifyData = [];
      }

      // Group and aggregate data by date
      const dateMap = new Map<string, DailyCorrelationData>();

      // Initialize with all dates in range
      const rangeStartDate = new Date(selectedDateRange.startDate);
      const rangeEndDate = new Date(selectedDateRange.endDate);
      for (let d = new Date(rangeStartDate); d <= rangeEndDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        dateMap.set(dateStr, {
          date: dateStr,
          metaSpend: 0,
          googleSpend: 0,
          totalSpend: 0,
          totalUsers: 0,
          avgSessionDuration: 0,
          qualityUsers: 0,
          cartAdditions: 0,
          checkouts: 0,
          qualityScore: 0,
          costPerQualityUser: 0,
          conversionRate: 0
        });
      }

      // Aggregate Meta spend by date
      metaData?.forEach(record => {
        const date = record.date_reported;
        const existing = dateMap.get(date);
        if (existing) {
          existing.metaSpend += Number(record.amount_spent) || 0;
        }
      });

      // Aggregate Google spend by date
      googleData?.forEach(record => {
        const date = record.date_reported;
        const existing = dateMap.get(date);
        if (existing) {
          existing.googleSpend += Number(record.cost) || 0;
        }
      });

      // Aggregate Shopify user quality metrics by date
      const shopifyByDate = new Map<string, any[]>();
      shopifyData?.forEach(record => {
        const date = record.date_reported;
        if (!shopifyByDate.has(date)) {
          shopifyByDate.set(date, []);
        }
        shopifyByDate.get(date)?.push(record);
      });

      // Calculate quality metrics for each date
      shopifyByDate.forEach((records, date) => {
        const existing = dateMap.get(date);
        if (!existing) return;

        let totalUsers = 0;
        let totalSessions = 0;
        let totalCartAdditions = 0;
        let totalCheckouts = 0;
        let totalSessionDuration = 0;
        let qualityUsers = 0;

        records.forEach(record => {
          const users = Number(record.online_store_visitors) || 0;
          const sessions = Number(record.sessions) || 0;
          const cartAdditions = Number(record.sessions_with_cart_additions) || 0;
          const checkouts = Number(record.sessions_that_reached_checkout) || 0;
          const sessionDuration = Number(record.average_session_duration) || 0;

          totalUsers += users;
          totalSessions += sessions;
          totalCartAdditions += cartAdditions;
          totalCheckouts += checkouts;
          totalSessionDuration += sessionDuration * users; // Weighted by users

          // Quality users: session duration > 60 seconds
          if (sessionDuration > 60 && users > 0) {
            qualityUsers += users;
          }
        });

        existing.totalUsers = totalUsers;
        existing.cartAdditions = totalCartAdditions;
        existing.checkouts = totalCheckouts;
        existing.qualityUsers = qualityUsers;
        existing.avgSessionDuration = totalUsers > 0 ? totalSessionDuration / totalUsers : 0;
        existing.conversionRate = totalUsers > 0 ? (totalCheckouts / totalUsers) * 100 : 0;
      });

      // Calculate derived metrics
      dateMap.forEach(data => {
        data.totalSpend = data.metaSpend + data.googleSpend;
        
        // Quality Score: Weighted combination of metrics (0-100)
        const qualityRate = data.totalUsers > 0 ? (data.qualityUsers / data.totalUsers) * 100 : 0;
        const engagementRate = data.totalUsers > 0 ? (data.cartAdditions / data.totalUsers) * 100 : 0;
        data.qualityScore = (qualityRate * 0.4) + (engagementRate * 0.3) + (data.conversionRate * 0.3);
        
        // Cost per quality user
        data.costPerQualityUser = data.qualityUsers > 0 ? data.totalSpend / data.qualityUsers : 0;
      });

      const sortedData = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
      setCorrelationData(sortedData);

    } catch (err) {
      console.error('Error fetching daily correlation data:', err);
      let errorMessage = 'Failed to fetch data';
      
      if (err instanceof Error) {
        if (err.message.includes('ERR_INSUFFICIENT_RESOURCES') || err.message.includes('Failed to fetch')) {
          errorMessage = 'Browser resource limit reached. Please try: 1) Select "Last 7 Days" or shorter, 2) Refresh the page, or 3) Close other browser tabs.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDateRange) {
      fetchDailyCorrelationData();
    }
  }, [selectedDateRange]);

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatNumber = (value: number) => value.toLocaleString();
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;
  const formatDuration = (seconds: number) => `${Math.round(seconds)}s`;

  const getQualityTrend = (qualityScore: number) => {
    if (qualityScore >= 70) return { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' };
    if (qualityScore >= 40) return { icon: TrendingUp, color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Daily Spend vs User Quality</h3>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading daily correlation data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Daily Spend vs User Quality</h3>
        </div>
        <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (correlationData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Daily Spend vs User Quality</h3>
        </div>
        <div className="text-center text-gray-500 bg-gray-50 p-4 rounded-lg">
          <p>No data available for the selected date range</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Daily Spend vs User Quality</h3>
        <span className="text-sm text-gray-500">({correlationData.length} days)</span>
      </div>

      <div className="space-y-4">
        {correlationData.map((day, index) => {
          const qualityTrend = getQualityTrend(day.qualityScore);
          const TrendIcon = qualityTrend.icon;

          return (
            <div key={day.date} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              {/* Date Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900">
                    {new Date(day.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </h4>
                  <span className="text-sm text-gray-500">{day.date}</span>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${qualityTrend.bg}`}>
                  <TrendIcon className={`w-4 h-4 ${qualityTrend.color}`} />
                  <span className={`text-sm font-medium ${qualityTrend.color}`}>
                    {formatPercent(day.qualityScore)}
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* Ad Spend */}
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-900">Total Spend</span>
                  </div>
                  <p className="text-lg font-bold text-blue-800">{formatCurrency(day.totalSpend)}</p>
                  <p className="text-xs text-blue-600">
                    Meta: {formatCurrency(day.metaSpend)} | Google: {formatCurrency(day.googleSpend)}
                  </p>
                </div>

                {/* Total Users */}
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-green-900">Total Users</span>
                  </div>
                  <p className="text-lg font-bold text-green-800">{formatNumber(day.totalUsers)}</p>
                  <p className="text-xs text-green-600">
                    Quality: {formatNumber(day.qualityUsers)} ({formatPercent(day.totalUsers > 0 ? (day.qualityUsers / day.totalUsers) * 100 : 0)})
                  </p>
                </div>

                {/* Session Duration */}
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-medium text-purple-900">Avg Session</span>
                  </div>
                  <p className="text-lg font-bold text-purple-800">{formatDuration(day.avgSessionDuration)}</p>
                  <p className="text-xs text-purple-600">
                    Quality threshold: 60s
                  </p>
                </div>

                {/* Cart & Checkout */}
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <ShoppingCart className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-medium text-orange-900">Conversions</span>
                  </div>
                  <p className="text-lg font-bold text-orange-800">{formatNumber(day.checkouts)}</p>
                  <p className="text-xs text-orange-600">
                    Carts: {formatNumber(day.cartAdditions)} | Rate: {formatPercent(day.conversionRate)}
                  </p>
                </div>

                {/* Cost per Quality User */}
                <div className="bg-red-50 rounded-lg p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <DollarSign className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-medium text-red-900">Cost/Quality</span>
                  </div>
                  <p className="text-lg font-bold text-red-800">
                    {day.costPerQualityUser > 0 ? formatCurrency(day.costPerQualityUser) : 'N/A'}
                  </p>
                  <p className="text-xs text-red-600">Per quality user</p>
                </div>

                {/* Quality Score */}
                <div className={`rounded-lg p-3 ${qualityTrend.bg}`}>
                  <div className="flex items-center gap-1 mb-1">
                    <TrendIcon className={`w-4 h-4 ${qualityTrend.color}`} />
                    <span className={`text-xs font-medium ${qualityTrend.color.replace('text-', 'text-').replace('-600', '-900')}`}>
                      Quality Score
                    </span>
                  </div>
                  <p className={`text-lg font-bold ${qualityTrend.color.replace('text-', 'text-').replace('-600', '-800')}`}>
                    {formatPercent(day.qualityScore)}
                  </p>
                  <p className={`text-xs ${qualityTrend.color}`}>
                    {day.qualityScore >= 70 ? 'Excellent' : day.qualityScore >= 40 ? 'Good' : 'Needs Work'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(correlationData.reduce((sum, day) => sum + day.totalSpend, 0))}
            </p>
            <p className="text-sm text-gray-600">Total Spend</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {formatNumber(correlationData.reduce((sum, day) => sum + day.totalUsers, 0))}
            </p>
            <p className="text-sm text-gray-600">Total Users</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">
              {formatNumber(correlationData.reduce((sum, day) => sum + day.qualityUsers, 0))}
            </p>
            <p className="text-sm text-gray-600">Quality Users</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">
              {formatPercent(
                correlationData.reduce((sum, day) => sum + day.qualityScore, 0) / correlationData.length
              )}
            </p>
            <p className="text-sm text-gray-600">Avg Quality</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySpendQualityCorrelation;