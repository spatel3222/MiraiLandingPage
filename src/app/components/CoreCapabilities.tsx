import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function CoreCapabilities() {
  const capabilities = [
    {
      title: 'Vernacular Support',
      description: 'Read & understand 10 Indian court languages'
    },
    {
      title: 'Digital Twin',
      description: 'Image to AI-readable, structured, searchable documents'
    },
    {
      title: 'Research Assistant',
      description: '1TB+ knowledge base of citations, laws, and analysis'
    },
    {
      title: 'Document Management',
      description: 'AI-powered tabular view with auto-tagging'
    }
  ];

  return (
    <section className="py-16 md:py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="mb-12 md:mb-16 text-center" style={{ 
          fontSize: 'clamp(32px, 6vw, 40px)', 
          fontWeight: 600,
          color: '#1B365D',
          lineHeight: '1.2'
        }}>
          Core Capabilities
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {capabilities.map((capability, index) => (
            <Card
              key={index}
              className="transition-transform duration-200 hover:-translate-y-1"
              style={{
                backgroundColor: '#EEF2FF',
                borderColor: 'rgba(27, 54, 93, 0.05)'
              }}
            >
              <CardHeader>
                <CardTitle style={{ 
                  fontSize: 'clamp(18px, 3.5vw, 20px)',
                  fontWeight: 600,
                  color: '#1B365D',
                  lineHeight: '1.3'
                }}>
                  {capability.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription style={{ 
                  fontSize: 'clamp(14px, 3vw, 16px)',
                  color: '#405A7A',
                  lineHeight: '1.6'
                }}>
                  {capability.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}