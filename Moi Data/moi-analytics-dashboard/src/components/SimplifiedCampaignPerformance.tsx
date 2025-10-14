import React, { useState, useEffect, useMemo } from 'react';
import { Info, Users, MousePointer, ShoppingCart, Target, DollarSign, TrendingUp, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
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
  const [sortColumn, setSortColumn] = useState<string>('qualityUsers');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

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

  // Handle column sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // Sort the campaign data based on current sort state
  const sortedCampaignData = useMemo(() => {
    const sorted = [...campaignData].sort((a, b) => {
      let aValue: any = 0;
      let bValue: any = 0;
      
      switch (sortColumn) {
        case 'campaignName':
          aValue = a.campaignName.toLowerCase();
          bValue = b.campaignName.toLowerCase();
          break;
        case 'qualityUsers':
          aValue = a.qualityUsers === -999 ? 0 : a.qualityUsers;
          bValue = b.qualityUsers === -999 ? 0 : b.qualityUsers;
          break;
        case 'totalUsers':
          aValue = a.totalUsers === -999 ? 0 : a.totalUsers;
          bValue = b.totalUsers === -999 ? 0 : b.totalUsers;
          break;
        case 'adSpend':
          aValue = a.adSpend === -999 ? 0 : a.adSpend;
          bValue = b.adSpend === -999 ? 0 : b.adSpend;
          break;
        case 'addToCart':
          aValue = a.addToCart === -999 ? 0 : a.addToCart;
          bValue = b.addToCart === -999 ? 0 : b.addToCart;
          break;
        case 'qualityRate':
          aValue = a.totalUsers > 0 && a.qualityUsers !== -999 ? (a.qualityUsers / a.totalUsers) : 0;
          bValue = b.totalUsers > 0 && b.qualityUsers !== -999 ? (b.qualityUsers / b.totalUsers) : 0;
          break;
        default:
          return 0;
      }
      
      if (sortColumn === 'campaignName') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
    
    return sorted;
  }, [campaignData, sortColumn, sortDirection]);

  // Helper function to render sort icon
  const renderSortIcon = (column: string) => {
    if (sortColumn === column) {
      return sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 inline ml-1" /> : <ChevronDown className="w-3 h-3 inline ml-1" />;
    }
    return <ChevronsUpDown className="w-3 h-3 inline ml-1 opacity-50" />;
  };

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
                <p className="font-benton text-sm text-moi-grey">Grouped Campaigns</p>
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

      {/* Campaign List - Excel Style Table */}
      <div className="space-y-4">
        <h3 className="font-orpheus text-lg font-bold text-moi-charcoal mb-4">
          Campaign Details (Sorted by Quality Users)
        </h3>
        
        {campaignData.length === 0 ? (
          <div className="text-center py-4 text-moi-grey">
            No campaign data available
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  {/* Sticky Header */}
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Rank
                      </th>
                      <th 
                        className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('campaignName')}
                      >
                        Campaign Name
                        {renderSortIcon('campaignName')}
                      </th>
                      <th 
                        className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('qualityUsers')}
                      >
                        Quality Users
                        {renderSortIcon('qualityUsers')}
                      </th>
                      <th 
                        className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('totalUsers')}
                      >
                        Total Users
                        {renderSortIcon('totalUsers')}
                      </th>
                      <th 
                        className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('adSpend')}
                      >
                        Ad Spend
                        {renderSortIcon('adSpend')}
                      </th>
                      <th 
                        className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('addToCart')}
                      >
                        ATC
                        {renderSortIcon('addToCart')}
                      </th>
                      <th 
                        className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('qualityRate')}
                      >
                        Quality Rate %
                        {renderSortIcon('qualityRate')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedCampaignData.map((campaign, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900">
                          {campaign.campaignName}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                          {formatNumber(campaign.qualityUsers)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                          {formatNumber(campaign.totalUsers)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                          {formatCurrency(campaign.adSpend)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                          {formatNumber(campaign.addToCart)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                          {campaign.totalUsers > 0 && campaign.qualityUsers !== -999 
                            ? ((campaign.qualityUsers / campaign.totalUsers) * 100).toFixed(1) 
                            : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Footer with Totals */}
                  <tfoot className="bg-gray-100 font-semibold">
                    <tr>
                      <td className="px-3 py-2 text-sm text-gray-900" colSpan={2}>
                        Total
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatNumber(totals.qualityUsers)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatNumber(totals.totalUsers)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatCurrency(totals.adSpend)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatNumber(totals.addToCart)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                        {totals.totalUsers > 0 && totals.qualityUsers !== -999 
                          ? ((totals.qualityUsers / totals.totalUsers) * 100).toFixed(1) 
                          : 'N/A'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
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