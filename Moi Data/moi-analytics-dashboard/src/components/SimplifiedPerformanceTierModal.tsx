import React from 'react';
import { X, Target, TrendingUp, AlertTriangle, Users, DollarSign, ShoppingCart } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const SimplifiedPerformanceTierModal: React.FC<Props> = ({ onClose }) => {
  const performanceInfo = {
    title: 'Campaign Performance Overview System',
    description: 'Understanding how campaigns are ranked and evaluated based on quality user engagement',
    metrics: [
      {
        name: 'Quality Users',
        icon: <Target className="w-6 h-6 text-blue-700" />,
        definition: 'Visitors who spend more than 1 minute on the site, indicating genuine engagement and interest.',
        importance: 'This metric provides more meaningful insights into campaign effectiveness than raw traffic volume.',
        calculation: 'Counted from session duration data where session_time > 60 seconds'
      },
      {
        name: 'Quality Rate',
        icon: <TrendingUp className="w-6 h-6 text-green-700" />,
        definition: 'Percentage of total users who become quality users (Quality Users / Total Users × 100).',
        importance: 'Shows campaign efficiency at attracting engaged audiences rather than just any traffic.',
        calculation: '(Users with Session > 1min / Total Users) × 100'
      },
      {
        name: 'Campaign Ranking',
        icon: <AlertTriangle className="w-6 h-6 text-purple-700" />,
        definition: 'Campaigns are sorted by total quality users in descending order.',
        importance: 'Higher quality user counts indicate better campaign performance and engagement.',
        calculation: 'Simple descending sort by quality user count'
      }
    ],
    fallbackInfo: {
      title: 'Data Handling',
      description: 'When data is unavailable or invalid, the system uses -999 as a consistent fallback value.',
      examples: [
        'Missing campaign data: Shows "-999"',
        'Invalid numeric values: Converted to "-999"',
        'Zero values: Displayed as "0" (valid data)',
        'Network errors: Shows error message with retry option'
      ]
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-moi-light">
          <div>
            <h2 className="font-orpheus text-2xl font-bold text-moi-charcoal">
              {performanceInfo.title}
            </h2>
            <p className="font-benton text-sm text-moi-grey mt-1">
              {performanceInfo.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-moi-grey hover:text-moi-charcoal transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Overview */}
          <div className="mb-6 p-5 bg-moi-beige border border-moi-light rounded-lg">
            <h3 className="font-orpheus text-lg font-bold text-moi-charcoal mb-3">Simplified Campaign Performance System</h3>
            <p className="font-benton text-sm text-moi-grey mb-3 leading-relaxed">
              This dashboard displays campaigns ranked by <strong>quality users</strong> - visitors who spend more than 1 minute on the site. 
              The system reads directly from processed output files to ensure data accuracy and prevent any interference with export functionality.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white rounded-lg p-3 border border-moi-light">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-4 h-4 text-moi-red" />
                  <span className="font-benton font-bold text-moi-charcoal">Data Source</span>
                </div>
                <p className="font-benton text-moi-grey">Reads from: /05_CSV_Outputs/Ad Set Level.csv</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-moi-light">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-moi-red" />
                  <span className="font-benton font-bold text-moi-charcoal">Ranking Method</span>
                </div>
                <p className="font-benton text-moi-grey">Sorted by Quality Users (descending)</p>
              </div>
            </div>
          </div>

          {/* Metrics Explanation */}
          <div className="space-y-6">
            <h3 className="font-orpheus text-lg font-bold text-moi-charcoal">Key Metrics Explained</h3>
            
            {performanceInfo.metrics.map((metric, index) => (
              <div key={index} className="bg-moi-beige border border-moi-light rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  {metric.icon}
                  <h4 className="font-benton text-xl font-bold text-moi-charcoal">
                    {metric.name}
                  </h4>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h5 className="font-benton font-semibold text-moi-charcoal mb-2">Definition:</h5>
                    <p className="font-benton text-sm text-moi-grey">
                      {metric.definition}
                    </p>
                  </div>
                  <div>
                    <h5 className="font-benton font-semibold text-moi-charcoal mb-2">Why It Matters:</h5>
                    <p className="font-benton text-sm text-moi-grey">
                      {metric.importance}
                    </p>
                  </div>
                  <div>
                    <h5 className="font-benton font-semibold text-moi-charcoal mb-2">Calculation:</h5>
                    <p className="font-benton text-sm text-moi-grey font-mono bg-white p-2 rounded">
                      {metric.calculation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Data Handling Section */}
          <div className="mt-6 p-5 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-benton font-semibold text-moi-charcoal mb-3 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span>{performanceInfo.fallbackInfo.title}</span>
            </h3>
            <p className="font-benton text-sm text-moi-grey mb-3">
              {performanceInfo.fallbackInfo.description}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {performanceInfo.fallbackInfo.examples.map((example, index) => (
                <div key={index} className="bg-white rounded p-3 border">
                  <span className="font-benton text-sm text-moi-charcoal">• {example}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mt-6 p-5 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-benton font-semibold text-green-800 mb-3">Benefits of This System</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-benton text-sm">
              <div>
                <h4 className="font-medium text-green-700 mb-2">✅ Data Integrity:</h4>
                <ul className="text-green-700 space-y-1 pl-4">
                  <li>• Reads from processed output files</li>
                  <li>• No interference with export functionality</li>
                  <li>• Consistent -999 fallback values</li>
                  <li>• Prevents data corruption</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-green-700 mb-2">✅ Simplified View:</h4>
                <ul className="text-green-700 space-y-1 pl-4">
                  <li>• Focus on quality user engagement</li>
                  <li>• Clear campaign ranking system</li>
                  <li>• Essential metrics only</li>
                  <li>• Easy to understand performance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-moi-light bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 font-benton text-moi-grey hover:text-moi-charcoal transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedPerformanceTierModal;