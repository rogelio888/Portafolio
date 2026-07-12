export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scan: {
          '0%': { top: '0' },
          '50%': { top: '100%' },
          '100%': { top: '0' },
        },
      },
      colors: {
        bg: {
          dark: '#121212',
          card: '#1e1e1e',
        },
        primary: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8',
        },
        status: {
          active: '#10b981',
          expired: '#ef4444',
          warning: '#f59e0b',
        },
        accent: '#facc15'
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['monospace'],
      }
    },
  },
  plugins: [],
}
