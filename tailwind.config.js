/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6c63ff',
        secondary: '#00bfa6',
        accent: '#ff6f61',
        bg: '#f7f9fc',
        text: '#1e1e2f',
        muted: '#6a7ca7',
        border: '#e0e4f5',
        success: '#2ecc71',
        warning: '#f4d06f',
        danger: '#e74c3c',
        dark: {
          bg: '#000000',
          card: '#0a0a0a',
          hover: '#141414',
          border: '#1f1f1f',
          text: '#ffffff',
          'text-secondary': '#a3a3a3'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      borderRadius: {
        xl: '1rem'
      },
      boxShadow: {
        card: '0 4px 12px rgba(0,0,0,0.05)',
        hover: '0 8px 20px rgba(0,0,0,0.08)'
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'fade-up': 'fadeUp 0.8s ease forwards'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};
