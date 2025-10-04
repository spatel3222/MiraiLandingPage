import React, { useState } from 'react';
import { Info, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import PerformanceTierModal from './PerformanceTierModal';
import type { DashboardData } from '../types';

interface Props {
  data: DashboardData;
}

const CampaignPerformanceTiers: React.FC<Props> = ({ data }) => {
  const [showModal, setShowModal] = useState(false);
  
  // Use the performance tiers from the processed data
  const { performanceTiers, utmCampaigns } = data;
  
  // Campaign performance tiers component initialized
  
  // Provide safe fallbacks for undefined data
  const safeUtmCampaigns = utmCampaigns || [];
  const safePerformanceTiers = performanceTiers || {
    excellent: 0,
    good: 0,
    average: 0,
    poor: 0
  };
  
  // Group campaigns by performance tier
  const excellent = safeUtmCampaigns.filter(c => c.performanceTier === 'excellent');
  const good = safeUtmCampaigns.filter(c => c.performanceTier === 'good');
  const average = safeUtmCampaigns.filter(c => c.performanceTier === 'average');
  const poor = safeUtmCampaigns.filter(c => c.performanceTier === 'poor');
  
  // Poor tier campaign analysis available in dev mode

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'excellent': return 'bg-green-100 border-green-300 text-green-800';
      case 'good': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'average': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'poor': return 'bg-red-100 border-red-300 text-red-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'excellent': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'good': return <TrendingUp className="w-5 h-5 text-yellow-600" />;
      case 'average': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'poor': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return null;
    }
  };

  const formatNumber = (num: number): string => {
    if (num === -999) return 'N/A'; // No data available for this metric
    if (num === null || num === undefined || isNaN(num) || !isFinite(num)) return 'N/A';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const TierCard: React.FC<{ 
    tier: string; 
    campaigns: any[]; 
    title: string; 
    count: number;
  }> = ({ tier, campaigns, title, count }) => (
    <div className={`rounded-xl border-2 p-5 relative ${getTierColor(tier)} transition-all duration-200 hover:shadow-lg`}>
      {/* Enhanced background icon */}
      <div className="absolute top-3 right-3 opacity-15 pointer-events-none">
        <div className="w-10 h-10">
          {getTierIcon(tier)}
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {getTierIcon(tier)}
          <h3 className="font-orpheus text-lg font-bold">{title}</h3>
        </div>
        <span className="font-benton text-3xl font-bold">{count}</span>
      </div>
      
      {campaigns.length > 0 && (
        <div className="space-y-3">
          {/* Primary Metric - Quality Users - Enhanced */}
          <div className="bg-white bg-opacity-70 rounded-lg p-4 border-2 border-white border-opacity-50 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-bold text-gray-800">Quality Users</span>
              </div>
              <span className="text-xl font-black">
                {formatNumber(campaigns.reduce((sum, c) => sum + (c.qualityCustomers || 0), 0))}
              </span>
            </div>
            <p className="text-xs text-gray-600 font-medium">Visitors with &gt;1min session time</p>
            <div className="mt-2 bg-blue-100 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" 
                style={{
                  width: tier === 'excellent' ? '100%' : 
                         tier === 'good' ? '75%' : 
                         tier === 'average' ? '50%' : '25%'
                }}
              ></div>
            </div>
          </div>
          
          {/* Secondary Metrics */}
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Total Sessions:</span>
              <span className="font-medium">{formatNumber(campaigns.reduce((sum, c) => sum + (c.sessions || c.totalSessions || 0), 0))}</span>
            </div>
            <div className="flex justify-between">
              <span>Avg Conversion:</span>
              <span className="font-medium">{(campaigns.reduce((sum, c) => sum + (c.qualityConversionRate || c.conversionRate || c.checkoutRate || 0), 0) / campaigns.length).toFixed(2)}%</span>
            </div>
            {campaigns.some(c => c.adSpend) && (
              <div className="flex justify-between">
                <span>Ad Spend:</span>
                <span className="font-medium">₹{formatNumber(campaigns.reduce((sum, c) => sum + (c.adSpend || 0), 0))}</span>
              </div>
            )}
          </div>
          
          {campaigns.length <= 3 ? (
            <div className="text-xs space-y-1">
              {campaigns.map((campaign, idx) => (
                <div key={idx} className="truncate">
                  • {campaign.utmCampaign}
                  <div className="text-gray-600 ml-2 text-xs">
                    {formatNumber(campaign.qualityCustomers || 0)} quality users
                    {campaign.adSpend && (
                      <span className="ml-1">• ₹{formatNumber(campaign.adSpend)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs">
              <div className="space-y-1 mb-1">
                {campaigns.slice(0, 2).map((campaign, idx) => (
                  <div key={idx} className="truncate">
                    • {campaign.utmCampaign}
                    <div className="text-gray-600 ml-2 text-xs">
                      {formatNumber(campaign.qualityCustomers || 0)} quality users
                      {campaign.adSpend && (
                        <span className="ml-1">• ₹{formatNumber(campaign.adSpend)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-gray-600">
                +{campaigns.length - 2} more campaigns
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-moi-light p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-orpheus text-2xl font-bold text-moi-charcoal">
          Campaign Performance Tiers
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          title="Performance Tier Logic & Examples"
        >
          <Info className="w-5 h-5" />
          <span className="font-benton text-sm font-medium">Info</span>
        </button>
      </div>
      
      {/* Quality User Focus Note - Enhanced */}
      <div className="mb-6 p-6 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 border-2 border-blue-300 rounded-xl shadow-sm">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="font-orpheus text-xl font-bold text-gray-900">
                Quality User-Based Performance Tiers
              </h3>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                NEW METRIC
              </span>
            </div>
            <p className="font-benton text-sm text-gray-700 mb-3 leading-relaxed">
              Campaign performance is now measured by the number of <strong>quality users</strong> (visitors who spend &gt;1 minute on site), 
              providing more meaningful insights into user engagement and campaign effectiveness than raw traffic volume.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-white bg-opacity-60 rounded-lg p-2 text-center">
                <div className="font-semibold text-green-700">Excellent</div>
                <div className="text-green-600">500+ Users</div>
              </div>
              <div className="bg-white bg-opacity-60 rounded-lg p-2 text-center">
                <div className="font-semibold text-yellow-700">Good</div>
                <div className="text-yellow-600">200-499 Users</div>
              </div>
              <div className="bg-white bg-opacity-60 rounded-lg p-2 text-center">
                <div className="font-semibold text-orange-700">Average</div>
                <div className="text-orange-600">50-199 Users</div>
              </div>
              <div className="bg-white bg-opacity-60 rounded-lg p-2 text-center">
                <div className="font-semibold text-red-700">Poor</div>
                <div className="text-red-600">&lt;50 Users</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TierCard 
          tier="excellent" 
          campaigns={excellent} 
          title="Excellent" 
          count={safePerformanceTiers.excellent}
        />
        <TierCard 
          tier="good" 
          campaigns={good} 
          title="Good" 
          count={safePerformanceTiers.good}
        />
        <TierCard 
          tier="average" 
          campaigns={average} 
          title="Average" 
          count={safePerformanceTiers.average}
        />
        <TierCard 
          tier="poor" 
          campaigns={poor} 
          title="Poor" 
          count={safePerformanceTiers.poor}
        />
      </div>

      {/* Enhanced Quality-Focused Summary Stats */}
      <div className="mt-8 pt-6 border-t-2 border-moi-light">
        <h3 className="font-orpheus text-lg font-bold text-moi-charcoal mb-4 text-center">
          Quality User Performance Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-5 border border-green-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-sm font-bold">Σ</span>
            </div>
            <p className="font-benton text-3xl font-black text-green-700 mb-1">
              {formatNumber(safeUtmCampaigns.reduce((sum, c) => sum + (c.qualityCustomers || 0), 0))}
            </p>
            <p className="font-benton text-sm text-green-700 font-bold">Total Quality Users</p>
            <p className="font-benton text-xs text-green-600">Across all campaigns</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-5 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-sm font-bold">%</span>
            </div>
            <p className="font-benton text-3xl font-black text-blue-700 mb-1">
              {safeUtmCampaigns.length > 0 ? Math.round(((excellent.length + good.length) / safeUtmCampaigns.length) * 100) : 0}%
            </p>
            <p className="font-benton text-sm text-blue-700 font-bold">High Performing</p>
            <p className="font-benton text-xs text-blue-600">Excellent + Good tiers</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-5 border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-sm font-bold">⭐</span>
            </div>
            <p className="font-benton text-3xl font-black text-purple-700 mb-1">
              {formatNumber(excellent.concat(good).reduce((sum, c) => sum + (c.qualityCustomers || 0), 0))}
            </p>
            <p className="font-benton text-sm text-purple-700 font-bold">Top Tier Quality Users</p>
            <p className="font-benton text-xs text-purple-600">From best campaigns</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-red-100 rounded-xl p-5 border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-sm font-bold">⚠</span>
            </div>
            <p className="font-benton text-3xl font-black text-orange-700 mb-1">
              {poor.length}
            </p>
            <p className="font-benton text-sm text-orange-700 font-bold">Need Optimization</p>
            <p className="font-benton text-xs text-orange-600">Poor tier campaigns</p>
          </div>
        </div>
      </div>

      {/* Performance Tier Modal */}
      {showModal && (
        <PerformanceTierModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default CampaignPerformanceTiers;