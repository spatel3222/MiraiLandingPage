export function CompanyStatus() {
  return (
    <section className="py-16 md:py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="mb-6 md:mb-8" style={{ 
          fontSize: 'clamp(32px, 6vw, 40px)', 
          fontWeight: 600,
          color: '#1B365D',
          lineHeight: '1.2'
        }}>
          Company Status
        </h2>

        <p className="mb-8 md:mb-12 px-4" style={{ 
          fontSize: 'clamp(16px, 3.5vw, 18px)',
          color: '#405A7A',
          lineHeight: '1.6'
        }}>
          Mirai360 is an early-stage, bootstrapped deeptech startup currently operating in private pilots with India's top law firms. Public product details will be released post-beta.
        </p>

        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          <div className="text-center">
            <div style={{ 
              fontSize: 'clamp(36px, 8vw, 48px)',
              fontWeight: 700,
              color: '#22C55E',
              lineHeight: '1.1'
            }}>
              2
            </div>
            <p style={{ 
              fontSize: 'clamp(14px, 3vw, 16px)',
              color: '#6B7280',
              marginTop: '8px'
            }}>
              Pilots Done
            </p>
          </div>
          <div className="text-center">
            <div style={{ 
              fontSize: 'clamp(36px, 8vw, 48px)',
              fontWeight: 700,
              color: '#22C55E',
              lineHeight: '1.1'
            }}>
              ✓
            </div>
            <p style={{ 
              fontSize: 'clamp(14px, 3vw, 16px)',
              color: '#6B7280',
              marginTop: '8px'
            }}>
              Product-Market Fit Validated
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}