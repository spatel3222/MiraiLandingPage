import React from 'react';
import { Users, MousePointer, ShoppingCart, TrendingUp, Clock, Eye, Target, DollarSign } from 'lucide-react';
import type { DashboardData } from '../types';

interface Props {
  data: DashboardData;
  dateRangeSelector?: React.ReactNode;
}

const KeyMetricsPanel: React.FC<Props> = ({ data, dateRangeSelector }) => {
  const { keyMetrics } = data;

  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined || isNaN(num) || !isFinite(num)) return '0';
    const safeNum = Math.floor(Number(num));
    if (safeNum >= 1000000) return `${(safeNum / 1000000).toFixed(1)}M`;
    if (safeNum >= 1000) return `${(safeNum / 1000).toFixed(1)}K`;
    return safeNum.toLocaleString();
  };

  const formatCurrency = (num: number | null | undefined): string => {
    return `₹${formatNumber(num)}`;
  };

  const formatTime = (seconds: number | null | undefined): string => {
    if (seconds === null || seconds === undefined || isNaN(seconds)) return '0m 0s';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="bg-white rounded-lg border border-moi-light p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-orpheus text-2xl font-bold text-moi-charcoal">
          Key Performance Metrics
        </h2>
        {dateRangeSelector && (
          <div className="ml-4">
            {dateRangeSelector}
          </div>
        )}
      </div>
      
      {/* Row 1: Campaign Information */}
      <div className="mb-8">
        <h3 className="font-benton text-lg font-semibold text-moi-grey mb-4">
          Campaign Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-moi-beige rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-benton text-sm text-moi-grey">Meta/Google Campaigns</p>
                <p className="font-benton text-2xl font-bold text-moi-charcoal">
                  {keyMetrics.uniqueCampaigns}
                </p>
              </div>
              <Target className="w-8 h-8 text-moi-red" />
            </div>
          </div>
          
          <div className="bg-moi-beige rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-benton text-sm text-moi-grey">Avg Ad Sets per Campaign</p>
                <p className="font-benton text-2xl font-bold text-moi-charcoal">
                  {keyMetrics.avgAdsetsPerCampaign}
                </p>
              </div>
              <MousePointer className="w-8 h-8 text-moi-red" />
            </div>
          </div>
          
          <div className="bg-moi-beige rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-benton text-sm text-moi-grey">Avg Traffic per Campaign</p>
                <p className="font-benton text-2xl font-bold text-moi-charcoal">
                  {formatNumber(keyMetrics.avgTrafficPerCampaign)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-moi-red" />
            </div>
          </div>
          
          <div className="bg-moi-beige rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-benton text-sm text-moi-grey">Unique Users</p>
                <p className="font-benton text-2xl font-bold text-moi-charcoal">
                  {formatNumber(keyMetrics.totalUniqueUsers)}
                </p>
              </div>
              <Users className="w-8 h-8 text-moi-red" />
            </div>
          </div>
        </div>
      </div>


      {/* Row 2: Funnel Data (BOF) */}
      <div>
        <h3 className="font-benton text-lg font-semibold text-moi-grey mb-4">
          Funnel Performance (Bottom of Funnel)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-moi-beige rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-benton text-sm text-moi-grey">Add to Cart (ATC)</p>
                <p className="font-benton text-2xl font-bold text-moi-charcoal">
                  {formatNumber(keyMetrics.totalATC)}
                </p>
              </div>
              <ShoppingCart className="w-8 h-8 text-moi-red" />
            </div>
          </div>
          
          <div className="bg-moi-beige rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-benton text-sm text-moi-grey">Sessions that reached checkout</p>
                <p className="font-benton text-2xl font-bold text-moi-charcoal">
                  {formatNumber(keyMetrics.totalCheckoutSessions)}
                </p>
              </div>
              <Target className="w-8 h-8 text-moi-red" />
            </div>
          </div>
          
          <div className="bg-moi-beige rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-benton text-sm text-moi-grey">Conversion Rate</p>
                <p className="font-benton text-lg font-bold text-moi-grey italic">
                  Coming Soon
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-moi-red" />
            </div>
          </div>
          
          <div className="bg-moi-beige rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-benton text-sm text-moi-grey">Est. Revenue</p>
                <p className="font-benton text-lg font-bold text-moi-grey italic">
                  Coming Soon
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-moi-red" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyMetricsPanel;