/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./business-automation-dashboard.html",
    "./hover-debug.html",
    "./index.html",
    "./api/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#4F46E5',
        'secondary': '#7C3AED',
        'success': '#10B981',
        'warning': '#F59E0B',
        'danger': '#EF4444',
        'energy-blue': '#2563EB',
        'energy-purple': '#7C3AED',
        'energy-green': '#059669',
        'energy-orange': '#EA580C',
        'energy-pink': '#DB2777'
      },
      backdropBlur: {
        'xs': '2px'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'scale-in': 'scaleIn 0.3s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        }
      }
    },
  },
  plugins: [],
}