/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
        ],
      },
      colors: {
        surface: {
          100: '#0b0b0c',
          200: '#141416',
          300: '#1c1d20',
          400: '#23252a',
        },
        accent: {
          DEFAULT: '#7dd3fc',
          600: '#38bdf8',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
}
