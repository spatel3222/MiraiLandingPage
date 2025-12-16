import { motion } from 'motion/react';
import { Lock, CheckCircle } from 'lucide-react';
import { Badge } from './ui/badge';

// Framer Motion animation variants
const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0, 0, 0.2, 1] as const }
  })
};

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center">
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-8 text-center relative z-10">
        {/* Logo */}
        <motion.div
          className="mb-8"
          initial="hidden"
          animate="visible"
          variants={variants}
          custom={0}
        >
          <h1
            className="inline-block"
            style={{
              fontSize: 'clamp(40px, 10vw, 64px)',
              fontWeight: 700,
              color: 'var(--foreground)',
              letterSpacing: '-0.025em',
              lineHeight: '1.1'
            }}
          >
            mirai
            <span style={{ fontWeight: 400 }}>360</span>
            <span
              style={{
                fontWeight: 500,
                color: 'var(--tech-accent)',
                textShadow: '0 0 30px var(--tech-accent-glow)'
              }}
            >
              °
            </span>
          </h1>
        </motion.div>

        {/* Headline */}
        <motion.h2
          className="mb-4"
          initial="hidden"
          animate="visible"
          variants={variants}
          custom={0.15}
          style={{
            fontSize: 'clamp(32px, 8vw, 56px)',
            fontWeight: 700,
            color: 'var(--foreground)',
            letterSpacing: '-0.025em',
            lineHeight: '1.1'
          }}
        >
          Legal Intelligence
        </motion.h2>

        {/* Tagline */}
        <motion.p
          className="mb-8 px-4"
          initial="hidden"
          animate="visible"
          variants={variants}
          custom={0.3}
          style={{
            fontSize: 'clamp(18px, 4vw, 24px)',
            color: 'var(--professional-gray)',
            lineHeight: '1.4'
          }}
        >
          Agentic Operating System for legal ecosystem
        </motion.p>

        {/* Badges */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3"
          initial="hidden"
          animate="visible"
          variants={variants}
          custom={0.45}
        >
          {/* Stealth badge */}
          <Badge
            variant="outline"
            className="gap-2 py-2 px-4 rounded-full backdrop-blur-sm"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              color: 'var(--professional-gray)',
              fontSize: '14px'
            }}
          >
            <Lock size={14} />
            In private beta
          </Badge>

          {/* Validation badge */}
          <Badge
            variant="outline"
            className="gap-2 py-2 px-4 rounded-full backdrop-blur-sm"
            style={{
              backgroundColor: 'var(--opportunity-green-glow)',
              borderColor: 'rgba(34, 197, 94, 0.3)',
              color: 'var(--opportunity-green)',
              fontSize: '14px'
            }}
          >
            <CheckCircle size={14} />
            Validated with India's top law firms
          </Badge>
        </motion.div>
      </div>
    </section>
  );
}
