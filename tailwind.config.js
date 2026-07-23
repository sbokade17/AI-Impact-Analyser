/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f6f8fb',
          100: '#eceff5',
          200: '#d5dae6',
          300: '#aab3c6',
          400: '#7a849f',
          500: '#525d77',
          600: '#3a4358',
          700: '#2a3144',
          800: '#1c2233',
          900: '#121726',
          950: '#0a0e1a',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out both',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
}
