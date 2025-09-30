import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronUp, ChevronDown, Download } from 'lucide-react';
import type { DashboardData, CampaignMetrics } from '../types';

interface Props {
  data: DashboardData;
}

type SortField = keyof CampaignMetrics;
type SortDirection = 'asc' | 'desc';

const UTMCampaignTable: React.FC<Props> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('sessions');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [performanceFilter, setPerformanceFilter] = useState<string>('all');
  const [minSessions, setMinSessions] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);

  // Apply filters and sorting
  const filteredAndSortedData = useMemo(() => {
    // Check if utmCampaigns exists and is an array
    if (!data.utmCampaigns || !Array.isArray(data.utmCampaigns)) {
      return [];
    }
    
    let filtered = data.utmCampaigns.filter(campaign => {
      // Search filter
      const matchesSearch = campaign.utmCampaign.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Performance filter
      const matchesPerformance = performanceFilter === 'all' || campaign.performanceTier === performanceFilter;
      
      // Minimum sessions filter
      const matchesSessions = campaign.sessions >= minSessions;
      
      return matchesSearch && matchesPerformance && matchesSessions;
    });

    // Sort the filtered data
    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });

    return filtered;
  }, [data.utmCampaigns, searchTerm, sortField, sortDirection, performanceFilter, minSessions]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setPerformanceFilter('all');
    setMinSessions(0);
    setSortField('sessions');
    setSortDirection('desc');
  };

  const exportToCSV = () => {
    const headers = [
      'UTM Campaign',
      'Total Customers',
      'Total Sessions',
      'Sessions/Customer',
      'Avg Session Duration (sec)',
      'Checkout Sessions',
      'Checkout Rate (%)',
      'Cart Additions',
      'Cart Rate (%)',
      'Quality Score',
      'Performance Tier'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredAndSortedData.map(campaign => [
        `"${campaign.utmCampaign}"`,
        campaign.visitors || 0,
        campaign.sessions,
        (campaign.sessions / (campaign.visitors || 1)).toFixed(2),
        campaign.averageSessionDuration || 0,
        campaign.checkoutSessions,
        ((campaign.checkoutSessions / campaign.sessions) * 100).toFixed(2),
        campaign.cartAdditions,
        ((campaign.cartAdditions / campaign.sessions) * 100).toFixed(2),
        campaign.conversionRate,
        campaign.performanceTier
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moi-utm-campaigns-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const SortableHeader: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
    <th 
      className="px-4 py-3 text-left font-benton font-semibold text-moi-charcoal cursor-pointer hover:bg-moi-beige transition-colors text-sm"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field ? (
          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
        ) : (
          <div className="w-4 h-4" />
        )}
      </div>
    </th>
  );

  const getPerformanceBadge = (tier: string) => {
    const colors = {
      excellent: 'bg-green-100 text-green-800 border-green-300',
      good: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      average: 'bg-orange-100 text-orange-800 border-orange-300',
      poor: 'bg-red-100 text-red-800 border-red-300'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[tier as keyof typeof colors] || colors.poor}`}>
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-moi-light">
      {/* Header */}
      <div className="p-6 border-b border-moi-light">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-orpheus text-2xl font-bold text-moi-charcoal">
            Complete UTM Campaign Analysis
          </h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-moi-charcoal text-white rounded-lg hover:bg-moi-grey transition-colors font-benton text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-moi-beige text-moi-charcoal rounded-lg hover:bg-moi-light transition-colors font-benton text-sm"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className={`transition-all duration-300 ${showFilters ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-moi-beige rounded-lg">
            <div>
              <label className="block font-benton text-sm text-moi-grey mb-1">Search Campaign</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-moi-grey" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-moi-light rounded-lg focus:outline-none focus:ring-2 focus:ring-moi-red focus:border-transparent font-benton"
                />
              </div>
            </div>
            
            <div>
              <label className="block font-benton text-sm text-moi-grey mb-1">Performance Tier</label>
              <select
                value={performanceFilter}
                onChange={(e) => setPerformanceFilter(e.target.value)}
                className="w-full px-4 py-2 border border-moi-light rounded-lg focus:outline-none focus:ring-2 focus:ring-moi-red focus:border-transparent font-benton"
              >
                <option value="all">All Tiers</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="average">Average</option>
                <option value="poor">Poor</option>
              </select>
            </div>
            
            <div>
              <label className="block font-benton text-sm text-moi-grey mb-1">Min Sessions</label>
              <input
                type="number"
                placeholder="0"
                value={minSessions || ''}
                onChange={(e) => setMinSessions(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-moi-light rounded-lg focus:outline-none focus:ring-2 focus:ring-moi-red focus:border-transparent font-benton"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full px-4 py-2 bg-moi-red text-white rounded-lg hover:bg-red-700 transition-colors font-benton text-sm"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 flex items-center justify-between text-sm font-benton text-moi-grey">
          <span>
            Showing {filteredAndSortedData.length} of {data.utmCampaigns?.length || 0} campaigns
          </span>
          <span>
            Total Sessions: {formatNumber(filteredAndSortedData.reduce((sum, c) => sum + c.sessions, 0))}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-moi-beige border-b border-moi-light">
            <tr>
              <SortableHeader field="utmCampaign">UTM Campaign</SortableHeader>
              <SortableHeader field="visitors">Total Customers</SortableHeader>
              <SortableHeader field="sessions">Total Sessions</SortableHeader>
              <SortableHeader field="sessions">Sessions/Customer</SortableHeader>
              <SortableHeader field="averageSessionDuration">Avg Session Duration (sec)</SortableHeader>
              <SortableHeader field="checkoutSessions">Checkout Sessions</SortableHeader>
              <SortableHeader field="conversionRate">Checkout Rate (%)</SortableHeader>
              <SortableHeader field="cartAdditions">Cart Additions</SortableHeader>
              <SortableHeader field="cartAdditions">Cart Rate (%)</SortableHeader>
              <SortableHeader field="conversionRate">Quality Score</SortableHeader>
              <SortableHeader field="performanceTier">Performance Tier</SortableHeader>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData.map((campaign, index) => (
              <tr 
                key={campaign.utmCampaign} 
                className={`border-b border-moi-light hover:bg-moi-beige transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 font-benton font-medium text-moi-charcoal max-w-xs text-sm">
                  <div className="truncate" title={campaign.utmCampaign}>
                    {campaign.utmCampaign}
                  </div>
                </td>
                <td className="px-4 py-3 font-benton text-moi-charcoal text-sm">
                  {formatNumber(campaign.visitors)}
                </td>
                <td className="px-4 py-3 font-benton text-moi-charcoal font-medium text-sm">
                  {formatNumber(campaign.sessions)}
                </td>
                <td className="px-4 py-3 font-benton text-moi-charcoal text-sm">
                  {(campaign.sessions / (campaign.visitors || 1)).toFixed(2)}
                </td>
                <td className="px-4 py-3 font-benton text-moi-charcoal text-sm">
                  {campaign.averageSessionDuration}s
                </td>
                <td className="px-4 py-3 font-benton text-moi-charcoal text-sm">
                  {campaign.checkoutSessions}
                </td>
                <td className="px-4 py-3 font-benton text-moi-charcoal text-sm">
                  <span className={`${campaign.conversionRate > 1 ? 'text-green-600 font-medium' : 'text-red-600'}`}>
                    {campaign.conversionRate.toFixed(2)}%
                  </span>
                </td>
                <td className="px-4 py-3 font-benton text-moi-charcoal text-sm">
                  {campaign.cartAdditions}
                </td>
                <td className="px-4 py-3 font-benton text-moi-charcoal text-sm">
                  <span className={`${((campaign.cartAdditions / campaign.sessions) * 100) > 1 ? 'text-moi-green font-medium' : 'text-moi-red'}`}>
                    {((campaign.cartAdditions / campaign.sessions) * 100).toFixed(2)}%
                  </span>
                </td>
                <td className="px-4 py-3 font-benton text-moi-charcoal text-sm">
                  <span className={`font-medium ${campaign.conversionRate >= 0.6 ? 'text-moi-green' : 'text-moi-red'}`}>
                    {campaign.conversionRate.toFixed(1)}/100
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {getPerformanceBadge(campaign.performanceTier)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredAndSortedData.length === 0 && (
          <div className="text-center py-12">
            <p className="font-benton text-moi-grey">No campaigns match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UTMCampaignTable;