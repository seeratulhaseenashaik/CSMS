/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        csms: {
          deep: '#290044',    // 290044 - Midnight Plum / Deep Violet
          royal: '#500071',   // 500071 - Royal Imperial Purple
          magenta: '#8A2A78', // 8A2A78 - Magenta Orchid / Rose
          cream: '#EEE3B0',   // EEE3B0 - Warm Champagne Gold / Cream
        },
        brand: {
          50: '#fbf9f2',
          100: '#EEE3B0',
          200: '#e2d398',
          300: '#cbaf6a',
          400: '#a84c8a',
          500: '#8A2A78',
          600: '#500071',
          700: '#3d0056',
          800: '#290044',
          900: '#1b002e',
        }
      }
    },
  },
  plugins: [],
}
