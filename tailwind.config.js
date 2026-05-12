/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        bebas: ['var(--font-bebas)', 'Impact', 'Arial Narrow', 'sans-serif'],
        inter: ['var(--font-inter)', 'Inter', 'Arial', 'sans-serif'],
        sans: ['var(--font-inter)', 'Inter', 'Arial', 'sans-serif'],
      },
      colors: {
        brand: {
          red: '#FF2D2D',
          orange: '#FF6B00',
          neon: '#FAFF00',
          bg: '#0A0A0A',
          card: '#111111',
        },
      },
      keyframes: {
        'pulse-red': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 45, 45, 0.6)' },
          '50%': { boxShadow: '0 0 0 14px rgba(255, 45, 45, 0)' },
        },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '92%': { opacity: '1' },
          '93%': { opacity: '0.8' },
          '94%': { opacity: '1' },
          '96%': { opacity: '0.9' },
          '97%': { opacity: '1' },
        },
      },
      animation: {
        'pulse-red': 'pulse-red 2s ease-in-out infinite',
        'flicker': 'flicker 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
