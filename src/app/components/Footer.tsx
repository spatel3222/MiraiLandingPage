import { Button } from './ui/button';
import { Separator } from './ui/separator';

export function Footer() {
  return (
    <footer className="py-8 md:py-10 px-6" style={{ backgroundColor: '#1B365D' }}>
      <div className="max-w-4xl mx-auto text-center">
        {/* Contact */}
        <div className="mb-4">
          <p className="mb-4 px-4" style={{ 
            fontSize: 'clamp(16px, 3.5vw, 18px)',
            color: '#ffffff',
            lineHeight: '1.6'
          }}>
            For partnerships, pilots, or platform access, please reach out via email.
          </p>
          <Button 
            asChild
            variant="link"
            size="lg"
            style={{ 
              fontSize: 'clamp(18px, 4vw, 20px)',
              fontWeight: 600,
              color: '#2E86C1',
              textDecoration: 'none'
            }}
            className="hover:underline"
            onMouseEnter={(e) => e.currentTarget.style.color = '#60A5FA'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#2E86C1'}
          >
            <a href="mailto:shivang@mirai360.ai">
              shivang@mirai360.ai
            </a>
          </Button>
        </div>

        {/* Divider */}
        <Separator className="my-4" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)'
        }} />

        {/* Footer tagline */}
        <p className="mb-4" style={{ 
          fontSize: 'clamp(20px, 4vw, 24px)',
          fontWeight: 300,
          color: '#ffffff',
          lineHeight: '1.4'
        }}>
          Mirai | 未来 | Future
        </p>

        {/* Copyright */}
        <p style={{ 
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.6)',
          lineHeight: '1.6'
        }}>
          © 2025 Mirai360. All rights reserved. | Built in India 🇮🇳
        </p>
      </div>
    </footer>
  );
}