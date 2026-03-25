/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#000000',
          50: '#F5F5F5',
          100: '#E5E5E5',
          200: '#CCCCCC',
          300: '#999999',
          400: '#666666',
          500: '#333333',
          600: '#1A1A1A',
          700: '#000000',
          800: '#000000',
          900: '#000000',
        },
        secondary: {
          DEFAULT: '#FFFFFF',
          50: '#FFFFFF',
          500: '#FAFAFA',
          600: '#F5F5F5',
          700: '#E5E5E5',
        },
        accent: {
          DEFAULT: '#333333',
          50: '#F5F5F5',
          500: '#333333',
          600: '#1A1A1A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
