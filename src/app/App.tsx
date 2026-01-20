import { NavBar } from './components/NavBar';
import { Hero } from './components/Hero';
import { VisionSection } from './components/VisionSection';
import { WhoItsFor } from './components/WhoItsFor';
import { CoreCapabilities } from './components/CoreCapabilities';
import { IndustrySolutions } from './components/IndustrySolutions';
import { FeaturesSection } from './components/FeaturesSection';
import { ROIMetrics } from './components/ROIMetrics';
import { Testimonials } from './components/Testimonials';
import { SecuritySection } from './components/SecuritySection';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <NavBar />
      {/* Spacer for fixed navbar */}
      <div style={{ height: '72px' }} />
      <Hero />
      <VisionSection />
      <section id="solutions">
        <IndustrySolutions />
      </section>
      <section id="capabilities">
        <CoreCapabilities />
      </section>
      <FeaturesSection />
      <ROIMetrics />
      <Testimonials />
      <SecuritySection />
      <CTASection />
      <Footer />
    </div>
  );
}