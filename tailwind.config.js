/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        surface: {
          DEFAULT: '#ffffff',
          subtle: '#fafafa',
          muted: '#f4f4f5',
          border: '#e4e4e7',
          'border-subtle': '#f1f1f4',
        },
        ink: {
          DEFAULT: '#09090b',
          muted: '#71717a',
          subtle: '#a1a1aa',
          faint: '#d4d4d8',
        },
        brand: {
          50: '#f0f6ff',
          100: '#e0eeff',
          200: '#b9dbfe',
          300: '#7cbcfd',
          400: '#3697fa',
          500: '#0c77e9',
          600: '#025cc7',
          700: '#034aa1',
          800: '#073f84',
          900: '#0c356e',
          950: '#082147',
        },
        accent: {
          DEFAULT: '#0f172a',
          foreground: '#ffffff',
        }
      },
      borderRadius: {
        'lg': '0.625rem',
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)',
        'elevated': '0 10px 30px -4px rgba(0, 0, 0, 0.06), 0 4px 10px -2px rgba(0, 0, 0, 0.03)',
        'drawer': '-4px 0 30px -4px rgba(0, 0, 0, 0.08)',
        'dropdown': '0 4px 20px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
