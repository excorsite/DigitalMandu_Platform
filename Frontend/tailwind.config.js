/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "hsl(var(--theme-primary) / <alpha-value>)",
        greenIcon: "var(--green-icon)",
        greenBg: "var(--green-background)",
        greenFooter: "var(--green-footer)",
        greenBorder: "var(--green-border)",
      },
      fontFamily: {
        sans: ["var(--font-family-sans)", "sans-serif"],
        serif: ["var(--font-family-serif)", "serif"],
      },
    },
  },
  plugins: [],
};
