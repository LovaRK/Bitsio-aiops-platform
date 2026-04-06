import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./store/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#050B1B",
        panel: "#0B1A34",
        panelSoft: "#10274D",
        teal: "#12D6C7",
        mint: "#78F3E4",
        danger: "#FF5F74",
        warning: "#FFB84D",
        text: "#DDE7FF",
        muted: "#7C8CB1"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(18,214,199,0.2), 0 16px 48px rgba(4,9,20,0.45)"
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out",
        pulseSoft: "pulseSoft 2.2s ease-in-out infinite"
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0px)" }
        },
        pulseSoft: {
          "0%": { opacity: "0.55" },
          "50%": { opacity: "1" },
          "100%": { opacity: "0.55" }
        }
      }
    }
  },
  plugins: []
};

export default config;
