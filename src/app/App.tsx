import { Hero } from './components/Hero';
import { WhoItsFor } from './components/WhoItsFor';
import { CoreCapabilities } from './components/CoreCapabilities';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Hero />
      <WhoItsFor />
      <CoreCapabilities />
      <Footer />
    </div>
  );
}