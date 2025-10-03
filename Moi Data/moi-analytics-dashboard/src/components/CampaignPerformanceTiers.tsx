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
  
  // Debug logging  
  console.log('CampaignPerformanceTiers data:', { performanceTiers, utmCampaigns });
  
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
  
  // Debug poor tier campaigns specifically
  console.log('🔴 Poor tier campaigns:', poor);
  console.log('🔴 Poor tier session details:', poor.map(c => ({
    name: c.utmCampaign,
    sessions: c.sessions,
    totalSessions: c.totalSessions,
    visitors: c.visitors
  })));
  console.log('🔴 Poor tier total sessions sum:', poor.reduce((sum, c) => sum + (c.sessions || c.totalSessions || 0), 0));

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
        <div className="space-y-2">
          <div className="text-sm">
            <p><strong>Total Sessions:</strong> {formatNumber(campaigns.reduce((sum, c) => sum + (c.sessions || c.totalSessions || 0), 0))}</p>
            <p><strong>Quality Customers (&gt;1min):</strong> {formatNumber(campaigns.reduce((sum, c) => sum + (c.qualityCustomers || 0), 0))}</p>
            <p><strong>Avg Quality Conversion:</strong> {(campaigns.reduce((sum, c) => sum + (c.qualityConversionRate || c.conversionRate || c.checkoutRate || 0), 0) / campaigns.length).toFixed(2)}%</p>
            {campaigns.some(c => c.adSpend) && (
              <p><strong>Total Ad Spend:</strong> ₹{formatNumber(campaigns.reduce((sum, c) => sum + (c.adSpend || 0), 0))}</p>
            )}
          </div>
          
          {campaigns.length <= 3 ? (
            <div className="text-xs space-y-1">
              {campaigns.map((campaign, idx) => (
                <div key={idx} className="truncate">
                  • {campaign.utmCampaign} ({(campaign.conversionRate || campaign.checkoutRate || 0).toFixed(2)}%)
                  {campaign.adSpend && (
                    <span className="text-gray-600 ml-1">(₹{formatNumber(campaign.adSpend)})</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs">
              <div className="space-y-1 mb-1">
                {campaigns.slice(0, 2).map((campaign, idx) => (
                  <div key={idx} className="truncate">
                    • {campaign.utmCampaign} ({(campaign.conversionRate || campaign.checkoutRate || 0).toFixed(2)}%)
                    {campaign.adSpend && (
                      <span className="text-gray-600 ml-1">(₹{formatNumber(campaign.adSpend)})</span>
                    )}
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
      
      {/* Quality Customer Note */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="font-benton text-sm text-blue-800">
          <strong>Quality-Based Performance:</strong> Tiers now based on customers who spend &gt;1 minute on site, 
          providing more accurate conversion insights from pivot temp data.
        </p>
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

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-moi-light">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="font-benton text-2xl font-bold text-moi-charcoal">
              {safeUtmCampaigns.length > 0 ? Math.round(((excellent.length + good.length) / safeUtmCampaigns.length) * 100) : 0}%
            </p>
            <p className="font-benton text-sm text-moi-grey">High Quality Campaigns</p>
          </div>
          <div>
            <p className="font-benton text-2xl font-bold text-moi-charcoal">
              {formatNumber(excellent.concat(good).reduce((sum, c) => sum + c.sessions, 0))}
            </p>
            <p className="font-benton text-sm text-moi-grey">Quality Traffic</p>
          </div>
          <div>
            <p className="font-benton text-2xl font-bold text-moi-charcoal">
              {safeUtmCampaigns.length > 0 ? (safeUtmCampaigns.reduce((sum, c) => sum + (c.qualityConversionRate || c.conversionRate || 0), 0) / safeUtmCampaigns.length).toFixed(2) : 0}
            </p>
            <p className="font-benton text-sm text-moi-grey">Avg Quality Score</p>
          </div>
          <div>
            <p className="font-benton text-2xl font-bold text-moi-charcoal">
              {poor.length}
            </p>
            <p className="font-benton text-sm text-moi-grey">Need Optimization</p>
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