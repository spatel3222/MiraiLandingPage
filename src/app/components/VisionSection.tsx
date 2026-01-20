export function VisionSection() {
  return (
    <section
      id="about"
      style={{
        backgroundColor: '#F9F5F1',
        padding: '120px',
      }}
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Header Section - Centered */}
        <div className="text-center mb-12" style={{ gap: '16px' }}>
          {/* About Us Title */}
          <h2
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '48px',
              fontWeight: 700,
              color: '#12242E',
              letterSpacing: '-0.96px',
              lineHeight: '57.6px',
              marginBottom: '16px',
            }}
          >
            About Us
          </h2>

          {/* Intro Paragraph */}
          <p
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '20px',
              fontWeight: 500,
              color: '#6B7280',
              lineHeight: '34px',
              letterSpacing: '-0.2px',
              maxWidth: '1200px',
              margin: '0 auto',
            }}
          >
            Mirai360 builds the intelligence layer for the legal system, helping legal professionals
            turn documents, cases, and expertise into reusable knowledge — without compromising trust
            or confidentiality.
          </p>
        </div>

        {/* Two-Column Layout: Image + Vision Text */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '582px 1fr',
            gap: '20px',
            alignItems: 'start',
          }}
        >
          {/* Left Column - Image */}
          <div
            style={{
              padding: '8px',
              borderRadius: '16px',
              boxShadow:
                '0px 4px 6px -4px rgba(27, 54, 93, 0.10), 0px 10px 15px -3px rgba(27, 54, 93, 0.10)',
            }}
          >
            <img
              src="/images/lady-justice.png"
              alt="Lady Justice statue representing legal expertise"
              width={566}
              height={320}
              style={{
                borderRadius: '16px',
                objectFit: 'cover',
                width: '100%',
                height: 'auto',
              }}
            />
          </div>

          {/* Right Column - Vision Text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Vision Heading */}
            <h3
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '30px',
                fontWeight: 700,
                color: '#BF9874',
                lineHeight: '36px',
              }}
            >
              Vision
            </h3>

            {/* Vision Body Text */}
            <div
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '18px',
                fontWeight: 500,
                color: '#566573',
                lineHeight: '28px',
              }}
            >
              <p style={{ marginBottom: '28px' }}>
                Mirai is built to support legal expertise, not replace it. By organizing legal
                information and turning expert judgment into reusable intelligence, we help legal
                professionals work with more clarity and control.
              </p>

              <p style={{ marginBottom: '28px' }}>
                We take care of the repetitive, mechanical work so lawyers, courts, and organizations
                can focus on judgment, reasoning, and meaningful outcomes.
              </p>

              <p>
                Everything we build is guided by trust, legal-grade quality, and system-level
                thinking—protecting data, meeting real professional standards, and scaling responsibly
                across the legal system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
