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
    <section className="py-10 md:py-14 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="mb-6 md:mb-8 text-center" style={{ 
          fontSize: 'clamp(32px, 6vw, 40px)', 
          fontWeight: 600,
          color: '#1B365D',
          lineHeight: '1.2'
        }}>
          Core Capabilities
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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