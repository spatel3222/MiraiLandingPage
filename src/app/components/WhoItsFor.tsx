import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export function WhoItsFor() {
  const phases = [
    {
      title: 'Law Firms',
      phase: 'Phase 1',
      timeline: 'Now',
      status: 'active'
    },
    {
      title: 'Courts',
      phase: 'Phase 2',
      timeline: '6-8 months',
      status: 'upcoming'
    },
    {
      title: 'Companies',
      phase: 'Phase 3',
      timeline: '8-12 months',
      status: 'upcoming'
    }
  ];

  return (
    <section className="py-10 md:py-14 px-6" style={{ backgroundColor: '#FAFBFC' }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="mb-6 md:mb-8 text-center" style={{ 
          fontSize: 'clamp(32px, 6vw, 40px)', 
          fontWeight: 600,
          color: '#1B365D',
          lineHeight: '1.2'
        }}>
          Who It's For
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {phases.map((phase, index) => (
            <Card
              key={index}
              style={{
                backgroundColor: '#ffffff',
                borderColor: phase.status === 'active' ? '#22C55E' : 'rgba(27, 54, 93, 0.1)',
                borderWidth: phase.status === 'active' ? '2px' : '1px'
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle style={{ 
                  fontSize: 'clamp(20px, 4vw, 24px)',
                  fontWeight: 600,
                  color: '#1B365D',
                  lineHeight: '1.3'
                }}>
                  {phase.title}
                </CardTitle>
                {phase.status === 'active' && (
                  <Badge 
                    variant="default"
                    style={{
                      backgroundColor: '#22C55E',
                      color: 'white',
                      borderColor: 'transparent'
                    }}
                  >
                    Active
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <CardDescription style={{ 
                  fontSize: 'clamp(14px, 3vw, 16px)',
                  color: '#405A7A',
                  lineHeight: '1.6'
                }}>
                  {phase.timeline}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pilot info */}
        <Card style={{
          backgroundColor: '#EEF2FF',
          borderColor: 'rgba(37, 99, 235, 0.1)'
        }}>
          <CardContent className="text-center py-6">
            <p style={{ 
              fontSize: 'clamp(14px, 3vw, 16px)',
              color: '#1B365D',
              lineHeight: '1.6'
            }}>
              Pilot engagements currently underway. Product-market fit validated.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}