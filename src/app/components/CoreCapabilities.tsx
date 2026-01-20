import { FileText, Search, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function CoreCapabilities() {
  const capabilities = [
    {
      icon: Globe,
      title: 'Vernacular Support',
      description: 'Read & understand 10+ Indian court languages with native accuracy',
    },
    {
      icon: FileText,
      title: 'Digital Twin Documents',
      description: 'Transform images into AI-readable, structured, searchable documents',
    },
    {
      icon: Search,
      title: 'Research Assistant',
      description: '1TB+ knowledge base of citations, laws, precedents, and legal analysis',
    },
  ];

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
            Core Capabilities
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
          Three Powerful Ways to Work Smarter
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
          Everything you need to transform your operations with AI
        </p>

        {/* Capability Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {capabilities.map((capability, index) => {
            const IconComponent = capability.icon;
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
                <CardHeader className="pb-2">
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: '#EAF1FF' }}
                  >
                    <IconComponent size={24} style={{ color: '#1B365D' }} />
                  </div>
                  <CardTitle
                    style={{
                      fontSize: '20px',
                      fontWeight: 600,
                      color: '#1B365D',
                      lineHeight: '1.3',
                    }}
                  >
                    {capability.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription
                    style={{
                      fontSize: '16px',
                      color: '#64748B',
                      lineHeight: '1.6',
                    }}
                  >
                    {capability.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
