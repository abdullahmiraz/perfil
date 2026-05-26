/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,tsx,ts}"],
  theme: {
    extend: {
      colors: {
        perfil: {
          bg: "var(--perfil-bg)",
          surface: "var(--perfil-surface)",
          border: "var(--perfil-border)",
          text: "var(--perfil-text)",
          muted: "var(--perfil-muted)",
          accent: "var(--perfil-accent)",
          accentHover: "var(--perfil-accent-hover)",
          success: "var(--perfil-success)",
          danger: "var(--perfil-danger)",
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
