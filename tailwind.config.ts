import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        lime: { DEFAULT: '#C8F135', dark: '#A8D020' },
        surface: { DEFAULT: '#111111', elevated: '#1A1A1A', card: '#222222' },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui'],
        mono: ['var(--font-mono)'],
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'pulse-lime': 'pulseLime 2s infinite',
      },
      keyframes: {
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        pulseLime: { '0%,100%': { boxShadow: '0 0 0 0 #C8F13540' }, '50%': { boxShadow: '0 0 0 8px #C8F13500' } },
      }
    }
  },
  plugins: [],
};

export default config;
