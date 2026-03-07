/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink:    '#0F0E0C',
        paper:  '#F9F6F0',
        paper2: '#F1EDE4',
        stone:  '#E2DDD5',
        mist:   '#C8C2B8',
        sage:   '#5A7A62',
        'sage-pale': '#EBF2EC',
        rust:   '#C05A2E',
        'rust-pale': '#FAEBE4',
        gold:   '#B8860B',
        'gold-pale': '#FDF6DC',
        white:  '#FEFCF9',
      },
      fontFamily: {
        sans:  ['Outfit', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}
