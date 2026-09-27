import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        noir: {
          50: '#f5f0e8',
          100: '#e8e0d4',
          200: '#d4c8b8',
          300: '#b8a894',
          400: '#9a8770',
          500: '#7a6852',
          600: '#5a4a3c',
          700: '#3d3228',
          800: '#2a221c',
          900: '#1a1612',
          950: '#0a0a0c',
        },
        rose: {
          DEFAULT: '#c17b7b',
          dark: '#8b3a3a',
          light: '#d9a0a0',
          muted: '#8a6868',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
