/** @type {import('tailwindcss').Config} */
export default {
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
       colors: {
      primary: {
        100: '#E0F2FE',
        200: '#BAE6FD',
        500: '#0EA5E9',
        600: '#0284C7',
      },
    },
    },
  },
  plugins: [],
}

