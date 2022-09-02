/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        sm: '8px 8px 0px rgba(0, 0, 0, 1)',
        md: '15px 15px 0px rgba(0, 0, 0, 1)',
      },
      colors: {
        'bright-green': '#39ff14dd',
        'bright-yellow': '#fcd200',
        'dull-black': '#333',
      },
      fontFamily: {
        fasys: ['FA Sysfont C'],
      },
    },
  },
  plugins: [],
};
