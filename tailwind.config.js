/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F8F5F1',
        linen: '#EDE8E0',
        sand: '#D6CBBB',
        clay: '#B8A898',
        terracotta: '#C4907A',
        sage: '#9BA88E',
        ink: '#2D2D2D',
        charcoal: '#4A4A4A',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
        sans: ['system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
