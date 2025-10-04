import React, { useState, useEffect } from 'react';
import { Info, Users, MousePointer, ShoppingCart, Target, DollarSign, TrendingUp } from 'lucide-react';
import SimplifiedPerformanceTierModal from './SimplifiedPerformanceTierModal';

interface CampaignData {
  campaignName: string;
  totalUsers: number;
  qualityUsers: number;
  adSpend: number;
  addToCart: number;
  checkoutSessions: number;
}

const SimplifiedCampaignPerformance: React.FC = () => {
  const [campaignData, setCampaignData] = useState<CampaignData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCampaignData();
  }, []);

  const loadCampaignData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try to read from exported file first, fall back to internal CSV
      // UPDATED: 2025-10-04T18:15:00 - Now using updated CSV with correct quality users data
      let response;
      try {
        response = await fetch('/MOI_Adset_Level_Matrices_Sep29-Sep29_2025.csv');
        if (!response.ok) throw new Error('Exported file not found');
      } catch {
        // Fallback to internal CSV
        response = await fetch('/MOI_Sample_Output_Generation/05_CSV_Outputs/Ad Set Level.csv');
      }
      if (!response.ok) {
        throw new Error(`Failed to load campaign data: ${response.status}`);
      }
      
      const csvText = await response.text();
      const rows = csvText.split('\n').slice(1); // Skip header row
      
      // Group by campaign and aggregate metrics
      const campaignMap = new Map<string, CampaignData>();
      
      rows.forEach(row => {
        if (!row.trim()) return;
        
        // Handle CSV with quotes - split and clean
        const columns = row.split(',').map(col => col.replace(/^"|"$/g, ''));
        const campaignName = columns[1] || 'Unknown Campaign';
        const totalUsers = parseFloat(columns[5]) || 0;
        const qualityUsers = isNaN(parseFloat(columns[11])) ? 0 : parseFloat(columns[11]);
        const adSpend = parseFloat(columns[4]) || 0;
        const addToCart = parseFloat(columns[7]) || 0;
        const checkoutSessions = parseFloat(columns[8]) || 0;
        
        // Skip empty or invalid rows - only skip if actually empty/undefined
        if (!campaignName || campaignName.trim() === '' || campaignName === 'Unknown Campaign') return;
        
        if (campaignMap.has(campaignName)) {
          const existing = campaignMap.get(campaignName)!;
          existing.totalUsers += totalUsers;
          // Handle -999 values: only add valid values, ignore -999
          if (qualityUsers !== -999) {
            if (existing.qualityUsers === -999) {
              existing.qualityUsers = qualityUsers; // First valid value replaces -999
            } else {
              existing.qualityUsers += qualityUsers;
            }
          }
          // If both existing and new are -999, keep -999
          existing.adSpend += adSpend;
          existing.addToCart += addToCart;
          existing.checkoutSessions += checkoutSessions;
        } else {
          campaignMap.set(campaignName, {
            campaignName,
            totalUsers,
            qualityUsers,
            adSpend,
            addToCart,
            checkoutSessions
          });
        }
      });
      
      // Convert to array and sort by quality users descending
      const campaigns = Array.from(campaignMap.values())
        .filter(campaign => campaign.campaignName && campaign.campaignName.trim() !== '')
        .sort((a, b) => b.qualityUsers - a.qualityUsers);
      
      setCampaignData(campaigns);
    } catch (err) {
      console.error('Error loading campaign data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load campaign data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num === -999) return 'N/A'; // No data available for this metric
    if (num === null || num === undefined || isNaN(num) || !isFinite(num)) return 'N/A';
    if (num === 0) return '0';
    const safeNum = Math.floor(Number(num));
    if (safeNum >= 1000000) return `${(safeNum / 1000000).toFixed(1)}M`;
    if (safeNum >= 1000) return `${(safeNum / 1000).toFixed(1)}K`;
    return safeNum.toLocaleString();
  };

  const formatCurrency = (num: number): string => {
    if (num === -999) return 'N/A'; // No data available for this metric
    if (num === null || num === undefined || isNaN(num) || !isFinite(num)) return 'N/A';
    if (num === 0) return '₹0';
    return `₹${formatNumber(num)}`;
  };

  const calculateTotalMetrics = () => {
    return campaignData.reduce(
      (totals, campaign) => ({
        totalUsers: totals.totalUsers + (campaign.totalUsers === -999 ? 0 : campaign.totalUsers),
        qualityUsers: totals.qualityUsers + (campaign.qualityUsers === -999 ? 0 : campaign.qualityUsers),
        adSpend: totals.adSpend + (campaign.adSpend === -999 ? 0 : campaign.adSpend),
        addToCart: totals.addToCart + (campaign.addToCart === -999 ? 0 : campaign.addToCart),
        checkoutSessions: totals.checkoutSessions + (campaign.checkoutSessions === -999 ? 0 : campaign.checkoutSessions),
        campaignCount: totals.campaignCount + 1
      }),
      { totalUsers: 0, qualityUsers: 0, adSpend: 0, addToCart: 0, checkoutSessions: 0, campaignCount: 0 }
    );
  };

  const totals = calculateTotalMetrics();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-moi-light p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-moi-grey">Loading campaign performance data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-moi-light p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-moi-light p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-orpheus text-2xl font-bold text-moi-charcoal">
          Campaign Performance Overview
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-1 px-3 py-2 bg-moi-beige text-moi-charcoal rounded-lg hover:bg-moi-light transition-colors border border-moi-light"
          title="Campaign Performance Information"
        >
          <Info className="w-5 h-5 text-moi-red" />
          <span className="font-benton text-sm font-medium">Info</span>
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="mb-8">
        <h3 className="font-benton text-lg font-semibold text-moi-grey mb-4">Campaign Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-moi-beige rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-benton text-sm text-moi-grey">Total Campaigns</p>
                <p className="font-benton text-2xl font-bold text-moi-charcoal">{totals.campaignCount}</p>
              </div>
              <Target className="w-8 h-8 text-moi-red" />
            </div>
          </div>
          <div className="bg-moi-beige rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-benton text-sm text-moi-grey">Quality Users</p>
                <p className="font-benton text-2xl font-bold text-moi-charcoal">{formatNumber(totals.qualityUsers)}</p>
              </div>
              <Users className="w-8 h-8 text-moi-red" />
            </div>
          </div>
          <div className="bg-moi-beige rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-benton text-sm text-moi-grey">Total Ad Spend</p>
                <p className="font-benton text-2xl font-bold text-moi-charcoal">{formatCurrency(totals.adSpend)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-moi-red" />
            </div>
          </div>
          <div className="bg-moi-beige rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-benton text-sm text-moi-grey">Total ATC</p>
                <p className="font-benton text-2xl font-bold text-moi-charcoal">{formatNumber(totals.addToCart)}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-moi-red" />
            </div>
          </div>
        </div>
      </div>

      {/* Campaign List */}
      <div className="space-y-4">
        <h3 className="font-orpheus text-lg font-bold text-moi-charcoal mb-4">
          Campaign Details (Sorted by Quality Users)
        </h3>
        
        {campaignData.length === 0 ? (
          <div className="text-center py-4 text-moi-grey">
            No campaign data available
          </div>
        ) : (
          <div className="grid gap-2">
            {campaignData.map((campaign, index) => (
              <div key={index} className="bg-moi-beige rounded-lg p-3 border border-moi-light">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-benton text-base font-bold text-moi-charcoal">
                      {campaign.campaignName}
                    </h4>
                    <p className="font-benton text-xs text-moi-grey">
                      Rank #{index + 1}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-benton text-xl font-bold text-moi-charcoal">
                      {formatNumber(campaign.qualityUsers)}
                    </div>
                    <div className="font-benton text-xs text-moi-grey">Quality Users</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3 text-moi-red flex-shrink-0" />
                    <div>
                      <div className="font-benton font-medium text-moi-charcoal">{formatNumber(campaign.totalUsers)}</div>
                      <div className="font-benton text-moi-grey">Total Users</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-3 h-3 text-moi-red flex-shrink-0" />
                    <div>
                      <div className="font-benton font-medium text-moi-charcoal">{formatCurrency(campaign.adSpend)}</div>
                      <div className="font-benton text-moi-grey">Ad Spend</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ShoppingCart className="w-3 h-3 text-moi-red flex-shrink-0" />
                    <div>
                      <div className="font-benton font-medium text-moi-charcoal">{formatNumber(campaign.addToCart)}</div>
                      <div className="font-benton text-moi-grey">ATC</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3 text-moi-red flex-shrink-0" />
                    <div>
                      <div className="font-benton font-medium text-moi-charcoal">
                        {campaign.totalUsers > 0 && campaign.qualityUsers !== -999 ? ((campaign.qualityUsers / campaign.totalUsers) * 100).toFixed(1) : 'N/A'}%
                      </div>
                      <div className="font-benton text-moi-grey">Quality Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performance Tier Modal */}
      {showModal && (
        <SimplifiedPerformanceTierModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default SimplifiedCampaignPerformance;