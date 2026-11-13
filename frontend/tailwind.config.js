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
        emeraldTheme: {
          bgPrimary: '#090D0B',       // Near black
          bgSecondary: '#141C17',     // Dark charcoal green
          surface: '#17231D',         // Deep forest charcoal
          accent: '#53B879',          // Emerald green
          accentMint: '#A4F5AE',      // Soft neon mint
          textPrimary: '#F4F6F0',     // Warm off-white
          textSecondary: '#A1B4A6',   // Muted sage gray
          border: '#42614B',          // Translucent sage
          inputBg: '#101A14',         // Dark green-black
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
