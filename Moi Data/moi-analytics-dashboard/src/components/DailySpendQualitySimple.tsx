import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, DollarSign, Users } from 'lucide-react';

interface DailySpendQualitySimpleProps {
  selectedDateRange: { startDate: string; endDate: string } | null;
}

// Simple mock data for demonstration - replace with actual data when Supabase is working
const generateMockData = (startDate: string, endDate: string) => {
  const data = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    data.push({
      date: dateStr,
      metaSpend: Math.random() * 500 + 100,
      googleSpend: Math.random() * 300 + 50,
      totalUsers: Math.floor(Math.random() * 500 + 100),
      qualityUsers: Math.floor(Math.random() * 200 + 50),
      conversionRate: Math.random() * 5 + 1,
    });
  }
  return data;
};

export const DailySpendQualitySimple: React.FC<DailySpendQualitySimpleProps> = ({
  selectedDateRange
}) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (selectedDateRange) {
      // For now, use mock data to avoid Supabase issues
      // TODO: Replace with actual Supabase queries when connection issues are resolved
      const mockData = generateMockData(selectedDateRange.startDate, selectedDateRange.endDate);
      setData(mockData);
    }
  }, [selectedDateRange]);

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  if (!selectedDateRange || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Daily Spend vs User Quality</h3>
        </div>
        <p className="text-gray-500 text-center">Select a date range to view daily correlations</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Daily Spend vs User Quality (Simplified)</h3>
        <span className="text-sm text-gray-500">({data.length} days)</span>
      </div>

      {/* Simple Table View */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Spend</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Users</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quality Users</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cost/Quality User</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quality %</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((day, index) => {
              const totalSpend = day.metaSpend + day.googleSpend;
              const costPerQuality = day.qualityUsers > 0 ? totalSpend / day.qualityUsers : 0;
              const qualityPercent = day.totalUsers > 0 ? (day.qualityUsers / day.totalUsers) * 100 : 0;
              
              return (
                <tr key={day.date} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2 text-sm font-medium text-gray-900">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(totalSpend)}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{day.totalUsers}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{day.qualityUsers}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(costPerQuality)}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      qualityPercent >= 40 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {formatPercent(qualityPercent)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(data.reduce((sum, d) => sum + d.metaSpend + d.googleSpend, 0))}
          </p>
          <p className="text-sm text-gray-600">Total Spend</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {data.reduce((sum, d) => sum + d.totalUsers, 0)}
          </p>
          <p className="text-sm text-gray-600">Total Users</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600">
            {data.reduce((sum, d) => sum + d.qualityUsers, 0)}
          </p>
          <p className="text-sm text-gray-600">Quality Users</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-600">
            {formatCurrency(
              data.reduce((sum, d) => sum + d.metaSpend + d.googleSpend, 0) / 
              Math.max(1, data.reduce((sum, d) => sum + d.qualityUsers, 0))
            )}
          </p>
          <p className="text-sm text-gray-600">Avg Cost/Quality</p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
        <p className="text-sm text-yellow-800">
          ⚠️ Note: Currently showing sample data. Supabase connection will be restored after resolving browser resource limits.
        </p>
      </div>
    </div>
  );
};

export default DailySpendQualitySimple;