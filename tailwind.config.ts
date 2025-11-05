import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f4f9ff",
          100: "#e8f1ff",
          200: "#c7dcff",
          300: "#a6c7ff",
          400: "#5e9efd",
          500: "#0f73f6",
          600: "#0c5cd4",
          700: "#0a47aa",
          800: "#073280",
          900: "#051f59"
        }
      },
      boxShadow: {
        focus: "0 0 0 3px rgba(15, 115, 246, 0.25)",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(15, 115, 246, 0.4)" },
          "50%": { boxShadow: "0 0 0 12px rgba(15, 115, 246, 0)" }
        }
      },
      animation: {
        pulseGlow: "pulseGlow 2.4s infinite"
      }
    }
  },
  plugins: [],
};

export default config;
