/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#000000', 50: '#F5F5F5', 500: '#333333', 600: '#1A1A1A', 700: '#000000' },
        accent: { DEFAULT: '#333333', 50: '#F5F5F5', 500: '#333333' },
        success: { DEFAULT: '#22C55E', 50: '#F0FDF4', 500: '#22C55E' },
        warning: { DEFAULT: '#F59E0B', 50: '#FFFBEB', 500: '#F59E0B' },
        danger: { DEFAULT: '#EF4444', 50: '#FEF2F2', 500: '#EF4444' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
