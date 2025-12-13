import { Hero } from './components/Hero';
import { CoreCapabilities } from './components/CoreCapabilities';
import { WhoItsFor } from './components/WhoItsFor';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Hero />
      <CoreCapabilities />
      <WhoItsFor />
      <Footer />
    </div>
  );
}