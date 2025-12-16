import { motion } from 'motion/react';

interface GradientLineProps {
  y: string;
  delay: number;
  duration: number;
  opacity: number;
  dotted?: boolean;
}

function GradientLine({ y, delay, duration, opacity, dotted = false }: GradientLineProps) {
  return (
    <motion.div
      className="absolute left-0 right-0 h-px"
      style={{ top: y }}
      initial={{ opacity: 0 }}
      animate={{ opacity }}
      transition={{ delay: delay * 0.1, duration: 1 }}
    >
      {dotted ? (
        <svg width="100%" height="2" className="overflow-visible">
          <motion.line
            x1="0%"
            y1="1"
            x2="100%"
            y2="1"
            stroke="url(#gradient-line)"
            strokeWidth="2"
            strokeDasharray="4 8"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: duration,
              delay: delay * 0.15,
              ease: "easeInOut"
            }}
          />
        </svg>
      ) : (
        <motion.div
          className="h-full w-full"
          style={{
            background: `linear-gradient(90deg,
              transparent 0%,
              rgba(139, 92, 246, ${opacity}) 20%,
              rgba(59, 130, 246, ${opacity}) 50%,
              rgba(56, 189, 248, ${opacity}) 80%,
              transparent 100%)`
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{
            duration: duration,
            delay: delay * 0.15,
            ease: "easeOut"
          }}
        />
      )}
    </motion.div>
  );
}

function FlowingDot({ y, delay }: { y: string; delay: number }) {
  return (
    <motion.div
      className="absolute h-1 w-1 rounded-full"
      style={{
        top: y,
        background: 'linear-gradient(90deg, #8b5cf6, #3b82f6, #38bdf8)',
        boxShadow: '0 0 8px rgba(139, 92, 246, 0.8), 0 0 16px rgba(59, 130, 246, 0.4)'
      }}
      initial={{ left: '-2%', opacity: 0 }}
      animate={{
        left: '102%',
        opacity: [0, 1, 1, 0]
      }}
      transition={{
        duration: 8,
        delay: delay,
        repeat: Infinity,
        ease: "linear",
        repeatDelay: Math.random() * 4
      }}
    />
  );
}

export function GradientLines() {
  // Generate lines at various positions
  const lines = [
    { y: '15%', delay: 0, duration: 2.5, opacity: 0.15, dotted: true },
    { y: '22%', delay: 2, duration: 3, opacity: 0.1, dotted: true },
    { y: '30%', delay: 4, duration: 2, opacity: 0.2, dotted: false },
    { y: '38%', delay: 1, duration: 2.5, opacity: 0.12, dotted: true },
    { y: '45%', delay: 3, duration: 3, opacity: 0.08, dotted: true },
    { y: '52%', delay: 5, duration: 2, opacity: 0.15, dotted: true },
    { y: '60%', delay: 2, duration: 2.5, opacity: 0.18, dotted: false },
    { y: '68%', delay: 4, duration: 3, opacity: 0.1, dotted: true },
    { y: '75%', delay: 1, duration: 2, opacity: 0.12, dotted: true },
    { y: '82%', delay: 3, duration: 2.5, opacity: 0.08, dotted: true },
  ];

  const flowingDots = [
    // Row 1 - multiple dots per line
    { y: '15%', delay: 0 },
    { y: '15%', delay: 3 },
    { y: '15%', delay: 6 },
    // Row 2
    { y: '22%', delay: 1 },
    { y: '22%', delay: 4.5 },
    // Row 3
    { y: '30%', delay: 0.5 },
    { y: '30%', delay: 2.5 },
    { y: '30%', delay: 5 },
    // Row 4
    { y: '38%', delay: 1.5 },
    { y: '38%', delay: 4 },
    { y: '38%', delay: 7 },
    // Row 5
    { y: '45%', delay: 0 },
    { y: '45%', delay: 3.5 },
    // Row 6
    { y: '52%', delay: 2 },
    { y: '52%', delay: 5.5 },
    { y: '52%', delay: 8 },
    // Row 7
    { y: '60%', delay: 0.8 },
    { y: '60%', delay: 3 },
    { y: '60%', delay: 6 },
    // Row 8
    { y: '68%', delay: 1.2 },
    { y: '68%', delay: 4.5 },
    // Row 9
    { y: '75%', delay: 0 },
    { y: '75%', delay: 2.8 },
    { y: '75%', delay: 5.5 },
    // Row 10
    { y: '82%', delay: 1.8 },
    { y: '82%', delay: 4 },
    { y: '82%', delay: 7 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* SVG Gradient Definition */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="20%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="80%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>

      {/* Static gradient lines */}
      {lines.map((line, i) => (
        <GradientLine key={i} {...line} />
      ))}

      {/* Flowing dots that travel along lines */}
      {flowingDots.map((dot, i) => (
        <FlowingDot key={`dot-${i}`} {...dot} />
      ))}

      {/* Subtle wave overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% 50%,
            rgba(139, 92, 246, 0.03) 0%,
            transparent 70%)`
        }}
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}
