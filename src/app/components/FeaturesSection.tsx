import { FolderOpen, Clock, BookOpen } from 'lucide-react';
import { Card, CardContent } from './ui/card';

const features = [
  {
    icon: FolderOpen,
    title: 'Case Files and Document Management',
    description:
      'All case-related documents in one place — scanned, structured, and ready for legal work.',
  },
  {
    icon: Clock,
    title: 'Timeline and Chronology',
    description:
      'Automatically generated timelines that stay accurate, readable, and aligned with your case.',
  },
  {
    icon: BookOpen,
    title: 'Legal Research',
    description:
      'Research grounded in your case, powered by authoritative sources, and tailored to how you work.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 px-6" style={{ backgroundColor: '#FFFFFF' }}>
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
            The Future of Legal AI
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
          What Mirai360 Delivers
        </h2>

        {/* Tagline */}
        <p
          className="text-center mb-2"
          style={{
            fontSize: '18px',
            color: '#64748B',
            lineHeight: '1.6',
          }}
        >
          Draft, review, and research legal documents with confidence.
        </p>

        {/* Subheadline */}
        <p
          className="text-center mb-12 max-w-2xl mx-auto"
          style={{
            fontSize: '16px',
            color: '#94A3B8',
            lineHeight: '1.6',
          }}
        >
          Powerful tools built for document-heavy professional work
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card
                key={index}
                className="transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                style={{
                  backgroundColor: '#F8FAFC',
                  borderColor: 'rgba(27, 54, 93, 0.08)',
                  borderRadius: '12px',
                }}
              >
                <CardContent className="p-6">
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: '#EAF1FF' }}
                  >
                    <IconComponent size={24} style={{ color: '#1B365D' }} />
                  </div>

                  {/* Title */}
                  <h3
                    className="mb-3"
                    style={{
                      fontSize: '20px',
                      fontWeight: 600,
                      color: '#1B365D',
                      lineHeight: '1.3',
                    }}
                  >
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: '15px',
                      color: '#64748B',
                      lineHeight: '1.6',
                    }}
                  >
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
