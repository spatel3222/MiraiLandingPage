import { Shield, ArrowRight, Building2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

// Placeholder brand icons for logo strip
const brandLogos = [
  { name: 'Slack', icon: '◼' },
  { name: 'Zoom', icon: '◼' },
  { name: 'GitHub', icon: '◼' },
  { name: 'PayPal', icon: '◼' },
  { name: 'Netflix', icon: '◼' },
  { name: 'Spotify', icon: '◼' },
  { name: 'Notion', icon: '◼' },
  { name: 'Dropbox', icon: '◼' },
  { name: 'Webflow', icon: '◼' },
  { name: 'Discord', icon: '◼' },
];

export function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0e1b33 11%, #1b365d 48%, #0e1b33 79%)',
      }}
    >
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Decorative ellipse - matching Figma */}
      <div
        className="absolute -top-32 -right-64 w-[800px] h-[600px] rounded-full opacity-80"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(217,217,217,0.15) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute -bottom-32 -left-64 w-[600px] h-[400px] rounded-full opacity-80"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(217,217,217,0.1) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 pt-16 md:pt-24 pb-12 md:pb-16">
        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <Badge
            variant="outline"
            className="gap-2 py-2 px-4 rounded-full"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            <Building2 size={14} style={{ color: '#BF9874' }} />
            Trusted by Enterprise
          </Badge>
          <Badge
            variant="outline"
            className="gap-2 py-2 px-4 rounded-full"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            <Shield size={14} style={{ color: '#22C55E' }} />
            SOC 2 Certified
          </Badge>
        </div>

        {/* Main Headline */}
        <div className="text-center mb-6">
          <h1
            className="mb-2"
            style={{
              fontSize: 'clamp(40px, 8vw, 64px)',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '-0.025em',
              lineHeight: '1.1'
            }}
          >
            360° Legal Intelligence Platform
          </h1>
        </div>

        {/* Subheadline */}
        <p
          className="text-center mb-4"
          style={{
            fontSize: 'clamp(20px, 4vw, 28px)',
            color: '#BF9874',
            fontWeight: 600,
            lineHeight: '1.3'
          }}
        >
          Agentic OS for Legal System
        </p>

        {/* Description */}
        <p
          className="text-center max-w-2xl mx-auto mb-8 px-4"
          style={{
            fontSize: 'clamp(16px, 3vw, 18px)',
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: '1.6'
          }}
        >
          Enterprise-ready AI solutions that connects lawyers, courts, and companies
        </p>

        {/* CTA Button */}
        <div className="flex justify-center mb-16">
          <Button
            className="gap-2 px-6 py-3 h-auto text-base font-semibold"
            style={{
              backgroundColor: '#BF9874',
              color: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(191, 152, 116, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#D4BAA2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#BF9874';
            }}
          >
            Request a Demo
            <ArrowRight size={18} />
          </Button>
        </div>

        {/* Logo Strip */}
        <div className="border-t pt-10" style={{ borderColor: 'rgba(255, 255, 255, 0.15)' }}>
          {/* Label */}
          <p
            className="text-center mb-6"
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              fontWeight: 500,
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}
          >
            Trusted Globally
          </p>

          {/* Brand Logos */}
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-50">
            {brandLogos.map((brand) => (
              <div
                key={brand.name}
                className="flex items-center gap-2"
                style={{ color: 'rgba(255, 255, 255, 0.7)' }}
              >
                <span style={{ fontSize: '24px' }}>{brand.icon}</span>
                <span style={{ fontSize: '14px', fontWeight: 500 }}>{brand.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
