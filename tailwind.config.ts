import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./index.html",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        primary: {
          DEFAULT: "#1b365d",
          light: "#2d8cff",
          dark: "#122442",
          foreground: "#ffffff",
        },
        // Accent colors
        accent: {
          DEFAULT: "#4353ff",
          purple: "#8a38f5",
          foreground: "#ffffff",
        },
        // Semantic colors
        success: {
          DEFAULT: "#22c55e",
          dark: "#1db954",
        },
        error: {
          DEFAULT: "#ef4444",
          dark: "#dc3545",
        },
        warning: {
          DEFAULT: "#ecb22e",
        },
        // Background & Foreground
        background: "#ffffff",
        foreground: "#0f172a",
        // Card
        card: {
          DEFAULT: "#f9f5f1",
          foreground: "#0f172a",
        },
        // Muted
        muted: {
          DEFAULT: "#64748b",
          foreground: "#6b7280",
        },
        // Border
        border: "#e5e7eb",
        input: "#e5e7eb",
        ring: "#1b365d",
        // Gray scale
        gray: {
          50: "#f9f5f1",
          100: "#eaf1ff",
          200: "#d5dae1",
          300: "#c5d3e3",
          400: "#a3acba",
          500: "#64748b",
          600: "#566573",
          700: "#454f5b",
          800: "#334155",
          900: "#111827",
        },
        // Additional Figma colors
        figma: {
          blue: "#0061ff",
          cyan: "#2e86c1",
          slate: "#5c7fa8",
          tan: "#bf9874",
          beige: "#d4baa2",
          discord: "#5865f2",
        },
      },
      boxShadow: {
        // From Figma effects
        "sm": "0 1px 2px rgba(27, 54, 93, 0.10), 0 1px 3px rgba(27, 54, 93, 0.10)",
        "md": "0 4px 6px rgba(27, 54, 93, 0.10), 0 10px 15px rgba(27, 54, 93, 0.10)",
        "lg": "0 8px 24px rgba(27, 54, 93, 0.30)",
        "xl": "0 25px 50px rgba(27, 54, 93, 0.25)",
        "card": "0 2px 8px rgba(27, 54, 93, 0.08)",
        "button": "0 2px 2px rgba(255, 255, 255, 0.25)",
        "accent": "0 2px 2px rgba(83, 79, 235, 0.25)",
        "error": "0 8px 32px rgba(239, 68, 68, 0.12)",
        "success": "0 0 0 rgba(34, 197, 94, 0.60)",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
