import { Quote } from 'lucide-react';
import { Card, CardContent } from './ui/card';

const testimonials = [
  {
    industry: 'Healthcare',
    quote:
      'Mirai360 transformed our claims processing workflow. What used to take days now happens in hours with unprecedented accuracy.',
    author: 'X',
    title: 'Chief Operations Officer',
    company: 'Healthcare Provider',
  },
  {
    industry: 'Legal',
    quote:
      'The legal research capabilities are remarkable. Our attorneys save 40+ hours monthly on document review and case preparation.',
    author: 'X',
    title: 'Managing Partner',
    company: 'Law Firm',
  },
  {
    industry: 'Retail',
    quote:
      'Contract analysis that used to require a full legal team now runs automatically. The cost savings have been transformative.',
    author: 'X',
    title: 'General Counsel',
    company: 'Retail Corporation',
  },
];

export function Testimonials() {
  return (
    <section
      id="customers"
      className="py-16 md:py-24 px-6"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Label */}
        <div className="text-center mb-4">
          <span
            className="inline-block px-3 py-1 rounded-full text-sm font-medium"
            style={{
              backgroundColor: '#EAF1FF',
              color: '#1B365D',
            }}
          >
            Customer Testimonials
          </span>
        </div>

        {/* Headline */}
        <h2
          className="text-center mb-12"
          style={{
            fontSize: 'clamp(28px, 5vw, 40px)',
            fontWeight: 600,
            color: '#1B365D',
            lineHeight: '1.2',
          }}
        >
          Trusted by Industry Leaders
        </h2>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              style={{
                backgroundColor: '#F8FAFC',
                borderColor: 'rgba(27, 54, 93, 0.08)',
                borderRadius: '12px',
              }}
            >
              <CardContent className="p-6">
                {/* Quote Icon */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: '#EAF1FF' }}
                >
                  <Quote size={20} style={{ color: '#1B365D' }} />
                </div>

                {/* Industry Badge */}
                <span
                  className="inline-block px-2 py-1 rounded text-xs font-medium mb-4"
                  style={{
                    backgroundColor: '#BF9874',
                    color: '#FFFFFF',
                  }}
                >
                  {testimonial.industry}
                </span>

                {/* Quote Text */}
                <p
                  className="mb-6"
                  style={{
                    fontSize: '15px',
                    color: '#334155',
                    lineHeight: '1.7',
                    fontStyle: 'italic',
                  }}
                >
                  "{testimonial.quote}"
                </p>

                {/* Author Info */}
                <div>
                  <p
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#1B365D',
                    }}
                  >
                    {testimonial.author}
                  </p>
                  <p
                    style={{
                      fontSize: '14px',
                      color: '#64748B',
                    }}
                  >
                    {testimonial.title}
                  </p>
                  <p
                    style={{
                      fontSize: '13px',
                      color: '#94A3B8',
                    }}
                  >
                    {testimonial.company}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
