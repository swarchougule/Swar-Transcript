/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          bg: '#F7F2EB',
          surface: '#FFFFFF',
          surfaceSubtle: '#FDFBF7',
          border: '#E8E1D5',
          borderHover: '#D8CFBF',
          divider: '#EFE9DE',
        },
        sage: {
          50: '#F5F7F1',
          100: '#E9EFE0',
          200: '#D5DFCA',
          300: '#BCCBAE',
          400: '#A1B38E',
          500: '#8B9A6E', // Primary Accent
          600: '#758458',
          700: '#5D6B44',
          800: '#465133',
          900: '#2E3622',
        },
        charcoal: {
          900: '#1B1E19', // Primary Text
          800: '#282C24',
          700: '#3D4238',
          600: '#595F52', // Muted Text
          500: '#767D6E',
          400: '#989F90',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'warm-sm': '0 1px 2px rgba(40, 35, 25, 0.04)',
        'warm-md': '0 4px 16px -2px rgba(40, 35, 25, 0.06), 0 2px 4px -2px rgba(40, 35, 25, 0.04)',
        'warm-lg': '0 12px 32px -4px rgba(40, 35, 25, 0.08), 0 4px 8px -2px rgba(40, 35, 25, 0.03)',
        'warm-xl': '0 20px 48px -6px rgba(40, 35, 25, 0.12), 0 8px 16px -4px rgba(40, 35, 25, 0.04)',
        'glow-sage': '0 0 25px -3px rgba(139, 154, 110, 0.25)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
