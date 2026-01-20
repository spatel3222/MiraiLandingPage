import { TrendingUp, Clock, DollarSign, Timer, Users, Target } from 'lucide-react';

const metrics = [
  {
    icon: TrendingUp,
    value: '3x',
    label: 'Faster Claims Processing',
    description: 'Accelerate your workflow',
  },
  {
    icon: Clock,
    value: '40hrs',
    label: 'Saved Per Month',
    description: 'Time back for what matters',
  },
  {
    icon: DollarSign,
    value: '67%',
    label: 'Cost Reduction',
    description: 'Maximize efficiency',
  },
  {
    icon: Timer,
    value: '60hrs',
    label: 'Time Savings',
    description: 'Faster turnaround',
  },
  {
    icon: Users,
    value: '40%',
    label: 'Adoption Rate',
    description: 'Team engagement',
  },
  {
    icon: Target,
    value: '99%',
    label: 'Accuracy',
    description: 'Precision you can trust',
  },
];

export function ROIMetrics() {
  return (
    <section className="py-16 md:py-24 px-6" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-6xl mx-auto">
        {/* Section Label */}
        <div className="text-center mb-4">
          <span
            className="inline-block px-3 py-1 rounded-full text-sm font-medium"
            style={{
              backgroundColor: '#EAF1FF',
              color: '#1B365D',
            }}
          >
            ROI Metrics
          </span>
        </div>

        {/* Headline */}
        <h2
          className="text-center mb-4"
          style={{
            fontSize: 'clamp(28px, 5vw, 40px)',
            fontWeight: 600,
            color: '#1B365D',
            lineHeight: '1.2',
          }}
        >
          Measurable Impact from Day One
        </h2>

        {/* Subheadline */}
        <p
          className="text-center mb-12 max-w-2xl mx-auto"
          style={{
            fontSize: '18px',
            color: '#64748B',
            lineHeight: '1.6',
          }}
        >
          Real results that drive business transformation
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {metrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <div
                key={index}
                className="text-center p-6 rounded-xl transition-all duration-200 hover:shadow-md"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(27, 54, 93, 0.08)',
                }}
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: '#EAF1FF' }}
                >
                  <IconComponent size={24} style={{ color: '#1B365D' }} />
                </div>

                {/* Value */}
                <div
                  style={{
                    fontSize: '36px',
                    fontWeight: 700,
                    color: '#BF9874',
                    lineHeight: '1',
                    marginBottom: '8px',
                  }}
                >
                  {metric.value}
                </div>

                {/* Label */}
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#1B365D',
                    marginBottom: '4px',
                  }}
                >
                  {metric.label}
                </div>

                {/* Description */}
                <div
                  style={{
                    fontSize: '14px',
                    color: '#64748B',
                  }}
                >
                  {metric.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* Analytics Note */}
        <p
          className="text-center mt-10"
          style={{
            fontSize: '14px',
            color: '#94A3B8',
          }}
        >
          *Metrics based on customer analytics dashboards
        </p>
      </div>
    </section>
  );
}
