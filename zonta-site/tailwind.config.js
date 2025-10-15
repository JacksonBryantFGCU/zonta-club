/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        zontaGold: "#E4A021",
        zontaRed: "#7E1E29",
        zontaBlue: "#00A2C8",
        zontaDark: "#4B2E1E",
      },
    },
  },
  plugins: [],
}

