/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf0',
          100: '#dbfadb',
          200: '#baefba',
          300: '#86e186',
          400: '#4cc94c',
          500: '#389334', // Verde Institucional Base
          600: '#2b782b',
          700: '#245f24',
          800: '#1e4c1e',
          900: '#193f19',
        },
        secondary: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#b8d1ff',
          300: '#85aeff',
          400: '#4d83ff',
          500: '#0047AF', // Azul Base
          600: '#00368c',
          700: '#002a70',
          800: '#002058',
          900: '#001a47',
        },
        dark: {
          50: '#f5f6f8',
          100: '#ebecef',
          200: '#d1d4db',
          300: '#a8aebc',
          400: '#7a8296',
          500: '#586178',
          600: '#424a5e',
          700: '#353a4c',
          800: '#2d3040',
          900: '#313450', // Azul/Cinza Base
        },
        warning: '#FFC107',
        accent: '#FFC107',
        success: '#4CAF50',
        background: '#F8F9FA',
        surface: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Roboto', 'monospace'],
        display: ['Caveat', 'cursive'],
      },
      boxShadow: {
        soft: '0 2px 10px rgba(0, 0, 0, 0.05)',
        card: '0 8px 30px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
