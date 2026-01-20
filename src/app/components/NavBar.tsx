import { Button } from './ui/button';

const navLinks = [
  { label: 'Solutions', href: '#solutions' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Customers', href: '#customers' },
  { label: 'Security', href: '#security' },
];

export function NavBar() {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'linear-gradient(to right, #0E1B33, #1B365D)',
        boxShadow: '0 2px 8px rgba(27, 54, 93, 0.15)',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center"
          >
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

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className="transition-colors"
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#C5D3E3',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#C5D3E3';
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            {/* Sign In - Ghost */}
            <Button
              variant="ghost"
              className="hidden sm:inline-flex"
              style={{
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Sign In
            </Button>

            {/* Book a Demo - Primary */}
            <Button
              className="px-4 py-2 h-auto"
              style={{
                backgroundColor: '#BF9874',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '8px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#D4BAA2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#BF9874';
              }}
            >
              Book a Demo
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
