/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        moi: {
          charcoal: '#141314',
          grey: '#3F3E3E',
          red: '#721C24',
          beige: '#FAF9F6',
          light: '#F5F5F5',
          green: '#2D5530'
        }
      },
      fontFamily: {
        'orpheus': ['Orpheus Pro', 'serif'],
        'benton': ['BentonSans', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

