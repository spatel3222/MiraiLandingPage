import { motion } from 'motion/react';
import { Separator } from './ui/separator';

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="py-12 px-6 mt-auto"
      style={{
        background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.3) 100%)'
      }}
    >
      <div className="max-w-4xl mx-auto text-center">
        {/* Tagline */}
        <p
          className="mb-6"
          style={{
            fontSize: 'clamp(24px, 5vw, 32px)',
            fontWeight: 300,
            color: 'var(--foreground)',
            lineHeight: '1.3',
            letterSpacing: '0.05em'
          }}
        >
          Mirai | 未来 | Future
        </p>

        {/* Divider */}
        <Separator
          className="my-6 mx-auto max-w-xs"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
        />

        {/* Contact */}
        <p
          className="mb-2"
          style={{
            fontSize: '14px',
            color: 'var(--professional-gray)',
            lineHeight: '1.6'
          }}
        >
          For partnerships or platform access
        </p>
        <a
          href="mailto:shivang@mirai360.ai"
          className="inline-block mb-6 transition-all duration-300 hover:opacity-80"
          style={{
            fontSize: '16px',
            fontWeight: 500,
            color: 'var(--tech-accent)',
            textDecoration: 'none'
          }}
        >
          shivang@mirai360.ai
        </a>

        {/* Copyright */}
        <p
          style={{
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.4)',
            lineHeight: '1.6'
          }}
        >
          © 2025 Mirai360. All rights reserved.
        </p>
      </div>
    </motion.footer>
  );
}
