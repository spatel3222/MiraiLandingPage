import { ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

export function CTASection() {
  return (
    <section
      className="py-16 md:py-24 px-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1B365D 0%, #0E1B33 100%)',
      }}
    >
      {/* Decorative Elements */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, #BF9874 0%, transparent 70%)',
          transform: 'translate(30%, -30%)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, #BF9874 0%, transparent 70%)',
          transform: 'translate(-30%, 30%)',
        }}
      />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Headline */}
        <h2
          className="mb-4"
          style={{
            fontSize: 'clamp(28px, 5vw, 44px)',
            fontWeight: 600,
            color: '#FFFFFF',
            lineHeight: '1.2',
          }}
        >
          Ready to Scale AI Across Your Organization?
        </h2>

        {/* Subheadline */}
        <p
          className="mb-8 max-w-2xl mx-auto"
          style={{
            fontSize: '18px',
            color: '#C5D3E3',
            lineHeight: '1.6',
          }}
        >
          Join 500+ enterprises transforming their legal workflows with Mirai360's intelligent
          automation platform.
        </p>

        {/* CTA Button */}
        <Button
          size="lg"
          className="px-8 py-4 h-auto text-lg font-semibold rounded-lg transition-all duration-200"
          style={{
            backgroundColor: '#BF9874',
            color: '#FFFFFF',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#D4BAA2';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#BF9874';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Request a Demo
          <ArrowRight className="ml-2" size={20} />
        </Button>

        {/* Trust Note */}
        <p
          className="mt-6"
          style={{
            fontSize: '14px',
            color: '#94A3B8',
          }}
        >
          No credit card required • Free consultation • Setup in minutes
        </p>
      </div>
    </section>
  );
}
