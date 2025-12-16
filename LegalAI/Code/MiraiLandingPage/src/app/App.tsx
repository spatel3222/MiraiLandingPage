import { Hero } from './components/Hero';
import { WaitlistForm } from './components/WaitlistForm';
import { Footer } from './components/Footer';
import { GradientLines } from './components/GradientLines';

export default function App() {
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        background: 'linear-gradient(180deg, var(--background-gradient-start) 0%, var(--background-gradient-mid) 50%, var(--background-gradient-end) 100%)'
      }}
    >
      {/* Animated gradient lines background */}
      <GradientLines />

      {/* Ambient glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-15"
          style={{ background: 'var(--glow-purple)' }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15"
          style={{ background: 'var(--glow-blue)' }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <Hero />
        <WaitlistForm />
        <Footer />
      </div>
    </div>
  );
}
