/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        she: {
          primary: "#6C3B8F",
          secondary: "#a823f5",
          gradientStart: "#6C3B8F",
          gradientEnd: "#E83E8C",
          dark: "#0F0F12",
          cardBg: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-clash)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
