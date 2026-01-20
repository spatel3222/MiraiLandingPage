export function VisionSection() {
  return (
    <section id="about" className="py-16 md:py-24" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="max-w-4xl mx-auto px-6">
        {/* Section Label */}
        <div className="mb-8">
          <span
            className="inline-block px-3 py-1 rounded-full text-sm font-medium"
            style={{
              backgroundColor: '#EAF1FF',
              color: '#1B365D',
            }}
          >
            About Us
          </span>
        </div>

        {/* Intro Text */}
        <p
          className="mb-12"
          style={{
            fontSize: '20px',
            color: '#334155',
            lineHeight: '1.7',
          }}
        >
          Mirai360 builds the intelligence layer for the legal system, helping legal professionals
          turn documents, cases, and expertise into reusable knowledge — without compromising trust
          or confidentiality.
        </p>

        {/* Vision Subsection */}
        <div className="mb-12">
          <h3
            className="mb-6"
            style={{
              fontSize: '24px',
              fontWeight: 600,
              color: '#1B365D',
            }}
          >
            Vision
          </h3>

          <div className="space-y-4">
            <p style={{ fontSize: '16px', color: '#64748B', lineHeight: '1.7' }}>
              Mirai is built to support legal expertise, not replace it. By organizing legal
              information and turning expert judgment into reusable intelligence, we help legal
              professionals work with more clarity and control.
            </p>

            <p style={{ fontSize: '16px', color: '#64748B', lineHeight: '1.7' }}>
              We take care of the repetitive, mechanical work so lawyers, courts, and organizations
              can focus on judgment, reasoning, and meaningful outcomes.
            </p>

            <p style={{ fontSize: '16px', color: '#64748B', lineHeight: '1.7' }}>
              Everything we build is guided by trust, legal-grade quality, and system-level
              thinking—protecting data, meeting real professional standards, and scaling responsibly
              across the legal system.
            </p>
          </div>
        </div>

        {/* Our Approach Subsection */}
        <div>
          <h3
            className="mb-6"
            style={{
              fontSize: '24px',
              fontWeight: 600,
              color: '#1B365D',
            }}
          >
            Our Approach
          </h3>

          <div className="space-y-4">
            <p style={{ fontSize: '16px', color: '#64748B', lineHeight: '1.7' }}>
              Mirai360 is designed around real-world workflows — not generic automation.
            </p>

            <p style={{ fontSize: '16px', color: '#64748B', lineHeight: '1.7' }}>
              We start by understanding how professionals research, review, and make decisions.
              From there, we build AI that integrates seamlessly into existing processes, enhancing
              speed and accuracy without disrupting judgment.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
