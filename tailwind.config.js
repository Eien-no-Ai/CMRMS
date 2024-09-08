/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-red': '#C3151C',
        'custom-gray': '#929396'
      },
    },
  },
  plugins: [],
}

