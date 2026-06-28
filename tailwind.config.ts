import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        crisis: {
          bg: "#0d1117",
          surface: "#161b22",
          border: "#30363d",
          alert: "#FF3B30",
          muted: "#8b949e",
        },
      },
      animation: {
        pulse_alert: "pulse_alert 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        pulse_alert: {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 0 0 rgba(255, 59, 48, 0.4)" },
          "50%": { opacity: "0.92", boxShadow: "0 0 0 8px rgba(255, 59, 48, 0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
