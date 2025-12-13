import { Lock } from 'lucide-react';
import { Badge } from './ui/badge';

export function Hero() {
  return (
    <section className="relative">
      {/* Blue accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: '#2563EB' }} />
      
      <div className="max-w-4xl mx-auto px-6 pt-12 md:pt-16 pb-12 md:pb-16 text-center">
        {/* Logo */}
        <div className="mb-6 md:mb-8">
          <h1 className="inline-block" style={{ 
            fontSize: 'clamp(32px, 8vw, 48px)', 
            fontWeight: 700,
            color: '#1B365D',
            letterSpacing: '-0.025em',
            lineHeight: '1.1'
          }}>
            mirai<span style={{ fontWeight: 400 }}>360</span>
            <span style={{ 
              fontWeight: 500, 
              color: '#2E86C1' 
            }}>.ai</span>
          </h1>
        </div>

        {/* Headline */}
        <h2 className="mb-4" style={{ 
          fontSize: 'clamp(36px, 10vw, 56px)', 
          fontWeight: 700,
          color: '#1B365D',
          letterSpacing: '-0.025em',
          lineHeight: '1.1'
        }}>
          Legal Intelligence
        </h2>

        {/* Sub-headline */}
        <p className="mb-6 md:mb-8 px-4" style={{ 
          fontSize: 'clamp(18px, 4vw, 24px)',
          color: '#405A7A',
          lineHeight: '1.3'
        }}>
          Agentic Operating System for legal ecosystem
        </p>

        {/* Stealth badge */}
        <Badge
          variant="outline"
          className="gap-2 py-2 px-4 rounded-full"
          style={{
            backgroundColor: '#FAFBFC',
            borderColor: 'rgba(27, 54, 93, 0.1)',
            color: '#405A7A',
            fontSize: '14px'
          }}
        >
          <Lock size={14} />
          Currently operating in stealth mode
        </Badge>
      </div>
    </section>
  );
}