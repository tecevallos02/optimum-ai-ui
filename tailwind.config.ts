import type { Config } from 'tailwindcss';

const config: Config = {
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
        danger: '#e74c3c'
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
export default config;
