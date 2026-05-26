/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,tsx,ts}"],
  theme: {
    extend: {
      colors: {
        perfil: {
          bg: "#0c1017",
          surface: "#151c28",
          border: "#263044",
          text: "#eef2f7",
          muted: "#8b9cb3",
          accent: "#4a9ff5",
          accentHover: "#6bb3ff",
          success: "#34d399",
          danger: "#f87171",
        },
      },
      fontFamily: {
        sans: [
          "Inter Variable",
          "Inter",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
