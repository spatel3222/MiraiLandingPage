import React, { useState } from 'react';
import { Info, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { DashboardData, CampaignMetrics } from '../types';

interface Props {
  data: DashboardData;
}

const CampaignPerformanceTiers: React.FC<Props> = ({ data }) => {
  const [showInfo, setShowInfo] = useState(false);

  // Group campaigns by performance tier
  const excellent = data.campaigns.filter(c => c.performanceTier === 'excellent');
  const good = data.campaigns.filter(c => c.performanceTier === 'good');
  const average = data.campaigns.filter(c => c.performanceTier === 'average');
  const poor = data.campaigns.filter(c => c.performanceTier === 'poor');

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
    campaigns: CampaignMetrics[]; 
    title: string; 
  }> = ({ tier, campaigns, title }) => (
    <div className={`rounded-lg border-2 p-4 ${getTierColor(tier)}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getTierIcon(tier)}
          <h3 className="font-benton text-lg font-semibold">{title}</h3>
        </div>
        <span className="font-benton text-2xl font-bold">{campaigns.length}</span>
      </div>
      
      {campaigns.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm">
            <p><strong>Total Sessions:</strong> {formatNumber(campaigns.reduce((sum, c) => sum + c.totalSessions, 0))}</p>
            <p><strong>Avg Quality Score:</strong> {Math.round(campaigns.reduce((sum, c) => sum + c.qualityScore, 0) / campaigns.length)}/100</p>
          </div>
          
          {campaigns.length <= 3 ? (
            <div className="text-xs space-y-1">
              {campaigns.map((campaign, idx) => (
                <div key={idx} className="truncate">
                  • {campaign.utmCampaign} ({campaign.qualityScore}/100)
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs">
              <div className="space-y-1 mb-1">
                {campaigns.slice(0, 2).map((campaign, idx) => (
                  <div key={idx} className="truncate">
                    • {campaign.utmCampaign} ({campaign.qualityScore}/100)
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
          onClick={() => setShowInfo(!showInfo)}
          className="flex items-center space-x-1 text-moi-grey hover:text-moi-charcoal transition-colors"
          title="Quality Score Formula"
        >
          <Info className="w-5 h-5" />
          <span className="font-benton text-sm">Formula</span>
        </button>
      </div>

      {/* Quality Score Formula Info */}
      {showInfo && (
        <div className="bg-moi-beige rounded-lg p-4 mb-6 border border-moi-light">
          <h3 className="font-benton text-lg font-semibold text-moi-charcoal mb-3">
            Quality Score Formula (0-100)
          </h3>
          <div className="font-benton text-sm text-moi-grey space-y-2">
            <p><strong>Weighted Components:</strong></p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Checkout Conversion (40%):</strong> How well campaigns convert visitors to purchases</li>
              <li><strong>Cart Addition Rate (30%):</strong> Effectiveness at getting users to add items to cart</li>
              <li><strong>Session Engagement (20%):</strong> Average session duration quality</li>
              <li><strong>Customer Loyalty (10%):</strong> Sessions per customer ratio</li>
            </ul>
            <div className="mt-3 text-xs">
              <p><strong>Scoring:</strong> Excellent (80-100) | Good (60-79) | Average (40-59) | Poor (0-39)</p>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TierCard 
          tier="excellent" 
          campaigns={excellent} 
          title="Excellent" 
        />
        <TierCard 
          tier="good" 
          campaigns={good} 
          title="Good" 
        />
        <TierCard 
          tier="average" 
          campaigns={average} 
          title="Average" 
        />
        <TierCard 
          tier="poor" 
          campaigns={poor} 
          title="Poor" 
        />
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-moi-light">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="font-benton text-2xl font-bold text-moi-charcoal">
              {Math.round(((excellent.length + good.length) / data.campaigns.length) * 100)}%
            </p>
            <p className="font-benton text-sm text-moi-grey">High Quality Campaigns</p>
          </div>
          <div>
            <p className="font-benton text-2xl font-bold text-moi-charcoal">
              {formatNumber(excellent.concat(good).reduce((sum, c) => sum + c.totalSessions, 0))}
            </p>
            <p className="font-benton text-sm text-moi-grey">Quality Traffic</p>
          </div>
          <div>
            <p className="font-benton text-2xl font-bold text-moi-charcoal">
              {Math.round(data.campaigns.reduce((sum, c) => sum + c.qualityScore, 0) / data.campaigns.length)}
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
    </div>
  );
};

export default CampaignPerformanceTiers;