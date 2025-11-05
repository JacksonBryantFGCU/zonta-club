/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // ===== Primary (Corporate) Palette =====
        zontaMahogany: "#802528",   // Primary brand color
        zontaGold: "#F5BD47",       // Secondary accent
        zontaOrange: "#E18431",     // Warm highlight
        zontaCyan: "#005F71",       // Supporting contrast
        zontaGray: "#A9A8A9",       // Neutral gray for dividers/text

        // ===== Secondary (Casual / Event) Palette =====
        zontaBlue: "#00BCD3",
        zontaLightGold: "#FACA6E",
        zontaPink: "#CD3463",
        zontaViolet: "#9B74B3",

        // ===== Legacy / Local Brand Colors (for backward compatibility) =====
        zontaRed: "#7E1E29",
        zontaLegacyGold: "#E4A021",
      },
    },
  },
  plugins: [],
}