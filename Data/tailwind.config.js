/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#DC4D01',
        background: '#000000',
        text: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 10px rgba(220, 77, 1, 0.5)',
        'glow-lg': '0 0 20px rgba(220, 77, 1, 0.7)',
      },
    },
  },
  plugins: [],
}
