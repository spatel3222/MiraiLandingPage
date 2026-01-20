import { Shield, Lock, Eye, Server, FileCheck, Users } from 'lucide-react';
import { Card, CardContent } from './ui/card';

const complianceBadges = [
  { name: 'SOC 2 Type II', description: 'Certified' },
  { name: 'ISO 27001', description: 'Compliant' },
  { name: 'GDPR', description: 'Ready' },
  { name: 'HIPAA', description: 'Compliant' },
];

const securityFeatures = [
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    description: 'All data encrypted at rest and in transit using AES-256',
  },
  {
    icon: Eye,
    title: 'Access Controls',
    description: 'Role-based permissions with detailed audit logging',
  },
  {
    icon: Server,
    title: 'Data Residency',
    description: 'Choose where your data is stored and processed',
  },
  {
    icon: FileCheck,
    title: 'Compliance Ready',
    description: 'Built to meet legal industry regulatory requirements',
  },
  {
    icon: Users,
    title: 'SSO Integration',
    description: 'Enterprise single sign-on with SAML 2.0 support',
  },
  {
    icon: Shield,
    title: 'Secure Infrastructure',
    description: 'Hosted on enterprise-grade cloud with 99.9% uptime',
  },
];

export function SecuritySection() {
  return (
    <section
      id="security"
      className="py-16 md:py-24 px-6"
      style={{ backgroundColor: '#0E1B33' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Label */}
        <div className="text-center mb-4">
          <span
            className="inline-block px-3 py-1 rounded-full text-sm font-medium"
            style={{
              backgroundColor: 'rgba(191, 152, 116, 0.2)',
              color: '#BF9874',
            }}
          >
            Security & Compliance
          </span>
        </div>

        {/* Headline */}
        <h2
          className="text-center mb-4"
          style={{
            fontSize: 'clamp(28px, 5vw, 40px)',
            fontWeight: 600,
            color: '#FFFFFF',
            lineHeight: '1.2',
          }}
        >
          Enterprise-Grade Security You Can Trust
        </h2>

        {/* Subheadline */}
        <p
          className="text-center mb-12 max-w-2xl mx-auto"
          style={{
            fontSize: '18px',
            color: '#94A3B8',
            lineHeight: '1.6',
          }}
        >
          Built with security-first architecture to protect your most sensitive legal data
        </p>

        {/* Compliance Badges */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {complianceBadges.map((badge, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-4 py-2 rounded-lg"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Shield size={18} style={{ color: '#22C55E' }} />
              <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 500 }}>
                {badge.name}
              </span>
              <span style={{ color: '#64748B', fontSize: '12px' }}>{badge.description}</span>
            </div>
          ))}
        </div>

        {/* Security Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card
                key={index}
                className="transition-all duration-200 hover:-translate-y-1"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                }}
              >
                <CardContent className="p-6">
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: 'rgba(191, 152, 116, 0.2)' }}
                  >
                    <IconComponent size={20} style={{ color: '#BF9874' }} />
                  </div>

                  {/* Title */}
                  <h3
                    className="mb-2"
                    style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#FFFFFF',
                    }}
                  >
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: '14px',
                      color: '#94A3B8',
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
