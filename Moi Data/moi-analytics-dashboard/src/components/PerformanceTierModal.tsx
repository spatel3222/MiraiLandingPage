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
      criteria: '500+ Quality Users',
      logic: 'Campaigns attracting 500 or more quality users (visitors who spend &gt;1 minute on site) demonstrate exceptional ability to engage the right audience with compelling content. This represents the top performance tier.',
      reasons: [
        'Highly effective audience targeting',
        'Compelling ad creative that attracts engaged users',
        'Strong landing page experience encouraging exploration',
        'Excellent product-market fit',
        'Optimal campaign timing and placement'
      ],
      examples: [
        { name: 'india-pmax-rings', qualityUsers: '750', reason: 'High-intent product searches with optimized Performance Max campaign attracting engaged shoppers' },
        { name: 'Retargeting | Purchase Intent', qualityUsers: '650', reason: 'Targeting users who previously showed purchase behavior, resulting in high engagement' },
        { name: 'TOF | Lookalike Premium', qualityUsers: '580', reason: 'Quality lookalike audience based on high-value customers spending significant time on site' }
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
      criteria: '200-499 Quality Users',
      logic: 'Solid performing campaigns attracting 200-499 quality users. These campaigns show good engagement potential with room for scaling and optimization.',
      reasons: [
        'Good targeting with opportunity for refinement',
        'Decent ad creative performance',
        'Acceptable user engagement levels',
        'Room for experience improvements',
        'Moderate market competition'
      ],
      examples: [
        { name: 'BOF | Interest Stacking', qualityUsers: '420', reason: 'Multiple interests targeting creating engaged user sessions' },
        { name: 'MOF | Engagement Custom', qualityUsers: '315', reason: 'Retargeting engaged users from previous campaigns with good session depth' },
        { name: 'Search | Brand Terms', qualityUsers: '280', reason: 'Brand awareness driving qualified, engaged traffic' }
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
      criteria: '50-199 Quality Users',
      logic: 'Campaigns attracting 50-199 quality users perform at market average. These need attention to improve user engagement and session quality.',
      reasons: [
        'Broad targeting reducing engagement quality',
        'Ad creative needs optimization for engagement',
        'Landing page experience causing quick exits',
        'Pricing or offer not compelling enough',
        'Timing or placement issues affecting engagement'
      ],
      examples: [
        { name: 'TOF | Broad Interest', qualityUsers: '145', reason: 'Wide audience targeting diluting user engagement quality' },
        { name: 'Display | Awareness', qualityUsers: '95', reason: 'Brand awareness focus with users not deeply engaged' },
        { name: 'Social | Engagement', qualityUsers: '78', reason: 'Social traffic requiring engagement optimization' }
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
      criteria: '<50 Quality Users',
      logic: 'Campaigns attracting fewer than 50 quality users indicate poor audience targeting or engagement. These require immediate attention or potential pause.',
      reasons: [
        'Poor audience targeting or relevance',
        'Weak ad creative failing to engage users',
        'Landing page causing immediate bounce',
        'High competition or market saturation',
        'Technical tracking or user experience problems'
      ],
      examples: [
        { name: 'BOF | DPA Broad', qualityUsers: '32', reason: 'Dynamic product ads with too broad targeting causing poor engagement' },
        { name: 'TOF | Cold Traffic', qualityUsers: '18', reason: 'Untargeted cold audience with low engagement and quick exits' },
        { name: 'Display | Generic', qualityUsers: '12', reason: 'Generic display targeting without engagement focus' }
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
              Quality User-Based Performance Tiers
            </h2>
            <p className="font-benton text-sm text-moi-grey mt-1">
              Understanding how campaigns are categorized based on quality user engagement
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
          {/* Overview - Enhanced */}
          <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-xl">
            <h3 className="font-orpheus text-lg font-bold text-blue-900 mb-3">Quality User-Based Tier System</h3>
            <p className="font-benton text-sm text-blue-800 mb-3 leading-relaxed">
              Campaigns are automatically categorized into performance tiers based on the number of <strong>quality users</strong> they attract. 
              Quality users are visitors who spend more than 1 minute on the site, indicating genuine engagement and interest. 
              This metric provides more meaningful insights into campaign effectiveness than raw traffic volume.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="bg-green-100 rounded p-2 text-center border border-green-200">
                <div className="font-bold text-green-800">Excellent</div>
                <div className="text-green-700">500+ Users</div>
              </div>
              <div className="bg-yellow-100 rounded p-2 text-center border border-yellow-200">
                <div className="font-bold text-yellow-800">Good</div>
                <div className="text-yellow-700">200-499 Users</div>
              </div>
              <div className="bg-orange-100 rounded p-2 text-center border border-orange-200">
                <div className="font-bold text-orange-800">Average</div>
                <div className="text-orange-700">50-199 Users</div>
              </div>
              <div className="bg-red-100 rounded p-2 text-center border border-red-200">
                <div className="font-bold text-red-800">Poor</div>
                <div className="text-red-700">&lt;50 Users</div>
              </div>
            </div>
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
                            {example.qualityUsers} users
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
            <h3 className="font-benton font-semibold text-moi-charcoal mb-3">Recommended Actions by Quality User Tier:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-benton text-sm">
              <div>
                <h4 className="font-medium text-green-700 mb-1">Excellent & Good Campaigns (High Quality User Count):</h4>
                <ul className="text-moi-grey space-y-1">
                  <li>• Scale budget to attract more quality users</li>
                  <li>• Expand to similar engaged audiences</li>
                  <li>• Test additional creatives that drive engagement</li>
                  <li>• Optimize for session depth and time spent</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-red-700 mb-1">Average & Poor Campaigns (Low Quality User Count):</h4>
                <ul className="text-moi-grey space-y-1">
                  <li>• Improve targeting to attract engaged users</li>
                  <li>• Optimize landing page for engagement</li>
                  <li>• Test creatives that encourage exploration</li>
                  <li>• Consider pausing campaigns with &lt;50 quality users</li>
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

// Fixed JSX escaping issue
export default PerformanceTierModal;