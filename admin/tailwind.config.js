/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        dark: '#0f111a',
        danger: '#ef4444',
        success: '#10b981',
      }
    },
  },
  plugins: [],
}
