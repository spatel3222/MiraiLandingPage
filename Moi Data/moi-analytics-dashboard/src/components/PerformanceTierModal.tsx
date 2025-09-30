import React from 'react';
import { X, Target, TrendingUp, AlertTriangle, AlertCircle } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const PerformanceTierModal: React.FC<Props> = ({ onClose }) => {
  const tierDetails = [
    {
      tier: 'excellent',
      name: 'Excellent',
      icon: <Target className="w-6 h-6 text-green-700" />,
      color: 'green',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300',
      textColor: 'text-green-800',
      criteria: 'Conversion Rate ≥ 1.0%',
      logic: 'Campaigns achieving 1% or higher conversion rate demonstrate exceptional performance with strong user engagement and effective targeting.',
      reasons: [
        'Highly targeted audience segments',
        'Compelling ad creative and messaging',
        'Optimized landing page experience',
        'Strong product-market fit',
        'Effective funnel optimization'
      ],
      examples: [
        { name: 'india-pmax-rings', conversionRate: '2.08%', reason: 'High-intent product searches with optimized Performance Max campaign' },
        { name: 'Retargeting | Purchase Intent', conversionRate: '1.45%', reason: 'Targeting users who previously showed purchase behavior' },
        { name: 'TOF | Lookalike Premium', conversionRate: '1.23%', reason: 'Quality lookalike audience based on high-value customers' }
      ]
    },
    {
      tier: 'good',
      name: 'Good',
      icon: <TrendingUp className="w-6 h-6 text-yellow-700" />,
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-300',
      textColor: 'text-yellow-800',
      criteria: 'Conversion Rate 0.5% - 0.99%',
      logic: 'Solid performing campaigns with above-average conversion rates. These campaigns show good potential but have room for optimization.',
      reasons: [
        'Good targeting with minor refinements needed',
        'Decent ad creative performance',
        'Acceptable user experience',
        'Room for landing page improvements',
        'Moderate competition in target market'
      ],
      examples: [
        { name: 'BOF | Interest Stacking', conversionRate: '0.78%', reason: 'Multiple interests targeting with good engagement' },
        { name: 'MOF | Engagement Custom', conversionRate: '0.65%', reason: 'Retargeting engaged users from previous campaigns' },
        { name: 'Search | Brand Terms', conversionRate: '0.52%', reason: 'Brand awareness driving qualified traffic' }
      ]
    },
    {
      tier: 'average',
      name: 'Average',
      icon: <AlertTriangle className="w-6 h-6 text-orange-700" />,
      color: 'orange',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-300',
      textColor: 'text-orange-800',
      criteria: 'Conversion Rate 0.2% - 0.49%',
      logic: 'Campaigns performing at market average. These need attention and optimization to improve effectiveness and ROI.',
      reasons: [
        'Broad targeting needs refinement',
        'Ad creative requires optimization',
        'Landing page experience issues',
        'Pricing or offer competitiveness',
        'Seasonal or timing factors'
      ],
      examples: [
        { name: 'TOF | Broad Interest', conversionRate: '0.34%', reason: 'Wide audience targeting diluting conversion quality' },
        { name: 'Display | Awareness', conversionRate: '0.28%', reason: 'Brand awareness focus with lower intent audience' },
        { name: 'Social | Engagement', conversionRate: '0.21%', reason: 'Social traffic requires funnel optimization' }
      ]
    },
    {
      tier: 'poor',
      name: 'Poor',
      icon: <AlertCircle className="w-6 h-6 text-red-700" />,
      color: 'red',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-300',
      textColor: 'text-red-800',
      criteria: 'Conversion Rate < 0.2%',
      logic: 'Under-performing campaigns that require immediate attention, optimization, or potential pause to prevent budget waste.',
      reasons: [
        'Poor audience targeting or relevance',
        'Weak ad creative or messaging',
        'Landing page conversion issues',
        'High competition or market saturation',
        'Technical tracking or attribution problems'
      ],
      examples: [
        { name: 'BOF | DPA Broad', conversionRate: '0.13%', reason: 'Dynamic product ads with too broad targeting parameters' },
        { name: 'TOF | Cold Traffic', conversionRate: '0.08%', reason: 'Untargeted cold audience with low purchase intent' },
        { name: 'Display | Generic', conversionRate: '0.05%', reason: 'Generic display targeting without specific user criteria' }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-moi-light">
          <div>
            <h2 className="font-orpheus text-2xl font-bold text-moi-charcoal">
              Campaign Performance Tier Logic
            </h2>
            <p className="font-benton text-sm text-moi-grey mt-1">
              Understanding how campaigns are categorized based on conversion performance
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
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-benton font-semibold text-blue-900 mb-2">Performance Tier System</h3>
            <p className="font-benton text-sm text-blue-800">
              Campaigns are automatically categorized into performance tiers based on their conversion rates. 
              This helps identify which campaigns are driving results and which need optimization or budget reallocation.
            </p>
          </div>

          {/* Tier Details */}
          <div className="space-y-6">
            {tierDetails.map((tier) => (
              <div
                key={tier.tier}
                className={`${tier.bgColor} ${tier.borderColor} border-2 rounded-lg p-6`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {tier.icon}
                    <h3 className={`font-benton text-xl font-bold ${tier.textColor}`}>
                      {tier.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${tier.bgColor} ${tier.textColor} border ${tier.borderColor}`}>
                      {tier.criteria}
                    </span>
                  </div>
                </div>

                {/* Logic Explanation */}
                <div className="mb-4">
                  <h4 className={`font-benton font-semibold ${tier.textColor} mb-2`}>Why Campaigns Fall Into This Category:</h4>
                  <p className={`font-benton text-sm ${tier.textColor} mb-3`}>
                    {tier.logic}
                  </p>
                </div>

                {/* Common Reasons */}
                <div className="mb-4">
                  <h4 className={`font-benton font-semibold ${tier.textColor} mb-2`}>Common Characteristics:</h4>
                  <ul className={`font-benton text-sm ${tier.textColor} space-y-1`}>
                    {tier.reasons.map((reason, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-xs mt-1">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Example Campaigns */}
                <div>
                  <h4 className={`font-benton font-semibold ${tier.textColor} mb-3`}>Example Campaigns:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {tier.examples.map((example, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-benton font-medium text-moi-charcoal text-sm truncate">
                            {example.name}
                          </h5>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${tier.textColor}`}>
                            {example.conversionRate}
                          </span>
                        </div>
                        <p className="font-benton text-xs text-moi-grey">
                          {example.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Items */}
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-benton font-semibold text-moi-charcoal mb-3">Recommended Actions by Tier:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-benton text-sm">
              <div>
                <h4 className="font-medium text-green-700 mb-1">Excellent & Good Campaigns:</h4>
                <ul className="text-moi-grey space-y-1">
                  <li>• Scale budget allocation</li>
                  <li>• Expand to similar audiences</li>
                  <li>• Test additional creatives</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-red-700 mb-1">Average & Poor Campaigns:</h4>
                <ul className="text-moi-grey space-y-1">
                  <li>• Optimize targeting and creatives</li>
                  <li>• Review landing page experience</li>
                  <li>• Consider pausing worst performers</li>
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

export default PerformanceTierModal;