/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#F97316",
          dark: "#EA580C",
          light: "#FFF7ED",
          cream: "#FFF1E6",
        },
        accent: "#F59E0B",
        ink: "#171717",
        muted: "#666666",
        line: "#E8E8E8",
        'brand-green': "#16A34A",
        'brand-red': "#DC2626",
        tag: {
          bg: "#FFF1E6",
          text: "#C2410C",
          border: "#FDBA74",
        }
      },
      fontFamily: {
        sans: ['Arial', '"Noto Sans Devanagari"', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 12px rgba(0,0,0,0.06)',
      }
    },
  },
  plugins: [],
};
