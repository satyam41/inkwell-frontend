/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-newsreader)', 'Georgia', 'serif'],
      },
      colors: {
        canvas: '#faf8f5',
        accent: {
          DEFAULT: '#ff6719',
          hover: '#e5560d',
        },
      },
    },
  },
  plugins: [],
};
