const footerLinks = {
  Product: [
    { label: 'Features', href: '#capabilities' },
    { label: 'Solutions', href: '#solutions' },
    { label: 'Pricing', href: '#' },
    { label: 'Security', href: '#security' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Case Studies', href: '#' },
  ],
  Company: [
    { label: 'About Us', href: '#about' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Press', href: '#' },
  ],
};

export function Footer() {
  return (
    <footer className="py-12 md:py-16 px-6" style={{ backgroundColor: '#0E1B33' }}>
      <div className="max-w-6xl mx-auto">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo & Tagline */}
          <div className="md:col-span-1">
            <a href="#" className="inline-block mb-4">
              <span
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: '-0.025em',
                }}
              >
                mirai<span style={{ fontWeight: 400 }}>360</span>
              </span>
            </a>
            <p
              style={{
                fontSize: '14px',
                color: '#94A3B8',
                lineHeight: '1.6',
                marginBottom: '16px',
              }}
            >
              360° Legal Intelligence Platform
            </p>
            <p
              style={{
                fontSize: '20px',
                fontWeight: 300,
                color: '#C5D3E3',
              }}
            >
              Mirai | 未来 | Future
            </p>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4
                className="mb-4"
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="transition-colors duration-200"
                      style={{
                        fontSize: '14px',
                        color: '#94A3B8',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#FFFFFF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#94A3B8';
                      }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div
          style={{
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            marginBottom: '24px',
          }}
        />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <p
            style={{
              fontSize: '14px',
              color: '#64748B',
            }}
          >
            © 2025 Mirai360. All rights reserved.
          </p>

          {/* Legal Links */}
          <div className="flex gap-6">
            <a
              href="#"
              className="transition-colors duration-200"
              style={{ fontSize: '14px', color: '#64748B' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#64748B';
              }}
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="transition-colors duration-200"
              style={{ fontSize: '14px', color: '#64748B' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#64748B';
              }}
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="transition-colors duration-200"
              style={{ fontSize: '14px', color: '#64748B' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#64748B';
              }}
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
