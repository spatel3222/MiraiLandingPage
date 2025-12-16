export function WhatWereBuilding() {
  return (
    <section className="py-16 md:py-24 px-6" style={{ backgroundColor: '#FAFBFC' }}>
      <div className="max-w-4xl mx-auto">
        <h2 className="mb-6 md:mb-8" style={{ 
          fontSize: 'clamp(32px, 6vw, 40px)', 
          fontWeight: 600,
          color: '#1B365D',
          lineHeight: '1.2'
        }}>
          What is Mirai360?
        </h2>

        {/* Description */}
        <p style={{ 
          fontSize: 'clamp(16px, 3vw, 18px)',
          color: '#405A7A',
          lineHeight: '1.6',
          textAlign: 'left'
        }}>
          Mirai360 is building the intelligence layer for India's legal ecosystem. The infrastructure exists — 311 Cr pages digitized, courts online, lawyers connected — but the intelligence layer is missing. We're building India's Agentic Legal Operating System that unifies Courts, Lawyers, and Companies through AI.
        </p>
      </div>
    </section>
  );
}