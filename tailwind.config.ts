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
          50: '#f0e8f5',
          100: '#e0d4e8',
          200: '#c8b8d4',
          300: '#a894b8',
          400: '#87709a',
          500: '#68527a',
          600: '#4a3c5a',
          700: '#32283d',
          800: '#221c2a',
          900: '#16121a',
          950: '#0a0a0f',
        },
        rose: {
          DEFAULT: '#c05a9e',
          dark: '#8a3a6e',
          light: '#d98ab8',
          muted: '#8a6880',
        },
        violet: {
          DEFAULT: '#9b4dca',
          dark: '#6b2d8a',
          light: '#b87ae0',
          muted: '#7a5a8a',
        },
        magenta: {
          DEFAULT: '#c05a9e',
          dark: '#8a3a6e',
          light: '#d98ab8',
          muted: '#8a6880',
        },
        brand: {
          dark: '#1a0a1f',
          primary: '#6b2d8a',
          accent: '#9b4dca',
          highlight: '#c05a9e',
          glow: '#d4a5e0',
          surface: '#0d0a0f',
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
