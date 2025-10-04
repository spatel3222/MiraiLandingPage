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
    <div className={`rounded-lg border-2 p-4 relative ${getTierColor(tier)}`}>
      {/* Subtle background icon */}
      <div className="absolute top-2 right-2 opacity-10 pointer-events-none">
        <div className="w-8 h-8">
          {getTierIcon(tier)}
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-benton text-lg font-semibold">{title}</h3>
        <span className="font-benton text-2xl font-bold">{count}</span>
      </div>
      
      {campaigns.length > 0 && (
        <div className="space-y-3">
          {/* Primary Metric - Quality Users */}
          <div className="bg-white bg-opacity-50 rounded-lg p-3 border border-white border-opacity-30">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Quality Users</span>
              <span className="text-lg font-bold">
                {formatNumber(campaigns.reduce((sum, c) => sum + (c.qualityCustomers || 0), 0))}
              </span>
            </div>
            <p className="text-xs opacity-75 mt-1">Visitors with >1min session time</p>
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
      
      {/* Quality User Focus Note */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="font-benton text-sm font-medium text-blue-900 mb-1">
              Quality User-Based Performance Tiers
            </p>
            <p className="font-benton text-sm text-blue-800">
              Campaign performance is now measured by the number of quality users (visitors who spend >1 minute on site), 
              providing more meaningful insights into user engagement and campaign effectiveness.
            </p>
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

      {/* Quality-Focused Summary Stats */}
      <div className="mt-6 pt-4 border-t border-moi-light">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
            <p className="font-benton text-2xl font-bold text-green-700">
              {formatNumber(safeUtmCampaigns.reduce((sum, c) => sum + (c.qualityCustomers || 0), 0))}
            </p>
            <p className="font-benton text-sm text-green-600 font-medium">Total Quality Users</p>
            <p className="font-benton text-xs text-green-500">Across all campaigns</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
            <p className="font-benton text-2xl font-bold text-blue-700">
              {safeUtmCampaigns.length > 0 ? Math.round(((excellent.length + good.length) / safeUtmCampaigns.length) * 100) : 0}%
            </p>
            <p className="font-benton text-sm text-blue-600 font-medium">High Performing</p>
            <p className="font-benton text-xs text-blue-500">Excellent + Good tiers</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-4">
            <p className="font-benton text-2xl font-bold text-purple-700">
              {formatNumber(excellent.concat(good).reduce((sum, c) => sum + (c.qualityCustomers || 0), 0))}
            </p>
            <p className="font-benton text-sm text-purple-600 font-medium">Top Tier Quality Users</p>
            <p className="font-benton text-xs text-purple-500">From best campaigns</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4">
            <p className="font-benton text-2xl font-bold text-orange-700">
              {poor.length}
            </p>
            <p className="font-benton text-sm text-orange-600 font-medium">Need Optimization</p>
            <p className="font-benton text-xs text-orange-500">Poor tier campaigns</p>
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