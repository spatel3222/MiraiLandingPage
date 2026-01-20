import { useState } from 'react';
import { Building2, Scale, Briefcase, Check } from 'lucide-react';
import { Card, CardContent } from './ui/card';

type Industry = 'courts' | 'lawyers' | 'companies';

interface IndustryData {
  id: Industry;
  label: string;
  icon: typeof Building2;
  title: string;
  tagline: string;
  metric: string;
  metricLabel: string;
  features: string[];
}

const industryData: IndustryData[] = [
  {
    id: 'courts',
    label: 'Courts',
    icon: Building2,
    title: 'For Courts',
    tagline: 'Pan-India AI case management for Law',
    metric: '60hrs',
    metricLabel: 'Time Saved',
    features: [
      '20L pages/day digitization',
      'AI legal research',
      'eCourts integration',
      'Precedent search & RAG',
      'Vernacular support',
    ],
  },
  {
    id: 'lawyers',
    label: 'Lawyers',
    icon: Scale,
    title: 'For Lawyers',
    tagline: 'Move faster without compromising quality.',
    metric: '40hrs',
    metricLabel: 'Saved Per Month',
    features: [
      'AI entity extraction',
      'Auto drafting',
      'Contract lifecycle mgmt',
      'Lawyer-client loop',
      'File and Document Management',
      'Timeline and Chronology Creation',
      'Legal research',
    ],
  },
  {
    id: 'companies',
    label: 'Companies',
    icon: Briefcase,
    title: 'For Companies',
    tagline: 'Legal risk to business intelligence.',
    metric: '67%',
    metricLabel: 'Cost Reduction',
    features: [
      'Compliance visibility',
      'Smart docs',
      'Risk detection',
      'Contract analysis',
    ],
  },
];

export function IndustrySolutions() {
  const [activeTab, setActiveTab] = useState<Industry>('courts');
  const activeIndustry = industryData.find((d) => d.id === activeTab)!;
  const IconComponent = activeIndustry.icon;

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
            Industry Solutions
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
          Tailored for Your Industry
        </h2>

        {/* Subheadline */}
        <p
          className="text-center mb-10 max-w-2xl mx-auto"
          style={{
            fontSize: '18px',
            color: '#64748B',
            lineHeight: '1.6',
          }}
        >
          One platform, infinite possibilities across Healthcare, Legal, and Retail
        </p>

        {/* Tab Buttons */}
        <div className="flex justify-center gap-2 mb-8">
          {industryData.map((industry) => {
            const TabIcon = industry.icon;
            const isActive = activeTab === industry.id;
            return (
              <button
                key={industry.id}
                onClick={() => setActiveTab(industry.id)}
                className="flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-200"
                style={{
                  backgroundColor: isActive ? '#1B365D' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#1B365D',
                  border: isActive ? 'none' : '1px solid rgba(27, 54, 93, 0.2)',
                  fontWeight: 500,
                  fontSize: '14px',
                }}
              >
                <TabIcon size={18} />
                {industry.label}
              </button>
            );
          })}
        </div>

        {/* Content Card */}
        <Card
          className="max-w-3xl mx-auto overflow-hidden"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid rgba(27, 54, 93, 0.08)',
          }}
        >
          <CardContent className="p-8 md:p-10">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left Side - Title, Tagline, Metric */}
              <div className="md:w-1/2">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: '#EAF1FF' }}
                >
                  <IconComponent size={24} style={{ color: '#1B365D' }} />
                </div>

                <h3
                  style={{
                    fontSize: '24px',
                    fontWeight: 600,
                    color: '#1B365D',
                    marginBottom: '8px',
                  }}
                >
                  {activeIndustry.title}
                </h3>

                <p
                  style={{
                    fontSize: '16px',
                    color: '#64748B',
                    marginBottom: '24px',
                  }}
                >
                  {activeIndustry.tagline}
                </p>

                {/* Metric */}
                <div>
                  <span
                    style={{
                      fontSize: '48px',
                      fontWeight: 700,
                      color: '#BF9874',
                      lineHeight: '1',
                    }}
                  >
                    {activeIndustry.metric}
                  </span>
                  <p
                    style={{
                      fontSize: '14px',
                      color: '#64748B',
                      marginTop: '4px',
                    }}
                  >
                    {activeIndustry.metricLabel}
                  </p>
                </div>
              </div>

              {/* Right Side - Features */}
              <div className="md:w-1/2">
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1B365D',
                    marginBottom: '16px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Key Features
                </p>

                <ul className="space-y-3">
                  {activeIndustry.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: '#E8F5E9' }}
                      >
                        <Check size={12} style={{ color: '#22C55E' }} />
                      </div>
                      <span style={{ fontSize: '15px', color: '#334155' }}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
