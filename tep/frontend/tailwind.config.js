/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:'#F5F3FC', 100:'#EAE7F8', 200:'#D4CEEF', 300:'#A99FDE',
          400:'#7B6FCC', 500:'#534AB7', 600:'#3D2B7A', 700:'#2E1F5E',
          800:'#241848', 900:'#1A1133', 950:'#0E0920',
        },
        gold: '#C9A84C',
      },
      fontFamily: {
        sans:  ['Inter','system-ui','sans-serif'],
        serif: ['Playfair Display','Georgia','serif'],
      },
    },
  },
  plugins: [],
}
