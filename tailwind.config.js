/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          900: '#0f172a',
        },
      },
      boxShadow: {
        glass: '0 8px 32px rgba(15, 23, 42, 0.18)',
      },
      fontFamily: {
        sans: ['"Source Sans 3"', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
  // Avoid fighting PrimeNG/Bootstrap resets on the dashboard; login uses utility classes explicitly.
  corePlugins: {
    preflight: false,
  },
};
